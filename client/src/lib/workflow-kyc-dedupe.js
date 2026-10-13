// KYC & Dedupe workbench: deterministic demo checks against browser-local case records. Not a live PAN/Aadhaar/CKYC integration.
export const workflowKycDedupeScript = String.raw`<script>
(() => {
  const KEY = 'namdev-kyc-dedupe';
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  let store = {}; try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  const can = a => { if (currentUser.role === 'CEO') return a === 'view' || a === 'export'; const p = window.nfCan; if (!p) return true; const pub = (JSON.parse(localStorage.getItem('namdev-access-config') || '{}').published || {})[currentUser.role]; return !pub || !pub.actions || pub.actions[a] === undefined ? true : !!pub.actions[a]; };
  const REGION_DEFAULT = { 'Jaipur - VKI':'Jaipur Region','Jaipur - Sanganer':'Jaipur Region','Ajmer Road':'Jaipur Region','Sikar':'Shekhawati Region','Udaipur':'Mewar Region','Bhilwara':'Mewar Region','Kota':'Hadoti Region','Jodhpur':'Marwar Region' };
  function regionOf(a) { let m = {}; try { m = JSON.parse(localStorage.getItem('namdev-hierarchy-regions') || '{}') || {}; } catch (e) {} return m[a.branch] || REGION_DEFAULT[a.branch] || 'Unmapped'; }
  const MON = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
  function parseDay(v) {
    if (!v) return null; const t = String(v).trim(); let m;
    if ((m = t.match(/^(\d{4})-(\d{2})-(\d{2})/))) return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
    if ((m = t.match(/^(\d{1,2})[\s-]([A-Za-z]{3})[A-Za-z]*[\s-,]+(\d{4})/)) && MON[m[2].toLowerCase()] != null) return new Date(+m[3], MON[m[2].toLowerCase()], +m[1]).getTime();
    if ((m = t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/))) return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
    const d = Date.parse(t); if (isNaN(d)) return null; const x = new Date(d); return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  }
  function caseDay(a) { const w = a.workflow || {}; for (const v of [a.updated, a.lastUpdated, a.updatedAt, w.updatedAt, a.created, a.createdAt, a.date, a.appliedOn]) { const d = parseDay(v); if (d != null) return d; } return null; }
  const fmtDay = d => d == null ? '—' : new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const STAGES = ['Lead','Application','KYC','Credit Review','Sanctioned','Disbursement','Active Loan','Closed'];

  // Identity record per case: real case fields where present, deterministic demo values otherwise.
  function ident(a) {
    const c = (typeof getCustomerByApp === 'function' && getCustomerByApp(a.id)) || {};
    const h = hash(a.customer + '|' + (a.mobile || ''));
    const pan = a.pan && a.pan !== 'ABCDE1234F' ? a.pan : c.pan && c.pan !== 'ABCDE1234F' ? c.pan : L[h % 23] + L[(h >> 5) % 23] + L[(h >> 9) % 23] + 'P' + String(a.customer || 'X')[0].toUpperCase() + String(1000 + h % 9000) + L[(h >> 13) % 23];
    const dob = a.dob || c.dob || new Date(1965 + h % 35, (h >> 3) % 12, 1 + (h >> 7) % 28).toISOString().slice(0, 10);
    const aadhaar = a.aadhaar || c.aadhaar || 'XXXX XXXX ' + String(1000 + (h >> 4) % 9000);
    return { custId: c.id || ('CUS-' + String(h % 900000 + 100000)), pan, dob, mobile: a.mobile || c.mobile || '—', aadhaar, address: (a.branch || 'Jaipur') + ', Rajasthan', name: a.customer };
  }
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const maskAadhaar = value => {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 4 ? 'XXXX XXXX ' + digits.slice(-4) : '—';
  };
  function index() {
    const by = { pan:{}, mobile:{}, name:{} };
    applications.forEach(a => { const i = ident(a); [['pan', i.pan], ['mobile', norm(i.mobile)], ['name', norm(a.customer) + i.dob]].forEach(([k, v]) => { if (!v || v === '—') return; (by[k][v] = by[k][v] || []).push(a.id); }); });
    return by;
  }
  function dedupe(a, idx) {
    const i = ident(a), m = {};
    const add = (ids, sig) => ids.filter(x => x !== a.id).forEach(x => (m[x] = m[x] || []).push(sig));
    add(idx.pan[i.pan] || [], 'PAN = Exact Match'); add(idx.mobile[norm(i.mobile)] || [], 'Mobile = Exact Match'); add(idx.name[norm(a.customer) + i.dob] || [], 'Name + DOB = Exact Match');
    const matches = Object.keys(m).map(id => { const o = getApp(id) || {}; const s = m[id]; const strong = s.some(x => x.startsWith('PAN')); const open = !['Closed','Rejected'].includes(o.status); return { id, customer:o.customer, product:o.product, status:o.status, signals:s, type: strong && o.product === a.product && open ? 'Duplicate Application' : strong ? 'Duplicate Customer' : s.length > 1 ? 'Strong Match' : 'Possible Match' }; });
    const rank = ['No Match','Possible Match','Strong Match','Duplicate Customer','Duplicate Application'];
    const status = matches.reduce((b, x) => rank.indexOf(x.type) > rank.indexOf(b) ? x.type : b, 'No Match');
    return { status, risk: status === 'No Match' ? 'Low' : status === 'Possible Match' ? 'Medium' : 'High', matches };
  }
  function kycOf(a) {
    const s = store[a.id] && store[a.id].kyc; if (s) return s;
    const k = (window.v7Kyc && v7Kyc[a.id]) || {};
    const map = v => v === 'Verified' || v === 'Matched' || v === 'Completed' ? 'PASS' : v === 'Failed' ? 'FAIL' : 'PENDING';
    const st = k.status === 'Verified' ? 'Verified' : k.status ? (Object.values(k).includes('Failed') ? 'Manual Review' : 'Pending') : 'Not Started';
    return { status: st, pan: map(k.pan), identity: map(k.identity), face: map(k.face), address: map(k.address), dob: k.status ? 'PASS' : 'PENDING', ocr: k.ocr === 'Completed' ? 100 : null, at: '', by: '', ref: '' };
  }
  const dedOf = a => store[a.id] && store[a.id].dedupe || null;
  const badge = v => { const c = /PASS|Verified|No Match|Low/.test(v) ? 'green' : /FAIL|Failed|Duplicate|High|Expired/.test(v) ? 'red' : /Review|Strong|Possible|Medium|Progress/.test(v) ? 'amber' : 'gray'; return '<span class="badge ' + c + '">' + esc(v) + '</span>'; };

  let ui = { q:'', product:'', region:'', branch:'', kyc:'', ded:'', risk:'', stage:'', from:'', to:'', page:0 };
  function rows() {
    const q = norm(ui.q);
    return applications.filter(a => {
      const i = ident(a), k = kycOf(a), d = dedOf(a);
      if (q && ![a.id, a.customer, i.mobile, i.pan, i.custId, a.workflow && a.workflow.dealId].some(v => norm(v).includes(q))) return false;
      if (ui.product && a.product !== ui.product) return false;
      if (ui.region && regionOf(a) !== ui.region) return false;
      if (ui.branch && a.branch !== ui.branch) return false;
      if (ui.kyc && k.status !== ui.kyc) return false;
      if (ui.ded && (d ? d.status : 'Not Run') !== ui.ded) return false;
      if (ui.risk && (d ? d.risk : '—') !== ui.risk) return false;
      if (ui.stage && a.status !== ui.stage) return false;
      if (ui.from || ui.to) { const t = caseDay(a); if (t == null) return false; if (ui.from && t < parseDay(ui.from)) return false; if (ui.to && t > parseDay(ui.to)) return false; }
      return typeof window.nfInScope !== 'function' || window.nfInScope(a);
    });
  }
  const opts = (list, v, all) => '<option value="">' + all + '</option>' + list.map(x => '<option' + (x === v ? ' selected' : '') + '>' + esc(x) + '</option>').join('');
  renderKycDedupe = function() {
    if (typeof v7ActivateNav === 'function') v7ActivateNav('kycDedupe');
    setPage('KYC & Dedupe', 'Origination / KYC & Dedupe');
    const list = rows(), per = 50, pages = Math.max(1, Math.ceil(list.length / per)); ui.page = Math.min(ui.page, pages - 1);
    const all = applications.map(a => [kycOf(a), dedOf(a)]);
    const kpi = [['Cases', applications.length], ['KYC Verified', all.filter(x => x[0].status === 'Verified').length], ['Manual Review', all.filter(x => x[0].status === 'Manual Review').length], ['Dedupe Run', all.filter(x => x[1]).length], ['Duplicates Flagged', all.filter(x => x[1] && /Duplicate|Strong/.test(x[1].status)).length]];
    const products = ['Two Wheeler','MSME','LAP','Solar Loan','Tractor Loan'];
    const uniq = k => [...new Set(applications.map(a => a[k]).filter(Boolean))].sort();
    document.getElementById('content').innerHTML =
      '<div class="page-head"><div><h2>KYC & Dedupe</h2><p>Identity checks and duplicate-customer detection on current case records. Demo mode: results are simulated from case data — no live PAN, Aadhaar or CKYC service is connected.</p></div>' + (currentUser.role === 'CEO' ? '<span class="badge gray">View only</span>' : '') + '</div>' +
      '<div class="kd-kpis">' + kpi.map(k => '<div class="workflow-card"><span>' + k[0] + '</span><b>' + k[1] + '</b></div>').join('') + '</div>' +
      '<div class="workflow-card"><div class="kd-filters"><input id="kdQ" placeholder="Search Application ID, name, mobile, PAN, Customer ID, LAN…" value="' + esc(ui.q) + '">' +
      '<select data-f="product">' + opts(products, ui.product, 'All products') + '</select><select data-f="region">' + opts([...new Set(applications.map(regionOf))].sort(), ui.region, 'All regions') + '</select><select data-f="branch">' + opts(uniq('branch').filter(b => !ui.region || regionOf({branch:b}) === ui.region), ui.branch, 'All branches') + '</select><select data-f="stage">' + opts(uniq('status'), ui.stage, 'All stages') + '</select>' +
      '<select data-f="kyc">' + opts(['Not Started','Pending','In Progress','Verified','Failed','Manual Review','Expired'], ui.kyc, 'KYC status') + '</select><select data-f="ded">' + opts(['Not Run','No Match','Possible Match','Strong Match','Duplicate Customer','Duplicate Application','Manual Review'], ui.ded, 'Dedupe status') + '</select><select data-f="risk">' + opts(['Low','Medium','High'], ui.risk, 'Risk') + '</select>' +
      '<label>From<input type="date" data-f="from" value="' + ui.from + '"></label><label>To<input type="date" data-f="to" value="' + ui.to + '"></label><button class="ghost-btn" id="kdClear">Clear</button>' + (can('export') ? '<button class="ghost-btn" id="kdExport">⇩ Export CSV</button>' : '') + (can('runDedupe') ? '<button class="primary-btn" id="kdBulk">Run Dedupe on results</button>' : '') + '</div>' +
      '<div class="table-wrap"><table><thead><tr><th>Application ID</th><th>Customer</th><th>Product</th><th>Mobile</th><th>PAN</th><th>Branch / Region</th><th>Stage</th><th>KYC</th><th>Dedupe</th><th>Risk</th><th>Assigned To</th><th>Updated</th><th>Action</th></tr></thead><tbody>' +
      list.slice(ui.page * per, ui.page * per + per).map(a => { const i = ident(a), k = kycOf(a), d = dedOf(a); return '<tr><td><b>' + esc(a.id) + '</b></td><td>' + esc(a.customer) + '<small class="kd-sub">' + esc(i.custId) + '</small></td><td>' + esc(a.product) + '</td><td>' + esc(i.mobile) + '</td><td>' + esc(i.pan.slice(0, 2) + 'XXX' + i.pan.slice(5)) + '</td><td>' + esc(a.branch) + '<small class="kd-sub">' + esc(regionOf(a)) + '</small></td><td>' + esc(a.status) + '</td><td>' + badge(k.status) + '</td><td>' + badge(d ? d.status : 'Not Run') + '</td><td>' + (d ? badge(d.risk) : '—') + '</td><td>' + esc((a.workflow && a.workflow.ownerRole) || a.owner || '—') + '</td><td>' + esc(fmtDay(caseDay(a))) + '</td><td class="kd-act"><button class="more-btn" data-open="' + esc(a.id) + '">View</button>' + (can('runKyc') && k.status !== 'Verified' ? '<button class="more-btn" data-kyc="' + esc(a.id) + '">Run KYC</button>' : '') + (can('runDedupe') ? '<button class="more-btn" data-ded="' + esc(a.id) + '">Run Dedupe</button>' : '') + '</td></tr>'; }).join('') +
      (list.length ? '' : '<tr><td colspan="13" class="muted">No cases match these filters.</td></tr>') + '</tbody></table></div>' +
      '<div class="kd-pager"><span>' + list.length + ' cases · page ' + (ui.page + 1) + ' of ' + pages + '</span><button class="ghost-btn" data-pg="-1"' + (ui.page ? '' : ' disabled') + '>‹ Prev</button><button class="ghost-btn" data-pg="1"' + (ui.page < pages - 1 ? '' : ' disabled') + '>Next ›</button></div></div>';
    bind();
  };
  function bind() {
    const c = document.getElementById('content');
    const q = c.querySelector('#kdQ'); q.oninput = () => { ui.q = q.value; ui.page = 0; const p = q.selectionStart; renderKycDedupe(); const n = document.getElementById('kdQ'); n.focus(); n.setSelectionRange(p, p); };
    c.querySelectorAll('[data-f]').forEach(s => s.onchange = () => { ui[s.dataset.f] = s.value; ui.page = 0; renderKycDedupe(); });
    c.querySelector('#kdClear').onclick = () => { ui = { q:'', product:'', region:'', branch:'', kyc:'', ded:'', risk:'', stage:'', from:'', to:'', page:0 }; renderKycDedupe(); };
    c.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => { ui.page += +b.dataset.pg; renderKycDedupe(); });
    c.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openKycCase(b.dataset.open));
    c.querySelectorAll('[data-kyc]').forEach(b => b.onclick = () => runKyc(b.dataset.kyc));
    c.querySelectorAll('[data-ded]').forEach(b => b.onclick = () => runDedupe(b.dataset.ded));
    const ex = c.querySelector('#kdExport'); if (ex) ex.onclick = exportCsv;
    const bk = c.querySelector('#kdBulk'); if (bk) bk.onclick = () => { const idx = index(), list = rows(); list.forEach(a => record(a, dedupe(a, idx), true)); save(); audit('BULK', 'Dedupe Run (bulk)', list.length + ' cases'); showToast('Dedupe completed for ' + list.length + ' cases'); renderKycDedupe(); };
  }
  const audit = (id, act, det) => { try { (window.persistAuditV7 || logAudit)(id, act, det); } catch (e) {} };
  function record(a, d, quiet) {
    store[a.id] = store[a.id] || {}; store[a.id].dedupe = Object.assign(d, { at: new Date().toLocaleString(), by: currentUser.role });
    const cu = typeof getCustomerByApp === 'function' && getCustomerByApp(a.id); if (cu) cu.dedupe = d.status === 'No Match' ? 'Clear' : d.status;
    if (!quiet) { save(); audit(a.id, 'Dedupe Run', d.status + ' · ' + d.matches.length + ' match(es)'); }
  }
  runDedupe = function(id) {
    if (!can('runDedupe')) return showToast('Your role cannot run dedupe.');
    const a = getApp(id); if (!a) return; const d = dedupe(a, index()); record(a, d);
    showToast('Dedupe completed: ' + d.status); openKycCase(id);
  };
  function runKyc(id) {
    if (!can('runKyc')) return showToast('Your role cannot run KYC.');
    const a = getApp(id); if (!a) return; const h = hash(a.id), i = ident(a);
    const r = { pan:'PASS', identity:'PASS', dob:'PASS', face: h % 9 === 0 ? 'REVIEW' : 'PASS', address: h % 6 === 0 ? 'REVIEW' : 'PASS', ocr: h % 9 === 0 ? 88 : 100 };
    const status = Object.values(r).some(v => v === 'REVIEW' || (typeof v === 'number' && v < 95)) ? 'Manual Review' : 'Verified';
    store[id] = store[id] || {}; store[id].kyc = Object.assign(r, { status, at: new Date().toLocaleString(), by: currentUser.role, ref: 'DEMO-KYC-' + (h % 1e8), provider: 'Demo simulator (replaceable)' });
    if (window.v7Kyc) { v7Kyc[id] = v7Kyc[id] || { version: 1 }; Object.assign(v7Kyc[id], { status: status === 'Verified' ? 'Verified' : 'Pending', pan:'Verified', identity:'Verified', face: r.face === 'PASS' ? 'Matched' : 'Pending', address: r.address === 'PASS' ? 'Verified' : 'Pending', ocr:'Completed' }); }
    save(); audit(id, 'KYC Run', status + ' · ref ' + store[id].kyc.ref);
    showToast('KYC completed: ' + status); openKycCase(id);
  }
  window.nfRunKyc = runKyc;
  function verifyManual(id) {
    if (!can('runKyc')) return; const k = store[id] && store[id].kyc; if (!k) return;
    k.status = 'Verified'; ['face','address'].forEach(x => k[x] = 'PASS'); k.at = new Date().toLocaleString(); k.by = currentUser.role; save();
    if (window.v7Kyc && v7Kyc[id]) Object.assign(v7Kyc[id], { status:'Verified', face:'Matched', address:'Verified' });
    audit(id, 'KYC Manual Review Cleared', 'Reviewer: ' + currentUser.role); openKycCase(id);
  }
  window.nfKycVerifyManual = verifyManual;
  openKycCase = function(id) {
    const a = getApp(id); if (!a) return showToast('Case not found');
    const i = ident(a), k = kycOf(a), d = dedOf(a);
    const line = (l, v) => '<div class="verification-card"><span>' + l + '</span><b>' + v + '</b></div>';
    const sum = [['Identity Match', k.identity], ['PAN Match', k.pan], ['Address Match', k.address], ['DOB Match', k.dob], ['Photo Match', k.face]];
    const body = '<div class="notice info">Demo verification only — simulated from case data; no government or bureau API is called.</div>' +
      '<div class="verification-grid">' + line('Applicant', esc(a.customer)) + line('Customer ID', esc(i.custId)) + line('Product', esc(a.product)) + line('Mobile', esc(i.mobile)) + line('DOB', esc(i.dob)) + line('Address', esc(i.address)) + '</div>' +
      '<h4 class="kd-h">PAN verification</h4><div class="verification-grid">' + line('PAN Number', esc(i.pan)) + line('Name on PAN', esc(k.pan === 'PENDING' ? '—' : a.customer)) + line('Match', badge(k.pan)) + line('Verified at', esc(k.at || '—')) + line('Source', esc(k.provider || 'Demo simulator')) + '</div>' +
      '<h4 class="kd-h">Aadhaar / identity</h4><div class="verification-grid">' + line('Aadhaar', esc(maskAadhaar(i.aadhaar))) + line('Name Match', badge(k.identity)) + line('DOB Match', badge(k.dob)) + line('Address Match', badge(k.address)) + line('Reference', esc(k.ref || '—')) + '</div>' +
      '<h4 class="kd-h">OCR comparison</h4><div class="verification-grid">' + line('Applicant name', esc(a.customer)) + line('Document name', esc(store[id] && store[id].ocrDoc ? (store[id].ocrDoc.fields.name || '—') : 'Not extracted — use Document OCR below')) + line('Match', k.ocr == null ? '—' : badge(k.ocr + '%' + (k.ocr < 95 ? ' — mismatch' : ''))) + '</div>' +
      '<h4 class="kd-h">Document OCR</h4><div id="kdOcr" data-case="' + esc(id) + '"><p class="muted">Loading uploaded documents…</p></div>' + '<h4 class="kd-h">KYC match summary</h4><div class="kd-summary">' + sum.map(s => '<span>' + s[0] + ': ' + badge(s[1]) + '</span>').join('') + '<span><b>Overall KYC:</b> ' + badge(k.status) + '</span></div>' +
      '<h4 class="kd-h">Dedupe</h4>' + (!d ? '<p class="muted">Dedupe has not been run for this case.</p>' : '<p>Result ' + badge(d.status) + ' · Risk ' + badge(d.risk) + ' · run ' + esc(d.at) + ' by ' + esc(d.by) + '</p>' + (d.matches.length ? '<div class="table-wrap"><table><thead><tr><th>Matching case</th><th>Customer</th><th>Product</th><th>Status</th><th>Signals</th><th>Type</th><th></th></tr></thead><tbody>' + d.matches.slice(0, 20).map(m => '<tr><td>' + esc(m.id) + '</td><td>' + esc(m.customer) + '</td><td>' + esc(m.product) + '</td><td>' + esc(m.status) + '</td><td>' + m.signals.map(esc).join('<br>') + '</td><td>' + badge(m.type) + '</td><td><button class="more-btn" onclick="closeModal();renderCase(\'' + esc(m.id) + '\')">View Existing</button></td></tr>').join('') + '</tbody></table></div>' : ''));
    const btn = (can('runKyc') ? '<button class="ghost-btn" onclick="nfRunKyc(\'' + esc(id) + '\')">Run KYC</button>' : '') + (can('runKyc') && k.status === 'Manual Review' ? '<button class="ghost-btn" onclick="nfKycVerifyManual(\'' + esc(id) + '\')">Clear Manual Review</button>' : '') + (can('runDedupe') ? '<button class="ghost-btn" onclick="runDedupe(\'' + esc(id) + '\')">Run Dedupe</button>' : '') + '<button class="ghost-btn" onclick="closeModal();renderCase(\'' + esc(id) + '\')">Open Case</button><button class="primary-btn" onclick="closeModal();renderKycDedupe()">Close</button>';
    showModal('KYC & Dedupe • ' + id, body, btn);
    loadOcr(id);
  };
  // Document OCR: reads browser-stored case uploads or a newly chosen image and compares extracted details with case data.
  function idb() { return new Promise((res, rej) => { const r = indexedDB.open('namdev-case-documents', 1); r.onupgradeneeded = () => { r.result.createObjectStore('files', {keyPath:'key'}); r.result.createObjectStore('cases', {keyPath:'id'}); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
  async function caseFiles(id) { try { const db = await idb(); return await new Promise(res => { const q = db.transaction('files').objectStore('files').getAll(); q.onsuccess = () => res((q.result || []).filter(f => f.caseId === id)); q.onerror = () => res([]); }); } catch (e) { return []; } }
  let ocrFiles = [];
  async function loadOcr(id) {
    ocrFiles = await caseFiles(id);
    const box = document.querySelector('#kdOcr[data-case="' + id + '"]'); if (!box) return;
    const prev = store[id] && store[id].ocrDoc;
    const imgs = ocrFiles.map((f, i) => [f, i]).filter(x => x[0].blob && /^image\/(jpeg|png|webp)$/.test(x[0].blob.type));
    box.innerHTML = '<p class="muted">Reads an uploaded identity document with AI and compares it to this case. Only JPG, PNG or WebP images can be read; PDFs must be uploaded as images. The image is sent for reading and not stored on the server.</p>' +
      (imgs.length ? '<div class="kd-files">' + imgs.map(x => '<div><span>' + esc(x[0].document || 'Document') + ' · ' + esc(x[0].name) + '</span>' + (can('runKyc') ? '<button class="more-btn" data-ocr-file="' + x[1] + '">Read</button>' : '') + '</div>').join('') + '</div>' : '<p class="muted">No image documents uploaded for this case yet.</p>') +
      (can('runKyc') ? '<label class="kd-upload">Read a new image <input type="file" accept="image/jpeg,image/png,image/webp" id="kdOcrInput"></label>' : '') +
      '<div id="kdOcrResult">' + (prev ? ocrTable(prev) : '') + '</div>';
    box.querySelectorAll('[data-ocr-file]').forEach(b => b.onclick = () => { const f = ocrFiles[+b.dataset.ocrFile]; runOcr(id, f.blob, f.document || f.name); });
    const inp = box.querySelector('#kdOcrInput'); if (inp) inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) runOcr(id, f, f.name); };
  }
  function toDataUrl(blob) {
    return new Promise((res, rej) => { const img = new Image(), url = URL.createObjectURL(blob); img.onload = () => { const s = Math.min(1, 1600 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.85)); }; img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); }; img.src = url; });
  }
  const pending = new Map();
  window.addEventListener('message', e => { if (e.source !== window.parent || e.origin !== window.parent.location.origin || !e.data || e.data.type !== 'namdev-kyc-ocr-result') return; const r = pending.get(e.data.id); if (r) { pending.delete(e.data.id); r(e.data); } });
  function tokens(s) { return String(s || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean); }
  function nameScore(a, b) { const x = tokens(a), y = tokens(b); if (!x.length || !y.length) return null; const hit = x.filter(t => y.includes(t)).length; return Math.round(hit / Math.max(x.length, y.length) * 100); }
  function compare(a, f) {
    const i = ident(a), out = [];
    const row = (label, ocr, caseVal, score) => out.push({ label, ocr: ocr || '—', caseVal, score });
    row('Name', f.name, a.customer, nameScore(f.name, a.customer));
    row('Date of birth', f.dob, i.dob + ' (demo)', f.dob ? (f.dob === i.dob ? 100 : 0) : null);
    row('PAN', f.pan, i.pan + ' (demo)', f.pan ? (f.pan.toUpperCase().replace(/\s/g, '') === i.pan ? 100 : 0) : null);
    row('Aadhaar (last 4)', f.aadhaarLast4, i.aadhaar.slice(-4) + ' (demo)', f.aadhaarLast4 ? (f.aadhaarLast4 === i.aadhaar.slice(-4) ? 100 : 0) : null);
    row('Address', f.address, i.address, f.address ? (tokens(f.address).includes(tokens(String(a.branch).split('-')[0])[0] || '#') ? 100 : 40) : null);
    return out;
  }
  function ocrTable(o) {
    return '<p>Read <b>' + esc(o.file) + '</b> (' + esc(o.fields.documentType || 'document') + ') · ' + esc(o.at) + ' by ' + esc(o.by) + ' · overall match ' + badge(o.score == null ? 'No comparable fields' : o.score + '%' + (o.score < 95 ? ' — review' : '')) + '</p><div class="table-wrap"><table><thead><tr><th>Field</th><th>From document</th><th>Case record</th><th>Match</th></tr></thead><tbody>' +
      o.cmp.map(r => '<tr><td>' + esc(r.label) + '</td><td>' + esc(r.ocr) + '</td><td>' + esc(r.caseVal) + '</td><td>' + (r.score == null ? '<span class="muted">Not on document</span>' : badge(r.score >= 95 ? 'PASS ' + r.score + '%' : r.score >= 60 ? 'REVIEW ' + r.score + '%' : 'FAIL ' + r.score + '%')) + '</td></tr>').join('') +
      '</tbody></table></div><p class="muted">Fields marked (demo) are synthetic values on this demo case, so mismatches there are expected until real case data is used.</p>';
  }
  async function runOcr(id, blob, label) {
    if (!can('runKyc')) return showToast('Your role cannot run KYC.');
    const out = document.getElementById('kdOcrResult'); if (out) out.innerHTML = '<p class="muted">Reading document…</p>';
    let image; try { image = await toDataUrl(blob); } catch (e) { if (out) out.innerHTML = '<p class="muted">This image could not be opened.</p>'; return; }
    const rid = 'ocr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const res = await new Promise(r => { pending.set(rid, r); window.parent.postMessage({ type:'namdev-kyc-ocr', id: rid, image, hint: String(label).slice(0, 80) }, window.parent.location.origin); setTimeout(() => { if (pending.has(rid)) { pending.delete(rid); r({ status: 504, error: 'Reading took too long. Please try again.', fields: {} }); } }, 60000); });
    if (res.status !== 200) { const o = document.getElementById('kdOcrResult'); if (o) o.innerHTML = '<div class="notice warn">' + esc(res.error) + '</div>'; return; }
    const a = getApp(id), cmp = compare(a, res.fields), scored = cmp.filter(r => r.score != null && !/demo/.test(r.caseVal));
    const score = scored.length ? Math.round(scored.reduce((s, r) => s + r.score, 0) / scored.length) : null;
    store[id] = store[id] || {}; store[id].ocrDoc = { file: label, fields: res.fields, cmp, score, at: new Date().toLocaleString(), by: currentUser.role };
    const k = Object.assign({}, kycOf(a)); k.ocr = score; if (score != null && score < 95 && k.status === 'Verified') k.status = 'Manual Review'; store[id].kyc = k;
    save(); audit(id, 'KYC Document OCR', label + ' · name/address match ' + (score == null ? 'n/a' : score + '%'));
    const o = document.getElementById('kdOcrResult'); if (o) o.innerHTML = ocrTable(store[id].ocrDoc);
  }
  function exportCsv() {
    const list = rows(), head = ['Application ID','Customer','Customer ID','Product','Mobile','PAN (masked)','Branch','Region','Stage','KYC Status','Dedupe Status','Risk','Assigned To','Updated'];
    const csv = [head].concat(list.map(a => { const i = ident(a), k = kycOf(a), d = dedOf(a); return [a.id, a.customer, i.custId, a.product, i.mobile, i.pan.slice(0, 2) + 'XXX' + i.pan.slice(5), a.branch, regionOf(a), a.status, k.status, d ? d.status : 'Not Run', d ? d.risk : '', (a.workflow && a.workflow.ownerRole) || a.owner || '', fmtDay(caseDay(a))]; })).map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' })); el.download = 'kyc-dedupe-' + new Date().toISOString().slice(0, 10) + '.csv'; el.click();
    audit('EXPORT', 'KYC & Dedupe Export', list.length + ' rows');
  }
})();
</script>`;