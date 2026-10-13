// General Ledger module (config-driven from /api/gl/meta). Runs inside the legacy LOS shell like the product journeys.
// All data is read from and written to the server; nothing is persisted in the browser.
export function makeGeneralLedgerScript(apiBase) {
  return String.raw`<script>(()=>{
if (typeof navTo === 'undefined' || typeof currentUser === 'undefined') return;
const API = ${JSON.stringify(apiBase)};
const G = { meta:null, item:null, opts:{}, ls:{}, tok:0, v:null, openGroups:{ gl:true } };
window.GL = G;
const h = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fm = n => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 });
const paise = v => Math.round(Number(v || 0) * 100);
const can = k => !!(G.meta && G.meta.caps && G.meta.caps[k]);
const BADGE = { Active:'green', Open:'green', Approved:'green', Authorised:'green', Posted:'green', Matched:'green', Cleared:'green', Closed:'gray', Inactive:'gray', Reversed:'gray', Cancelled:'gray', Pending:'amber', 'Pending Author':'amber', 'Cancel Requested':'amber', Unmatched:'amber', Rejected:'red', Bounced:'red' };
const badge = s => s ? '<span class="badge ' + (BADGE[s] || 'blue') + '">' + h(s) + '</span>' : '';
const NOEDIT = ['fatransfer','fasale','fadep','bankstmt','tallyentry'];

function token() { return sessionStorage.getItem('token'); }
async function ensureToken(force) {
  const key = currentUser.role + '|' + (currentUser.name || currentUser.role);
  if (token() && !force && sessionStorage.getItem('pdSessionKey') === key) return;
  const r = await fetch(API + '/auth/demo-session', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ role:currentUser.role, name:currentUser.name || currentUser.role }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.token) throw Object.assign(new Error('Your session could not be established. Please sign in again.'), { status:401 });
  sessionStorage.setItem('token', j.token);
  sessionStorage.setItem('pdSessionKey', key);
}
async function raw(path, method, body, retried) {
  await ensureToken();
  let r;
  try { r = await fetch(API + '/gl' + path, { method:method || 'GET', headers:Object.assign({ Authorization:'Bearer ' + token() }, body ? { 'Content-Type':'application/json' } : {}), body:body ? JSON.stringify(body) : undefined }); }
  catch (e) { throw Object.assign(new Error('The server is unreachable. Your changes have not been saved.'), { network:true }); }
  if (r.status === 401 && !retried) { sessionStorage.removeItem('token'); await ensureToken(true); return raw(path, method, body, true); }
  return r;
}
async function api(path, method, body) {
  const r = await raw(path, method, body);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.message || 'Request failed'), { status:r.status, errors:j.errors });
  return j.data;
}
async function download(path, name) {
  const r = await raw(path);
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error(j.message || 'Export failed'), { status:r.status }); }
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const qs = o => Object.keys(o).filter(k => o[k] !== '' && o[k] != null && o[k] !== false).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(o[k])).join('&');
const toast = m => { if (typeof showToast === 'function') showToast(m); };
const fail = e => { toast(e.message || 'Something went wrong'); };
const errBox = e => {
  if (e && e.status === 403) return '<div class="notice warn"><b>Access Restricted</b><br>Your role is not permitted to use this function.</div>';
  const list = e && e.errors ? (Array.isArray(e.errors) ? e.errors.map(x => (x.row ? 'Row ' + x.row + ': ' : '') + (x.message || x)) : Object.keys(e.errors).map(k => k + ': ' + e.errors[k])) : [];
  return '<div class="notice warn"><b>' + h(e && e.message || 'Request failed') + '</b>' + (list.length ? '<ul style="margin:6px 0 0 16px">' + list.slice(0, 12).map(x => '<li>' + h(x) + '</li>').join('') + '</ul>' : '') + '</div>';
};
const loading = '<div class="notice info">Loading…</div>';
const main = () => document.getElementById('glMain');
const fresh = () => ++G.tok;
const live = t => t === G.tok && main();
const nowDate = () => new Date().toISOString().slice(0, 10);

async function opts(kind, params) {
  const key = kind + '?' + qs(params || {});
  if (!G.opts[key]) G.opts[key] = await api('/options/' + kind + (params && Object.keys(params).length ? '?' + qs(params) : ''));
  return G.opts[key];
}
const dropOpts = () => { G.opts = {}; };
const selectHtml = (id, list, val, blank, extra) => '<select id="' + id + '" ' + (extra || '') + '>' + (blank !== false ? '<option value="">' + h(blank || 'Select') + '</option>' : '') + list.map(o => { const v = typeof o === 'string' ? o : o.code; const l = typeof o === 'string' ? o : o.label; return '<option value="' + h(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + h(l) + '</option>'; }).join('') + '</select>';
const pager = (st, act) => { const pages = Math.max(1, Math.ceil(st.total / st.size)); return '<div class="toolbar" style="margin-top:10px"><span>' + (st.total ? ((st.page - 1) * st.size + 1) + '–' + Math.min(st.page * st.size, st.total) + ' of ' + st.total : '0 records') + '</span><div class="toolbar-group"><button class="filter-btn" data-gl="' + act + '" data-a="' + (st.page - 1) + '"' + (st.page <= 1 ? ' disabled' : '') + '>Previous</button><span style="align-self:center">Page ' + st.page + ' / ' + pages + '</span><button class="filter-btn" data-gl="' + act + '" data-a="' + (st.page + 1) + '"' + (st.page >= pages ? ' disabled' : '') + '>Next</button></div></div>'; };

const css = document.createElement('style');
css.textContent = '.gl-wrap{display:grid;grid-template-columns:250px minmax(0,1fr);gap:16px;align-items:start}.gl-nav{background:#fff;border:1px solid var(--line);border-radius:14px;padding:8px;position:sticky;top:8px;max-height:calc(100vh - 110px);overflow:auto}.gl-grp{width:100%;text-align:left;background:none;border:0;padding:8px 9px;font-weight:800;font-size:11px;cursor:pointer;display:flex;justify-content:space-between;color:#0f172a}.gl-item{display:block;width:100%;text-align:left;background:none;border:0;border-radius:8px;padding:6px 9px 6px 18px;font-size:10.5px;cursor:pointer;color:#334155}.gl-item:hover{background:#f1f5f9}.gl-item.active{background:#e0e7ff;color:#3730a3;font-weight:800}.gl-num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.gl-head td{font-weight:800;background:#f8fafc}.gl-total td{font-weight:800;border-top:2px solid #cbd5e1}.gl-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gl-fields label.field.wide{grid-column:1/-1}.gl-kv{display:grid;grid-template-columns:150px 1fr;gap:4px 10px;font-size:11px}.gl-kv b{color:#475569}.gl-bal{font-weight:800}.gl-bal.bad{color:#b91c1c}.gl-bal.good{color:#166534}.gl-pick{cursor:pointer}.gl-pick.sel td{background:#e0e7ff}.gl-split{display:grid;grid-template-columns:1fr 1fr;gap:12px}.gl-navtoggle{display:none}@media(max-width:900px){.gl-wrap{grid-template-columns:1fr}.gl-nav{position:static;max-height:none}.gl-nav.collapsed .gl-navbody{display:none}.gl-navtoggle{display:block}.gl-fields,.gl-split{grid-template-columns:1fr}.gl-kv{grid-template-columns:1fr}}';
document.head.appendChild(css);

// ---------- shell ----------
function findItem(id) { for (const g of G.meta.menu) for (const it of g.items) if (it.id === id) return it; return null; }
function drawShell() {
  const nav = G.meta.menu.map(g => '<div><button class="gl-grp" data-gl="grp" data-a="' + g.id + '"><span>' + h(g.title) + '</span><span>' + (G.openGroups[g.id] ? '−' : '+') + '</span></button>' + (G.openGroups[g.id] ? g.items.map(it => '<button class="gl-item' + (G.item && G.item.id === it.id ? ' active' : '') + '" data-gl="go" data-a="' + it.id + '">' + h(it.title) + '</button>').join('') : '') + '</div>').join('');
  document.getElementById('content').innerHTML = '<div class="page-head"><div><h2>General Ledger</h2><p>Chart of accounts, vouchers, reports, fixed assets, payables / receivables and bank reconciliation.</p></div><div class="toolbar-group"><span class="role-chip">' + h(G.meta.user.role) + '</span><button class="ghost-btn" onclick="nfOpenLoanPostings()">Loan Posting Log</button></div></div><div class="gl-wrap"><nav class="gl-nav' + (window.innerWidth <= 900 ? ' collapsed' : '') + '"><button class="gl-navtoggle filter-btn" data-gl="navtoggle">Menu</button><div class="gl-navbody">' + nav + '</div></nav><section id="glMain" class="process-card" style="min-width:0"></section></div>';
}
async function openGL(itemId) {
  setPage('General Ledger', 'Loan Operations / LMS');
  document.getElementById('content').innerHTML = '<div class="process-card">' + loading + '</div>';
  try {
    const who = currentUser.role + '|' + (currentUser.name || '');
    if (G.who !== who) { G.meta = null; G.ls = {}; G.opts = {}; G.v = null; G.who = who; }
    if (!G.meta) G.meta = await api('/meta');
  } catch (e) {
    G.meta = null;
    document.getElementById('content').innerHTML = '<div class="process-card">' + errBox(e) + '</div>';
    return;
  }
  const it = findItem(itemId || (G.item && G.item.id) || 'dashboard') || G.meta.menu[0].items[0];
  G.item = it;
  G.meta.menu.forEach(g => { if (g.items.some(x => x.id === it.id)) G.openGroups[g.id] = true; });
  drawShell();
  renderItem();
}
function renderItem() {
  const it = G.item, t = fresh(), m = main();
  if (!m) return;
  const head = '<div class="section-bar"><div><h3>' + h(it.title) + '</h3></div></div>';
  m.innerHTML = head + '<div id="glBody">' + loading + '</div>';
  const R = { dashboard:rDashboard, entity:rEntity, voucher:rVoucher, vapproval:rApproval, vreversal:rReversal, yearend:rYearEnd, chequeedit:rCheque, vupload:rVUpload, report:rReport, depreciation:rDepreciation, bill:rWorkflow, billcancel:rWorkflow, settle:rWorkflow, chequestatus:rWorkflow, knockoff:rWorkflow, rcmupload:rRcm, apdownload:rApDownload, stmtupload:rStmtUpload, autorecon:rAuto, manualrecon:rManual, reconupload:rReconUpload };
  const fn = R[it.type];
  const body = document.getElementById('glBody');
  if (!fn) { body.innerHTML = '<div class="notice warn">This screen is not available.</div>'; return; }
  Promise.resolve(fn(body, it, t)).catch(e => { if (live(t)) body.innerHTML = errBox(e); });
}

// ---------- dashboard ----------
async function rDashboard(body, it, t) {
  const d = await api('/dashboard');
  if (!live(t)) return;
  const loanPostings = typeof window.nfGetLoanLedgerForGL === 'function' ? window.nfGetLoanLedgerForGL() : [];
  const loanDebit = loanPostings.reduce((sum, row) => sum + Number(row.debit || 0), 0);
  const loanCredit = loanPostings.reduce((sum, row) => sum + Number(row.credit || 0), 0);
  const loanBalances = new Map();
  loanPostings.forEach(row => {
    const balance = loanBalances.get(row.account) || { debit:0, credit:0 };
    balance.debit += Number(row.debit || 0);
    balance.credit += Number(row.credit || 0);
    loanBalances.set(row.account, balance);
  });
  const loanBalanceRows = [...loanBalances.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([account, balance]) => {
    const net = balance.debit - balance.credit;
    return '<tr><td>' + h(account) + '</td><td class="gl-num">' + fm(balance.debit) + '</td><td class="gl-num">' + fm(balance.credit) + '</td><td class="gl-num">' + (net === 0 ? '—' : fm(Math.abs(net)) + (net > 0 ? ' Dr' : ' Cr')) + '</td></tr>';
  }).join('');
  const loanBalanceSection = '<h4 style="margin:14px 0 8px">Demo servicing account balances</h4>' + (loanBalanceRows ? '<div class="table-wrap"><table data-nlt="1"><thead><tr><th>Account</th><th class="gl-num">Total debit</th><th class="gl-num">Total credit</th><th class="gl-num">Net balance</th></tr></thead><tbody>' + loanBalanceRows + '</tbody></table></div>' : '<div class="notice info">Account balances will appear after the first demo loan posting.</div>');
  const labels = { years:'Accounting years', openPeriods:'Open periods', ledgers:'Ledgers', groups:'Groups', pendingVouchers:'Vouchers pending approval', postedVouchers:'Posted vouchers', pendingBills:'Bills pending author', unmatchedStatements:'Unmatched bank lines', reconciledPercent:'Bank lines reconciled %' };
  const cards = Object.keys(labels).map(k => '<div class="workflow-card"><span>' + labels[k] + '</span><b>' + (d[k] == null ? '—' : h(d[k])) + '</b></div>').join('');
  const extra = Object.keys(d).filter(k => !labels[k] && typeof d[k] !== 'object').map(k => '<div class="workflow-card"><span>' + h(k) + '</span><b>' + h(d[k]) + '</b></div>').join('');
  const rec = Array.isArray(d.recent) ? d.recent : [];
  const loanSection = '<section class="workflow-card" style="margin-top:14px"><div class="workflow-title"><div><h3>Demo loan servicing postings</h3><p>Live browser-local servicing sub-ledger. Repayment allocations update these balances immediately; it remains separate from official accounting vouchers and does not post to the accounting books.</p></div><button class="ghost-btn" onclick="nfOpenLoanPostings()">Open Loan Posting Log</button></div><div class="grid kpis"><div class="workflow-card"><span>Demo entries</span><b>' + loanPostings.length + '</b></div><div class="workflow-card"><span>Demo debit</span><b>' + fm(loanDebit) + '</b></div><div class="workflow-card"><span>Demo credit</span><b>' + fm(loanCredit) + '</b></div></div>' + loanBalanceSection + (loanPostings.length ? '<h4 style="margin:14px 0 8px">Latest demo postings</h4><div class="table-wrap"><table data-nlt="1"><thead><tr><th>Date</th><th>Application / Loan</th><th>Account</th><th>Type</th><th>Debit</th><th>Credit</th><th>Reference</th></tr></thead><tbody>' + loanPostings.slice(0, 10).map(row => '<tr><td>' + h(String(row.date || '').slice(0, 19).replace('T', ' ')) + '</td><td>' + h(row.applicationId || '') + (row.loanId ? ' / ' + h(row.loanId) : '') + '</td><td>' + h(row.account || '') + '</td><td>' + h(row.type || '') + '</td><td class="gl-num">' + fm(row.debit) + '</td><td class="gl-num">' + fm(row.credit) + '</td><td>' + h(row.reference || '') + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="notice info">No loan servicing postings yet. They appear here after demo loan events such as IMD collection or disbursement.</div>') + '</section>';
  body.innerHTML = '<div class="source-grid">' + cards + extra + '</div>' + (d.trialBalance ? '<div class="notice ' + (d.trialBalance.balanced === false ? 'warn' : 'success') + '" style="margin-top:12px">Trial balance: debit ' + fm(d.trialBalance.debit) + ' / credit ' + fm(d.trialBalance.credit) + '</div>' : '') + loanSection + '<h4 style="margin:16px 0 8px">Recent activity</h4>' + (rec.length ? '<div class="table-wrap"><table data-nlt="1"><thead><tr><th>When</th><th>Who</th><th>Event</th><th>Detail</th></tr></thead><tbody>' + rec.map(r => '<tr><td>' + h(String(r.at || r.date || '').slice(0, 19).replace('T', ' ')) + '</td><td>' + h(r.byName || r.by || r.user || '') + '</td><td>' + h(r.action || r.event || '') + '</td><td>' + h(r.ref || r.voucherNo || r.detail || r.note || '') + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="notice info">No accounting activity yet. Create an accounting year, periods and ledgers to begin.</div>');
}

// ---------- generic entity list ----------
const defOf = kind => G.meta.entities[kind];
const writeCap = kind => can(defOf(kind).write);
function colsOf(def) { const c = def.fields.filter(f => f.col); return (c.length ? c : def.fields.slice(0, 6)); }
function cell(f, v) {
  if (v == null || v === '') return '';
  if (f.n === 'status') return badge(v);
  if (f.t === 'bool') return v ? 'Yes' : 'No';
  if (f.t === 'number') return '<span class="gl-num">' + fm(v) + '</span>';
  if (Array.isArray(v)) return h(v.join(', '));
  return h(v);
}
function listState(key, init) { if (!G.ls[key]) G.ls[key] = Object.assign({ page:1, size:20, q:'', filters:{}, data:null }, init || {}); return G.ls[key]; }
async function rEntity(body, it, t) {
  await entityList(body, it.kind, { key:'e:' + it.id, title:it.title, allowNew:true, search:!!it.search }, t);
}
// cfg: key, fixed (filters always applied), allowNew, actions (extra row actions), noEdit, search
async function entityList(body, kind, cfg, t) {
  const def = defOf(kind);
  const st = listState(cfg.key);
  st.cfg = cfg; st.kind = kind; G.curKey = cfg.key;
  const filterFields = def.fields.filter(f => f.t === 'select' && f.col && !(cfg.fixed && cfg.fixed[f.n]) && f.n !== 'status');
  const refs = {};
  for (const f of filterFields) if (!f.o) refs[f.n] = await opts(f.ref, { all:1 });
  if (!live(t)) return;
  st.filterFields = filterFields;
  const statusOpts = def.fields.find(f => f.n === 'status');
  const writable = writeCap(kind) && !def.system;
  const tools = '<div class="toolbar"><div class="toolbar-group"><input class="compact-input" id="glQ" placeholder="Search" value="' + h(st.q) + '">' +
    (statusOpts && !(cfg.fixed && cfg.fixed.status) ? selectHtml('glStatus', (statusOpts.o || []), st.filters.status, 'All statuses') : '') +
    filterFields.map(f => selectHtml('glF_' + f.n, f.o || [], st.filters[f.n], 'All ' + f.l.toLowerCase())).join('') +
    (def.fields.some(f => f.t === 'date') ? '<input type="date" id="glFrom" title="From" value="' + h(st.from || '') + '"><input type="date" id="glTo" title="To" value="' + h(st.to || '') + '">' : '') +
    '<button class="filter-btn" data-gl="elsearch" data-a="' + h(cfg.key) + '">Search</button><button class="filter-btn" data-gl="elreset" data-a="' + h(cfg.key) + '">Reset</button></div><div class="toolbar-group"><button class="filter-btn" data-gl="elexport" data-a="' + h(cfg.key) + '">Export CSV</button>' + (cfg.allowNew && writable ? '<button class="primary-btn" data-gl="elnew" data-a="' + h(cfg.key) + '">New ' + h(def.label) + '</button>' : '') + '</div></div>';
  body.innerHTML = (cfg.note ? '<div class="notice info">' + h(cfg.note) + '</div>' : '') + tools + '<div id="glList">' + loading + '</div>';
  await loadList(cfg.key, t);
}
function listQuery(st) {
  return Object.assign({ page:st.page, size:st.size, q:st.q, status:st.filters.status, from:st.from, to:st.to }, st.filters, st.cfg.fixed || {});
}
async function loadList(key, t) {
  const st = G.ls[key];
  const box = document.getElementById('glList');
  if (!box) return;
  const kind = st.kind, def = defOf(kind);
  let d;
  try { d = await api('/e/' + kind + '?' + qs(listQuery(st))); } catch (e) { if (live(t || G.tok)) box.innerHTML = errBox(e); return; }
  if (!live(t || G.tok)) return;
  st.total = d.total; st.page = d.page; st.size = d.size;
  const cols = colsOf(def);
  const acts = r => rowActions(kind, r, st.cfg);
  box.innerHTML = d.items.length ? '<div class="table-wrap"><table data-nlt="1"><thead><tr>' + cols.map(f => '<th' + (f.t === 'number' ? ' class="gl-num"' : '') + '>' + h(f.l) + '</th>').join('') + '<th>Actions</th></tr></thead><tbody>' + d.items.map((r, i) => '<tr>' + cols.map(f => '<td' + (f.t === 'number' ? ' class="gl-num"' : '') + '>' + cell(f, r[f.n]) + '</td>').join('') + '<td style="white-space:nowrap">' + acts(r).map(a => '<button class="' + (a.cls || 'filter-btn') + '" data-gl="rowact" data-a="' + h(key) + '" data-b="' + i + '" data-c="' + a.id + '">' + h(a.label) + '</button>').join(' ') + '</td></tr>').join('') + '</tbody></table></div>' + pager(st, 'elpage') : '<div class="notice info">No records found' + (st.q || Object.keys(st.filters).some(k => st.filters[k]) ? ' for the selected filters.' : '. Use New to create the first one.') + '</div>';
  st.rows = d.items;
}
function rowActions(kind, r, cfg) {
  const def = defOf(kind), a = [{ id:'view', label:'View' }];
  const writable = writeCap(kind) && !def.system && !NOEDIT.includes(kind);
  const wf = ['bill','settle','knockoff'].includes(kind);
  const mine = r.createdBy === G.meta.user.id;
  if (cfg.rowMode === 'author') {
    if (can('checker')) { a.push({ id:'authorize', label:'Authorise', cls:'primary-btn' }, { id:'reject', label:'Reject', cls:'danger-btn' }); }
  } else if (cfg.rowMode === 'cancel-request') {
    if (can('maker')) a.push({ id:'request-cancel', label:'Request cancel', cls:'danger-btn' });
  } else if (cfg.rowMode === 'cancel-author') {
    if (can('checker')) a.push({ id:'cancel-approve', label:'Approve cancel', cls:'primary-btn' }, { id:'cancel-reject', label:'Reject cancel', cls:'danger-btn' });
  } else if (cfg.rowMode === 'cheque') {
    if (can('maker') || can('checker')) ['Cleared','Bounced','Cancelled'].forEach(s => a.push({ id:'cheque:' + s, label:s }));
  } else {
    if (kind === 'period' && can('close')) a.push(r.status === 'Open' ? { id:'close', label:'Close period' } : { id:'reopen', label:'Reopen' });
    if (writable && (!wf || (mine && ['Pending Author','Rejected'].includes(r.status)))) a.push({ id:'edit', label:'Edit' });
    if (writable && kind !== 'period' && !wf) a.push({ id:'delete', label:'Delete', cls:'danger-btn' });
    else if (writable && wf && mine && ['Pending Author','Rejected'].includes(r.status)) a.push({ id:'delete', label:'Delete', cls:'danger-btn' });
  }
  return a;
}

// ---------- form / view / row actions ----------
const refParams = (kind, f) => {
  if (kind === 'settle' && f.n === 'bill') return { status:'Authorised' };
  if (kind === 'knockoff' && f.n === 'payable') return { status:'Authorised', type:'Payable' };
  if (kind === 'knockoff' && f.n === 'receivable') return { status:'Authorised', type:'Receivable' };
  if (f.ref === 'ledger' && f.n === 'bank') return { bank:1 };
  return {};
};
function inputHtml(kind, f, val, editing, refList) {
  const id = 'gf_' + f.n;
  const ro = f.ro === true || (f.ro === 'edit' && editing);
  const dis = ro ? ' disabled' : '';
  const req = f.r ? ' *' : '';
  let ctl;
  if (f.t === 'select') ctl = selectHtml(id, f.o || [], val, f.r ? 'Select' : 'None', dis);
  else if (f.t === 'ref') { let list = refList || []; if (val && !list.some(o => o.code === val)) list = list.concat([{ code:val, label:val }]); ctl = selectHtml(id, list, val, 'Select', dis); }
  else if (f.t === 'bool') ctl = '<select id="' + id + '"' + dis + '><option value="">No</option><option value="1"' + (val ? ' selected' : '') + '>Yes</option></select>';
  else if (f.t === 'multi' && f.o) { const cur = Array.isArray(val) ? val : []; ctl = '<div id="' + id + '" data-multi="1" style="display:flex;flex-wrap:wrap;gap:6px 12px">' + f.o.map(o => '<label style="display:flex;gap:4px;font-size:10.5px"><input type="checkbox" value="' + h(o) + '"' + (cur.includes(o) ? ' checked' : '') + dis + '>' + h(o) + '</label>').join('') + '</div>'; }
  else if (f.t === 'multi') ctl = '<input id="' + id + '" data-csv="1" value="' + h(Array.isArray(val) ? val.join(', ') : '') + '"' + dis + '>';
  else if (f.t === 'date') ctl = '<input type="date" id="' + id + '" value="' + h(val || '') + '"' + dis + '>';
  else if (f.t === 'number') ctl = '<input type="number" step="0.01" min="' + (f.min != null ? f.min : '') + '" id="' + id + '" value="' + h(val == null ? '' : val) + '"' + dis + '>';
  else ctl = '<input id="' + id + '" maxlength="' + (f.max || 120) + '" value="' + h(val || '') + '"' + dis + '>';
  return '<label class="field' + (f.max > 100 ? ' wide' : '') + '"><span>' + h(f.l) + req + '</span>' + ctl + '<small class="gl-err" id="ge_' + f.n + '" style="color:#b91c1c"></small></label>';
}
async function openForm(key, row) {
  const st = G.ls[key], kind = st.kind, def = defOf(kind), editing = !!row;
  let rec = row;
  if (editing) { try { rec = await api('/e/' + kind + '/' + row.id); } catch (e) { return fail(e); } }
  const vis = def.fields.filter(f => !(f.ro === true && !editing) && !(f.n === 'status' && f.ro === true));
  const lists = {};
  try { for (const f of vis) if (f.t === 'ref') lists[f.n] = await opts(f.ref, refParams(kind, f)); } catch (e) { return fail(e); }
  G.form = { key, kind, id:editing ? row.id : null, fields:vis };
  const body = '<div id="glFormErr"></div><div class="gl-fields">' + vis.map(f => inputHtml(kind, f, editing ? rec[f.n] : (f.def !== undefined ? f.def : (f.t === 'date' && f.n !== 'dueDate' ? '' : '')), editing, lists[f.n])).join('') + '</div>';
  showModal((editing ? 'Edit ' : 'New ') + def.label, body, '<button class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" id="glSave" data-gl="save">' + (editing ? 'Save changes' : 'Create') + '</button>');
}
function readForm() {
  const out = {};
  for (const f of G.form.fields) {
    const el = document.getElementById('gf_' + f.n);
    if (!el || el.disabled && !el.dataset.multi) continue;
    if (f.ro === true) continue;
    if (el.dataset.multi) out[f.n] = [...el.querySelectorAll('input:checked')].map(x => x.value);
    else if (el.dataset.csv) out[f.n] = el.value.split(',').map(x => x.trim()).filter(Boolean);
    else if (f.t === 'bool') out[f.n] = el.value === '1';
    else if (f.t === 'number') out[f.n] = el.value === '' ? '' : el.value;
    else out[f.n] = el.value.trim();
  }
  return out;
}
let saving = false;
async function saveForm() {
  if (saving || !G.form) return;
  saving = true;
  const btn = document.getElementById('glSave'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  document.querySelectorAll('.gl-err').forEach(x => x.textContent = '');
  const f = G.form;
  try {
    await api('/e/' + f.kind + (f.id ? '/' + f.id : ''), f.id ? 'PUT' : 'POST', readForm());
    dropOpts();
    closeModal(); toast(f.id ? 'Changes saved' : defOf(f.kind).label + ' created');
    G.form = null;
    await loadList(f.key);
  } catch (e) {
    const box = document.getElementById('glFormErr');
    if (e.errors && !Array.isArray(e.errors)) Object.keys(e.errors).forEach(k => { const s = document.getElementById('ge_' + k); if (s) s.textContent = e.errors[k]; });
    if (box) box.innerHTML = errBox(e);
    if (btn) { btn.disabled = false; btn.textContent = f.id ? 'Save changes' : 'Create'; }
  } finally { saving = false; }
}
async function openView(kind, id) {
  let r;
  try { r = await api('/e/' + kind + '/' + id); } catch (e) { return fail(e); }
  const def = defOf(kind);
  const kv = [['Code', r.code]].concat(def.fields.filter(f => f.n !== 'code').map(f => [f.l, f.n === 'status' ? null : (f.t === 'bool' ? (r[f.n] ? 'Yes' : 'No') : Array.isArray(r[f.n]) ? r[f.n].join(', ') : r[f.n])])).filter(x => x[1] !== null && x[1] !== undefined && x[1] !== '');
  const hist = (r.history || []).slice().reverse();
  showModal(def.label + ' ' + h(r.code), '<div class="gl-kv"><b>Status</b><span>' + badge(r.status) + '</span>' + kv.map(x => '<b>' + h(x[0]) + '</b><span>' + h(x[1]) + '</span>').join('') + '<b>Maker</b><span>' + h(r.createdByName || '') + '</span>' + (r.checkedByName ? '<b>Checker</b><span>' + h(r.checkedByName) + '</span>' : '') + '</div><h4 style="margin:14px 0 6px">Audit history</h4>' + historyHtml(hist), '<button class="secondary-btn" onclick="closeModal()">Close</button>');
}
function historyHtml(hist) {
  return hist.length ? '<div class="table-wrap"><table data-nlt="1" style="min-width:0"><thead><tr><th>When</th><th>By</th><th>Action</th><th>Note</th></tr></thead><tbody>' + hist.map(x => '<tr><td>' + h(String(x.at || '').slice(0, 19).replace('T', ' ')) + '</td><td>' + h(x.byName || x.by || '') + '</td><td>' + h(x.action || '') + '</td><td>' + h(x.note || '') + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="notice info">No history.</div>';
}
function askReason(title, cb) {
  showModal(title, '<div id="glReasonErr"></div><label class="field"><span>Reason *</span><input id="glReason" maxlength="200"></label>', '<button class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" id="glReasonGo">Confirm</button>');
  document.getElementById('glReasonGo').onclick = async () => {
    const v = document.getElementById('glReason').value.trim();
    if (!v) { document.getElementById('glReasonErr').innerHTML = '<div class="notice warn">A reason is required.</div>'; return; }
    const b = document.getElementById('glReasonGo'); b.disabled = true;
    try { await cb(v); closeModal(); } catch (e) { b.disabled = false; document.getElementById('glReasonErr').innerHTML = errBox(e); }
  };
}
function confirmBox(title, text, label, cb) {
  showModal(title, '<div id="glCfErr"></div><p>' + h(text) + '</p>', '<button class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" id="glCfGo">' + h(label) + '</button>');
  document.getElementById('glCfGo').onclick = async () => {
    const b = document.getElementById('glCfGo'); b.disabled = true;
    try { await cb(); closeModal(); } catch (e) { b.disabled = false; document.getElementById('glCfErr').innerHTML = errBox(e); }
  };
}
async function doRowAction(key, idx, act) {
  const st = G.ls[key], r = st.rows[idx], kind = st.kind;
  const reload = async () => { dropOpts(); await loadList(key); };
  const call = async (action, body) => { await api('/e/' + kind + '/' + r.id + '/' + action, 'POST', body || {}); toast('Done'); await reload(); };
  if (act === 'view') return openView(kind, r.id);
  if (act === 'edit') return openForm(key, r);
  if (act === 'delete') return confirmBox('Delete ' + defOf(kind).label, 'Delete ' + r.code + '? Records that are referenced elsewhere cannot be deleted.', 'Delete', async () => { await api('/e/' + kind + '/' + r.id, 'DELETE'); toast('Deleted'); await reload(); });
  if (act === 'close' || act === 'reopen') return confirmBox((act === 'close' ? 'Close' : 'Reopen') + ' period ' + r.code, act === 'close' ? 'Vouchers can no longer be posted in a closed period. All vouchers in it must be approved or rejected first.' : 'Reopen this period for posting? Only possible while the accounting year is open.', act === 'close' ? 'Close period' : 'Reopen', async () => { await api('/e/period/' + r.id + '/' + act, 'POST'); toast('Period ' + (act === 'close' ? 'closed' : 'reopened')); await reload(); });
  if (['reject', 'request-cancel', 'cancel-reject'].includes(act)) return askReason(act === 'request-cancel' ? 'Request cancellation of ' + r.code : 'Reject ' + r.code, async reason => { await call(act, { reason }); });
  if (act.indexOf('cheque:') === 0) { const cs = act.slice(7); return confirmBox('Mark cheque ' + cs, 'Update the cheque status of ' + r.code + ' to ' + cs + '?', 'Update', async () => { await call('cheque-status', { chequeStatus:cs }); }); }
  return confirmBox('Confirm', act === 'cancel-approve' ? 'Approve cancellation of ' + r.code + '?' : 'Authorise ' + r.code + '? The maker cannot authorise their own entry.', 'Confirm', async () => { await call(act); });
}

// ---------- maker / author workflows (bills, settlements, knock-off) ----------
async function rWorkflow(body, it, t) {
  const author = it.role === 'author';
  let kind, fixed = {}, rowMode, allowNew = false, note;
  if (it.type === 'bill') { kind = 'bill'; fixed.type = it.billType; if (author) { fixed.status = 'Pending Author'; rowMode = 'author'; note = 'Authorise or reject bills captured by other makers. You cannot authorise your own entry.'; } else { allowNew = true; note = 'Capture ' + it.billType.toLowerCase() + ' bills. They become effective after an author authorises them.'; } }
  else if (it.type === 'billcancel') { kind = 'bill'; if (author) { fixed.status = 'Cancel Requested'; rowMode = 'cancel-author'; note = 'Approve or reject cancellation requests raised by makers.'; } else { fixed.status = 'Authorised'; rowMode = 'cancel-request'; note = 'Only authorised bills with no settlements can be cancelled. Cancellation needs author approval.'; } }
  else if (it.type === 'settle') { kind = 'settle'; fixed.kind = it.kind; if (author) { fixed.status = 'Pending Author'; rowMode = 'author'; note = 'Authorise or reject ' + it.kind.toLowerCase() + 's captured by other makers.'; } else { allowNew = true; note = 'Record a ' + it.kind.toLowerCase() + ' against an authorised bill.'; } }
  else if (it.type === 'chequestatus') { kind = 'settle'; fixed.mode = 'Cheque'; fixed.status = 'Authorised'; rowMode = 'cheque'; note = 'Update the clearing status of authorised cheque settlements. A bounced or cancelled cheque reverses the settlement on the bill.'; }
  else { kind = 'knockoff'; if (author) { fixed.status = 'Pending Author'; rowMode = 'author'; note = 'Authorise or reject knock-offs captured by other makers.'; } else { allowNew = true; note = 'Knock off a payable against a receivable.'; } }
  await entityList(body, kind, { key:'w:' + it.id, fixed, rowMode, allowNew, note }, t);
}

// ---------- vouchers ----------
const VT = () => (G.meta.enums && G.meta.enums.voucherTypes) || ['Journal'];
function newVoucher(mode, v) {
  G.v = { mode, editNo:v ? v.voucherNo : null, date:v ? v.date : nowDate(), type:v ? v.type : 'Journal', narration:v ? v.narration || '' : '', chequeNo:v ? v.chequeNo || '' : '', lines:v ? v.lines.map(l => ({ ledger:l.ledger, subLedger:l.subLedger || '', costCentre:l.costCentre || '', debit:l.debit || '', credit:l.credit || '', narration:l.narration || '' })) : [{ ledger:'', subLedger:'', costCentre:'', debit:'', credit:'', narration:'' }, { ledger:'', subLedger:'', costCentre:'', debit:'', credit:'', narration:'' }] };
}
function vTotals() {
  const v = G.v; let dr = 0, cr = 0;
  v.lines.forEach(l => { dr += paise(l.debit); cr += paise(l.credit); });
  return { dr, cr, diff:dr - cr };
}
function vTotalsHtml() {
  const t = vTotals();
  return 'Debit <b>' + fm(t.dr / 100) + '</b> &nbsp; Credit <b>' + fm(t.cr / 100) + '</b> &nbsp; <span class="gl-bal ' + (t.diff === 0 && t.dr > 0 ? 'good' : 'bad') + '">' + (t.diff === 0 ? (t.dr > 0 ? 'Balanced' : 'Enter amounts') : 'Difference ' + fm(Math.abs(t.diff) / 100)) + '</span>';
}
function drawVoucherForm(ledgers, subs, ccs) {
  const v = G.v, lim = v.mode === 'limited';
  const lines = v.lines.map((l, i) => '<tr><td>' + selectHtml('vl_ledger_' + i, ledgers, l.ledger, 'Ledger', 'data-vl="ledger" data-i="' + i + '"') + '</td><td>' + selectHtml('vl_sub_' + i, subs, l.subLedger, 'None', 'data-vl="subLedger" data-i="' + i + '"') + '</td><td>' + selectHtml('vl_cc_' + i, ccs, l.costCentre, 'None', 'data-vl="costCentre" data-i="' + i + '"') + '</td><td><input type="number" min="0" step="0.01" data-vl="debit" data-i="' + i + '" value="' + h(l.debit) + '" style="width:110px"></td><td><input type="number" min="0" step="0.01" data-vl="credit" data-i="' + i + '" value="' + h(l.credit) + '" style="width:110px"></td><td><input data-vl="narration" data-i="' + i + '" maxlength="120" value="' + h(l.narration) + '"></td><td><button class="filter-btn" data-gl="vdel" data-a="' + i + '"' + (v.lines.length <= 2 ? ' disabled' : '') + '>✕</button></td></tr>').join('');
  return '<div id="glVErr"></div><div class="gl-fields" style="margin-bottom:10px"><label class="field"><span>Voucher date *</span><input type="date" data-vh="date" value="' + h(v.date) + '"></label><label class="field"><span>Voucher type</span>' + selectHtml('vh_type', VT(), v.type, false, 'data-vh="type"') + '</label><label class="field"><span>Cheque / reference no</span><input data-vh="chequeNo" maxlength="30" value="' + h(v.chequeNo) + '"></label><label class="field"><span>Narration</span><input data-vh="narration" maxlength="200" value="' + h(v.narration) + '"></label></div><div class="table-wrap"><table data-nlt="1" style="min-width:900px"><thead><tr><th>Ledger *</th><th>Sub ledger</th><th>Cost centre</th><th>Debit</th><th>Credit</th><th>Narration</th><th></th></tr></thead><tbody>' + lines + '</tbody></table></div><div class="toolbar" style="margin-top:10px"><div><button class="filter-btn" data-gl="vadd">+ Add line</button></div><div id="vTot">' + vTotalsHtml() + '</div></div><div class="toolbar-group" style="margin-top:8px"><button class="primary-btn" id="vSubmit" data-gl="vsubmit">' + (v.editNo ? 'Resubmit ' + h(v.editNo) : 'Submit for approval') + '</button>' + (v.editNo ? '<button class="secondary-btn" data-gl="vcancel">Cancel edit</button>' : '') + '</div>' + (lim ? '<div class="notice info" style="margin-top:8px">Limited-ledger vouchers can only use ledgers flagged for limited posting.</div>' : '');
}
async function rVoucher(body, it, t) {
  const mode = it.mode;
  if (!can('maker')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Your role cannot create vouchers. You can still review vouchers below.</div><div id="glVList"></div>'; await voucherList(t, { mine:'' }, it); return; }
  const [ledgers, subs, ccs] = await Promise.all([opts('ledger', mode === 'limited' ? { limited:1 } : {}), opts('subledger'), opts('costcentre')]);
  if (!live(t)) return;
  if (!G.v || G.v.mode !== mode) newVoucher(mode);
  G.vOpts = { ledgers, subs, ccs };
  body.innerHTML = '<div id="glVForm">' + drawVoucherForm(ledgers, subs, ccs) + '</div><h4 style="margin:18px 0 8px">My vouchers</h4><div id="glVList">' + loading + '</div>';
  await voucherList(t, { mine:'1' }, it);
}
const VSTATE = {};
async function voucherList(t, extra, it) {
  const key = 'v:' + it.id, st = VSTATE[key] || (VSTATE[key] = { page:1, size:15, q:'', status:'' });
  Object.assign(st, extra || {}); st.it = it;
  const box = document.getElementById('glVList'); if (!box) return;
  let d;
  try { d = await api('/vouchers?' + qs({ page:st.page, size:st.size, q:st.q, status:st.status, mode:it.mode, mine:st.mine })); } catch (e) { if (live(t)) box.innerHTML = errBox(e); return; }
  if (!live(t)) return;
  st.total = d.total; st.rows = d.items; G.vkey = key;
  box.innerHTML = '<div class="toolbar"><div class="toolbar-group"><input class="compact-input" id="glVQ" placeholder="Search voucher / narration" value="' + h(st.q) + '">' + selectHtml('glVS', ['Pending','Approved','Rejected','Reversed'], st.status, 'All statuses') + '<button class="filter-btn" data-gl="vsearch" data-a="' + key + '">Search</button></div><button class="filter-btn" data-gl="vexport">Export CSV</button></div>' + vTable(d.items, key, 'maker') + pager(st, 'vpage');
}
function vTable(items, key, mode) {
  if (!items.length) return '<div class="notice info">No vouchers found.</div>';
  return '<div class="table-wrap"><table data-nlt="1"><thead><tr><th>Voucher</th><th>Date</th><th>Type</th><th>Narration</th><th class="gl-num">Amount</th><th>Maker</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + items.map((v, i) => '<tr><td>' + h(v.voucherNo) + '</td><td>' + h(v.date) + '</td><td>' + h(v.type) + '</td><td>' + h(v.narration || '') + '</td><td class="gl-num">' + fm(v.total) + '</td><td>' + h(v.createdByName || '') + '</td><td>' + badge(v.status) + '</td><td style="white-space:nowrap"><button class="filter-btn" data-gl="vview" data-a="' + h(v.voucherNo) + '">View</button> ' + vButtons(v, i, mode) + '</td></tr>').join('') + '</tbody></table></div>';
}
function vButtons(v, i, mode) {
  const mine = v.createdBy === G.meta.user.id;
  if (mode === 'maker') return mine && ['Pending','Rejected'].includes(v.status) && can('maker') ? '<button class="filter-btn" data-gl="vedit" data-a="' + h(v.voucherNo) + '">Edit</button>' : '';
  if (mode === 'approve') return can('checker') ? '<button class="primary-btn" data-gl="vapprove" data-a="' + h(v.voucherNo) + '"' + (mine ? ' disabled title="The maker cannot approve their own voucher"' : '') + '>Approve</button> <button class="danger-btn" data-gl="vreject" data-a="' + h(v.voucherNo) + '"' + (mine ? ' disabled' : '') + '>Reject</button>' : '';
  if (mode === 'reverse') return can('maker') && !v.reversedBy && !v.isClosing && !v.reversalOf ? '<button class="danger-btn" data-gl="vreverse" data-a="' + h(v.voucherNo) + '">Reverse</button>' : '';
  if (mode === 'cheque') return can('maker') ? '<button class="filter-btn" data-gl="vcheque" data-a="' + h(v.voucherNo) + '" data-b="' + h(v.chequeNo || '') + '">Edit cheque no</button>' : '';
  return '';
}
async function vSubmit() {
  const v = G.v, btn = document.getElementById('vSubmit');
  if (!btn || btn.disabled) return;
  const t = vTotals();
  const box = document.getElementById('glVErr');
  if (t.diff !== 0 || t.dr === 0) { box.innerHTML = '<div class="notice warn">Total debit must equal total credit and be greater than zero.</div>'; return; }
  btn.disabled = true; btn.textContent = 'Submitting…'; box.innerHTML = '';
  const payload = { mode:v.mode, date:v.date, type:v.type, narration:v.narration, chequeNo:v.chequeNo, lines:v.lines.filter(l => l.ledger || l.debit || l.credit).map(l => ({ ledger:l.ledger, subLedger:l.subLedger, costCentre:l.costCentre, debit:l.debit || 0, credit:l.credit || 0, narration:l.narration })) };
  try {
    const r = await api('/vouchers' + (v.editNo ? '/' + encodeURIComponent(v.editNo) : ''), v.editNo ? 'PUT' : 'POST', payload);
    toast('Voucher ' + r.voucherNo + ' submitted for approval');
    newVoucher(v.mode);
    renderItem();
  } catch (e) { box.innerHTML = errBox(e); btn.disabled = false; btn.textContent = v.editNo ? 'Resubmit ' + v.editNo : 'Submit for approval'; }
}

async function rApproval(body, it, t) {
  const key = 'v:' + it.id;
  VSTATE[key] = Object.assign(VSTATE[key] || { page:1, size:15, q:'' }, { status:VSTATE[key] && VSTATE[key].status || 'Pending' });
  body.innerHTML = '<div class="notice info">' + (can('checker') ? 'Review pending ' + (it.mode === 'limited' ? 'limited-ledger ' : '') + 'vouchers. You cannot approve vouchers you created.' : 'You can view pending vouchers but your role cannot approve them.') + '</div><div id="glVList">' + loading + '</div>';
  await approvalList(t, it);
}
async function approvalList(t, it) {
  const key = 'v:' + it.id, st = VSTATE[key]; st.it = it; G.vkey = key; st.kind = 'approve';
  const box = document.getElementById('glVList'); if (!box) return;
  let d;
  try { d = await api('/vouchers?' + qs({ page:st.page, size:st.size, q:st.q, status:st.status || 'Pending', mode:it.mode })); } catch (e) { if (live(t)) box.innerHTML = errBox(e); return; }
  if (!live(t)) return;
  st.total = d.total; st.rows = d.items;
  box.innerHTML = '<div class="toolbar"><div class="toolbar-group"><input class="compact-input" id="glVQ" placeholder="Search" value="' + h(st.q) + '">' + selectHtml('glVS', ['Pending','Approved','Rejected'], st.status || 'Pending', false) + '<button class="filter-btn" data-gl="vsearch" data-a="' + key + '">Search</button></div></div>' + vTable(d.items, key, st.status === 'Pending' || !st.status ? 'approve' : 'none') + pager(st, 'vpage');
}
async function rReversal(body, it, t) {
  const key = 'v:' + it.id;
  VSTATE[key] = Object.assign(VSTATE[key] || { page:1, size:15, q:'' }, { status:'Approved' });
  body.innerHTML = '<div class="notice info">Reversal creates a new voucher with opposite entries. It posts only after another user approves it. Closed periods cannot be reversed into.</div><div id="glVList">' + loading + '</div>';
  await reversalList(t, it);
}
async function reversalList(t, it) {
  const key = 'v:' + it.id, st = VSTATE[key]; st.it = it; G.vkey = key; st.kind = 'reverse';
  const box = document.getElementById('glVList'); if (!box) return;
  let d;
  try { d = await api('/vouchers?' + qs({ page:st.page, size:st.size, q:st.q, status:'Approved' })); } catch (e) { if (live(t)) box.innerHTML = errBox(e); return; }
  if (!live(t)) return;
  st.total = d.total; st.rows = d.items;
  box.innerHTML = '<div class="toolbar"><div class="toolbar-group"><input class="compact-input" id="glVQ" placeholder="Search voucher / narration" value="' + h(st.q) + '"><button class="filter-btn" data-gl="vsearch" data-a="' + key + '">Search</button></div></div>' + vTable(d.items, key, 'reverse') + pager(st, 'vpage');
}
async function rCheque(body, it, t) {
  const key = 'v:' + it.id;
  VSTATE[key] = Object.assign(VSTATE[key] || { page:1, size:15, q:'' }, {});
  body.innerHTML = '<div class="notice info">Search by cheque number, voucher number or narration. The cheque number of a posted voucher can be corrected; the correction is recorded in the voucher history.</div><div id="glVList">' + loading + '</div>';
  await chequeList(t, it);
}
async function chequeList(t, it) {
  const key = 'v:' + it.id, st = VSTATE[key]; st.it = it; G.vkey = key; st.kind = 'cheque';
  const box = document.getElementById('glVList'); if (!box) return;
  let d;
  try { d = await api('/vouchers?' + qs({ page:st.page, size:st.size, q:st.q, chequeNo:st.cheque })); } catch (e) { if (live(t)) box.innerHTML = errBox(e); return; }
  if (!live(t)) return;
  st.total = d.total; st.rows = d.items;
  box.innerHTML = '<div class="toolbar"><div class="toolbar-group"><input class="compact-input" id="glVQ" placeholder="Voucher / narration" value="' + h(st.q) + '"><input class="compact-input" id="glVC" placeholder="Cheque number" value="' + h(st.cheque || '') + '"><button class="filter-btn" data-gl="vsearch" data-a="' + key + '">Search</button></div></div>' + vTable(d.items, key, 'cheque') + pager(st, 'vpage');
}
async function vView(no) {
  let v; try { v = await api('/vouchers/' + encodeURIComponent(no)); } catch (e) { return fail(e); }
  const lines = '<div class="table-wrap"><table data-nlt="1" style="min-width:0"><thead><tr><th>Ledger</th><th>Sub ledger</th><th>Cost centre</th><th class="gl-num">Debit</th><th class="gl-num">Credit</th></tr></thead><tbody>' + v.lines.map(l => '<tr><td>' + h(l.ledger) + '</td><td>' + h(l.subLedger || '') + '</td><td>' + h(l.costCentre || '') + '</td><td class="gl-num">' + (l.debit ? fm(l.debit) : '') + '</td><td class="gl-num">' + (l.credit ? fm(l.credit) : '') + '</td></tr>').join('') + '</tbody></table></div>';
  showModal('Voucher ' + h(v.voucherNo), '<div class="gl-kv"><b>Status</b><span>' + badge(v.status) + '</span><b>Date</b><span>' + h(v.date) + '</span><b>Type</b><span>' + h(v.type) + '</span><b>Period / year</b><span>' + h(v.period) + ' / ' + h(v.year) + '</span><b>Narration</b><span>' + h(v.narration || '') + '</span><b>Cheque no</b><span>' + h(v.chequeNo || '') + '</span><b>Maker</b><span>' + h(v.createdByName || '') + '</span><b>Checker</b><span>' + h(v.checkedByName || '') + '</span>' + (v.reversalOf ? '<b>Reverses</b><span>' + h(v.reversalOf) + '</span>' : '') + (v.reversedBy ? '<b>Reversed by</b><span>' + h(v.reversedBy) + '</span>' : '') + '</div><h4 style="margin:12px 0 6px">Lines</h4>' + lines + '<h4 style="margin:12px 0 6px">Audit history</h4>' + historyHtml((v.history || []).slice().reverse()), '<button class="secondary-btn" onclick="closeModal()">Close</button>');
}

// ---------- year end ----------
async function rYearEnd(body, it, t) {
  if (!can('close')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Year-end processing is limited to roles authorised to close the books.</div>'; return; }
  const [years, ledgers] = await Promise.all([opts('year'), api('/e/ledger?' + qs({ size:100 }))]);
  if (!live(t)) return;
  const open = years.length ? years : [];
  const closing = (ledgers.items || []).filter(l => ['Equity', 'Liability'].includes(l.type) && l.status === 'Active').map(l => ({ code:l.code, label:l.code + ' — ' + l.name }));
  body.innerHTML = '<div class="notice info">Year end posts the net profit / loss to the closing ledger you select and closes the accounting year. All periods must be closed and no voucher may be pending. This cannot be undone.</div><div class="gl-fields" style="margin:10px 0"><label class="field"><span>Accounting year *</span>' + selectHtml('yeYear', open, '', 'Select year') + '</label><label class="field"><span>Closing ledger (Equity / Liability) *</span>' + selectHtml('yeLedger', closing, '', 'Select ledger') + '</label></div><div class="toolbar-group"><button class="filter-btn" data-gl="yepreview">Preview</button></div><div id="yeOut" style="margin-top:12px"></div>';
}
async function yePreview() {
  const y = document.getElementById('yeYear').value, out = document.getElementById('yeOut');
  if (!y) { out.innerHTML = '<div class="notice warn">Select an accounting year.</div>'; return; }
  out.innerHTML = loading;
  try {
    const p = await api('/year-end/preview?' + qs({ year:y }));
    G.ye = p;
    out.innerHTML = '<div class="gl-kv"><b>Year</b><span>' + h(p.year) + ' (' + h(p.start) + ' to ' + h(p.end) + ')</span><b>Net profit / (loss)</b><span>' + fm(p.netProfit) + '</span></div>' + (p.lines && p.lines.length ? '<div class="table-wrap" style="margin-top:8px"><table data-nlt="1" style="min-width:0"><thead><tr>' + Object.keys(p.lines[0]).filter(k => typeof p.lines[0][k] !== 'object').map(k => '<th>' + h(k) + '</th>').join('') + '</tr></thead><tbody>' + p.lines.map(l => '<tr>' + Object.keys(p.lines[0]).filter(k => typeof p.lines[0][k] !== 'object').map(k => '<td>' + (typeof l[k] === 'number' ? '<span class="gl-num">' + fm(l[k]) + '</span>' : h(l[k])) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' : '') + (p.blockers && p.blockers.length ? '<div class="notice warn" style="margin-top:8px"><b>Cannot run year end yet</b><ul style="margin:6px 0 0 16px">' + p.blockers.map(b => '<li>' + h(b) + '</li>').join('') + '</ul></div>' : '<div class="notice success" style="margin-top:8px">Ready to run.</div><label style="display:flex;gap:6px;margin:10px 0"><input type="checkbox" id="yeConfirm"> I confirm closing year ' + h(p.year) + ' permanently</label><button class="danger-btn" id="yeRun" data-gl="yerun">Run year end</button>');
  } catch (e) { out.innerHTML = errBox(e); }
}
async function yeRun() {
  const btn = document.getElementById('yeRun'), out = document.getElementById('yeOut');
  const led = document.getElementById('yeLedger').value;
  if (!led) { out.insertAdjacentHTML('afterbegin', '<div class="notice warn">Select the closing ledger.</div>'); return; }
  if (!document.getElementById('yeConfirm').checked) { out.insertAdjacentHTML('afterbegin', '<div class="notice warn">Tick the confirmation box to proceed.</div>'); return; }
  btn.disabled = true;
  try { const r = await api('/year-end', 'POST', { year:G.ye.year, closingLedger:led, confirm:true }); dropOpts(); toast('Year end completed'); out.innerHTML = '<div class="notice success">Year ' + h(G.ye.year) + ' is closed. Closing voucher ' + h(r.voucherNo || r.closingVoucher || '') + ' posted.</div>'; }
  catch (e) { btn.disabled = false; out.insertAdjacentHTML('afterbegin', errBox(e)); }
}

// ---------- uploads ----------
function readFile(input, target) {
  const f = input.files && input.files[0]; if (!f) return;
  if (f.size > 2 * 1024 * 1024) { toast('File is too large (max 2 MB)'); input.value = ''; return; }
  const r = new FileReader(); r.onload = () => { document.getElementById(target).value = String(r.result || ''); }; r.readAsText(f);
}
function uploadBox(opts2) {
  return '<div class="notice info">' + opts2.note + '</div>' + (opts2.extra || '') + '<label class="field" style="margin-top:8px"><span>CSV file</span><input type="file" accept=".csv,text/csv" data-gl-file="glText"></label><label class="field"><span>or paste CSV</span><textarea id="glText" rows="7" style="width:100%;font-family:monospace" placeholder="' + h(opts2.sample) + '"></textarea></label><div class="toolbar-group" style="margin-top:8px"><button class="primary-btn" id="glUp" data-gl="upload" data-a="' + opts2.id + '">' + (opts2.label || 'Upload') + '</button><button class="filter-btn" data-gl="sample" data-a="' + opts2.id + '">Download template</button></div><div id="glUpOut" style="margin-top:10px"></div>';
}
const UPLOADS = {
  voucher:{ sample:'voucherRef,date,ledger,debit,credit,type,narration\nV1,2025-04-10,CASH,1000,0,Journal,Opening\nV1,2025-04-10,CAPITAL,0,1000,Journal,Opening', path:() => '/vouchers/upload', body:(txt, el) => ({ text:txt, mode:el('upMode') ? el('upMode').value : 'general' }), done:r => r.created + ' voucher(s) created for approval: ' + (r.vouchers || []).join(', ') },
  rcm:{ sample:'billNo,party,head,billDate,dueDate,amount,type,remarks\nINV-1,P001,H001,2025-04-10,2025-05-10,10000,Payable,RCM invoice', path:() => '/bills/upload', body:txt => ({ text:txt }), done:r => r.created + ' RCM bill(s) created for author approval' },
  stmt:{ sample:'date,description,chequeNo,debit,credit\n2025-04-10,NEFT credit,,0,5000', path:el => '/recon/upload/' + el('upKind').value, body:(txt, el) => ({ bank:el('upBank').value, text:txt }), done:r => r.created + ' line(s) imported, ' + r.skipped + ' duplicate(s) skipped' },
  recon:{ sample:'statement,reference,source\nBS-1,V-1:lineId,book', path:() => '/recon/upload-match', body:txt => ({ text:txt }), done:r => r.matched + ' pair(s) matched' + ((r.failed && r.failed.length) ? ', ' + r.failed.length + ' failed' : '') },
};
async function doUpload(id) {
  const U = UPLOADS[id], out = document.getElementById('glUpOut'), btn = document.getElementById('glUp');
  const el = x => document.getElementById(x);
  const txt = el('glText').value;
  if (!txt.trim()) { out.innerHTML = '<div class="notice warn">Choose a CSV file or paste CSV content.</div>'; return; }
  if (id === 'stmt' && !el('upBank').value) { out.innerHTML = '<div class="notice warn">Select the bank ledger.</div>'; return; }
  btn.disabled = true; out.innerHTML = loading;
  try { const r = await api(U.path(el), 'POST', U.body(txt, el)); out.innerHTML = '<div class="notice success">' + h(U.done(r)) + '</div>' + (r.failed && r.failed.length ? errBox({ message:'Some rows were not matched', errors:r.failed.map(x => ({ row:x.statement || x.row, message:x.message || x.reason || 'failed' })) }) : ''); dropOpts(); }
  catch (e) { out.innerHTML = errBox(e); }
  btn.disabled = false;
}
function rVUpload(body, it) {
  if (!can('maker')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Your role cannot create vouchers.</div>'; return; }
  body.innerHTML = uploadBox({ id:'voucher', note:'Required columns: voucherRef, date, ledger, debit, credit. Optional: type, narration, chequeNo, costCentre, lineNarration. Rows with the same voucherRef form one voucher. The whole file is rejected if any voucher is unbalanced or invalid.', sample:UPLOADS.voucher.sample, extra:'<label class="field"><span>Voucher mode</span><select id="upMode"><option value="general">General</option><option value="limited">Limited ledger</option></select></label>', label:'Upload vouchers' });
}
function rRcm(body) {
  if (!can('maker')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Your role cannot capture bills.</div>'; return; }
  body.innerHTML = uploadBox({ id:'rcm', note:'Required columns: billNo, party, head, billDate, dueDate, amount. Optional: type (Payable/Receivable), remarks. Bills are created as RCM bills pending author approval. The whole file is rejected if any row is invalid.', sample:UPLOADS.rcm.sample, label:'Upload RCM bills' });
}
async function rStmtUpload(body, it, t) {
  if (!can('maker')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Your role cannot upload bank data.</div>'; return; }
  const banks = await opts('ledger', { bank:1 });
  if (!live(t)) return;
  body.innerHTML = uploadBox({ id:'stmt', note:'Statement columns: date, description, chequeNo, debit (withdrawal), credit (deposit). Tally entry columns: date, voucherRef, chequeNo, debit, credit. Duplicate lines are skipped.', sample:UPLOADS.stmt.sample, extra:'<div class="gl-fields"><label class="field"><span>Bank ledger *</span>' + selectHtml('upBank', banks, '', 'Select bank') + '</label><label class="field"><span>Data type</span><select id="upKind"><option value="bankstmt">Bank statement</option><option value="tallyentry">Tally entries</option></select></label></div>', label:'Upload' });
}
function rReconUpload(body) {
  if (!can('maker')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Your role cannot reconcile.</div>'; return; }
  body.innerHTML = uploadBox({ id:'recon', note:'Columns: statement (statement line ref), reference (book line ref from Manual Reconcile, or Tally entry ref), optional source (book / tally). Amounts must match exactly.', sample:UPLOADS.recon.sample, label:'Upload reconciliation' });
}

// ---------- reports ----------
const REP = {
  tb:[['asOf','date','As of date']],
  ledger:[['ledger','ref:ledger','Ledger *'],['from','date','From'],['to','date','To']],
  cashbook:[['kind','sel:cash|bank','Book'],['ledger','ref:ledger','Ledger'],['from','date','From'],['to','date','To']],
  daybook:[['from','date','From'],['to','date','To'],['status','sel:Pending|Approved|Rejected|Reversed','Status'],['type','sel:Journal|Payment|Receipt|Contra|Adjustment','Type']],
  dump:[['dataset','dataset','Dataset'],['from','date','From'],['to','date','To']],
  pl:[['from','date','From'],['to','date','To']],
  bs:[['asOf','date','As of date']],
  bills:[['type','sel:Payable|Receivable','Type'],['party','ref:party','Party'],['status','sel:Pending Author|Authorised|Rejected|Cancel Requested|Cancelled','Status'],['from','date','From'],['to','date','To']],
  ageing:[['asOf','date','As of date'],['type','sel:Payable|Receivable','Type'],['party','ref:party','Party']],
  partydetails:[], partyexpense:[['from','date','From'],['to','date','To']],
  fadep:[['asset','ref:faasset','Asset'],['period','text','Period']],
  faregister:[], fadisposal:[['from','date','From'],['to','date','To']],
  famovement:[['asset','ref:faasset','Asset'],['from','date','From'],['to','date','To']],
  bankstmt:[['bank','ref:bank','Bank *'],['status','sel:Matched|Unmatched','Status'],['from','date','From'],['to','date','To'],['chequeNo','text','Cheque no']],
  stmtreport:[['bank','ref:bank','Bank'],['from','date','From'],['to','date','To']],
  bankrecon:[['bank','ref:bank','Bank'],['asOf','date','As of date']],
  brs:[['bank','ref:bank','Bank *'],['asOf','date','As of date'],['stmtBalance','number','Bank statement balance']],
};
const REPFULL = ['tb','ledger','pl','bs','brs'];
async function rReport(body, it, t) {
  const name = it.report, params = REP[name] || [];
  const st = listState('r:' + it.id, { size:100 });
  const fields = [];
  for (const p of params) {
    let ctl; const id = 'rp_' + p[0], val = st.filters[p[0]] || '';
    const k = p[1];
    if (k === 'date') ctl = '<input type="date" id="' + id + '" value="' + h(val) + '">';
    else if (k === 'text') ctl = '<input id="' + id + '" value="' + h(val) + '">';
    else if (k === 'number') ctl = '<input type="number" step="0.01" id="' + id + '" value="' + h(val) + '">';
    else if (k.indexOf('sel:') === 0) ctl = selectHtml(id, k.slice(4).split('|'), val, 'All');
    else if (k === 'dataset') ctl = selectHtml(id, ['vouchers','audit'].concat(Object.keys(G.meta.entities)), val || 'vouchers', false);
    else if (k === 'ref:bank') ctl = selectHtml(id, await opts('ledger', { bank:1 }), val, 'Select bank');
    else if (k === 'ref:faasset') ctl = selectHtml(id, await opts('faasset', { all:1 }), val, 'All assets');
    else ctl = selectHtml(id, await opts(k.slice(4), {}), val, 'Select');
    fields.push('<label class="field"><span>' + h(p[2]) + '</span>' + ctl + '</label>');
  }
  if (!live(t)) return;
  body.innerHTML = (fields.length ? '<div class="gl-fields" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-bottom:10px">' + fields.join('') + '</div>' : '') + '<div class="toolbar-group" style="margin-bottom:10px"><button class="primary-btn" data-gl="reprun" data-a="' + h(it.id) + '">' + (fields.length ? 'Run report' : 'Refresh') + '</button><button class="filter-btn" data-gl="repcsv" data-a="' + h(it.id) + '">Export CSV</button></div><div id="repOut">' + loading + '</div>';
  st.name = name; st.params = params;
  await runReport(it.id, t, 1);
}
function repQuery(it, page) {
  const st = G.ls['r:' + it.id], q = { page:page || 1, size:st.size };
  (REP[it.report] || []).forEach(p => { const el = document.getElementById('rp_' + p[0]); if (el) { q[p[0]] = el.value; st.filters[p[0]] = el.value; } });
  return q;
}
async function runReport(itemId, t, page) {
  const it = findItem(itemId), st = G.ls['r:' + itemId], out = document.getElementById('repOut');
  if (!out) return;
  const q = repQuery(it, page);
  out.innerHTML = loading;
  let r;
  try { r = await api('/reports/' + it.report + '?' + qs(q)); } catch (e) { if (live(t || G.tok)) out.innerHTML = errBox(e); return; }
  if (!live(t || G.tok)) return;
  st.page = r.page; st.total = r.total; st.size = r.size;
  const cols = r.columns || [];
  const cellv = (c, v) => v == null || v === '' ? '' : (c.t === 'money' ? fm(v) : h(v));
  const rows = (r.rows || []).map(x => '<tr class="' + (x.kind === 'head' ? 'gl-head' : x.kind === 'total' ? 'gl-total' : '') + '">' + cols.map(c => '<td' + (c.t === 'money' ? ' class="gl-num"' : '') + '>' + cellv(c, x[c.k]) + '</td>').join('') + '</tr>').join('');
  const tot = r.totals ? '<tr class="gl-total">' + cols.map(c => '<td' + (c.t === 'money' ? ' class="gl-num"' : '') + '>' + cellv(c, r.totals[c.k]) + '</td>').join('') + '</tr>' : '';
  const sum = r.summary ? '<div class="gl-kv" style="margin:10px 0">' + Object.keys(r.summary).map(k => '<b>' + h(k) + '</b><span>' + (typeof r.summary[k] === 'number' ? fm(r.summary[k]) : h(r.summary[k])) + '</span>').join('') + '</div>' : '';
  const notes = (r.notes || []).map(n => '<div class="notice warn" style="margin:8px 0">' + h(n) + '</div>').join('');
  out.innerHTML = '<h4 style="margin:6px 0">' + h(r.title) + '</h4>' + notes + ((r.rows || []).length || r.totals ? '<div class="table-wrap"><table data-nlt="1"><thead><tr>' + cols.map(c => '<th' + (c.t === 'money' ? ' class="gl-num"' : '') + '>' + h(c.l) + '</th>').join('') + '</tr></thead><tbody>' + rows + tot + '</tbody></table></div>' : '<div class="notice info">No data for the selected criteria.</div>') + sum + (r.total > r.size ? pager(st, 'reppage') : '');
}

// ---------- depreciation ----------
async function rDepreciation(body, it, t) {
  if (!can('maker')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Your role cannot run depreciation.</div>'; return; }
  const periods = await opts('period', { open:1 });
  if (!live(t)) return;
  body.innerHTML = '<div class="notice info">Calculates monthly depreciation for all active assets for the chosen open period and creates pending vouchers for approval. Running it twice for the same period does not duplicate entries.</div><div class="gl-fields" style="margin:10px 0"><label class="field"><span>Accounting period *</span>' + selectHtml('depPeriod', periods, '', 'Select period') + '</label></div><button class="primary-btn" id="depGo" data-gl="deprun">Run depreciation</button><div id="depOut" style="margin-top:10px"></div>';
}
async function depRun() {
  const p = document.getElementById('depPeriod').value, out = document.getElementById('depOut'), b = document.getElementById('depGo');
  if (!p) { out.innerHTML = '<div class="notice warn">Select a period.</div>'; return; }
  b.disabled = true; out.innerHTML = loading;
  try { const r = await api('/depreciation', 'POST', { period:p }); out.innerHTML = '<div class="notice success">' + r.created + ' asset(s) depreciated, ' + r.skipped + ' already processed for ' + h(r.period) + '. Vouchers: ' + h((r.vouchers || []).join(', ') || 'none') + '</div>' + (r.unposted ? '<div class="notice warn">' + h(r.unposted) + '</div>' : ''); }
  catch (e) { out.innerHTML = errBox(e); }
  b.disabled = false;
}

// ---------- AR / AP download ----------
async function rApDownload(body, it, t) {
  const parties = await opts('party');
  if (!live(t)) return;
  body.innerHTML = '<div class="notice info">Download receivable / payable bills as CSV for the selected filters.</div><div class="gl-fields" style="margin:10px 0"><label class="field"><span>Type</span>' + selectHtml('dlType', ['Payable','Receivable'], '', 'Both') + '</label><label class="field"><span>Party</span>' + selectHtml('dlParty', parties, '', 'All parties') + '</label><label class="field"><span>Status</span>' + selectHtml('dlStatus', ['Pending Author','Authorised','Rejected','Cancel Requested','Cancelled'], '', 'All statuses') + '</label><label class="field"><span>From bill date</span><input type="date" id="dlFrom"></label><label class="field"><span>To bill date</span><input type="date" id="dlTo"></label></div><button class="primary-btn" data-gl="apdl">Download CSV</button>';
}

// ---------- bank reconciliation ----------
async function rAuto(body, it, t) {
  if (!can('maker')) { body.innerHTML = '<div class="notice warn"><b>Access Restricted</b><br>Your role cannot reconcile.</div>'; return; }
  const banks = await opts('ledger', { bank:1 });
  if (!live(t)) return;
  body.innerHTML = '<div class="notice info">Matches unmatched statement lines to book entries by cheque number, or by exact amount and date within the tolerance. Ambiguous lines are left for manual reconciliation.</div><div class="gl-fields" style="margin:10px 0"><label class="field"><span>Bank ledger *</span>' + selectHtml('arBank', banks, '', 'Select bank') + '</label><label class="field"><span>Date tolerance (days)</span><input type="number" id="arTol" min="0" max="30" value="3"></label></div><button class="primary-btn" id="arGo" data-gl="autorun">Run auto reconcile</button><div id="arOut" style="margin-top:10px"></div>';
}
async function autoRun() {
  const b = document.getElementById('arBank').value, out = document.getElementById('arOut');
  if (!b) { out.innerHTML = '<div class="notice warn">Select a bank ledger.</div>'; return; }
  const btn = document.getElementById('arGo'); btn.disabled = true; out.innerHTML = loading;
  try { const r = await api('/recon/auto', 'POST', { bank:b, toleranceDays:Number(document.getElementById('arTol').value) }); out.innerHTML = '<div class="notice success">Considered ' + r.considered + ' line(s): ' + r.matched + ' matched, ' + r.ambiguous + ' ambiguous, ' + r.unmatched + ' without a match.</div>'; }
  catch (e) { out.innerHTML = errBox(e); }
  btn.disabled = false;
}
async function rManual(body, it, t) {
  const banks = await opts('ledger', { bank:1 });
  if (!live(t)) return;
  G.mr = { bank:'', source:'book', stmt:null, ref:null };
  body.innerHTML = '<div class="notice info">Select one statement line and one book / tally entry of the same amount, then match them.</div><div class="gl-fields" style="margin:10px 0"><label class="field"><span>Bank ledger *</span>' + selectHtml('mrBank', banks, '', 'Select bank') + '</label><label class="field"><span>Match against</span><select id="mrSrc"><option value="book">Book (vouchers)</option><option value="tally">Tally entries</option></select></label></div><button class="filter-btn" data-gl="mrload">Load</button><div id="mrOut" style="margin-top:10px"></div>';
}
async function mrLoad() {
  const out = document.getElementById('mrOut'), bank = document.getElementById('mrBank').value, source = document.getElementById('mrSrc').value;
  if (!bank) { out.innerHTML = '<div class="notice warn">Select a bank ledger.</div>'; return; }
  G.mr.bank = bank; G.mr.source = source; G.mr.stmt = null; G.mr.ref = null;
  out.innerHTML = loading;
  try {
    const d = await api('/recon/lists?' + qs({ bank, source }));
    G.mr.data = d;
    const un = d.statements.filter(s => s.status === 'Unmatched'), ma = d.statements.filter(s => s.status === 'Matched');
    const ents = d.entries || [];
    out.innerHTML = '<div id="mrMsg"></div><div class="gl-split"><div><h4>Unmatched statement lines (' + un.length + ')</h4>' + (un.length ? '<div class="table-wrap"><table data-nlt="1" style="min-width:0"><thead><tr><th>Date</th><th>Description</th><th class="gl-num">Wdl</th><th class="gl-num">Dep</th></tr></thead><tbody>' + un.map(s => '<tr class="gl-pick" data-gl="mrpick" data-a="s" data-b="' + h(s.code) + '"><td>' + h(s.date) + '</td><td>' + h(s.description || s.chequeNo || s.code) + '</td><td class="gl-num">' + (s.debit ? fm(s.debit) : '') + '</td><td class="gl-num">' + (s.credit ? fm(s.credit) : '') + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="notice info">Nothing to reconcile.</div>') + '</div><div><h4>' + (source === 'book' ? 'Unreconciled book entries' : 'Unmatched tally entries') + ' (' + ents.length + ')</h4>' + (ents.length ? '<div class="table-wrap"><table data-nlt="1" style="min-width:0"><thead><tr><th>Date</th><th>Ref</th><th class="gl-num">Debit</th><th class="gl-num">Credit</th></tr></thead><tbody>' + ents.map(e => '<tr class="gl-pick" data-gl="mrpick" data-a="e" data-b="' + h(e.ref) + '"><td>' + h(e.date) + '</td><td>' + h(e.voucherNo || e.ref) + (e.chequeNo ? ' / ' + h(e.chequeNo) : '') + '</td><td class="gl-num">' + (e.debit ? fm(e.debit) : '') + '</td><td class="gl-num">' + (e.credit ? fm(e.credit) : '') + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="notice info">No entries available.</div>') + '</div></div>' + (can('maker') ? '<div class="toolbar-group" style="margin:10px 0"><button class="primary-btn" id="mrMatch" data-gl="mrmatch">Match selected</button></div>' : '<div class="notice warn" style="margin:10px 0">Your role can view but not reconcile.</div>') + '<h4>Matched lines (' + ma.length + ')</h4>' + (ma.length ? '<div class="table-wrap"><table data-nlt="1" style="min-width:0"><thead><tr><th>Line</th><th>Date</th><th>Matched to</th><th></th></tr></thead><tbody>' + ma.map(s => '<tr><td>' + h(s.code) + '</td><td>' + h(s.date) + '</td><td>' + h(s.matchRef || '') + '</td><td>' + (can('maker') ? '<button class="danger-btn" data-gl="mrunmatch" data-a="' + h(s.code) + '">Unmatch</button>' : '') + '</td></tr>').join('') + '</tbody></table></div>' : '<div class="notice info">No matched lines yet.</div>');
  } catch (e) { out.innerHTML = errBox(e); }
}

// ---------- events ----------
function vReload() {
  const st = VSTATE[G.vkey]; if (!st) return;
  const t = G.tok, it = st.it;
  if (st.kind === 'approve') return approvalList(t, it);
  if (st.kind === 'reverse') return reversalList(t, it);
  if (st.kind === 'cheque') return chequeList(t, it);
  return voucherList(t, {}, it);
}
async function vAction(no, kindAct) {
  const done = async m => { toast(m); dropOpts(); await vReload(); };
  if (kindAct === 'approve') return confirmBox('Approve ' + no, 'Post voucher ' + no + ' to the ledgers? The maker cannot approve their own voucher.', 'Approve', async () => { await api('/vouchers/' + encodeURIComponent(no) + '/approve', 'POST'); await done('Voucher approved'); });
  if (kindAct === 'reject') return askReason('Reject ' + no, async reason => { await api('/vouchers/' + encodeURIComponent(no) + '/reject', 'POST', { reason }); await done('Voucher rejected'); });
  if (kindAct === 'reverse') {
    showModal('Reverse ' + no, '<div id="glRvErr"></div><div class="gl-fields"><label class="field"><span>Reversal date *</span><input type="date" id="rvDate" value="' + nowDate() + '"></label><label class="field"><span>Reason *</span><input id="rvReason" maxlength="200"></label></div>', '<button class="secondary-btn" onclick="closeModal()">Cancel</button><button class="danger-btn" id="rvGo">Create reversal</button>');
    document.getElementById('rvGo').onclick = async () => {
      const reason = document.getElementById('rvReason').value.trim(), date = document.getElementById('rvDate').value;
      if (!reason) { document.getElementById('glRvErr').innerHTML = '<div class="notice warn">A reason is required.</div>'; return; }
      const b = document.getElementById('rvGo'); b.disabled = true;
      try { const r = await api('/vouchers/' + encodeURIComponent(no) + '/reverse', 'POST', { reason, date }); closeModal(); await done('Reversal ' + r.voucherNo + ' created, pending approval'); }
      catch (e) { b.disabled = false; document.getElementById('glRvErr').innerHTML = errBox(e); }
    };
  }
}
function vCheque(no, cur) {
  showModal('Edit cheque number — ' + no, '<div id="glChErr"></div><label class="field"><span>Cheque number *</span><input id="chNo" maxlength="30" value="' + h(cur) + '"></label>', '<button class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" id="chGo">Save</button>');
  document.getElementById('chGo').onclick = async () => {
    const v = document.getElementById('chNo').value.trim();
    if (!v) { document.getElementById('glChErr').innerHTML = '<div class="notice warn">Enter the cheque number.</div>'; return; }
    const b = document.getElementById('chGo'); b.disabled = true;
    try { await api('/vouchers/' + encodeURIComponent(no) + '/cheque', 'POST', { chequeNo:v }); closeModal(); toast('Cheque number updated'); await vReload(); }
    catch (e) { b.disabled = false; document.getElementById('glChErr').innerHTML = errBox(e); }
  };
}
function sampleCsv(id) {
  const U = UPLOADS[id], blob = new Blob([U.sample + '\n'], { type:'text/csv' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'gl-' + id + '-template.csv'; document.body.appendChild(a); a.click(); a.remove();
}
const ACT = {
  grp(el) { const g = el.dataset.a; G.openGroups[g] = !G.openGroups[g]; drawShell(); renderItem(); },
  navtoggle(el) { el.closest('.gl-nav').classList.toggle('collapsed'); },
  go(el) { G.item = findItem(el.dataset.a); drawShell(); renderItem(); if (window.innerWidth <= 900) window.scrollTo({ top:0 }); },
  elsearch(el) {
    const st = G.ls[el.dataset.a]; st.q = document.getElementById('glQ').value.trim(); st.page = 1; st.filters = {};
    const s = document.getElementById('glStatus'); if (s && s.value) st.filters.status = s.value;
    (st.filterFields || []).forEach(f => { const x = document.getElementById('glF_' + f.n); if (x && x.value) st.filters[f.n] = x.value; });
    const a = document.getElementById('glFrom'), b = document.getElementById('glTo'); st.from = a ? a.value : ''; st.to = b ? b.value : '';
    loadList(el.dataset.a);
  },
  elreset(el) { const st = G.ls[el.dataset.a]; Object.assign(st, { q:'', page:1, filters:{}, from:'', to:'' }); renderItem(); },
  elpage(el) { const st = G.ls[G.curKey]; st.page = Number(el.dataset.a); loadList(G.curKey); },
  elexport(el) { const st = G.ls[el.dataset.a]; const q = listQuery(st); delete q.page; delete q.size; download('/e/' + st.kind + '/export.csv?' + qs(q), 'gl-' + st.kind + '.csv').catch(fail); },
  elnew(el) { openForm(el.dataset.a, null); },
  rowact(el) { G.curKey = el.dataset.a; doRowAction(el.dataset.a, Number(el.dataset.b), el.dataset.c).catch(fail); },
  save() { saveForm(); },
  vadd() { G.v.lines.push({ ledger:'', subLedger:'', costCentre:'', debit:'', credit:'', narration:'' }); redrawV(); },
  vdel(el) { G.v.lines.splice(Number(el.dataset.a), 1); redrawV(); },
  vsubmit() { vSubmit(); },
  vcancel() { newVoucher(G.item.mode); renderItem(); },
  vsearch(el) {
    const st = VSTATE[el.dataset.a], q = document.getElementById('glVQ'), s = document.getElementById('glVS'), c = document.getElementById('glVC');
    st.q = q ? q.value.trim() : ''; if (s) st.status = s.value; if (c) st.cheque = c.value.trim(); st.page = 1; vReload();
  },
  vpage(el) { VSTATE[G.vkey].page = Number(el.dataset.a); vReload(); },
  vexport() { const st = VSTATE[G.vkey]; download('/vouchers/export.csv?' + qs({ q:st.q, status:st.status, mode:st.it.mode, mine:st.mine }), 'gl-vouchers.csv').catch(fail); },
  vview(el) { vView(el.dataset.a); },
  vedit(el) { api('/vouchers/' + encodeURIComponent(el.dataset.a)).then(v => { newVoucher(v.mode, v); renderItem(); window.scrollTo({ top:0 }); }).catch(fail); },
  vapprove(el) { vAction(el.dataset.a, 'approve'); },
  vreject(el) { vAction(el.dataset.a, 'reject'); },
  vreverse(el) { vAction(el.dataset.a, 'reverse'); },
  vcheque(el) { vCheque(el.dataset.a, el.dataset.b); },
  yepreview() { yePreview(); },
  yerun() { yeRun(); },
  upload(el) { doUpload(el.dataset.a); },
  sample(el) { sampleCsv(el.dataset.a); },
  reprun(el) { runReport(el.dataset.a, G.tok, 1); },
  reppage(el) { runReport(G.item.id, G.tok, Number(el.dataset.a)); },
  repcsv(el) { const it = findItem(el.dataset.a), q = repQuery(it, 1); delete q.page; delete q.size; q.format = 'csv'; download('/reports/' + it.report + '?' + qs(q), 'gl-' + it.report + '.csv').catch(fail); },
  deprun() { depRun(); },
  apdl() { const g = x => document.getElementById(x).value; download('/reports/bills?' + qs({ type:g('dlType'), party:g('dlParty'), status:g('dlStatus'), from:g('dlFrom'), to:g('dlTo'), format:'csv' }), 'ar-ap-bills.csv').catch(fail); },
  autorun() { autoRun(); },
  mrload() { mrLoad(); },
  mrpick(el) {
    const side = el.dataset.a; G.mr[side === 's' ? 'stmt' : 'ref'] = el.dataset.b;
    el.closest('tbody').querySelectorAll('.gl-pick').forEach(r => r.classList.remove('sel')); el.classList.add('sel');
  },
  async mrmatch() {
    const m = document.getElementById('mrMsg'), b = document.getElementById('mrMatch');
    if (!G.mr.stmt || !G.mr.ref) { m.innerHTML = '<div class="notice warn">Select one statement line and one entry.</div>'; return; }
    b.disabled = true;
    try { await api('/recon/match', 'POST', { statement:G.mr.stmt, source:G.mr.source, reference:G.mr.ref }); toast('Matched'); await mrLoad(); }
    catch (e) { m.innerHTML = errBox(e); b.disabled = false; }
  },
  async mrunmatch(el) { try { await api('/recon/unmatch', 'POST', { statement:el.dataset.a }); toast('Unmatched'); await mrLoad(); } catch (e) { fail(e); } },
};
function redrawV() { const f = document.getElementById('glVForm'); if (f) f.innerHTML = drawVoucherForm(G.vOpts.ledgers, G.vOpts.subs, G.vOpts.ccs); }
document.addEventListener('click', e => {
  const el = e.target.closest && e.target.closest('[data-gl]');
  if (!el || !G.item || !document.getElementById('glMain') && !document.querySelector('#modalRoot .modal')) return;
  if (el.disabled) return;
  const fn = ACT[el.dataset.gl];
  if (fn) { if (el.dataset.gl === 'elpage') G.curKey = G.curKey || 'e:' + G.item.id; try { const r = fn(el); if (r && r.catch) r.catch(fail); } catch (x) { fail(x); } }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.vl && G.v) { G.v.lines[Number(el.dataset.i)][el.dataset.vl] = el.value; const tot = document.getElementById('vTot'); if (tot) tot.innerHTML = vTotalsHtml(); }
  else if (el.dataset && el.dataset.vh && G.v) G.v[el.dataset.vh] = el.value;
  else if (el.dataset && el.dataset.glFile) readFile(el, el.dataset.glFile);
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.vl && G.v) { G.v.lines[Number(el.dataset.i)][el.dataset.vl] = el.value; const tot = document.getElementById('vTot'); if (tot) tot.innerHTML = vTotalsHtml(); }
  else if (el.dataset && el.dataset.vh && G.v) G.v[el.dataset.vh] = el.value;
  else if (el.dataset && el.dataset.glFile !== undefined) readFile(el, el.dataset.glFile);
});

// ---------- navigation ----------
window.nfOpenGeneralLedger = () => navTo('generalLedger');
const baseNav = navTo;
navTo = function (view, arg) {
  if (view !== 'generalLedger') return baseNav.apply(this, arguments);
  baseNav.apply(this, arguments);
  if (typeof roleCanView === 'function' && !roleCanView(view)) return;
  openGL(typeof arg === 'string' ? arg : null);
};
})();</script>`;
}
