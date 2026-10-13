// Four-layer demo access model (module, page, action, data scope). Browser-local; not server authorization.
export const workflowAccessControlScript = String.raw`<script>
(() => {
  const KEY = 'namdev-access-config';
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/workflow/access-control.css'; document.head.appendChild(css);
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ACTIONS = [['view','View records'],['create','Create'],['createCRMLead','Create CRM leads'],['edit','Edit case / applicant'],['approve','Approve'],['reject','Reject'],['sendBack','Send back'],['remark','Remarks & notes'],['runKyc','Run KYC'],['runDedupe','Run Dedupe'],['delete','Delete'],['upload','Upload documents'],['download','Download documents'],['export','Export'],['print','Print'],['configure','Configure access']];
  const SCOPES = [['own','Own records'],['team','My team'],['branch','My branch'],['region','My region'],['all','All records']];
  const GROUP_NAMES = { pinned:'Dashboard' };
  const baseCan = roleCanView;
  const roles = () => Object.keys(ORG_ROLES);

  function catalog() {
    const groups = [{ key:'pinned', label:GROUP_NAMES.pinned, pages:[] }];
    document.querySelectorAll('.nf-nav-pinned .nav-item[data-view]').forEach(b => groups[0].pages.push({ key:b.dataset.view, label:(b.children[1] || b).textContent.trim() }));
    document.querySelectorAll('.nf-nav-group[data-group]').forEach(s => {
      const key = s.dataset.group, t = s.querySelector('.nf-nav-group-toggle span:nth-child(2)');
      const g = { key, label:t ? t.textContent.trim() : key, pages:[] };
      if (key === 'mywork') g.pages.push({ key:'casesView', label:'Cases View', note:'View only — separate from Approvals' });
      s.querySelectorAll('.nav-item[data-view]').forEach(b => { if (!g.pages.some(p => p.key === b.dataset.view)) g.pages.push({ key:b.dataset.view, label:b.dataset.view === 'approvals' ? 'Approvals' : (b.children[1] || b).textContent.trim() }); });
      groups.push(g);
    });
    return groups;
  }
  function defaults(role) {
    const can = v => { try { return !!baseCan(v, role); } catch (e) { return false; } };
    const pages = {}, modules = {};
    catalog().forEach(g => { g.pages.forEach(p => pages[p.key] = p.key === 'casesView' ? (can('approvals') || can('hierarchy')) : p.key === 'approvals' ? (can('approvals') && role !== 'CEO') : can(p.key)); modules[g.key] = g.pages.some(p => pages[p.key]); });
    modules.pinned = true;
    const ceo = role === 'CEO', decide = can('approvals') && !ceo;
    const actions = { view:true, create:!ceo, createCRMLead:true, edit:!ceo, approve:decide, reject:decide, sendBack:!ceo && (can('sendBack') || decide), remark:!ceo, runKyc:!ceo, runDedupe:!ceo, delete:role === 'System Admin', upload:!ceo, download:true, export:true, print:true, configure:ceo || role === 'System Admin' };
    const lvl = (ORG_ROLES[role] && ORG_ROLES[role].level) || 1;
    const scope = { level: ceo || role === 'System Admin' || /Head|CBO|Compliance|Audit/.test(role) ? 'all' : lvl >= 4 ? 'region' : lvl >= 2 ? 'team' : 'branch', products:[] };
    return { modules, pages, actions, scope };
  }
  const allDefaults = () => { const r = {}; roles().forEach(x => r[x] = defaults(x)); return r; };
  const clone = o => JSON.parse(JSON.stringify(o));
  let cfg;
  function load() {
    try { cfg = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { cfg = null; }
    if (!cfg || !cfg.published) { const d = allDefaults(); cfg = { published:d, draft:clone(d), versions:[{ at:new Date().toISOString(), by:'System', note:'Migrated from legacy access matrix', roles:clone(d) }] }; save(); }
    roles().forEach(r => { if (!cfg.published[r]) cfg.published[r] = defaults(r); if (!cfg.draft[r]) cfg.draft[r] = clone(cfg.published[r]); const d = defaults(r); ['published','draft'].forEach(k => { Object.keys(d.actions).forEach(x => { if (cfg[k][r].actions[x] === undefined) cfg[k][r].actions[x] = x === 'createCRMLead' && r !== 'CEO' ? (cfg[k][r].actions.create ?? d.actions[x]) : d.actions[x]; }); Object.entries(d.pages).forEach(([view, enabled]) => { if (cfg[k][r].pages[view] === undefined) cfg[k][r].pages[view] = enabled; }); Object.entries(d.modules).forEach(([group, enabled]) => { if (cfg[k][r].modules[group] === undefined) cfg[k][r].modules[group] = enabled; }); }); }); save(); migrate();
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(cfg)); }
  // Keep existing BDM access matrices aligned with the connected MSME and IMD work queues.
  function migrate() {
    cfg.migrations = cfg.migrations || [];
    if (cfg.migrations.indexOf('bdm-msme') < 0) {
      ['published','draft'].forEach(k => {
        const r = cfg[k] && cfg[k].BDM;
        if (r && r.pages) {
          r.pages.msmeFlow = true;
          if (r.modules) r.modules.origination = true;
        }
      });
      cfg.migrations.push('bdm-msme');
    }
    if (cfg.migrations.indexOf('bdm-msme-imd-workbench-v2') < 0) {
      ['published','draft'].forEach(k => {
        const r = cfg[k] && cfg[k].BDM;
        if (r && r.pages) {
          r.pages.journeyMSME = true;
          r.pages.imd = true;
          if (r.modules) r.modules.origination = true;
        }
      });
      cfg.migrations.push('bdm-msme-imd-workbench-v2');
    }
    save();
  }
  const P = role => cfg.published[role || currentUser.role] || defaults(role || currentUser.role);
  function groupOf(view) { const g = catalog().find(x => x.pages.some(p => p.key === view)); return g ? g.key : null; }
  window.nfCan = function(action, role) { const p = P(role); return !!(p.actions && p.actions[action]); };
  window.nfScope = function(role) { return P(role).scope; };

  // Layers 1+2: module and page visibility. Cases View and Approvals each open the case queue independently.
  roleCanView = function(view, role) {
    role = role || currentUser.role; if (!cfg) return baseCan.apply(this, arguments);
    const p = P(role);
    if (view === 'approvals') return !!((p.pages.casesView && p.modules.mywork !== false) || (p.pages.approvals && p.modules.mywork !== false));
    if (view === 'workflowControl' && p.actions.configure) return true;
    const g = groupOf(view);
    if (!g || !(view in p.pages)) return baseCan.apply(this, arguments);
    return p.modules[g] !== false && !!p.pages[view];
  };
  const nav = navTo;
  navTo = function(view) {
    if (view && view !== 'dashboard' && view !== 'case' && groupOf(view) && !roleCanView(view)) { if (typeof renderAccessDenied === 'function') return renderAccessDenied(view); showToast('Your role does not have access to this page.'); return nav.call(this, 'dashboard'); }
    return nav.apply(this, arguments);
  };

  // Layer 3: action permissions enforced in the handlers themselves.
  const deny = a => { if (typeof closeModal === 'function') closeModal(); showToast('Permission denied: your role cannot ' + a + '.'); };
  const MAP = { remarkApproval:'remark', saveApprovalRemark:'remark', openCaseNote:'remark', saveCaseNote:'remark', sendBackCaseModal:'sendBack', createSendBackTask:'sendBack', editCaseApplicant:'edit', saveCaseApplicant:'edit', openMSMEReject:'reject' };
  Object.keys(MAP).forEach(n => { const fn = window[n]; if (typeof fn !== 'function') return; window[n] = function() { if (!nfCan(MAP[n])) return deny(MAP[n].replace('sendBack', 'send back') + ' cases'); return fn.apply(this, arguments); }; });
  if (typeof decideApproval === 'function') { const d = decideApproval; decideApproval = function(id, decision) { const a = /reject/i.test(String(decision)) ? 'reject' : 'approve'; if (!nfCan(a)) return deny(a + ' cases'); return d.apply(this, arguments); }; }

  // Layer 4: data scope applied to role case queues.
  function inScope(a) {
    const s = nfScope(); if (!a || !s || s.level === 'all') return true;
    if (s.products && s.products.length && !s.products.includes(a.product)) return false;
    if (s.level === 'branch' || s.level === 'own') return !currentUser.branch || !a.branch || a.branch === currentUser.branch;
    return true;
  }
  if (typeof visibleLobbyCases === 'function') { const v = visibleLobbyCases; visibleLobbyCases = function() { const r = v.apply(this, arguments); return Array.isArray(r) ? r.filter(inScope) : r; }; }
  window.nfInScope = inScope;

  // Configuration UI.
  let ui = { role:'CEO', tab:'pages', q:'', compare:'' };
  const canEdit = () => nfCan('configure');
  const dirty = () => JSON.stringify(cfg.draft) !== JSON.stringify(cfg.published);
  function warnings(r) {
    const w = [], d = cfg.draft[r];
    if ((d.actions.approve || d.actions.reject || d.actions.sendBack) && !d.pages.casesView && !d.pages.approvals) w.push('Approve / Reject / Send back are on, but neither Cases View nor Approvals page is enabled — the user cannot reach any case.');
    catalog().forEach(g => { if (d.modules[g.key] === false && g.pages.some(p => d.pages[p.key])) w.push(g.label + ' module is off, so its enabled pages stay hidden.'); });
    if (d.actions.edit && !d.actions.view) w.push('Edit is on without View records.');
    return w;
  }
  const chk = (path, on, extra) => '<input type="checkbox" class="nfac-chk" data-path="' + path + '"' + (on ? ' checked' : '') + (canEdit() ? '' : ' disabled') + (extra || '') + '>';
  function pagesTab(d) {
    return catalog().map(g => {
      const rows = g.pages.filter(p => !ui.q || (p.label + g.label).toLowerCase().includes(ui.q));
      if (!rows.length) return '';
      return '<details class="nfac-group" open><summary><label>' + chk('modules.' + g.key, d.modules[g.key] !== false) + ' <b>' + esc(g.label) + '</b></label><span class="muted">' + rows.filter(p => d.pages[p.key]).length + '/' + rows.length + ' pages</span>' + (canEdit() ? '<button class="ghost-btn" data-bulk="' + g.key + ':1">All</button><button class="ghost-btn" data-bulk="' + g.key + ':0">None</button>' : '') + '</summary>' +
        rows.map(p => '<label class="nfac-row">' + chk('pages.' + p.key, !!d.pages[p.key]) + '<span>' + esc(p.label) + (p.note ? '<small>' + esc(p.note) + '</small>' : '') + '</span></label>').join('') + '</details>';
    }).join('');
  }
  function actionsTab(d) {
    return '<div class="nfac-actions">' + ACTIONS.filter(a => !ui.q || a[1].toLowerCase().includes(ui.q)).map(a => '<label class="nfac-row">' + chk('actions.' + a[0], !!d.actions[a[0]]) + '<span>' + esc(a[1]) + '</span></label>').join('') + '</div>' + (canEdit() ? '<div class="nfac-bulk"><button class="ghost-btn" data-preset="viewonly">Grant view-only</button><button class="ghost-btn" data-preset="allact">Select all actions</button><button class="ghost-btn" data-preset="noact">Clear actions</button></div>' : '');
  }
  function scopeTab(d) {
    const prods = (window.productMaster ? Object.keys(window.productMaster) : ['Two Wheeler','MSME','LAP','Solar Loan','Tractor Loan']);
    return '<div class="nfac-scope"><h4>Record scope</h4>' + SCOPES.map(s => '<label class="nfac-row"><input type="radio" name="nfacScope" value="' + s[0] + '"' + (d.scope.level === s[0] ? ' checked' : '') + (canEdit() ? '' : ' disabled') + '><span>' + s[1] + '</span></label>').join('') +
      '<h4>Product scope <small class="muted">(none selected = all products)</small></h4>' + prods.map(p => '<label class="nfac-row"><input type="checkbox" class="nfac-prod" value="' + esc(p) + '"' + (d.scope.products.includes(p) ? ' checked' : '') + (canEdit() ? '' : ' disabled') + '><span>' + esc(p) + '</span></label>').join('') + '</div>';
  }
  function summary(r) {
    const d = cfg.draft[r], pages = catalog().flatMap(g => d.modules[g.key] === false ? [] : g.pages.filter(p => d.pages[p.key]).map(p => p.label));
    return '<div class="nfac-summary"><h4>Access summary · ' + esc(r) + '</h4><p><b>' + pages.length + '</b> pages · <b>' + ACTIONS.filter(a => d.actions[a[0]]).length + '</b> actions · scope <b>' + esc(d.scope.level) + '</b></p><p class="muted">Can: ' + (ACTIONS.filter(a => d.actions[a[0]]).map(a => a[1]).join(', ') || 'nothing') + '</p><p class="muted">Cannot: ' + (ACTIONS.filter(a => !d.actions[a[0]]).map(a => a[1]).join(', ') || '—') + '</p><details><summary>Preview sidebar for this role</summary><ul>' + pages.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul></details></div>';
  }
  function compareTab() {
    const a = cfg.draft[ui.role], b = cfg.draft[ui.compare] || a;
    const rows = catalog().flatMap(g => g.pages.map(p => [g.label + ' › ' + p.label, a.pages[p.key], b.pages[p.key]])).concat(ACTIONS.map(x => ['Action › ' + x[1], a.actions[x[0]], b.actions[x[0]]])).concat([['Data scope', a.scope.level, b.scope.level]]);
    return '<p>Compare with <select id="nfacCompare">' + roles().map(r => '<option' + (r === ui.compare ? ' selected' : '') + '>' + esc(r) + '</option>').join('') + '</select></p><div class="table-wrap"><table><thead><tr><th>Permission</th><th>' + esc(ui.role) + '</th><th>' + esc(ui.compare) + '</th></tr></thead><tbody>' + rows.filter(x => !ui.q || x[0].toLowerCase().includes(ui.q)).map(x => { const f = v => v === true ? '✓' : v === false || v == null ? '—' : esc(v); return '<tr class="' + (String(x[1]) !== String(x[2]) ? 'nfac-diff' : '') + '"><td>' + esc(x[0]) + '</td><td>' + f(x[1]) + '</td><td>' + f(x[2]) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function versionsTab() {
    return '<div class="table-wrap"><table><thead><tr><th>Published</th><th>By</th><th>Note</th><th></th></tr></thead><tbody>' + cfg.versions.map((v, i) => '<tr><td>' + esc(new Date(v.at).toLocaleString()) + '</td><td>' + esc(v.by) + '</td><td>' + esc(v.note) + '</td><td>' + (canEdit() ? '<button class="ghost-btn" data-restore="' + i + '">Load into draft</button>' : '') + '</td></tr>').join('') + '</tbody></table></div>';
  }
  renderWorkflowControl = function() {
    setPage('Workflow & Access', 'Admin / RBAC');
    if (!ui.compare) ui.compare = roles().find(r => r !== ui.role) || ui.role;
    const d = cfg.draft[ui.role], w = warnings(ui.role);
    const tabs = [['modules','Modules & Pages'],['actions','Actions'],['scope','Data Scope'],['compare','Compare Roles'],['versions','Version History']];
    const body = ui.tab === 'actions' ? actionsTab(d) : ui.tab === 'scope' ? scopeTab(d) : ui.tab === 'compare' ? compareTab() : ui.tab === 'versions' ? versionsTab() : pagesTab(d);
    document.getElementById('content').innerHTML =
      '<div class="page-head"><div><h2>Role, Designation & Workflow Control</h2><p>Four independent layers: module access, page access, action permissions and data scope. Viewing a page never grants approval rights, and switching off Approvals never hides Cases View. Demo configuration stored in this browser.</p></div><span class="badge ' + (canEdit() ? 'green' : 'gray') + '">' + (canEdit() ? 'Editable' : 'Read Only') + '</span></div>' +
      '<div class="workflow-card nfac-shell"><div class="nfac-toolbar"><label>Role / Designation<select id="nfacRole">' + roles().map(r => '<option' + (r === ui.role ? ' selected' : '') + '>' + esc(r) + '</option>').join('') + '</select></label><small class="muted">' + esc((ORG_ROLES[ui.role] || {}).name || '') + ' · ' + esc(roleMeta(ui.role).dept) + '</small><input id="nfacSearch" placeholder="Search permissions…" value="' + esc(ui.q) + '">' +
      (dirty() ? '<span class="badge amber">Unsaved draft changes</span>' : '<span class="badge green">Published</span>') +
      (canEdit() ? '<button class="ghost-btn" id="nfacDiscard"' + (dirty() ? '' : ' disabled') + '>Discard</button><button class="ghost-btn" id="nfacResetRole">Reset role</button><button class="ghost-btn" id="nfacResetAll">Reset all defaults</button><button class="primary-btn" id="nfacPublish"' + (dirty() ? '' : ' disabled') + '>Publish</button>' : '') + '</div>' +
      '<div class="nfac-tabs">' + tabs.map(t => '<button class="' + (ui.tab === t[0] || (t[0] === 'modules' && ui.tab === 'pages') ? 'active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
      (w.length ? '<div class="nfac-warn">' + w.map(x => '<p>⚠ ' + esc(x) + '</p>').join('') + '</div>' : '') +
      '<div class="nfac-layout"><div class="nfac-body">' + body + '</div>' + summary(ui.role) + '</div></div>';
    bind();
  };
  function setPath(path, val) { const [a, b] = path.split('.'); cfg.draft[ui.role][a][b] = val; save(); }
  function bind() {
    const c = document.getElementById('content'), $ = s => c.querySelector(s);
    $('#nfacRole').onchange = e => { ui.role = e.target.value; renderWorkflowControl(); };
    $('#nfacSearch').oninput = e => { ui.q = e.target.value.trim().toLowerCase(); const pos = e.target.selectionStart; renderWorkflowControl(); const s = document.getElementById('nfacSearch'); s.focus(); s.setSelectionRange(pos, pos); };
    c.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { ui.tab = b.dataset.tab; renderWorkflowControl(); });
    c.querySelectorAll('.nfac-chk').forEach(i => i.onchange = () => { setPath(i.dataset.path, i.checked); renderWorkflowControl(); });
    c.querySelectorAll('[data-bulk]').forEach(b => b.onclick = e => { e.preventDefault(); const [g, on] = b.dataset.bulk.split(':'); const grp = catalog().find(x => x.key === g); grp.pages.forEach(p => cfg.draft[ui.role].pages[p.key] = on === '1'); if (on === '1') cfg.draft[ui.role].modules[g] = true; save(); renderWorkflowControl(); });
    c.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => { const a = cfg.draft[ui.role].actions; ACTIONS.forEach(x => a[x[0]] = b.dataset.preset === 'allact' ? true : b.dataset.preset === 'viewonly' ? ['view','download','export','print'].includes(x[0]) || (x[0] === 'configure' && a.configure) : false); save(); renderWorkflowControl(); });
    c.querySelectorAll('input[name=nfacScope]').forEach(r => r.onchange = () => { cfg.draft[ui.role].scope.level = r.value; save(); renderWorkflowControl(); });
    c.querySelectorAll('.nfac-prod').forEach(i => i.onchange = () => { cfg.draft[ui.role].scope.products = [...c.querySelectorAll('.nfac-prod:checked')].map(x => x.value); save(); renderWorkflowControl(); });
    const cmp = $('#nfacCompare'); if (cmp) cmp.onchange = e => { ui.compare = e.target.value; renderWorkflowControl(); };
    c.querySelectorAll('[data-restore]').forEach(b => b.onclick = () => { cfg.draft = clone(cfg.versions[+b.dataset.restore].roles); roles().forEach(r => { if (!cfg.draft[r]) cfg.draft[r] = defaults(r); }); save(); showToast('Version loaded into draft — publish to apply'); renderWorkflowControl(); });
    const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
    on('#nfacDiscard', () => { cfg.draft = clone(cfg.published); save(); renderWorkflowControl(); });
    on('#nfacResetRole', () => { cfg.draft[ui.role] = defaults(ui.role); save(); showToast(ui.role + ' reset to defaults in draft'); renderWorkflowControl(); });
    on('#nfacResetAll', () => { if (!confirm('Reset every role to default access in the draft?')) return; cfg.draft = allDefaults(); save(); renderWorkflowControl(); });
    on('#nfacPublish', publish);
  }
  function publish() {
    const changes = [];
    roles().forEach(r => { const a = cfg.published[r], b = cfg.draft[r]; ['modules','pages','actions'].forEach(k => Object.keys(Object.assign({}, a[k], b[k])).forEach(x => { if (!!a[k][x] !== !!b[k][x]) changes.push(r + ' · ' + k + '.' + x + ': ' + (a[k][x] ? 'on' : 'off') + ' → ' + (b[k][x] ? 'on' : 'off')); })); if (JSON.stringify(a.scope) !== JSON.stringify(b.scope)) changes.push(r + ' · scope: ' + a.scope.level + ' → ' + b.scope.level); });
    const note = prompt('Reason for this access change (' + changes.length + ' changes):', 'Access matrix update');
    if (note === null) return;
    cfg.published = clone(cfg.draft);
    cfg.versions.unshift({ at:new Date().toISOString(), by:currentUser.role + ' · ' + (currentUser.name || ''), note:note || 'Access matrix update', roles:clone(cfg.draft) });
    cfg.versions = cfg.versions.slice(0, 30); save();
    changes.slice(0, 200).forEach(ch => { try { logAudit('ACCESS-CONTROL', 'Permission Changed', ch + ' · Reason: ' + (note || '—')); } catch (e) {} });
    try { logAudit('ACCESS-CONTROL', 'Access Configuration Published', changes.length + ' changes'); } catch (e) {}
    applyRoleAccess(); showToast('Access published (' + changes.length + ' changes)'); renderWorkflowControl();
  }
  load();
  try { applyRoleAccess(); } catch (e) {}
})();
</script>`;