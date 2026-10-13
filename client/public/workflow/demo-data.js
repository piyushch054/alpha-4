/* Deterministic synthetic fixtures. No real identities or external services. */
(() => {
  const root = globalThis;
  root.products ??= globalThis.products ?? {};
  root.nfCorp ??= globalThis.nfCorp ?? { employees: [], audits: [], projects: [] };
  root.nfCorp.employees ??= [];
  root.nfCorp.audits ??= [];
  root.nfCorp.projects ??= [];
  root.crm ??= globalThis.crm ?? { leads: [], activities: [] };
  root.applications ??= globalThis.applications ?? [];
  root.v7Tasks ??= globalThis.v7Tasks ?? [];
  root.v7Customers ??= globalThis.v7Customers ?? [];
  root.v7Partners ??= globalThis.v7Partners ?? [];
  root.auditEvents ??= globalThis.auditEvents ?? [];
  root.approvalEvents ??= globalThis.approvalEvents ?? [];
  root.sendBackTasks ??= globalThis.sendBackTasks ?? [];
  root.v7Kyc ??= globalThis.v7Kyc ?? {};
  root.v7Banking ??= globalThis.v7Banking ?? {};
  root.v7Bureau ??= globalThis.v7Bureau ?? {};
  root.v7RCU ??= globalThis.v7RCU ?? {};
  root.v7UW ??= globalThis.v7UW ?? {};
  root.v7Sanction ??= globalThis.v7Sanction ?? {};
  root.v7PDD ??= globalThis.v7PDD ?? {};
  const target = 1000;
  const persistedTarget = 50;
  const first = ['Aarav','Riya','Vikram','Meena','Rohit','Kavita','Manish','Pooja','Nitin','Priya','Sanjay','Anita','Deepak','Sunita','Rajesh','Neelam','Arjun','Divya','Karan','Aditi','Mohit','Sneha','Rakesh','Ritika','Aman','Komal','Gaurav','Shweta','Harish','Nisha','Ajay','Suman'];
  const last = ['Sharma','Jain','Singh','Meena','Rathore','Patel','Joshi','Gupta','Verma','Saini','Choudhary','Pareek','Yadav','Mehta','Saxena','Bansal','Kapoor','Malhotra','Soni','Agarwal','Rao','Trivedi','Mishra','Bhatia','Seth','Vyas','Solanki','Goyal','Dubey','Tiwari','Kumar','Shekhawat'];
  const branches = ['Jaipur - VKI','Ajmer Road','Udaipur','Bhilwara','Kota','Sikar','Jaipur - Sanganer','Jodhpur'];
  const business = ['Agro Traders','Textiles','Engineering Works','Logistics','Packaging','Food Products','Auto Components','Solar Systems','Hardware','Electricals','Industries','Enterprises'];
  const name = i => `${first[i % first.length]} ${last[Math.floor(i / first.length) % last.length]}`;
  const pick = (a,i) => a[i % a.length];
  const date = (i,year=2026) => `${year}-${String(1 + Math.floor(i / 27) % 9).padStart(2,'0')}-${String(1+i%27).padStart(2,'0')}`;
  const humanDate = i => new Date(date(i)+'T12:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
  const fill = (arr,fn,limit=target) => { for (let i=arr.length;i<limit;i++) arr.push(fn(i)); };
  const employeeSeed = globalThis.nfDefaults?.employees ?? [
    { id: 'EMP-001', name: 'Neha Jain', role: 'BSO', branch: 'Jaipur - VKI' },
    { id: 'EMP-002', name: 'Mohit Meena', role: 'ASM', branch: 'Ajmer Road' },
    { id: 'EMP-003', name: 'Kavita Rao', role: 'RSM', branch: 'Udaipur' },
    { id: 'EMP-004', name: 'Rahul Saini', role: 'Regional Sales', branch: 'Bhilwara' }
  ];
  const safeTeam = (team) => team ? { ...team } : { role: 'Sales', owner: 'Sales Team' };
  const safeArray = (list) => Array.isArray(list) ? list : [];
  const safeItem = (list, index, fallback) => safeArray(list)[index] ?? fallback;
  // Preserve original examples, but give appended fixtures a separate ID namespace.
  fill(nfCorp.employees, i => ({...structuredClone(employeeSeed[i % employeeSeed.length]),id:`DEMO-EMP-${i+1}`,name:name(i),branch:pick(branches,i),join:date(i,2022+i%4),salary:28000+(i*791%97000),attendance:85+i%15,leave:i%19,status:i%23===0?'On Leave':'Active'}));
  fill(applications,i => {
    const product=pick(['MSME','MSME','MSME','LAP','LAP','Solar Loan','Solar Loan','Two Wheeler','Two Wheeler','Tractor Loan','Tractor Loan'],i);
    const amount=product==='Two Wheeler'?65000+(i*971%155000):product==='LAP'?1500000+(i*17003%8500000):product==='Solar Loan'?180000+(i*3011%1520000):product==='Tractor Loan'?550000+(i*4291%1150000):300000+(i*7127%4700000);
    const stage=i%8;
    const ownerName = safeItem(nfCorp.employees, i, employeeSeed[i % employeeSeed.length]).name ?? employeeSeed[i % employeeSeed.length].name;
    return {id:`DEMO-${products[product].code}-${200000+i}`,customer:product==='MSME'||product==='Solar Loan'?`${first[i%32]} ${last[Math.floor(i/32)%32]} ${pick(business,i)}`:name(i),mobile:`+91 9XXXX ${String(i+1).padStart(5,'0')}`,product,amount,branch:pick(branches,i),status:pick(['Draft',...lifecycle],stage),stage:Math.max(0,stage-1),score:stage?620+i*17%211:0,docs:stage>=5?100:25+i*7%71,created:humanDate(i),owner:ownerName,repayment:stage?pick(['E-Nach','Nach','PDC','NPDC'],i):'—',synthetic:true};
  },persistedTarget);
  ensureWorkflowData();
  fill(crm.leads,i => {const a=safeItem(applications, i, applications[0] || { id: 'DEMO-UNKNOWN', customer: 'Synthetic Borrower', mobile: 'N/A', product: 'MSME', amount: 250000, branch: branches[0], owner: employeeSeed[0].name, created: humanDate(i) });const converted=i%9===8;const previousLead = safeItem(crm.leads, i % Math.max(1, safeArray(crm.leads).length), {});return {...structuredClone(previousLead),id:`DEMO-CRM-${200000+i}`,name:a.customer,business:['MSME','Solar Loan'].includes(a.product)?a.customer:'',mobile:a.mobile,product:a.product,amount:a.amount,branch:a.branch,owner:a.owner,ownerRole:'BSO',hierarchy:safeTeam(typeof defaultTeamPath !== 'undefined' ? defaultTeamPath.sales : null),status:converted?'Converted':pick(['New','Qualified','Follow-up','Pre-Screen','Opportunity'],i),temperature:pick(['Hot','Warm','Cold'],i),stage:converted?8:i%8,converted,applicationId:converted?a.id:null,score:50+i%46,probability:converted?100:20+i%71,created:a.created,next:converted?'LOS Created':`${humanDate(i)} 11:30`,synthetic:true};},persistedTarget);
  fill(crm.activities,i => {const lead = safeItem(crm.leads, i, { name: 'Lead', id: `DEMO-CRM-${i+1}` });return {type:pick(['Call','Visit','WhatsApp','Email'],i),date:humanDate(i)+' 10:30',user:safeItem(nfCorp.employees, i, { name: 'Operations Team' }).name || 'Operations Team',outcome:pick(['Connected','Document Pending','Visit Completed','Interested'],i),note:`${lead.name || 'Lead'}: ${pick(['Banking evidence requested','Business premises verified','Eligibility discussion completed','Document checklist shared'],i)}`,leadId:lead.id ?? `DEMO-CRM-${i+1}`};}),persistedTarget);
  function ensureDomains(a,i) {
    if(!v7Customers.some(c=>c.applicationId===a.id)) v7Customers.push({id:`DEMO-CUS-${a.id}`,name:a.customer,mobile:a.mobile,pan:`DEMO-PAN-${a.id}`,product:a.product,applicationId:a.id,branch:a.branch,amount:a.amount,score:a.score,kyc:a.docs>=90?'Verified':'In Review',dedupe:'Clear',risk:a.score&&a.score<660?'High':'Normal',groupExposure:Math.round(a.amount*1.2),existingLoans:i%3,closedLoans:i%4,overdue:i%19===0?Math.round(a.amount*.02):0,consent:{bureau:true,kyc:true,aa:i%3!==0,communication:true},family:[{name:name((i+123)%1000),relation:'Spouse',exposure:0}],communication:[{type:'Call',text:'Synthetic application follow-up',at:a.created}]});
    const ready=['Sanctioned','Disbursement','Active Loan'].includes(a.status);
    v7Kyc[a.id] ??= {status:ready?'Verified':'Pending',pan:ready?'Verified':'Pending',identity:ready?'Verified':'Pending',face:ready?'Matched':'Pending',address:ready?'Verified':'Pending',ocr:ready?'Completed':'Pending',version:1};
    v7Banking[a.id] ??= {consent:ready?'Active':'Pending',accounts:1+i%3,abb:Math.round(a.amount*.12),credits:Math.round(a.amount*.25),bounces:i%19===0?2:0,emi:Math.round(emi(a.amount,products[a.product].rate,products[a.product].tenure)),risk:i%19===0?'High':'Low'};
    v7Bureau[a.id] ??= {score:a.score||720,active:i%4,outstanding:Math.round(a.amount*.35),emi:Math.round(a.amount*.02),dpd:i%19===0?30:0,settled:0,enquiries:i%6,status:ready?'Fetched':'Ready'};
    v7RCU[a.id] ??= {status:ready?'Clear':i%19===0?'Adverse':'Pending',flags:i%19===0?['Address verification required']:[],risk:15+i%70};
    v7UW[a.id] ??= {status:ready?'Approved':'Pending',recommendation:'Approve',query:''};
    v7Sanction[a.id] ??= {version:1,status:ready?'Accepted':'Draft',amount:a.amount,roi:products[a.product].rate,tenure:products[a.product].tenure,validity:'30 days',accepted:ready};
    v7PDD[a.id] ??= {items:['Original Security / Property Documents','Insurance Endorsement','RC / Hypothecation / Charge Proof'].map(n=>({name:n,status:a.status==='Active Loan'?'Received':'Pending'})),vault:a.status==='Active Loan'?`DEMO-VAULT-${i}`:'Not Stored'};
  }
  applications.forEach(ensureDomains);
  fill(v7Tasks,i => ({...structuredClone(v7Tasks[i%5]),id:`DEMO-TSK-${200000+i}`,caseId:applications[i].id,status:pick(['Open','In Progress','Waiting','Completed'],i),due:humanDate(i),owner:nfCorp.employees[i].name}),persistedTarget);
  fill(v7Partners,i => ({...structuredClone(v7Partners[i%5]),id:`DEMO-PTR-${200000+i}`,name:`${last[Math.floor(i/32)%32]} ${pick(['Motors','Finance Associates','Solar EPC','Legal Chambers','Valuation Services'],i)} • ${pick(branches,i)} ${i+1}`,city:pick(branches,i),rating:3.5+(i%15)/10,cases:12+i%221,conversion:45+i%51}),persistedTarget);
  fill(sendBackTasks,i => ({id:`DEMO-SBT-${i+1}`,caseId:applications[i].id,fromRole:'BCM',targetRole:'BSO',returnToRole:'BCM',reason:pick(['Bank statement period incomplete','Income proof clarification','Address proof update','Missing collateral evidence'],i),priority:i%5===0?'High':'Normal',status:i%3===0?'Open':'Completed',createdAt:humanDate(i),previousStatus:applications[i].status}));
  fill(auditEvents,i => ({caseId:applications[i].id,action:'Synthetic case review',details:'Illustrative audit evidence',by:'BCM',user:nfCorp.employees[i].name,at:humanDate(i)}),persistedTarget);
  fill(approvalEvents,i => ({caseId:applications[i].id,role:pick(['ACM','ZCM','Credit Head'],i),decision:pick(['Approved','Rejected','Remark'],i),remark:'Synthetic policy review'}),persistedTarget);
  const generators = {
    employeeTasks:i=>({title:`${pick(['Review branch escalation','Complete cyber awareness','Submit operations report','Reconcile repayment evidence'],i)} • ${pick(branches,i)}`,due:humanDate(i)}),
    training:i=>({name:`${pick(['Information Security','Fair Practices Code','POSH Refresher','KYC Controls','Credit Policy'],i)} • ${name(i)}`,employeeId:nfCorp.employees[i].id,progress:i%101,status:i%7===0?'Completed':'In Progress'}),
    employeeDocs:i=>({name:`${name(i)} • ${pick(['Identity proof','Employment Agreement','NDA','Background Verification'],i)}`,employeeId:nfCorp.employees[i].id}),
    candidates:i=>({name:name((i+93)%1000),branch:pick(branches,i),updated:date(i)}),
    onboarding:i=>({name:nfCorp.employees[i].name,employeeId:nfCorp.employees[i].id,progress:15+i%86,due:date(i)}),
    leaves:i=>({employee:nfCorp.employees[i].name,from:date(i),to:date(i),days:1,status:pick(['Pending','Approved','Rejected'],i)}),
    projects:i=>({name:`${pick(['Branch IT Refresh','Credit Process Review','Compliance Readiness','Document Digitization','Solar Portfolio Expansion'],i)} • ${pick(branches,i)} ${i+1}`,key:`DEMO${i+1}`,progress:i%101,budget:250000+i*1979%5000000,start:date(i),due:'2026-12-28'}),
    projectTasks:i=>({project:nfCorp.projects[i].id,key:`DEMO${i+1}-1`,title:pick(['Validate branch evidence','Reconcile credit exceptions','Tag assigned assets','Review UAT findings','Approve process checklist'],i),owner:nfCorp.employees[i].name,due:'2026-10-15'}),
    assets:i=>({name:pick(['Dell Latitude 5450','HP ProBook 440','Lenovo ThinkPad E14','Fortinet 100F','Executive Workstation','Daikin Split AC'],i),category:pick(['Laptop','Laptop','Laptop','Firewall','Furniture','AC'],i),type:i%6>=4?'Non-IT':'IT',tag:`DEMO-TAG-${200000+i}`,serial:`DEMO-SN-${200000+i}`,assigned:nfCorp.employees[i].name,location:pick(branches,i),purchase:date(i,2024),warranty:date(i,2027),value:25000+i*733%160000}),
    assetRequests:i=>({requester:nfCorp.employees[i].name,date:date(i)}),
    audits:i=>({title:`${pick(['Branch Process Audit','Asset Control Audit','KYC Evidence Review','Credit Policy Review'],i)} • ${pick(branches,i)} ${i+1}`,scope:pick(branches,i),start:date(i),due:'2026-10-28',progress:20+i%81}),
    observations:i=>({audit:nfCorp.audits[i].id,due:'2026-10-20'}),
    obligations:i=>({obligation:`${pick(['Fair Practices Code review','KFS disclosure evidence','CIC reporting reconciliation','Policy attestation','Retention compliance review'],i)} • ${pick(branches,i)} ${i+1}`,due:'2026-10-31'}),
    breaches:i=>({title:`${pick(['Retention exception','Delayed reporting','Consent evidence gap','Access review exception'],i)} • ${pick(branches,i)}`,reported:date(i)}),
    cameras:i=>({branch:pick(branches,i),zone:pick(['Entrance','Operations','Reception','Server Room'],i),health:75+i%25,incidents:i%4,status:i%17===0?'Offline':'Online',last:'Demo snapshot'}),
    cctvIncidents:i=>({camera:nfCorp.cameras[i].id,branch:nfCorp.cameras[i].branch,time:date(i)+' 20:15'}),
    adminRequests:i=>({branch:pick(branches,i),due:'2026-10-12'}),
    contracts:i=>({vendor:`${last[Math.floor(i/32)%32]} ${pick(['Office Supplies','Security Services','Facility Management','IT Solutions'],i)} ${i+1}`,expiry:date(i,2027),value:120000+i*811%1800000}),
    travel:i=>({employee:nfCorp.employees[i].name,purpose:`${pick(['Branch audit','Credit review','Technical verification','Staff training'],i)} • ${pick(branches,i)}`,from:'Jaipur',to:pick(branches.slice(1),i),depart:'2026-10-12',return:'2026-10-14',estimate:3500+i*173%25000,expense:i%3===0?3500+i*173%25000:0})
  };
  for(const [key,fn] of Object.entries(generators)) fill(nfCorp[key],i=>({...structuredClone(nfDefaults[key][i%nfDefaults[key].length]),id:`DEMO-${key.toUpperCase()}-${200000+i}`,...fn(i),synthetic:true}));
  // Initialize new applications before the original case renderer accesses domain maps.
  const originalRenderCase=renderCase;
  renderCase=function(id){
    const a=getApp(id);
    if(a){
      if(!a.workflow)a.workflow={stage:a.status,sales:{...defaultTeamPath.sales},credit:{...defaultTeamPath.credit},creditBureau:a.score||0,bureauVerified:false,creditCrossCheck:false,technicalStatus:'Pending',technicalReport:'',legalStatus:'Pending',legalReport:'',eSignStatus:'Pending',doChecklist:'Pending',centralOps:'Pending',dealId:'',lmsStatus:'Pending',ownerRole:'BSO',previousStatus:a.status,sendBack:false,approval:null,deviations:[]};
      a.stage=Math.max(0,lifecycle.indexOf(a.status));a.workflow.stage=a.status;
      ensureDomains(a,applications.indexOf(a));
    }
    return originalRenderCase(id);
  };
  const badge=document.querySelector('#appCountBadge');if(badge)badge.textContent=applications.length;
  document.querySelector('#crmLeadBadge').textContent=crm.leads.filter(l=>!l.converted).length;
  window.namdevDemoInventory=()=>({applications:applications.length,customers:v7Customers.length,leads:crm.leads.length,activities:crm.activities.length,tasks:v7Tasks.length,partners:v7Partners.length,sendBack:sendBackTasks.length,audit:auditEvents.length,approvals:approvalEvents.length,domains:[v7Kyc,v7Banking,v7Bureau,v7RCU,v7UW,v7Sanction,v7PDD].map(x=>Object.keys(x).length),corporate:{employees:nfCorp.employees.length,...Object.fromEntries(Object.keys(generators).map(k=>[k,nfCorp[k].length]))}});
})();

// DEMO PERSISTENCE LAYER INJECTED BELOW
(function() {
  const KEY = 'namdev-demo-full-state';
  const MAX_PERSISTED_DEMO_RECORDS = 50;

  const mutate = (target, source) => {
    if (!source || !target) return;
    if (Array.isArray(target)) {
      target.length = 0;
      target.push(...source);
    } else if (typeof target === 'object' && target !== null) {
      for(let key in target) delete target[key];
      Object.assign(target, source);
    }
  };

  const isDemoId = id => typeof id === 'string' && id.startsWith('DEMO-');
  const limitDemoRecords = (records, isDemoRecord) => {
    if (!Array.isArray(records)) return records;
    let kept = 0;
    return records.filter(record => !isDemoRecord(record) || kept++ < MAX_PERSISTED_DEMO_RECORDS);
  };
  const compactState = state => {
    if (!state || typeof state !== 'object') return state;
    const applications = limitDemoRecords(state.applications, app => app?.synthetic || isDemoId(app?.id));
    const retainedApplicationIds = new Set(
      (applications || []).filter(app => app?.synthetic || isDemoId(app?.id)).map(app => app.id)
    );
    const crm = state.crm && typeof state.crm === 'object'
      ? {
          ...state.crm,
          leads: limitDemoRecords(state.crm.leads, lead => lead?.synthetic || isDemoId(lead?.id)),
          activities: limitDemoRecords(state.crm.activities, activity => isDemoId(activity?.leadId))
        }
      : state.crm;
    const compactDomain = domain => {
      if (!domain || typeof domain !== 'object' || Array.isArray(domain)) return domain;
      return Object.fromEntries(
        Object.entries(domain).filter(([id]) => !isDemoId(id) || retainedApplicationIds.has(id))
      );
    };
    return {
      ...state,
      crm,
      applications,
      v7Tasks: limitDemoRecords(state.v7Tasks, task => isDemoId(task?.id)),
      v7Customers: limitDemoRecords(state.v7Customers, customer => isDemoId(customer?.id) || isDemoId(customer?.applicationId)),
      v7Partners: limitDemoRecords(state.v7Partners, partner => isDemoId(partner?.id)),
      auditEvents: limitDemoRecords(state.auditEvents, event => isDemoId(event?.caseId)),
      approvalEvents: limitDemoRecords(state.approvalEvents, event => isDemoId(event?.caseId)),
      v7Kyc: compactDomain(state.v7Kyc),
      v7Banking: compactDomain(state.v7Banking),
      v7Bureau: compactDomain(state.v7Bureau),
      v7RCU: compactDomain(state.v7RCU),
      v7UW: compactDomain(state.v7UW),
      v7Sanction: compactDomain(state.v7Sanction),
      v7PDD: compactDomain(state.v7PDD)
    };
  };

  const __persistAllState = () => {
    try {
      const state = compactState({
        crm, applications, v7Tasks, v7Customers, v7Partners,
        auditEvents, approvalEvents,
        v7Kyc, v7Banking, v7Bureau, v7RCU, v7UW, v7Sanction, v7PDD
      });
      localStorage.setItem(KEY, JSON.stringify(state));
      mutate(crm, state.crm);
      mutate(applications, state.applications);
      mutate(v7Tasks, state.v7Tasks);
      mutate(v7Customers, state.v7Customers);
      mutate(v7Partners, state.v7Partners);
      mutate(auditEvents, state.auditEvents);
      mutate(approvalEvents, state.approvalEvents);
      mutate(v7Kyc, state.v7Kyc);
      mutate(v7Banking, state.v7Banking);
      mutate(v7Bureau, state.v7Bureau);
      mutate(v7RCU, state.v7RCU);
      mutate(v7UW, state.v7UW);
      mutate(v7Sanction, state.v7Sanction);
      mutate(v7PDD, state.v7PDD);
    } catch(e) {
      console.error(`Unable to save demo state to ${KEY}.`, e);
    }
  };

  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const state = compactState(JSON.parse(saved));
      mutate(crm, state.crm);
      mutate(applications, state.applications);
      mutate(v7Tasks, state.v7Tasks);
      mutate(v7Customers, state.v7Customers);
      mutate(v7Partners, state.v7Partners);
      mutate(auditEvents, state.auditEvents);
      mutate(approvalEvents, state.approvalEvents);
      mutate(v7Kyc, state.v7Kyc);
      mutate(v7Banking, state.v7Banking);
      mutate(v7Bureau, state.v7Bureau);
      mutate(v7RCU, state.v7RCU);
      mutate(v7UW, state.v7UW);
      mutate(v7Sanction, state.v7Sanction);
      mutate(v7PDD, state.v7PDD);
      if (typeof sendBackTasks !== 'undefined') mutate(sendBackTasks, state.sendBackTasks);
      
      // Ensure all domains exist for loaded applications to prevent UI crashes
      if (typeof ensureDomains === 'function' && Array.isArray(applications)) {
        applications.forEach((a, i) => ensureDomains(a, i));
      }
      if (JSON.stringify(state).length < saved.length) __persistAllState();
    } else {
      __persistAllState();
    }
  } catch(e) {}

  if (typeof window.showToast !== 'undefined') {
    const originalToast = window.showToast;
    window.showToast = function(msg) {
      __persistAllState();
      originalToast(msg);
    };
  }
})();
