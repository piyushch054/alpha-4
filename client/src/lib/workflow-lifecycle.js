// Browser-local connected CRM-to-servicing lifecycle for user-created cases.
export const workflowLifecycleScript = String.raw`<script>
(() => {
  const KEY = 'namdev-connected-lifecycle-v1';
  const KYC_KEY = 'namdev-kyc-dedupe';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = value => JSON.parse(JSON.stringify(value));
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { fee:1500, penaltyRatePct:2, leads:[], cases:[], profiles:[], bdmTasks:[], ledger:[], mockTransactions:[], events:[], ...value };
    } catch (error) {
      console.error('Could not read saved lending lifecycle state.', error);
      showToast('Saved lifecycle data could not be read. Check browser storage.');
      return { fee:1500, penaltyRatePct:2, leads:[], cases:[], profiles:[], bdmTasks:[], ledger:[], mockTransactions:[], events:[] };
    }
  };
  const state = read();
  function persist() {
    try {
      const caseRecords = applications.filter(a => a.lifecycleManaged).map(clone);
      const leadRecords = (crm.leads || []).filter(l => l.lifecycleManaged).map(clone);
      const value = { ...state, cases:caseRecords, leads:leadRecords };
      localStorage.setItem(KEY, JSON.stringify(value));
      Object.assign(state, value);
      return true;
    } catch (error) {
      console.error('Could not save lending lifecycle state.', error);
      showToast('Lifecycle changes could not be saved to this browser.');
      return false;
    }
  }
  const managed = a => !!a?.lifecycleManaged;
  const isDemoLifecycleCase = a => a?.browserLocalOnly === true || a?.pdDemoBypass === true ||
    a?.demoMandatoryBypass === true || a?.serverDraft?.pdDemoBypass === true;
  const crmApplicantFields = ['name','business','mobile','altMobile','email','city','pincode','pan','aadhaar','consentStatus','consentTimestamp','mobileOtpVerified','dedupeStatus','product','amount','branch','owner','source'];
  function syncCRMApplicant(a, lead) {
    let changed = false;
    const customer = String(lead.name || lead.business || '').trim();
    if (customer && a.customer !== customer) { a.customer = customer; changed = true; }
    const values = {
      mobile:lead.mobile, altMobile:lead.altMobile, email:lead.email, city:lead.city,
      pincode:lead.pincode, pan:lead.pan, aadhaar:lead.aadhaar,
      product:products[lead.product] ? lead.product : undefined,
      amount:Number.isFinite(Number(lead.amount)) ? Number(lead.amount) : undefined,
      branch:lead.branch, owner:lead.owner, business:lead.business,
      consentStatus:lead.consentStatus, consentTimestamp:lead.consentTimestamp,
      mobileOtpVerified:lead.mobileOtpVerified, dedupeStatus:lead.dedupeStatus,
      crmSource:lead.source
    };
    Object.entries(values).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '' && a[field] !== value) {
        a[field] = value;
        changed = true;
      }
    });
    return changed;
  }
  function linkedCRMLead(a) {
    const leads = crm.leads || [];
    const linked = (a.crmLeadId && leads.find(item => item.id === a.crmLeadId)) ||
      (a.lifecycle?.leadId && leads.find(item => item.id === a.lifecycle.leadId)) ||
      leads.find(item => item.applicationId === a.id || item.losId === a.id);
    if (linked) return linked;
    const mobile = String(a.mobile || '').replace(/\D/g, '');
    if (mobile.length < 10) return null;
    const matches = leads.filter(item =>
      String(item.mobile || '').replace(/\D/g, '') === mobile &&
      (!a.product || !item.product || item.product === a.product)
    );
    return matches.length === 1 ? matches[0] : null;
  }
  const productDetailFields = {
    'Two Wheeler':['vehicleMake','vehicleModel','vehicleType','dealerName','onRoadPrice','downPayment','rto','vehicleInsurance','hpn','accessories'],
    'Solar Loan':['systemSize','epcVendor','projectCost','subsidy','roofType','consumerNo','monthlyBill'],
    LAP:['propertyType','propertyOwner','marketValue','propertyAddress','legalStatus','technicalStatus'],
    'Tractor Loan':['tractorType','tractorCondition','tractorMake','tractorModel','tractorVariant','tractorYear','tractorHp','tractorFuel','exShowroomPrice','onRoadPrice','quotationAmount','tractorRegNo','dealerName','dealerCode','dealerLocation','dealerContact','dealerQuoteNo','dealerBankAc','farmerType','agriExperience','primaryOccupation','secondaryOccupation','annualAgriIncome','otherIncome','cropType','cropCycles','seasonalIncome','landOwnership','landHolding','irrigatedLand','nonIrrigatedLand','leasedLand','landLocation','landRecordNo','existingTractor','existingEquipment','existingAgriLoans','otherLiabilities']
  };
  window.nfPersistLifecycleCase = function(id) {
    const a = applications.find(item => item.id === id && managed(item));
    if (!a) return denied('The connected lifecycle case could not be found.');
    return persist();
  };
  window.nfSaveLifecycleProductDetails = function(id, details) {
    const a = applications.find(item => item.id === id && managed(item));
    if (!a) return denied('The connected lifecycle case could not be found.');
    if (!details || typeof details !== 'object' || Array.isArray(details)) return denied('Product details are invalid.');
    const allowed = new Set(productDetailFields[a.product] || []);
    const safeDetails = Object.fromEntries(Object.entries(details).filter(([key, value]) =>
      allowed.has(key) &&
      ((typeof value === 'string' && value.length <= 500) || (typeof value === 'number' && Number.isFinite(value)))
    ));
    const previous = a.productDetails;
    a.productDetails = { ...(previous || {}), ...safeDetails };
    if (persist()) return true;
    if (previous) a.productDetails = previous;
    else delete a.productDetails;
    return false;
  };
  function audit(id, action, details = '') {
    if (typeof logAudit === 'function') logAudit(id, action, details);
    persist();
  }
  (state.leads || []).forEach(saved => {
    const current = (crm.leads || []).find(l => l.id === saved.id);
    if (current) {
      const currentApplicantData = Object.fromEntries(crmApplicantFields
        .filter(field => Object.prototype.hasOwnProperty.call(current, field))
        .map(field => [field, current[field]]));
      Object.assign(current, saved, currentApplicantData);
    }
    else if (crm.leads) crm.leads.unshift(saved);
  });
  (state.cases || []).forEach(saved => {
    const current = applications.find(a => a.id === saved.id);
    if (current) Object.assign(current, saved);
    else applications.unshift(saved);
  });
  let relabeledSyntheticLedger = false;
  (state.ledger || []).forEach(entry => {
    const a = applications.find(application => application.id === entry.applicationId);
    if (!isDemoLifecycleCase(a)) return;
    if (entry.demoOnly !== true) { entry.demoOnly = true; relabeledSyntheticLedger = true; }
    if (!String(entry.type || '').includes('Synthetic Demo Only')) {
      entry.type = String(entry.type || 'Loan Servicing') + ' · Synthetic Demo Only';
      relabeledSyntheticLedger = true;
    }
  });
  applications.filter(a => managed(a) && isDemoLifecycleCase(a)).forEach(a => {
    if (a.workflow && a.workflow.stage !== a.status) {
      a.workflow.stage = a.status;
      relabeledSyntheticLedger = true;
    }
    const approval = a.workflow?.approval;
    const pendingDeviation = [...(a.workflow?.deviations || [])].reverse().find(d =>
      d.status === 'Pending' &&
      d.type === approval?.type &&
      d.requiredRole === approval?.requiredRole &&
      d.reason === approval?.reason
    );
    if (approval && approval.status !== 'Pending' && pendingDeviation) {
      syncActiveApprovalDeviation(a);
      relabeledSyntheticLedger = true;
    }
  });
  if (relabeledSyntheticLedger) persist();
  function restoreAcceptedSanction(a) {
    if (!managed(a) || a.lifecycle?.sanction?.accepted) return;
    const acceptedEvent = [...(state.events || [])].reverse().find(event =>
      event.caseId === a.id && event.action === 'Sanction Accepted'
    );
    if (!acceptedEvent) return;
    const savedTerms = typeof v7Sanction !== 'undefined' ? v7Sanction[a.id] : null;
    const amountInAudit = String(acceptedEvent.details || '').match(/₹\s*([\d,]+(?:\.\d+)?)/);
    const amount = Number.isSafeInteger(Number(savedTerms?.amount))
      ? Number(savedTerms.amount)
      : amountInAudit ? Number(amountInAudit[1].replace(/,/g, '')) : NaN;
    if (!Number.isSafeInteger(amount) || amount <= 0) return;
    const versionInAudit = String(acceptedEvent.details || '').match(/\bv(\d+)\b/i);
    a.lifecycle = { ...(a.lifecycle || {}), sanction:{
      accepted:true,
      amount,
      roi:Number(savedTerms?.roi || products[a.product]?.rate || 0),
      tenure:Number(savedTerms?.tenure || products[a.product]?.tenure || 0),
      version:Number(savedTerms?.version || versionInAudit?.[1] || 1),
      validity:savedTerms?.validity || '30 days',
      repayment:savedTerms?.repayment || a.repayment || '—',
      acceptedAt:acceptedEvent.at
    } };
    a.sanctionedAmount = amount;
    if (typeof v7Sanction !== 'undefined') {
      v7Sanction[a.id] = {
        ...(savedTerms || {}),
        accepted:true, status:'Accepted', amount,
        roi:Number(savedTerms?.roi || products[a.product]?.rate || 0),
        tenure:Number(savedTerms?.tenure || products[a.product]?.tenure || 0),
        version:Number(savedTerms?.version || versionInAudit?.[1] || 1)
      };
    }
    a.lifecycle.loanTerms = {
      ...(a.lifecycle.loanTerms || {}),
      amount, roi:a.lifecycle.sanction.roi, termMonths:a.lifecycle.sanction.tenure
    };
  }
  applications.filter(managed).forEach(restoreAcceptedSanction);
  let synchronizedCrmData = false;
  applications.filter(managed).forEach(a => {
    const lead = linkedCRMLead(a);
    if (!lead) return;
    synchronizedCrmData = syncCRMApplicant(a, lead) || synchronizedCrmData;
  });
  (state.profiles || []).forEach(profile => {
    if (typeof v7Customers !== 'undefined' && !v7Customers.some(customer => customer.id === profile.id)) v7Customers.unshift(profile);
  });
  let correctedImdHandoffs = false;
  applications.filter(a => a.status === 'IMD Pending' || a.workflow?.stage === 'IMD Pending').forEach(a => {
    correctedImdHandoffs = true;
    a.lifecycleManaged = true;
    a.workflow = a.workflow || {};
    a.workflow.stage = 'IMD Pending';
    a.workflow.ownerRole = 'BDM';
    a.lifecycle = { ...(a.lifecycle || {}), stage:'imd' };
    a.lifecycle.imd = { status:'Pending', amount:state.fee, ...(a.lifecycle.imd || {}) };
    const lead = linkedCRMLead(a);
    if (lead && syncCRMApplicant(a, lead)) correctedImdHandoffs = true;
    ensureDemoIMDTransaction(a);
  });
  let correctedKycAssignments = false;
  applications.filter(managed).forEach(a => {
    const validLifecycleStages = ['imd','credit','technical','legal','underwriting','operations','sanction','lms'];
    const staleImdStatus = a.status === 'IMD Pending' && !validLifecycleStages.includes(a.lifecycle?.stage);
    const needsKycReview = a.lifecycle?.stage === 'kyc' || (staleImdStatus && !kycGatePassed(a));
    if (!needsKycReview && !staleImdStatus) return;
    a.lifecycle = { ...(a.lifecycle || {}), ...(needsKycReview ? { stage:'kyc' } : {}) };
    a.workflow = a.workflow || {};
    const nextStatus = needsKycReview ? 'KYC Review' : 'Sales/Predeal';
    const nextStage = needsKycReview ? 'KYC Review' : 'Sales/Predeal';
    if (a.status !== nextStatus) { a.status = nextStatus; correctedKycAssignments = true; }
    if (a.workflow.stage !== nextStage) { a.workflow.stage = nextStage; correctedKycAssignments = true; }
    if (a.workflow.ownerRole !== 'BSO') { a.workflow.ownerRole = 'BSO'; correctedKycAssignments = true; }
  });
  if (correctedKycAssignments || correctedImdHandoffs) persist();
  if (Array.isArray(state.events) && Array.isArray(auditEvents)) auditEvents.unshift(...state.events);
  if (typeof ensureWorkflowData === 'function') ensureWorkflowData();
  if (typeof v7PDD !== 'undefined') {
    applications.filter(managed).forEach(a => {
      if (['Active Loan','Disbursed','Closed'].includes(a.status)) return;
      const pdd = v7PDD[a.id];
      if (!pdd) return;
      pdd.items.forEach(item => { item.status = 'Pending'; });
      pdd.vault = 'Not Stored';
    });
  }
  if (synchronizedCrmData) persist();

  const productViews = {
    journeyTwoWheeler:'Two Wheeler',
    journeyMSME:'MSME',
    journeySolar:'Solar Loan',
    journeyLAP:'LAP',
    journeyTractor:'Tractor Loan'
  };
  const accessViews = {
    bdmWork:['BDM','CEO'],
    loanAccounts:['Central Operations','CEO','System Admin'],
    lmsReports:['Central Operations','CEO','System Admin','CFO'],
    generalLedger:['Central Operations','CEO','System Admin','Operations Checker','Disbursement Officer','Audit Manager','Compliance Manager','Compliance Officer','Accountant','Finance Manager','CFO'],
    imdConfig:['CEO','System Admin'],
    imd:['BDM','CEO','System Admin']
  };
  const navItems = [
    ['bdmWork','BDM Lead Work','↗'], ['imd','IMD & BSA Verification','₹'],
    ...Object.entries(productViews).map(([view, product]) => [view, product + (product === 'Two Wheeler' ? '' : ' Product') + ' Journey','◈']),
    ['loanAccounts','Loan Accounts','▤'], ['lmsReports','LMS Portfolio & Reports','▥'], ['generalLedger','General Ledger','≡'], ['imdConfig','IMD Fee Configuration','⚙']
  ];
  const originationItems = document.querySelector('.nf-nav-group[data-group="origination"] .nf-nav-group-items');
  let operationsGroup = document.querySelector('.nf-nav-group[data-group="loanops"]');
  let operationsItems = operationsGroup && operationsGroup.querySelector('.nf-nav-group-items');
  const originGroup = document.querySelector('.nf-nav-group[data-group="origination"]');
  if (!operationsItems && originGroup) {
    const sec = document.createElement('section');
    sec.className = 'nf-nav-group';
    sec.dataset.group = 'loanops';
    sec.innerHTML = '<button class="nf-nav-group-toggle" type="button" onclick="toggleNavGroup(\'loanops\')"><span class="nf-group-icon">₹</span><span>Loan Operations / LMS</span><i>›</i></button><div class="nf-nav-group-items"></div>';
    originGroup.after(sec);
    operationsGroup = sec;
    operationsItems = sec.querySelector('.nf-nav-group-items');
  }
  let glGroup = document.querySelector('.nf-nav-group[data-group="generalledger"]');
  if (!glGroup && operationsGroup) {
    glGroup = document.createElement('section');
    glGroup.className = 'nf-nav-group';
    glGroup.dataset.group = 'generalledger';
    glGroup.innerHTML = '<button class="nf-nav-group-toggle" type="button" onclick="toggleNavGroup(\'generalledger\')"><span class="nf-group-icon">≡</span><span>General Ledger</span><i>›</i></button><div class="nf-nav-group-items"></div>';
    operationsGroup.after(glGroup);
  }
  const glItems = glGroup && glGroup.querySelector('.nf-nav-group-items');
  if (operationsGroup && glGroup) operationsGroup.after(glGroup);
  if (operationsGroup) {
    const title = operationsGroup.querySelector('.nf-nav-group-toggle span:nth-child(2)');
    if (title) title.textContent = 'Loan Operations / LMS';
  }
  if (glGroup) {
    const title = glGroup.querySelector('.nf-nav-group-toggle span:nth-child(2)');
    if (title) title.textContent = 'General Ledger';
    operationsItems?.querySelectorAll('.nav-item[data-view="generalLedger"]').forEach(item => glItems?.appendChild(item));
  }
  navItems.forEach(([view, label, icon]) => {
    const target = view === 'generalLedger' ? glItems : ['loanAccounts','lmsReports','imdConfig'].includes(view) ? operationsItems : originationItems;
    if (!target || target.querySelector('[data-view="' + view + '"]')) return;
    const item = document.createElement('button');
    item.className = 'nav-item';
    item.dataset.view = view;
    item.title = label;
    item.innerHTML = '<span class="nav-icon">' + icon + '</span><span>' + esc(label) + '</span>';
    item.onclick = () => navTo(view);
    target.appendChild(item);
  });
  Object.entries(accessViews).forEach(([view, roles]) => roles.forEach(role => {
    if (Array.isArray(BASE_ACCESS[role]) && !BASE_ACCESS[role].includes(view)) BASE_ACCESS[role].push(view);
  }));
  Object.keys(productViews).forEach(view => Object.entries(BASE_ACCESS).forEach(([role, views]) => {
    if (views.includes('applications') || views.includes('newApplication')) views.push(view);
  }));

  const baseLogAudit = logAudit;
  logAudit = function(id, action, details = '') {
    baseLogAudit.call(this, id, action, details);
    if (applications.some(a => a.id === id && managed(a)) || (crm.leads || []).some(l => l.id === id && l.lifecycleManaged)) {
      state.events = state.events || [];
      state.events.unshift({ caseId:id, action, details, by:currentUser.role, user:currentUser.name, at:new Date().toLocaleString() });
      state.events = state.events.slice(0, 500);
      persist();
    }
  };

  function denied(message = 'Your role cannot perform this lifecycle action.') { showToast(message); }
  function may(view) {
    if (accessViews[view]) return accessViews[view].includes(currentUser.role);
    if (Object.hasOwn(productViews, view)) return (BASE_ACCESS[currentUser.role] || []).includes(view) && (typeof nfCan !== 'function' || nfCan('view'));
    return false;
  }
  function caseFor(id) { return applications.find(a => a.id === id && managed(a)); }
  function leadFor(id) { return (crm.leads || []).find(l => l.id === id); }
  function tasksFor(id) { return state.bdmTasks.filter(t => t.leadId === id); }
  function kycStore() {
    try { return JSON.parse(localStorage.getItem(KYC_KEY) || '{}'); }
    catch (error) { console.error('Could not read KYC review state.', error); return {}; }
  }
  function customerFor(a) {
    const profile = state.profiles.find(p => p.id === a.lifecycle.customerId);
    return profile || state.profiles.find(p => p.mobile === a.mobile) || null;
  }
  function createProfile(a) {
    const current = state.profiles.find(p => p.mobile && p.mobile === a.mobile);
    if (current) {
      a.lifecycle.customerId = current.id;
      current.applicationIds = [...new Set([...(current.applicationIds || []), a.id])];
      return current;
    }
    const linked = (typeof v7Customers !== 'undefined' ? v7Customers : []).find(p => p.mobile && p.mobile === a.mobile);
    const profile = {
      id: linked?.id || 'CUS-' + String(Date.now()).slice(-8),
      name:a.customer, mobile:a.mobile, pan:linked?.pan || '',
      aadhaar:linked?.aadhaar || a.aadhaar || '',
      branch:a.branch, product:a.product, applicationId:a.id,
      applicationIds:[a.id], kyc:'Verified', dedupe:'Clear',
      consent:{ bureau:true, kyc:true, aa:false, communication:true }
    };
    state.profiles.push(profile);
    a.lifecycle.customerId = profile.id;
    if (typeof v7Customers !== 'undefined' && !linked) v7Customers.unshift(profile);
    return profile;
  }
  function setRoute(view, id) {
    if (!may(view)) return denied('This page is restricted to the authorized lifecycle role.');
    if (typeof v7FillAll === 'function') v7FillAll();
    if (view === 'bdmWork') renderBDMWork();
    if (view === 'loanAccounts') renderLoanAccounts();
    if (view === 'lmsReports') renderLMSReports();
    if (view === 'generalLedger') renderLedger();
    if (view === 'imdConfig') renderIMDConfig();
    if (view === 'imd') renderIMD(id);
    if (productViews[view]) renderProductJourney(view);
  }
  const baseCreateSendBack = createSendBackTask;
  createSendBackTask = function(id) {
    const a = applications.find(item => item.id === id);
    const previousStage = a?.lifecycle?.stage;
    baseCreateSendBack.apply(this, arguments);
    if (managed(a) && a.status === 'Send Back') {
      a.lifecycle.previousStage = previousStage;
      a.lifecycle.stage = 'sendback';
      audit(id, 'Lifecycle Correction Task Created', a.workflow.ownerRole + ' assigned');
    }
  };
  const baseCompleteSendBack = completeSendBackTask;
  completeSendBackTask = function(taskId) {
    const task = sendBackTasks.find(item => item.id === taskId);
    const a = task && applications.find(item => item.id === task.caseId);
    baseCompleteSendBack.apply(this, arguments);
    if (managed(a) && !a.workflow.sendBack) {
      a.lifecycle.stage = a.lifecycle.previousStage || a.lifecycle.stage;
      delete a.lifecycle.previousStage;
      audit(a.id, 'Lifecycle Correction Completed', taskId);
    }
  };
  const baseNav = navTo;
  navTo = function(view, arg) {
    if ([...Object.keys(accessViews), ...Object.keys(productViews)].includes(view)) return setRoute(view, arg);
    return baseNav.apply(this, arguments);
  };

  const baseRenderCRM = renderCRM;
  renderCRM = function(arg) {
    const leadId = typeof arg === 'string' && arg.startsWith('CRM-') ? arg : crm.selectedId;
    const lead = leadFor(leadId);
    const linked = applications.find(a =>
      a.crmLeadId === leadId ||
      a.lifecycle?.leadId === leadId ||
      (lead?.applicationId && a.id === lead.applicationId)
    );
    if (linked) crm.losId = linked.id;
    return baseRenderCRM.apply(this, arguments);
  };
  const baseSaveLead = saveCRMLeadDraft;
  saveCRMLeadDraft = function() {
    if (crm.stage === 0) {
      crmSaveCurrent();
      if (!crm.data.consentAccepted) return denied('Give customer consent before saving or continuing.');
      if (!crm.data.mobileOtpVerified) return denied('Verify the locally generated demo OTP before saving or continuing.');
      if (!crm.data.dedupeChecked || crm.data.dedupeStatus !== 'No Match') return denied('Run the demo customer dedupe check before saving or continuing.');
    }
    const creating = !crm.selectedId;
    const existingIds = new Set([...(crm.leads || []).map(lead => lead.id), ...(state.leads || []).map(lead => lead.id)]);
    baseSaveLead.apply(this, arguments);
    if (creating && crm.selectedId && existingIds.has(crm.selectedId)) {
      const lead = crm.leads.find(item => item.id === crm.selectedId);
      const date = localDateString();
      const prefix = 'CRM-' + date.slice(2).replaceAll('-', '') + '-';
      let sequence = 1, replacement;
      do { replacement = prefix + String(sequence++).padStart(3, '0'); } while (existingIds.has(replacement) || crm.leads.some(item => item !== lead && item.id === replacement));
      lead.id = replacement;
      crm.selectedId = replacement;
      renderCRM();
      showToast('Draft ' + replacement + ' saved with a unique lead ID.');
    }
    const lead = leadFor(crm.selectedId);
    if (lead) { lead.lifecycleManaged = true; persist(); }
  };
  const baseCrmSaveCurrent = crmSaveCurrent;
  crmSaveCurrent = function() {
    baseCrmSaveCurrent.apply(this, arguments);
    const lead = leadFor(crm.selectedId);
    if (lead) {
      lead.relationshipManager = crm.data.assignedRM || lead.relationshipManager || '';
      lead.owner = crm.data.assignedSales || crm.data.owner || lead.owner;
    }
  };
  const baseCrmAdvance = crmAdvance;
  crmAdvance = function() {
    crmSaveCurrent();
    if (crm.stage === 0) {
      const checks = [
        [crm.data.consentAccepted === true, 'Give customer consent before continuing.'],
        [crm.data.mobileOtpVerified === true, 'Verify the locally generated demo OTP before continuing.'],
        [crm.data.dedupeChecked === true && crm.data.dedupeStatus === 'No Match', 'Run the demo customer dedupe check before continuing.']
      ];
      const consentCheck = checks.find(([valid]) => !valid);
      if (consentCheck) return denied(consentCheck[1]);
    }
    if (!crm.selectedId) {
      const name = (crm.data.firstName + ' ' + crm.data.lastName).trim() || crm.data.businessName;
      const mobile = String(crm.data.mobile || '').replace(/\D/g, '');
      const checks = [
        [!!crm.data.leadDate, 'Enter the lead date.'],
        [!!crm.data.source, 'Select a lead source.'],
        [!!crm.data.branch, 'Select a branch.'],
        [!!crm.data.product, 'Select a product.'],
        [Number(crm.data.amount) > 0, 'Enter a valid requested amount.'],
        [!!crm.data.owner, 'Enter a lead owner.'],
        [!!name, 'Enter the applicant or business name.'],
        [/^\d{10,15}$/.test(mobile), 'Enter a valid customer mobile number.'],
        [!!crm.data.city, 'Enter the customer city.'],
        [/^\d{5,6}$/.test(String(crm.data.pincode || '')), 'Enter a valid PIN code.'],
        [crm.data.consentAccepted === true, 'Capture customer consent before continuing.'],
        [crm.data.mobileOtpVerified === true, 'Verify the locally generated demo OTP before continuing.'],
        [crm.data.dedupeChecked === true && crm.data.dedupeStatus === 'No Match', 'Run the demo customer dedupe check before continuing.']
      ];
      const invalid = checks.find(([valid]) => !valid);
      if (invalid) return denied(invalid[1]);
      saveCRMLeadDraft();
      if (!crm.selectedId) return;
    }
    baseCrmAdvance.apply(this, arguments);
    const lead = leadFor(crm.selectedId);
    if (lead) { lead.lifecycleManaged = true; persist(); }
  };
  const baseHandoff = crmLOSHandoff;
  crmLOSHandoff = function() {
    return baseHandoff.apply(this, arguments)
      .replace(/<button class="ghost-btn" onclick="initiateToBDM\(\)">Initiate to BDM<\/button>/, '')
      .replace(/<button class="primary-btn" onclick="(?:openConvertedLOS|convertCRMToLOS)\(\)">[^<]*<\/button>/,
        '<button class="primary-btn" onclick="nfSendCRMLeadToLOS()">Send to LOS →</button>');
  };
  window.nfSendCRMLeadToLOS = function() {
    crmSaveCurrent();
    const lead = leadFor(crm.selectedId);
    if (!lead) return denied('Save the CRM lead before sending it to LOS.');
    if (lead.converted) return openConvertedLOS();
    return convertCRMToLOS();
  };
  initiateToBDM = function() {
    const lead = leadFor(crm.selectedId);
    if (!['BSO','BDM','ASM','RSM','ZSM','System Admin'].includes(currentUser.role)) return denied('Your role cannot assign BDM field work.');
    if (!lead) return denied('Save the CRM lead before assigning BDM work.');
    if (tasksFor(lead.id).length) return denied('BDM work is already assigned to this lead.');
    const types = ['Field visit and customer meeting','Document collection and verification','Feasibility and income assessment'];
    const assignedTo = currentUser.role === 'BDM' ? currentUser.name : roleMeta('BDM').name;
    types.forEach((type, i) => state.bdmTasks.push({ id:'BDM-' + Date.now() + '-' + i, leadId:lead.id, assignedTo, assignedBy:currentUser.name, type, status:'Open', evidence:'' }));
    lead.lifecycleManaged = true;
    lead.status = 'Opportunity';
    lead.next = 'BDM field work in progress';
    audit(lead.id, 'BDM Work Assigned', 'Three BDM work items created');
    showToast('Three BDM work items are ready.');
    navTo('crm', lead.id);
  };
  window.nfInitiateBDM = initiateToBDM;
  window.nfCompleteBDMTask = function(id) {
    if (currentUser.role !== 'BDM') return denied('Only a BDM can complete these work items.');
    const task = state.bdmTasks.find(t => t.id === id);
    if (!task || task.assignedTo !== currentUser.name) return denied('This work item is assigned to another BDM.');
    const evidence = document.querySelector('[data-evidence="' + CSS.escape(id) + '"]')?.value.trim();
    if (!task || task.status === 'Completed') return;
    if (!evidence) return denied('Record completion evidence before closing this BDM item.');
    task.evidence = evidence;
    task.status = 'Completed';
    task.completedAt = new Date().toISOString();
    audit(task.leadId, 'BDM Work Completed', task.type + ': ' + evidence);
    renderBDMWork();
  };
  function renderBDMWork() {
    if (!may('bdmWork')) return denied();
    setPage('BDM Lead Work', 'CRM / BDM');
    const tasks = state.bdmTasks.filter(t => currentUser.role === 'CEO' || (currentUser.role === 'BDM' && t.assignedTo === currentUser.name));
    $('#content').innerHTML =     '<div class="page-head"><div><h2>BDM Lead Work</h2><p>Complete field visit, document verification and feasibility before BSO KYC intake.</p></div><button class="ghost-btn" onclick="navTo(\'crm\')">Back to CRM</button></div>' +
      (tasks.length ? tasks.map(t => '<section class="workflow-card" style="margin-bottom:12px"><div class="workflow-title"><div><h3>' + esc(t.type) + '</h3><p>' + esc(t.leadId) + ' · ' + esc(leadFor(t.leadId)?.name || 'Lead') + '</p></div><span class="stage-chip ' + (t.status === 'Completed' ? 'done' : 'pending') + '">' + esc(t.status) + '</span></div>' +
        (t.status === 'Completed' ? '<p>' + esc(t.evidence) + '</p>' : currentUser.role === 'BDM' ? '<label>Completion evidence<textarea data-evidence="' + esc(t.id) + '" rows="2" maxlength="500"></textarea></label><button class="primary-btn" onclick="nfCompleteBDMTask(\'' + esc(t.id) + '\')">Complete work item</button>' : '') + '</section>').join('') : '<div class="workflow-card"><p>No BDM work items are assigned yet. Start from a saved CRM lead.</p></div>');
    const leadIds = [...new Set(tasks.map(t => t.leadId))];
    $('#content').insertAdjacentHTML('beforeend', leadIds.map(id => {
      const items = tasksFor(id);
      return currentUser.role === 'BDM' && items.length && items.every(t => t.status === 'Completed') ? '<button class="primary-btn" style="margin:10px 0" onclick="nfQueueLeadForKyc(\'' + esc(id) + '\')">Send ' + esc(leadFor(id)?.name || id) + ' to KYC & Dedupe →</button>' : '';
    }).join(''));
  }
  function renderProductJourney(view) {
    const product = productViews[view];
    if (!may(view)) return denied();
    const scope = typeof nfScope === 'function' ? nfScope() : null;
    const rows = applications.filter(a => managed(a) && a.product === product &&
      (!scope?.products?.length || scope.products.includes(a.product)) &&
      (scope?.level !== 'branch' || !currentUser.branch || !a.branch || a.branch === currentUser.branch));
    setPage(product + ' Product Journey', 'Origination / Product Journeys');
    $('#content').innerHTML = '<div class="page-head"><div><h2>' + esc(product) + ' Product Journey</h2><p>Connected cases move through BDM, KYC, LOS, IMD, parallel verification, underwriting, operations and LMS without creating duplicate application records.</p></div><span class="badge blue">' + rows.length + ' connected cases</span></div>' +
      (rows.length ? '<section class="workflow-card"><div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>Branch</th><th>Amount</th><th>Current stage</th><th>Owner</th><th></th></tr></thead><tbody>' +
        rows.map(a => '<tr><td>' + esc(a.id) + '</td><td>' + esc(a.customer) + '</td><td>' + esc(a.branch || '—') + '</td><td>' + money(a.amount) + '</td><td>' + esc(a.status) + '</td><td>' + esc(a.workflow?.ownerRole || '—') + '</td><td><button class="more-btn" onclick="navTo(\'case\',\'' + esc(a.id) + '\')">Open case</button>' + (a.lifecycle.stage === 'imd' && may('imd') ? ' <button class="more-btn" onclick="nfOpenLifecycleIMD(\'' + esc(a.id) + '\')">Open IMD</button>' : '') + '</td></tr>').join('') +
        '</tbody></table></div></section>' : '<section class="workflow-card"><p>No ' + esc(product) + ' cases have completed the CRM → BDM → KYC gate yet. Start from an existing CRM lead; this view does not create a duplicate application.</p></section>');
  }
  window.nfQueueLeadForKyc = function(id = crm.selectedId) {
    const lead = leadFor(id);
    if (currentUser.role !== 'BDM') return denied('Only the assigned BDM can send completed field work to KYC.');
    if (!lead) return denied('Save or select a CRM lead first.');
    if (!tasksFor(id).length || tasksFor(id).some(t => t.status !== 'Completed')) return denied('Complete all BDM work items before KYC intake.');
    if (tasksFor(id).some(t => t.assignedTo !== currentUser.name)) return denied('This lead is assigned to another BDM.');
    let a = applications.find(x => x.lifecycleManaged && x.lifecycle?.leadId === id);
    if (!a) {
      const product = products[lead.product] ? lead.product : 'Two Wheeler';
      const appId = 'SKF-' + products[product].code + '-' + String(Date.now()).slice(-7);
      a = {
        id:appId,
        customer:lead.name || lead.business || 'New applicant', mobile:lead.mobile || '',
        altMobile:lead.altMobile || '', email:lead.email || '', city:lead.city || '',
        pincode:lead.pincode || '', pan:lead.pan || '', aadhaar:lead.aadhaar || '',
        consentStatus:lead.consentStatus || 'Not Given', consentTimestamp:lead.consentTimestamp || '',
        mobileOtpVerified:!!lead.mobileOtpVerified,
        product, amount:Number(lead.amount || 0), branch:lead.branch || 'Jaipur - VKI',
        status:'KYC Review', stage:0, score:Number(lead.score || 0), docs:0,
        created:new Date().toLocaleDateString('en-IN'), owner:lead.owner || 'BDM',
        repayment:'E-Nach', lifecycleManaged:true, browserLocalOnly:!!lead.productJourneyKey,
        lifecycle:{ leadId:id, stage:'kyc', imd:{ status:'Not Started', amount:state.fee }, parallel:{ credit:'Pending', technical:'Pending', legal:'Pending' }, repayments:[], schedule:[], customerId:null },
        workflow:{ stage:'KYC Review', sales:{}, credit:{}, technicalStatus:'Pending', technicalReport:'', legalStatus:'Pending', legalReport:'', eSignStatus:'Pending', doChecklist:'Pending', centralOps:'Pending', dealId:'', lmsStatus:'Pending', ownerRole:'BSO', bureauVerified:false, creditCrossCheck:false, previousStatus:'KYC Review', sendBack:false, approval:null, deviations:[] }
      };
      applications.unshift(a);
      if (typeof ensureWorkflowData === 'function') ensureWorkflowData();
      if (typeof v7FillAll === 'function') v7FillAll();
      if (typeof v7UW !== 'undefined') v7UW[a.id].status = 'Pending';
      if (typeof v7Sanction !== 'undefined') v7Sanction[a.id].status = 'Draft';
      lead.applicationId = a.id;
      lead.status = 'KYC Review';
      lead.next = 'KYC & Dedupe';
    }
    audit(a.id, 'KYC Intake Created', 'CRM Lead ' + id + ' · BDM work completed');
    persist();
    navTo('crm', id);
    showToast('Lead entered KYC & Dedupe. LOS remains locked until both checks pass.');
  };
  function ensureCRMLOSCase(lead) {
    const linkedId = lead.applicationId || lead.losId || crm.losId;
    let a = applications.find(item =>
      item.crmLeadId === lead.id ||
      item.lifecycle?.leadId === lead.id ||
      (linkedId && item.id === linkedId && item.product === lead.product)
    );
    const creating = !a;
    if (!a) {
      const product = products[lead.product] ? lead.product : 'Two Wheeler';
      const prefix = 'SKF-' + products[product].code + '-';
      let id;
      do { id = prefix + String(Date.now()).slice(-7); } while (applications.some(item => item.id === id));
      a = {
        id, customer:lead.name || lead.business || 'New applicant', mobile:lead.mobile || '',
        product, amount:Number(lead.amount || 0), branch:lead.branch || 'Jaipur - VKI',
        status:'KYC Review', stage:0, score:Number(lead.score || 0),
        docs:Math.round(Object.keys(crm.prescreen || {}).filter(key => crm.prescreen[key]).length / Math.max(1, crmDocsForProduct(product).length) * 100),
        created:new Date().toLocaleDateString('en-IN'), owner:lead.owner || currentUser.name,
        business:lead.business || crm.data.businessName || '',
        email:lead.email || crm.data.email || '',
        city:lead.city || crm.data.city || '',
        pincode:lead.pincode || crm.data.pincode || '',
        pan:lead.pan || crm.data.pan || '',
        aadhaar:lead.aadhaar || crm.data.aadhaar || '',
        repayment:'—', lifecycleManaged:true, crmLeadId:lead.id,
        browserLocalOnly:!!lead.productJourneyKey,
        lifecycle:{
          leadId:lead.id, stage:'kyc', imd:{ status:'Not Started', amount:state.fee },
          parallel:{ credit:'Pending', technical:'Pending', legal:'Pending' },
          repayments:[], schedule:[], customerId:null
        },
        workflow:{
          stage:'KYC Review', sales:{}, credit:{}, technicalStatus:'Pending',
          technicalReport:'', legalStatus:'Pending', legalReport:'', eSignStatus:'Pending',
          doChecklist:'Pending', centralOps:'Pending', dealId:'', lmsStatus:'Pending',
          ownerRole:'BSO', bureauVerified:false, creditCrossCheck:false,
          previousStatus:'KYC Review', sendBack:false, approval:null, deviations:[]
        }
      };
      applications.unshift(a);
      if (typeof ensureWorkflowData === 'function') ensureWorkflowData();
      if (typeof v7FillAll === 'function') v7FillAll();
    }
    a.lifecycleManaged = true;
    a.crmLeadId = lead.id;
    const atInitialLOS = creating || a.lifecycle?.stage === 'los' || (!a.lifecycle?.stage && ['Draft','Sales/Predeal','Sales Process'].includes(a.status));
    if (atInitialLOS) {
      const applicantName = String(lead.name || '').trim();
      a.customer = applicantName || lead.business || a.customer || 'New applicant';
      a.mobile = lead.mobile || '';
      a.product = products[lead.product] ? lead.product : a.product;
      a.amount = Number(lead.amount || 0);
      a.branch = lead.branch || a.branch;
      a.owner = lead.owner || a.owner;
      a.business = lead.business || '';
      a.altMobile = lead.altMobile || '';
      a.email = lead.email || '';
      a.city = lead.city || '';
      a.pincode = lead.pincode || '';
      a.pan = lead.pan || '';
      a.aadhaar = lead.aadhaar || '';
      a.consentStatus = lead.consentStatus || 'Not Given';
      a.consentTimestamp = lead.consentTimestamp || '';
      a.mobileOtpVerified = !!lead.mobileOtpVerified;
      a.dedupeStatus = lead.dedupeStatus || '';
      a.crmSource = lead.source || '';
      const stage = a.lifecycle?.stage || 'los';
      const inKycReview = stage === 'kyc';
      a.lifecycle = { ...(a.lifecycle || {}), leadId:lead.id, stage, imd:a.lifecycle?.imd || { status:'Not Started', amount:state.fee } };
      a.workflow = { ...(a.workflow || {}), stage:inKycReview ? 'KYC Review' : 'Sales/Predeal', ownerRole:'BSO' };
      a.status = inKycReview ? 'KYC Review' : 'Sales/Predeal';
    } else {
      a.lifecycle = { ...(a.lifecycle || {}), leadId:lead.id };
    }
    syncCRMApplicant(a, lead);
    if (creating) {
      a.score = Number(lead.score || 0);
    }
    lead.applicationId = a.id;
    lead.losId = a.id;
    return a;
  }
  const baseConvertCRMToLOS = convertCRMToLOS;
  convertCRMToLOS = function() {
    crmSaveCurrent();
    if (!crm.data.consentAccepted || !crm.data.mobileOtpVerified) return denied('Give consent and verify the demo OTP before sending this lead to LOS.');
    if (!crm.data.dedupeChecked || crm.data.dedupeStatus !== 'No Match') return denied('Complete the demo PAN/Aadhaar dedupe check before sending a new customer case to LOS.');
    if (!leadFor(crm.selectedId)) return denied('Save the CRM lead before sending it to LOS.');
    baseConvertCRMToLOS.apply(this, arguments);
    const lead = leadFor(crm.selectedId);
    if (lead) {
      const a = ensureCRMLOSCase(lead);
      lead.lifecycleManaged = true;
      lead.applicationId = a.id;
      lead.losId = a.id;
      lead.converted = true;
      lead.status = 'Converted';
      lead.stage = 8;
      lead.next = a.lifecycle.stage === 'kyc' ? 'BSO KYC & Dedupe Review' : 'LOS Created';
      crm.losId = a.id;
      persist();
      openConvertedLOS();
    }
  };
  const baseOpenConvertedLOS = openConvertedLOS;
  openConvertedLOS = function() {
    const lead = leadFor(crm.selectedId);
    if (!lead || !lead.converted) return denied('Convert the CRM lead before opening its LOS application.');
    const a = ensureCRMLOSCase(lead);
    persist();
    if (a.lifecycle.stage === 'kyc' || (a.lifecycle.stage === 'los' && !kycGatePassed(a))) {
      if (!roleCanView('kycDedupe')) return denied('This application is queued for BSO KYC and dedupe review before LOS.');
      navTo('kycDedupe');
      showToast('CRM lead sent to BSO KYC & Dedupe. Pass both checks to open the linked LOS application.');
      return;
    }
    const sourceChannel = {
      DSA:'Dealer / DSA', Dealer:'Dealer / DSA', Digital:'Digital Lead',
      'Walk-in':'Branch Walk-in', Referral:'Referral', 'Existing Customer':'Existing Customer'
    }[lead.source] || 'Dealer / DSA';
    navTo('newApplication', a.product);
    wizard = {
      step:0, product:a.product, selectedApplicationId:a.id, docs:{}, coType:'Co-applicant',
      demoMandatoryBypass:a.demoMandatoryBypass === true,
      pdDemoBypass:a.pdDemoBypass === true || a.pdDemoBypass?.enabled === true || a.serverDraft?.pdDemoBypass === true,
      data:{
        sourceChannel, branch:a.branch, salesExec:lead.owner || a.owner,
        requestedAmount:a.amount, firstName:(lead.name || '').split(/\s+/)[0] || '',
        lastName:(lead.name || '').split(/\s+/).slice(1).join(' '),
        mobile:lead.mobile || a.mobile, altMobile:lead.altMobile || a.altMobile || '',
        email:lead.email || a.email || '', city:lead.city || a.city || '', pincode:lead.pincode || a.pincode || '',
        pan:lead.pan || a.pan || '', aadhaar:lead.aadhaar || a.aadhaar || '',
        ...(a.productDetails || {})
      }
    };
    renderWizard();
    showToast('Opening linked ' + a.product + ' LOS application for BSO processing.');
  };

  const baseKycOpen = window.openKycCase;
  if (typeof baseKycOpen === 'function') window.openKycCase = function(id) {
    baseKycOpen.apply(this, arguments);
    const a = caseFor(id), record = kycStore()[id];
    if (a && record?.dedupe?.matches?.length) {
      const verifiedMatch = record.dedupe.matches.some(match => {
        const candidate = applications.find(item => item.id === match.id);
        return candidate && (typeof v7Kyc === 'undefined' || v7Kyc[candidate.id]?.status === 'Verified');
      });
      const footer = document.querySelector('#modalRoot .modal-footer');
      if (footer && verifiedMatch) footer.insertAdjacentHTML('afterbegin', '<p class="muted">A verified existing customer profile matches this identity. Review and link it instead of creating a duplicate.</p><button class="ghost-btn" onclick="nfUseExistingProfile(\'' + esc(id) + '\')">Review & reuse verified profile</button>');
    }
    if (a && record?.kyc?.status === 'Verified' && ['No Match','Existing Profile Reused'].includes(record?.dedupe?.status) && currentUser.role === 'BSO') {
      const footer = document.querySelector('#modalRoot .modal-footer');
      if (footer) footer.insertAdjacentHTML('afterbegin', '<button class="primary-btn" onclick="nfPassKyc(\'' + esc(id) + '\')">KYC + Dedupe Passed · Start LOS →</button>');
    }
  };
  window.nfUseExistingProfile = function(id) {
    if (currentUser.role !== 'BSO') return denied('Only the assigned BSO can resolve a possible existing-customer match.');
    const a = caseFor(id), records = kycStore(), record = records[id];
    const match = record?.dedupe?.matches?.find(item => {
      const candidate = applications.find(app => app.id === item.id);
      return candidate && candidate.id !== id && (typeof v7Kyc === 'undefined' || v7Kyc[candidate.id]?.status === 'Verified');
    });
    if (!a || !match) return denied('No verified existing profile is available to reuse for this match.');
    const existing = applications.find(app => app.id === match.id);
    let profile = state.profiles.find(item => item.id === existing.lifecycle?.customerId || item.mobile === existing.mobile);
    if (!profile) {
      const customer = (typeof v7Customers !== 'undefined' ? v7Customers : []).find(item => item.applicationId === existing.id || item.applicationIds?.includes(existing.id));
      profile = {
        id:customer?.id || existing.lifecycle?.customerId || 'CUS-' + existing.id,
        name:customer?.name || existing.customer,
        mobile:customer?.mobile || existing.mobile,
        pan:customer?.pan || existing.pan || '',
        aadhaar:customer?.aadhaar || existing.aadhaar || '',
        branch:existing.branch, product:existing.product, applicationId:existing.id,
        applicationIds:[existing.id], kyc:'Verified', dedupe:'Clear',
        consent:{ bureau:true, kyc:true, aa:false, communication:true }
      };
      state.profiles.push(profile);
      if (typeof v7Customers !== 'undefined' && !v7Customers.some(item => item.id === profile.id)) v7Customers.unshift(profile);
    }
    profile.applicationIds = [...new Set([...(profile.applicationIds || []), id])];
    record.kyc.status = 'Verified';
    record.kyc.reusedProfile = true;
    record.dedupe.status = 'Existing Profile Reused';
    record.dedupe.reviewedBy = currentUser.name;
    record.dedupe.reviewedAt = new Date().toISOString();
    a.lifecycle.customerId = profile.id;
    localStorage.setItem(KYC_KEY, JSON.stringify(records));
    audit(id, 'Verified Existing Profile Reused', profile.id + ' linked from ' + existing.id);
    closeModal();
    openKycCase(id);
  };
  window.nfPassKyc = function(id) {
    const a = caseFor(id), records = kycStore()[id];
    if (currentUser.role !== 'BSO' || (typeof nfCan === 'function' && (!nfCan('runKyc') || !nfCan('runDedupe')))) return denied('Only the assigned BSO can clear the KYC and dedupe gates.');
    if (!a || records?.kyc?.status !== 'Verified' || !['No Match','Existing Profile Reused'].includes(records?.dedupe?.status)) return denied('KYC must be Verified and dedupe must show No Match or an approved existing-profile reuse before LOS.');
    const profile = records.dedupe.status === 'Existing Profile Reused' ? state.profiles.find(item => item.id === a.lifecycle.customerId) : createProfile(a);
    if (!profile) return denied('The approved customer profile could not be linked. Review the case again.');
    a.lifecycle.stage = 'los';
    a.status = 'Sales/Predeal';
    a.workflow.ownerRole = 'BSO';
    a.workflow.bureauVerified = false;
    a.lifecycle.profileId = profile.id;
    const lead = leadFor(a.lifecycle.leadId);
    if (lead) { lead.status = 'LOS Ready'; lead.next = 'Complete LOS application'; }
    audit(id, 'KYC and Dedupe Cleared', 'Customer profile ' + profile.id + ' linked');
    closeModal();
    persist();
    if (roleCanView('newApplication')) openLifecycleLOS(id);
    else {
      navTo('applications');
      showToast('KYC and dedupe passed. The assigned sales user can resume this LOS application from CRM.');
    }
  };
  function openLifecycleLOS(id) {
    const a = caseFor(id);
    if (!a || a.lifecycle.stage !== 'los' || !kycGatePassed(a)) return denied('Complete BSO KYC and dedupe before opening LOS.');
    if (!roleCanView('newApplication')) return denied('Your role cannot open the LOS application. It is ready for the assigned sales user.');
    wizard = {
      step:0, product:a.product, selectedApplicationId:a.id, docs:{}, coType:'Co-applicant',
      demoMandatoryBypass:a.demoMandatoryBypass === true,
      data:{ sourceChannel:leadFor(a.lifecycle.leadId)?.source || 'Dealer / DSA', branch:a.branch, salesExec:a.owner, requestedAmount:a.amount, firstName:a.customer.split(' ')[0], lastName:a.customer.split(' ').slice(1).join(' '), mobile:a.mobile }
    };
    const draft = wizard;
    navTo('newApplication');
    wizard = draft;
    renderWizard();
  }
  function kycGatePassed(a) {
    const record = kycStore()[a?.id];
    return record?.kyc?.status === 'Verified' && ['No Match','Existing Profile Reused'].includes(record?.dedupe?.status);
  }
  window.nfCheckKycSubmission = function() {
    const a = getWizardApplication();
    if (!a || !managed(a) || (a.lifecycle.stage === 'los' && kycGatePassed(a))) return true;
    if (a.lifecycle.stage === 'los') {
      a.lifecycle.stage = 'kyc';
      a.status = 'KYC Review';
      a.workflow.stage = 'KYC Review';
      a.workflow.ownerRole = 'BSO';
      persist();
    }
    denied('Complete BSO KYC and dedupe in KYC & Dedupe before submitting this application.');
    return false;
  };
  const baseSubmit = submitApplication;
  submitApplication = async function() {
    const beforeSubmit = getWizardApplication();
    const existingApplicationIds = new Set(applications.map(application => application.id));
    if (beforeSubmit && managed(beforeSubmit) && !window.nfCheckKycSubmission()) return;
    const loanTerms = { termMonths:Number(wizard.data.tenure) || 12, roi:Number(wizard.data.roi) || Number(products[wizard.product]?.rate) || 14 };
    await baseSubmit.apply(this, arguments);
    const a = beforeSubmit || getWizardApplication() || applications.find(application => !existingApplicationIds.has(application.id));
    if (!a || (!managed(a) && currentUser.role !== 'BSO')) return;
    a.pdDemoBypass = wizard.pdDemoBypass === true && !a.pd;
    const previous = clone(a);
    a.lifecycleManaged = true;
    a.crmLeadId = a.crmLeadId || a.lifecycle?.leadId || '';
    a.customer = [wizard.data.firstName, wizard.data.lastName].filter(Boolean).join(' ').trim() || a.customer;
    a.mobile = wizard.data.mobile || a.mobile;
    a.altMobile = wizard.data.altMobile || a.altMobile || '';
    a.email = wizard.data.email || a.email || '';
    a.city = wizard.data.city || a.city || '';
    a.pincode = wizard.data.pincode || a.pincode || '';
    a.pan = wizard.data.pan || a.pan || '';
    a.aadhaar = wizard.data.aadhaar || a.aadhaar || '';
    a.product = wizard.product;
    a.amount = Number(wizard.data.finalAmount || wizard.data.requestedAmount || a.amount || 0);
    a.branch = wizard.data.branch || a.branch || '';
    a.workflow = a.workflow || {};
    a.workflow.pdStatus = a.pdDemoBypass ? 'Demo Bypass' : a.pd?.status || 'Pending';
    a.lifecycle = { ...(a.lifecycle || {}), stage:'imd', loanTerms };
    a.lifecycle.imd = {
      status:'Pending', amount:imdFee(), reference:'', submittedBy:'', submittedByUser:'',
      submittedAmount:0, verifiedBy:'', verifiedByRole:'', verifiedAt:'',
      simulatorReference:demoIMDReference(a)
    };
    a.status = 'IMD Pending';
    a.workflow.stage = 'IMD Pending';
    a.workflow.ownerRole = 'BDM';
    ensureDemoIMDTransaction(a);
    if (a.serverPersisted && currentUser.role === 'BSO' && typeof window.nfSendLosToBdm === 'function') {
      try {
        await window.nfSendLosToBdm(a);
      } catch (error) {
        Object.assign(a, previous);
        showToast(error.message || 'LOS handoff to BDM failed. The case was not sent.');
        return;
      }
    }
    audit(a.id, a.pdDemoBypass ? 'PD not performed · demo bypass' : 'LOS Completed · IMD Required', a.pdDemoBypass ? 'No field visit, photo, geotag, PD record, or verification captured; demo handoff only.' : 'Fee due ' + money(state.fee) + ' · BDM handoff');
    if (roleCanView('imd')) navTo('imd', a.id);
    else {
      navTo('applications');
      showToast('LOS submitted. The assigned BDM must enter the IMD payment reference.');
    }
  };
  function imdFee() { return Number.isFinite(Number(state.fee)) && Number(state.fee) > 0 ? Number(state.fee) : 1500; }
  function demoIMDReference(a) {
    return 'SIM-IMD-' + a.id.replace(/[^A-Za-z0-9]/g, '').slice(-10).toUpperCase();
  }
  function ensureDemoIMDTransaction(a) {
    const payment = a.lifecycle.imd || (a.lifecycle.imd = {});
    payment.status = payment.status || 'Pending';
    payment.amount = Number(payment.amount) > 0 ? Number(payment.amount) : imdFee();
    payment.simulatorReference = payment.simulatorReference || demoIMDReference(a);
    const transaction = state.mockTransactions.find(tx =>
      tx.applicationId === a.id &&
      tx.reference.toLowerCase() === payment.simulatorReference.toLowerCase()
    );
    if (!transaction) {
      state.mockTransactions.push({
        applicationId:a.id, reference:payment.simulatorReference, amount:payment.amount,
        status:'Settled', receivedAt:new Date().toISOString(), source:'Local prototype payment simulator'
      });
    } else if (transaction.status === 'Mismatch') {
      transaction.status = 'Settled';
      transaction.amount = payment.amount;
    }
    return payment;
  }
  function normalizePastDueLocalIMD(a) {
    const pastStages = ['credit','technical','legal','underwriting','operations','sanction','post-sanction','lms'];
    const pastStatuses = ['Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan'];
    if (
      managed(a) &&
      !a.serverPersisted &&
      (pastStages.includes(a.lifecycle?.stage) || pastStatuses.includes(a.status)) &&
      a.lifecycle?.imd?.status === 'Not Started'
    ) {
      a.lifecycle.imd.status = 'Pending';
      return true;
    }
    return false;
  }
  function localDateString(date = new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
  }
  function asOfDate() {
    return /^\d{4}-\d{2}-\d{2}$/.test(state.asOfDate || '') ? state.asOfDate : localDateString();
  }
  function addLedgerEntries(a, reference, type, entries) {
    const debit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const credit = entries.reduce((sum, entry) => sum + entry.credit, 0);
    if (debit !== credit || debit <= 0) throw new Error('Unbalanced lifecycle ledger posting for ' + a.id + '.');
    const now = new Date().toISOString();
    entries.forEach((entry, index) => state.ledger.unshift({
      id:'GL-' + Date.now() + '-' + index, applicationId:a.id,
      loanId:a.lifecycle.loanAccount?.id || '', date:now,
      account:entry.account, debit:entry.debit, credit:entry.credit,
      reference, type:type + (isDemoLifecycleCase(a) ? ' · Synthetic Demo Only' : ''),
      demoOnly:isDemoLifecycleCase(a)
    }));
  }
  function applyServerIMDRecord(record) {
    const data = record.draft?.data || {};
    const applicationId = record._id || record.id;
    let a = applications.find(application => application.id === applicationId);
    if (!a) {
      a = {
        id:applicationId, customer:record.customer, mobile:record.mobile,
        product:record.product, amount:record.amount, branch:record.branch,
        status:record.status, stage:1, score:0, docs:0,
        created:record.createdAt || '', owner:'BDM', repayment:'—'
      };
      applications.unshift(a);
    }
    Object.assign(a, {
      id:applicationId,
      customer:record.customer || [data.firstName,data.lastName].filter(Boolean).join(' '),
      mobile:record.mobile || data.mobile || '',
      altMobile:data.altMobile || '',
      email:data.email || '',
      pan:data.pan || '',
      aadhaar:data.aadhaar || '',
      product:record.product,
      amount:record.amount,
      branch:record.branch || '',
      status:record.status,
      lifecycleManaged:true,
      serverPersisted:true,
      serverVersion:record.__v,
      leadId:record.leadId,
      customerId:record.customerId,
      serverDraft:record.draft
    });
    a.lifecycle = {
      ...(a.lifecycle || {}),
      stage:record.status === 'IMD Pending' ? 'imd' : 'credit',
      leadId:record.leadId || a.lifecycle?.leadId || '',
      customerId:record.customerId || a.lifecycle?.customerId || '',
      imd:{
        ...(a.lifecycle?.imd || {}),
        ...(record.imd || {}),
        status:record.imd?.status || 'Pending',
        amount:record.imd?.amount || imdFee(),
        simulatorReference:record.imd?.simulatorReference || demoIMDReference(a)
      }
    };
    a.workflow = {
      ...(a.workflow || {}),
      stage:record.status,
      ownerRole:record.workflowOwnerRole || 'BDM'
    };
    ensureDemoIMDTransaction(a);
    return a;
  }
  function renderIMD(id) {
    if (!id) return renderIMDQueue();
    const a = caseFor(id);
    const imdWorkStatuses = ['IMD Pending','Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan'];
    if (!a || (!['imd','credit','technical','legal','underwriting','operations','sanction','post-sanction','lms'].includes(a.lifecycle?.stage) && !imdWorkStatuses.includes(a.status))) return denied('Application stage is unavailable.');
    if (normalizePastDueLocalIMD(a)) persist();
    const lead = linkedCRMLead(a);
    if (lead && syncCRMApplicant(a, lead)) persist();
    const p = ensureDemoIMDTransaction(a);
    const pastImdStage = a.lifecycle.stage !== 'imd';
    const serverStageMismatch = a.serverPersisted && pastImdStage && p.status !== 'Verified';
    const canSubmit = currentUser.role === 'BDM' && !serverStageMismatch && ['Pending','Mismatch'].includes(p.status);
    const canVerify = currentUser.role === 'BDM' && !serverStageMismatch && p.status === 'Submitted';
    const canSendToCredit = currentUser.role === 'BDM' && p.status === 'Verified' && a.lifecycle.stage === 'imd';
    setPage('IMD & BSA', 'Origination / IMD');
    $('#content').innerHTML = '<div class="page-head"><div><h2>IMD & BSA Verification</h2><p>' + esc(a.id) + ' · ' + esc(a.customer) + ' · ' + esc(a.product) + '</p></div><span class="badge ' + (p.status === 'Verified' ? 'green' : 'amber') + '">' + esc(p.status) + '</span></div>' +
      '<section class="workflow-card"><div class="verification-grid"><div class="verification-card"><span>Customer</span><b>' + esc(a.customer) + '</b></div><div class="verification-card"><span>Loan amount</span><b>' + money(a.amount) + '</b></div><div class="verification-card"><span>IMD fee</span><b>' + money(p.amount || imdFee()) + '</b></div><div class="verification-card"><span>Transaction reference</span><b>' + esc(p.reference || 'Not submitted') + '</b></div><div class="verification-card"><span>Status</span><b>' + esc(p.status) + '</b></div><div class="verification-card"><span>Customer profile</span><b>' + esc(a.lifecycle.customerId || 'Linked') + '</b></div></div>' +
      (canSubmit ? '<div class="notice warn">Demo verification reference: <b>' + esc(p.simulatorReference) + '</b> · Amount: <b>' + money(p.amount) + '</b>. This is a local simulator reference, not a real receipt.</div><label>Transaction reference<input id="imdReference" maxlength="32" autocomplete="off" placeholder="Enter payment reference" value="' + esc(p.status === 'Mismatch' ? p.reference : '') + '"></label><label>Received amount (₹)<input id="imdAmount" type="number" min="1" step="1" placeholder="Enter received amount" value="' + esc(p.status === 'Mismatch' ? p.submittedAmount : '') + '"></label><button class="ghost-btn" onclick="nfUseDemoIMDReference(\'' + esc(id) + '\')">Use demo reference</button> <button class="primary-btn" onclick="nfSubmitIMD(\'' + esc(id) + '\')">' + (p.status === 'Mismatch' ? 'Submit corrected reference' : 'Submit payment reference') + '</button>' : '') +
      (canVerify ? '<button class="primary-btn" style="margin-left:8px" onclick="nfVerifyIMD(\'' + esc(id) + '\')">Verify transaction</button>' : '') +
      (p.status === 'Mismatch' ? '<div class="notice danger">The submitted reference or amount did not match the local demo transaction. Use the displayed demo reference, or correct the details and verify again.</div>' : '') +
      (canSendToCredit ? '<div class="notice success">IMD & BSA verification is complete. Send this application to the credit queue when ready.</div><button class="primary-btn" onclick="nfSendToCredit(\'' + esc(id) + '\')">Send to Credit →</button>' : '') +
      (serverStageMismatch ? '<div class="notice danger">This server-backed application has already moved past the IMD stage, but its IMD status is not Verified. This screen cannot safely change a later-stage server record. Ask an administrator to reconcile the application status.</div>' : '') +
      '<div class="action-row"><button class="ghost-btn" onclick="navTo(\'case\',\'' + esc(id) + '\')">Open application</button>' + (currentUser.role === 'CEO' || currentUser.role === 'System Admin' ? '<button class="ghost-btn" onclick="navTo(\'imdConfig\')">Configure IMD fee</button>' : '') + '</div></section>';
  }
  let serverIMDQueueLoading = false;
  let serverIMDQueueLoaded = false;
  let serverIMDQueueIds = new Set();
  function refreshServerIMDQueue() {
    if (serverIMDQueueLoading || !['BDM','CEO','System Admin'].includes(currentUser.role) || typeof window.nfWorkflowApi !== 'function') return;
    serverIMDQueueLoading = true;
    window.nfWorkflowApi('/applications/imd-queue').then(records => {
      if (!Array.isArray(records)) throw new Error('The server returned an invalid IMD queue response.');
      serverIMDQueueIds = new Set(records.map(record => record._id || record.id));
      serverIMDQueueLoaded = true;
      records.forEach(applyServerIMDRecord);
      persist();
      const content = $('#content');
      if (content?.querySelector('.page-head h2')?.textContent === 'IMD & BSA Verification' && content.querySelector('table')) renderIMDQueue(false);
    }).catch(error => {
      showToast('Could not load the server IMD queue: ' + (error.message || 'retry after reconnecting.'));
    }).finally(() => { serverIMDQueueLoading = false; });
  }
  function renderIMDQueue(refresh = true) {
    const recoverableStages = ['credit','technical','legal','underwriting','operations','sanction'];
    const recoverableStatuses = ['Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan'];
    const normalizedLocalRecords = applications.filter(a => normalizePastDueLocalIMD(a));
    if (normalizedLocalRecords.length) persist();
    const queue = applications.filter(a => {
      const stage = a.lifecycle?.stage;
      const pastImdStage = recoverableStages.includes(stage) || recoverableStatuses.includes(a.status);
      const isImdWork = stage === 'imd' || pastImdStage;
      const presentInServerQueue = stage !== 'imd' || !a.serverPersisted || !serverIMDQueueLoaded || serverIMDQueueIds.has(a.id);
      return managed(a) && isImdWork && presentInServerQueue &&
        (['Pending','Mismatch','Submitted'].includes(a.lifecycle?.imd?.status || 'Pending') ||
          (stage === 'imd' && a.lifecycle?.imd?.status === 'Verified')) &&
        (stage === 'imd' ? currentUser.role !== 'BDM' || a.workflow?.ownerRole === 'BDM' : true);
    });
    const pending = queue.filter(a => ['Pending','Mismatch'].includes(a.lifecycle.imd?.status || 'Pending')).length;
    const submitted = queue.filter(a => a.lifecycle.imd?.status === 'Submitted').length;
    const verified = queue.filter(a => a.lifecycle.imd?.status === 'Verified').length;
    setPage('IMD & BSA', 'Origination / IMD');
    $('#content').innerHTML = '<div class="page-head"><div><h2>IMD & BSA Verification</h2><p>Applications assigned to BDM for IMD reference submission and transaction verification. Open a case to continue its demo workflow.</p></div></div>' +
      '<div class="kd-kpis"><div class="workflow-card"><span>Awaiting reference</span><b>' + pending + '</b></div><div class="workflow-card"><span>Awaiting verification</span><b>' + submitted + '</b></div><div class="workflow-card"><span>Verified · Awaiting credit</span><b>' + verified + '</b></div></div>' +
      '<section class="workflow-card"><div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>Product</th><th>Branch</th><th>IMD fee</th><th>Reference</th><th>Status</th><th></th></tr></thead><tbody>' +
      (queue.length ? queue.map(a => {
        const payment = ensureDemoIMDTransaction(a);
        const serverStageMismatch = a.serverPersisted && a.lifecycle.stage !== 'imd' && payment.status !== 'Verified';
        const action = serverStageMismatch ? 'Review mismatch' : payment.status === 'Verified' ? 'Send to Credit' : payment.status === 'Submitted' ? 'Verify reference' : payment.status === 'Mismatch' ? 'Correct reference' : 'Submit reference';
        const stageLabel = a.lifecycle.stage === 'imd' ? '' : ' · Past-due gate';
        return '<tr><td><b>' + esc(a.id) + '</b></td><td>' + esc(a.customer) + '</td><td>' + esc(a.product) + '</td><td>' + esc(a.branch || '—') + '</td><td>' + money(payment.amount || imdFee()) + '</td><td>' + esc(payment.reference || 'Not submitted') + '</td><td>' + esc(payment.status + stageLabel) + '</td><td><button class="more-btn" onclick="nfOpenLifecycleIMD(\'' + esc(a.id) + '\')">' + action + '</button></td></tr>';
      }).join('') : '<tr><td colspan="8" class="muted">No IMD references are currently awaiting BDM action.</td></tr>') +
      '</tbody></table></div><p class="muted">Demo only: references are matched against the local payment simulator, not a live payment provider.</p></section>';
    if (refresh) refreshServerIMDQueue();
  }
  window.nfUseDemoIMDReference = function(id) {
    const a = caseFor(id), payment = a && ensureDemoIMDTransaction(a);
    if (currentUser.role !== 'BDM' || !payment || !['Pending','Mismatch'].includes(payment.status)) return denied('Only the assigned BDM can use the demo reference for a pending IMD case.');
    $('#imdReference').value = payment.simulatorReference;
    $('#imdAmount').value = String(payment.amount);
  };
  window.nfSubmitIMD = async function(id) {
    const a = caseFor(id), payment = a?.lifecycle.imd, ref = $('#imdReference')?.value.trim(), amount = Number($('#imdAmount')?.value);
    if (currentUser.role !== 'BDM' || !payment || !['Pending','Mismatch'].includes(payment.status)) return denied('Only the BDM can submit a pending IMD reference.');
    if (!/^[A-Za-z0-9-]{6,32}$/.test(ref || '')) return denied('Enter a valid 6–32 character payment reference.');
    if (!Number.isSafeInteger(amount) || amount <= 0) return denied('Enter the amount received from the customer.');
    if (applications.some(x => x.id !== id && x.lifecycleManaged && x.lifecycle?.imd?.reference?.toLowerCase() === ref.toLowerCase())) return denied('That payment reference is already linked to another application.');
    if (a.serverPersisted && typeof window.nfWorkflowApi === 'function') {
      try {
        const saved = await window.nfWorkflowApi('/applications/' + encodeURIComponent(id) + '/imd-reference','POST',{reference:ref,amount});
        applyServerIMDRecord(saved);
        persist();
        renderIMD(id);
      } catch (error) {
        denied('Could not submit the IMD reference: ' + (error.message || 'server request failed.'));
      }
      return;
    }
    Object.assign(payment, { status:'Submitted', reference:ref, submittedAmount:amount, submittedBy:currentUser.role, submittedByUser:currentUser.name, submittedAt:new Date().toISOString() });
    audit(id, 'IMD Reference Submitted', ref + ' · ' + money(amount));
    renderIMD(id);
  };
  window.nfVerifyIMD = async function(id) {
    const a = caseFor(id), payment = a?.lifecycle.imd;
    if (currentUser.role !== 'BDM' || !payment || payment.status !== 'Submitted') return denied('Only the BDM can verify a submitted IMD reference.');
    if (a.serverPersisted && typeof window.nfWorkflowApi === 'function') {
      try {
        const saved = await window.nfWorkflowApi('/applications/' + encodeURIComponent(id) + '/verify-imd','POST',{});
        applyServerIMDRecord(saved);
        if (saved.imd?.status === 'Verified' && !state.ledger.some(entry => entry.applicationId === id && entry.type === 'IMD Fee')) {
          addLedgerEntries(a, saved.imd.reference, 'IMD Fee', [
            { account:'IMD Collection Clearing', debit:saved.imd.amount, credit:0 },
            { account:'IMD Fee Holding', debit:0, credit:saved.imd.amount }
          ]);
        }
        persist();
        renderIMD(id);
      } catch (error) {
        denied('Could not verify the IMD reference: ' + (error.message || 'server request failed.'));
      }
      return;
    }
    const matched = state.mockTransactions.find(tx =>
      tx.applicationId === id && tx.status === 'Settled' &&
      tx.reference.toLowerCase() === payment.reference.toLowerCase() &&
      tx.amount === payment.submittedAmount && tx.amount === payment.amount
    );
    if (!matched) {
      payment.status = 'Mismatch';
      payment.verificationAttempt = { by:currentUser.name, at:new Date().toISOString(), reference:payment.reference, amount:payment.submittedAmount };
      audit(id, 'IMD Verification Mismatch', 'No settled simulator transaction matched the submitted reference and exact fee');
      return renderIMD(id);
    }
    payment.status = 'Verified';
    payment.verifiedBy = currentUser.name;
    payment.verifiedByRole = currentUser.role;
    payment.verifiedAt = new Date().toISOString();
    payment.transactionId = matched.reference;
    matched.status = 'Reconciled';
    addLedgerEntries(a, matched.reference, 'IMD Fee', [
      { account:'IMD Collection Clearing', debit:matched.amount, credit:0 },
      { account:'IMD Fee Holding', debit:0, credit:matched.amount }
    ]);
    audit(id, 'IMD Transaction Verified', payment.reference);
    persist();
    renderIMD(id);
  };
  window.nfSendToCredit = async function(id) {
    const a = caseFor(id), payment = a?.lifecycle.imd;
    if (currentUser.role !== 'BDM' || !a || a.lifecycle.stage !== 'imd' || payment?.status !== 'Verified') return denied('Verify the IMD reference before sending this application to Credit.');
    if (a.serverPersisted && typeof window.nfWorkflowApi === 'function') {
      try {
        const saved = await window.nfWorkflowApi('/applications/' + encodeURIComponent(id) + '/send-to-credit','POST',{});
        applyServerIMDRecord(saved);
        a.lifecycle.parallel = { credit:'Pending', technical:'Pending', legal:'Pending' };
        persist();
        navTo('case', id);
        showToast('Application sent to the Credit queue.');
      } catch (error) {
        denied('Could not send the application to Credit: ' + (error.message || 'server request failed.'));
      }
      return;
    }
    a.lifecycle.stage = 'credit';
    a.status = 'Credit Review';
    a.workflow.stage = 'Credit Review';
    a.workflow.ownerRole = 'BCM';
    a.lifecycle.parallel = { credit:'Pending', technical:'Pending', legal:'Pending' };
    audit(id, 'Application Sent to Credit', 'IMD & BSA reference verified by BDM');
    navTo('case', id);
    showToast('Application sent to the Credit queue.');
  };
  window.nfReturnToLifecycleIMD = async function(id) {
    const a = caseFor(id);
    const recoverableStatuses = ['Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review'];
    if (currentUser.role !== 'BDM' || !a) return denied('Only BDM can return this application to IMD & BSA.');
    if (imdGateSatisfied(a)) return denied('This application has already passed the IMD & BSA gate.');
    if (!recoverableStatuses.includes(a.status)) return denied('Only a pre-sanction application can return to BDM IMD & BSA.');
    if (a.lifecycle?.sanction?.accepted || v7Sanction[id]?.accepted) return denied('An accepted sanction cannot be returned to IMD & BSA.');
    if (!window.confirm('Return this pre-sanction case to BDM for IMD & BSA before Credit Review? Downstream workflow statuses will be reset to pending; existing case data and audit history will remain.')) return;
    const previousStatus = a.status;
    if (a.serverPersisted) {
      if (typeof window.nfWorkflowApi !== 'function') return denied('The server connection is required to safely return this application to BDM.');
      try {
        const saved = await window.nfWorkflowApi('/applications/' + encodeURIComponent(id) + '/return-to-imd','POST',{});
        applyServerIMDRecord(saved);
      } catch (error) {
        return denied('Could not return the application to BDM: ' + (error.message || 'server request failed.'));
      }
    }
    a.lifecycle = {
      ...(a.lifecycle || {}),
      stage:'imd',
      imd:{
        ...(a.lifecycle?.imd || {}),
        status:'Pending',
        amount:Number(a.lifecycle?.imd?.amount) > 0 ? a.lifecycle.imd.amount : imdFee(),
        simulatorReference:a.lifecycle?.imd?.simulatorReference || demoIMDReference(a),
        reference:'',
        submittedAmount:0,
        submittedBy:'',
        submittedByUser:'',
        verifiedBy:'',
        verifiedByRole:'',
        verifiedAt:''
      },
      parallel:{ credit:'Pending', technical:'Pending', legal:'Pending' }
    };
    a.status = 'IMD Pending';
    a.stage = 1;
    a.workflow = {
      ...(a.workflow || {}),
      stage:'IMD Pending',
      ownerRole:'BDM',
      creditCrossCheck:false,
      technicalStatus:'Pending',
      legalStatus:'Pending',
      doChecklist:'Pending',
      doChecklistDemoOnly:false,
      eSignStatus:'Pending',
      eSignDemoOnly:false
    };
    if (typeof v7UW !== 'undefined' && v7UW[id]) v7UW[id].status = 'Pending';
    ensureDemoIMDTransaction(a);
    audit(id, 'Returned to BDM · IMD & BSA Before Credit', 'Returned from ' + previousStatus + '; downstream review must be repeated after BDM verification');
    navTo('imd', id);
    showToast('Case returned to BDM. Complete IMD & BSA before Credit Review.');
  };
  function renderIMDConfig() {
    if (!may('imdConfig')) return denied();
    setPage('IMD Configuration', 'Administration / IMD');
    $('#content').innerHTML = '<div class="page-head"><div><h2>IMD & Servicing Configuration</h2><p>Browser-local prototype settings for newly completed LOS applications.</p></div></div><section class="workflow-card"><div class="field-grid three"><label>IMD fee (₹)<input id="lifecycleImdFee" type="number" min="1" step="1" value="' + esc(imdFee()) + '"></label><label>Overdue installment penalty (%)<input id="lifecyclePenaltyRate" type="number" min="0" max="100" step="0.1" value="' + esc(state.penaltyRatePct) + '"></label><label>Servicing as-of date<input id="lifecycleAsOfDate" type="date" value="' + esc(asOfDate()) + '"></label></div><button class="primary-btn" onclick="nfSaveIMDFee()">Save configuration</button><p class="muted">Existing cases retain their recorded IMD fee. The penalty rate applies to the unpaid installment amount after its due date. Advance the prototype as-of date to test due, overdue and penalty behavior.</p></section>';
  }
  window.nfSaveIMDFee = function() {
    if (!may('imdConfig')) return denied();
    const fee = Number($('#lifecycleImdFee')?.value);
    if (!Number.isSafeInteger(fee) || fee < 1 || fee > 1000000) return denied('Enter an IMD fee between ₹1 and ₹10,00,000.');
    const penaltyRatePct = Number($('#lifecyclePenaltyRate')?.value);
    if (!Number.isFinite(penaltyRatePct) || penaltyRatePct < 0 || penaltyRatePct > 100) return denied('Enter an overdue penalty percentage from 0 to 100.');
    const configuredDate = $('#lifecycleAsOfDate')?.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(configuredDate || '') || Number.isNaN(Date.parse(configuredDate))) return denied('Select a valid servicing as-of date.');
    state.fee = fee;
    state.penaltyRatePct = penaltyRatePct;
    state.asOfDate = configuredDate;
    persist();
    showToast('IMD fee saved.');
    renderIMDConfig();
  };

  function requireLifecycleRole(a, roles, action) {
    if (!managed(a)) return true;
    if (!roles.includes(currentUser.role)) { denied('Only ' + roles.join(' / ') + ' can ' + action + ' this application.'); return false; }
    return true;
  }
  function imdGateSatisfied(a) {
    const pastCreditReview = ['CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan'].includes(a?.status);
    return !managed(a) || a.lifecycle?.imd?.status === 'Verified' || pastCreditReview;
  }
  function requireVerifiedIMD(a, action) {
    if (imdGateSatisfied(a)) return true;
    denied('BDM must verify IMD & BSA before ' + action + '.');
    return false;
  }
  const baseTechnical = completeTechnical;
  completeTechnical = function(id) {
    const a = applications.find(x => x.id === id);
    if (!a || !requireLifecycleRole(a, ['Technical Verifier','Appraiser'], 'complete technical verification')) return;
    if (!requireVerifiedIMD(a, 'technical review')) return;
    const status = $('#techCondition')?.value === 'Adverse' ? 'Adverse' : 'Completed';
    baseTechnical.apply(this, arguments);
    if (managed(a)) {
      a.workflow.technicalStatus = status;
      a.lifecycle.parallel.technical = status;
      audit(id, 'Technical Verification ' + status, a.workflow.technicalReport);
    }
  };
  const baseLegal = completeLegal;
  completeLegal = function(id) {
    const a = applications.find(x => x.id === id);
    if (!a || !requireLifecycleRole(a, ['Legal Verifier'], 'complete legal vetting')) return;
    if (!requireVerifiedIMD(a, 'legal review')) return;
    const status = ['Adverse','Negative'].includes($('#legalTitle')?.value) || $('#legalOpinion')?.value === 'Negative' ? 'Negative' : 'Completed';
    baseLegal.apply(this, arguments);
    if (managed(a)) {
      a.workflow.legalStatus = status;
      a.lifecycle.parallel.legal = status;
      audit(id, 'Legal Vetting ' + status, a.workflow.legalReport);
    }
  };
  const baseAdvance = advanceCase;
  advanceCase = function(id) {
    const a = applications.find(x => x.id === id);
    if (!managed(a)) return baseAdvance.apply(this, arguments);
    if (
      ['Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan'].includes(a.status) &&
      !requireVerifiedIMD(a, 'Credit Review or any later workflow stage')
    ) return;
    if (a.status === 'Credit Review') {
      if (!requireLifecycleRole(a, ['BCM','ACM','Credit Head'], 'approve credit')) return;
      if (a.workflow.technicalStatus !== 'Completed' || a.workflow.legalStatus !== 'Completed') return denied('Credit, technical and legal reviews run in parallel. Complete all three positively before advancing.');
      a.lifecycle.parallel.credit = 'Approved';
      a.workflow.creditCrossCheck = true;
      a.status = 'CAM Allocation';
      a.stage = 2;
      a.workflow.ownerRole = 'BCM';
      audit(id, 'Credit Review Approved', 'Credit, technical and legal parallel checks cleared');
      renderCase(id);
      return;
    }
    if (a.status === 'CAM Allocation') {
      if (!requireLifecycleRole(a, ['BCM','ACM','Credit Head'], 'transfer CAM')) return;
      if (a.lifecycle.parallel.credit !== 'Approved' || a.workflow.technicalStatus !== 'Completed' || a.workflow.legalStatus !== 'Completed') return denied('All parallel reviews must be approved before CAM transfer.');
      baseAdvance.apply(this, arguments);
      a.workflow.ownerRole = 'BCM';
      audit(id, 'CAM Allocation Completed');
      return;
    }
    if (a.status === 'CAM Sheet') {
      if (!requireLifecycleRole(a, ['BCM','Credit Head'], 'submit the CAM sheet')) return;
      if (a.lifecycle.parallel.credit !== 'Approved' || a.workflow.technicalStatus !== 'Completed' || a.workflow.legalStatus !== 'Completed') return denied('CAM cannot be submitted with outstanding parallel reviews.');
      a.status = 'Underwriting';
      a.lifecycle.stage = 'underwriting';
      a.workflow.ownerRole = 'Underwriter';
      if (typeof v7UW !== 'undefined') v7UW[id].status = 'Pending';
      audit(id, 'CAM Sheet Submitted', 'Routed to Underwriting');
      renderCase(id);
      return;
    }
    return denied('This lifecycle stage can only be advanced by its assigned workbench.');
  };
  const baseUWDecision = uwDecision;
  uwDecision = function(id, status) {
    const a = applications.find(x => x.id === id);
    if (!managed(a)) return baseUWDecision.apply(this, arguments);
    if (!requireLifecycleRole(a, ['Underwriter','Credit Head'], 'record an underwriting decision')) return;
    if (!requireVerifiedIMD(a, 'underwriting')) return;
    if (status === 'Approved') {
      if (a.workflow.technicalStatus !== 'Completed' || a.workflow.legalStatus !== 'Completed') return denied('Complete Technical and Legal reviews before approving underwriting.');
      if (typeof v7RCU === 'undefined' || v7RCU[id]?.status !== 'Clear') return denied('RCU must be Clear before approving underwriting.');
    }
    baseUWDecision.apply(this, arguments);
    if (status === 'Approved') {
      a.lifecycle.parallel = { ...(a.lifecycle.parallel || {}), credit:'Approved' };
      a.workflow.creditCrossCheck = true;
      a.status = 'Operations Review';
      a.lifecycle.stage = 'operations';
      a.workflow.ownerRole = 'Disbursement Officer';
      audit(id, 'Underwriting Approved', 'Credit, technical and legal gates confirmed · routed to operations review');
    } else if (status === 'Rejected') {
      a.lifecycle.stage = 'rejected';
      audit(id, 'Underwriting Rejected');
    } else {
      a.status = 'Underwriting';
      a.lifecycle.stage = 'underwriting';
      audit(id, 'Underwriting Query Raised');
    }
  };
  const baseOps = renderOperations;
  renderOperations = function() {
    baseOps.apply(this, arguments);
    const managedCases = applications.filter(managed);
    $('#content').querySelectorAll('tbody tr').forEach(row => {
      if (managedCases.some(a => row.textContent.includes(a.id))) row.remove();
    });
    const rows = applications.filter(a => managed(a) && ['Operations Review','Sanction Review','Sanctioned'].includes(a.status));
    if (!rows.length) return;
    $('#content').insertAdjacentHTML('beforeend', '<section class="workflow-card" style="margin-top:14px"><div class="workflow-title"><div><h3>Connected lifecycle · Operations & disbursement</h3><p>Branch verification and independent Central Operations disbursement.</p></div></div><div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>Status</th><th>Checklist / eSign</th><th></th></tr></thead><tbody>' + rows.map(a => {
      const isBranch = a.status === 'Operations Review';
      const action = isBranch ? currentUser.role === 'Disbursement Officer' ? '<button class="more-btn" onclick="openDOChecklist(\'' + esc(a.id) + '\')">Open checklist</button>' : 'Assigned to Disbursement Officer' :
        a.status === 'Sanction Review' ? 'Awaiting Credit Head sanction' :
        a.workflow.eSignStatus !== 'Completed' ? '<button class="more-btn" onclick="navTo(\'postSanction\')">Complete eSign first</button>' :
        currentUser.role === 'Central Operations' ? '<button class="more-btn" onclick="openCentralOps(\'' + esc(a.id) + '\')">Open Central Ops</button>' : 'Awaiting Central Operations';
      return '<tr><td>' + esc(a.id) + (isDemoLifecycleCase(a) ? ' <span class="badge purple">Demo only</span>' : '') + '</td><td>' + esc(a.customer) + '</td><td>' + esc(a.status) + (isDemoLifecycleCase(a) ? ' · SYNTHETIC DEMO ONLY' : '') + '</td><td>' + esc(isBranch ? a.workflow.doChecklist + (a.workflow.doChecklistDemoOnly ? ' · DEMO ONLY' : '') : a.workflow.eSignStatus + (a.workflow.eSignDemoOnly ? ' · DEMO ONLY' : '')) + '</td><td>' + action + '</td></tr>';
    }).join('') + '</tbody></table></div></section>');
  };
  const baseOpenDO = openDOChecklist;
  openDOChecklist = function(id) {
    const a = applications.find(x => x.id === id);
    if (managed(a) && (!requireLifecycleRole(a, ['Disbursement Officer'], 'open the branch operations checklist') || a.status !== 'Operations Review')) return;
    return baseOpenDO.apply(this, arguments);
  };
  const baseSubmitDO = submitDOChecklist;
  submitDOChecklist = function(id, forceGood, sourceButton) {
    const a = applications.find(x => x.id === id);
    if (!managed(a)) return baseSubmitDO.apply(this, arguments);
    if (!requireLifecycleRole(a, ['Disbursement Officer'], 'complete branch operations')) return;
    if (!requireVerifiedIMD(a, 'branch operations')) return;
    if (
      a.status === 'Operations Review' &&
      a.workflow.ownerRole === 'Disbursement Officer' &&
      a.workflow.technicalStatus === 'Completed' &&
      a.workflow.legalStatus === 'Completed' &&
      typeof v7RCU !== 'undefined' &&
      v7RCU[id]?.status === 'Clear' &&
      a.lifecycle.parallel?.credit !== 'Approved'
    ) {
      a.lifecycle.parallel = { ...(a.lifecycle.parallel || {}), credit:'Approved' };
      a.workflow.creditCrossCheck = true;
      audit(id, 'Credit Gate Reconciled', 'Approved Underwriting case entered Operations Review; Technical, Legal and RCU gates confirmed');
    }
    if (a.status !== 'Operations Review' || a.lifecycle.parallel?.credit !== 'Approved' || a.workflow.technicalStatus !== 'Completed' || a.workflow.legalStatus !== 'Completed') return denied('Branch operations is locked until underwriting and all verification gates pass.');
    if (!forceGood) return baseSubmitDO.call(this, id, false);
    const checklistModal = sourceButton?.closest('#modalRoot .modal') || document.querySelector('#modalRoot .modal');
    const checklistItems = checklistModal ? [...checklistModal.querySelectorAll('.do-item')] : [];
    if (!checklistItems.length || !checklistItems.every(item => item.checked)) return denied('Complete every branch checklist item before submitting.');
    const remarksField = $('#doRemarks');
    if (isDemoLifecycleCase(a) && remarksField) {
      if (!remarksField.value.includes('SYNTHETIC DEMO ONLY')) remarksField.value = 'SYNTHETIC DEMO ONLY — no supporting documents or external verifications were reviewed.\n' + remarksField.value;
      a.workflow.doChecklistRemarks = remarksField.value;
    }
    baseSubmitDO.call(this, id, true);
    if (a.workflow.doChecklist === 'Completed') {
      if (isDemoLifecycleCase(a)) a.workflow.doChecklistDemoOnly = true;
      a.status = 'Sanction Review';
      a.lifecycle.stage = 'sanction';
      a.workflow.ownerRole = 'Credit Head';
      audit(id, 'Branch Operations Checklist Completed' + (isDemoLifecycleCase(a) ? ' · Synthetic Demo Only' : ''), (isDemoLifecycleCase(a) ? 'SYNTHETIC DEMO ONLY — checklist items are placeholders, not verified evidence. ' : '') + 'Ready for sanction terms');
      setTimeout(() => navTo('operations'), 0);
    }
  };
  const baseOpenPostSanction = openPostSanction;
  openPostSanction = function(id) {
    const a = applications.find(x => x.id === id);
    if (managed(a) && (a.status !== 'Sanctioned' || !(a.lifecycle?.sanction?.accepted || v7Sanction[id]?.accepted) || !requireLifecycleRole(a, ['Disbursement Officer','Central Operations'], 'open post-sanction eSign'))) return;
    const result = baseOpenPostSanction.apply(this, arguments);
    if (a && ['Disbursement Officer','Central Operations'].includes(currentUser.role) && a.status === 'Sanctioned' && a.workflow.doChecklist === 'Completed' && a.workflow.eSignStatus !== 'Completed' && isDemoLifecycleCase(a)) {
      const body = document.querySelector('#modalRoot .modal-body');
      body?.insertAdjacentHTML('beforeend', '<div class="notice info" style="margin-top:12px"><b>Demo-only eSign</b> — No real customer signature or electronic execution will occur.</div><label class="ops-check" style="margin-top:10px"><input id="demoESignConfirmation" type="checkbox"> Treat eSign as complete for this demo</label>');
      body?.querySelector('#demoESignConfirmation')?.addEventListener('change', event => {
        window.nfCompleteDemoESign(id, event.currentTarget.checked);
      });
    }
    return result;
  };
  const baseOpenSanction = openSanction;
  openSanction = function(id) {
    const a = applications.find(x => x.id === id);
    if (managed(a) && a.status !== 'Sanction Review') return denied('This case is not currently in Sanction Review. Complete the required workflow handoffs first.');
    if (managed(a) && !requireLifecycleRole(a, ['Credit Head'], 'prepare sanction terms')) return;
    return baseOpenSanction.apply(this, arguments);
  };
  const baseRenderSanction = renderSanction;
  renderSanction = function() {
    baseRenderSanction.apply(this, arguments);
    Array.from(document.querySelectorAll('#content tbody tr')).forEach(row => {
      const id = row.querySelector('td b')?.textContent?.trim();
      const a = applications.find(application => application.id === id);
      if (!managed(a)) return;
      const action = row.querySelector('button[onclick*="openSanction"]');
      if (!action) return;
      if (a.status !== 'Sanction Review') {
        action.outerHTML = '<span class="badge amber" title="Sanction terms are available only after the case reaches Sanction Review">' + esc(a.status || 'Not in Sanction Review') + '</span>';
      }
    });
  };
  const baseGenerateSanction = generateSanction;
  generateSanction = function(id) {
    const a = applications.find(x => x.id === id);
    if (!managed(a)) return baseGenerateSanction.apply(this, arguments);
    if (a.status !== 'Sanction Review' || !requireLifecycleRole(a, ['Credit Head'], 'issue sanction')) return;
    if (a.workflow.doChecklist !== 'Completed' || !requireVerifiedIMD(a, 'sanction')) return;
    baseGenerateSanction.apply(this, arguments);
    const terms = v7Sanction[id];
    if (terms?.accepted && Number.isSafeInteger(Number(terms.amount)) && Number(terms.amount) > 0) {
      a.lifecycle.sanction = {
        accepted:true, amount:Number(terms.amount), roi:Number(terms.roi),
        tenure:Number(terms.tenure), version:Number(terms.version),
        validity:terms.validity, repayment:terms.repayment,
        processingFeePct:Number(terms.processingFeePct || 0),
        conditionsPrecedent:terms.conditionsPrecedent || '',
        conditionsSubsequent:terms.conditionsSubsequent || '',
        demoOnly:terms.demoOnly === true,
        acceptanceMode:terms.acceptanceMode || '',
        acceptedAt:new Date().toISOString()
      };
      a.sanctionedAmount = Number(terms.amount);
      a.lifecycle.loanTerms = {
        ...(a.lifecycle.loanTerms || {}),
        amount:Number(terms.amount), roi:Number(terms.roi), termMonths:Number(terms.tenure)
      };
    }
    a.status = 'Sanctioned';
    a.lifecycle.stage = 'post-sanction';
    a.workflow.ownerRole = 'Disbursement Officer';
    audit(id, 'Sanction Accepted', 'v' + (terms?.version || 1) + ' ' + money(terms?.amount || a.lifecycle.sanction?.amount || a.amount) + (terms?.demoOnly === true ? ' · SYNTHETIC DEMO ONLY — no real offer or customer acceptance' : '') + ' · post-sanction checks required');
  };
  const baseESign = completeESign;
  completeESign = function(id) {
    const a = applications.find(x => x.id === id);
    if (!managed(a)) return baseESign.apply(this, arguments);
    if (managed(a) && !requireLifecycleRole(a, ['Disbursement Officer','Central Operations'], 'complete eSign')) return;
    if (a.status !== 'Sanctioned' || !(a.lifecycle?.sanction?.accepted || v7Sanction[id]?.accepted) || a.workflow.doChecklist !== 'Completed') return denied('Accepted sanction and completed operations checklist are required for eSign.');
    baseESign.apply(this, arguments);
    if (a.workflow.eSignStatus !== 'Completed') return;
    if (isDemoLifecycleCase(a)) {
      a.workflow.eSignDemoOnly = true;
      audit(id, 'eSign Completed · Synthetic Demo Only', 'SYNTHETIC DEMO ONLY — no real customer signature or electronic execution occurred.');
    } else audit(id, 'eSign Completed');
  };
  const baseOpenCentral = openCentralOps;
  openCentralOps = function(id) {
    const a = applications.find(x => x.id === id);
    if (managed(a) && (currentUser.role !== 'Central Operations' || a.status !== 'Sanctioned' || a.workflow.doChecklist !== 'Completed')) return denied('Only Central Operations can open disbursement after branch operations and sanction.');
    baseOpenCentral.apply(this, arguments);
    if (managed(a) && a.workflow.eSignStatus !== 'Completed') {
      const footer = document.querySelector('#modalRoot .modal-footer');
      footer?.querySelectorAll('button[onclick*="finalDisburse"]').forEach(button => button.remove());
      footer?.insertAdjacentHTML('afterbegin', '<span class="notice warn">Complete eSign before disbursement.</span>');
    }
  };
  window.nfCompleteDemoESign = function(id, checked) {
    const a = applications.find(x => x.id === id);
    if (!checked) return;
    if (!a || !requireLifecycleRole(a, ['Disbursement Officer','Central Operations'], 'complete demo eSign')) return;
    if (a.status !== 'Sanctioned' || a.workflow.doChecklist !== 'Completed' || a.workflow.eSignStatus === 'Completed') return denied('Sanctioned case, completed DO checklist and pending eSign are required for demo eSign.');
    if (managed(a) && !(a.lifecycle?.sanction?.accepted || v7Sanction[id]?.accepted)) return denied('An accepted sanction is required for demo eSign.');
    a.workflow.eSignStatus = 'Completed';
    a.workflow.eSignDemoOnly = true;
    a.workflow.eSignDemoCompletedAt = new Date().toISOString();
    audit(id, 'eSign Completed · Synthetic Demo Only', 'SYNTHETIC DEMO ONLY — Central Operations marked eSign complete for demonstration; no real customer signature or electronic execution occurred.');
    openPostSanction(id);
  };
  const baseFinalDisburse = finalDisburse;
  finalDisburse = function(id) {
    const a = applications.find(x => x.id === id);
    if (!managed(a)) return baseFinalDisburse.apply(this, arguments);
    if (!requireLifecycleRole(a, ['Central Operations'], 'disburse')) return;
    if (a.status !== 'Sanctioned' || !(a.lifecycle?.sanction?.accepted || v7Sanction[id]?.accepted) || a.workflow.eSignStatus !== 'Completed' || a.workflow.doChecklist !== 'Completed' || a.lifecycle.imd?.status !== 'Verified') return denied('Sanction, verified IMD, eSign and operations checks must all be complete before disbursement.');
    baseFinalDisburse.apply(this, arguments);
    if (isDemoLifecycleCase(a)) {
      a.workflow.centralOpsDemoOnly = true;
      a.lifecycle.disbursementDemoOnly = true;
    }
    a.workflow.stage = a.status;
    a.lifecycle.stage = 'lms';
    const sanctionedAmount = Number(a.lifecycle.sanction?.amount || a.amount);
    addLedgerEntries(a, a.workflow.dealId || a.id, 'Loan Disbursement', [
      { account:'Loan Receivable', debit:sanctionedAmount, credit:0 },
      { account:'Bank Disbursement Clearing', debit:0, credit:sanctionedAmount }
    ]);
    audit(id, 'Loan Disbursed' + (isDemoLifecycleCase(a) ? ' · Synthetic Demo Only' : ''), (isDemoLifecycleCase(a) ? 'SYNTHETIC DEMO ONLY — no funds moved. ' : '') + a.workflow.dealId);
  };
  const basePushLMS = pushToLMS;
  pushToLMS = function(id) {
    const a = applications.find(x => x.id === id);
    if (managed(a) && (!requireLifecycleRole(a, ['Central Operations'], 'create the LMS account') || a.status !== 'Active Loan' || a.workflow.centralOps !== 'Disbursed' || a.workflow.eSignStatus !== 'Completed')) return;
    basePushLMS.apply(this, arguments);
    if (!managed(a)) return;
    a.workflow.stage = a.status;
    if (isDemoLifecycleCase(a)) a.workflow.lmsStatusDemoOnly = true;
    const sanctionedAmount = Number(a.lifecycle.sanction?.amount || a.amount);
    const n = Math.min(120, Math.max(1, Number(a.lifecycle.loanTerms?.termMonths || products[a.product]?.tenure || 12)));
    const monthlyRate = Number(a.lifecycle.loanTerms?.roi || products[a.product]?.rate || 14) / 1200;
    const payment = Math.round(sanctionedAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -n)));
    let balance = sanctionedAmount;
    a.lifecycle.schedule = Array.from({ length:n }, (_, i) => {
      const interest = Math.round(balance * monthlyRate);
      const principal = i === n - 1 ? balance : Math.min(balance, payment - interest);
      balance = Math.max(0, balance - principal);
      const due = new Date(asOfDate() + 'T12:00:00');
      due.setDate(1);
      due.setMonth(due.getMonth() + i + 1);
      due.setDate(Math.min(5, new Date(due.getFullYear(), due.getMonth() + 1, 0).getDate()));
      const dueDate = localDateString(due);
      return { installment:i + 1, dueDate, amount:principal + interest, principal, interest, status:'Upcoming', paid:0, principalPaid:0, interestPaid:0, penaltyPaid:0, demoOnly:isDemoLifecycleCase(a) };
    });
    a.lifecycle.loanAccount = { id:'LAN-' + a.id, openedAt:new Date().toISOString(), openingPrincipal:sanctionedAmount, outstanding:sanctionedAmount, demoOnly:isDemoLifecycleCase(a) };
    a.lifecycle.stage = 'active';
    audit(id, 'LMS Loan Account Created' + (isDemoLifecycleCase(a) ? ' · Synthetic Demo Only' : ''), a.lifecycle.loanAccount.id + ' · ' + a.lifecycle.schedule.length + ' installments' + (isDemoLifecycleCase(a) ? ' · SYNTHETIC DEMO ONLY — not a real servicing account' : ''));
  };
  const baseRenderRepayments = renderRepayments;
  renderRepayments = function() {
    baseRenderRepayments.apply(this, arguments);
    const activeLoans = applications.filter(a => managed(a) && a.lifecycle?.loanAccount);
    const loanRows = activeLoans.map(a => {
      const nextInstallment = a.lifecycle.schedule?.find(item => item.status !== 'Paid');
      const amount = Number(a.lifecycle.sanction?.amount || a.lifecycle.loanAccount?.openingPrincipal || a.amount);
      return '<tr><td><b>' + esc(a.id) + '</b>' + (isDemoLifecycleCase(a) ? ' <span class="badge purple">Demo only</span>' : '') + '</td><td>' + esc(a.customer) + '</td><td>' + esc(a.product) + '</td><td>' + money(amount) + '</td><td>' + money(a.lifecycle.loanAccount?.outstanding || 0) + '</td><td>' + (nextInstallment ? esc(nextInstallment.dueDate) + ' · ' + money(Math.max(0, nextInstallment.amount - nextInstallment.paid)) : 'No unpaid installments') + '</td><td>' + esc(a.lifecycle.loanAccount?.status || 'Active') + (a.lifecycle.loanAccount?.demoOnly ? ' · DEMO ONLY' : '') + '</td><td><button class="more-btn" onclick="nfOpenRepaymentSchedule(\'' + esc(a.id) + '\')">Open Account</button></td></tr>';
    }).join('');
    $('#content').insertAdjacentHTML('beforeend', '<section class="workflow-card" style="margin-top:14px"><div class="workflow-title"><div><h3>Loan Accounts</h3><p>Repayment schedules for loans already disbursed and pushed to LMS.</p></div><button class="ghost-btn" onclick="navTo(\'lmsReports\')">LMS Reports</button></div><div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>Product</th><th>Sanction Amount</th><th>Outstanding</th><th>Next Installment</th><th>Status</th><th></th></tr></thead><tbody>' + (loanRows || '<tr><td colspan="8">No connected demo loan accounts yet.</td></tr>') + '</tbody></table></div></section><div class="action-row" style="margin:14px 0"><button class="primary-btn" onclick="navTo(\'loanAccounts\')">Open Loan Accounts & Repayments →</button><button class="ghost-btn" onclick="navTo(\'generalLedger\')">General Ledger</button><button class="ghost-btn" onclick="navTo(\'imdConfig\')">IMD Configuration</button></div>');
  };

  function penaltyFor(installment) {
    if (installment.dueDate < asOfDate() && installment.penaltyAssessed === undefined) {
      installment.penaltyAssessed = Math.round(Math.max(0, installment.amount - installment.paid) * Number(state.penaltyRatePct || 0) / 100);
      installment.penaltyAssessedAt = new Date().toISOString();
      persist();
    }
    return Number(installment.penaltyAssessed || 0);
  }

  window.nfRecordRepayment = function(id) {
    const a = caseFor(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'record repayment')) return;
    const due = a.lifecycle.schedule.find(x => x.status !== 'Paid');
    if (!due) return denied('No unpaid installments remain.');
    const form = document.querySelector('[data-repayment-form="' + CSS.escape(id) + '"]');
    const reference = form?.querySelector('[data-repayment-reference]')?.value.trim();
    const penalty = penaltyFor(due);
    const outstanding = due.amount - due.paid + Math.max(0, penalty - (due.penaltyPaid || 0));
    const amount = Number(form?.querySelector('[data-repayment-amount]')?.value || outstanding);
    if (!Number.isFinite(amount) || amount <= 0 || amount > outstanding) return denied('Payment must be positive and cannot exceed the installment balance plus any assessed penalty.');
    if (!/^[A-Za-z0-9-]{6,32}$/.test(reference || '')) return denied('Enter a valid payment reference (6–32 letters, numbers or hyphens).');
    if (state.ledger.some(x => x.reference.toLowerCase() === reference.toLowerCase())) return denied('That payment reference already exists in the ledger.');
    const penaltyDue = Math.max(0, penalty - (due.penaltyPaid || 0));
    const penaltyAllocated = Math.min(amount, penaltyDue);
    const remainder = amount - penaltyAllocated;
    const interestAllocated = Math.min(remainder, due.interest - (due.interestPaid || 0));
    const principalAllocated = remainder - interestAllocated;
    due.penaltyPaid = (due.penaltyPaid || 0) + penaltyAllocated;
    due.interestPaid = (due.interestPaid || 0) + interestAllocated;
    due.principalPaid = (due.principalPaid || 0) + principalAllocated;
    due.paid += interestAllocated + principalAllocated;
    due.status = due.paid >= due.amount && due.penaltyPaid >= penalty ? 'Paid' : 'Part-paid';
    due.paidAt = new Date().toISOString();
    a.lifecycle.repayments.push({ installment:due.installment, amount, principal:principalAllocated, interest:interestAllocated, penalty:penaltyAllocated, reference, at:due.paidAt, by:currentUser.role });
    a.lifecycle.loanAccount.outstanding = Math.max(0, a.lifecycle.loanAccount.outstanding - principalAllocated);
    const ledgerEntries = [{ account:'Cash / Bank Clearing', debit:amount, credit:0 }];
    if (principalAllocated) ledgerEntries.push({ account:'Loan Receivable', debit:0, credit:principalAllocated });
    if (interestAllocated) ledgerEntries.push({ account:'Interest Income', debit:0, credit:interestAllocated });
    if (penaltyAllocated) ledgerEntries.push({ account:'Late Payment Penalty Income', debit:0, credit:penaltyAllocated });
    addLedgerEntries(a, reference, 'Repayment', ledgerEntries);
    if (a.lifecycle.loanAccount.outstanding === 0 && a.lifecycle.schedule.every(item => item.status === 'Paid')) {
      a.lifecycle.loanAccount.status = 'Closed';
      a.lifecycle.loanAccount.closedAt = due.paidAt;
    }
    const demoOnly = isDemoLifecycleCase(a);
    audit(id, 'Repayment Allocated' + (demoOnly ? ' · Synthetic Demo Only' : ''), (demoOnly ? 'SYNTHETIC DEMO ONLY — simulated repayment; no funds moved. ' : '') + 'Installment ' + due.installment + ' · principal ' + money(principalAllocated) + ' · interest ' + money(interestAllocated) + ' · penalty ' + money(penaltyAllocated) + ' · ' + reference);
    showToast(demoOnly ? 'Synthetic demo repayment allocated; no funds moved.' : 'Repayment allocated.');
    renderLoanAccounts(id);
  };
  function renderLoanAccounts(selectedId) {
    if (!may('loanAccounts')) return denied();
    setPage('Loan Accounts & Servicing', 'Loan Operations / LMS');
    const rows = applications.filter(a => managed(a) && a.lifecycle?.loanAccount);
    const totals = rows.reduce((sum, a) => {
      const outstanding = Number(a.lifecycle.loanAccount.outstanding || 0);
      sum.outstanding += outstanding;
      sum.active += a.lifecycle.loanAccount.status !== 'Closed' ? 1 : 0;
      sum.overdue += (a.lifecycle.schedule || []).some(item => item.status !== 'Paid' && item.dueDate < asOfDate()) ? 1 : 0;
      return sum;
    }, { outstanding:0, active:0, overdue:0 });
    const accountMarkup = rows.map(a => {
      const account = a.lifecycle.loanAccount;
      const schedule = a.lifecycle.schedule || [];
      const closed = account.status === 'Closed';
      const overdueItems = schedule.filter(item => item.status !== 'Paid' && item.dueDate < asOfDate());
      const nextInstallment = schedule.find(item => item.status !== 'Paid');
      const overdueAmount = overdueItems.reduce((sum, item) => sum + Math.max(0, item.amount - item.paid) + Math.max(0, penaltyFor(item) - Number(item.penaltyPaid || 0)), 0);
      const dpd = overdueItems.reduce((max, item) => Math.max(max, Math.floor((new Date(asOfDate() + 'T12:00:00') - new Date(item.dueDate + 'T12:00:00')) / 86400000)), 0);
      const monthlyDue = schedule.length ? schedule[0].amount : 0;
      const paidTotals = (a.lifecycle.repayments || []).reduce((totals, payment) => {
        totals.principal += Number(payment.principal || 0);
        totals.interest += Number(payment.interest || 0);
        totals.penalty += Number(payment.penalty || 0);
        return totals;
      }, { principal:0, interest:0, penalty:0 });
      paidTotals.principal += (a.lifecycle.prepayments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const controls = '<div class="action-row" style="margin:12px 0">' +
        '<button class="ghost-btn" onclick="nfOpenLoanStatement(\'' + esc(a.id) + '\')">Loan Statement</button>' +
        (!closed ? '<button class="ghost-btn" onclick="nfOpenPartPrepayment(\'' + esc(a.id) + '\')">Part-prepayment</button><button class="danger-btn" onclick="nfOpenForeclosure(\'' + esc(a.id) + '\')">Foreclose</button><button class="ghost-btn" onclick="nfOpenCollectionNotes(\'' + esc(a.id) + '\')">Collection Notes</button>' : '') +
        (account.noc ? '<button class="primary-btn" onclick="nfShowNOC(\'' + esc(a.id) + '\')">View NOC</button>' : closed ? '<button class="primary-btn" onclick="nfGenerateNOC(\'' + esc(a.id) + '\')">Generate NOC</button>' : '') +
        '</div>';
      const repaymentForm = !closed && ['Central Operations','CEO'].includes(currentUser.role) && schedule.some(item => item.status !== 'Paid')
        ? '<div class="notice info" style="margin:12px 0">Repayment allocation: overdue penalty first, then installment interest, then principal. Only principal allocation reduces outstanding; matching entries appear in the demo servicing ledger.</div><div class="field-grid three" data-repayment-form="' + esc(a.id) + '"><label>Demo payment amount<input data-repayment-amount type="number" min="1" step="1" placeholder="Due installment plus penalty"></label><label>Demo payment reference<input data-repayment-reference maxlength="32"></label><div style="align-self:end"><button class="primary-btn" onclick="nfRecordRepayment(\'' + esc(a.id) + '\')">Allocate demo repayment</button></div></div>'
        : '';
      const notes = (a.lifecycle.collectionNotes || []).slice().reverse().map(note => '<tr><td>' + esc(new Date(note.at).toLocaleString()) + '</td><td>' + esc(note.outcome) + '</td><td>' + esc(note.note) + '</td><td>' + esc(note.by) + '</td></tr>').join('');
      return '<section class="workflow-card" style="margin-bottom:14px" id="lms-account-' + esc(a.id) + '"><div class="workflow-title"><div><h3>' + esc(account.id || a.id) + ' · ' + esc(a.customer) + (isDemoLifecycleCase(a) ? ' · SYNTHETIC DEMO ONLY' : '') + '</h3><p>' + esc(a.id) + ' · ' + esc(a.product) + ' · Sanction ' + money(a.lifecycle.sanction?.amount || account.openingPrincipal || a.amount) + '</p></div><span class="badge ' + (closed ? 'gray' : overdueItems.length ? 'amber' : 'green') + '">' + (closed ? 'Closed' : overdueItems.length ? 'Overdue' : 'Active') + ' · ' + money(account.outstanding || 0) + ' outstanding</span></div>' +
        '<div class="grid kpis"><div class="workflow-card"><span>Monthly installment</span><b>' + money(monthlyDue) + '</b></div><div class="workflow-card"><span>Principal received</span><b>' + money(paidTotals.principal) + '</b></div><div class="workflow-card"><span>Interest collected</span><b>' + money(paidTotals.interest) + '</b></div><div class="workflow-card"><span>Penalty collected</span><b>' + money(paidTotals.penalty) + '</b></div><div class="workflow-card"><span>Next due</span><b>' + (nextInstallment ? esc(nextInstallment.dueDate) : '—') + '</b></div><div class="workflow-card"><span>Overdue amount</span><b>' + money(overdueAmount) + '</b></div><div class="workflow-card"><span>DPD</span><b>' + dpd + ' days</b></div></div>' +
        controls + '<div class="table-wrap" style="max-height:480px;overflow:auto"><table><thead><tr><th>#</th><th>Due date</th><th>Installment</th><th>Principal</th><th>Interest</th><th>Penalty due</th><th>Status</th><th>Paid total</th><th>Paid principal</th><th>Paid interest</th><th>Paid penalty</th></tr></thead><tbody>' + schedule.map(item => {
          const penalty = penaltyFor(item), overdue = item.status !== 'Paid' && item.dueDate < asOfDate();
          const label = item.status === 'Paid' ? 'Paid' : item.status === 'Part-paid' ? (overdue ? 'Part-paid / Overdue' : 'Part-paid') : overdue ? 'Overdue' : item.dueDate === asOfDate() ? 'Due' : 'Upcoming';
          return '<tr><td>' + item.installment + '</td><td>' + esc(item.dueDate) + '</td><td>' + money(item.amount) + '</td><td>' + money(item.principal) + '</td><td>' + money(item.interest) + '</td><td>' + money(Math.max(0, penalty - Number(item.penaltyPaid || 0))) + '</td><td>' + esc(label) + '</td><td>' + money(item.paid + Number(item.penaltyPaid || 0)) + '</td><td>' + money(item.principalPaid || 0) + '</td><td>' + money(item.interestPaid || 0) + '</td><td>' + money(item.penaltyPaid || 0) + '</td></tr>';
        }).join('') + '</tbody></table></div>' + repaymentForm +
        '<h4 style="margin:14px 0 8px">Collection activity</h4><div class="table-wrap"><table><thead><tr><th>Date</th><th>Outcome</th><th>Note</th><th>Recorded by</th></tr></thead><tbody>' + (notes || '<tr><td colspan="4">No demo collection notes recorded.</td></tr>') + '</tbody></table></div>' +
        (account.noc ? '<div class="notice success" style="margin-top:10px">Demo NOC ' + esc(account.noc.number) + ' issued on ' + esc(account.noc.issuedAt.slice(0,10)) + '.</div>' : '') + '</section>';
    }).join('');
    $('#content').innerHTML = '<div class="page-head"><div><h2>Loan Accounts & Servicing</h2><p>Demo LMS portfolio, repayment schedule, collections and loan closure controls.</p></div><div class="action-row"><button class="ghost-btn" onclick="navTo(\'lmsReports\')">Portfolio Reports</button><button class="ghost-btn" onclick="navTo(\'generalLedger\')">Open General Ledger →</button></div></div>' +
      (rows.some(isDemoLifecycleCase) ? '<div class="notice info"><b>SYNTHETIC DEMO ONLY</b> — Loan balances, repayments and ledger entries are illustrative browser data; no funds moved and no production servicing account exists.</div>' : '') +
      '<div class="grid kpis"><div class="workflow-card"><span>Loan accounts</span><b>' + rows.length + '</b></div><div class="workflow-card"><span>Active accounts</span><b>' + totals.active + '</b></div><div class="workflow-card"><span>Portfolio outstanding</span><b>' + money(totals.outstanding) + '</b></div><div class="workflow-card"><span>Accounts overdue</span><b>' + totals.overdue + '</b></div></div>' +
      (accountMarkup || '<div class="workflow-card"><p>No connected lifecycle loan accounts have been created yet. Accounts appear after Central Operations disburses and pushes an application to LMS.</p></div>');
    if (selectedId) document.getElementById('lms-account-' + CSS.escape(selectedId))?.scrollIntoView({ behavior:'smooth', block:'start' });
  }
  function lmsAccount(id) {
    const a = caseFor(id);
    return a?.lifecycle?.loanAccount ? a : null;
  }
  function lmsReference(prefix, id) {
    return prefix + '-' + String(id).replace(/[^A-Za-z0-9-]/g, '').slice(-14) + '-' + Date.now().toString(36).toUpperCase();
  }
  function recastRemainingSchedule(a, balance) {
    const pending = a.lifecycle.schedule.filter(item => item.status !== 'Paid');
    if (!pending.length) return false;
    const months = pending.length;
    const rate = Number(a.lifecycle.loanTerms?.roi || products[a.product]?.rate || 14) / 1200;
    const payment = rate ? Math.round(balance * rate / (1 - Math.pow(1 + rate, -months))) : Math.ceil(balance / months);
    let principalBalance = balance;
    pending.forEach((item, index) => {
      const interest = Math.round(principalBalance * rate);
      const principal = index === months - 1 ? principalBalance : Math.min(principalBalance, Math.max(0, payment - interest));
      principalBalance = Math.max(0, principalBalance - principal);
      const principalPaid = Number(item.principalPaid || 0);
      const interestPaid = Number(item.interestPaid || 0);
      item.principal = principal + principalPaid;
      item.interest = interest + interestPaid;
      item.amount = item.principal + item.interest;
      item.paid = principalPaid + interestPaid;
      item.status = item.paid > 0 ? 'Part-paid' : 'Upcoming';
    });
    return true;
  }
  window.nfOpenPartPrepayment = function(id) {
    const a = lmsAccount(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'record a demo part-prepayment')) return;
    if (a.lifecycle.loanAccount.status === 'Closed') return denied('This demo loan account is already closed.');
    showModal('Demo Part-prepayment • ' + esc(id),
      '<div class="notice info">The demo amount will reduce principal. Remaining tenure stays unchanged and future installments are recalculated lower. Any amount already paid toward a part-paid installment is preserved. No real payment is collected.</div><div class="modal-kv"><div><span>Outstanding principal</span><b>' + money(a.lifecycle.loanAccount.outstanding) + '</b></div><div><span>Remaining installments</span><b>' + a.lifecycle.schedule.filter(item => item.status !== 'Paid').length + '</b></div></div><label>Demo prepayment amount<input id="lmsPrepayAmount" type="number" min="1" max="' + Math.max(0, a.lifecycle.loanAccount.outstanding - 1) + '" step="1"></label><label>Demo reference<input id="lmsPrepayReference" maxlength="32" value="' + esc(lmsReference('PREPAY', id)) + '"></label>',
      '<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="nfApplyPartPrepayment(\'' + esc(id) + '\')">Apply Demo Prepayment</button>');
  };
  window.nfApplyPartPrepayment = function(id) {
    const a = lmsAccount(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'apply a demo part-prepayment')) return;
    if (a.lifecycle.loanAccount.status === 'Closed') return denied('The account cannot be recast while closed.');
    const amount = Number(document.getElementById('lmsPrepayAmount')?.value);
    const reference = String(document.getElementById('lmsPrepayReference')?.value || '').trim();
    const outstanding = Number(a.lifecycle.loanAccount.outstanding || 0);
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount >= outstanding) return denied('Enter a whole-rupee prepayment greater than zero and below the outstanding principal. Use foreclosure to close the loan.');
    if (!/^[A-Za-z0-9-]{6,32}$/.test(reference)) return denied('Enter a valid demo reference (6–32 letters, numbers or hyphens).');
    if (state.ledger.some(entry => entry.reference.toLowerCase() === reference.toLowerCase())) return denied('That demo reference already exists in the ledger.');
    const nextOutstanding = outstanding - amount;
    if (!recastRemainingSchedule(a, nextOutstanding)) return denied('The remaining repayment schedule could not be safely recalculated.');
    a.lifecycle.loanAccount.outstanding = nextOutstanding;
    a.lifecycle.prepayments = a.lifecycle.prepayments || [];
    a.lifecycle.prepayments.push({ amount, reference, at:new Date().toISOString(), by:currentUser.role });
    addLedgerEntries(a, reference, 'Part-prepayment', [
      { account:'Cash / Bank Clearing', debit:amount, credit:0 },
      { account:'Loan Receivable', debit:0, credit:amount }
    ]);
    closeModal();
    audit(id, 'Demo Part-prepayment Applied', money(amount) + ' · outstanding principal reduced; remaining tenure retained · ' + reference);
    renderLoanAccounts(id);
  };
  function foreclosureQuote(a) {
    const current = a.lifecycle.schedule.find(item => item.status !== 'Paid' && item.dueDate <= asOfDate());
    const interest = current ? Math.max(0, Number(current.interest || 0) - Number(current.interestPaid || 0)) : 0;
    const penalty = a.lifecycle.schedule
      .filter(item => item.status !== 'Paid' && item.dueDate < asOfDate())
      .reduce((sum, item) => sum + Math.max(0, penaltyFor(item) - Number(item.penaltyPaid || 0)), 0);
    const principal = Number(a.lifecycle.loanAccount.outstanding || 0);
    return { principal, interest, penalty, total:principal + interest + penalty };
  }
  window.nfOpenForeclosure = function(id) {
    const a = lmsAccount(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'quote a demo foreclosure')) return;
    if (a.lifecycle.loanAccount.status === 'Closed') return denied('This demo loan account is already closed.');
    const quote = foreclosureQuote(a);
    showModal('Demo Foreclosure Quote • ' + esc(id),
      '<div class="notice warn">Illustrative demo payoff only; no bank payout or real settlement is performed. No foreclosure fee is configured in this prototype.</div><div class="modal-kv"><div><span>Outstanding principal</span><b>' + money(quote.principal) + '</b></div><div><span>Current unpaid installment interest</span><b>' + money(quote.interest) + '</b></div><div><span>Assessed overdue penalties</span><b>' + money(quote.penalty) + '</b></div><div><span>Demo payoff amount</span><b>' + money(quote.total) + '</b></div></div><label>Demo settlement reference<input id="lmsForeclosureReference" maxlength="32" value="' + esc(lmsReference('FORECLOSE', id)) + '"></label>',
      '<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="danger-btn" onclick="nfConfirmForeclosure(\'' + esc(id) + '\')">Confirm Demo Closure</button>');
  };
  window.nfConfirmForeclosure = function(id) {
    const a = lmsAccount(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'close a demo loan account')) return;
    if (a.lifecycle.loanAccount.status === 'Closed') return denied('This demo loan account is already closed.');
    const quote = foreclosureQuote(a);
    const reference = String(document.getElementById('lmsForeclosureReference')?.value || '').trim();
    if (quote.total <= 0 || !/^[A-Za-z0-9-]{6,32}$/.test(reference)) return denied('A valid positive demo payoff and settlement reference are required.');
    if (state.ledger.some(entry => entry.reference.toLowerCase() === reference.toLowerCase())) return denied('That demo reference already exists in the ledger.');
    const entries = [{ account:'Cash / Bank Clearing', debit:quote.total, credit:0 }];
    if (quote.principal) entries.push({ account:'Loan Receivable', debit:0, credit:quote.principal });
    if (quote.interest) entries.push({ account:'Interest Income', debit:0, credit:quote.interest });
    if (quote.penalty) entries.push({ account:'Late Payment Penalty Income', debit:0, credit:quote.penalty });
    addLedgerEntries(a, reference, 'Foreclosure', entries);
    a.lifecycle.loanAccount.outstanding = 0;
    a.lifecycle.loanAccount.status = 'Closed';
    a.lifecycle.loanAccount.closedAt = new Date().toISOString();
    a.lifecycle.loanAccount.closureReference = reference;
    a.lifecycle.schedule.forEach(item => {
      if (item.status !== 'Paid') {
        item.paid = item.amount;
        item.principalPaid = item.principal;
        item.interestPaid = item.interest;
        item.penaltyPaid = Number(item.penaltyAssessed || 0);
        item.status = 'Paid';
        item.paidAt = a.lifecycle.loanAccount.closedAt;
      }
    });
    closeModal();
    audit(id, 'Demo Foreclosure Completed', money(quote.total) + ' · ' + reference);
    renderLoanAccounts(id);
  };
  window.nfOpenLoanStatement = function(id) {
    const a = lmsAccount(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'view the demo loan statement')) return;
    const entries = state.ledger.filter(entry => entry.applicationId === id);
    const transactions = entries.map(entry => '<tr><td>' + esc(new Date(entry.date).toLocaleString()) + '</td><td>' + esc(entry.type) + '</td><td>' + esc(entry.account) + '</td><td>' + money(entry.debit) + '</td><td>' + money(entry.credit) + '</td><td>' + esc(entry.reference) + '</td></tr>').join('');
    showModal('Demo Loan Statement • ' + esc(id),
      '<div class="modal-kv"><div><span>Loan account</span><b>' + esc(a.lifecycle.loanAccount.id) + '</b></div><div><span>Customer</span><b>' + esc(a.customer) + '</b></div><div><span>Sanction principal</span><b>' + money(a.lifecycle.loanAccount.openingPrincipal) + '</b></div><div><span>Current outstanding</span><b>' + money(a.lifecycle.loanAccount.outstanding) + '</b></div><div><span>Account status</span><b>' + esc(a.lifecycle.loanAccount.status || 'Active') + '</b></div></div><h4>Posting history</h4><div class="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Account</th><th>Debit</th><th>Credit</th><th>Reference</th></tr></thead><tbody>' + (transactions || '<tr><td colspan="6">No postings are recorded for this loan account.</td></tr>') + '</tbody></table></div>',
      '<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="window.print()">Print / Save Statement</button>');
  };
  window.nfOpenCollectionNotes = function(id) {
    const a = lmsAccount(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'record a demo collection note')) return;
    showModal('Demo Collection Note • ' + esc(id),
      '<div class="notice info">Record a demo contact outcome only. This does not place a real call, send a message or collect payment.</div><label>Outcome<select id="lmsCollectionOutcome"><option>Contact attempted</option><option>Customer reached</option><option>Promise to pay</option><option>Follow-up required</option><option>Unable to contact</option><option>Dispute raised</option></select></label><label>Note<textarea id="lmsCollectionNote" rows="4" maxlength="500" placeholder="Enter a note before saving"></textarea></label><small style="display:block;margin-top:4px;color:#64748b">Enter a note, then click Save Demo Note.</small><div id="lmsCollectionFeedback" role="status" aria-live="polite" style="margin-top:8px;color:#b91c1c"></div>',
      '<button class="ghost-btn" onclick="closeModal()">Cancel</button><button id="lmsCollectionSave" class="primary-btn" type="button" data-nlt-allow="1" data-lms-collection-save="' + esc(id) + '">Save Demo Note</button>');
  };
  window.nfSaveCollectionNote = function(id) {
    const a = lmsAccount(id);
    if (!a) {
      const feedback = document.getElementById('lmsCollectionFeedback');
      if (feedback) feedback.textContent = 'Could not find this managed loan account. Refresh Loan Accounts and try again.';
      else denied('Could not find this managed loan account. Refresh Loan Accounts and try again.');
      return;
    }
    if (!requireLifecycleRole(a, ['Central Operations','CEO'], 'save a demo collection note')) {
      const feedback = document.getElementById('lmsCollectionFeedback');
      if (feedback) feedback.textContent = 'Your current role is not allowed to save collection notes.';
      return;
    }
    const note = String(document.getElementById('lmsCollectionNote')?.value || '').trim();
    const outcome = String(document.getElementById('lmsCollectionOutcome')?.value || '');
    if (!note) {
      const feedback = document.getElementById('lmsCollectionFeedback');
      if (feedback) feedback.textContent = 'Enter a note before saving.';
      else denied('Enter a collection note before saving.');
      document.getElementById('lmsCollectionNote')?.focus();
      return;
    }
    a.lifecycle.collectionNotes = a.lifecycle.collectionNotes || [];
    const savedNote = { note, outcome, at:new Date().toISOString(), by:currentUser.name || currentUser.role };
    a.lifecycle.collectionNotes.push(savedNote);
    const event = { caseId:id, action:'Demo Collection Note Recorded', details:outcome + ' · ' + note, by:currentUser.role, user:currentUser.name, at:new Date().toLocaleString() };
    state.events = state.events || [];
    state.events.unshift(event);
    state.events = state.events.slice(0, 500);
    if (!persist()) {
      a.lifecycle.collectionNotes.pop();
      state.events = state.events.filter(item => item !== event);
      const feedback = document.getElementById('lmsCollectionFeedback');
      if (feedback) feedback.textContent = 'Save failed: browser storage could not save this note. Free storage or check browser site permissions, then retry.';
      return;
    }
    closeModal();
    showToast('Demo collection note saved.');
    renderLoanAccounts(id);
  };
  document.getElementById('modalRoot')?.addEventListener('click', event => {
    const button = event.target?.closest?.('[data-lms-collection-save]');
    if (button) window.nfSaveCollectionNote(button.dataset.lmsCollectionSave);
  });
  function renderLMSReports() {
    if (!may('lmsReports')) return denied();
    setPage('LMS Portfolio & Reports', 'Loan Operations / LMS');
    const accounts = applications.filter(a => managed(a) && a.lifecycle?.loanAccount);
    const records = accounts.map(a => {
      const overdue = (a.lifecycle.schedule || []).filter(item => item.status !== 'Paid' && item.dueDate < asOfDate());
      const dpd = overdue.reduce((max, item) => Math.max(max, Math.floor((new Date(asOfDate() + 'T12:00:00') - new Date(item.dueDate + 'T12:00:00')) / 86400000)), 0);
      const overdueAmount = overdue.reduce((sum, item) => sum + Math.max(0, item.amount - item.paid) + Math.max(0, Number(item.penaltyAssessed || 0) - Number(item.penaltyPaid || 0)), 0);
      const collected = (a.lifecycle.repayments || []).reduce((totals, payment) => {
        totals.principal += Number(payment.principal || 0);
        totals.interest += Number(payment.interest || 0);
        totals.penalty += Number(payment.penalty || 0);
        return totals;
      }, { principal:0, interest:0, penalty:0 });
      collected.principal += (a.lifecycle.prepayments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      return { a, overdueAmount, dpd, collected, notes:(a.lifecycle.collectionNotes || []).length, status:a.lifecycle.loanAccount.status || 'Active' };
    });
    const outstanding = records.reduce((sum, item) => sum + Number(item.a.lifecycle.loanAccount.outstanding || 0), 0);
    const totals = records.reduce((sum, item) => ({
      principal:sum.principal + item.collected.principal,
      interest:sum.interest + item.collected.interest,
      penalty:sum.penalty + item.collected.penalty
    }), { principal:0, interest:0, penalty:0 });
    const overdueAccounts = records.filter(item => item.overdueAmount > 0).length;
    const buckets = [
      ['Current', item => item.dpd === 0],
      ['1–30 DPD', item => item.dpd > 0 && item.dpd <= 30],
      ['31–60 DPD', item => item.dpd > 30 && item.dpd <= 60],
      ['61–90 DPD', item => item.dpd > 60 && item.dpd <= 90],
      ['90+ DPD', item => item.dpd > 90]
    ];
    const reportRows = records.map(item => '<tr><td>' + esc(item.a.id) + '</td><td>' + esc(item.a.customer) + '</td><td>' + esc(item.a.lifecycle.loanAccount.id) + '</td><td>' + esc(item.status) + '</td><td>' + money(item.a.lifecycle.loanAccount.outstanding || 0) + '</td><td>' + money(item.collected.principal) + '</td><td>' + money(item.collected.interest) + '</td><td>' + money(item.overdueAmount) + '</td><td>' + item.dpd + '</td><td>' + item.notes + '</td><td><button class="more-btn" onclick="nfOpenRepaymentSchedule(\'' + esc(item.a.id) + '\')">Open</button></td></tr>').join('');
    const bucketRows = buckets.map(([label, test]) => {
      const grouped = records.filter(test);
      return '<tr><td>' + label + '</td><td>' + grouped.length + '</td><td>' + money(grouped.reduce((sum, item) => sum + item.overdueAmount, 0)) + '</td></tr>';
    }).join('');
    $('#content').innerHTML = '<div class="page-head"><div><h2>LMS Portfolio & Reports</h2><p>Browser-local demo portfolio, principal outstanding, overdue aging and collection activity.</p></div><div class="action-row"><button class="ghost-btn" onclick="navTo(\'loanAccounts\')">Loan Accounts</button><button class="ghost-btn" onclick="nfExportLMSReport()">Export CSV</button></div></div>' +
      '<div class="grid kpis"><div class="workflow-card"><span>Loan accounts</span><b>' + records.length + '</b></div><div class="workflow-card"><span>Active</span><b>' + records.filter(item => item.status !== 'Closed').length + '</b></div><div class="workflow-card"><span>Portfolio outstanding</span><b>' + money(outstanding) + '</b></div><div class="workflow-card"><span>Principal received</span><b>' + money(totals.principal) + '</b></div><div class="workflow-card"><span>Interest collected</span><b>' + money(totals.interest) + '</b></div><div class="workflow-card"><span>Overdue accounts</span><b>' + overdueAccounts + '</b></div></div>' +
      '<section class="workflow-card" style="margin-top:14px"><h3>Delinquency Aging</h3><div class="table-wrap"><table><thead><tr><th>DPD bucket</th><th>Accounts</th><th>Overdue amount</th></tr></thead><tbody>' + bucketRows + '</tbody></table></div></section>' +
      '<section class="workflow-card" style="margin-top:14px"><h3>Loan Portfolio</h3><div class="table-wrap"><table><thead><tr><th>Application</th><th>Customer</th><th>Loan Account</th><th>Status</th><th>Outstanding</th><th>Principal received</th><th>Interest collected</th><th>Overdue</th><th>DPD</th><th>Collection Notes</th><th></th></tr></thead><tbody>' + (reportRows || '<tr><td colspan="11">No connected demo loan accounts yet.</td></tr>') + '</tbody></table></div></section>';
    window.nfExportLMSReport = () => {
      const csv = [['Application','Customer','Loan Account','Status','Outstanding','Principal Received','Interest Collected','Penalty Collected','Overdue','DPD','Collection Notes'], ...records.map(item => [item.a.id,item.a.customer,item.a.lifecycle.loanAccount.id,item.status,item.a.lifecycle.loanAccount.outstanding,item.collected.principal,item.collected.interest,item.collected.penalty,item.overdueAmount,item.dpd,item.notes])]
        .map(row => row.map(value => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'demo-lms-portfolio.csv'; link.click(); URL.revokeObjectURL(url);
    };
  }
  window.nfGenerateNOC = function(id) {
    const a = lmsAccount(id);
    if (!a || !requireLifecycleRole(a, ['Central Operations','CEO'], 'issue a demo NOC')) return;
    if (a.lifecycle.loanAccount.status !== 'Closed' || Number(a.lifecycle.loanAccount.outstanding) !== 0) return denied('A demo NOC can be issued only after the loan account is fully closed and outstanding is zero.');
    if (!a.lifecycle.loanAccount.noc) {
      a.lifecycle.loanAccount.noc = {
        number:'NOC-' + String(id).replace(/[^A-Za-z0-9-]/g, '').slice(-16) + '-' + new Date().getFullYear(),
        issuedAt:new Date().toISOString()
      };
      audit(id, 'Demo NOC Issued', a.lifecycle.loanAccount.noc.number);
    }
    window.nfShowNOC(id);
  };
  window.nfShowNOC = function(id) {
    const a = lmsAccount(id), noc = a?.lifecycle?.loanAccount?.noc;
    if (!a || !noc || a.lifecycle.loanAccount.status !== 'Closed') return denied('No eligible demo NOC exists for this loan account.');
    showModal('No Dues Certificate · DEMO',
      '<section style="padding:24px;text-align:center"><h2>NO DUES CERTIFICATE</h2><p>DEMO RECORD — NOT A LEGAL OR BANK CERTIFICATE</p><hr><p>This demo record states that the illustrative loan account below has been marked closed in the local prototype.</p><p><b>Customer:</b> ' + esc(a.customer) + '</p><p><b>Application:</b> ' + esc(a.id) + '</p><p><b>Loan Account:</b> ' + esc(a.lifecycle.loanAccount.id) + '</p><p><b>Certificate No.:</b> ' + esc(noc.number) + '</p><p><b>Issue date:</b> ' + esc(noc.issuedAt.slice(0,10)) + '</p><p><b>Outstanding:</b> ' + money(a.lifecycle.loanAccount.outstanding) + '</p></section>',
      '<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="window.print()">Print / Save Demo Copy</button>');
  };
  function renderLedger() {
    if (!may('generalLedger')) return denied();
    setPage('General Ledger', 'Loan Operations / LMS');
    const totalDebit = state.ledger.reduce((sum, row) => sum + row.debit, 0);
    const totalCredit = state.ledger.reduce((sum, row) => sum + row.credit, 0);
    $('#content').innerHTML = '<div class="page-head"><div><h2>General Ledger</h2><p>Double-entry prototype postings linked to application, loan account and transaction reference.</p></div><button class="ghost-btn" onclick="navTo(\'loanAccounts\')">Loan Accounts</button></div><div class="grid kpis"><div class="workflow-card"><span>Total debit</span><b>' + money(totalDebit) + '</b></div><div class="workflow-card"><span>Total credit</span><b>' + money(totalCredit) + '</b></div><div class="workflow-card"><span>Entries</span><b>' + state.ledger.length + '</b></div></div><section class="workflow-card" style="margin-top:14px"><div class="table-wrap"><table><thead><tr><th>Entry</th><th>Date</th><th>Application / Loan</th><th>Account</th><th>Type</th><th>Debit</th><th>Credit</th><th>Reference</th></tr></thead><tbody>' +
      (state.ledger.length ? state.ledger.map(x => '<tr><td>' + esc(x.id) + '</td><td>' + esc(new Date(x.date).toLocaleString()) + '</td><td>' + esc(x.applicationId) + ' / ' + esc(x.loanId) + '</td><td>' + esc(x.account) + '</td><td>' + esc(x.type) + '</td><td>' + money(x.debit) + '</td><td>' + money(x.credit) + '</td><td>' + esc(x.reference) + '</td></tr>').join('') : '<tr><td colspan="8">No ledger postings yet.</td></tr>') + '</tbody></table></div></section>';
  }
  window.nfOpenLifecycleLOS = openLifecycleLOS;
  window.nfOpenLifecycleIMD = id => navTo('imd', id);
  window.nfOpenLoanAccounts = () => navTo('loanAccounts');
  window.nfOpenRepaymentSchedule = id => renderLoanAccounts(id);
  window.nfOpenGeneralLedger = () => navTo('generalLedger');
  window.nfOpenLoanPostings = () => { if (may('generalLedger')) renderLedger(); };
  window.nfGetLoanLedgerForGL = () => state.ledger.map(entry => ({ ...entry }));
  window.nfOpenIMDConfig = () => navTo('imdConfig');
  const baseRenderCase = renderCase;
  renderCase = function(id) {
    const result = baseRenderCase.apply(this, arguments);
    const a = caseFor(id);
    if (!a) return result;
    if (managed(a)) {
      const stages = ['Sales/Predeal','IMD Pending','Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review','Sanctioned','Disbursement','Active Loan'];
      const current = stages.indexOf(a.status);
      const track = $('#content .lifecycle');
      if (track && current >= 0) {
        track.innerHTML = stages.map((stage, index) =>
          '<div class="life-step ' + (index < current ? 'done' : '') + ' ' + (index === current ? 'current' : '') + '"><div class="life-wrap"><div class="circle">' + (index < current ? '✓' : index + 1) + '</div><div class="life-label">' + esc(stage === 'IMD Pending' ? 'IMD & BSA Verification' : stage) + '</div></div>' + (index < stages.length - 1 ? '<div class="connector"></div>' : '') + '</div>'
        ).join('');
      }
    }
    const history = state.events.filter(event => event.caseId === id);
    if (managed(a) && a.status === 'IMD Pending' && a.lifecycle.imd?.status !== 'Verified') {
      const message = currentUser.role === 'BDM'
        ? '<div class="notice warn">BDM must complete IMD & BSA verification here before this application enters Credit Review.</div><button class="primary-btn" onclick="nfOpenLifecycleIMD(\'' + esc(id) + '\')">Open IMD & BSA Verification →</button>'
        : '<div class="notice info">Awaiting BDM IMD & BSA verification. Credit Review starts only after this gate is complete.</div>';
      $('#content').insertAdjacentHTML('afterbegin', '<section class="workflow-card">' + message + '</section>');
    } else if (
      managed(a) &&
      ['Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review'].includes(a.status) &&
      !imdGateSatisfied(a)
    ) {
      const message = '<div class="notice danger">Workflow order issue: BDM IMD & BSA verification must be completed before Credit Review. Return this pre-sanction case to BDM before continuing.</div>';
      const action = currentUser.role === 'BDM'
        ? '<button class="primary-btn" onclick="nfReturnToLifecycleIMD(\'' + esc(id) + '\')">Return to BDM IMD & BSA →</button>'
        : '';
      $('#content').insertAdjacentHTML('afterbegin', '<section class="workflow-card">' + message + action + '</section>');
    }
    $('#content').insertAdjacentHTML('beforeend', '<section class="workflow-card" style="margin-top:14px"><div class="workflow-title"><div><h3>Connected lifecycle audit history</h3><p>Browser-local workflow events for this application.</p></div><span class="badge blue">' + history.length + ' events</span></div>' +
      (history.length ? '<div class="table-wrap"><table><thead><tr><th>Time</th><th>User / role</th><th>Event</th><th>Details</th></tr></thead><tbody>' + history.map(event => '<tr><td>' + esc(event.at) + '</td><td>' + esc(event.user) + ' · ' + esc(event.by) + '</td><td>' + esc(event.action) + '</td><td>' + esc(event.details || '—') + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="muted">No connected lifecycle events recorded yet.</p>') + '</section>');
    return result;
  };
  const baseCaseActionButton = caseActionButton;
  caseActionButton = function(a) {
    if (managed(a) && a.status === 'IMD Pending') {
      return currentUser.role === 'BDM'
        ? '<button class="primary-btn" onclick="nfOpenLifecycleIMD(\'' + esc(a.id) + '\')">Complete IMD & BSA →</button>'
        : '<span class="badge amber">Awaiting BDM · IMD & BSA</span>';
    }
    if (managed(a) && a.status === 'Sales/Predeal') {
      return '<span class="badge amber">Complete LOS before BDM IMD & BSA handoff</span>';
    }
    if (
      managed(a) &&
      ['Credit Review','CAM Allocation','CAM Sheet','Underwriting','Operations Review','Sanction Review'].includes(a.status) &&
      !imdGateSatisfied(a)
    ) {
      return currentUser.role === 'BDM'
        ? '<button class="primary-btn" onclick="nfReturnToLifecycleIMD(\'' + esc(a.id) + '\')">Return to BDM IMD & BSA →</button>'
        : '<span class="badge danger">Blocked · IMD & BSA not verified</span>';
    }
    if (managed(a) && a.status === 'Operations Review') {
      return currentUser.role === 'Disbursement Officer'
        ? '<button class="primary-btn" onclick="openDOChecklist(\'' + esc(a.id) + '\')">Open Operations Checklist →</button>'
        : '<span class="badge amber">Operations Review</span>';
    }
    if (managed(a) && a.status === 'Sanctioned') {
      if (currentUser.role === 'Central Operations') return '<button class="primary-btn" onclick="openCentralOps(\'' + esc(a.id) + '\')">Open Central Operations →</button>';
      return '<span class="badge green">Sanctioned · Awaiting Central Operations</span>';
    }
    return baseCaseActionButton.apply(this, arguments);
  };
  persist();
})();
</script>`;
