// CEO oversight profile: read-only case visibility. Demo role guard, not server-side authorization.
export const workflowCeoOversightScript = String.raw`<script>
(() => {
  const isCeo = () => currentUser.role === 'CEO';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CEO_DENY = { sendBack:true };
  const deny = () => { closeModal(); showToast('CEO profile is view-only: approve, reject, send back, remarks and edits are not permitted.'); };

  // Permission layer: CEO never gets operational queues even via overrides.
  if (Array.isArray(BASE_ACCESS.CEO)) BASE_ACCESS.CEO = BASE_ACCESS.CEO.filter(v => !CEO_DENY[v]);
  const canView = roleCanView;
  roleCanView = function(view, role = currentUser.role) { if (role === 'CEO' && CEO_DENY[view]) return false; return canView.apply(this, arguments); };

  // Action layer: block every operational action for CEO regardless of entry point.
  ['decideApproval','remarkApproval','saveApprovalRemark','sendBackCaseModal','createSendBackTask','completeSendBackTask','openMSMEReject','raiseCreditDeviation','startParallelVerification','verifyBureau','openCaseNote','saveCaseNote','nfTractorVerifyDealer','nfTractorPayout','editCaseApplicant','saveCaseApplicant','openDOChecklist','openCentralOps'].forEach(name => {
    const fn = window[name]; if (typeof fn !== 'function') return;
    window[name] = function() { if (isCeo()) return deny(); return fn.apply(this, arguments); };
  });

  // Route layer: direct navigation to operational queues falls back to the Case View Center.
  const nav = navTo;
  navTo = function(view) { if (isCeo() && CEO_DENY[view]) { showToast('Send Back queue is not available for the CEO profile.'); return nav.call(this, 'approvals'); } return nav.apply(this, arguments); };

  // Sidebar labels follow the active role.
  function labels() {
    const ceo = isCeo();
    const g = document.querySelector('.nf-nav-group[data-group="mywork"] .nf-nav-group-toggle');
    if (g) { g.children[0].textContent = ceo ? '🗂' : '✓'; g.children[1].textContent = ceo ? 'Case Docs & Audit Trail' : 'My Work & Approvals'; }
    const ap = document.querySelector('.nav-item[data-view="approvals"]');
    if (ap) { ap.children[0].textContent = ceo ? '🔍' : '✓'; ap.children[1].textContent = ceo ? 'Cases View' : 'Approvals'; }
    const badge = document.getElementById('approvalBadge'); if (badge) badge.style.display = ceo ? 'none' : '';
  }
  const apply = applyRoleAccess;
  applyRoleAccess = function() { const r = apply.apply(this, arguments); labels(); return r; };
  labels();

  const launcher = openAppLauncher;
  openAppLauncher = function() {
    const r = launcher.apply(this, arguments);
    if (isCeo()) document.querySelectorAll('#nfLauncherBody .nf-launch-group').forEach(s => {
      const h = s.querySelector('h4'); if (h && h.textContent === 'My Work') h.textContent = 'Case Docs & Audit Trail';
      s.querySelectorAll('button').forEach(b => { const t = b.querySelector('b'); if (t && t.textContent === 'Approvals') t.textContent = 'Cases View'; });
    });
    return r;
  };

  // Case View Center replaces the approval inbox for CEO only.
  const STAGE = a => a.workflow?.stage || a.stage || a.status;
  const f = { q:'', product:'', branch:'', status:'', owner:'', dept:'', sla:'', grade:'', min:'', max:'', from:'', to:'' };
  const PAGE = 50; let page = 0;
  const owner = a => a.workflow?.ownerRole || '—';
  const dept = a => (owner(a) === '—' ? '—' : roleMeta(owner(a)).dept || '—');
  const DAY = 864e5;
  // Last activity = newest audit event on the case, else the case's created date.
  let lastIdx = new Map();
  function indexActivity() {
    lastIdx = new Map();
    (typeof auditEvents !== 'undefined' ? auditEvents : []).forEach(e => {
      const t = Date.parse(e.ts || e.at || ''); if (!e.caseId || isNaN(t)) return;
      if (!lastIdx.has(e.caseId) || lastIdx.get(e.caseId) < t) lastIdx.set(e.caseId, t);
    });
  }
  const lastAt = a => { const c = Date.parse(a.created || a.date || ''); const l = lastIdx.get(a.id); return Math.max(isNaN(c) ? 0 : c, l || 0) || null; };
  const fmt = t => t ? new Date(t).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
  // SLA & risk-grade rules are configurable (demo): persisted browser-locally, editable from the Case View header.
  const CFG_KEY = 'namdev-ceo-sla-config';
  const CFG_DEFAULT = {
    tat: { 'Draft':5, 'Sales/Predeal':3, 'Credit Review':2, 'CAM Allocation':1, 'CAM Sheet':2, 'Sanctioned':3, 'Disbursement':2 },
    defaultTat: 3, atRiskPct: 75,
    gradeA: 750, gradeB: 700, gradeC: 650,
  };
  function cfg() {
    try {
      const s = JSON.parse(localStorage.getItem(CFG_KEY) || 'null');
      if (s && s.tat) return { ...CFG_DEFAULT, ...s, tat: { ...CFG_DEFAULT.tat, ...s.tat } };
    } catch (e) {}
    return JSON.parse(JSON.stringify(CFG_DEFAULT));
  }
  function saveCfg(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); }
  // SLA: days the case has sat in its current stage vs that stage's TAT target.
  const DONE = ['Active Loan','Disbursed','Closed','Rejected'];
  function sla(a) {
    if (DONE.includes(a.status)) return { s:'Completed', d:'Stage has no open TAT' };
    const c = cfg(), target = +(c.tat[a.status] ?? c.defaultTat) || c.defaultTat, t = lastAt(a);
    if (!t) return { s:'No date', d:'No activity date on case' };
    const age = Math.max(0, Math.floor((Date.now() - t) / DAY));
    const s = age > target ? 'Breached' : age >= target * (c.atRiskPct / 100) ? 'At Risk' : 'On Track';
    return { s, d: age + 'd in ' + a.status + ' · target ' + target + 'd' };
  }
  // Risk grade: bureau score band, downgraded one notch for open deviations, pending approval or send-back.
  function grade(a) {
    const score = +(a.workflow?.creditBureau || a.score) || 0;
    if (!score) return { g:'Not scored', d:'No bureau score on case' };
    const c = cfg();
    let i = score >= c.gradeA ? 0 : score >= c.gradeB ? 1 : score >= c.gradeC ? 2 : 3;
    const flags = [];
    if ((a.workflow?.deviations || []).length) flags.push('deviation');
    if (a.workflow?.approval?.status === 'Pending') flags.push('pending approval');
    if (a.workflow?.sendBack) flags.push('send-back');
    if (flags.length) i = Math.min(3, i + 1);
    return { g:'ABCD'[i], d:'Bureau ' + score + (flags.length ? ' · downgraded: ' + flags.join(', ') : '') };
  }
  // Settings modal: edit stage TAT days, at-risk threshold and grade cut-offs.
  window.nfCeoSlaSettings = function() {
    const c = cfg();
    const num = (k, label, val) => '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)">'+label+'<input data-cfg="'+k+'" type="number" min="0" step="1" value="'+val+'" style="height:40px;width:90px"></label>';
    const stages = Object.keys(c.tat).map(st => num('tat.'+st, st, c.tat[st])).join('');
    showModal('SLA & Risk Grade Settings',
      '<p style="font-size:12px;color:var(--muted);margin-top:0">Demo configuration — saved in this browser and applied to every SLA badge and risk grade in Cases View.</p>'+
      '<h4 style="margin:12px 0 8px">Stage time limits (days)</h4><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">'+stages+num('defaultTat','Other stages',c.defaultTat)+'</div>'+
      '<h4 style="margin:16px 0 8px">At-Risk threshold</h4><div style="display:flex;gap:10px;align-items:center">'+num('atRiskPct','Warn at % of limit',c.atRiskPct)+'<span style="font-size:12px;color:var(--muted)">e.g. 75 = warn when 75% of the stage limit is used up</span></div>'+
      '<h4 style="margin:16px 0 8px">Risk grade cut-offs (bureau score)</h4><div style="display:flex;gap:14px;flex-wrap:wrap">'+num('gradeA','A ≥',c.gradeA)+num('gradeB','B ≥',c.gradeB)+num('gradeC','C ≥',c.gradeC)+'<span style="font-size:12px;color:var(--muted)">below C cut-off = D</span></div>'+
      '<div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end"><button class="ghost-btn" onclick="nfCeoSlaReset()">Reset to defaults</button><button class="primary-btn" onclick="nfCeoSlaSave()">Save settings</button></div>');
  };
  window.nfCeoSlaSave = function() {
    const c = cfg();
    document.querySelectorAll('[data-cfg]').forEach(el => {
      const v = Math.max(0, +el.value || 0), k = el.dataset.cfg;
      if (k.startsWith('tat.')) c.tat[k.slice(4)] = v; else c[k] = v;
    });
    if (!(c.gradeA > c.gradeB && c.gradeB > c.gradeC)) { showToast('Grade cut-offs must be in order: A > B > C'); return; }
    saveCfg(c); closeModal(); showToast('SLA & grade settings saved'); renderCaseView();
  };
  window.nfCeoSlaReset = function() { localStorage.removeItem(CFG_KEY); closeModal(); showToast('Settings reset to defaults'); renderCaseView(); };
  const opts = (vals, cur, all) => '<option value="">'+all+'</option>' + vals.map(v => '<option'+(v===cur?' selected':'')+'>'+esc(v)+'</option>').join('');
  const uniq = fn => [...new Set(applications.map(fn).filter(v => v && v !== '—'))].sort();

  function rows() {
    const q = f.q.toLowerCase();
    const from = f.from ? Date.parse(f.from) : null, to = f.to ? Date.parse(f.to) + DAY - 1 : null;
    return applications.filter(a => {
      if (q && ![a.id, a.customer, a.mobile, a.pan, a.workflow?.dealId].some(v => String(v||'').toLowerCase().includes(q))) return false;
      if ((f.product && a.product !== f.product) || (f.branch && a.branch !== f.branch) || (f.status && a.status !== f.status)) return false;
      if ((f.owner && owner(a) !== f.owner) || (f.dept && dept(a) !== f.dept)) return false;
      if ((f.sla && sla(a).s !== f.sla) || (f.grade && grade(a).g !== f.grade)) return false;
      if ((f.min && (+a.amount||0) < +f.min) || (f.max && (+a.amount||0) > +f.max)) return false;
      if (from || to) { const t = lastAt(a); if (!t || (from && t < from) || (to && t > to)) return false; }
      return true;
    }).sort((x, y) => (lastAt(y) || 0) - (lastAt(x) || 0));
  }
  function renderCaseView() {
    setPage('Case View Center', 'Case Docs & Audit Trail / Cases View');
    indexActivity();
    const list = rows(), count = s => applications.filter(a => s.includes(a.status)).length;
    const pages = Math.max(1, Math.ceil(list.length / PAGE)); page = Math.min(page, pages - 1);
    const shown = list.slice(page * PAGE, page * PAGE + PAGE);
    const stat = (l, v) => '<div class="card card-pad" style="flex:1;min-width:140px"><span style="font-size:11px;color:var(--muted)">'+l+'</span><h3 style="margin:4px 0 0">'+v+'</h3></div>';
    const sel = (k, vals, all) => '<select data-ceo-f="'+k+'" style="height:44px">'+opts(vals, f[k], all)+'</select>';
    const dateIn = (k, label) => '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)">'+label+'<input data-ceo-f="'+k+'" type="date" value="'+esc(f[k])+'" style="height:44px;flex:1;min-width:0"></label>';
    const pager = '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;flex-wrap:wrap"><span style="font-size:12px;color:var(--muted)">'+(list.length ? 'Showing '+(page*PAGE+1)+'–'+(page*PAGE+shown.length)+' of '+list.length : 'No cases match')+'</span><div style="display:flex;gap:8px;align-items:center"><button class="ghost-btn" data-ceo-page="-1"'+(page===0?' disabled':'')+'>← Previous</button><span style="font-size:12px">Page '+(page+1)+' of '+pages+'</span><button class="ghost-btn" data-ceo-page="1"'+(page>=pages-1?' disabled':'')+'>Next →</button></div></div>';
    $('#content').innerHTML =
      '<div class="page-head"><div><h2>Case View Center</h2><p>Organization-wide read-only visibility into loan cases, documents, workflow history and audit trails.</p></div><div style="display:flex;gap:8px;align-items:center"><button class="ghost-btn" onclick="nfCeoSlaSettings()">⚙ SLA & Grade Settings</button><span class="badge blue">Read-only</span></div></div>'+
      '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">'+stat('Total Cases',applications.length)+stat('Credit Review',count(['Credit Review','CAM Allocation','CAM Sheet']))+stat('Sanctioned',count(['Sanctioned']))+stat('Disbursed / Active',count(['Disbursed','Active Loan']))+stat('Closed',count(['Closed']))+'</div>'+
      '<div class="workflow-card"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:14px">'+
      '<input data-ceo-f="q" placeholder="Search ID, name, mobile, PAN, loan a/c" value="'+esc(f.q)+'" style="height:44px">'+
      sel('product',uniq(a=>a.product),'All Products')+sel('branch',uniq(a=>a.branch),'All Branches')+sel('status',uniq(a=>a.status),'All Stages / Status')+
      sel('dept',uniq(dept),'All Departments')+sel('owner',uniq(owner),'All Owners')+sel('sla',['On Track','At Risk','Breached','Completed'],'All SLA')+sel('grade',['A','B','C','D','Not scored'],'All Risk Grades')+
      '<input data-ceo-f="min" type="number" placeholder="Min amount ₹" value="'+esc(f.min)+'" style="height:44px"><input data-ceo-f="max" type="number" placeholder="Max amount ₹" value="'+esc(f.max)+'" style="height:44px">'+
      dateIn('from','Updated from')+dateIn('to','to')+'</div>'+
      '<div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>Product</th><th>Branch</th><th>Stage / Status</th><th>Loan Amount</th><th>Owner / Dept</th><th>SLA</th><th>Risk</th><th>Last Activity</th><th></th></tr></thead><tbody>'+
      shown.map(a => { const s = sla(a), g = grade(a); return '<tr><td><b>'+esc(a.id)+'</b></td><td>'+esc(a.customer)+'</td><td>'+esc(a.product)+'</td><td>'+esc(a.branch||'—')+'</td><td><span class="badge '+statusClass(a.status)+'">'+esc(a.status)+'</span></td><td>₹'+(+a.amount||0).toLocaleString('en-IN')+'</td><td>'+esc(owner(a))+'<br><small style="color:var(--muted)">'+esc(dept(a))+'</small></td><td title="'+esc(s.d)+'"><span class="badge '+(s.s==='Breached'?'red':s.s==='At Risk'?'amber':s.s==='On Track'?'green':'gray')+'">'+s.s+'</span></td><td title="'+esc(g.d)+'"><b>'+g.g+'</b></td><td>'+fmt(lastAt(a))+'</td><td><button class="ghost-btn" onclick="navTo(\'case\',\''+esc(a.id)+'\')">View</button></td></tr>'; }).join('')+
      '</tbody></table></div>'+pager+'</div>';
    document.querySelectorAll('[data-ceo-f]').forEach(el => el.addEventListener('change', () => { f[el.dataset.ceoF] = el.value; page = 0; renderCaseView(); }));
    document.querySelectorAll('[data-ceo-page]').forEach(b => b.addEventListener('click', () => { page += +b.dataset.ceoPage; renderCaseView(); document.getElementById('content')?.scrollIntoView({block:'start'}); }));
  }
  window.nfRenderCaseView = renderCaseView;
  const approvals = renderApprovalCenter;
  renderApprovalCenter = function() { if (isCeo()) return renderCaseView(); return approvals.apply(this, arguments); };

  // Case 360 stays read-only for CEO: strip any operational controls that render.
  const OP = /decideApproval|remarkApproval|sendBack|editCase|reassign|Deviation\(|startParallel|verifyBureau|openCaseNote|nfTractorVerifyDealer|nfTractorPayout|openDOChecklist|openCentralOps|nfJourneyClose|openMSMEReject/i;
  const OP_TEXT = /^\s*(approve|reject|send back|edit applicant|edit case|reassign|delete|remark|add note|close loan|move stage|change status|replace|verify dealer|release dealer)/i;
  function strip(root) {
    if (!isCeo()) return;
    root.querySelectorAll('#content button, #content a, .modal button').forEach(b => {
      if (b.closest('.sidebar')) return;
      if (OP.test(b.getAttribute('onclick')||'') || OP_TEXT.test(b.textContent||'')) b.remove();
    });
  }
  const rc = renderCase;
  renderCase = function() { const r = rc.apply(this, arguments); strip(document); return r; };
  new MutationObserver(() => strip(document)).observe(document.body, { childList:true, subtree:true });
  const initOversight = () => {
      if (window._ceoInitDone) return;
      window._ceoInitDone = true;
    if (typeof currentUser !== 'undefined' && currentUser.role === 'CEO') {
      let savedSelection = null;
      try {
        savedSelection = JSON.parse(localStorage.getItem('namdevSelectedWorkspaces'));
      } catch(e) {}
      
      let selectedSubmodules = [];
      if (savedSelection && typeof savedSelection === 'object' && !Array.isArray(savedSelection)) {
        Object.values(savedSelection).forEach(arr => {
          if (Array.isArray(arr)) selectedSubmodules.push(...arr);
        });
      } else {
        if (window.NAMDEV_WORKSPACE_CONFIG) {
          Object.values(window.NAMDEV_WORKSPACE_CONFIG).forEach(w => {
            (w.submodules || []).forEach(sub => selectedSubmodules.push(sub.id));
          });
        }
      }

      let allowedViews = new Set(selectedSubmodules);
const configToView = {
  tasks: 'taskSla', caseDocs: 'documents', casesView: 'applications', viewOnly: 'applications',
  leads: 'crm', bdmWork: 'crm', customerProfile: 'customer360', banking: 'bankingAA', fraud: 'rcu'
};
let mapped = new Set(); allowedViews.forEach(v => { mapped.add(v); if(configToView[v]) mapped.add(configToView[v]); }); allowedViews = mapped;
      allowedViews.add("dashboard");
      allowedViews.add("case");
      allowedViews.add("lobby");
      const roleCanViewSelection = roleCanView;
      roleCanView = function(view, role = currentUser.role) {
        if (role === 'CEO' && allowedViews.has(view) && !CEO_DENY[view]) return true;
        return roleCanViewSelection.apply(this, arguments);
      };
      let allowedKpis = new Set();
      let allowedCharts = new Set();
      
      if (window.NAMDEV_WORKSPACE_CONFIG) {
        Object.values(window.NAMDEV_WORKSPACE_CONFIG).forEach(conf => {
          (conf.submodules || []).forEach(sub => {
            if (selectedSubmodules.includes(sub.id)) {
              (sub.charts || []).forEach(c => allowedCharts.add(c));
              (sub.kpis || []).forEach(k => allowedKpis.add(k));
            }
          });
        });
      }

      window.CEO_ALLOWED_VIEWS = allowedViews;
      window.CEO_ALLOWED_KPIS = allowedKpis;
      window.CEO_ALLOWED_CHARTS = allowedCharts;

            const cleanupUI = () => { 
        if (!document.getElementById('ws-hidden-style')) {
          const style = document.createElement('style');
          style.id = 'ws-hidden-style';
          style.textContent = '.ws-hidden { display: none !important; }';
          document.head.appendChild(style);
        }
        // 1. Clean Sidebar
         document.querySelectorAll('.nav-menu .nav-item').forEach(btn => {
          const view = btn.dataset.view;
          if (view && !allowedViews.has(view)) {
            btn.style.display = 'none';
            btn.classList.add('ws-hidden');  
          }
        });
        document.querySelectorAll('.nav-menu .nf-nav-group').forEach(group => {
          const visibleItems = Array.from(group.querySelectorAll('.nav-item')).filter(btn => btn.style.display !== 'none');
          if (visibleItems.length === 0) {
            group.style.display = 'none';
          }
        });

        // 2. Clean Dashboard
          // The dashboard root could be .nf-ceo-dashboard OR .ceo-root
          const dash = document.querySelector('.nf-ceo-dashboard') || document.querySelector('.ceo-root') || document.querySelector('#content');
          if (!dash) return;
          
          if (dash.dataset.workspaceCleaned === 'true') return;
          dash.dataset.workspaceCleaned = 'true';

          // Clean V7 standard KPIs (if they exist)
          dash.querySelectorAll('.nf-kpi-card, .nf-exec-kpi, .v7-module-card').forEach(kpi => { 
            kpi.classList.add('ws-hidden');
            const oc = kpi.getAttribute('onclick') || '';
            const match = oc.match(/navTo\('([^']+)'\)/);
            if (match && match[1] && !allowedViews.has(match[1])) { 
              kpi.style.display = 'none'; 
              kpi.classList.add('ws-hidden'); 
            } else if (match) { 
              kpi.classList.remove('ws-hidden'); kpi.style.display = ''; 
            }
          });

          // Clean CEO Modal KPIs (.ceo-kpi-card)
          dash.querySelectorAll('.ceo-kpi-card').forEach(kpi => {
            const kId = kpi.dataset.kpi;
            if (kId && !allowedKpis.has(kId)) {
              kpi.style.display = 'none';
              kpi.classList.add('ws-hidden');
            } else {
              kpi.classList.remove('ws-hidden');
            }
          });

          dash.querySelectorAll('.nf-command-mini button, .ceo-alert, .nf-campaign-overlay button').forEach(btn => {
            const oc = btn.getAttribute('onclick') || '';
            const match = oc.match(/navTo\('([^']+)'\)/);
            const route = (match && match[1] === 'crm') ? 'leads' : (match ? match[1] : null);
            if (route && !allowedViews.has(route)) btn.style.display = 'none';
          });        

          dash.querySelectorAll('.ceo-panel').forEach(panel => {
            const title = panel.querySelector('.ceo-panel-head span')?.textContent;
            if ((title === 'PRODUCT MIX' || title === 'BUSINESS MOMENTUM') && !allowedCharts.has('productMix')) panel.style.display = 'none';
            if ((title === 'JOURNEY FUNNEL' || title === 'CONVERSION HEALTH') && !allowedCharts.has('stageFunnel')) panel.style.display = 'none';
            if ((title === 'BRANCH PERFORMANCE' || title === 'NETWORK PERFORMANCE') && !allowedCharts.has('branch')) panel.style.display = 'none';
            if (title === 'DEPARTMENT HEALTH' && !allowedCharts.has('departmentHealth')) panel.style.display = 'none';
            if ((title === 'RISK & EXCEPTIONS' || title === 'CEO DECISION CENTER') && !allowedCharts.has('riskWatch')) panel.style.display = 'none';
            if (title === 'EXECUTIVE CASE WATCH' && allowedViews.size < 3) panel.style.display = 'none';
          });
          
          // Handle empty dashboard state
        const visibleKpis = Array.from(dash.querySelectorAll('.nf-kpi-card, .nf-exec-kpi, .ceo-kpi-card'))
          .filter(k => k.style.display !== 'none' && !k.classList.contains('ws-hidden'));
        const visiblePanels = Array.from(dash.querySelectorAll('.ceo-panel, .ceo-card'))
          .filter(p => p.style.display !== 'none' && !p.classList.contains('ws-hidden'));
        const hasVisibleContent = visibleKpis.length > 0 || visiblePanels.length > 0;
        
        if (!hasVisibleContent && !dash.querySelector('.ws-empty-state')) {
          const emptyState = document.createElement('div');
          emptyState.className = 'ws-empty-state';
          emptyState.innerHTML = '<div style="text-align:center; padding: 60px 20px; color: #64748b;"><h2 style="margin-bottom:12px; color: #0f172a;">No modules selected</h2><p style="margin-bottom: 24px;">Select workspace modules to customize your dashboard.</p><button onclick="window.parent.postMessage({type:\'namdev-go-back\'}, \'*\')" style="background: #0c1671; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Open Workspace Settings</button></div>';
          const dashboardContent = dash.matches('.ceo-root') ? dash.querySelector('.ceo-main') : null;
          (dashboardContent || dash).appendChild(emptyState);
        }
      };

      new MutationObserver(cleanupUI).observe(document.body, { childList: true, subtree: true });
        
        const origApply = window.applyRoleAccess;
        if (origApply) {
          window.applyRoleAccess = function() {
            const ret = origApply.apply(this, arguments);
            cleanupUI();
            return ret;
          };
        }
        const origRender = window.renderDashboard;
        if (origRender) {
          window.renderDashboard = function() {
            const ret = origRender.apply(this, arguments);
            setTimeout(cleanupUI, 50);
            return ret;
          };
        }
      cleanupUI(); // Initial run

      // Protect navTo function
      const originalNavTo = window.navTo;
      window.navTo = function(view, arg) {
        if (!allowedViews.has(view)) {
          showToast('Access denied: This module is not enabled in your workspace.');
          return;
        }
        return originalNavTo.apply(this, arguments);
      };
    }
  };
  initOversight();
  document.addEventListener("DOMContentLoaded", initOversight);
})();
</script>`;


























