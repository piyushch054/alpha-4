const GlEntity = require("../models/GlEntity");
const GlVoucher = require("../models/GlVoucher");
const { ENTITIES, PATTERNS, MONTHS, ACCOUNT_TYPES, ROLES } = require("../config/gl");
const { fail, inRoles, actor, hist, isMoney, isDate, nextSeq, esc, toCsv, today, daysBetween } = require("./glCommon");

const BS_TYPES = ["Asset", "Liability", "Equity"];
const WORKFLOW = ["bill", "settle", "knockoff"];
const IMMUTABLE = ["fatransfer", "fasale", "fadep", "bankstmt", "tallyentry"];
const INIT_STATUS = { bill: "Pending Author", settle: "Pending Author", knockoff: "Pending Author", bankstmt: "Unmatched", tallyentry: "Unmatched", fasale: "Posted", fatransfer: "Posted", fadep: "Posted", faasset: "Active", year: "Open", period: "Open" };
const AUTO_PREFIX = { period: null, fatransfer: "AT", fasale: "AS", fadep: "DEP", knockoff: "KO", bankstmt: "BS", tallyentry: "TL", settle: "PY" };

const defOf = (kind) => {
  const d = ENTITIES[kind];
  if (!d) throw fail("Unknown record type", 404);
  return d;
};

const pub = (e) => ({ id: String(e._id), kind: e.kind, code: e.code, status: e.status, ...e.data, createdBy: e.createdBy ? String(e.createdBy) : undefined, createdByName: e.createdByName, checkedByName: e.checkedByName, createdAt: e.createdAt, updatedAt: e.updatedAt });

const canWrite = (user, kind) => inRoles(user, defOf(kind).write);
function assertWrite(user, kind) {
  if (defOf(kind).system) throw fail("This record type is system generated", 405);
  if (!canWrite(user, kind)) throw fail("Your role is not permitted to modify this record type", 403);
}

async function getRef(ctx, kind, code) {
  const key = `${kind}:${code}`;
  if (!(key in ctx.refs)) ctx.refs[key] = await GlEntity.findOne({ kind, code }).lean();
  return ctx.refs[key];
}

async function hasPostings(ledger) {
  return !!(await GlVoucher.exists({ "lines.ledger": ledger, status: { $ne: "Rejected" } }));
}

async function isReferenced(kind, code) {
  for (const [k, d] of Object.entries(ENTITIES)) {
    for (const f of d.fields) if (f.t === "ref" && f.ref === kind && (await GlEntity.exists({ kind: k, [`data.${f.n}`]: code }))) return true;
  }
  if (kind === "ledger" && (await GlVoucher.exists({ "lines.ledger": code }))) return true;
  if (kind === "subledger" && (await GlVoucher.exists({ "lines.subLedger": code }))) return true;
  if (kind === "costcentre" && (await GlVoucher.exists({ "lines.costCentre": code }))) return true;
  if (kind === "year" && (await GlVoucher.exists({ year: code }))) return true;
  if (kind === "period" && (await GlVoucher.exists({ period: code }))) return true;
  return false;
}

// Field-level validation from the schema in config/gl.js. Returns { data, errors }.
async function readFields(def, input, existing, ctx) {
  const errors = {};
  const data = {};
  const prev = existing ? { code: existing.code, status: existing.status, ...existing.data } : {};
  for (const f of def.fields) {
    if (f.n === "code") continue;
    const locked = f.ro === true || (f.ro === "edit" && existing);
    if (locked) { if (f.n in prev) data[f.n] = prev[f.n]; continue; }
    let v = input[f.n];
    if (v === undefined && existing) v = prev[f.n];
    if (typeof v === "string") v = v.trim();
    if (f.upper && typeof v === "string") v = v.toUpperCase();
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
    if (empty) {
      if (f.r && !(f.n === "status" && !existing)) errors[f.n] = `${f.l} is required`;
      else if (f.def !== undefined && !existing && f.t !== "multi") data[f.n] = f.t === "number" ? Number(f.def) : f.t === "bool" ? false : f.def;
      else if (f.t === "bool") data[f.n] = false;
      else if (f.t === "multi") data[f.n] = [];
      continue;
    }
    if (f.t === "text" || f.t === "textarea") {
      if (typeof v !== "string") { errors[f.n] = `${f.l} is invalid`; continue; }
      if (f.max && v.length > f.max) errors[f.n] = `${f.l} must be at most ${f.max} characters`;
      else if (f.pat && !PATTERNS[f.pat].test(v)) errors[f.n] = `${f.l} format is invalid`;
      else data[f.n] = v;
    } else if (f.t === "number") {
      if (!isMoney(v)) { errors[f.n] = `${f.l} must be a number with at most 2 decimals`; continue; }
      const n = Number(v);
      if (f.min !== undefined && n < f.min) errors[f.n] = `${f.l} must be at least ${f.min}`;
      else if (f.max !== undefined && n > f.max) errors[f.n] = `${f.l} must be at most ${f.max}`;
      else if (Math.abs(n) > 99999999999) errors[f.n] = `${f.l} is too large`;
      else data[f.n] = n;
    } else if (f.t === "date") {
      if (!isDate(v)) errors[f.n] = `${f.l} must be a valid date (YYYY-MM-DD)`;
      else data[f.n] = v;
    } else if (f.t === "select") {
      if (!f.o.includes(v)) errors[f.n] = `${f.l} has an invalid value`;
      else data[f.n] = v;
    } else if (f.t === "bool") data[f.n] = v === true || v === "true";
    else if (f.t === "multi") {
      const arr = Array.isArray(v) ? v : [];
      if (arr.some((x) => !f.o.includes(x))) errors[f.n] = `${f.l} has an invalid value`;
      else data[f.n] = arr;
    } else if (f.t === "ref") {
      if (typeof v !== "string") { errors[f.n] = `${f.l} is invalid`; continue; }
      const ref = await getRef(ctx, f.ref, v);
      if (!ref) errors[f.n] = `${f.l} "${v}" does not exist`;
      else if (ENTITIES[f.ref].fields.some((x) => x.n === "status" && x.o?.includes("Inactive")) && ref.status !== "Active" && prev[f.n] !== v) errors[f.n] = `${f.l} "${v}" is inactive`;
      else data[f.n] = v;
    }
  }
  return { data, errors };
}

const monthNo = (name) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(name) + 1;

async function derive(kind, data, ctx, existing, user) {
  const errs = {};
  const bad = (field, msg) => { errs[field] = msg; };
  const get = (k, c) => getRef(ctx, k, c);
  switch (kind) {
    case "year": {
      if (data.start && data.end) {
        const days = daysBetween(data.start, data.end);
        if (data.end <= data.start) bad("end", "End date must be after start date");
        else if (days > 400) bad("end", "An accounting year cannot exceed 400 days");
        else {
          const overlap = await GlEntity.findOne({ kind: "year", code: { $ne: ctx.code }, "data.start": { $lte: data.end }, "data.end": { $gte: data.start } }).lean();
          if (overlap) bad("start", `Overlaps accounting year ${overlap.code}`);
        }
      }
      if (existing && existing.status === "Closed") throw fail("A closed accounting year cannot be modified", 409);
      if (existing && (data.start !== existing.data.start || data.end !== existing.data.end) && (await GlVoucher.exists({ year: existing.code }))) throw fail("Year dates cannot change once vouchers exist", 409);
      break;
    }
    case "period": {
      const year = await get("year", data.year);
      if (year) {
        if (year.status !== "Open") bad("year", "Accounting year is closed");
        const m = monthNo(data.month);
        let cur = year.data.start.slice(0, 7);
        let found = null;
        while (cur <= year.data.end.slice(0, 7)) {
          if (Number(cur.slice(5)) === m) { found = cur; break; }
          const [y, mo] = cur.split("-").map(Number);
          cur = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
        }
        if (!found) bad("month", "Month does not fall inside the accounting year");
        else {
          const last = new Date(Date.UTC(Number(found.slice(0, 4)), Number(found.slice(5)), 0)).getUTCDate();
          data.start = `${found}-01` < year.data.start ? year.data.start : `${found}-01`;
          data.end = `${found}-${String(last).padStart(2, "0")}` > year.data.end ? year.data.end : `${found}-${String(last).padStart(2, "0")}`;
          ctx.code = `${year.code}-${found.replace("-", "")}`;
        }
      }
      break;
    }
    case "group": {
      if (data.parent) {
        const p = await get("group", data.parent);
        if (p && p.data.type !== data.type) bad("type", `Must match parent group type (${p.data.type})`);
        if (existing && data.parent === existing.code) bad("parent", "A group cannot be its own parent");
        let cur = p;
        for (let i = 0; existing && cur && i < 50; i++) {
          if (cur.code === existing.code) { bad("parent", "Group hierarchy cannot be circular"); break; }
          cur = cur.data.parent ? await get("group", cur.data.parent) : null;
        }
      }
      if (existing && existing.data.type !== data.type && (await isReferenced("group", existing.code))) bad("type", "Account type cannot change while the group is in use");
      break;
    }
    case "ledger": case "account": {
      const g = data.group ? await get("group", data.group) : null;
      if (g) data.type = g.data.type;
      if (kind === "ledger" && g) {
        if (!BS_TYPES.includes(g.data.type) && Number(data.openingBalance) !== 0) bad("openingBalance", "Income/Expense ledgers cannot carry an opening balance");
        if ((data.isCash || data.isBank) && g.data.type !== "Asset") bad("isCash", "Cash/Bank ledgers must belong to an Asset group");
        if (data.isCash && data.isBank) bad("isBank", "A ledger cannot be both cash and bank");
        if (existing && (await hasPostings(existing.code))) {
          const o = existing.data;
          for (const k of ["group", "openingBalance", "openingSide", "isCash", "isBank"]) if (o[k] !== data[k]) bad(k, "Locked because postings exist on this ledger");
        }
      }
      break;
    }
    case "subledger": break;
    case "template": {
      if (data.debitLedger === data.creditLedger) bad("creditLedger", "Debit and credit ledgers must differ");
      for (const k of ["debitLedger", "creditLedger"]) {
        const l = data[k] ? await get("ledger", data[k]) : null;
        if (l && !l.data.limited) bad(k, "Template ledgers must be flagged for limited-ledger access");
      }
      break;
    }
    case "tplmap": {
      if (data.status === "Active") {
        const dup = await GlEntity.findOne({ kind: "tplmap", code: { $ne: ctx.code }, status: "Active", "data.product": data.product, "data.event": data.event }).lean();
        if (dup) bad("event", `Product/event is already mapped by ${dup.code}`);
      }
      break;
    }
    case "faacct": {
      const chk = async (k, type) => { if (data[k]) { const l = await get("ledger", data[k]); if (l && l.data.type !== type) bad(k, `Must be an ${type} ledger`); } };
      await chk("assetLedger", "Asset"); await chk("accDepLedger", "Asset"); await chk("depExpLedger", "Expense");
      break;
    }
    case "faasset": {
      if (data.salvage > data.cost) bad("salvage", "Salvage value cannot exceed cost");
      if (data.purchaseDate > today()) bad("purchaseDate", "Purchase date cannot be in the future");
      if (existing) for (const k of ["cost", "salvage", "purchaseDate", "category", "account", "block", "offsetLedger"]) data[k] = existing.data[k];
      break;
    }
    case "party": break;
    case "bill": {
      const party = data.party ? await get("party", data.party) : null;
      const head = data.head ? await get("rphead", data.head) : null;
      if (head && head.data.type !== data.type) bad("head", `Head must be of type ${data.type}`);
      if (party) {
        const pt = party.data.type;
        if (pt !== "Both" && ((data.type === "Payable" && pt !== "Vendor") || (data.type === "Receivable" && pt !== "Customer"))) bad("party", `Party type ${pt} cannot have ${data.type} bills`);
      }
      if (data.billDate && data.dueDate && data.dueDate < data.billDate) bad("dueDate", "Due date cannot be before bill date");
      if (data.amount !== undefined) {
        let rate = 0;
        if (data.type === "Payable" && party?.data.tds) {
          const t = await get("tds", party.data.tds);
          if (t && t.status === "Active") rate = Number(t.data.rate);
        }
        data.tdsRate = rate;
        data.tdsAmount = Math.round(data.amount * rate) / 100;
        data.net = Math.round((data.amount - data.tdsAmount) * 100) / 100;
      }
      data.settled = existing ? existing.data.settled || 0 : 0;
      if (data.party && data.billNo && data.type) {
        const dup = await GlEntity.findOne({ kind: "bill", code: { $ne: ctx.code }, "data.party": data.party, "data.type": data.type, "data.billNo": data.billNo, status: { $nin: ["Rejected", "Cancelled"] } }).lean();
        if (dup) throw fail(`Bill ${data.billNo} already exists for this party (${dup.code})`, 409);
      }
      break;
    }
    case "settle": {
      const bill = data.bill ? await get("bill", data.bill) : null;
      if (bill) {
        if (bill.status !== "Authorised") bad("bill", "Only authorised bills can be settled");
        else {
          const out = Math.round((bill.data.net - (bill.data.settled || 0)) * 100) / 100;
          if (data.amount > out) bad("amount", `Amount exceeds outstanding balance ${out.toFixed(2)}`);
          if (data.date && data.date < bill.data.billDate) bad("date", "Date cannot be before the bill date");
        }
        data.kind = bill.data.type === "Payable" ? "Payment" : "Receipt";
      }
      if (data.mode === "Cheque" && !data.chequeNo) bad("chequeNo", "Cheque number is required for cheque mode");
      data.chequeStatus = data.mode === "Cheque" ? "Issued" : "Cleared";
      break;
    }
    case "knockoff": {
      const p = data.payable ? await get("bill", data.payable) : null;
      const r = data.receivable ? await get("bill", data.receivable) : null;
      if (p && (p.data.type !== "Payable" || p.status !== "Authorised")) bad("payable", "Must be an authorised payable bill");
      if (r && (r.data.type !== "Receivable" || r.status !== "Authorised")) bad("receivable", "Must be an authorised receivable bill");
      if (p && r) {
        if (p.data.party !== r.data.party) bad("receivable", "Knock off requires the same party");
        const out = (b) => Math.round((b.data.net - (b.data.settled || 0)) * 100) / 100;
        if (data.amount > Math.min(out(p), out(r))) bad("amount", `Amount exceeds the lower outstanding (${Math.min(out(p), out(r)).toFixed(2)})`);
      }
      break;
    }
    case "bankstmt": case "tallyentry": {
      const l = data.bank ? await get("ledger", data.bank) : null;
      if (l && !l.data.isBank) bad("bank", "Must be a bank ledger");
      const dr = Number(data.debit || 0), cr = Number(data.credit || 0);
      if ((dr > 0) === (cr > 0)) bad("debit", "Exactly one of debit/credit must be greater than zero");
      break;
    }
    case "fatransfer": case "fasale": {
      const a = data.asset ? await get("faasset", data.asset) : null;
      if (a && a.status !== "Active") bad("asset", "Asset is not active");
      if (a && data.date && data.date < a.data.purchaseDate) bad("date", "Date cannot be before the purchase date");
      break;
    }
    default: break;
  }
  if (Object.keys(errs).length) throw fail("Validation failed", 422, errs);
  return data;
}

function statusFor(def, data, kind) {
  return INIT_STATUS[kind] || data.status || "Active";
}

async function newCode(kind, def, input, ctx) {
  if (kind === "period") return ctx.code;
  if (kind === "bill") return `${input.type === "Receivable" ? "BR" : "BP"}-${await nextSeq(input.type === "Receivable" ? "BR" : "BP")}`;
  if (AUTO_PREFIX[kind]) return `${AUTO_PREFIX[kind]}-${await nextSeq(AUTO_PREFIX[kind])}`;
  const v = typeof input.code === "string" ? input.code.trim() : "";
  const f = def.fields.find((x) => x.n === "code");
  if (!v) throw fail("Validation failed", 422, { code: `${f.l} is required` });
  if (!PATTERNS.code.test(v)) throw fail("Validation failed", 422, { code: `${f.l} may contain letters, digits and - _ . / only` });
  return v;
}

async function create(user, kind, input, hooks = {}) {
  const def = defOf(kind);
  assertWrite(user, kind);
  if (!input || typeof input !== "object") throw fail("Invalid request body", 400);
  const ctx = { refs: {}, code: typeof input.code === "string" ? input.code.trim() : "" };
  const { data, errors } = await readFields(def, input, null, ctx);
  if (Object.keys(errors).length) throw fail("Validation failed", 422, errors);
  await derive(kind, data, ctx, null, user);
  const code = await newCode(kind, def, input, ctx);
  if (await GlEntity.exists({ kind, code })) throw fail(`${def.label} "${code}" already exists`, 409);
  const status = INIT_STATUS[kind] || data.status || "Active";
  delete data.status;
  if (hooks.before) await hooks.before(data, code, ctx);
  const a = actor(user);
  let doc;
  try {
    doc = await GlEntity.create({ kind, code, data, status, createdBy: a.id, createdByName: a.name, history: [hist(user, "Created")] });
  } catch (e) {
    if (e.code === 11000) throw fail(`${def.label} "${code}" already exists`, 409);
    throw e;
  }
  if (hooks.after) {
    try { await hooks.after(doc); } catch (e) { await GlEntity.deleteOne({ _id: doc._id }); throw e; }
  }
  return pub(doc);
}

async function update(user, kind, id, input) {
  const def = defOf(kind);
  assertWrite(user, kind);
  if (IMMUTABLE.includes(kind)) throw fail("Posted transactions cannot be edited", 409);
  const doc = await GlEntity.findOne({ _id: id, kind });
  if (!doc) throw fail("Record not found", 404);
  if (WORKFLOW.includes(kind)) {
    if (String(doc.createdBy) !== String(user._id || user.id)) throw fail("Only the maker can edit this record", 403);
    if (!["Pending Author", "Rejected"].includes(doc.status)) throw fail(`A record with status "${doc.status}" cannot be edited`, 409);
  }
  if (kind === "period") throw fail("Accounting periods cannot be edited; close or reopen them instead", 409);
  const ctx = { refs: {}, code: doc.code };
  const merged = { ...(input || {}) };
  if (kind === "faasset") for (const k of ["cost", "salvage", "purchaseDate", "category", "account", "block", "offsetLedger"]) merged[k] = doc.data[k];
  const { data, errors } = await readFields(def, merged, doc, ctx);
  if (Object.keys(errors).length) throw fail("Validation failed", 422, errors);
  await derive(kind, data, ctx, doc, user);
  let status = doc.status;
  if (def.fields.some((f) => f.n === "status" && !f.ro) && data.status) status = data.status;
  if (WORKFLOW.includes(kind)) status = "Pending Author";
  delete data.status;
  const changed = Object.keys(data).filter((k) => JSON.stringify(data[k]) !== JSON.stringify(doc.data[k]));
  const res = await GlEntity.findOneAndUpdate(
    { _id: doc._id, status: doc.status },
    { $set: { data, status }, $push: { history: hist(user, "Updated", changed.join(", ") || "no field change") } },
    { new: true },
  );
  if (!res) throw fail("Record was modified by someone else; reload and retry", 409);
  return pub(res);
}

async function remove(user, kind, id) {
  const def = defOf(kind);
  if (def.write !== "master") throw fail("Transactions cannot be deleted", 405);
  assertWrite(user, kind);
  const doc = await GlEntity.findOne({ _id: id, kind });
  if (!doc) throw fail("Record not found", 404);
  if (await isReferenced(kind, doc.code)) throw fail("Record is in use and cannot be deleted. Mark it Inactive instead.", 409);
  await GlEntity.deleteOne({ _id: doc._id });
  return { id: String(doc._id), code: doc.code };
}

function buildFilter(kind, q) {
  const def = defOf(kind);
  const f = { kind };
  if (q.status) f.status = String(q.status);
  for (const fd of def.fields) {
    if (["number", "multi", "bool", "textarea"].includes(fd.t) || fd.n === "status" || fd.n === "code") continue;
    if (q[fd.n] !== undefined && q[fd.n] !== "") f[`data.${fd.n}`] = String(q[fd.n]);
  }
  const dateF = def.fields.find((x) => x.t === "date");
  if (dateF && (q.from || q.to)) {
    f[`data.${dateF.n}`] = {};
    if (q.from) f[`data.${dateF.n}`].$gte = String(q.from);
    if (q.to) f[`data.${dateF.n}`].$lte = String(q.to);
  }
  if (q.q) {
    const rx = new RegExp(esc(String(q.q).slice(0, 60)), "i");
    f.$or = [{ code: rx }, ...def.fields.filter((x) => ["text", "ref", "select"].includes(x.t)).map((x) => ({ [`data.${x.n}`]: rx }))];
  }
  return f;
}

async function list(kind, q) {
  const def = defOf(kind);
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const size = Math.min(100, Math.max(1, parseInt(q.size, 10) || 20));
  const filter = buildFilter(kind, q);
  const sort = def.write === "master" ? { code: 1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([GlEntity.find(filter).sort(sort).skip((page - 1) * size).limit(size).lean(), GlEntity.countDocuments(filter)]);
  return { items: items.map(pub), total, page, size };
}

async function exportCsv(kind, q) {
  const def = defOf(kind);
  const items = await GlEntity.find(buildFilter(kind, q)).sort({ code: 1 }).limit(5000).lean();
  const cols = [{ k: "code", l: "Code" }, ...def.fields.filter((f) => f.n !== "code").map((f) => ({ k: f.n, l: f.l })), { k: "status", l: "Status" }].filter((c, i, a) => a.findIndex((x) => x.k === c.k) === i);
  const rows = items.map((e) => ({ code: e.code, status: e.status, ...e.data, ...Object.fromEntries(Object.entries(e.data).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.join("; ")])) }));
  return toCsv(cols, rows);
}

async function get(kind, id) {
  defOf(kind);
  const doc = await GlEntity.findOne({ _id: id, kind }).lean();
  if (!doc) throw fail("Record not found", 404);
  return { ...pub(doc), history: doc.history };
}

async function options(kind, q) {
  const def = defOf(kind);
  const filter = { kind };
  if (def.fields.some((f) => f.n === "status" && f.o?.includes("Inactive")) && q.all !== "1") filter.status = "Active";
  if (kind === "ledger") { if (q.limited === "1") filter["data.limited"] = true; if (q.bank === "1") filter["data.isBank"] = true; }
  if (kind === "faasset") filter.status = q.all === "1" ? { $exists: true } : "Active";
  if (kind === "bill") { if (q.status) filter.status = String(q.status); if (q.type) filter["data.type"] = String(q.type); }
  if (kind === "period" && q.open === "1") filter.status = "Open";
  const items = await GlEntity.find(filter).sort({ code: 1 }).limit(1000).lean();
  return items.map((e) => ({ code: e.code, label: `${e.code}${e.data.name ? ` — ${e.data.name}` : e.data.billNo ? ` — ${e.data.billNo}` : ""}`, ...(kind === "ledger" ? { limited: !!e.data.limited, isBank: !!e.data.isBank, isCash: !!e.data.isCash } : {}) }));
}

module.exports = { defOf, pub, create, update, remove, list, get, exportCsv, options, getRef, assertWrite, canWrite, WORKFLOW, hasPostings, readFields, derive };
