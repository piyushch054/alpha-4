const GlCounter = require("../models/GlCounter");
const { ROLES } = require("../config/gl");

const fail = (message, status = 400, errors) => {
  const e = new Error(message);
  e.status = status;
  if (errors) e.errors = errors;
  return e;
};

const inRoles = (user, key) => !!user && ROLES[key].includes(user.role);
const actor = (user) => ({ id: user._id || user.id, name: user.name || user.email || "User", role: user.role });
const hist = (user, action, note) => ({ action, note: note ? String(note).slice(0, 300) : undefined, by: user.name || user.email || "User", role: user.role, at: new Date() });

const toPaise = (n) => Math.round(Number(n) * 100);
const fromPaise = (p) => Math.round(p) / 100;
const isMoney = (v) => v !== "" && v !== null && v !== undefined && Number.isFinite(Number(v)) && Math.abs(toPaise(v) - Number(v) * 100) < 1e-6;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (s) => {
  if (typeof s !== "string" || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (s, n) => new Date(new Date(`${s}T00:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / 86400000);

// Accepts YYYY-MM-DD or DD/MM/YYYY (bank statement and upload files).
const normDate = (s) => {
  const v = String(s || "").trim();
  if (isDate(v)) return v;
  const m = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  const out = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return isDate(out) ? out : null;
};

async function nextSeq(key, width = 6) {
  const c = await GlCounter.findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return String(c.seq).padStart(width, "0");
}

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Spreadsheet formula injection guard for exported text cells.
const csvCell = (v) => {
  if (v === null || v === undefined) return "";
  let s = typeof v === "number" ? String(v) : String(v);
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (columns, rows) => [columns.map((c) => csvCell(c.l)).join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c.k])).join(","))].join("\r\n");

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  const src = String(text || "").replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) {
      if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  if (!rows.length) return { headers: [], records: [] };
  const headers = rows[0].map((h) => h.trim());
  return { headers, records: rows.slice(1).map((r, i) => ({ line: i + 2, ...Object.fromEntries(headers.map((h, j) => [h, (r[j] || "").trim()])) })) };
}

function requireCsv(text, needed, max = 2000) {
  if (typeof text !== "string" || !text.trim()) throw fail("CSV content is required", 400);
  if (text.length > 1500000) throw fail("CSV file is too large", 413);
  const { headers, records } = parseCsv(text);
  const lower = headers.map((h) => h.toLowerCase());
  const missing = needed.filter((h) => !lower.includes(h.toLowerCase()));
  if (missing.length) throw fail(`Missing CSV column(s): ${missing.join(", ")}`, 422);
  if (!records.length) throw fail("CSV has no data rows", 422);
  if (records.length > max) throw fail(`CSV has more than ${max} rows`, 422);
  const map = Object.fromEntries(headers.map((h) => [h.toLowerCase(), h]));
  return records.map((r) => ({ line: r.line, get: (k) => r[map[k.toLowerCase()]] ?? "" }));
}

module.exports = { fail, inRoles, actor, hist, toPaise, fromPaise, isMoney, isDate, today, addDays, daysBetween, normDate, nextSeq, esc, toCsv, parseCsv, requireCsv };
