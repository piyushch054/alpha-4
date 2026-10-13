// PD remains part of the selected LOS application and consumes the existing employee session.
export function makeWorkflowPDScript(apiBase) {
  return String.raw`<script>
(() => {
  const API = __PD_API_BASE__;
  const PD_STORE = 'namdev-pd-records-v3';
  const WIZARD_STORE = 'namdev-los-wizard-drafts-v3';
  const TYPES = ['Asset PD','Business PD','Red PD'];
  const STATUSES = ['Pending','In Progress','Completed','Recommended','Not Recommended','Hold','Query Required'];
  const COMPLETE = ['Completed','Recommended'];
  const SALES = ['BSO','BDM','Sales User'];
  const ADMINS = ['admin','super_admin','System Admin','SUPER_SUPER_ADMIN','ADMIN','SUPER_ADMIN'];
  const CREDIT = ['BCM','ACM','ZCM','Credit User','Credit Head'];
  const esc = losEscapeHtml;
  let loadedId = null;
  let record = null;
  let draft = null;
  let dirty = false;
  let pending = false;
  let loading = false;
  let error = '';
  let operation = '';
  let reloadRequested = false;
  let locationMessage = '';
  let cameraMessage = '';
  let cameraStream = null;
  let generation = 0;

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const readStore = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; } };
  const writeStore = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch (e) { showToast('Browser storage is full. Remove an older captured picture and try again.'); } };
  const slug = value => String(value || 'employee').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'employee';
  function employee() {
    let session = null;
    try { session = typeof namdevSession !== 'undefined' ? namdevSession.read() : null; } catch (e) {}
    const active = typeof currentUser !== 'undefined' ? currentUser : {};
    const role = active.role || session?.role || '';
    const name = active.name || role;
    const email = session?.email || slug(name) + '@namdev.local';
    return { id:'session-' + slug(role + '-' + name),name,email,role };
  }
  function may(action) {
    const role = employee().role;
    if (!role) return false;
    if (browserCase() && typeof nfCan === 'function') return nfCan(action === 'view' ? 'view' : 'edit');
    const admin = ADMINS.includes(role);
    if (action === 'view') return admin || SALES.includes(role) || CREDIT.includes(role) || ['CEO','Audit Manager','Compliance Manager','Compliance Officer'].includes(role);
    if (action === 'bureau') return admin || SALES.includes(role) || CREDIT.includes(role);
    return admin || SALES.includes(role);
  }
  function appContext(app) {
    const lifecycle = app?.lifecycle || {};
    return {
      applicationId:app?.id || '',
      dealNo:app?.workflow?.dealId || app?.id || '',
      leadId:lifecycle.leadId || app?.leadId || 'LEAD-' + (app?.id || ''),
      customerId:lifecycle.customerId || lifecycle.profileId || app?.customerId || 'CUS-' + (app?.id || ''),
      product:app?.product || wizard.product || '',
      customer:app?.customer || '',
      branch:app?.branch || wizard.data.branch || '',
      scheme:app?.scheme || wizard.data.scheme || (app?.product ? app.product + ' Standard' : ''),
      date:app?.created || (app?.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'Not recorded')
    };
  }
  function withoutPDFields(data = {}) {
    return Object.fromEntries(Object.entries(data).filter(([name]) => !name.startsWith('pd-') && name !== 'pdCase'));
  }
  function requestHeaders() {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) throw new Error('Your LOS employee session has expired. Sign in again from the main workspace.');
    return {
      Authorization:'Bearer ' + token,
      'Content-Type':'application/json'
    };
  }
  const hasToken = () => !!(sessionStorage.getItem('token') || localStorage.getItem('token'));
  async function ensureSession() {
    if (browserCase()) return;
    const person = employee();
    const key = person.role + '|' + person.name;
    if (!person.role || (hasToken() && sessionStorage.getItem('pdSessionKey') === key)) return;
    try {
      const response = await fetch(API + '/auth/demo-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:person.role,name:person.name})});
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.token) throw new Error('unavailable');
      sessionStorage.setItem('token',result.token);
      sessionStorage.setItem('pdSessionKey',key);
      localStorage.removeItem('token');
    } catch (e) {
      if (sessionStorage.getItem('pdSessionKey')) { sessionStorage.removeItem('token'); sessionStorage.removeItem('pdSessionKey'); }
    }
  }
  // Obtain the server-issued JWT at sign-in so every later API call is already authenticated.
  document.querySelector('#loginForm')?.addEventListener('submit',() => setTimeout(ensureSession,100));
  function browserCase() {
    const app = getWizardApplication();
    return !!app && (app.browserLocalOnly === true || (!app.serverPersisted && !hasToken()));
  }
  function localOperation(path, method, body) {
    const app = getWizardApplication();
    const base = '/applications/' + encodeURIComponent(app.id) + '/';
    if (!path.startsWith(base)) throw new Error('The active application changed. Reopen PD.');
    const action = path.slice(base.length);
    const store = JSON.parse(localStorage.getItem(PD_STORE) || '{}');
    const saved = clone(store[app.id] || {
      _id:app.id,__v:0,pd:app.pd,pdHistory:app.pdHistory || [],
      cam:app.cam || {status:'Not Sent'},bureau:app.bureau || {status:'Not Requested'},status:app.status
    });
    saved.browserPersisted = true;
    if (!may('view')) throw new Error('Your workspace role cannot view PD.');
    if (method === 'GET') return saved;
    if (!may(action === 'bureau-check' ? 'bureau' : action === 'verify-pd' ? 'verify' : 'save')) throw new Error('Your workspace role cannot change PD.');
    const now = new Date().toISOString();
    const officer = employee();
    if (action === 'pd') {
      if (saved.cam.status === 'Pending') throw new Error('PD is locked after sending to CAM.');
      if (body.revision !== (saved.pd?.revision || 0)) throw new Error('PD changed. Reload before saving.');
      const issues = validate(body);
      if (issues.length) throw new Error(issues.join(' '));
      if (saved.pd && sameDetails(saved.pd,body)) return saved;
      const revision = (saved.pd?.revision || 0) + 1;
      const previous = saved.pd;
      saved.pd = {...body,...appContext(app),recordId:previous?.recordId || app.id + '-PD-001',
        revision,doneBy:previous?.doneBy || officer.id,doneByName:previous?.doneByName || officer.name,doneByRole:previous?.doneByRole || officer.role,createdAt:previous?.createdAt || now,updatedAt:now,updatedBy:officer.id};
      saved.pdHistory.push(clone(saved.pd));
      saved.pdVerification = {status:'Verification Pending',revision};
    } else if (action === 'verify-pd') {
      if (!saved.pd || body.revision !== saved.pd.revision) throw new Error('Save or reload the latest PD before verification.');
      if (saved.cam.status !== 'Not Sent') throw new Error('PD is locked after sending to CAM.');
      if (saved.pdVerification?.status === 'Verified' && saved.pdVerification.revision === body.revision) return saved;
      const issues = validate(saved.pd,true);
      saved.pdVerification = {status:issues.length ? 'Rejected' : 'Verified',revision:body.revision,reason:issues.join(' '),by:officer.id,at:now};
    } else if (action === 'send-to-cam') {
      if (saved.cam.status === 'Pending') return saved;
      const issues = validate(saved.pd || {},true);
      if (issues.length) throw new Error(issues.join(' '));
      if (body.revision !== saved.pd.revision) throw new Error('Reload the latest PD before sending to CAM.');
      if (!verified(saved)) throw new Error('Verify the latest saved PD before sending to CAM.');
      saved.cam = {status:'Pending',stage:'CAM Allocation',pdRevision:saved.pd.revision,sentAt:now,sentBy:officer.id};
      saved.status = 'CAM Allocation';
      saved.pdVerification.status = 'Sent To CAM';
    } else if (action === 'bureau-check') {
      if (saved.cam.status !== 'Pending') throw new Error('Send PD to CAM before requesting Bureau Check.');
      if (saved.bureau.status === 'Pending Integration') return saved;
      saved.bureau = {status:'Pending Integration',requestId:'BUREAU-' + app.id,requestedAt:now,requestedBy:officer.id};
    } else throw new Error('Unsupported PD action.');
    saved.__v++;
    saved.updatedAt = now;
    saved.audit = [...(saved.audit || []),{action,at:now,by:officer.id,revision:saved.pd?.revision}];
    store[app.id] = saved;
    localStorage.setItem(PD_STORE,JSON.stringify(store));
    return saved;
  }
  async function api(path, method = 'GET', body) {
    if (browserCase()) return localOperation(path,method,body);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),20000);
    try {
    const response = await fetch(API + path, { method,signal:controller.signal,headers:requestHeaders(),...(body ? {body:JSON.stringify(body)} : {}) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'The LOS API could not complete this action.');
    return result.data;
    } catch (e) { throw new Error(e.name === 'AbortError' ? 'The PD request timed out. Reload saved PD before retrying.' : e instanceof TypeError ? 'The LOS server could not be reached. Your entries are kept; check the connection and retry.' : e.message); }
    finally { clearTimeout(timeout); }
  }
  window.nfWorkflowApi = async (path, method = 'GET', body) => {
    await ensureSession();
    return api(path,method,body);
  };
  window.nfSendLosToBdm = async app => {
    if (!app?.serverPersisted) return null;
    await syncDraft(app);
    const saved = await api('/applications/' + encodeURIComponent(app.id) + '/send-to-imd','POST',{});
    apply(saved);
    return saved;
  };
  function sameDetails(a,b) {
    const keys = ['code','type','meetingAt','personMet','location','remarks','status','followUpRequired','geotag','picture'];
    return keys.every(key => JSON.stringify(a[key]) === JSON.stringify(b[key])) && (!a.followUpRequired || JSON.stringify(a.followUp) === JSON.stringify(b.followUp));
  }
  function verified(saved) {
    return !!saved?.pd && ['Verified','Sent To CAM'].includes(saved.pdVerification?.status) && saved.pdVerification.revision === saved.pd.revision;
  }
  function localTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  }
  function iso(value) { return value ? new Date(value).toISOString() : ''; }
  function displayDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toLocaleString('en-IN') : '—';
  }
  function saveLocal(saved) {
    const store = readStore(PD_STORE);
    store[saved._id] = {
      _id:saved._id,__v:saved.__v,pd:clone(saved.pd),pdHistory:clone(saved.pdHistory || []),
      cam:clone(saved.cam),bureau:clone(saved.bureau),status:saved.status,updatedAt:saved.updatedAt,
      browserPersisted:saved.browserPersisted,audit:clone(saved.audit || []),pdVerification:clone(saved.pdVerification)
    };
    writeStore(PD_STORE,store);
  }
  function cachedRecord(app) {
    const cached = readStore(PD_STORE)[app.id];
    if (!cached) return null;
    return { ...app,_id:app.id,__v:cached.__v || app.serverVersion || 0,...cached };
  }
  function snapshotWizard() {
    const app = getWizardApplication();
    if (!app) return;
    if (wizard.step === 5 && document.querySelector('#pdForm') && wizard.pdDemoBypass !== true) draft = readForm();
    const current = employee();
    const store = readStore(WIZARD_STORE);
    store[app.id] = {
      employeeId:current.id,
      wizard:{ ...wizard,data:withoutPDFields(wizard.data),docs:clone(wizard.docs) },
      pdDraft:clone(draft),
      pdDirty:dirty,
      savedAt:new Date().toISOString()
    };
    store.activeByEmployee = { ...(store.activeByEmployee || {}),[current.id]:app.id };
    writeStore(WIZARD_STORE,store);
  }
  function restoreWizardFor(app) {
    const saved = readStore(WIZARD_STORE)[app.id];
    if (!saved || saved.employeeId !== employee().id || saved.wizard?.product !== app.product) return false;
    wizard = { ...saved.wizard,selectedApplicationId:app.id,data:withoutPDFields(saved.wizard.data || {}) };
    draft = clone(saved.pdDraft);
    dirty = !!saved.pdDirty;
    return true;
  }
  function restoreActiveWizard() {
    const store = readStore(WIZARD_STORE);
    const id = store.activeByEmployee?.[employee().id];
    const app = applications.find(item => item.id === id);
    if (!app || !restoreWizardFor(app)) return false;
    loadedId = null;
    record = cachedRecord(app);
    renderWizard();
    return true;
  }
  function nextCode(app) {
    const count = Math.max(record?.pdHistory?.length || 0,record?.pd?.revision || 0) + 1;
    return 'PD-' + app.id.replace(/[^A-Za-z0-9]/g,'') + '-' + String(count).padStart(3,'0');
  }
  function blankDraft(app) {
    const now = new Date();
    now.setSeconds(0,0);
    return {
      code:nextCode(app),type:'',meetingAt:localTime(now),personMet:'',location:'',remarks:'',
      followUpRequired:false,followUp:{},status:'In Progress',geotag:null,picture:null
    };
  }
  function fromPD(pd, app) {
    if (!pd) return blankDraft(app);
    return {
      ...clone(pd),meetingAt:localTime(pd.meetingAt),
      followUp:pd.followUp ? { ...clone(pd.followUp),at:localTime(pd.followUp.at) } : {},
      geotag:clone(pd.geotag),picture:clone(pd.picture)
    };
  }
  function ensureDraft(app) {
    if (!draft) draft = fromPD(record?.pd,app);
    return draft;
  }
  function readForm() {
    if (!document.querySelector('#pdForm')) return clone(draft || {});
    const value = name => document.querySelector('#pd-' + name)?.value || '';
    return {
      ...(draft || {}),
      code:value('code'),type:value('type'),meetingAt:value('meetingAt'),personMet:value('personMet'),
      location:value('location'),remarks:value('remarks'),status:value('status'),
      followUpRequired:value('followUpRequired') === 'Yes',
      followUp:{ at:value('followUpAt'),person:value('followUpPerson'),location:value('followUpLocation'),remarks:value('followUpRemarks') },
      geotag:clone(draft?.geotag),picture:clone(draft?.picture)
    };
  }
  function disabled() { return loading || pending || !may('save') || record?.cam?.status === 'Pending'; }
  function field(label,name,value,options = {}) {
    const attrs = ' id="pd-' + name + '" name="' + name + '" ' + (options.readonly ? 'readonly aria-readonly="true" ' : disabled() ? 'disabled ' : '') + (options.list ? 'list="' + options.list + '" autocomplete="off" ' : '') + (options.required ? 'required ' : '') + (options.max ? 'maxlength="' + options.max + '" ' : '');
    let control;
    if (options.items) control = '<select' + attrs + '><option value="">Select</option>' + options.items.map(item => '<option value="' + esc(item) + '" ' + (String(value) === item ? 'selected' : '') + '>' + esc(item) + '</option>').join('') + '</select>';
    else if (options.textarea) control = '<textarea' + attrs + ' rows="3">' + esc(value || '') + '</textarea>';
    else control = '<input' + attrs + ' type="' + (options.type || 'text') + '" value="' + esc(value || '') + '">';
    return '<label class="pd-field"><span>' + esc(label) + (options.required ? ' <i>*</i>' : '') + '</span>' + control + '</label>';
  }
  function personMetOptions(app) {
    const data = wizard.data || {};
    const names = [
      [data.firstName ? (data.firstName + ' ' + (data.lastName || '')).trim() : app?.customer,'Applicant'],
      [wizard.coType && wizard.coType !== 'None' ? data.coName : '',wizard.coType]
    ].filter(item => item[0]);
    return '<datalist id="pdPersonMetOptions">' + names.map(item => '<option value="' + esc(item[0]) + '">' + esc(item[1]) + '</option>').join('') + '</datalist>';
  }
  function contextBand(app, compact = false) {
    const ctx = appContext(app);
    const rows = [
      ['Deal No',ctx.dealNo],['Product',ctx.product],['Date',ctx.date],['Scheme',ctx.scheme],
      ['Customer Name',ctx.customer],['Branch',ctx.branch],['Lead ID',ctx.leadId],['Customer ID',ctx.customerId]
    ];
    return '<section class="pd-context-band ' + (compact ? 'compact' : '') + '" aria-label="Current application summary">' + rows.map(item => '<div><span>' + esc(item[0]) + '</span><strong>' + esc(item[1] || 'Not recorded') + '</strong></div>').join('') + '</section>';
  }
  function statusTone(status) {
    if (['Completed','Recommended'].includes(status)) return 'green';
    if (['Not Recommended','Query Required'].includes(status)) return 'red';
    if (['Hold','In Progress'].includes(status)) return 'amber';
    return 'gray';
  }
  function geotagMarkup(value) {
    if (value?.status === 'Captured') return '<div class="pd-evidence-state success"><b>Location Captured</b><dl><div><dt>Latitude</dt><dd>' + Number(value.latitude).toFixed(6) + '</dd></div><div><dt>Longitude</dt><dd>' + Number(value.longitude).toFixed(6) + '</dd></div><div><dt>Accuracy</dt><dd>' + (value.accuracy ? Math.round(value.accuracy) + ' m' : 'Not reported') + '</dd></div><div><dt>Captured At</dt><dd>' + esc(displayDate(value.capturedAt)) + '</dd></div></dl></div>';
    return '<div class="pd-evidence-state"><b>Location not captured</b><p>' + esc(locationMessage || 'Required before PD can be completed.') + '</p></div>';
  }
  function pictureMarkup(value) {
    const preview = value?.dataUrl ? '<img src="' + esc(value.dataUrl) + '" alt="PD visit capture preview">' : '<video id="pdCamera" autoplay muted playsinline aria-label="PD visit camera"></video><span id="pdCameraPlaceholder">No picture captured</span>';
    const status = cameraMessage || (value?.confirmed ? 'Picture confirmed · ' + displayDate(value.capturedAt) : value?.dataUrl ? 'Preview ready. Confirm or retake.' : 'Camera or image upload required.');
    return '<div class="pd-photo-stage">' + preview + '</div><p id="pdCameraStatus" role="status">' + esc(status) + '</p>' +
      (!disabled() ? '<div class="action-row pd-evidence-actions">' +
        (!value?.dataUrl ? '<button type="button" class="secondary-btn" onclick="nfPDOpenCamera()">Open Camera</button><button type="button" id="pdCapturePicture" class="ghost-btn" onclick="nfPDCapturePicture()" disabled>Capture Picture</button>' : value.confirmed ? '<button type="button" class="ghost-btn" onclick="nfPDRetakePicture()">Retake Picture</button>' : '<button type="button" class="primary-btn" onclick="nfPDConfirmPicture()">Confirm Picture</button><button type="button" class="ghost-btn" onclick="nfPDRetakePicture()">Retake Picture</button>') +
        '<label class="ghost-btn pd-file-button">Upload Image<input id="pdPictureFile" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label></div>' : '');
  }
  function historyRows() {
    if (!record) return [];
    const history = Array.isArray(record.pdHistory) ? record.pdHistory : [];
    if (!history.length && record.pd) return [record.pd];
    return history;
  }
  function historyMarkup() {
    const rows = historyRows();
    return '<section class="pd-history"><div class="pd-section-heading"><div><span>Audit Trail</span><h4>PD History</h4></div><strong>' + rows.length + ' record' + (rows.length === 1 ? '' : 's') + '</strong></div>' +
      (rows.length ? '<div class="table-wrap pd-history-wrap"><table><thead><tr><th>PD Code</th><th>PD Date</th><th>Person Met</th><th>Meeting Location</th><th>Remarks</th><th>Follow Up</th><th>Follow-up Date</th><th>Follow-up Person</th><th>Follow-up Location</th><th>Follow-up Remarks</th><th>PD Type</th><th>Status</th><th>PD Done By</th><th>Evidence</th><th></th></tr></thead><tbody>' + rows.map((item,index) => '<tr><td><b>' + esc(item.code) + '</b><small>' + esc(item.recordId || '') + '</small></td><td>' + esc(displayDate(item.meetingAt)) + '</td><td>' + esc(item.personMet) + '</td><td>' + esc(item.location) + '</td><td class="pd-history-remarks">' + esc(item.remarks) + '</td><td>' + (item.followUpRequired ? 'Yes' : 'No') + '</td><td>' + esc(item.followUp ? displayDate(item.followUp.at) : '—') + '</td><td>' + esc(item.followUp?.person || '—') + '</td><td>' + esc(item.followUp?.location || '—') + '</td><td>' + esc(item.followUp?.remarks || '—') + '</td><td>' + esc(item.type) + '</td><td><span class="badge ' + statusTone(item.status) + '">' + esc(item.status) + '</span></td><td>' + esc(item.doneByName) + '<small>' + esc(item.doneByRole || '') + '</small></td><td><span class="badge ' + (item.geotag?.status === 'Captured' ? 'green' : 'gray') + '">Geo: ' + (item.geotag?.status === 'Captured' ? 'Captured' : 'Missing') + '</span> <span class="badge ' + (item.picture?.confirmed ? 'green' : 'gray') + '">Photo: ' + (item.picture?.confirmed ? 'Confirmed' : 'Missing') + '</span></td><td><button type="button" class="more-btn" onclick="nfPDViewHistory(' + index + ')">View</button></td></tr>').join('') + '</tbody></table></div>' : '<div class="pd-empty-history"><b>No PD records yet</b><span>Save the completed field visit to create the first audit record.</span></div>') + '</section>';
  }
  window.nfPDMarkup = function() {
    const app = getWizardApplication();
    const head = '<button type="button" class="pd-back-link" onclick="wizardBack()">← Asset / Collateral</button>' + wizardHeader('PD — Personal Discussion','Field verification for the selected LOS application.');
    if (!app) return head + '<div class="notice warn">No application is active. Return to Product & Source and select an application.</div>' + wizardActions('Continue to Loan & Repayment');
    if (loading && !record) return head + contextBand(app) + '<p class="pd-loading" role="status">Loading saved PD for ' + esc(app.id) + '…</p>' + wizardActions('Continue to Loan & Repayment');
    if (!record) return head + contextBand(app) + '<div class="notice warn" role="alert">' + esc(error || 'The PD record could not be loaded.') + '</div><button type="button" class="ghost-btn" onclick="nfPDReload()">Retry</button>' + wizardActions('Continue to Loan & Repayment');
    const value = ensureDraft(app), follow = value.followUp || {}, current = employee();
    const bypassControl = !record.pd ? '<div class="notice warn"><label style="display:flex;align-items:flex-start;gap:10px"><input type="checkbox" ' + (wizard.pdDemoBypass === true ? 'checked' : '') + ' onchange="nfSetPDDemoBypass(this.checked)"><span><b>PD not performed — demo bypass</b><br><small>No visit, photograph, geotag, PD record, or PD verification will be captured. This only lets the demo workflow continue.</small></span></label></div>' : '';
    if (wizard.pdDemoBypass === true && !record.pd) return head + contextBand(app) + bypassControl + '<div class="notice info">Personal Discussion was not performed. No field evidence or verification is recorded. Uncheck the demo bypass to enter and verify an actual PD record.</div>' + wizardActions('Continue to Loan & Repayment');
    const locked = record.cam?.status === 'Pending';
    const markup = head + contextBand(app) + bypassControl +
      (!may('save') ? '<div class="notice info">Signed in as ' + esc(current.name) + ' · ' + esc(current.role) + '. This role has read-only PD access.</div>' : '') +
      (locked ? '<div class="notice info">This PD is locked because revision ' + esc(record.cam.pdRevision || record.pd?.revision || '') + ' is already in CAM Allocation.</div>' : '') +
      '<form id="pdForm" novalidate onsubmit="event.preventDefault();nfPDSave()"><section class="pd-form-section"><div class="pd-section-heading"><div><span>Visit Details</span><h4>PD Details</h4></div><div class="pd-stage-status"><span>CAM: <b>' + esc(record.cam?.status || 'Not Sent') + '</b></span><span>Bureau: <b>' + esc(record.bureau?.status || 'Not Requested') + '</b></span></div></div><div class="pd-form-grid">' +
      field('Personal Discussion Code','code',value.code,{required:true,max:100,readonly:true}) +
      field('Personal Discussion Date & Time','meetingAt',value.meetingAt,{required:true,type:'datetime-local'}) +
      field('Person Met','personMet',value.personMet,{required:true,max:200,list:'pdPersonMetOptions'}) + personMetOptions(app) +
      field('Personal Discussion Meeting Location','location',value.location,{required:true,max:500}) +
      field('Personal Discussion Remarks','remarks',value.remarks,{required:true,textarea:true,max:2000}) +
      field('Follow Up Required','followUpRequired',value.followUpRequired ? 'Yes' : 'No',{required:true,items:['Yes','No']}) +
      (value.followUpRequired ? field('Follow Up Date & Time','followUpAt',follow.at,{required:true,type:'datetime-local'}) + field('Follow Up Person','followUpPerson',follow.person,{required:true,max:200}) + field('Follow Up Location','followUpLocation',follow.location,{required:true,max:500}) + field('Follow Up Remarks','followUpRemarks',follow.remarks,{required:true,textarea:true,max:2000}) : '') +
      field('PD Type','type',value.type,{required:true,items:TYPES}) +
      field('PD Status','status',value.status,{required:true,items:STATUSES}) +
      '<label class="pd-field"><span>PD Done By</span><input value="' + esc(record.pd?.doneByName || current.name) + '" readonly aria-readonly="true"><small>' + esc(record.pd?.doneByRole || current.role) + ' · existing employee session</small></label>' +
      '</div></section><section class="pd-evidence"><div class="pd-section-heading"><div><span>Field Evidence</span><h4>Location & Picture</h4></div><strong>Required</strong></div><div class="pd-evidence-grid"><div class="pd-evidence-panel"><div class="pd-evidence-title"><div><span class="pd-evidence-icon">⌖</span><div><b>Geotagging</b><small>Visit coordinates and capture time</small></div></div>' + (!disabled() ? '<button type="button" class="secondary-btn" onclick="nfPDCaptureLocation()">Capture Location</button>' : '') + '</div>' + geotagMarkup(value.geotag) + '</div><div class="pd-evidence-panel"><div class="pd-evidence-title"><div><span class="pd-evidence-icon">▣</span><div><b>Visit Picture</b><small>Camera capture or supported image upload</small></div></div></div>' + pictureMarkup(value.picture) + '</div></div></section><div id="pdError" class="pd-error-summary" role="alert">' + esc(error) + '</div><div class="pd-primary-actions"><button type="submit" class="primary-btn" ' + (pending || loading ? 'disabled' : '') + '>Save PD</button><button type="button" class="secondary-btn" onclick="nfPDAction(\'send-to-cam\')" ' + (pending || loading ? 'disabled' : '') + '>Send To CAM</button><button type="button" class="ghost-btn" onclick="nfPDAction(\'bureau-check\')" ' + (pending || loading ? 'disabled' : '') + '>Bureau Check</button><button type="button" class="ghost-btn" onclick="nfPDReload()" ' + (pending || loading ? 'disabled' : '') + '>Reload Saved PD</button></div></form>' +
      (record.bureau?.status === 'Pending Integration' ? '<div class="notice info">Bureau request ' + esc(record.bureau.requestId || '') + ' is linked to ' + esc(app.id) + ' and awaiting the configured bureau service.</div>' : '') + historyMarkup() + wizardActions('Continue to Loan & Repayment');
    const state = record.pd ? record.pdVerification?.status || 'Saved' : 'Draft';
    const verification = '<p role="status">Verification: <b>' + esc(state) + '</b>' + (record.pdVerification?.reason ? ' · ' + esc(record.pdVerification.reason) : '') + '</p>';
    const verifyButton = '<button type="button" class="secondary-btn" onclick="nfPDAction(\'verify-pd\')" ' + (pending || loading ? 'disabled' : '') + '>Verify PD</button>';
    return markup.replace('<div class="pd-primary-actions">',verification + '<div class="pd-primary-actions">').replace('>Save PD</button>', '>Save PD</button>' + verifyButton)
      .replace('>Save PD</button>', '>' + (operation === 'save' ? 'Saving PD…' : 'Save PD') + '</button>')
      .replace('>Verify PD</button>', '>' + (operation === 'verify-pd' ? 'Verifying…' : 'Verify PD') + '</button>')
      .replace('>Send To CAM</button>', '>' + (operation === 'send-to-cam' ? 'Sending…' : 'Send To CAM') + '</button>')
      .replace('>Bureau Check</button>', '>' + (operation === 'bureau-check' ? 'Requesting…' : 'Bureau Check') + '</button>');
  };
  window.nfSetPDDemoBypass = function(enabled) {
    const app = getWizardApplication();
    if (!app || record?.pd) return showToast('A saved PD record cannot be replaced by a demo bypass.');
    wizard.pdDemoBypass = enabled === true;
    if (wizard.pdDemoBypass) wizard.data.pdResult = 'Not performed — demo bypass';
    else delete wizard.data.pdResult;
    app.pdDemoBypass = wizard.pdDemoBypass;
    snapshotWizard();
    renderWizard();
  };
  function bindPD() {
    const form = document.querySelector('#pdForm');
    if (form) {
      form.onsubmit = event => { event.preventDefault();nfPDSave(); };
      const save = form.querySelector('button[type="submit"]');
      if (save) save.onclick = event => { event.preventDefault();nfPDSave(); };
      for (const action of ['verify-pd','send-to-cam','bureau-check']) {
        const button = form.querySelector('[onclick="nfPDAction(\'' + action + '\')"]');
        if (button) button.onclick = () => nfPDAction(action);
      }
      const reload = form.querySelector('[onclick="nfPDReload()"]');
      if (reload) reload.onclick = () => nfPDReload();
    }
    const file = document.querySelector('#pdPictureFile');
    if (file && !file.dataset.bound) {
      file.dataset.bound = '1';
      file.addEventListener('change', () => nfPDUsePictureFile(file));
    }
  }
  function paint() {
    const result = renderBase.apply(this,arguments);
    if (wizard.step === 5) {
      bindPD();
      const video = document.querySelector('#pdCamera');
      if (cameraStream && video) {
        video.srcObject = cameraStream;
        document.querySelector('#pdCameraPlaceholder')?.remove();
        const capture = document.querySelector('#pdCapturePicture');
        if (capture) capture.disabled = disabled();
      } else if (cameraStream) stopCamera();
    } else stopCamera();
    return result;
  }
  function draftBody(app) {
    const ctx = appContext(app);
    const data = withoutPDFields(wizard.data);
    delete data.livePhoto;
    return {
      version:app.serverVersion,
      leadId:ctx.leadId,customerId:ctx.customerId,scheme:ctx.scheme,
      customer:app.customer,mobile:app.mobile,product:app.product,branch:app.branch,amount:app.amount,
      draft:{ data,productDetails:app.productDetails || {},docs:wizard.docs,step:wizard.step,coType:wizard.coType,pdDemoBypass:wizard.pdDemoBypass === true }
    };
  }
  async function syncDraft(app) {
    const saved = await api('/applications/' + encodeURIComponent(app.id) + '/draft','PUT',draftBody(app));
    app.serverPersisted = true;
    app.serverVersion = saved.__v;
    app.serverDraft = saved.draft;
    return saved;
  }
  function apply(saved) {
    record = saved;
    const app = getWizardApplication();
    if (app && app.id === saved._id) {
      app.serverPersisted = !saved.browserPersisted;
      app.serverVersion = saved.__v;
      app.serverDraft = saved.draft;
      app.productDetails = saved.draft?.productDetails || app.productDetails;
      app.pdDemoBypass = saved.pdDemoBypass?.enabled === true;
      app.workflow = { ...app.workflow,pdStatus:app.pdDemoBypass ? 'Demo Bypass' : saved.pd?.status || 'Pending' };
      app.leadId = saved.leadId || app.leadId;
      app.customerId = saved.customerId || app.customerId;
      app.scheme = saved.scheme || app.scheme;
      app.pd = clone(saved.pd);
      app.pdHistory = clone(saved.pdHistory || []);
      app.cam = clone(saved.cam);
      app.bureau = clone(saved.bureau);
      app.pdVerification = clone(saved.pdVerification);
      if (saved.status) app.status = saved.status;
      app.workflow = { ...app.workflow,pdStatus:saved.pd?.status || 'Pending',pdRevision:saved.pd?.revision || 0 };
      if (saved.cam?.status === 'Pending') app.workflow = { ...app.workflow,stage:'CAM Allocation',ownerRole:'BCM',pdCamPending:true };
    }
    saveLocal(saved);
  }
  async function load() {
    const app = getWizardApplication();
    if (!app || pending || loading) return;
    stopCamera();
    loading = true;
    error = '';
    locationMessage = '';
    cameraMessage = '';
    const sequence = ++generation;
    const appId = app.id;
    if (loadedId && loadedId !== appId) { draft = null;dirty = false; }
    loadedId = appId;
    record = cachedRecord(app);
    if (!draft) {
      const savedDraft = readStore(WIZARD_STORE)[app.id];
      draft = savedDraft?.employeeId === employee().id ? clone(savedDraft.pdDraft) : null;
      dirty = savedDraft?.employeeId === employee().id && !!savedDraft.pdDirty;
    }
    paint();
    try {
      await ensureSession();
      if (sequence !== generation) return;
      let saved;
      try { saved = await api('/applications/' + encodeURIComponent(appId) + '/pd'); }
      catch (e) { if (e.message.includes('Application not found')) saved = await syncDraft(app); else throw e; }
      if (sequence !== generation || getWizardApplication()?.id !== appId) return;
      apply(saved);
      if (reloadRequested && !saved.pd) {
        error = 'No saved PD record found for this application.';
      } else if (!dirty || reloadRequested) { draft = fromPD(saved.pd,app); dirty = false; }
    } catch (e) {
      if (sequence !== generation || getWizardApplication()?.id !== appId) return;
      error = e.message;
      record = null;
    } finally {
      if (sequence === generation) {
        loading = false;
        reloadRequested = false;
        if (wizard.step === 5) paint();
      }
    }
  }
  function validate(value, completion = false) {
    const issues = [];
    for (const [key,label,max] of [['code','Personal Discussion Code',100],['personMet','Person Met',200],['location','Meeting Location',500],['remarks','PD Remarks',2000]]) {
      if (String(value[key] || '').length > max) issues.push(label + ' must be at most ' + max + ' characters.');
    }
    if (!value.code?.trim()) issues.push('Personal Discussion Code is required.');
    if (!value.meetingAt || !Number.isFinite(Date.parse(value.meetingAt))) issues.push('Personal Discussion Date & Time is required.');
    if (!value.personMet?.trim()) issues.push('Person Met is required.');
    if (!value.location?.trim()) issues.push('Personal Discussion Meeting Location is required.');
    if (!value.remarks?.trim()) issues.push('Personal Discussion Remarks are required.');
    if (!TYPES.includes(value.type)) issues.push('Select a valid PD Type.');
    if (!STATUSES.includes(value.status)) issues.push('Select a valid PD Status.');
    if (['Not Recommended','Hold','Query Required'].includes(value.status) && (value.remarks || '').trim().length < 10) issues.push(value.status + ' requires a clear reason in PD Remarks.');
    if (value.followUpRequired) {
      if (!value.followUp?.at || !Number.isFinite(Date.parse(value.followUp.at))) issues.push('A valid Follow Up Date & Time is required.');
      if (!value.followUp?.person?.trim()) issues.push('Follow Up Person is required.');
      if (!value.followUp?.location?.trim()) issues.push('Follow Up Location is required.');
      if (!value.followUp?.remarks?.trim()) issues.push('Follow Up Remarks are required.');
      for (const [key,label,max] of [['person','Person',200],['location','Location',500],['remarks','Remarks',2000]]) {
        if (String(value.followUp?.[key] || '').length > max) issues.push('Follow Up ' + label + ' must be at most ' + max + ' characters.');
      }
      if (value.followUp?.at && value.meetingAt && Date.parse(value.followUp.at) < Date.parse(value.meetingAt)) issues.push('Follow Up Date & Time cannot be before the PD visit.');
    }
    if (value.geotag?.status !== 'Captured') issues.push('Capture the PD location.');
    else if (!Number.isFinite(value.geotag.latitude) || Math.abs(value.geotag.latitude) > 90 || !Number.isFinite(value.geotag.longitude) || Math.abs(value.geotag.longitude) > 180 || !Number.isFinite(Date.parse(value.geotag.capturedAt))) issues.push('Capture a valid PD location and timestamp.');
    if (value.picture?.status !== 'Captured' || value.picture.confirmed !== true) issues.push('Capture and confirm the PD picture.');
    else if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value.picture.dataUrl || '') || value.picture.dataUrl.length > 2000000) issues.push('Choose a valid JPEG, PNG or WebP picture smaller than 1.5 MB.');
    if (completion && !COMPLETE.includes(value.status)) issues.push('Set PD Status to Completed or Recommended before continuing.');
    if (completion && value.followUpRequired) issues.push('Complete the outstanding follow-up before continuing.');
    return issues;
  }
  function showIssues(issues) {
    error = issues.join(' ');
    const target = document.querySelector('#pdError');
    if (target) target.textContent = error;
    if (issues[0]) showToast(issues[0]);
  }
  window.nfPDSave = async function() {
    const app = getWizardApplication();
    if (pending || loading) return false;
    if (!record || !app) { showIssues(['Open an application before saving PD.']); return false; }
    if (disabled()) { showIssues([record.cam?.status === 'Pending' ? 'PD is locked after sending to CAM.' : 'Your workspace role (' + employee().role + ') cannot edit PD. An authorized sales user must complete this visit, or an administrator must update the existing access configuration.']); return false; }
    const form = document.querySelector('#pdForm');
    draft = readForm();
    const issues = validate(draft,false);
    if (issues.length) { showIssues(issues);snapshotWizard();return false; }
    if (!form?.reportValidity()) { showIssues(['Check the highlighted PD fields and maximum lengths.']); return false; }
    pending = true;
    operation = 'save';
    error = '';
    paint();
    try {
      const ctx = appContext(app);
      const payload = {
        code:draft.code,applicationId:ctx.applicationId,leadId:ctx.leadId,customerId:ctx.customerId,product:ctx.product,
        type:draft.type,meetingAt:iso(draft.meetingAt),personMet:draft.personMet,location:draft.location,
        remarks:draft.remarks,status:draft.status,followUpRequired:draft.followUpRequired,
        followUp:draft.followUpRequired ? { ...draft.followUp,at:iso(draft.followUp.at) } : undefined,
        geotag:{ ...draft.geotag,capturedAt:iso(draft.geotag.capturedAt) },
        picture:{ ...draft.picture,capturedAt:iso(draft.picture.capturedAt) },
        revision:record.pd?.revision || 0
      };
      const saved = await api('/applications/' + encodeURIComponent(app.id) + '/pd','PUT',payload);
      apply(saved);
      draft = fromPD(saved.pd,app);
      dirty = false;
      paint();snapshotWizard();
      if (typeof logAudit === 'function') logAudit(app.id,'PD Record Saved',saved.pd.recordId + ' · ' + saved.pd.status);
      showToast('PD saved against ' + app.id);
      return true;
    } catch (e) {
      error = e.message;
      return false;
    } finally {
      pending = false;
      operation = '';
      paint();
    }
  };
  window.nfPDAction = async function(action) {
    const app = getWizardApplication();
    if (pending || loading) return;
    if (!record || !app) { showIssues(['Open an application before using PD actions.']); return; }
    if (!['verify-pd','send-to-cam','bureau-check'].includes(action)) return;
    if (!may(action === 'bureau-check' ? 'bureau' : action === 'verify-pd' ? 'verify' : 'save')) { showIssues(['Your workspace role cannot perform this PD action.']); return; }
    if (action === 'verify-pd' && (dirty || !record.pd)) { showIssues(['Save the current PD before verification.']); return; }
    if (action === 'verify-pd' && verified(record)) { showToast('The latest saved PD is already verified.'); return; }
    if (action === 'send-to-cam' && record.cam?.status === 'Pending') { showToast('This PD has already been sent to CAM.'); return; }
    if (action === 'bureau-check') {
      if (record.cam?.status !== 'Pending') { showIssues(['Save and verify PD, then send it to CAM before requesting Bureau Check.']);return; }
      if (record.bureau?.status === 'Pending Integration') { showToast('Bureau request is already pending integration: ' + (record.bureau.requestId || app.id));return; }
    }
    if (action === 'send-to-cam') {
      if (dirty || !record.pd) { if (!await nfPDSave()) return; }
      const issues = validate(record.pd,true);
      if (issues.length) { showIssues(issues);return; }
      if (!verified(record)) { showIssues(['Verify the latest saved PD before sending to CAM.']); return; }
    }
    pending = true;
    operation = action;
    error = '';
    paint();
    try {
      const saved = await api('/applications/' + encodeURIComponent(app.id) + '/' + action,'POST',{ revision:record.pd?.revision });
      apply(saved);
      snapshotWizard();
      if (typeof logAudit === 'function') logAudit(app.id,action === 'verify-pd' ? 'PD ' + saved.pdVerification.status : action === 'send-to-cam' ? 'PD Sent to CAM' : 'Bureau Check Requested',saved.pd?.recordId || app.id);
      if (action === 'verify-pd') {
        error = saved.pdVerification?.reason || '';
        showToast(saved.pdVerification?.status === 'Verified' ? 'Saved PD verified.' : 'PD verification rejected: ' + error);
      } else showToast(action === 'send-to-cam' ? 'PD sent to CAM Allocation' : 'Bureau request linked to ' + app.id);
    } catch (e) { error = e.message; }
    finally { pending = false;operation = '';paint(); }
  };
  window.nfPDCaptureLocation = function() {
    if (disabled() || wizard.step !== 5) return;
    draft = readForm();
    const captureId = getWizardApplication()?.id;
    const captureGeneration = generation;
    if (!navigator.geolocation) {
      locationMessage = 'Geolocation is unavailable in this browser.';
      draft.geotag = null;
      dirty = true;
      paint();
      return;
    }
    locationMessage = 'Requesting location permission…';
    const status = document.querySelector('.pd-evidence-state p');
    if (status) status.textContent = locationMessage;
    navigator.geolocation.getCurrentPosition(position => {
      if (captureId !== getWizardApplication()?.id || captureGeneration !== generation || wizard.step !== 5 || disabled()) return;
      draft.geotag = {
        latitude:position.coords.latitude,longitude:position.coords.longitude,
        accuracy:position.coords.accuracy,capturedAt:new Date(position.timestamp || Date.now()).toISOString(),status:'Captured'
      };
      locationMessage = '';
      dirty = true;
      snapshotWizard();
      paint();
    },failure => {
      if (captureId !== getWizardApplication()?.id || captureGeneration !== generation || wizard.step !== 5 || disabled()) return;
      locationMessage = failure.code === 1 ? 'Location permission is required to capture the visit location. Allow access and try again.' : 'Location could not be captured. Check device location services and try again.';
      draft.geotag = null;
      dirty = true;
      snapshotWizard();
      paint();
    },{ enableHighAccuracy:true,timeout:12000,maximumAge:0 });
  };
  function stopCamera() {
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  window.nfPDOpenCamera = async function() {
    if (disabled() || wizard.step !== 5) return;
    draft = readForm();
    const captureId = getWizardApplication()?.id, captureGeneration = generation;
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraMessage = 'Camera is unavailable. Use Upload Image instead.';
      const status = document.querySelector('#pdCameraStatus');
      if (status) status.textContent = cameraMessage;
      return;
    }
    stopCamera();
    cameraMessage = 'Opening camera…';
    const status = document.querySelector('#pdCameraStatus');
    if (status) status.textContent = cameraMessage;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:'environment' },width:{ ideal:960 },height:{ ideal:720 } },audio:false });
      if (captureId !== getWizardApplication()?.id || captureGeneration !== generation || wizard.step !== 5 || disabled()) { stream.getTracks().forEach(track => track.stop()); return; }
      cameraStream = stream;
      const video = document.querySelector('#pdCamera');
      if (!video) { stopCamera();return; }
      video.srcObject = cameraStream;
      document.querySelector('#pdCameraPlaceholder')?.remove();
      const capture = document.querySelector('#pdCapturePicture');
      if (capture) capture.disabled = false;
      cameraMessage = 'Camera ready.';
      if (status) status.textContent = cameraMessage;
    } catch (failure) {
      if (captureId !== getWizardApplication()?.id || captureGeneration !== generation || wizard.step !== 5) return;
      stopCamera();
      cameraMessage = failure.name === 'NotAllowedError' ? 'Camera permission is required to capture the visit picture. Allow access and retry, or use Upload Image.' : 'Camera could not be opened. Use Upload Image instead.';
      if (status) status.textContent = cameraMessage;
    }
  };
  window.nfPDCapturePicture = function() {
    if (disabled() || wizard.step !== 5) return;
    const video = document.querySelector('#pdCamera');
    if (!cameraStream || !video?.videoWidth) {
      cameraMessage = 'Wait for the camera preview before capturing.';
      const status = document.querySelector('#pdCameraStatus');
      if (status) status.textContent = cameraMessage;
      return;
    }
    draft = readForm();
    const width = Math.min(960,video.videoWidth);
    const height = Math.round(width * video.videoHeight / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = width;canvas.height = height;
    canvas.getContext('2d').drawImage(video,0,0,width,height);
    draft.picture = { dataUrl:canvas.toDataURL('image/jpeg',0.72),capturedAt:new Date().toISOString(),status:'Pending Confirmation',confirmed:false,source:'camera',fileName:'',mimeType:'image/jpeg' };
    dirty = true;
    stopCamera();
    snapshotWizard();
    paint();
  };
  window.nfPDConfirmPicture = function() {
    if (disabled() || wizard.step !== 5) return;
    if (!draft?.picture?.dataUrl) return;
    cameraMessage = '';
    draft = { ...readForm(),picture:{ ...draft.picture,status:'Captured',confirmed:true,capturedAt:draft.picture.capturedAt || new Date().toISOString() } };
    dirty = true;
    snapshotWizard();
    paint();
  };
  window.nfPDRetakePicture = function() {
    if (disabled() || wizard.step !== 5) return;
    draft = { ...readForm(),picture:null };
    dirty = true;
    cameraMessage = '';
    snapshotWizard();
    paint();
    setTimeout(() => nfPDOpenCamera(),0);
  };
  window.nfPDUsePictureFile = function(input) {
    if (disabled() || wizard.step !== 5) return;
    const captureId = getWizardApplication()?.id, captureGeneration = generation;
    const file = input?.files?.[0];
    if (!file) return;
    draft = readForm();
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { cameraMessage = 'Choose a JPEG, PNG, or WebP image.';paint();return; }
    if (file.size > 1500000) { cameraMessage = 'Picture must be 1.5 MB or smaller.';paint();return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      let head = '';
      try { head = atob(dataUrl.slice(dataUrl.indexOf(',') + 1, dataUrl.indexOf(',') + 25)); } catch (e) {}
      const signatures = { 'image/jpeg':head.startsWith('\xff\xd8\xff'),'image/png':head.startsWith('\x89PNG\r\n\x1a\n'),'image/webp':head.startsWith('RIFF') && head.slice(8,12) === 'WEBP' };
      if (!signatures[file.type]) {
        if (captureId !== getWizardApplication()?.id || captureGeneration !== generation || wizard.step !== 5) return;
        cameraMessage = 'The selected file is not a valid image. Choose a JPEG, PNG, or WebP picture.';paint();return;
      }
      if (captureId !== getWizardApplication()?.id || captureGeneration !== generation || wizard.step !== 5 || disabled()) return;
      stopCamera();
      draft.picture = { dataUrl,capturedAt:new Date().toISOString(),status:'Pending Confirmation',confirmed:false,source:'file-upload',fileName:file.name,mimeType:file.type };
      dirty = true;
      cameraMessage = '';
      snapshotWizard();
      paint();
    };
    reader.onerror = () => {
      if (captureId !== getWizardApplication()?.id || captureGeneration !== generation || wizard.step !== 5) return;
      cameraMessage = 'The selected picture could not be read.';paint();
    };
    reader.readAsDataURL(file);
  };
  window.nfPDViewHistory = function(index) {
    const item = historyRows()[index];
    if (!item) return;
    const picture = item.picture?.dataUrl ? '<img class="pd-history-photo" src="' + esc(item.picture.dataUrl) + '" alt="PD evidence for ' + esc(item.code) + '">' : '';
    showModal('PD Record · ' + esc(item.code),'<div class="summary-grid">' +
      summary('Record ID',esc(item.recordId || '—')) + summary('Application',esc(item.applicationId)) + summary('Lead',esc(item.leadId)) + summary('Customer ID',esc(item.customerId)) +
      summary('PD Date',esc(displayDate(item.meetingAt))) + summary('Person Met',esc(item.personMet)) + summary('Meeting Location',esc(item.location)) + summary('PD Type',esc(item.type)) + summary('Status',esc(item.status)) + summary('PD Done By',esc(item.doneByName)) +
      summary('Latitude',esc(item.geotag?.latitude ?? '—')) + summary('Longitude',esc(item.geotag?.longitude ?? '—')) + '</div><div class="pd-modal-remarks"><b>Remarks</b><p>' + esc(item.remarks) + '</p></div>' + picture,'<button class="primary-btn" onclick="closeModal()">Close</button>');
  };
  window.nfPDReload = function() {
    if (pending) return;
    stopCamera();
    if (document.querySelector('#pdForm')) draft = readForm();
    reloadRequested = true;loadedId = null;loading = false;generation++;
    load();
  };
  function pdReview(app) {
    const pd = app?.pd;
    if (app?.pdDemoBypass === true || app?.pdDemoBypass?.enabled === true || app?.serverDraft?.pdDemoBypass === true || wizard.pdDemoBypass === true) return '<section class="pd-review-summary"><h4>Personal Discussion</h4><p><b>Not performed — demo bypass.</b> No field visit, photo, geotag, PD record, or PD verification was captured.</p></section>';
    if (!pd) return '<section class="pd-review-summary"><h4>Personal Discussion</h4><p>PD has not been saved.</p></section>';
    return '<section class="pd-review-summary"><div class="pd-section-heading"><div><span>Field Verification</span><h4>Personal Discussion</h4></div><span class="badge ' + statusTone(pd.status) + '">' + esc(pd.status) + '</span></div><div class="summary-grid">' +
      summary('PD Code',esc(pd.code)) + summary('PD Date',esc(displayDate(pd.meetingAt))) + summary('Person Met',esc(pd.personMet)) + summary('Meeting Location',esc(pd.location)) + summary('PD Type',esc(pd.type)) + summary('PD Done By',esc(pd.doneByName)) + summary('Geotag',pd.geotag?.status === 'Captured' ? 'Captured' : 'Missing') + summary('Picture',pd.picture?.confirmed ? 'Confirmed' : 'Missing') + '</div><p class="pd-review-remarks"><b>Remarks:</b> ' + esc(pd.remarks) + '</p></section>';
  }
  const renderBase = renderWizard;
  renderWizard = function() {
    const result = renderBase.apply(this,arguments);
    if (wizard.step === 5) {
      bindPD();
      const app = getWizardApplication();
      if (app && loadedId !== app.id && !loading) load();
    }
    return result;
  };
  if (typeof renderCase === 'function') {
    const renderCaseBase = renderCase;
    renderCase = function(id) {
      const result = renderCaseBase.apply(this,arguments);
      const app = applications.find(item => item.id === id);
      if (app?.pdDemoBypass === true || app?.pdDemoBypass?.enabled === true || app?.serverDraft?.pdDemoBypass === true) {
        const content = document.querySelector('#content');
        const pageHead = content?.querySelector('.page-head');
        if (pageHead && !content.querySelector('.pd-demo-bypass-case-notice')) pageHead.insertAdjacentHTML('afterend','<div class="notice warn pd-demo-bypass-case-notice">PD not performed — demo bypass. No field visit, photograph, geotag, PD record, or PD verification was captured.</div>');
      }
      return result;
    };
  }
  const next = wizardNext;
  wizardNext = function() {
    if (pending || loading) return;
    if (wizard.step === 5 && wizard.pdDemoBypass === true) {
      wizard.data.pdResult = 'Not performed — demo bypass';
    } else if (wizard.step === 5) {
      draft = readForm();
      snapshotWizard();
      if (!record?.pd || dirty) { showIssues(['Save the current PD before continuing to Loan & Repayment.']);return; }
      const issues = validate(record.pd,true);
      if (issues.length) { showIssues(issues);return; }
      if (!verified(record)) { showIssues(['Verify the latest saved PD before continuing.']); return; }
      wizard.data.pdResult = record.pd.status;
      wizard.data.pdRecordId = record.pd.recordId;
    }
    stopCamera();
    const result = next.apply(this,arguments);
    snapshotWizard();
    return result;
  };
  const back = wizardBack;
  wizardBack = function() {
    if (pending) return;
    if (wizard.step === 5 && document.querySelector('#pdForm')) { draft = readForm();snapshotWizard(); }
    stopCamera();
    return back.apply(this,arguments);
  };
  const go = goWizardStep;
  goWizardStep = function(step) {
    if (pending) return;
    if (wizard.step === 5 && document.querySelector('#pdForm')) { draft = readForm();snapshotWizard(); }
    stopCamera();
    return go.apply(this,arguments);
  };
  const selectCase = selectLosApplication;
  selectLosApplication = function(id) {
    if (pending) return;
    if (getWizardApplication()) snapshotWizard();
    stopCamera();loadedId = null;record = null;draft = null;dirty = false;loading = false;generation++;
    const result = selectCase.apply(this,arguments);
    const app = getWizardApplication();
    if (app && restoreWizardFor(app)) renderWizard();
    return result;
  };
  const loan = stepLoan;
  stepLoan = function() {
    const app = getWizardApplication();
    return loan.apply(this,arguments).replace('<div class="field-grid three">',(app ? contextBand(app,true) + pdReview(app) : '') + '<div class="field-grid three">');
  };
  const imdBsa = stepImdBsa;
  stepImdBsa = function() {
    const app = getWizardApplication();
    return imdBsa.apply(this,arguments).replace('<div class="field-grid three">',(app ? contextBand(app,true) : '') + '<div class="field-grid three">');
  };
  const review = stepReview;
  stepReview = function() {
    const app = getWizardApplication();
    return review.apply(this,arguments).replace('<div class="notice success">',(app ? contextBand(app,true) + pdReview(app) : '') + '<div class="notice success">');
  };
  const submit = submitApplication;
  submitApplication = function() {
    if (typeof window.nfCheckKycSubmission === 'function' && !window.nfCheckKycSubmission()) return;
    if (pending || loading) { showToast('Please wait for the PD operation to finish.');return; }
    const app = getWizardApplication();
    if (app && wizard.pdDemoBypass !== true) {
      const issues = validate(app.pd || {},true);
      if (!verified({pd:app.pd,pdVerification:app.pdVerification})) issues.push('Verify the latest saved PD before submitting.');
      if (dirty) issues.push('Save the current PD changes before submitting.');
      if (issues.length) { showToast('Complete and verify PD before submitting this application.');wizard.step = 5;renderWizard();showIssues(issues);return; }
    }
    snapshotWizard();
    return submit.apply(this,arguments);
  };
  const navigate = navTo;
  navTo = function(view,arg) {
    if (pending) { showToast('Please wait for the PD operation to finish.');return; }
    if (document.querySelector('.los-application') && getWizardApplication()) snapshotWizard();
    stopCamera();
    const result = navigate.apply(this,arguments);
    if (view === 'newApplication' && !arg && !getWizardApplication()) restoreActiveWizard();
    return result;
  };
  document.addEventListener('input',event => {
    if (!event.target.closest('#pdForm')) return;
    draft = readForm();dirty = true;snapshotWizard();
  });
  document.addEventListener('change',event => {
    if (!event.target.closest('#pdForm')) return;
    draft = readForm();dirty = true;
    if (event.target.id === 'pd-followUpRequired') {
      if (!draft.followUpRequired) draft.followUp = {};
      snapshotWizard();paint();
    } else snapshotWizard();
  });
  window.addEventListener('beforeunload',() => { stopCamera();snapshotWizard(); });
})();
</script>`.replace("__PD_API_BASE__", JSON.stringify(apiBase).replace(/</g, "\\u003c"));
}
