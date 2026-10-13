// Showcase Tractor Loan journey + loan closure for disbursed cases. Demo data only.
export const workflowJourneyScript = String.raw`<link rel="stylesheet" href="/workflow/loan-journey.css"><script>
(() => {
  const ID = 'SKF-TR-10501';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEY = 'namdev_loan_closures';
  const closures = (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } })();
  const saveClosures = () => { try { localStorage.setItem(KEY, JSON.stringify(closures)); } catch {} };
  const RATE = {'Tractor Loan':13.75};
  const fmt = n => money(Math.round(n));
  function loanCalc(P, annual, n, paid, brokenDays) {
    const r = annual/1200, E = Math.round(emi(P, annual, n)); let b = P, intPaid = 0;
    for (let k = 0; k < Math.min(paid, n); k++) { const i = Math.round(b*r); intPaid += i; b = Math.max(0, b-(E-i)); }
    const broken = Math.round(b*annual/100*brokenDays/365), charge = Math.round(b*0.04), gst = Math.round(charge*0.18);
    return {emi:E, principal:b, intPaid, broken, charge, gst, total:b+broken+charge+gst};
  }
  window.nfLoanCalc = loanCalc;
  const SC = loanCalc(850000, 13.75, 60, 17, 27);
  const journey = [
    ['Lead','Lead captured at Sikar tractor mela','BSO · Mahesh Saini','12 Mar 2025'],
    ['Application','New Application wizard completed — Mahindra 575 DI ex-showroom ₹9,25,000, margin ₹75,000, loan ₹8,50,000 · 60 months · 13.75% p.a. (reducing)','BSO · Mahesh Saini','14 Mar 2025'],
    ['Documents','12 documents uploaded: Live photo, PAN, Aadhaar, Bank proof, Land records 7/12, Dealer quotation, Invoice, Insurance, NACH, Sanction letter, Delivery photo, NOC','BSO · Mahesh Saini','17 Mar 2025'],
    ['KYC','Demo KYC verified — PAN & Aadhaar matched (demo verification only)','System','17 Mar 2025'],
    ['Credit','Credit Memo generated — bureau 748, agri income ₹6,40,000/yr, EMI '+fmt(SC.emi)+' → FOIR '+(SC.emi*12/640000*100).toFixed(1)+'%, LTV '+(850000/925000*100).toFixed(1)+'%','BCM · Neha Jain','20 Mar 2025'],
    ['Approval','Recommended by BCM, approved by ACM within policy','ACM · Rakesh Verma','24 Mar 2025'],
    ['Sanction','Sanction letter issued and eSigned by applicant','Credit Ops','28 Mar 2025'],
    ['Disbursement','₹8,50,000 paid to Kisan Agro Motors · UTR DEMO-UTR-58201 · Deal SKF-DEAL-2026-10501','Central Operations','05 Apr 2025'],
    ['LMS','Loan booked in LMS, NACH active, EMI '+fmt(SC.emi)+' on 5th from 05 May 2025, total payable '+fmt(SC.emi*60)+' (interest '+fmt(SC.emi*60-850000)+')','Central Operations','05 Apr 2025'],
    ['Collection','17 EMIs paid on time (05 May 2025 – 05 Sep 2026, interest '+fmt(SC.intPaid)+'). Foreclosure after Kharif harvest: principal '+fmt(SC.principal)+' + 27-day interest '+fmt(SC.broken)+' + 4% charge '+fmt(SC.charge)+' + 18% GST '+fmt(SC.gst)+' = '+fmt(SC.total),'Collections · Amit Rao','02 Oct 2026'],
    ['Closure','Loan closed · NOC NOC-TR-10501 issued · hypothecation removal letter sent to RTO','Central Operations','02 Oct 2026']
  ];
  function seed() {
    if (applications.some(a => a.id === ID)) return;
    applications.unshift({id:ID,customer:'Ramesh Choudhary',mobile:'+91 9XXXX 10501',product:'Tractor Loan',amount:850000,branch:'Sikar',status:'Closed',stage:7,score:748,docs:100,created:'14 Mar 2025',owner:'Mahesh Saini',repayment:'E-Nach',showcase:true,
      asset:{tractorMake:'Mahindra',tractorModel:'575 DI XP Plus · 47 HP',tractorCondition:'New',dealerName:'Kisan Agro Motors',exShowroomPrice:925000,landHolding:4},
      notes:[{text:'Showcase journey: lead → wizard → documents → credit memo → disbursement → closure',date:'02 Oct 2026'}]});
    ensureWorkflowData();
    const w = applications[0].workflow;
    Object.assign(w,{stage:'Closed',bureauVerified:true,creditCrossCheck:true,technicalStatus:'Completed',technicalReport:'Tractor delivered and geo-tagged at farm.',legalStatus:'Completed',legalReport:'Land records 7/12 verified.',eSignStatus:'Completed',doChecklist:'Completed',centralOps:'Disbursed',dealId:'SKF-DEAL-2026-10501',lmsStatus:'Closed',ownerRole:'Central Operations',previousStatus:'Active Loan'});
    w.journey = journey.map(([stage,text,by,date]) => ({stage,text,by,date}));
    w.closure = {date:'02 Oct 2026',noc:'NOC-TR-10501',mode:'Foreclosure',amount:SC.total,by:'Central Operations'};
    journey.forEach(([stage,text,by,date]) => auditEvents.push({caseId:ID,action:stage,details:text,by,user:by,at:date}));
  }
  seed();
  if (crm && crm.leads && !crm.leads.some(l => l.id === 'CRM-TR-10501')) crm.leads.unshift({id:'CRM-TR-10501',name:'Ramesh Choudhary',business:'Choudhary Krishi Farm',mobile:'9XXXX10501',product:'Tractor Loan',amount:850000,source:'Dealer',branch:'Sikar',owner:'Mahesh Saini',status:'Converted',temperature:'Hot',stage:8,next:'Closed · NOC issued',score:88,probability:100,created:'12 Sep 2026',converted:true,applicationId:ID,showcase:true});
  const stepGo = {Lead:()=>navTo('crm'),Application:id=>setCaseTab(id,'Applicant'),Documents:id=>openCaseDocuments(id),KYC:id=>setCaseTab(id,'Documents'),Credit:id=>showCreditMemo(id),Approval:id=>setCaseTab(id,'CAM'),Sanction:id=>setCaseTab(id,'CAM'),Disbursement:id=>setCaseTab(id,'Loan'),LMS:id=>setCaseTab(id,'Loan'),Collection:()=>navTo('repayments'),Closure:id=>nfShowNoc(id)};
  window.nfJourneyStep = (id, stage) => { const fn = stepGo[stage]; if (fn) fn(id); else setCaseTab(id,'Audit Trail'); };
  Object.entries(closures).forEach(([id,c]) => { const a = getApp(id); if (a && a.workflow) { a.workflow.closure = c; a.status = 'Closed'; a.stage = 7; a.workflow.lmsStatus = 'Closed'; } });

  async function seedDocs() {
    try {
      const db = await new Promise((res, rej) => { const r = indexedDB.open('namdev-case-documents', 1); r.onupgradeneeded = () => { r.result.createObjectStore('files',{keyPath:'key'}); r.result.createObjectStore('cases',{keyPath:'id'}); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
      const existing = await new Promise(res => { const q = db.transaction('files').objectStore('files').getAllKeys(); q.onsuccess = () => res(q.result); q.onerror = () => res([]); });
      if (existing.some(k => String(k).includes(ID))) return;
      const docs = [['LIVE PHOTO','front'],['PAN CARD','front'],['PAN CARD','rear'],['AADHAR CARD / DL / VOTER ID / PASSPORT','front'],['AADHAR CARD / DL / VOTER ID / PASSPORT','rear'],['APPLICATION FORM','front'],['CAM REPORT','front'],['SANCTION LETTER','front'],['BANK PROOF','front'],['NACH','front'],['INVOICE','front'],['INSURANCE','front'],['QUOTATION','front'],['DELIVERY PHOTO','front'],['NOC','front']];
      const records = [];
      for (const [name, side] of docs) {
        const c = document.createElement('canvas'); c.width = 900; c.height = 560; const g = c.getContext('2d');
        g.fillStyle = '#f8fafc'; g.fillRect(0,0,900,560); g.fillStyle = '#c8102e'; g.fillRect(0,0,900,70);
        g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.fillText('NAMDEV FINVEST · DEMO DOCUMENT', 28, 45);
        g.fillStyle = '#0f2a4d'; g.font = 'bold 30px sans-serif'; g.fillText(name.slice(0,44) + (side==='rear'?' (Rear)':''), 28, 140);
        g.font = '22px sans-serif'; g.fillStyle = '#334155';
        ['Case: '+ID,'Applicant: Ramesh Choudhary','Product: Tractor Loan · ₹8,50,000','Asset: Mahindra 575 DI XP Plus','Branch: Sikar'].forEach((t,i) => g.fillText(t, 28, 200 + i*40));
        g.fillStyle = '#b91c1c'; g.font = 'bold 22px sans-serif'; g.fillText('Sample for demonstration only — not a real document', 28, 500);
        const blob = await new Promise(r => c.toBlob(r, 'image/png'));
        if (blob) records.push({key:JSON.stringify([ID,name,side]),caseId:ID,document:name,side,name:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)+'-'+side+'.png',blob,uploadedAt:'2026-09-14T10:00:00.000Z'});
      }
      await new Promise((res, rej) => { const tx = db.transaction('files','readwrite'); records.forEach(r => tx.objectStore('files').put(r)); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    } catch {}
  }
  seedDocs();

  function journeyCard(a) {
    const w = a.workflow || {}; let list = w.journey ? w.journey.slice() : null;
    if (!list && !w.closure && a.status !== 'Active Loan') return '';
    if (!list) list = [{stage:'Application',text:'Application created by '+a.owner,by:a.owner,date:a.created},{stage:'Disbursement',text:w.dealId?'Disbursed · Deal '+w.dealId:'Disbursement pending',by:'Central Operations',date:'—'}];
    if (w.closure && !list.some(s => s.stage==='Closure')) list.push({stage:'Closure',text:'Loan closed · NOC '+w.closure.noc+' · '+w.closure.mode,by:w.closure.by,date:w.closure.date});
    const canClose = a.status === 'Active Loan' && !w.closure && currentUser.role !== 'CEO';
    return '<div class="card card-pad nf-journey" data-no-translate-skip><div class="card-title-row"><div><h3>Loan Journey · Lead to Closure</h3><p>Every stage on this case record (demo data)</p></div>'+(w.closure?'<span class="badge green">Closed · '+esc(w.closure.noc)+'</span>':'')+'</div><ol class="nf-journey-list">'+list.map(s=>'<li><i></i><div role="button" tabindex="0" class="nf-journey-step" onclick="nfJourneyStep(\''+a.id+'\',\''+esc(s.stage)+'\')"><b>'+esc(s.stage)+'</b><p>'+esc(s.text)+'</p><span>'+esc(s.by)+' · '+esc(s.date)+'</span></div></li>').join('')+'</ol><div class="action-row">'+(w.closure?'<button class="ghost-btn" onclick="nfShowNoc(\''+a.id+'\')">View NOC</button>':'')+(canClose?'<button class="primary-btn" onclick="nfOpenClosure(\''+a.id+'\')">Close Loan &amp; Issue NOC</button>':'')+'</div></div>';
  }
  const baseRender = renderCase;
  renderCase = function(id) {
    const r = baseRender.apply(this, arguments);
    const a = getApp(id); const main = document.querySelector('.case-main');
    if (a && main) { const html = journeyCard(a); if (html) main.insertAdjacentHTML('afterbegin', html + '<div style="height:16px"></div>'); }
    return r;
  };
  window.nfOpenClosure = function(id) {
    const a = getApp(id); if (!a) return;
    if (currentUser.role === 'CEO') return showToast('CEO can view but cannot close loans');
    const rate = products[a.product]?.rate || RATE[a.product] || 14, n = products[a.product]?.tenure || 60;
    showModal('Close Loan • '+id, '<div class="modal-kv"><div><span>Customer</span><b>'+esc(a.customer)+'</b></div><div><span>Deal</span><b>'+esc(a.workflow.dealId||'—')+'</b></div><div><span>Loan</span><b>'+money(a.amount)+' · '+rate+'% · '+n+' m</b></div></div><div style="height:12px"></div><div class="field-grid three"><label>EMIs paid<input id="nfClosePaid" type="number" min="0" max="'+n+'" value="'+Math.min(12,n)+'"></label><label>Days since last EMI<input id="nfCloseDays" type="number" min="0" max="31" value="0"></label><label>Closure mode<select id="nfCloseMode"><option>Foreclosure</option><option>Regular maturity</option></select></label></div><div id="nfCloseCalc" class="modal-kv"></div><label>Payment reference<input id="nfCloseRef" placeholder="e.g. UTR / receipt no."></label><div class="notice warn">Reducing-balance calculation · 4% foreclosure charge + 18% GST (waived at maturity). Demo closure in this browser only.</div>',
      '<button class="ghost-btn" onclick="closeModal()">Cancel</button><button class="primary-btn" onclick="nfConfirmClosure(\''+id+'\')">Confirm Closure</button>');
    const upd = () => { const paid = Math.max(0, Math.min(n, +document.getElementById('nfClosePaid').value||0)), days = Math.max(0, Math.min(31, +document.getElementById('nfCloseDays').value||0)), mat = document.getElementById('nfCloseMode').value==='Regular maturity';
      const c = loanCalc(a.amount, rate, n, mat?n:paid, mat?0:days); if (mat) { c.charge = 0; c.gst = 0; c.total = c.principal; }
      window.__nfClose = c; document.getElementById('nfCloseCalc').innerHTML = '<div><span>EMI</span><b>'+fmt(c.emi)+'</b></div><div><span>Principal outstanding</span><b>'+fmt(c.principal)+'</b></div><div><span>Broken-period interest</span><b>'+fmt(c.broken)+'</b></div><div><span>Foreclosure charge</span><b>'+fmt(c.charge)+'</b></div><div><span>GST 18%</span><b>'+fmt(c.gst)+'</b></div><div><span>Total payable</span><b>'+fmt(c.total)+'</b></div>'; };
    ['nfClosePaid','nfCloseDays','nfCloseMode'].forEach(x => document.getElementById(x).addEventListener('input', upd)); document.getElementById('nfCloseMode').addEventListener('change', upd); upd();
  };
  window.nfConfirmClosure = function(id) {
    const due = window.__nfClose?.total ?? 0;
    const a = getApp(id); if (!a) return;
    const ref = (document.getElementById('nfCloseRef')?.value || '').trim();
    if (!ref) return showToast('Enter the payment reference');
    const c = {date:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),noc:'NOC-'+id.replace(/^[A-Z]+-/,''),mode:document.getElementById('nfCloseMode').value,amount:due,ref,by:currentUser.role};
    a.workflow.closure = c; a.status = 'Closed'; a.stage = 7; a.workflow.lmsStatus = 'Closed';
    closures[id] = c; saveClosures();
    logAudit(id, 'Loan Closed', c.mode+' · '+ref+' · NOC '+c.noc);
    closeModal(); showToast('Loan closed · NOC '+c.noc+' issued'); renderCase(id);
  };
  window.nfShowNoc = function(id) {
    const a = getApp(id), c = a?.workflow?.closure; if (!c) return;
    const text = 'NO OBJECTION CERTIFICATE (DEMO)\n\nNamdev Finvest Ltd. confirms that loan '+(a.workflow.dealId||id)+' of '+a.customer+' ('+a.product+') has been fully repaid by '+c.mode+' on '+c.date+'.\nNOC No: '+c.noc+'\nWe have no objection to removal of hypothecation.\n\nThis is a sample document for demonstration only.';
    showModal('NOC • '+c.noc, '<pre class="nf-noc">'+esc(text)+'</pre>', '<button class="ghost-btn" onclick="closeModal()">Close</button><button class="primary-btn" onclick="nfDownloadNoc(\''+id+'\')">Download NOC</button>');
    window.__nfNocText = text;
  };
  window.nfDownloadNoc = function(id) { downloadText(id+'-NOC.txt', window.__nfNocText || '', 'text/plain'); };
  const baseCeo = renderCEOPersonalizedDashboard;
  renderCEOPersonalizedDashboard = function() {
    const r = baseCeo.apply(this, arguments); const a = getApp(ID); const grid = document.querySelector('.nf-story-grid');
    if (a && grid && !document.querySelector('.nf-showcase')) { const art = grid.closest('article,section') || grid;
      art.insertAdjacentHTML('beforebegin','<article class="nf-exec-card nf-showcase"><header class="nf-card-head"><div><span>SHOWCASE CASE · TRACTOR LOAN</span><h3>'+esc(a.customer)+' · '+a.id+'</h3><p>Lead → Application → Credit → Sanction → Disbursement → Closure · ₹8,50,000 · '+esc(a.workflow.closure?'Closed, NOC '+a.workflow.closure.noc:a.status)+'</p></div><button onclick="renderCase(\''+ID+'\')">Open journey ↗</button></header></article>'); }
    return r;
  };
  const baseMemo = showCreditMemo;
  showCreditMemo = function(id) {
    const r = baseMemo.apply(this, arguments); const a = getApp(id);
    if (a && a.product === 'Tractor Loan') { const body = document.querySelector('#modalRoot .modal-body, #modalRoot .modal-content, #modalRoot'); const s = a.asset || {};
      const kv = document.querySelector('#modalRoot .modal-kv');
      if (kv) kv.insertAdjacentHTML('beforeend','<div><span>Asset</span><b>'+esc((s.tractorMake||'Tractor')+' '+(s.tractorModel||''))+'</b></div><div><span>Dealer</span><b>'+esc(s.dealerName||'—')+'</b></div><div><span>Land holding</span><b>'+esc(s.landHolding?s.landHolding+' acres':'—')+'</b></div><div><span>Recommendation</span><b>'+(a.score>=700?'Approve':'Refer')+'</b></div>');
    }
    if (a) logAudit(id, 'Credit Memo Generated', 'Score '+(a.score||'Pending'));
    return r;
  };
})();
</script>`;