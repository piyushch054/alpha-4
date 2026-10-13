// Hierarchy Monitor control bar: search, quick + advanced filters, chips, sort, pagination, saved views and exports.
// Read-only presentation adapter over the legacy hierarchy table; exports are logged to the demo audit trail.
export const workflowHierarchyMonitorScript = String.raw`<script>
(() => {
  if (typeof renderHierarchyMonitor !== 'function') return;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const PRODUCTS = ['Two Wheeler','MSME','LAP','Solar Loan','Tractor Loan'];
  const STATUSES = ['Lead','Application','Draft','Sales/Predeal','Credit Review','CAM Allocation','CAM Sheet','Sanctioned','Disbursement','Active Loan','Disbursed','Collections','Closed','Rejected'];
  // Demo region mapping for the Rajasthan branch network; user overrides persist in localStorage.
  const REGION_KEY = 'namdev-hierarchy-regions';
  const REGION_DEFAULT = { 'Jaipur - VKI':'Jaipur Region','Jaipur - Sanganer':'Jaipur Region','Ajmer Road':'Jaipur Region','Sikar':'Shekhawati Region','Udaipur':'Mewar Region','Bhilwara':'Mewar Region','Kota':'Hadoti Region','Jodhpur':'Marwar Region' };
  const loadRegions = () => { try { const s = JSON.parse(localStorage.getItem(REGION_KEY) || 'null'); return s && typeof s === 'object' ? { ...REGION_DEFAULT, ...s } : { ...REGION_DEFAULT }; } catch (e) { return { ...REGION_DEFAULT }; } };
  let REGION = loadRegions();
  const SALES = typeof SALES_CHAIN !== 'undefined' ? SALES_CHAIN : ['BSO','BDM','ASM','RSM','ZSM','CBO'];
  const CREDIT = typeof CREDIT_CHAIN !== 'undefined' ? CREDIT_CHAIN : ['BCM','ACM','ZCM','Credit Head'];
  const region = a => a.region || REGION[a.branch] || 'Other';
  const person = (a, dept, r) => a.workflow?.[dept.toLowerCase()]?.[r] || roleMeta(r).name;
  const deviation = a => a.workflow?.approval ? (a.workflow.approval.type || a.workflow.approval.requiredRole || 'Deviation') : ((a.workflow?.deviations||[])[0]?.type || 'No Deviation');
  const devRole = a => a.workflow?.approval?.requiredRole || '';
  const created = a => { const t = Date.parse(a.created || a.date || ''); return isNaN(t) ? null : t; };
  let lastIdx = new Map();
  function indexActivity() { lastIdx = new Map(); (typeof auditEvents !== 'undefined' ? auditEvents : []).forEach(e => { const t = Date.parse(e.ts || ''); if (!e.caseId || isNaN(t)) return; if ((lastIdx.get(e.caseId)||0) < t) lastIdx.set(e.caseId, t); }); }
  const updated = a => Math.max(created(a) || 0, lastIdx.get(a.id) || 0) || null;
  const lan = a => a.workflow?.dealId || a.lan || '';
  const owner = a => a.workflow?.ownerRole || '—';
  const DONE = ['Active Loan','Disbursed','Closed','Rejected'];
  function slaStatus(a) {
    if (DONE.includes(a.status)) return 'Completed';
    let c = { tat:{}, defaultTat:3, atRiskPct:75 };
    try { const s = JSON.parse(localStorage.getItem('namdev-ceo-sla-config') || 'null'); if (s) c = { ...c, ...s }; } catch (e) {}
    const def = { 'Draft':5,'Sales/Predeal':3,'Credit Review':2,'CAM Allocation':1,'CAM Sheet':2,'Sanctioned':3,'Disbursement':2 };
    const target = +((c.tat||{})[a.status] ?? def[a.status] ?? c.defaultTat) || 3, t = updated(a);
    if (!t) return 'No date';
    const age = Math.max(0, Math.floor((Date.now() - t) / 864e5));
    return age > target ? 'Breached' : age >= target * ((c.atRiskPct||75) / 100) ? 'At Risk' : 'On Track';
  }
  const fmtD = t => t ? new Date(t).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const fmtDT = t => new Date(t).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true });

  // State
  const MULTI = ['product','status','branch','region','deviation'];
  const ROLE_F = ['BSO','BDM','ASM','RSM','ZSM','CBO'];
  const blank = () => ({ q:'', product:[], status:[], branch:[], region:[], deviation:[], BSO:'', BDM:'', ASM:'', RSM:'', ZSM:'', CBO:'', cFrom:'', cTo:'', uFrom:'', uTo:'', min:'', max:'', sla:'' });
  let f = blank(), sort = { key:'updated', dir:-1 }, page = 0, size = 50, open = null;
  const SAVED = 'namdev-hierarchy-saved-views';
  const saved = () => { try { return JSON.parse(localStorage.getItem(SAVED) || '[]'); } catch (e) { return []; } };
  const uniq = fn => [...new Set(applications.map(fn).filter(v => v && v !== '—'))].sort();
  const optsFor = k => k === 'product' ? [...new Set([...PRODUCTS, ...uniq(a => a.product)])]
    : k === 'status' ? [...new Set([...STATUSES, ...uniq(a => a.status)])]
    : k === 'branch' ? uniq(a => a.branch) : k === 'region' ? uniq(region)
    : [...new Set(['No Deviation','ACM','Policy Deviation','Sales Deviation','Credit Deviation', ...uniq(deviation), ...uniq(devRole)])];
  const LABEL = { product:'Product', status:'Status', branch:'Branch', region:'Region', deviation:'Deviation', cFrom:'Created from', cTo:'Created to', uFrom:'Updated from', uTo:'Updated to', min:'Min ₹', max:'Max ₹', sla:'SLA', q:'Search' };

  function match(a) {
    const q = f.q.trim().toLowerCase();
    if (q) { const hay = [a.id, a.customer, a.mobile, a.pan, lan(a), a.product, a.branch, ...SALES.map(r => person(a,'Sales',r))].join(' ').toLowerCase(); if (!hay.includes(q)) return false; }
    if (f.product.length && !f.product.includes(a.product)) return false;
    if (f.status.length && !f.status.includes(a.status)) return false;
    if (f.branch.length && !f.branch.includes(a.branch)) return false;
    if (f.region.length && !f.region.includes(region(a))) return false;
    if (f.deviation.length && !f.deviation.includes(deviation(a)) && !f.deviation.includes(devRole(a))) return false;
    for (const r of ROLE_F) if (f[r] && person(a,'Sales',r) !== f[r]) return false;
    const day = 864e5, inR = (t, from, to) => (!from || (t && t >= Date.parse(from))) && (!to || (t && t <= Date.parse(to) + day - 1));
    if (!inR(created(a), f.cFrom, f.cTo) || !inR(updated(a), f.uFrom, f.uTo)) return false;
    if ((f.min && (+a.amount||0) < +f.min) || (f.max && (+a.amount||0) > +f.max)) return false;
    if (f.sla && slaStatus(a) !== f.sla) return false;
    return true;
  }
  const SORTERS = { id:a=>a.id, customer:a=>a.customer||'', product:a=>a.product||'', status:a=>a.status||'', branch:a=>a.branch||'', created:a=>created(a)||0, updated:a=>updated(a)||0, amount:a=>+a.amount||0 };
  let cache = { key:'', list:[] };
  function rows() {
    const key = JSON.stringify([f, sort, applications.length, lastIdx.size]);
    if (cache.key === key) return cache.list;
    const g = SORTERS[sort.key];
    const list = applications.filter(match).sort((x, y) => { const a = g(x), b = g(y); return (a > b ? 1 : a < b ? -1 : 0) * sort.dir; });
    cache = { key, list }; return list;
  }
  function activeChips() {
    const chips = [];
    if (f.q.trim()) chips.push(['q', null, 'Search: ' + f.q.trim()]);
    MULTI.forEach(k => f[k].forEach(v => chips.push([k, v, LABEL[k] + ': ' + v])));
    ROLE_F.forEach(k => f[k] && chips.push([k, null, k + ': ' + f[k]]));
    ['cFrom','cTo','uFrom','uTo','min','max','sla'].forEach(k => f[k] && chips.push([k, null, LABEL[k] + ': ' + f[k]]));
    return chips;
  }
  const filterSummary = () => activeChips().map(c => c[2]).join('; ') || 'None (all accessible cases)';

  // Multi-select dropdown with Select All + indeterminate state.
  function multi(k, quick) {
    const vals = optsFor(k), sel = f[k], n = sel.length;
    const label = n ? (n === 1 ? sel[0] : n + ' selected') : 'All';
    return '<div class="nf-hm-dd'+(quick?' nf-hm-quick nf-hm-q-'+k:'')+'" data-dd="'+k+'"><button type="button" class="nf-hm-ddbtn'+(n?' on':'')+'" data-dd-toggle="'+k+'" aria-expanded="'+(open===k)+'"><span>'+LABEL[k]+'</span><b>'+esc(label)+'</b><i>▾</i></button>'+
      (open === k ? '<div class="nf-hm-menu" role="listbox"><label class="nf-hm-opt all"><input type="checkbox" data-all="'+k+'"'+(n===vals.length?' checked':'')+'> Select All</label>'+
      vals.map(v => '<label class="nf-hm-opt"><input type="checkbox" data-multi="'+k+'" value="'+esc(v)+'"'+(sel.includes(v)?' checked':'')+'> '+esc(v)+'</label>').join('')+'</div>' : '')+'</div>';
  }

  function headSort(key, label) { const on = sort.key === key; return '<th><button type="button" class="nf-hm-sort'+(on?' on':'')+'" data-sort="'+key+'">'+label+' <span>'+(on ? (sort.dir > 0 ? '▲' : '▼') : '↕')+'</span></button></th>'; }
  function table(dept, list) {
    const chain = dept === 'Sales' ? SALES : CREDIT;
    return '<div class="table-wrap"><table><thead><tr>'+headSort('id','Case')+headSort('customer','Customer')+headSort('product','Product')+headSort('branch','Branch')+chain.map(r => '<th>'+r+'</th>').join('')+headSort('status','Current Status')+'<th>Deviation</th>'+headSort('updated','Last Updated')+'<th></th></tr></thead><tbody>'+
      (list.length ? list.map(a => '<tr><td><b>'+esc(a.id)+'</b></td><td>'+esc(a.customer)+'</td><td>'+esc(a.product)+'</td><td>'+esc(a.branch||'—')+'</td>'+chain.map(r => '<td>'+esc(person(a,dept,r))+'</td>').join('')+'<td><span class="badge '+statusClass(a.status)+'">'+esc(a.status)+'</span></td><td>'+(a.workflow?.approval ? '<span class="badge amber">'+esc(a.workflow.approval.requiredRole)+'</span>' : '—')+'</td><td>'+fmtD(updated(a))+'</td><td><button class="more-btn" onclick="navTo(\'case\',\''+esc(a.id)+'\')">View</button></td></tr>').join('')
        : '<tr><td colspan="'+(chain.length+8)+'"><div class="empty-state"><h3>No cases match</h3><p>Change the search or filters, or reset to see all accessible cases.</p></div></td></tr>')+'</tbody></table></div>';
  }

  function renderBody() {
    const root = document.getElementById('nfHmBody'); if (!root) return;
    const list = rows(), pages = Math.max(1, Math.ceil(list.length / size)); page = Math.min(page, pages - 1);
    const shown = list.slice(page * size, page * size + size), chips = activeChips();
    const sales = currentUser.dept === 'Sales' || currentUser.role === 'CEO', credit = currentUser.dept === 'Credit' || currentUser.role === 'CEO';
    const pager = '<div class="nf-hm-pager"><label>Rows <select data-size>'+[25,50,100,200].map(n => '<option'+(n===size?' selected':'')+'>'+n+'</option>').join('')+'</select></label><div><button class="ghost-btn" data-pg="-1"'+(page===0?' disabled':'')+'>← Previous</button><span>Page '+(page+1)+' of '+pages+'</span><button class="ghost-btn" data-pg="1"'+(page>=pages-1?' disabled':'')+'>Next →</button></div></div>';
    root.innerHTML = '<div class="nf-hm-chips"><b class="nf-hm-count">'+(list.length === applications.length ? list.length.toLocaleString('en-IN')+' cases' : 'Showing '+list.length.toLocaleString('en-IN')+' of '+applications.length.toLocaleString('en-IN')+' cases')+'</b>'+
      chips.map((c, i) => '<span class="nf-hm-chip">'+esc(c[2])+'<button type="button" data-chip="'+i+'" aria-label="Remove filter">×</button></span>').join('')+
      (chips.length ? '<button type="button" class="nf-hm-clear" data-reset>Clear All</button>' : '')+'</div>'+
      (sales ? '<div class="workflow-card"><div class="workflow-title"><div><h3>Sales Hierarchy</h3><p>BSO → BDM → ASM → RSM → ZSM → CBO</p></div></div>'+table('Sales', shown)+pager+'</div><div style="height:15px"></div>' : '')+
      (credit ? '<div class="workflow-card"><div class="workflow-title"><div><h3>Credit Hierarchy</h3><p>BCM → ACM → ZCM → Credit Head</p></div></div>'+table('Credit', shown)+(sales?'':pager)+'</div>' : '');
    root.querySelectorAll('[data-chip]').forEach(b => b.onclick = () => { const [k, v] = chips[+b.dataset.chip]; if (v !== null) f[k] = f[k].filter(x => x !== v); else f[k] = ''; if (k === 'q') { const s = document.getElementById('nfHmSearch'); if (s) s.value = ''; } page = 0; renderBar(); renderBody(); });
    root.querySelectorAll('[data-sort]').forEach(b => b.onclick = () => { const k = b.dataset.sort; sort = sort.key === k ? { key:k, dir:-sort.dir } : { key:k, dir: (k==='updated'||k==='created'||k==='amount') ? -1 : 1 }; renderBody(); });
    root.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => { page += +b.dataset.pg; renderBody(); root.scrollIntoView({ block:'start' }); });
    root.querySelectorAll('[data-size]').forEach(s => s.onchange = () => { size = +s.value; page = 0; renderBody(); });
    const r = root.querySelector('[data-reset]'); if (r) r.onclick = reset;
  }

  function panel() {
    const sel = (k, vals, all) => '<select data-adv="'+k+'"><option value="">'+all+'</option>'+vals.map(v => '<option'+(v===f[k]?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select>';
    const inp = (k, type, ph) => '<input data-adv="'+k+'" type="'+type+'" value="'+esc(f[k])+'"'+(ph?' placeholder="'+ph+'"':'')+'>';
    const field = (label, html) => '<label class="nf-hm-field"><span>'+label+'</span>'+html+'</label>';
    const views = saved();
    return '<div class="nf-hm-panel" role="dialog" aria-label="Advanced filters"><div class="nf-hm-panel-head"><h4>Advanced Filters</h4><button type="button" class="icon-btn" data-close-panel aria-label="Close filters">×</button></div>'+
      '<div class="nf-hm-grid">'+['product','status','branch','region','deviation'].map(k => field(LABEL[k], multi(k, false))).join('')+
      ROLE_F.map(r => field(r, sel(r, uniq(a => person(a,'Sales',r)), 'All '+r))).join('')+
      field('Case created from', inp('cFrom','date'))+field('Case created to', inp('cTo','date'))+
      field('Last updated from', inp('uFrom','date'))+field('Last updated to', inp('uTo','date'))+
      field('Min loan amount ₹', inp('min','number','0'))+field('Max loan amount ₹', inp('max','number','Any'))+
      field('SLA status', sel('sla', ['On Track','At Risk','Breached','Completed','No date'], 'All SLA'))+'</div>'+
      '<div class="nf-hm-saved"><h4>Saved views</h4><div>'+(views.length ? views.map((v, i) => '<span class="nf-hm-chip"><button type="button" class="nf-hm-load" data-load="'+i+'">'+esc(v.name)+'</button><button type="button" data-del="'+i+'" aria-label="Delete saved view">×</button></span>').join('') : '<small>No saved views yet.</small>')+'</div>'+
      '<div class="nf-hm-saverow"><input id="nfHmViewName" placeholder="e.g. My Tractor Cases"><button type="button" class="ghost-btn" data-save-view>Save current view</button></div></div>'+
      '<div class="nf-hm-panel-foot"><button type="button" class="ghost-btn" data-reset>Reset Filters</button><button type="button" class="primary-btn" data-close-panel>Show '+rows().length.toLocaleString('en-IN')+' cases</button></div></div>';
  }

  function renderBar() {
    const bar = document.getElementById('nfHmBar'); if (!bar) return;
    const nAdv = activeChips().filter(c => !['q'].includes(c[0])).length;
    bar.innerHTML = '<div class="nf-hm-search"><span aria-hidden="true">⌕</span><input id="nfHmSearch" type="search" placeholder="Search case, customer, mobile, PAN, LAN..." value="'+esc(f.q)+'" aria-label="Search cases">'+(f.q ? '<button type="button" data-clear-q aria-label="Clear search">×</button>' : '')+'</div>'+
      '<div class="nf-hm-quickrow">'+MULTI.map(k => multi(k, true)).join('')+'</div>'+
      '<div class="nf-hm-actions"><button type="button" class="ghost-btn nf-hm-filterbtn'+(open==='panel'?' on':'')+'" data-open-panel>⚲ Filter'+(nAdv ? ' <em>'+nAdv+'</em>' : '')+'</button>'+
      '<button type="button" class="ghost-btn" data-regions title="Edit region-to-branch mapping">⚙ Regions</button>'+
      '<div class="nf-hm-dd"><button type="button" class="primary-btn" data-export-toggle aria-expanded="'+(open==='export')+'">⇩ Export ▾</button>'+(open === 'export' ? exportMenu() : '')+'</div></div>'+
      (open === 'panel' ? panel() : '');
    wireBar(bar);
  }
  function exportMenu() {
    const fmts = [['xlsx','Excel (.xlsx)'],['xls','Excel 97-2003 (.xls)'],['csv','CSV (.csv)'],['pdf','PDF report'],['print','Print view'],['json','JSON (.json)'],['copy','Copy to clipboard']];
    const scopes = [['page','Current page'],['filtered','Filtered results ('+rows().length+')'],['all','All accessible cases ('+applications.length+')']];
    return '<div class="nf-hm-menu nf-hm-export"><div class="nf-hm-exscope">'+scopes.map((s, i) => '<label class="nf-hm-opt"><input type="radio" name="nfHmScope" value="'+s[0]+'"'+(i===1?' checked':'')+'> '+s[1]+'</label>').join('')+'</div><hr>'+
      fmts.map(x => '<button type="button" class="nf-hm-exbtn" data-export="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
  }

  function wireBar(bar) {
    const s = bar.querySelector('#nfHmSearch'); let t;
    if (s) { s.oninput = () => { clearTimeout(t); t = setTimeout(() => { f.q = s.value; page = 0; renderBody(); const c = bar.querySelector('[data-clear-q]'); if (!!f.q !== !!c) { const pos = s.selectionStart; renderBar(); const n = document.getElementById('nfHmSearch'); n.focus(); n.setSelectionRange(pos, pos); } }, 160); };
      s.onkeydown = e => { if (e.key === 'Enter') { clearTimeout(t); f.q = s.value; page = 0; renderBody(); } if (e.key === 'Escape') { f.q = ''; renderBar(); renderBody(); } }; }
    const cq = bar.querySelector('[data-clear-q]'); if (cq) cq.onclick = () => { f.q = ''; page = 0; renderBar(); renderBody(); document.getElementById('nfHmSearch')?.focus(); };
    bar.querySelectorAll('[data-dd-toggle]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.ddToggle; const inPanel = !!b.closest('.nf-hm-panel'); open = inPanel ? (panelOpen === k ? 'panel' : 'panel') : (open === k ? null : k); panelOpen = inPanel ? (panelOpen === k ? null : k) : null; renderBar(); });
    bar.querySelectorAll('[data-multi]').forEach(c => c.onchange = () => { const k = c.dataset.multi; f[k] = c.checked ? [...f[k], c.value] : f[k].filter(v => v !== c.value); page = 0; keep(); });
    bar.querySelectorAll('[data-all]').forEach(c => { const k = c.dataset.all, n = f[k].length; c.indeterminate = n > 0 && n < optsFor(k).length; c.onchange = () => { f[k] = c.checked ? optsFor(k).slice() : []; page = 0; keep(); }; });
    bar.querySelectorAll('[data-adv]').forEach(el => el.onchange = () => { f[el.dataset.adv] = el.value; page = 0; keep(); });
    bar.querySelectorAll('[data-open-panel]').forEach(b => b.onclick = e => { e.stopPropagation(); open = open === 'panel' ? null : 'panel'; panelOpen = null; renderBar(); });
    bar.querySelectorAll('[data-close-panel]').forEach(b => b.onclick = () => { open = null; panelOpen = null; renderBar(); });
    bar.querySelectorAll('[data-reset]').forEach(b => b.onclick = reset);
    bar.querySelectorAll('[data-regions]').forEach(b => b.onclick = e => { e.stopPropagation(); openRegionSettings(); });
    bar.querySelectorAll('[data-export-toggle]').forEach(b => b.onclick = e => { e.stopPropagation(); open = open === 'export' ? null : 'export'; renderBar(); });
    bar.querySelectorAll('[data-export]').forEach(b => b.onclick = () => { const scope = bar.querySelector('input[name="nfHmScope"]:checked')?.value || 'filtered'; doExport(b.dataset.export, scope); open = null; renderBar(); });
    bar.querySelectorAll('[data-load]').forEach(b => b.onclick = () => { const v = saved()[+b.dataset.load]; if (v) { f = { ...blank(), ...v.f }; page = 0; open = null; renderBar(); renderBody(); showToast('Loaded view: ' + v.name); } });
    bar.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const v = saved(); v.splice(+b.dataset.del, 1); localStorage.setItem(SAVED, JSON.stringify(v)); renderBar(); });
    const sv = bar.querySelector('[data-save-view]'); if (sv) sv.onclick = () => { const name = (document.getElementById('nfHmViewName')?.value || '').trim(); if (!name) return showToast('Enter a name for this view'); const v = saved().filter(x => x.name !== name); v.push({ name, f }); localStorage.setItem(SAVED, JSON.stringify(v)); showToast('Saved view: ' + name); renderBar(); };
    bar.querySelectorAll('.nf-hm-menu,.nf-hm-panel').forEach(m => m.addEventListener('click', e => e.stopPropagation()));
  }
  let panelOpen = null;
  // Region settings modal: edit branch → region mapping, persisted in localStorage.
  function openRegionSettings() {
    document.getElementById('nfHmRegionModal')?.remove();
    const branches = [...new Set([...Object.keys(REGION), ...uniq(a => a.branch)])].sort();
    const ov = document.createElement('div');
    ov.id = 'nfHmRegionModal'; ov.className = 'nf-hm-overlay';
    ov.innerHTML = '<div class="nf-hm-modal" role="dialog" aria-label="Region settings">'+
      '<div class="nf-hm-modal-head"><h3>Region to Branch Mapping</h3><button type="button" data-rm-close aria-label="Close">×</button></div>'+
      '<p class="nf-hm-modal-sub">Assign each branch to a region. Changes apply instantly to filters, table and exports, and are saved in this browser.</p>'+
      '<div class="nf-hm-modal-body">'+branches.map(b => '<div class="nf-hm-maprow"><span class="nf-hm-mapbranch" title="'+esc(b)+'">'+esc(b)+'</span><input data-region-for="'+esc(b)+'" value="'+esc(REGION[b] || '')+'" placeholder="Region name"></div>').join('')+
      '<div class="nf-hm-maprow nf-hm-mapnew"><input id="nfHmNewBranch" placeholder="New branch name"><input id="nfHmNewRegion" placeholder="Region name"><button type="button" class="ghost-btn" data-rm-add>+ Add</button></div></div>'+
      '<div class="nf-hm-modal-foot"><button type="button" class="ghost-btn" data-rm-reset>Reset to defaults</button><button type="button" class="primary-btn" data-rm-save>Save mapping</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    ov.querySelector('[data-rm-close]').onclick = () => ov.remove();
    ov.querySelector('[data-rm-add]').onclick = () => {
      const b = ov.querySelector('#nfHmNewBranch').value.trim(), r = ov.querySelector('#nfHmNewRegion').value.trim();
      if (!b || !r) return showToast('Enter both branch and region name');
      const row = document.createElement('div'); row.className = 'nf-hm-maprow';
      row.innerHTML = '<span class="nf-hm-mapbranch" title="'+esc(b)+'">'+esc(b)+'</span><input data-region-for="'+esc(b)+'" value="'+esc(r)+'">';
      ov.querySelector('.nf-hm-mapnew').before(row);
      ov.querySelector('#nfHmNewBranch').value = ''; ov.querySelector('#nfHmNewRegion').value = '';
    };
    ov.querySelector('[data-rm-reset]').onclick = () => { localStorage.removeItem(REGION_KEY); REGION = loadRegions(); ov.remove(); renderBar(); renderBody(); showToast('Region mapping reset to defaults'); };
    ov.querySelector('[data-rm-save]').onclick = () => {
      const map = {};
      ov.querySelectorAll('[data-region-for]').forEach(i => { const v = i.value.trim(); if (v) map[i.dataset.regionFor] = v; });
      localStorage.setItem(REGION_KEY, JSON.stringify(map));
      REGION = loadRegions();
      ov.remove(); renderBar(); renderBody();
      showToast('Region mapping saved (' + Object.keys(map).length + ' branches)');
      try { if (typeof nfAudit === 'function') nfAudit({ action: 'Region Mapping Updated', category: 'UPDATE', description: 'Hierarchy Monitor region mapping updated: ' + Object.keys(map).length + ' branches mapped', result: 'Success' }); } catch (e) {}
    };
  }
  // Re-render the bar but keep the currently open dropdown/panel scroll position.
  function keep() { const m = document.querySelector('#nfHmBar .nf-hm-menu'), p = document.querySelector('#nfHmBar .nf-hm-panel'); const ms = m?.scrollTop || 0, ps = p?.scrollTop || 0; renderBar(); renderBody(); const m2 = document.querySelector('#nfHmBar .nf-hm-menu'), p2 = document.querySelector('#nfHmBar .nf-hm-panel'); if (m2) m2.scrollTop = ms; if (p2) p2.scrollTop = ps; }
  function reset() { f = blank(); page = 0; open = null; panelOpen = null; renderBar(); renderBody(); }
  // Inside the panel, a multi dropdown opens via panelOpen; patch multi() visibility.
  const baseMulti = multi;
  multi = function(k, quick) { if (!quick) { const o = open; open = panelOpen === k ? k : null; const h = baseMulti(k, quick); open = o; return h; } return baseMulti(k, quick); };

  // Export
  const COLS = ['Case ID','Customer Name','Product','Branch','Region','BSO','BDM','ASM','RSM','ZSM','CBO','Current Status','Deviation','Loan Amount','Created Date','Last Updated','Current Owner','SLA Status'];
  const rowOf = a => [a.id, a.customer, a.product, a.branch||'', region(a), ...SALES.map(r => person(a,'Sales',r)), a.status, deviation(a), +a.amount||0, fmtD(created(a)), fmtD(updated(a)), owner(a), slaStatus(a)];
  function fileName(ext, scope) {
    const d = new Date().toISOString().slice(0, 10);
    let parts = scope === 'all' ? ['All_Cases'] : [...f.product, ...f.region, ...f.status, ...f.branch].slice(0, 4);
    if (!parts.length) parts = [scope === 'page' ? 'Current_Page' : (activeChips().length ? 'Filtered' : 'All_Cases')];
    return 'Hierarchy_Monitor_' + parts.map(p => String(p).replace(/[^A-Za-z0-9]+/g, '_')).join('_') + '_' + d + '.' + ext;
  }
  function download(name, mime, content) { const blob = new Blob([content], { type: mime }); const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 1500); }
  function reportHtml(data, scope, autoPrint) {
    const by = currentUser.name + ' (' + currentUser.role + ')';
    return '<!doctype html><html><head><meta charset="utf-8"><title>Hierarchy Monitor Report</title><style>body{font-family:Arial,sans-serif;color:#111;margin:24px}h1{margin:0;font-size:18px;letter-spacing:.04em}h2{margin:4px 0 12px;font-size:15px;color:#9b1c1c}.meta{font-size:11px;color:#444;margin-bottom:12px;line-height:1.6}table{width:100%;border-collapse:collapse;font-size:9px}th{background:#0f2747;color:#fff;text-align:left;padding:5px}td{border-bottom:1px solid #ddd;padding:4px 5px}tr{page-break-inside:avoid}thead{display:table-header-group}@page{size:A4 landscape;margin:12mm}</style></head><body>'+
      '<h1>NAMDEV FINVEST LTD.</h1><h2>Hierarchy Monitor Report</h2><div class="meta"><b>Generated:</b> '+esc(fmtDT(Date.now()))+'<br><b>Generated By:</b> '+esc(by)+'<br><b>Scope:</b> '+esc(scope)+' · '+data.length+' cases<br><b>Applied Filters:</b> '+esc(filterSummary())+'</div>'+
      '<table><thead><tr>'+COLS.map(c => '<th>'+c+'</th>').join('')+'</tr></thead><tbody>'+data.map(a => '<tr>'+rowOf(a).map((v, i) => '<td>'+esc(i === 13 ? '₹' + v.toLocaleString('en-IN') : v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>'+
      (autoPrint ? '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script>' : '')+'</body></html>';
  }
  // Native .xlsx builder: minimal OOXML workbook zipped with stored (uncompressed) entries.
  function buildXlsx(data, scopeLabel) {
    const enc = new TextEncoder();
    const colName = i => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = (i - 1 - m) / 26; } return s; };
    const cellXml = (v, r, c, style) => {
      const ref = colName(c) + r;
      if (typeof v === 'number' && isFinite(v)) return '<c r="'+ref+'"'+(style?' s="'+style+'"':'')+'><v>'+v+'</v></c>';
      return '<c r="'+ref+'" t="inlineStr"'+(style?' s="'+style+'"':'')+'><is><t xml:space="preserve">'+esc(v)+'</t></is></c>';
    };
    const metaRows = [
      [cellXml('NAMDEV FINVEST LTD. — Hierarchy Monitor Report', 1, 0, 2)],
      [cellXml('Generated '+fmtDT(Date.now())+' by '+currentUser.name+' ('+currentUser.role+') · '+scopeLabel+' · Filters: '+filterSummary(), 2, 0, 0)],
      []
    ];
    const headerRow = COLS.map((c, i) => cellXml(c, 4, i, 1));
    const dataRows = data.map((a, ri) => rowOf(a).map((v, ci) => cellXml(v, ri + 5, ci, 0)));
    const allRows = [...metaRows, headerRow, ...dataRows];
    const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
      '<sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
      '<cols>'+COLS.map((c, i) => '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+(i === 1 ? 24 : i === 13 ? 14 : 16)+'" customWidth="1"/>').join('')+'</cols>'+
      '<sheetData>'+allRows.map((cells, ri) => '<row r="'+(ri+1)+'">'+cells.join('')+'</row>').join('')+'</sheetData>'+
      '<autoFilter ref="A4:'+colName(COLS.length-1)+(data.length+4)+'"/></worksheet>';
    const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
      '<fonts count="3"><font><sz val="10"/><name val="Calibri"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="13"/><name val="Calibri"/></font></fonts>'+
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F2747"/><bgColor indexed="64"/></patternFill></fill></fills>'+
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'+
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
      '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'+
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'+
      '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>';
    const files = {
      '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Hierarchy Monitor" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml': styles,
      'xl/worksheets/sheet1.xml': sheet
    };
    const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
    const crc32 = buf => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
    const chunks = [], central = [];
    let offset = 0;
    Object.keys(files).forEach(name => {
      const nameB = enc.encode(name), dataB = enc.encode(files[name]);
      const crc = crc32(dataB);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true); local.setUint16(8, 0, true); local.setUint16(10, 0, true); local.setUint16(12, 0, true);
      local.setUint32(14, crc, true); local.setUint32(18, dataB.length, true); local.setUint32(22, dataB.length, true);
      local.setUint16(26, nameB.length, true); local.setUint16(28, 0, true);
      chunks.push(new Uint8Array(local.buffer), nameB, dataB);
      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
      cen.setUint32(16, crc, true); cen.setUint32(20, dataB.length, true); cen.setUint32(24, dataB.length, true);
      cen.setUint16(28, nameB.length, true); cen.setUint32(42, offset, true);
      central.push(new Uint8Array(cen.buffer), nameB);
      offset += 30 + nameB.length + dataB.length;
    });
    const cenSize = central.reduce((s, c) => s + c.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, Object.keys(files).length, true); end.setUint16(10, Object.keys(files).length, true);
    end.setUint32(12, cenSize, true); end.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function doExport(fmt, scope) {
    const list = rows(), data = scope === 'all' ? applications.slice() : scope === 'page' ? list.slice(page * size, page * size + size) : list;
    if (!data.length) return showToast('No cases to export for this selection');
    const scopeLabel = { page:'Current page', filtered:'Filtered results', all:'All accessible cases' }[scope];
    const csvCell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    let label = fmt.toUpperCase();
    if (fmt === 'csv') download(fileName('csv', scope), 'text/csv;charset=utf-8', '\ufeff' + [COLS, ...data.map(rowOf)].map(r => r.map(csvCell).join(',')).join('\n'));
    else if (fmt === 'json') download(fileName('json', scope), 'application/json', JSON.stringify(data.map(a => Object.fromEntries(COLS.map((c, i) => [c, rowOf(a)[i]]))), null, 2));
    else if (fmt === 'xls') {
      label = 'Excel';
      const x = v => esc(v);
      const cell = v => typeof v === 'number' ? '<Cell><Data ss:Type="Number">'+v+'</Data></Cell>' : '<Cell><Data ss:Type="String">'+x(v)+'</Data></Cell>';
      const xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0F2747" ss:Pattern="Solid"/></Style><Style ss:ID="t"><Font ss:Bold="1" ss:Size="13"/></Style></Styles><Worksheet ss:Name="Hierarchy Monitor"><Table>'+
        '<Row><Cell ss:StyleID="t"><Data ss:Type="String">NAMDEV FINVEST LTD. — Hierarchy Monitor Report</Data></Cell></Row>'+
        '<Row><Cell><Data ss:Type="String">Generated '+x(fmtDT(Date.now()))+' by '+x(currentUser.name+' ('+currentUser.role+')')+' · '+x(scopeLabel)+' · Filters: '+x(filterSummary())+'</Data></Cell></Row><Row/>'+
        '<Row>'+COLS.map(c => '<Cell ss:StyleID="h"><Data ss:Type="String">'+c+'</Data></Cell>').join('')+'</Row>'+
        data.map(a => '<Row>'+rowOf(a).map(cell).join('')+'</Row>').join('')+'</Table></Worksheet></Workbook>';
      download(fileName('xls', scope), 'application/vnd.ms-excel', xml);
    } else if (fmt === 'xlsx') {
      label = 'Excel (.xlsx)';
      download(fileName('xlsx', scope), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buildXlsx(data, scopeLabel));
    } else if (fmt === 'pdf' || fmt === 'print') {
      label = fmt === 'pdf' ? 'PDF' : 'Print';
      const w = window.open('', '_blank');
      if (!w) return showToast('Allow pop-ups to open the report');
      w.document.write(reportHtml(data, scopeLabel, true)); w.document.close();
      if (fmt === 'pdf') showToast('Report opened — choose "Save as PDF" in the print dialog');
    } else if (fmt === 'copy') {
      label = 'Clipboard';
      const text = [COLS, ...data.map(rowOf)].map(r => r.join('\t')).join('\n');
      (navigator.clipboard?.writeText(text) || Promise.reject()).then(() => showToast(data.length + ' cases copied — paste into Excel'), () => showToast('Clipboard not available in this browser'));
    }
    if (fmt !== 'pdf' && fmt !== 'copy') showToast(label + ' export ready · ' + data.length + ' cases');
    // Audit: no customer data, only format, count and filters.
    try { if (typeof nfAudit === 'function') nfAudit('', 'Hierarchy Report Exported', label + ' · ' + data.length + ' records · ' + scopeLabel, { category:'EXPORT', reason:'Filters: ' + filterSummary(), result:data.length + ' records exported as ' + label }); } catch (e) {}
  }

  const legacy = renderHierarchyMonitor;
  renderHierarchyMonitor = function() {
    const r = legacy.apply(this, arguments);
    const head = document.querySelector('#content .page-head');
    if (!head || !(typeof isManager === 'function' ? isManager() || currentUser.role === 'CEO' : true)) return r;
    indexActivity(); cache.key = ''; open = null; panelOpen = null;
    [...document.querySelectorAll('#content > .workflow-card, #content > div[style*="height:15px"]')].forEach(n => n.remove());
    head.insertAdjacentHTML('afterend', '<div id="nfHmBar" class="nf-hm-bar"></div><div id="nfHmBody"></div>');
    renderBar(); renderBody();
    return r;
  };
  document.addEventListener('click', e => { if (!open || !document.getElementById('nfHmBar')) return; if (e.target.closest('#nfHmBar .nf-hm-menu, #nfHmBar .nf-hm-panel')) return; if (open !== null) { open = null; panelOpen = null; renderBar(); } });

  const css = document.createElement('style');
  css.textContent = '.nf-hm-bar{position:relative;display:grid;grid-template-columns:minmax(220px,1.4fr) auto auto;gap:10px;align-items:center;padding:12px;margin:0 0 10px;border:1px solid var(--shell-line,#e3e8f0);border-radius:12px;background:var(--card,#fff)}'+
    '.nf-hm-search{position:relative;display:flex;align-items:center}.nf-hm-search>span{position:absolute;left:12px;color:var(--muted);font-size:16px}.nf-hm-search input{height:44px;width:100%;padding:0 36px 0 34px}.nf-hm-search button{position:absolute;right:6px;border:0;background:transparent;font-size:18px;cursor:pointer;color:var(--muted);width:30px;height:30px}'+
    '.nf-hm-quickrow{display:flex;gap:8px;flex-wrap:nowrap}.nf-hm-actions{display:flex;gap:8px;justify-content:flex-end}.nf-hm-actions .ghost-btn,.nf-hm-actions .primary-btn{height:44px;white-space:nowrap}.nf-hm-filterbtn em{font-style:normal;background:var(--primary,#c81e1e);color:#fff;border-radius:99px;padding:1px 7px;font-size:11px;margin-left:4px}'+
    '.nf-hm-dd{position:relative}.nf-hm-ddbtn{height:44px;display:flex;align-items:center;gap:6px;padding:0 10px;border:1px solid var(--shell-line,#d9e0ea);border-radius:10px;background:var(--card,#fff);cursor:pointer;font:inherit;white-space:nowrap;max-width:190px}.nf-hm-ddbtn span{font-size:11px;color:var(--muted)}.nf-hm-ddbtn b{font-size:12.5px;overflow:hidden;text-overflow:ellipsis}.nf-hm-ddbtn.on{border-color:var(--primary,#c81e1e);background:color-mix(in srgb,var(--primary,#c81e1e) 6%,transparent)}.nf-hm-ddbtn i{font-style:normal;color:var(--muted)}'+
    '.nf-hm-menu{position:absolute;z-index:60;top:calc(100% + 6px);left:0;min-width:230px;max-height:300px;overflow:auto;background:var(--card,#fff);border:1px solid var(--shell-line,#d9e0ea);border-radius:12px;box-shadow:0 14px 34px rgba(15,39,71,.16);padding:6px}.nf-hm-export{right:0;left:auto;min-width:250px;max-height:none}.nf-hm-export hr{border:0;border-top:1px solid var(--shell-line,#e3e8f0);margin:6px 0}'+
    '.nf-hm-opt{display:flex!important;flex-direction:row!important;align-items:center;gap:8px;padding:7px 8px;border-radius:8px;font-size:13px;cursor:pointer}.nf-hm-opt:hover{background:var(--soft,#f3f6fa)}.nf-hm-opt input{width:auto!important;height:auto!important}.nf-hm-opt.all{font-weight:600;border-bottom:1px solid var(--shell-line,#e3e8f0);border-radius:0}'+
    '.nf-hm-exbtn{display:block;width:100%;text-align:left;padding:9px 10px;border:0;background:transparent;border-radius:8px;cursor:pointer;font:inherit;font-size:13px}.nf-hm-exbtn:hover{background:var(--soft,#f3f6fa)}'+
    '.nf-hm-panel{grid-column:1/-1;border-top:1px solid var(--shell-line,#e3e8f0);padding-top:12px;margin-top:2px}.nf-hm-panel-head,.nf-hm-panel-foot{display:flex;justify-content:space-between;align-items:center;gap:10px}.nf-hm-panel-head h4,.nf-hm-saved h4{margin:0 0 10px}.nf-hm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}.nf-hm-field{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);min-width:0}.nf-hm-field select,.nf-hm-field input{height:44px;width:100%}.nf-hm-field .nf-hm-ddbtn{width:100%;max-width:none}'+
    '.nf-hm-saved{margin:14px 0}.nf-hm-saved>div{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.nf-hm-saverow{display:flex;gap:8px;max-width:460px}.nf-hm-saverow input{height:40px;flex:1}.nf-hm-load{border:0;background:transparent;font:inherit;cursor:pointer;color:inherit;padding:0}'+
    '.nf-hm-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 12px}.nf-hm-count{font-size:13px;margin-right:6px}.nf-hm-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 6px 4px 10px;border-radius:99px;background:color-mix(in srgb,var(--primary,#c81e1e) 9%,transparent);font-size:12px}.nf-hm-chip button{border:0;background:transparent;cursor:pointer;font-size:14px;line-height:1;color:inherit}.nf-hm-clear{border:0;background:transparent;color:var(--primary,#c81e1e);font-weight:600;cursor:pointer;font:inherit;font-size:12.5px}'+
    '.nf-hm-sort{border:0;background:transparent;font:inherit;font-weight:inherit;color:inherit;cursor:pointer;padding:0;white-space:nowrap}.nf-hm-sort span{opacity:.45;font-size:10px}.nf-hm-sort.on span{opacity:1}'+
    '.nf-hm-pager{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;font-size:12.5px}.nf-hm-pager>div{display:flex;gap:8px;align-items:center}.nf-hm-pager label{display:flex!important;flex-direction:row!important;align-items:center;gap:6px}.nf-hm-pager select{height:36px;width:auto!important}'+
    '.nf-hm-overlay{position:fixed;inset:0;z-index:200;background:rgba(15,39,71,.45);display:flex;align-items:center;justify-content:center;padding:20px}.nf-hm-modal{background:var(--card,#fff);border-radius:14px;box-shadow:0 24px 60px rgba(15,39,71,.3);width:min(620px,100%);max-height:86vh;display:flex;flex-direction:column;overflow:hidden}.nf-hm-modal-head{display:flex;justify-content:space-between;align-items:center;padding:16px 18px 8px}.nf-hm-modal-head h3{margin:0;font-size:16px}.nf-hm-modal-head button{border:0;background:transparent;font-size:22px;cursor:pointer;line-height:1;color:var(--muted)}.nf-hm-modal-sub{margin:0 18px 10px;font-size:12.5px;color:var(--muted)}.nf-hm-modal-body{overflow:auto;padding:0 18px;flex:1}.nf-hm-maprow{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid var(--shell-line,#e3e8f0)}.nf-hm-maprow input{height:40px;width:100%}.nf-hm-mapbranch{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nf-hm-mapnew{grid-template-columns:1fr 1fr auto;border-bottom:0;margin-top:4px}.nf-hm-mapnew .ghost-btn{height:40px}.nf-hm-modal-foot{display:flex;justify-content:space-between;gap:10px;padding:14px 18px;border-top:1px solid var(--shell-line,#e3e8f0)}'+
    '@media(max-width:1400px){.nf-hm-q-deviation,.nf-hm-q-region{display:none}}@media(max-width:1180px){.nf-hm-bar{grid-template-columns:1fr auto}.nf-hm-quickrow{grid-column:1/-1;order:3}.nf-hm-q-branch{display:none}}@media(max-width:620px){.nf-hm-bar{grid-template-columns:1fr}.nf-hm-quickrow{display:none}.nf-hm-actions{justify-content:stretch}.nf-hm-actions>*{flex:1}.nf-hm-actions .primary-btn,.nf-hm-actions .ghost-btn{width:100%}.nf-hm-export{left:auto;right:0}}';
  document.head.appendChild(css);
})();
</script>`;