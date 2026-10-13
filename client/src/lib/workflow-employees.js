// Employee presentation and demo state stay inside the legacy workspace.
export const workflowEmployeesScript = String.raw`<script>
(() => {
  const sheet = document.createElement('link'); sheet.rel='stylesheet'; sheet.href='/workflow/employee-onboarding.css'; document.head.appendChild(sheet);
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const steps=['Employee Profile','Documents','Demo KYC','HR Approval','Onboarding'];
  const docs=['Identity proof','PAN proof','Bank proof','Offer / employment agreement'];
  const checks=['Identity matches employee profile','PAN matches submitted proof','Bank beneficiary matches employee','Consent recorded'];
  const readiness=['Offer accepted','Background check reviewed (demo)','Payroll details reviewed','Equipment / access readiness (demo)','Policy & NDA acknowledged','Mandatory training completed (demo)'];
  const depts=['Sales','Credit','Operations','Technical','Legal','Information Technology','Human Resources','Compliance','Internal Audit','Administration'];
  let draft=null, step=0, error='', dirty=false, uploadVersion=0;
  const byId=id=>nfCorp.employees.find(e=>e.id===id);
  const field=(id)=>document.getElementById(id)?.value?.trim()||'';
  function blank(){return {id:'NF-EMP-'+crypto.randomUUID(),name:'',role:'',dept:'Sales',branch:'Corporate Office',join:nfToday(),salary:50000,manager:'',mobile:'',email:'',address:'',pan:'',identityLast4:'',bankName:'',bankLast4:'',ifsc:'',photo:'',status:'Draft',attendance:0,leave:18,onboardingDemo:{documents:{},consent:false,checks:[],kyc:'Not verified',approval:'Not submitted',approvalNote:'',readiness:[],audit:[]}};}
  function prepare(e){const copy={...blank(),...structuredClone(e)};copy.onboardingDemo=copy.onboardingDemo||blank().onboardingDemo;return copy;}
  function log(action){draft.onboardingDemo.audit.unshift({action,at:new Date().toISOString(),by:'Demo HR reviewer'});}
  function invalidated(){const d=draft.onboardingDemo;d.kyc='Not verified';delete d.verifiedAt;delete d.kycNumber;d.checks=[];d.approval='Not submitted';d.readiness=[];draft.status='Draft';}
  function readForm(){
    if(!draft)return;
    if(step===0&&document.getElementById('ne-name')){
      const keys=['name','role','dept','branch','join','manager','mobile','email','address','pan','identityLast4','bankName','bankLast4','ifsc','salary'];
      const old=JSON.stringify(keys.map(k=>draft[k]));
      keys.filter(k=>k!=='salary').forEach(k=>draft[k]=field('ne-'+k));
      draft.pan=draft.pan.toUpperCase();draft.ifsc=draft.ifsc.toUpperCase();draft.salary=Number(field('ne-salary'));
      if(old!==JSON.stringify(keys.map(k=>draft[k])))invalidated();
    }
    if(step===1&&document.getElementById('ne-consent')){draft.onboardingDemo.consent=document.getElementById('ne-consent').checked;if(!draft.onboardingDemo.consent&&draft.onboardingDemo.kyc==='Demo verified')invalidated();}
    if(step===2&&document.querySelector('[data-ne-check]')){const values=Array.from(document.querySelectorAll('[data-ne-check]')).map(el=>el.checked);if(values.some(v=>!v)&&draft.onboardingDemo.kyc==='Demo verified')invalidated();draft.onboardingDemo.checks=values;}
    if(step===3&&document.getElementById('ne-review-note'))draft.onboardingDemo.approvalNote=field('ne-review-note');
    if(step===4&&document.querySelector('[data-ne-ready]')){draft.onboardingDemo.readiness=Array.from(document.querySelectorAll('[data-ne-ready]')).map(el=>el.checked);if(draft.status==='Active'&&draft.onboardingDemo.readiness.some(v=>!v))draft.status='Onboarding';}
  }
  function profileError(full){
    if(!draft.name||draft.name.length>100)return 'Enter an employee name (up to 100 characters).';
    for(const k of ['role','branch','manager','bankName'])if(draft[k].length>100)return 'Keep role, branch, manager and bank name within 100 characters.';
    if(draft.address.length>500)return 'Keep the address within 500 characters.';
    if(!Number.isFinite(draft.salary)||draft.salary<0||draft.salary>10000000)return 'Enter a valid monthly salary between 0 and 10,000,000.';
    if(draft.mobile&&!/^[6-9][0-9]{9}$/.test(draft.mobile))return 'Enter a 10-digit Indian mobile number.';
    if(draft.email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)||draft.email.length>254))return 'Enter a valid email address.';
    if(draft.pan&&!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(draft.pan))return 'PAN format must be five letters, four digits and one letter.';
    if(draft.identityLast4&&!/^\d{4}$/.test(draft.identityLast4))return 'Enter only the last four identity digits.';
    if(draft.bankLast4&&!/^\d{4}$/.test(draft.bankLast4))return 'Enter only the last four bank account digits.';
    if(draft.ifsc&&!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(draft.ifsc))return 'Enter a valid 11-character IFSC format.';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.join)||Number.isNaN(Date.parse(draft.join)))return 'Select a joining date.';
    if(full&&['role','branch','manager','mobile','email','address','pan','identityLast4','bankName','bankLast4','ifsc'].some(k=>!draft[k]))return 'Complete the employee, contact, identity and bank fields first.';
    if(nfCorp.employees.some(e=>e.id!==draft.id&&((draft.email&&e.email?.toLowerCase()===draft.email.toLowerCase())||(draft.pan&&e.pan===draft.pan))))return 'This email or PAN already belongs to another employee.';
    return '';
  }
  function kycError(){return profileError(true)||(!draft.onboardingDemo.consent?'Employee consent is required.':docs.some(k=>!draft.onboardingDemo.documents[k])?'Add all four document evidence entries first.':draft.onboardingDemo.checks.length!==4||draft.onboardingDemo.checks.some(v=>!v)?'Complete all four demo KYC checks.':'');}
  function persist(action){
    const issue=profileError(false);if(issue){error=issue;render();return false;}
    const snapshot=structuredClone(nfCorp);if(action)log(action);
    const idx=nfCorp.employees.findIndex(e=>e.id===draft.id);
    if(idx<0)nfCorp.employees.unshift(structuredClone(draft));else nfCorp.employees[idx]=structuredClone(draft);
    const d=draft.onboardingDemo;const done=d.readiness.filter(Boolean).length;
    const progress=draft.status==='Active'?100:Math.round((1+(docs.filter(k=>d.documents[k]).length/4)+(d.kyc==='Demo verified'?1:0)+(d.approval==='Approved'?1:0)+done/6)/5*100);
    const entry={id:'ONB-'+draft.id,employeeId:draft.id,name:draft.name,role:draft.role,progress,owner:draft.manager||'HR Manager',due:draft.join,stage:draft.status==='Active'?'Completed':d.approval==='Approved'?'Access & Assets':d.kyc==='Demo verified'?'HR Approval':'Documents & KYC'};
    const oi=nfCorp.onboarding.findIndex(o=>o.employeeId===draft.id);if(oi<0)nfCorp.onboarding.unshift(entry);else nfCorp.onboarding[oi]=entry;
    try{nfCorpSave();dirty=false;renderHRMSWorkspace();return true;}catch{nfCorp=snapshot;error='Browser storage is full or unavailable. Nothing was saved; remove the photo or free storage and retry.';render();return false;}
  }
  function input(k,label,type='text',max=100){return '<label>'+label+'<input id="ne-'+k+'" type="'+type+'" maxlength="'+max+'" value="'+esc(draft[k])+'"'+(type==='number'?' min="0" max="10000000"':'')+'></label>';}
  function render(){
    if(!draft)return;uploadVersion++;
    const d=draft.onboardingDemo;let body='';
    if(step===0)body='<div class="nf-employee-form">'+input('name','Employee Name')+input('role','Role / Designation')+'<label>Department<select id="ne-dept">'+depts.map(v=>'<option '+(v===draft.dept?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+input('branch','Branch')+input('manager','Reporting Manager')+input('join','Joining Date','date')+input('salary','Monthly Salary (₹)','number')+input('mobile','Mobile','tel',10)+input('email','Email','email',254)+input('address','Address','text',500)+input('pan','PAN (demo data only)','text',10)+input('identityLast4','Identity • last 4 digits only','text',4)+input('bankName','Bank Name')+input('bankLast4','Bank Account • last 4 digits','text',4)+input('ifsc','IFSC','text',11)+'<label>Profile Photo (optional)'+(draft.photo?'<img class="nf-employee-photo" src="'+esc(draft.photo)+'" alt="Employee profile"><button class="ghost-btn" onclick="neRemovePhoto()">Remove photo</button>':'')+'<input type="file" accept="image/png,image/jpeg,image/webp" onchange="nePhoto(this)"><small>Demo image only · maximum 200 KB</small></label></div>';
    if(step===1)body='<div class="notice info">Demo evidence only. Selected filenames are saved; document contents are not uploaded or retained. Use synthetic documents, not personal records.</div>'+docs.map((name,i)=>{const file=d.documents[name];return '<div class="nf-employee-doc"><div><b>'+name+'</b><small data-no-translate>'+(file?esc(file.name)+' · '+(file.sample?'Demo sample':'Filename recorded'):'No evidence added')+'</small></div><div><input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" aria-label="'+name+' file" onchange="neDocument('+i+',this)"><div class="nf-employee-actions"><button class="ghost-btn" onclick="neSample('+i+')">Use demo sample</button>'+(file?'<button class="ghost-btn" onclick="neRemoveDoc('+i+')">Remove</button>':'')+'</div></div></div>';}).join('')+'<div class="nf-employee-checks"><label><input id="ne-consent" type="checkbox" '+(d.consent?'checked':'')+'>Employee consent to demo document review</label></div>';
    if(step===2)body='<div class="nf-profile-summary"><div><span>Demo KYC status</span><b>'+esc(d.kyc)+'</b></div><div><span>Demo KYC number</span><b data-no-translate>'+esc(d.kycNumber||'Not issued')+'</b></div><div><span>Verified at</span><b>'+esc(d.verifiedAt?new Date(d.verifiedAt).toLocaleString('en-IN'):'Not verified')+'</b></div><div><span>PAN / identity</span><b data-no-translate>'+esc(draft.pan||'—')+' / •••• '+esc(draft.identityLast4||'—')+'</b></div></div><div class="nf-employee-checks">'+checks.map((v,i)=>'<label><input data-ne-check type="checkbox" '+(d.checks[i]?'checked':'')+'>'+v+'</label>').join('')+'</div><button class="primary-btn" onclick="neVerify()">Verify demo KYC</button><div class="notice info">Simulation only · not government KYC, bank verification or background verification.</div>';
    if(step===3)body='<div class="nf-profile-summary"><div><span>HR approval</span><b>'+esc(d.approval)+'</b></div><div><span>Employee</span><b data-no-translate>'+esc(draft.name)+'</b></div><div><span>Role / Branch</span><b data-no-translate>'+esc(draft.role)+' / '+esc(draft.branch)+'</b></div><div><span>Monthly Salary</span><b>'+nfMoney(draft.salary)+'</b></div></div><label>Review / correction notes<textarea id="ne-review-note" maxlength="500">'+esc(d.approvalNote)+'</textarea></label><div class="nf-employee-actions"><button class="ghost-btn" onclick="neApprove(\'Submit\')">Submit for HR review</button><button class="ghost-btn" onclick="neApprove(\'Returned\')">Return for correction</button><button class="primary-btn" onclick="neApprove(\'Approved\')">Approve (demo)</button></div><div class="notice info">Demo HR review · no sign-in account or system access is provisioned.</div>';
    if(step===4)body='<div class="nf-employee-checks">'+readiness.map((v,i)=>'<label><input data-ne-ready type="checkbox" '+(d.readiness[i]?'checked':'')+' '+(d.approval!=='Approved'?'disabled':'')+'>'+v+'</label>').join('')+'</div><button class="primary-btn" onclick="neActivate()" '+(draft.status==='Active'?'disabled':'')+'>'+(draft.status==='Active'?'Onboarding complete':'Complete onboarding & activate (demo)')+'</button><div class="notice info">Activation updates this demo employee record only; payroll, equipment and access are not actually provisioned.</div>';
    const history='<h4>Activity history</h4><ul class="nf-employee-audit">'+d.audit.slice(0,12).map(a=>'<li><b>'+esc(a.action)+'</b><small> · '+esc(new Date(a.at).toLocaleString('en-IN'))+' · '+esc(a.by)+'</small></li>').join('')+'</ul>';
    showModal('Employee onboarding', '<div class="notice info">Client demo · browser-local profiles · synthetic data only</div><div class="nf-employee-meta"><b data-no-translate>'+esc(draft.name||'New employee')+'</b><span>'+esc(draft.status)+'</span><small data-no-translate>'+esc(draft.id)+'</small></div><nav class="nf-employee-steps" aria-label="Employee onboarding steps">'+steps.map((v,i)=>'<button class="'+(i===step?'active':'')+'" onclick="neStep('+i+')" '+(i===step?'aria-current="step"':'')+'>'+(i+1)+'. '+v+'</button>').join('')+'</nav>'+(error?'<p role="alert" class="nf-employee-error">'+esc(error)+'</p>':'')+body+history,'<button class="ghost-btn" onclick="neClose()">Close</button><button class="ghost-btn" onclick="neSave()">Save draft / progress</button>'+(step>0?'<button class="ghost-btn" onclick="neStep('+(step-1)+')">Back</button>':'')+(step<4?'<button class="primary-btn" onclick="neStep('+(step+1)+')">Next</button>':''));
    const modal=document.querySelector('#modalRoot .modal');if(modal){modal.classList.add('nf-employee-modal');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Employee onboarding');modal.addEventListener('input',()=>dirty=true);modal.addEventListener('change',()=>dirty=true);}
    document.querySelector('#modalRoot .close-btn')?.setAttribute('onclick','neClose()');
    document.querySelector('#modalRoot .modal-overlay')?.setAttribute('onclick','if(event.target===this)neClose()');
  }
  window.neStep=i=>{readForm();step=Math.max(0,Math.min(4,i));error='';render();};
  window.neSave=()=>{readForm();if(persist('Profile / progress saved')){showToast('Employee demo profile saved');render();}};
  window.neClose=()=>{readForm();if(dirty&&!confirm('Close without saving the latest changes?'))return;draft=null;uploadVersion++;closeModal();};
  window.neSample=i=>{readForm();invalidated();draft.onboardingDemo.documents[docs[i]]={name:'DEMO-'+docs[i].replaceAll(' ','-')+'.pdf',sample:true,at:new Date().toISOString()};dirty=true;error='';render();};
  window.neRemoveDoc=i=>{readForm();invalidated();delete draft.onboardingDemo.documents[docs[i]];dirty=true;render();};
  window.neDocument=(i,el)=>{readForm();const file=el.files?.[0];if(!file)return;if(!/\.(pdf|png|jpe?g|webp)$/i.test(file.name)||file.size>5*1024*1024||file.size===0){error='Choose a non-empty PDF or image up to 5 MB.';render();return;}invalidated();draft.onboardingDemo.documents[docs[i]]={name:file.name.slice(0,180),size:file.size,at:new Date().toISOString(),sample:false};dirty=true;error='';render();};
  window.nePhoto=async el=>{readForm();const file=el.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>200*1024||!file.size){error='Choose a PNG, JPEG or WebP demo photo up to 200 KB.';render();return;}const version=uploadVersion;try{const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});if(!draft||version!==uploadVersion)return;const image=new Image();image.src=data;await image.decode();if(!draft||version!==uploadVersion)return;draft.photo=data;dirty=true;error='';render();}catch{error='This image could not be opened.';if(draft)render();}};
  window.neRemovePhoto=()=>{readForm();draft.photo='';dirty=true;render();};
  window.neVerify=()=>{readForm();error=kycError();if(error){render();return;}const old=structuredClone(draft);const d=draft.onboardingDemo;d.kyc='Demo verified';d.kycNumber=d.kycNumber||'DEMO-EMP-KYC-'+crypto.randomUUID().slice(0,8).toUpperCase();d.verifiedAt=new Date().toISOString();draft.status='KYC complete';if(!persist('Demo KYC verified')){draft=old;render();return;}error='';render();showToast('Demo KYC verified · '+d.kycNumber);};
  window.neApprove=action=>{readForm();const d=draft.onboardingDemo;error=profileError(true);if(!error&&d.kyc!=='Demo verified')error='Verify demo KYC before HR submission or approval.';if(!error&&action==='Approved'&&d.approval!=='Pending review')error='Submit for HR review before approving.';if(!error&&action==='Returned'&&!d.approvalNote)error='Enter a correction note before returning.';if(!error&&d.approvalNote.length>500)error='Keep review notes within 500 characters.';if(error){render();return;}const old=structuredClone(draft);if(action==='Submit'){d.approval='Pending review';draft.status='Pending HR approval';}else{d.approval=action;draft.status=action==='Approved'?'Onboarding':'Correction required';if(action==='Returned'){d.kyc='Not verified';delete d.kycNumber;delete d.verifiedAt;d.checks=[];d.readiness=[];}}if(!persist('HR review: '+d.approval)){draft=old;render();return;}error='';render();};
  window.neActivate=()=>{readForm();const d=draft.onboardingDemo;error=profileError(true)||(d.kyc!=='Demo verified'?'Demo KYC must be verified.':d.approval!=='Approved'?'HR approval is required.':d.readiness.length!==6||d.readiness.some(v=>!v)?'Complete all six onboarding checks.':'');if(error){render();return;}const old=structuredClone(draft);draft.status='Active';if(!persist('Demo onboarding completed')){draft=old;render();return;}render();showToast('Employee onboarding complete · demo record active');};
  nfHRAddEmployee=function(){draft=blank();dirty=false;step=0;error='';render();};
  nfHRSaveEmployee=window.neSave;
  nfOpenEmployeeFromHR=function(id){const e=byId(id);if(!e)return;draft=prepare(e);dirty=false;step=0;error='';render();};
  window.neOpenAt=(id,i)=>{nfOpenEmployeeFromHR(id);step=i;render();};
  const originalHR=renderHRMSWorkspace;
  renderHRMSWorkspace=function(){
    originalHR();
    if(nfCorp.hrTab==='Documents & Compliance'){
      const rows=document.querySelectorAll('#content table tbody tr');rows.forEach((row,i)=>{const e=nfCorp.employees[i];if(!e)return;const d=e.onboardingDemo;const cells=row.querySelectorAll('td');[1,2,3,4,5].forEach((n)=>{if(cells[n])cells[n].innerHTML=nfPill(d?(n<=3?d.kyc==='Demo verified'?'Demo verified':'Not verified':n===4?d.readiness[1]?'Demo reviewed':'Pending':d.readiness[4]?'Acknowledged':'Pending'):'Legacy demo');});const cell=cells[6];if(cell){cell.innerHTML='';const button=document.createElement('button');button.className='nf-mini';button.textContent='Open onboarding';button.onclick=()=>window.neOpenAt(e.id,2);cell.appendChild(button);}});
    }
    if(nfCorp.hrTab==='Onboarding')document.querySelectorAll('#content .nf-corp-static').forEach((row,i)=>{const o=nfCorp.onboarding[i];const id=o?.employeeId;if(!id||!byId(id))return;const button=document.createElement('button');button.className='nf-mini';button.textContent='Open onboarding';button.onclick=()=>window.neOpenAt(id,4);row.appendChild(button);});
  };
})();
</script>`;