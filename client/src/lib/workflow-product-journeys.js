// Product-specific entry points into the shared CRM-to-servicing lifecycle.
export function makeProductJourneysScript(apiBase) {
  return String.raw`<script>(() => {
if (typeof navTo === 'undefined' || typeof currentUser === 'undefined') return;
const API = ${JSON.stringify(apiBase)};
const PRODUCTS = {
  journeyTwoWheeler:{ key:'twoWheeler', name:'Two Wheeler', icon:'🏍️' },
  journeySolar:{ key:'solar', name:'Solar Loan', icon:'☀️' },
  journeyLAP:{ key:'lap', name:'LAP', icon:'🏠' },
  journeyTractor:{ key:'tractor', name:'Tractor Loan', icon:'🚜' }
};
const PJ = { view:null, key:null, product:null, connected:'', legacy:[], legacyError:'' };
const h = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.PJ = PJ;

function token() { return sessionStorage.getItem('token'); }
async function ensureToken(force) {
  if (token() && !force) return;
  const response = await fetch(API + '/auth/demo-session', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ role:currentUser.role, name:currentUser.name || currentUser.role })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.token) throw new Error('Your session could not be established. Please sign in again.');
  sessionStorage.setItem('token', result.token);
}
async function loadLegacy() {
  await ensureToken();
  let response = await fetch(API + '/journeys?product=' + encodeURIComponent(PJ.key), {
    headers:{ Authorization:'Bearer ' + token() }
  });
  if (response.status === 401) {
    sessionStorage.removeItem('token');
    await ensureToken(true);
    response = await fetch(API + '/journeys?product=' + encodeURIComponent(PJ.key), {
      headers:{ Authorization:'Bearer ' + token() }
    });
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Legacy journey history could not be loaded.');
  PJ.legacy = result.data || [];
}
function canStartLead() {
  return typeof window.nfCan !== 'function' || window.nfCan('createCRMLead');
}
function renderLegacy() {
  if (PJ.legacyError) return '<div class="notice warn">Legacy journey history is temporarily unavailable: ' + h(PJ.legacyError) + '</div>';
  if (!PJ.legacy.length) return '';
  const rows = PJ.legacy.map(j => '<tr><td>' + h(j.journeyNo) + '</td><td>' + h(j.customerName || '—') + '</td><td>' +
    h(j.status) + '</td><td>' + (j.completedSteps || []).length + ' of 20</td><td><span class="badge gray">Read-only history</span></td></tr>').join('');
  return '<div class="process-card" style="margin-top:16px"><div class="section-bar"><div><h3>Previous standalone journey records</h3>' +
    '<p>Preserved for reference only. New cases continue through the shared lifecycle.</p></div></div>' +
    '<div class="table-wrap"><table><thead><tr><th>Journey</th><th>Customer</th><th>Last status</th><th>Progress</th><th></th></tr></thead><tbody>' +
    rows + '</tbody></table></div></div>';
}
function render() {
  const product = PJ.product;
  const start = canStartLead()
    ? '<button class="primary-btn" onclick="pjStartLead()">Start ' + h(product.name) + ' case in CRM →</button>'
    : '<span class="badge amber">Your role cannot create CRM leads</span>';
  $('#content').innerHTML = '<div class="process-shell"><div class="process-top"><div class="process-topbar"><div class="process-ident">' +
    '<div class="product-icon">' + product.icon + '</div><div><h3>' + h(product.name) + ' • Shared Product Journey</h3>' +
    '<p>One connected case from consent and dedupe through servicing</p></div></div><span class="role-chip"><i></i>' + h(currentUser.role) + '</span></div></div>' +
    '<div class="process-card"><div class="section-bar"><div><h3>Start with verified CRM lead capture</h3>' +
    '<p>Consent and local demo OTP are required before PAN/Aadhaar dedupe. A matching customer must be reused; a new case is created only for a clear, eligible lead.</p></div>' + start + '</div>' +
    '<div class="notice info">After the CRM/BSO gates, the standard LOS application captures the product-specific asset, income, collateral, and loan economics. The same BDM/IMD/BSA, credit, DO, demo eSign/disbursement, LMS account, repayment, and servicing GL steps apply once. This is a demo; it does not perform real KYC, send SMS, or move funds.</div>' +
    (PJ.connected ? '<div class="pj-extra" style="margin-top:16px"><h3>Connected ' + h(product.name) + ' cases</h3>' + PJ.connected + '</div>' : '') +
    renderLegacy() + '</div></div>';
}
window.pjStartLead = () => {
  if (!canStartLead()) { showToast('Your role cannot create CRM leads.'); return; }
  if (typeof openCRMNewLead !== 'function') { showToast('CRM Lead Capture is unavailable. No product case was created.'); return; }
  openCRMNewLead(PJ.product.name);
};
window.pjNew = window.pjStartLead;
window.pjOpen = () => showToast('Standalone product journeys are read-only. Open a connected case or start from CRM Lead Capture.');
window.pjSave = window.pjOpen;
window.pjComplete = window.pjOpen;
window.pjResumeActive = window.pjOpen;

const baseNav = navTo;
navTo = function(view) {
  if (!Object.hasOwn(PRODUCTS, view)) return baseNav.apply(this, arguments);
  PJ.view = view;
  PJ.product = PRODUCTS[view];
  PJ.key = PJ.product.key;
  baseNav.apply(this, arguments);
  if (typeof roleCanView === 'function' && !roleCanView(view)) return;
  const connected = $('#content').querySelector('.workflow-card');
  PJ.connected = connected ? connected.outerHTML : '';
  PJ.legacy = [];
  PJ.legacyError = '';
  render();
  loadLegacy().then(render).catch(error => {
    PJ.legacyError = error.message;
    render();
  });
};
})();</script>`;
}
