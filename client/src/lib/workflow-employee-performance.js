// Employee Performance & Target 360: read-only CEO oversight module under Case Docs & Audit Trail.
// Attributes every demo case to exactly one BSO (managers roll up their team) so organisation totals never double count.
// Targets, thresholds and incentive slabs live in one browser-local demo configuration.
export const workflowEmployeePerformanceScript = String.raw`<script>
(() => {
  if (typeof navTo !== 'function' || typeof applications === 'undefined') return;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const VIEW = 'empPerformance';
  const PRODUCTS = ['Two Wheeler','MSME','LAP','Solar Loan','Tractor Loan'];
  const SALES = ['BSO','BDM','ASM','RSM','ZSM','CBO'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DISBURSED = ['Active Loan','Disbursed','Closed'];
  const APPROVED = ['Sanctioned','Disbursement', ...DISBURSED];

  // ---------- Central demo configuration (targets, status thresholds, incentive master) ----------
  const CFG_KEY = 'namdev-emp-performance-config';
  const CFG_DEFAULT = {
    monthlyTarget: { BSO: 2500000, BDM: 7500000, ASM: 15000000, RSM: 30000000, ZSM: 30000000, CBO: 30000000 },
    countTarget: { Credit: 20, Operations: 14, Collections: 7 },
    status: { achieved: 100, onTrack: 80, attention: 60 },
    slabs: [ { from: 0, rate: 0 }, { from: 60, rate: 0.05 }, { from: 80, rate: 0.10 }, { from: 100, rate: 0.15 }, { from: 120, rate: 0.20 } ],
    targetBonus: { BSO: 2000, BDM: 5000, ASM: 8000, RSM: 12000, ZSM: 15000, CBO: 20000 },
    productBonus: { 'Tractor Loan': 0.02, 'Solar Loan': 0.02 }
  };
  const loadCfg = () => { try { const s = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); if (!s) return structuredClone(CFG_DEFAULT); return { ...structuredClone(CFG_DEFAULT), ...s, monthlyTarget: { ...CFG_DEFAULT.monthlyTarget, ...(s.monthlyTarget||{}) }, countTarget: { ...CFG_DEFAULT.countTarget, ...(s.countTarget||{}) }, status: { ...CFG_DEFAULT.status, ...(s.status||{}) }, targetBonus: { ...CFG_DEFAULT.targetBonus, ...(s.targetBonus||{}) }, productBonus: { ...CFG_DEFAULT.productBonus, ...(s.productBonus||{}) } }; } catch (e) { return structuredClone(CFG_DEFAULT); } };
  let CFG = loadCfg();
  const REGION_DEFAULT = { 'Jaipur - VKI':'Jaipur Region','Jaipur - Sanganer':'Jaipur Region','Ajmer Road':'Jaipur Region','Sikar':'Shekhawati Region','Udaipur':'Mewar Region','Bhilwara':'Mewar Region','Kota':'Hadoti Region','Jodhpur':'Marwar Region' };
  const regionOf = b => { try { const s = JSON.parse(localStorage.getItem('namdev-hierarchy-regions') || 'null'); return (s && s[b]) || REGION_DEFAULT[b] || 'Other'; } catch (e) { return REGION_DEFAULT[b] || 'Other'; } };

  // ---------- Deterministic employee roster (demo) ----------
  const BR = ['Jaipur - VKI','Ajmer Road','Udaipur','Bhilwara','Kota','Sikar','Jaipur - Sanganer','Jodhpur'];
  const DESIG = { BSO:'Business Sales Officer', BDM:'Business Development Manager', ASM:'Area Sales Manager', RSM:'Regional Sales Manager', ZSM:'Zonal Sales Manager', CBO:'Chief Business Officer', BCM:'Branch Credit Manager', ACM:'Area Credit Manager', ZCM:'Zonal Credit Manager', 'Credit Head':'Head of Credit', 'Disbursement Officer':'Disbursement Officer', 'Central Operations':'Central Operations Executive', 'Collection Officer':'Collection Officer', 'Collection Manager':'Collection Manager' };
  const E = [];
  let seq = 101;
  const add = (name, role, dept, branch, managerId, join, status) => { const e = { id: 'EMP-' + String(seq++).padStart(5,'0'), name, role, dept, designation: DESIG[role] || role, branch, city: branch.split(' - ')[0], state: 'Rajasthan', managerId, join, status: status || 'Active', level: SALES.includes(role) ? SALES.indexOf(role) + 1 : 1 }; E.push(e); return e; };
  const cbo = add('Arvind Bansal','CBO','Sales','Jaipur - VKI',null,'2019-06-03');
  const zsm = add('Manish Gupta','ZSM','Sales','Jaipur - VKI',cbo.id,'2020-02-17');
  const rsm = add('Pooja Rathore','RSM','Sales','Jaipur - VKI',zsm.id,'2020-11-09');
  const asms = [add('Rakesh Meena','ASM','Sales','Jaipur - VKI',rsm.id,'2021-04-12'), add('Sunita Choudhary','ASM','Sales','Udaipur',rsm.id,'2021-08-23')];
  const bdmNames = [['Amit Sharma','Jaipur - VKI'],['Deepak Verma','Jaipur - Sanganer'],['Ritika Joshi','Udaipur'],['Gaurav Saxena','Kota']];
  const bdms = bdmNames.map((n, i) => add(n[0],'BDM','Sales',n[1],asms[i < 2 ? 0 : 1].id, '2022-0' + (i+1) + '-1' + i));
  const bsoNames = ['Neha Jain','Rohit Singh','Komal Patel','Arjun Yadav','Divya Mehta','Karan Soni','Aditi Agarwal','Mohit Bhatia','Sneha Trivedi','Aman Rao','Shweta Goyal','Harish Vyas'];
  const bsoBranch = ['Jaipur - VKI','Ajmer Road','Jaipur - Sanganer','Sikar','Jaipur - VKI','Ajmer Road','Udaipur','Bhilwara','Jodhpur','Kota','Udaipur','Kota'];
  const bdmFor = b => ({'Jaipur - VKI':0,'Ajmer Road':0,'Jaipur - Sanganer':1,'Sikar':1,'Udaipur':2,'Bhilwara':2,'Jodhpur':2,'Kota':3})[b];
  const bsos = bsoNames.map((n, i) => add(n,'BSO','Sales',bsoBranch[i],bdms[bdmFor(bsoBranch[i])].id, (2022 + i % 4) + '-' + String(1 + i % 12).padStart(2,'0') + '-' + String(3 + i * 2).padStart(2,'0'), i === 10 ? 'On Leave' : 'Active'));
  const ch = add('Sanjay Kapoor','Credit Head','Credit','Jaipur - VKI',null,'2019-09-16');
  const zcm = add('Nitin Saini','ZCM','Credit','Jaipur - VKI',ch.id,'2020-07-01');
  const acms = [add('Priya Malhotra','ACM','Credit','Jaipur - VKI',zcm.id,'2021-03-08'), add('Rajesh Tiwari','ACM','Credit','Udaipur',zcm.id,'2021-10-18')];
  const bcms = [['Kavita Rao','Jaipur - VKI',0],['Anita Mishra','Sikar',0],['Vikram Dubey','Udaipur',1],['Meena Shekhawat','Kota',1]].map(x => add(x[0],'BCM','Credit',x[1],acms[x[2]].id,'2022-09-05'));
  const opsHead = add('Suresh Bhatia','Central Operations','Operations','Jaipur - VKI',null,'2020-05-11');
  const dos = [add('Mukesh Yadav','Disbursement Officer','Operations','Jaipur - Sanganer',opsHead.id,'2024-01-08'), add('Ankit Seth','Disbursement Officer','Operations','Udaipur',opsHead.id,'2023-06-19')];
  const colMgr = add('Ramesh Solanki','Collection Manager','Collections','Jaipur - VKI',null,'2021-01-25');
  const cos = [add('Pankaj Kumar','Collection Officer','Collections','Jaipur - VKI',colMgr.id,'2023-02-13'), add('Nisha Pareek','Collection Officer','Collections','Kota',colMgr.id,'2024-03-04')];
  const byId = Object.fromEntries(E.map(e => [e.id, e]));
  const children = id => E.filter(e => e.managerId === id);
  const descendants = id => { const out = []; const walk = i => children(i).forEach(c => { out.push(c); walk(c.id); }); walk(id); return out; };
  const manager = e => e.managerId ? byId[e.managerId] : null;
  const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; return h >>> 0; };
  const pick = (list, id) => list[hash(id) % list.length];

  // ---------- Case attribution: exactly one BSO per case; one credit/ops/collections owner by branch ----------
  const caseTime = a => { const t = Date.parse(a.created || a.date || ''); return isNaN(t) ? null : t; };
  const ym = t => { const d = new Date(t); return d.getFullYear() * 100 + d.getMonth() + 1; };
  let ATTR = new Map();
  function attribute() {
    ATTR = new Map();
    applications.forEach(a => {
      const t = caseTime(a); if (t == null) return;
      // Demo book clusters stages by branch, so cases are spread across the team by a stable hash of the case ID.
      const local = l => pick(l, a.id);
      ATTR.set(a.id, { a, t, ym: ym(t), bso: local(bsos).id, bcm: local(bcms).id, ops: pick(dos, a.id).id, col: pick(cos, a.id).id });
    });
  }
  // All case records that contribute to an employee (own + team for managers).
  function scopeCases(e) {
    const rows = [...ATTR.values()];
    if (e.dept === 'Sales') { const ids = new Set([e.id, ...descendants(e.id).map(d => d.id)]); return rows.filter(r => ids.has(r.bso)); }
    if (e.dept === 'Credit') { if (e.role === 'BCM') return rows.filter(r => r.bcm === e.id); const ids = new Set(descendants(e.id).map(d => d.id)); return rows.filter(r => ids.has(r.bcm)); }
    if (e.dept === 'Operations') return e.role === 'Disbursement Officer' ? rows.filter(r => r.ops === e.id) : rows;
    if (e.dept === 'Collections') return e.role === 'Collection Officer' ? rows.filter(r => r.col === e.id) : rows;
    return [];
  }

  // ---------- Periods (Indian FY: Apr–Mar) ----------
  const fyOf = k => { const y = Math.floor(k / 100), m = k % 100; return m >= 4 ? y : y - 1; };
  const fqOf = k => { const m = k % 100; return m >= 4 ? Math.floor((m - 4) / 3) + 1 : 4; };
  const monthLabel = k => MONTHS[k % 100 - 1] + ' ' + Math.floor(k / 100);
  function periodsAvailable() {
    const ks = [...new Set([...ATTR.values()].map(r => r.ym))].sort((a, b) => b - a);
    return {
      month: ks.map(k => ({ key: 'M' + k, label: monthLabel(k), months: [k] })),
      quarter: [...new Set(ks.map(k => fyOf(k) + '-' + fqOf(k)))].map(q => { const [y, n] = q.split('-').map(Number); const start = n === 4 ? (y + 1) * 100 + 1 : y * 100 + 4 + (n - 1) * 3; const months = [0,1,2].map(i => { let m = start % 100 + i, yy = Math.floor(start / 100); if (m > 12) { m -= 12; yy++; } return yy * 100 + m; }); return { key: 'Q' + q, label: 'Q' + n + ' FY ' + y + '-' + String(y + 1).slice(2), months }; }),
      year: [...new Set(ks.map(fyOf))].map(y => ({ key: 'Y' + y, label: 'FY ' + y + '-' + String(y + 1).slice(2), months: Array.from({ length: 12 }, (_, i) => i < 9 ? y * 100 + 4 + i : (y + 1) * 100 + i - 8) }))
    };
  }
  const latestYm = () => Math.max(0, ...[...ATTR.values()].map(r => r.ym));

  // ---------- Metrics ----------
  const isSales = e => e.dept === 'Sales';
  const kpiLabel = e => isSales(e) ? 'Disbursement' : e.dept === 'Credit' ? 'Cases Reviewed' : e.dept === 'Operations' ? 'Disbursements Processed' : 'Live Accounts Serviced';
  function targetFor(e, months) {
    if (isSales(e)) return (CFG.monthlyTarget[e.role] || 0) * months.length;
    const base = CFG.countTarget[e.dept] || 0;
    const team = e.role === 'BCM' || e.role === 'Disbursement Officer' || e.role === 'Collection Officer' ? 1 : Math.max(1, descendants(e.id).length || (e.dept === 'Operations' ? dos.length : e.dept === 'Collections' ? cos.length : 1));
    return base * team * months.length;
  }
  function statusFor(pct) { const s = CFG.status; return pct >= s.achieved ? 'Target Achieved' : pct >= s.onTrack ? 'On Track' : pct >= s.attention ? 'Attention Required' : 'Below Target'; }
  const statusClass = s => s === 'Target Achieved' ? 'green' : s === 'On Track' ? 'blue' : s === 'Attention Required' ? 'amber' : 'red';
  function slabRate(pct) { let r = 0; [...CFG.slabs].sort((a, b) => a.from - b.from).forEach(s => { if (pct >= s.from) r = +s.rate || 0; }); return r; }
  function commission(e, rows, pct, months) {
    if (!isSales(e)) return null;
    const disb = rows.filter(r => DISBURSED.includes(r.a.status));
    const eligible = disb.reduce((s, r) => s + (+r.a.amount || 0), 0);
    const rate = slabRate(pct);
    const base = Math.round(eligible * rate / 100);
    const bonus = pct >= CFG.status.achieved ? (CFG.targetBonus[e.role] || 0) * months.length : 0;
    const product = Math.round(disb.reduce((s, r) => s + (+r.a.amount || 0) * (CFG.productBonus[r.a.product] || 0) / 100, 0));
    const total = base + bonus + product;
    const closed = Math.max(...months) < latestYm();
    return { eligible, rate, base, bonus, product, adjustments: 0, total, paid: closed ? total : 0, pending: closed ? 0 : total };
  }
  function metrics(e, months) {
    const set = new Set(months);
    const all = scopeCases(e);
    const rows = all.filter(r => set.has(r.ym));
    const disb = rows.filter(r => DISBURSED.includes(r.a.status));
    const approved = rows.filter(r => APPROVED.includes(r.a.status));
    const rejected = rows.filter(r => r.a.status === 'Rejected');
    let achievement;
    if (isSales(e)) achievement = disb.reduce((s, r) => s + (+r.a.amount || 0), 0);
    else if (e.dept === 'Credit') achievement = rows.filter(r => !['Draft','Sales/Predeal'].includes(r.a.status)).length;
    else if (e.dept === 'Operations') achievement = disb.length + rows.filter(r => r.a.status === 'Disbursement').length;
    else achievement = disb.length;
    const target = targetFor(e, months);
    const pct = target ? Math.round(achievement / target * 1000) / 10 : 0;
    const status = statusFor(pct);
    return { rows, disb, approved, rejected, logged: rows.filter(r => r.a.status !== 'Draft'), achievement, target, gap: Math.max(0, target - achievement), pct, status, conversion: rows.length ? Math.round(disb.length / rows.length * 1000) / 10 : 0, commission: commission(e, rows, pct, months), last: rows.reduce((m, r) => Math.max(m, r.t), 0) };
  }
  const inr = n => '₹' + Math.round(+n || 0).toLocaleString('en-IN');
  const cr = n => { n = +n || 0; return n >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(2) + ' L' : inr(n); };
  const fmtAch = (e, v) => isSales(e) ? cr(v) : Math.round(v).toLocaleString('en-IN') + ' cases';
  const fmtDate = s => { const t = Date.parse(s); return isNaN(t) ? '—' : new Date(t).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); };
  const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();

  // ---------- State ----------
  const st = { q:'', ptype:'month', pkey:'', dept:'', role:'', region:'', state:'', branch:'', status:'', perf:'', manager:'', product:'', dojFrom:'', dojTo:'', minPct:'', maxPct:'', sort:'pct', dir:-1, page:0, size:25, panel:false, exp:false };
  const isCeo = () => currentUser?.role === 'CEO';
  const canConfigure = () => ['System Admin','HR Manager'].includes(currentUser?.role);
  function currentPeriod() {
    const P = periodsAvailable()[st.ptype] || [];
    let p = P.find(x => x.key === st.pkey);
    if (!p) { const rows = [...ATTR.values()]; p = P.find(x => rows.filter(r => x.months.includes(r.ym)).length >= 10) || P[0] || { key:'', label:'—', months: [] }; st.pkey = p.key; }
    return p;
  }
  function filtered(period) {
    const q = st.q.trim().toLowerCase();
    return E.map(e => ({ e, m: metrics(e, period.months) })).filter(({ e, m }) => {
      if (q && ![e.id, e.name, e.role, e.designation, e.dept, e.branch, e.city, regionOf(e.branch), manager(e)?.name || ''].join(' ').toLowerCase().includes(q)) return false;
      if (st.dept && e.dept !== st.dept) return false;
      if (st.role && e.role !== st.role) return false;
      if (st.region && regionOf(e.branch) !== st.region) return false;
      if (st.state && e.state !== st.state) return false;
      if (st.branch && e.branch !== st.branch) return false;
      if (st.status && e.status !== st.status) return false;
      if (st.perf && m.status !== st.perf) return false;
      if (st.manager && e.managerId !== st.manager) return false;
      if (st.product && !m.disb.some(r => r.a.product === st.product)) return false;
      if (st.dojFrom && e.join < st.dojFrom) return false;
      if (st.dojTo && e.join > st.dojTo) return false;
      if (st.minPct !== '' && m.pct < +st.minPct) return false;
      if (st.maxPct !== '' && m.pct > +st.maxPct) return false;
      return true;
    });
  }
  const SORTS = { id: x => x.e.id, name: x => x.e.name, role: x => x.e.level * 10 + x.e.role.length, branch: x => x.e.branch, target: x => x.m.target, ach: x => x.m.achievement, pct: x => x.m.pct, cases: x => x.m.rows.length, disb: x => x.m.disb.length, conv: x => x.m.conversion, comm: x => x.m.commission?.total || 0 };
  function sorted(list) { const f = SORTS[st.sort] || SORTS.pct; return [...list].sort((a, b) => { const x = f(a), y = f(b); return (x > y ? 1 : x < y ? -1 : 0) * st.dir; }); }
  const uniq = f => [...new Set(E.map(f))].filter(Boolean).sort();
  const opts = (list, val, all) => '<option value="">' + all + '</option>' + list.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('');
  const CHIPS = { dept:'Department', role:'Role', region:'Region', state:'State', branch:'Branch', status:'Employment', perf:'Performance', manager:'Manager', product:'Product', dojFrom:'Joined from', dojTo:'Joined to', minPct:'Min %', maxPct:'Max %' };
  const filterSummary = () => Object.keys(CHIPS).filter(k => st[k] !== '').map(k => CHIPS[k] + ' = ' + (k === 'manager' ? byId[st[k]]?.name : st[k])).concat(st.q ? ['Search = ' + st.q] : []).join('; ') || 'None';

  // ---------- List page ----------
  function renderList() {
    attribute();
    setPage('Employee Performance', 'Case Docs & Audit Trail / Employee Performance');
    const period = currentPeriod();
    const list = sorted(filtered(period));
    const P = periodsAvailable();
    // KPI cards: union of contributing cases so manager roll-ups never double count.
    const salesRows = list.filter(x => isSales(x.e));
    const caseSet = new Map(); salesRows.forEach(x => x.m.rows.forEach(r => caseSet.set(r.a.id, r)));
    const uniqueRows = [...caseSet.values()];
    const disbUnique = uniqueRows.filter(r => DISBURSED.includes(r.a.status));
    const orgDisb = disbUnique.reduce((s, r) => s + (+r.a.amount || 0), 0);
    const bsoInScope = salesRows.filter(x => x.e.role === 'BSO');
    const orgTarget = bsoInScope.reduce((s, x) => s + x.m.target, 0);
    const commTotal = bsoInScope.reduce((s, x) => s + (x.m.commission?.total || 0), 0);
    const achieved = list.filter(x => x.m.status === 'Target Achieved').length;
    const below = list.filter(x => x.m.status === 'Below Target').length;
    const cards = [
      ['Employees in view', list.length.toLocaleString('en-IN'), E.length + ' total', ''],
      ['Disbursement (unique cases)', cr(orgDisb), disbUnique.length + ' disbursed cases', 'disb'],
      ['BSO target', cr(orgTarget), orgTarget ? (Math.round(orgDisb / orgTarget * 1000) / 10) + '% achieved' : '—', ''],
      ['Cases handled', uniqueRows.length.toLocaleString('en-IN'), uniqueRows.length ? (Math.round(disbUnique.length / uniqueRows.length * 1000) / 10) + '% conversion' : '—', ''],
      ['Target achieved', achieved, 'employees ≥ ' + CFG.status.achieved + '%', 'Target Achieved'],
      ['Below target', below, 'employees < ' + CFG.status.attention + '%', 'Below Target'],
      ['BSO incentive (demo)', inr(commTotal), 'Incentive Master rules', '']
    ];
    const rankable = list.filter(x => x.e.role === 'BSO');
    const top = [...rankable].sort((a, b) => b.m.pct - a.m.pct).slice(0, 5);
    const roleBars = SALES.map(r => { const xs = list.filter(x => x.e.role === r); if (!xs.length) return ''; const avg = xs.reduce((s, x) => s + x.m.pct, 0) / xs.length; return '<div class="nf-ep-bar"><span>' + r + ' <small>(' + xs.length + ')</small></span><div><i style="width:' + Math.min(100, avg / 1.5) + '%" class="' + statusClass(statusFor(avg)) + '"></i><b style="left:' + (100 / 1.5) + '%"></b></div><em>' + avg.toFixed(1) + '%</em></div>'; }).join('');
    const statusDist = ['Target Achieved','On Track','Attention Required','Below Target'].map(s => { const n = list.filter(x => x.m.status === s).length; return '<button class="nf-ep-dist ' + statusClass(s) + (st.perf === s ? ' on' : '') + '" onclick="nfEp.set(\'perf\',' + (st.perf === s ? "''" : "'" + s + "'") + ')"><b>' + n + '</b><span>' + s + '</span></button>'; }).join('');
    const pages = Math.max(1, Math.ceil(list.length / st.size)); if (st.page >= pages) st.page = pages - 1;
    const shown = list.slice(st.page * st.size, st.page * st.size + st.size);
    const th = (k, l) => '<th><button class="nf-ep-sort' + (st.sort === k ? ' on' : '') + '" onclick="nfEp.sort(\'' + k + '\')">' + l + ' <span>' + (st.sort === k ? (st.dir > 0 ? '▲' : '▼') : '↕') + '</span></button></th>';
    const chips = Object.keys(CHIPS).filter(k => st[k] !== '').map(k => '<span class="nf-ep-chip">' + CHIPS[k] + ': <b>' + esc(k === 'manager' ? byId[st[k]]?.name : st[k]) + '</b><button onclick="nfEp.set(\'' + k + '\',\'\')" aria-label="Remove filter">×</button></span>').join('');
    $('#content').innerHTML =
      '<div class="page-head"><div><h2>Employee Performance</h2><p>Organization-wide employee productivity, targets, achievements and business contribution. Read-only oversight · demo targets and incentive rules.</p></div><div class="nf-ep-headbtns"><button class="ghost-btn" onclick="nfEp.config()">⚙ Targets & Incentive Master</button></div></div>' +
      '<div class="nf-ep-bar-wrap">' +
        '<div class="nf-ep-search"><input id="nfEpQ" placeholder="Search employee, ID, role, branch, manager…" value="' + esc(st.q) + '">' + (st.q ? '<button onclick="nfEp.set(\'q\',\'\')" aria-label="Clear search">×</button>' : '') + '</div>' +
        '<div class="nf-ep-seg">' + ['month','quarter','year'].map(t => '<button class="' + (st.ptype === t ? 'on' : '') + '" onclick="nfEp.ptype(\'' + t + '\')">' + ({month:'Month',quarter:'Quarter',year:'Year'})[t] + '</button>').join('') + '</div>' +
        '<select onchange="nfEp.set(\'pkey\',this.value)" aria-label="Period">' + P[st.ptype].map(p => '<option value="' + p.key + '"' + (p.key === period.key ? ' selected' : '') + '>' + p.label + '</option>').join('') + '</select>' +
        '<select onchange="nfEp.set(\'dept\',this.value)" aria-label="Department">' + opts(uniq(e => e.dept), st.dept, 'All departments') + '</select>' +
        '<select onchange="nfEp.set(\'role\',this.value)" aria-label="Role">' + opts(uniq(e => e.role), st.role, 'All roles') + '</select>' +
        '<select class="nf-ep-opt" onchange="nfEp.set(\'region\',this.value)" aria-label="Region">' + opts(uniq(e => regionOf(e.branch)), st.region, 'All regions') + '</select>' +
        '<select class="nf-ep-opt" onchange="nfEp.set(\'state\',this.value)" aria-label="State">' + opts(uniq(e => e.state), st.state, 'All states') + '</select>' +
        '<select class="nf-ep-opt" onchange="nfEp.set(\'branch\',this.value)" aria-label="Branch">' + opts(uniq(e => e.branch), st.branch, 'All branches') + '</select>' +
        '<button class="ghost-btn" onclick="nfEp.toggle(\'panel\')">⚲ Filter</button>' +
        '<div class="nf-ep-exp"><button class="primary-btn" onclick="nfEp.toggle(\'exp\')">⇩ Export ▾</button>' + (st.exp ? '<div class="nf-ep-menu">' + [['xlsx','Excel (.xlsx)'],['csv','CSV (.csv)'],['pdf','PDF report'],['print','Print view'],['json','JSON']].map(f => '<button onclick="nfEp.export(\'' + f[0] + '\')">' + f[1] + '</button>').join('') + '<small>' + (filterSummary() === 'None' ? 'Exports all ' + list.length + ' employees' : 'Exports ' + list.length + ' filtered employees') + '</small></div>' : '') + '</div>' +
      '</div>' +
      (st.panel ? '<div class="nf-ep-panel">' +
        '<label>Region<select onchange="nfEp.set(\'region\',this.value)">' + opts(uniq(e => regionOf(e.branch)), st.region, 'All') + '</select></label>' +
        '<label>State<select onchange="nfEp.set(\'state\',this.value)">' + opts(uniq(e => e.state), st.state, 'All') + '</select></label>' +
        '<label>Branch<select onchange="nfEp.set(\'branch\',this.value)">' + opts(uniq(e => e.branch), st.branch, 'All') + '</select></label>' +
        '<label>Reporting manager<select onchange="nfEp.set(\'manager\',this.value)">' + opts(E.filter(e => children(e.id).length).map(e => [e.id, e.name + ' (' + e.role + ')']), st.manager, 'All') + '</select></label>' +
        '<label>Employment status<select onchange="nfEp.set(\'status\',this.value)">' + opts(uniq(e => e.status), st.status, 'All') + '</select></label>' +
        '<label>Performance status<select onchange="nfEp.set(\'perf\',this.value)">' + opts(['Target Achieved','On Track','Attention Required','Below Target'], st.perf, 'All') + '</select></label>' +
        '<label>Product contribution<select onchange="nfEp.set(\'product\',this.value)">' + opts(PRODUCTS, st.product, 'All') + '</select></label>' +
        '<label>Joined from<input type="date" value="' + st.dojFrom + '" onchange="nfEp.set(\'dojFrom\',this.value)"></label>' +
        '<label>Joined to<input type="date" value="' + st.dojTo + '" onchange="nfEp.set(\'dojTo\',this.value)"></label>' +
        '<label>Achievement % min<input type="number" value="' + st.minPct + '" onchange="nfEp.set(\'minPct\',this.value)"></label>' +
        '<label>Achievement % max<input type="number" value="' + st.maxPct + '" onchange="nfEp.set(\'maxPct\',this.value)"></label>' +
        '<div class="nf-ep-panel-act"><button class="ghost-btn" onclick="nfEp.reset()">Reset filters</button></div></div>' : '') +
      '<div class="nf-ep-chips"><span class="nf-ep-count">Showing <b>' + list.length + '</b> of ' + E.length + ' employees · ' + esc(period.label) + '</span>' + chips + (chips ? '<button class="link-btn" onclick="nfEp.reset()">Clear all</button>' : '') + '</div>' +
      '<div class="nf-ep-kpis">' + cards.map(c => '<div class="nf-ep-kpi' + (c[3] ? ' click' : '') + '"' + (c[3] && c[3] !== 'disb' ? ' onclick="nfEp.set(\'perf\',\'' + c[3] + '\')"' : '') + '><span>' + c[0] + '</span><strong>' + c[1] + '</strong><small>' + c[2] + '</small></div>').join('') + '</div>' +
      '<div class="nf-ep-grid">' +
        '<div class="workflow-card"><h3>Sales achievement by hierarchy level</h3><p class="muted">Average achievement % · marker = 100% target</p>' + (roleBars || '<p class="muted">No sales employees in view.</p>') + '</div>' +
        '<div class="workflow-card"><h3>Performance distribution</h3><p class="muted">Click to filter</p><div class="nf-ep-dists">' + statusDist + '</div></div>' +
        '<div class="workflow-card"><h3>BSO leaderboard</h3><p class="muted">Top achievers · ' + esc(period.label) + '</p><ol class="nf-ep-lead">' + (top.map((x, i) => '<li onclick="nfEp.open(\'' + x.e.id + '\')"><b>' + (i + 1) + '</b><span class="nf-ep-av">' + initials(x.e.name) + '</span><div>' + esc(x.e.name) + '<small>' + esc(x.e.branch) + '</small></div><em>' + x.m.pct + '%</em></li>').join('') || '<li class="muted">No BSOs in view</li>') + '</ol></div>' +
      '</div>' +
      '<div class="workflow-card"><div class="nf-ep-tablewrap"><table class="data-table nf-ep-table"><thead><tr>' + th('id','Employee') + th('role','Role / Dept') + th('branch','Branch / Region') + '<th>Reports to</th>' + th('target','Target') + th('ach','Achievement') + th('pct','Ach. %') + th('cases','Cases') + th('disb','Disbursed') + th('conv','Conv. %') + th('comm','Incentive') + '<th>Status</th><th></th></tr></thead><tbody>' +
      (shown.map(({ e, m }) => '<tr><td><div class="nf-ep-emp"><span class="nf-ep-av">' + initials(e.name) + '</span><div><b>' + esc(e.name) + '</b><small>' + e.id + ' · Joined ' + fmtDate(e.join) + (e.status !== 'Active' ? ' · ' + e.status : '') + '</small></div></div></td><td>' + esc(e.role) + '<small>' + esc(e.dept) + '</small></td><td>' + esc(e.branch) + '<small>' + esc(regionOf(e.branch)) + ' · ' + e.state + '</small></td><td>' + esc(manager(e)?.name || '—') + '</td><td>' + fmtAch(e, m.target) + '</td><td>' + fmtAch(e, m.achievement) + '<small>Gap ' + fmtAch(e, m.gap) + '</small></td><td><div class="nf-ep-pct"><i style="width:' + Math.min(100, m.pct) + '%" class="' + statusClass(m.status) + '"></i></div><b>' + m.pct + '%</b></td><td>' + m.rows.length + '<small>' + m.approved.length + ' approved · ' + m.rejected.length + ' rej.</small></td><td>' + m.disb.length + '</td><td>' + m.conversion + '%</td><td>' + (m.commission ? inr(m.commission.total) : '—') + '</td><td><span class="badge ' + statusClass(m.status) + '">' + m.status + '</span></td><td><button class="ghost-btn" onclick="nfEp.open(\'' + e.id + '\')">View Profile</button></td></tr>').join('') || '<tr><td colspan="13" class="muted" style="text-align:center;padding:24px">No employees match these filters.</td></tr>') +
      '</tbody></table></div>' +
      '<div class="nf-ep-pager"><span>Page ' + (st.page + 1) + ' of ' + pages + '</span><div><label>Rows <select onchange="nfEp.size(this.value)">' + [10,25,50,100].map(n => '<option' + (n === st.size ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><button class="ghost-btn" ' + (st.page ? '' : 'disabled') + ' onclick="nfEp.page(-1)">Previous</button><button class="ghost-btn" ' + (st.page < pages - 1 ? '' : 'disabled') + ' onclick="nfEp.page(1)">Next</button></div></div></div>';
    const q = document.getElementById('nfEpQ');
    if (q) { q.oninput = () => { st.q = q.value; st.page = 0; clearTimeout(q._t); q._t = setTimeout(() => { renderList(); const n = document.getElementById('nfEpQ'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); }; }
  }

  // ---------- Employee 360 ----------
  const drill = { id:'', kind:'disb', product:'' };
  function render360(id) {
    attribute();
    const e = byId[id]; if (!e) return renderList();
    if (drill.id !== id) { drill.id = id; drill.kind = 'disb'; drill.product = ''; }
    const period = currentPeriod();
    const m = metrics(e, period.months);
    const mgr = manager(e);
    setPage('Employee Performance 360', 'Case Docs & Audit Trail / Employee Performance / ' + e.name);
    const P = periodsAvailable();
    const trend = [...P.month].reverse().map(p => { const x = metrics(e, p.months); return { label: p.label, x }; });
    const maxV = Math.max(1, ...trend.map(t => Math.max(t.x.achievement, t.x.target)));
    const quarters = [...P.quarter].reverse().map(p => ({ label: p.label, x: metrics(e, p.months) }));
    const years = [...P.year].reverse().map(p => ({ label: p.label, x: metrics(e, p.months) }));
    const prodRows = PRODUCTS.map(pr => { const rs = m.rows.filter(r => r.a.product === pr), ds = rs.filter(r => DISBURSED.includes(r.a.status)); return { pr, cases: rs.length, disb: ds.length, amt: ds.reduce((s, r) => s + (+r.a.amount || 0), 0) }; });
    const kinds = { all:['All cases', m.rows], logged:['Applications logged', m.logged], approved:['Approved', m.approved], disb:['Disbursed', m.disb], rejected:['Rejected', m.rejected], pending:['Pending', m.rows.filter(r => !APPROVED.includes(r.a.status) && r.a.status !== 'Rejected')] };
    let caseList = kinds[drill.kind][1]; if (drill.product) caseList = caseList.filter(r => r.a.product === drill.product);
    const team = children(e.id).map(c => ({ c, x: metrics(c, period.months) }));
    const c = m.commission;
    const hist = isSales(e) ? [...P.month].reverse().map(p => { const x = metrics(e, p.months); return { label: p.label, x }; }) : [];
    const card = (k, l, v, sub) => '<button class="nf-ep-kpi click' + (drill.kind === k ? ' on' : '') + '" onclick="nfEp.drill(\'' + k + '\')"><span>' + l + '</span><strong>' + v + '</strong><small>' + sub + '</small></button>';
    $('#content').innerHTML =
      '<div class="nf-ep-360head"><button class="ghost-btn" onclick="navTo(\'' + VIEW + '\')">← All employees</button><div class="nf-ep-who"><span class="nf-ep-av xl">' + initials(e.name) + '</span><div><h2>' + esc(e.name) + ' <small>' + e.id + '</small></h2><p>' + esc(e.designation) + ' · ' + esc(e.dept) + ' Department</p><p class="muted">' + esc(e.branch) + ' · ' + esc(regionOf(e.branch)) + ' · ' + e.state + ' · Joined ' + fmtDate(e.join) + ' · Reports to ' + esc(mgr ? mgr.name + ' (' + mgr.role + ')' : '—') + '</p></div><span class="badge ' + (e.status === 'Active' ? 'green' : 'amber') + '">' + e.status + '</span></div>' +
      '<div class="nf-ep-360act"><div class="nf-ep-seg">' + ['month','quarter','year'].map(t => '<button class="' + (st.ptype === t ? 'on' : '') + '" onclick="nfEp.ptype(\'' + t + '\',\'' + e.id + '\')">' + ({month:'Month',quarter:'Quarter',year:'Year'})[t] + '</button>').join('') + '</div><select onchange="nfEp.period(this.value,\'' + e.id + '\')">' + P[st.ptype].map(p => '<option value="' + p.key + '"' + (p.key === period.key ? ' selected' : '') + '>' + p.label + '</option>').join('') + '</select><button class="primary-btn" onclick="nfEp.export360(\'' + e.id + '\')">⇩ Detailed Excel</button></div></div>' +
      '<div class="nf-ep-hero"><div><span>' + kpiLabel(e) + ' target · ' + esc(period.label) + '</span><strong>' + fmtAch(e, m.target) + '</strong></div><div><span>Achievement</span><strong>' + fmtAch(e, m.achievement) + '</strong></div><div><span>Achievement %</span><strong>' + m.pct + '%</strong><div class="nf-ep-pct lg"><i style="width:' + Math.min(100, m.pct) + '%" class="' + statusClass(m.status) + '"></i></div></div><div><span>Gap to target</span><strong>' + fmtAch(e, m.gap) + '</strong></div><div><span>Status</span><strong><span class="badge ' + statusClass(m.status) + '">' + m.status + '</span></strong></div></div>' +
      '<div class="nf-ep-kpis">' + card('all','Cases handled', m.rows.length, isSales(e) && e.role !== 'BSO' ? 'team roll-up' : 'own portfolio') + card('logged','Applications logged', m.logged.length, 'excl. drafts') + card('approved','Approved', m.approved.length, 'sanctioned onwards') + card('disb','Disbursed', m.disb.length, cr(m.disb.reduce((s, r) => s + (+r.a.amount || 0), 0))) + card('rejected','Rejected', m.rejected.length, '') + card('pending','Pending', kinds.pending[1].length, 'in pipeline') + '<div class="nf-ep-kpi"><span>Conversion</span><strong>' + m.conversion + '%</strong><small>disbursed ÷ cases</small></div></div>' +
      '<div class="nf-ep-grid two">' +
        '<div class="workflow-card"><h3>Monthly target vs achievement</h3><p class="muted">Bar = achievement · line = target</p><div class="nf-ep-trend">' + trend.map(t => '<div title="' + esc(t.label + ': ' + fmtAch(e, t.x.achievement) + ' of ' + fmtAch(e, t.x.target) + ' (' + t.x.pct + '%)') + '"><div class="col"><i class="' + statusClass(t.x.status) + '" style="height:' + (t.x.achievement / maxV * 100) + '%"></i><b style="bottom:' + (t.x.target / maxV * 100) + '%"></b></div><small>' + t.label.slice(0, 3) + '</small><em>' + t.x.pct + '%</em></div>').join('') + '</div></div>' +
        '<div class="workflow-card"><h3>Product-wise contribution</h3><p class="muted">Click a product to see its cases</p><table class="data-table"><thead><tr><th>Product</th><th>Cases</th><th>Disbursed</th><th>Amount</th><th>Share</th></tr></thead><tbody>' + prodRows.map(r => '<tr class="nf-ep-rowlink' + (drill.product === r.pr ? ' on' : '') + '" onclick="nfEp.product(\'' + r.pr + '\')"><td>' + r.pr + '</td><td>' + r.cases + '</td><td>' + r.disb + '</td><td>' + cr(r.amt) + '</td><td>' + (m.disb.length ? Math.round(r.disb / m.disb.length * 100) : 0) + '%</td></tr>').join('') + '</tbody></table></div>' +
      '</div>' +
      '<div class="nf-ep-grid two">' +
        '<div class="workflow-card"><h3>Quarterly performance</h3><table class="data-table"><thead><tr><th>Quarter</th><th>Target</th><th>Achievement</th><th>%</th><th>Status</th></tr></thead><tbody>' + quarters.map(q => '<tr><td>' + q.label + '</td><td>' + fmtAch(e, q.x.target) + '</td><td>' + fmtAch(e, q.x.achievement) + '</td><td>' + q.x.pct + '%</td><td><span class="badge ' + statusClass(q.x.status) + '">' + q.x.status + '</span></td></tr>').join('') + '</tbody></table></div>' +
        '<div class="workflow-card"><h3>Annual performance (FY Apr–Mar)</h3><table class="data-table"><thead><tr><th>Financial year</th><th>Annual target</th><th>Achievement</th><th>%</th></tr></thead><tbody>' + years.map(y => '<tr><td>' + y.label + '</td><td>' + fmtAch(e, y.x.target) + '</td><td>' + fmtAch(e, y.x.achievement) + '</td><td>' + y.x.pct + '%</td></tr>').join('') + '</tbody></table><p class="muted" style="margin-top:8px">Annual target = 12 × monthly target; demo data covers part of each year.</p></div>' +
      '</div>' +
      (c ? '<div class="nf-ep-grid two"><div class="workflow-card"><h3>Commission / incentive · ' + esc(period.label) + '</h3><p class="muted">Demo calculation from the Incentive Master</p><dl class="nf-ep-calc"><dt>Eligible disbursement</dt><dd>' + inr(c.eligible) + '</dd><dt>Applicable rate (at ' + m.pct + '%)</dt><dd>' + c.rate.toFixed(2) + '%</dd><dt>Base incentive</dt><dd>' + inr(c.base) + '</dd><dt>Target bonus</dt><dd>' + inr(c.bonus) + '</dd><dt>Product bonus</dt><dd>' + inr(c.product) + '</dd><dt>Adjustments</dt><dd>' + inr(c.adjustments) + '</dd><dt class="tot">Total earned</dt><dd class="tot">' + inr(c.total) + '</dd><dt>Paid</dt><dd>' + inr(c.paid) + '</dd><dt>Pending</dt><dd>' + inr(c.pending) + '</dd></dl></div>' +
        '<div class="workflow-card"><h3>Incentive history</h3><table class="data-table"><thead><tr><th>Month</th><th>Ach. %</th><th>Rate</th><th>Earned</th><th>Status</th></tr></thead><tbody>' + hist.map(h => '<tr><td>' + h.label + '</td><td>' + h.x.pct + '%</td><td>' + h.x.commission.rate.toFixed(2) + '%</td><td>' + inr(h.x.commission.total) + '</td><td>' + (h.x.commission.total ? '<span class="badge ' + (h.x.commission.paid ? 'green' : 'amber') + '">' + (h.x.commission.paid ? 'Paid' : 'Pending') + '</span>' : '—') + '</td></tr>').join('') + '</tbody></table></div></div>' : '') +
      (team.length ? '<div class="workflow-card"><h3>Direct team · ' + team.length + ' reportees</h3><p class="muted">Each case counts once per level; organisation totals are built from BSO attribution only.</p><table class="data-table"><thead><tr><th>Employee</th><th>Role</th><th>Branch</th><th>Target</th><th>Achievement</th><th>%</th><th>Status</th><th></th></tr></thead><tbody>' + team.map(({ c: t, x }) => '<tr><td><b>' + esc(t.name) + '</b><small>' + t.id + '</small></td><td>' + t.role + '</td><td>' + esc(t.branch) + '</td><td>' + fmtAch(t, x.target) + '</td><td>' + fmtAch(t, x.achievement) + '</td><td>' + x.pct + '%</td><td><span class="badge ' + statusClass(x.status) + '">' + x.status + '</span></td><td><button class="ghost-btn" onclick="nfEp.open(\'' + t.id + '\')">View</button></td></tr>').join('') + '</tbody></table></div>' : '') +
      '<div class="workflow-card" id="nfEpCases"><div class="nf-ep-casehead"><div><h3>' + kinds[drill.kind][0] + (drill.product ? ' · ' + drill.product : '') + ' <small>(' + caseList.length + ')</small></h3><p class="muted">Contributing cases for ' + esc(period.label) + ' · opens read-only case view</p></div>' + (drill.product ? '<button class="link-btn" onclick="nfEp.product(\'\')">Clear product</button>' : '') + '</div><div class="nf-ep-tablewrap"><table class="data-table"><thead><tr><th>Case ID</th><th>Customer</th><th>Product</th><th>Branch</th><th>Amount</th><th>Status</th><th>Created</th><th>BSO</th><th></th></tr></thead><tbody>' +
      (caseList.slice(0, 200).map(r => '<tr><td><b>' + esc(r.a.id) + '</b></td><td>' + esc(r.a.customer) + '</td><td>' + esc(r.a.product) + '</td><td>' + esc(r.a.branch) + '</td><td>' + inr(r.a.amount) + '</td><td><span class="badge ' + (typeof window.statusClass === 'function' ? window.statusClass(r.a.status) : '') + '">' + esc(r.a.status) + '</span></td><td>' + esc(r.a.created || '') + '</td><td>' + esc(byId[r.bso]?.name || '') + '</td><td><button class="ghost-btn" onclick="navTo(\'case\',\'' + esc(r.a.id) + '\')">View</button></td></tr>').join('') || '<tr><td colspan="9" class="muted" style="text-align:center;padding:20px">No cases in this period.</td></tr>') +
      '</tbody></table></div>' + (caseList.length > 200 ? '<p class="muted">Showing first 200 of ' + caseList.length + '.</p>' : '') + '</div>';
  }

  // ---------- Exports ----------
  function download(name, mime, content) { const blob = content instanceof Blob ? content : new Blob([content], { type: mime }); const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); }
  function xlsx(sheets) {
    const enc = new TextEncoder();
    const col = i => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = (i - 1 - m) / 26; } return s; };
    const cell = (v, r, c, s) => { const ref = col(c) + r; if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"' + (s ? ' s="' + s + '"' : '') + '><v>' + v + '</v></c>'; return '<c r="' + ref + '" t="inlineStr"' + (s ? ' s="' + s + '"' : '') + '><is><t xml:space="preserve">' + esc(v) + '</t></is></c>'; };
    const sheetXml = sh => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + sh.rows.map((row, ri) => '<row r="' + (ri + 1) + '">' + row.map((v, ci) => cell(v, ri + 1, ci, ri === 0 ? 2 : ri === sh.header ? 1 : 0)).join('') + '</row>').join('') + '</sheetData></worksheet>';
    const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="13"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F2747"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>';
    const files = {
      '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map((s, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') + '</Types>',
      '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sheets.map((s, i) => '<sheet name="' + esc(s.name.slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((s, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('') + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml': styles
    };
    sheets.forEach((s, i) => { files['xl/worksheets/sheet' + (i + 1) + '.xml'] = sheetXml(s); });
    const T = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; T[n] = c; }
    const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
    const parts = [], central = []; let off = 0;
    Object.keys(files).forEach(name => {
      const nb = enc.encode(name), db = enc.encode(files[name]), crc = crc32(db);
      const L = new DataView(new ArrayBuffer(30)); L.setUint32(0, 0x04034b50, true); L.setUint16(4, 20, true); L.setUint16(6, 0x0800, true); L.setUint32(14, crc, true); L.setUint32(18, db.length, true); L.setUint32(22, db.length, true); L.setUint16(26, nb.length, true);
      parts.push(new Uint8Array(L.buffer), nb, db);
      const C = new DataView(new ArrayBuffer(46)); C.setUint32(0, 0x02014b50, true); C.setUint16(4, 20, true); C.setUint16(6, 20, true); C.setUint16(8, 0x0800, true); C.setUint32(16, crc, true); C.setUint32(20, db.length, true); C.setUint32(24, db.length, true); C.setUint16(28, nb.length, true); C.setUint32(42, off, true);
      central.push(new Uint8Array(C.buffer), nb); off += 30 + nb.length + db.length;
    });
    const size = central.reduce((s, c) => s + c.length, 0), n = Object.keys(files).length;
    const END = new DataView(new ArrayBuffer(22)); END.setUint32(0, 0x06054b50, true); END.setUint16(8, n, true); END.setUint16(10, n, true); END.setUint32(12, size, true); END.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(END.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  const COLS = ['Employee ID','Employee Name','Role','Designation','Department','Date of Joining','Employment Status','Branch','City','State','Region','Reporting Manager','Hierarchy Level','KPI','Period','Target','Achievement','Achievement %','Target Gap','Cases Handled','Applications Logged','Approved','Disbursed','Rejected','Conversion %','Incentive Earned (₹)','Incentive Paid (₹)','Incentive Pending (₹)','Performance Status'];
  const rowOf = (e, m, period) => [e.id, e.name, e.role, e.designation, e.dept, e.join, e.status, e.branch, e.city, e.state, regionOf(e.branch), manager(e)?.name || '', e.level, kpiLabel(e), period.label, Math.round(m.target), Math.round(m.achievement), m.pct, Math.round(m.gap), m.rows.length, m.logged.length, m.approved.length, m.disb.length, m.rejected.length, m.conversion, m.commission?.total ?? '', m.commission?.paid ?? '', m.commission?.pending ?? '', m.status];
  const fname = (ext, period) => 'Employee_Performance_' + [period.label, ...['dept','role','region','branch','perf'].map(k => st[k]).filter(Boolean)].map(p => String(p).replace(/[^A-Za-z0-9]+/g, '_')).join('_') + '_' + new Date().toISOString().slice(0, 10) + '.' + ext;
  const csvCell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function logExport(label, count, period, extra) { try { if (typeof nfAudit === 'function') nfAudit('', 'Employee Performance Report Exported', label + ' · ' + count + ' employees · ' + period.label, { category: 'EXPORT', reason: 'Filters: ' + filterSummary(), result: count + ' employees exported' + (extra || '') }); } catch (e) {} }
  function doExport(fmt) {
    attribute();
    const period = currentPeriod();
    const list = sorted(filtered(period));
    const rows = list.map(x => rowOf(x.e, x.m, period));
    const meta = 'Generated ' + new Date().toLocaleString('en-IN') + ' by ' + currentUser.name + ' (' + currentUser.role + ') · ' + period.label + ' · Filters: ' + filterSummary() + ' · Demo targets and incentive rules';
    let label = fmt.toUpperCase();
    if (fmt === 'xlsx') download(fname('xlsx', period), '', xlsx([{ name: 'Employee Performance', header: 2, rows: [['NAMDEV FINVEST LTD. — Employee Performance Report'], [meta], COLS, ...rows] }]));
    else if (fmt === 'csv') download(fname('csv', period), 'text/csv;charset=utf-8', '\uFEFF' + [[meta], COLS, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n'));
    else if (fmt === 'json') download(fname('json', period), 'application/json', JSON.stringify({ generated: new Date().toISOString(), period: period.label, filters: filterSummary(), employees: rows.map(r => Object.fromEntries(COLS.map((c, i) => [c, r[i]]))) }, null, 2));
    else if (fmt === 'pdf' || fmt === 'print') {
      label = fmt === 'pdf' ? 'PDF' : 'Print';
      const w = window.open('', '_blank'); if (!w) { showToast('Allow pop-ups to open the report'); return; }
      const pick = [0,1,2,7,10,15,16,17,22,24,25,28];
      w.document.write('<html><head><title>' + esc(fname('pdf', period)) + '</title><style>body{font:11px Arial;margin:24px;color:#0f2747}h1{font-size:16px;margin:0}p{color:#555}table{border-collapse:collapse;width:100%;margin-top:12px}th{background:#0f2747;color:#fff;text-align:left;padding:5px}td{border-bottom:1px solid #ddd;padding:4px 5px}</style></head><body><h1>NAMDEV FINVEST LTD. — Employee Performance Report</h1><p>' + esc(meta) + '</p><table><thead><tr>' + pick.map(i => '<th>' + esc(COLS[i]) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + pick.map(i => '<td>' + esc(typeof r[i] === 'number' && i >= 15 && i <= 16 ? r[i].toLocaleString('en-IN') : r[i]) + '</td>').join('') + '</tr>').join('') + '</tbody></table><p>Demo report · read-only CEO oversight · ' + rows.length + ' employees</p><script>setTimeout(()=>print(),300)<\/script></body></html>');
      w.document.close();
    }
    st.exp = false;
    logExport(label, rows.length, period);
    showToast(label + ' export ready · ' + rows.length + ' employees');
    renderList();
  }
  function export360(id) {
    attribute();
    const e = byId[id], period = currentPeriod(), m = metrics(e, period.months), P = periodsAvailable();
    const per = list => [['Period','Target','Achievement','Achievement %','Status','Cases','Disbursed','Incentive (₹)'], ...list.map(p => { const x = metrics(e, p.months); return [p.label, Math.round(x.target), Math.round(x.achievement), x.pct, x.status, x.rows.length, x.disb.length, x.commission?.total ?? '']; })];
    const sheets = [
      { name: 'Employee Summary', header: 2, rows: [['Employee Performance 360 — ' + e.name], ['Period ' + period.label + ' · demo data'], ['Field','Value'], ...COLS.map((c, i) => [c, rowOf(e, m, period)[i]])] },
      { name: 'Monthly Performance', header: 0, rows: per([...P.month].reverse()) },
      { name: 'Quarterly Performance', header: 0, rows: per([...P.quarter].reverse()) },
      { name: 'Annual Performance', header: 0, rows: per([...P.year].reverse()) },
      { name: 'Product Performance', header: 0, rows: [['Product','Cases','Disbursed','Disbursed Amount (₹)'], ...PRODUCTS.map(pr => { const rs = m.rows.filter(r => r.a.product === pr), ds = rs.filter(r => DISBURSED.includes(r.a.status)); return [pr, rs.length, ds.length, ds.reduce((s, r) => s + (+r.a.amount || 0), 0)]; })] },
      { name: 'Case Performance', header: 0, rows: [['Case ID','Customer','Product','Branch','Amount (₹)','Status','Created','BSO'], ...m.rows.map(r => [r.a.id, r.a.customer, r.a.product, r.a.branch, +r.a.amount || 0, r.a.status, r.a.created || '', byId[r.bso]?.name || ''])] },
      { name: 'Commission Incentive', header: 0, rows: m.commission ? [['Item','Value'], ['Eligible disbursement (₹)', m.commission.eligible], ['Applicable rate %', m.commission.rate], ['Base incentive (₹)', m.commission.base], ['Target bonus (₹)', m.commission.bonus], ['Product bonus (₹)', m.commission.product], ['Total earned (₹)', m.commission.total], ['Paid (₹)', m.commission.paid], ['Pending (₹)', m.commission.pending]] : [['Not applicable for this department']] }
    ];
    download('Employee_360_' + e.id + '_' + e.name.replace(/\W+/g, '_') + '_' + period.label.replace(/\W+/g, '_') + '.xlsx', '', xlsx(sheets));
    try { if (typeof nfAudit === 'function') nfAudit('', 'Employee 360 Report Exported', 'XLSX · ' + e.id + ' · ' + period.label, { category: 'EXPORT', result: '7 sheets exported' }); } catch (x) {}
    showToast('Employee 360 workbook downloaded');
  }

  // ---------- Configuration (view for CEO; editable by HR Manager / System Admin) ----------
  function openConfig() {
    const ro = !canConfigure();
    const dis = ro ? ' disabled' : '';
    const ov = document.createElement('div'); ov.className = 'nf-ep-overlay';
    ov.innerHTML = '<div class="nf-ep-modal" role="dialog" aria-label="Targets and Incentive Master"><header><div><h3>Targets & Incentive Master</h3><p class="muted">Demo configuration · ' + (ro ? 'view-only for ' + esc(currentUser.role) + ' (editable by HR Manager / System Admin)' : 'changes apply instantly across the module') + '</p></div><button class="ghost-btn" data-x>×</button></header><div class="nf-ep-modal-body">' +
      '<h4>Monthly disbursement target (₹)</h4><div class="nf-ep-cfg">' + SALES.map(r => '<label>' + r + '<input type="number" min="0" data-mt="' + r + '" value="' + CFG.monthlyTarget[r] + '"' + dis + '></label>').join('') + '</div>' +
      '<h4>Monthly case target per person</h4><div class="nf-ep-cfg">' + Object.keys(CFG.countTarget).map(d => '<label>' + d + '<input type="number" min="0" data-ct="' + d + '" value="' + CFG.countTarget[d] + '"' + dis + '></label>').join('') + '</div>' +
      '<h4>Performance status thresholds (%)</h4><div class="nf-ep-cfg"><label>Target achieved ≥<input type="number" data-st="achieved" value="' + CFG.status.achieved + '"' + dis + '></label><label>On track ≥<input type="number" data-st="onTrack" value="' + CFG.status.onTrack + '"' + dis + '></label><label>Attention ≥<input type="number" data-st="attention" value="' + CFG.status.attention + '"' + dis + '></label></div>' +
      '<h4>Incentive slabs (% of eligible disbursement)</h4><div class="nf-ep-cfg">' + CFG.slabs.map((s, i) => '<label>From ' + s.from + '% ach.<input type="number" step="0.01" data-slab="' + i + '" value="' + s.rate + '"' + dis + '></label>').join('') + '</div>' +
      '<h4>Target bonus per month (₹)</h4><div class="nf-ep-cfg">' + SALES.map(r => '<label>' + r + '<input type="number" min="0" data-tb="' + r + '" value="' + CFG.targetBonus[r] + '"' + dis + '></label>').join('') + '</div>' +
      '<h4>Product bonus (% of product disbursement)</h4><div class="nf-ep-cfg">' + PRODUCTS.map(p => '<label>' + p + '<input type="number" step="0.01" min="0" data-pb="' + p + '" value="' + (CFG.productBonus[p] || 0) + '"' + dis + '></label>').join('') + '</div>' +
      '</div><footer>' + (ro ? '<button class="primary-btn" data-x>Close</button>' : '<button class="ghost-btn" data-reset>Reset to defaults</button><button class="primary-btn" data-save>Save configuration</button>') + '</footer></div>';
    document.body.appendChild(ov);
    ov.querySelectorAll('[data-x]').forEach(b => b.onclick = () => ov.remove());
    ov.onclick = ev => { if (ev.target === ov) ov.remove(); };
    const reset = ov.querySelector('[data-reset]');
    if (reset) reset.onclick = () => { localStorage.removeItem(CFG_KEY); CFG = loadCfg(); ov.remove(); rerender(); showToast('Demo targets restored'); };
    const save = ov.querySelector('[data-save]');
    if (save) save.onclick = () => {
      if (!canConfigure()) return;
      const n = sel => +ov.querySelector(sel).value;
      const next = structuredClone(CFG);
      SALES.forEach(r => { next.monthlyTarget[r] = n('[data-mt="' + r + '"]'); next.targetBonus[r] = n('[data-tb="' + r + '"]'); });
      Object.keys(next.countTarget).forEach(d => next.countTarget[d] = n('[data-ct="' + d + '"]'));
      ['achieved','onTrack','attention'].forEach(k => next.status[k] = n('[data-st="' + k + '"]'));
      next.slabs = next.slabs.map((s, i) => ({ from: s.from, rate: n('[data-slab="' + i + '"]') }));
      PRODUCTS.forEach(p => next.productBonus[p] = n('[data-pb="' + p + '"]'));
      const all = [...Object.values(next.monthlyTarget), ...Object.values(next.countTarget), ...Object.values(next.targetBonus), ...Object.values(next.productBonus), ...next.slabs.map(s => s.rate)];
      if (all.some(v => !isFinite(v) || v < 0)) return showToast('Enter zero or positive numbers only');
      if (!(next.status.achieved > next.status.onTrack && next.status.onTrack > next.status.attention && next.status.attention > 0)) return showToast('Thresholds must be Achieved > On track > Attention > 0');
      localStorage.setItem(CFG_KEY, JSON.stringify(next)); CFG = loadCfg(); ov.remove(); rerender();
      try { if (typeof nfAudit === 'function') nfAudit('', 'Performance Configuration Updated', 'Targets / incentive master updated', { category: 'UPDATE', result: 'Saved' }); } catch (e) {}
      showToast('Configuration saved');
    };
  }

  let current = null;
  const rerender = () => current ? render360(current) : renderList();
  window.nfEp = {
    set(k, v) { st[k] = v; st.page = 0; if (k !== 'exp') st.exp = false; renderList(); },
    toggle(k) { st[k] = !st[k]; renderList(); },
    reset() { Object.keys(CHIPS).forEach(k => st[k] = ''); st.q = ''; st.page = 0; renderList(); },
    sort(k) { if (st.sort === k) st.dir *= -1; else { st.sort = k; st.dir = ['name','id','branch'].includes(k) ? 1 : -1; } renderList(); },
    page(d) { st.page += d; renderList(); },
    size(n) { st.size = +n; st.page = 0; renderList(); },
    ptype(t, id) { st.ptype = t; st.pkey = ''; id ? render360(id) : renderList(); },
    period(k, id) { st.pkey = k; render360(id); },
    open(id) { navTo(VIEW, id); },
    drill(k) { drill.kind = k; render360(drill.id); document.getElementById('nfEpCases')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    product(p) { drill.product = p; render360(drill.id); if (p) document.getElementById('nfEpCases')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    export: doExport, export360, config: openConfig,
    data: (id, periodKey) => { attribute(); if (periodKey) st.pkey = periodKey; const p = currentPeriod(); return id ? metrics(byId[id] || E.find(e => e.name === id), p.months) : E.map(e => ({ e, m: metrics(e, p.months) })); },
    employees: () => E.slice()
  };

  // ---------- Navigation wiring ----------
  const canSee = () => currentUser?.role === 'CEO' || ['System Admin','HR Manager'].includes(currentUser?.role) || (typeof isManager === 'function' && isManager());
  const rcv = roleCanView;
  roleCanView = function(view, role) { if (view === VIEW) { const r = role || currentUser?.role; return r === 'CEO' || ['System Admin','HR Manager','BDM','ASM','RSM','ZSM','CBO','ACM','ZCM','Credit Head'].includes(r); } return rcv.apply(this, arguments); };
  const nav = navTo;
  navTo = function(view, arg) {
    if (view !== VIEW) { current = null; return nav.apply(this, arguments); }
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === VIEW));
    $('#sidebar')?.classList.remove('open');
    if (!canSee()) { setPage('Employee Performance'); $('#content').innerHTML = '<div class="empty-state"><h3>Executive and manager visibility only</h3><p>Employee Performance is available to the CEO, managers, HR and System Admin.</p></div>'; return; }
    current = arg && byId[arg] ? arg : null;
    current ? render360(current) : renderList();
    window.scrollTo?.(0, 0);
  };
  function addNav() {
    const hm = document.querySelector('.nav-item[data-view="hierarchy"]');
    if (!hm || document.querySelector('.nav-item[data-view="' + VIEW + '"]')) return;
    const b = document.createElement('button');
    b.className = 'nav-item'; b.dataset.view = VIEW;
    b.innerHTML = '<span class="nav-icon" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="7" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6"/><path d="M13 20v-4M17 20v-8M21 20V8"/></svg></span><span>Employee Performance</span>';
    hm.after(b);
    if (typeof applyRoleAccess === 'function') try { applyRoleAccess(); } catch (e) {}
  }
  addNav();
  if (typeof window.nfAppViews === 'object') window.nfAppViews[VIEW] = 'Employee Performance';

  const css = document.createElement('style');
  css.textContent =
    '.nf-ep-headbtns{display:flex;gap:8px}.nf-ep-bar-wrap{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 10px}.nf-ep-bar-wrap select,.nf-ep-bar-wrap .ghost-btn,.nf-ep-bar-wrap .primary-btn{height:40px;width:auto}' +
    '.nf-ep-search{position:relative;flex:1 1 260px;min-width:220px}.nf-ep-search input{width:100%;height:40px;padding-right:32px}.nf-ep-search button{position:absolute;right:6px;top:8px;border:0;background:transparent;font-size:18px;cursor:pointer;color:var(--muted,#64748b)}' +
    '.nf-ep-seg{display:inline-flex;border:1px solid var(--line,#e2e8f0);border-radius:10px;overflow:hidden;height:40px}.nf-ep-seg button{border:0;background:transparent;padding:0 12px;font:inherit;font-size:13px;cursor:pointer}.nf-ep-seg button.on{background:var(--primary,#c81e1e);color:#fff}' +
    '.nf-ep-exp{position:relative}.nf-ep-menu{position:absolute;right:0;top:44px;z-index:30;background:var(--card,#fff);border:1px solid var(--line,#e2e8f0);border-radius:12px;box-shadow:0 18px 40px rgba(15,39,71,.18);padding:6px;min-width:210px;display:flex;flex-direction:column}.nf-ep-menu button{border:0;background:transparent;text-align:left;padding:8px 10px;border-radius:8px;cursor:pointer;font:inherit;font-size:13px}.nf-ep-menu button:hover{background:color-mix(in srgb,var(--primary,#c81e1e) 8%,transparent)}.nf-ep-menu small{padding:6px 10px;color:var(--muted,#64748b)}' +
    '.nf-ep-panel{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;padding:14px;border:1px solid var(--line,#e2e8f0);border-radius:12px;background:var(--card,#fff);margin-bottom:10px}.nf-ep-panel label{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:600}.nf-ep-panel input,.nf-ep-panel select{width:100%;height:38px}.nf-ep-panel-act{display:flex;align-items:end}' +
    '.nf-ep-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px;font-size:13px}.nf-ep-count{margin-right:6px}.nf-ep-chip{display:inline-flex;gap:4px;align-items:center;padding:3px 6px 3px 10px;border-radius:99px;background:color-mix(in srgb,var(--primary,#c81e1e) 9%,transparent);font-size:12px}.nf-ep-chip button{border:0;background:transparent;cursor:pointer;font-size:14px}' +
    '.nf-ep-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}.nf-ep-kpi{display:flex;flex-direction:column;gap:3px;text-align:left;padding:14px;border:1px solid var(--line,#e2e8f0);border-radius:12px;background:var(--card,#fff);font:inherit}.nf-ep-kpi span{font-size:11.5px;color:var(--muted,#64748b);text-transform:uppercase;letter-spacing:.04em}.nf-ep-kpi strong{font-size:20px}.nf-ep-kpi small{font-size:12px;color:var(--muted,#64748b)}.nf-ep-kpi.click{cursor:pointer;transition:.15s}.nf-ep-kpi.click:hover,.nf-ep-kpi.on{border-color:var(--primary,#c81e1e);box-shadow:0 6px 18px rgba(15,39,71,.08)}' +
    '.nf-ep-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:14px;margin-bottom:14px}.nf-ep-grid.two{grid-template-columns:1fr 1fr}.nf-ep-grid .workflow-card{margin:0}.nf-ep-grid h3{margin:0}' +
    '.nf-ep-bar{display:grid;grid-template-columns:80px 1fr 56px;gap:8px;align-items:center;margin-top:10px;font-size:13px}.nf-ep-bar>div{position:relative;height:12px;border-radius:99px;background:color-mix(in srgb,var(--muted,#64748b) 14%,transparent)}.nf-ep-bar i{position:absolute;inset:0 auto 0 0;border-radius:99px}.nf-ep-bar b{position:absolute;top:-3px;width:2px;height:18px;background:var(--text,#0f2747)}.nf-ep-bar em{font-style:normal;font-weight:700;text-align:right}' +
    'i.green,.nf-ep-pct i.green{background:#16a34a}i.blue{background:#2563eb}i.amber{background:#d97706}i.red{background:#dc2626}' +
    '.nf-ep-dists{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.nf-ep-dist{display:flex;flex-direction:column;align-items:flex-start;padding:12px;border-radius:10px;border:1px solid var(--line,#e2e8f0);background:transparent;cursor:pointer;font:inherit}.nf-ep-dist b{font-size:20px}.nf-ep-dist span{font-size:12px}.nf-ep-dist.green b{color:#16a34a}.nf-ep-dist.blue b{color:#2563eb}.nf-ep-dist.amber b{color:#d97706}.nf-ep-dist.red b{color:#dc2626}.nf-ep-dist.on{border-color:var(--primary,#c81e1e);background:color-mix(in srgb,var(--primary,#c81e1e) 6%,transparent)}' +
    '.nf-ep-lead{list-style:none;margin:8px 0 0;padding:0}.nf-ep-lead li{display:grid;grid-template-columns:18px 32px 1fr auto;gap:8px;align-items:center;padding:7px 4px;border-bottom:1px solid var(--line,#e2e8f0);cursor:pointer;font-size:13px}.nf-ep-lead small{display:block;color:var(--muted,#64748b);font-size:11.5px}.nf-ep-lead em{font-style:normal;font-weight:700}' +
    '.nf-ep-av{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:50%;background:color-mix(in srgb,var(--primary,#c81e1e) 12%,transparent);color:var(--primary,#c81e1e);font-weight:700;font-size:12px;flex:none}.nf-ep-av.xl{width:56px;height:56px;font-size:18px}' +
    '.nf-ep-tablewrap{overflow-x:auto}.nf-ep-table td small,.nf-ep-table td>small{display:block;color:var(--muted,#64748b);font-size:11.5px}.nf-ep-emp{display:flex;gap:8px;align-items:center;min-width:200px}.nf-ep-emp small{display:block;color:var(--muted,#64748b);font-size:11.5px}.nf-ep-table td{vertical-align:middle;white-space:nowrap}' +
    '.nf-ep-pct{width:70px;height:6px;border-radius:99px;background:color-mix(in srgb,var(--muted,#64748b) 14%,transparent);overflow:hidden;margin-bottom:3px}.nf-ep-pct i{display:block;height:100%}.nf-ep-pct.lg{width:100%;height:8px;margin-top:6px}' +
    '.nf-ep-sort{border:0;background:transparent;font:inherit;font-weight:inherit;color:inherit;cursor:pointer;padding:0;white-space:nowrap}.nf-ep-sort span{opacity:.45;font-size:10px}.nf-ep-sort.on span{opacity:1}' +
    '.nf-ep-pager{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;font-size:12.5px}.nf-ep-pager>div{display:flex;gap:8px;align-items:center}.nf-ep-pager label{display:flex!important;flex-direction:row!important;align-items:center;gap:6px}.nf-ep-pager select{width:auto;height:34px}' +
    '.nf-ep-360head{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:12px}.nf-ep-who{display:flex;gap:12px;align-items:center;flex:1 1 420px}.nf-ep-who h2{margin:0;font-size:22px}.nf-ep-who h2 small{font-size:13px;color:var(--muted,#64748b);font-weight:500}.nf-ep-who p{margin:2px 0;font-size:13px}.nf-ep-360act{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.nf-ep-360act select{height:40px;width:auto}' +
    '.nf-ep-hero{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;border-radius:14px;overflow:hidden;background:var(--line,#e2e8f0);margin-bottom:14px;border:1px solid var(--line,#e2e8f0)}.nf-ep-hero>div{background:var(--card,#fff);padding:16px}.nf-ep-hero span{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#64748b)}.nf-ep-hero strong{display:block;font-size:22px;margin-top:4px}' +
    '.nf-ep-trend{display:flex;gap:8px;align-items:flex-end;height:200px;margin-top:12px}.nf-ep-trend>div{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%}.nf-ep-trend .col{position:relative;flex:1;width:100%;max-width:38px;background:color-mix(in srgb,var(--muted,#64748b) 8%,transparent);border-radius:6px 6px 0 0}.nf-ep-trend .col i{position:absolute;bottom:0;left:0;right:0;border-radius:6px 6px 0 0}.nf-ep-trend .col b{position:absolute;left:-3px;right:-3px;height:2px;background:var(--text,#0f2747)}.nf-ep-trend small{font-size:11px;color:var(--muted,#64748b)}.nf-ep-trend em{font-style:normal;font-size:11px;font-weight:700}' +
    '.nf-ep-rowlink{cursor:pointer}.nf-ep-rowlink:hover,.nf-ep-rowlink.on{background:color-mix(in srgb,var(--primary,#c81e1e) 6%,transparent)}.nf-ep-casehead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.nf-ep-casehead h3{margin:0}' +
    '.nf-ep-calc{display:grid;grid-template-columns:1fr auto;gap:6px 14px;margin:10px 0 0;font-size:13.5px}.nf-ep-calc dt{color:var(--muted,#64748b)}.nf-ep-calc dd{margin:0;text-align:right;font-weight:600}.nf-ep-calc .tot{border-top:1px solid var(--line,#e2e8f0);padding-top:6px;color:var(--text,#0f2747);font-weight:800}' +
    '.nf-ep-overlay{position:fixed;inset:0;z-index:200;background:rgba(15,39,71,.45);display:flex;align-items:center;justify-content:center;padding:20px}.nf-ep-modal{background:var(--card,#fff);border-radius:14px;box-shadow:0 24px 60px rgba(15,39,71,.3);width:min(720px,100%);max-height:88vh;display:flex;flex-direction:column}.nf-ep-modal header,.nf-ep-modal footer{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:16px 18px;border-bottom:1px solid var(--line,#e2e8f0)}.nf-ep-modal footer{border-top:1px solid var(--line,#e2e8f0);border-bottom:0;justify-content:flex-end}.nf-ep-modal h3{margin:0}.nf-ep-modal-body{overflow:auto;padding:4px 18px 16px}.nf-ep-modal h4{margin:16px 0 8px;font-size:13px}.nf-ep-cfg{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}.nf-ep-cfg label{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:600}.nf-ep-cfg input{width:100%;height:38px}' +
    '@media(max-width:1300px){.nf-ep-opt{display:none}.nf-ep-grid:not(.two){grid-template-columns:1fr 1fr}.nf-ep-grid:not(.two)>:first-child{grid-column:1/-1}}@media(max-width:820px){.nf-ep-grid,.nf-ep-grid.two{grid-template-columns:1fr}.nf-ep-hero{grid-template-columns:1fr 1fr}}@media(max-width:560px){.nf-ep-bar-wrap>*{flex:1 1 100%}.nf-ep-seg{justify-content:stretch}.nf-ep-seg button{flex:1}}';
  document.head.appendChild(css);
})();
</script>`;