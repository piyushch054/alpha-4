export const workflowApplicantScript = String.raw`<script>
(function(){
  const css = document.createElement('link'); css.rel='stylesheet'; css.href='/workflow/applicant-enhancements.css'; document.head.append(css);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const keys=['coName','coRelation','coMobile','coPan','coEmployment','coIncome','coEmployer','coDesignation'];
  const labels=['Name','Relationship','Mobile','PAN','Employment','Monthly Income','Employer / Business Name','Designation / Role'];
  const defaults={coName:'Priya Sharma',coRelation:'Spouse',coMobile:'9829055441',coPan:'FGHIJ5678K',coEmployment:'Salaried',coIncome:45000,coEmployer:'Apex Services',coDesignation:'Manager'};
  const relations=['Spouse','Parent','Sibling','Business Partner','Other'];
  const jobs=['Salaried','Self Employed','Business','Agriculture'];
  let stream=null, starting=false, generation=0;
  function state(){
    if(!Array.isArray(wizard.data.coApplicants)) wizard.data.coApplicants=[Object.fromEntries(keys.map(k=>[k,wizard.data[k] ?? defaults[k]]))];
    if(!wizard.data.guarantor) wizard.data.guarantor={...defaults};
    return wizard.data;
  }
  function saveParties(){
    const data=state();
    document.querySelectorAll('[data-party-index]').forEach(row=>{
      const party=row.dataset.partyKind==='Guarantor'?data.guarantor:data.coApplicants[Number(row.dataset.partyIndex)];
      if(!party)return;
      row.querySelectorAll('[data-party-field]').forEach(input=>party[input.dataset.partyField]=input.value);
    });
    const primary=wizard.coType==='Guarantor'?data.guarantor:data.coApplicants[0];
    keys.forEach(k=>data[k]=primary?.[k] ?? '');
  }
  function partyForm(party,index,kind){
    return '<section class="nf-co-entry" data-party-index="'+index+'" data-party-kind="'+kind+'"><div class="nf-applicant-title"><h4>'+kind+(kind==='Co-applicant'?' '+(index+1):'')+'</h4>'+(kind==='Co-applicant'?'<button type="button" class="ghost-btn" aria-label="Remove co-applicant '+(index+1)+'" onclick="removeCoApplicant('+index+')">Remove</button>':'')+'</div><div class="field-grid three">'+keys.map((key,i)=>{
      const id=kind==='Co-applicant'&&index>0?key+'_'+index:key;
      const value=party[key] ?? '';
      const options=key==='coRelation'?relations:key==='coEmployment'?jobs:null;
      const attrs=' id="'+id+'" data-party-field="'+key+'" aria-label="'+kind+' '+(index+1)+' '+labels[i]+'"';
      const control=options?'<select'+attrs+'>'+options.map(v=>'<option'+(v===value?' selected':'')+'>'+v+'</option>').join('')+'</select>':'<input'+attrs+' value="'+esc(value)+'"'+(key==='coIncome'?' type="number" min="0"':key==='coMobile'?' inputmode="numeric" maxlength="10"':key==='coPan'?' maxlength="10"':' maxlength="160"')+'>';
      return '<label class="field"><span>'+labels[i]+'</span>'+control+'</label>';
    }).join('')+'</div></section>';
  }
  stepCoApplicant=function(){
    const data=state();
    return wizardHeader('Co-applicant / Guarantor','Personal and employment information')+'<div class="doc-tabs">'+[['Co-applicant','Co-applicant'],['Guarantor','Guarantor'],['None','Not Required']].map(([type,label])=>'<button type="button" class="doc-tab '+(wizard.coType===type?'active':'')+'" onclick="selectCoParty(\''+type+'\')">'+label+'</button>').join('')+'</div>'+(wizard.coType==='None'?'<div class="notice info">No co-party required.</div>':wizard.coType==='Guarantor'?partyForm(data.guarantor,0,'Guarantor'):data.coApplicants.map((p,i)=>partyForm(p,i,'Co-applicant')).join('')+'<button type="button" class="secondary-btn" onclick="addCoApplicant()">+ Add co-applicant</button>')+wizardActions();
  };
  window.selectCoParty=function(type){saveParties();wizard.coType=type;renderWizard();};
  window.addCoApplicant=function(){saveParties();state().coApplicants.push({coName:'',coRelation:'Other',coMobile:'',coPan:'',coEmployment:'Salaried',coIncome:'',coEmployer:'',coDesignation:''});renderWizard();document.querySelectorAll('[data-party-index] input')[state().coApplicants.length*6-6]?.focus();};
  window.removeCoApplicant=function(index){saveParties();state().coApplicants.splice(index,1);renderWizard();};
  function validateParties(){
    saveParties();
    const rows=[...document.querySelectorAll('[data-party-index]')];
    if(wizard.coType==='Co-applicant'&&!rows.length){showToast('Add a co-applicant or choose Not Required');return false;}
    for(const row of rows){
      for(const key of ['coName','coMobile','coPan','coIncome']){
        const input=row.querySelector('[data-party-field="'+key+'"]');
        const value=input.value.trim();
        const valid=key==='coName'?!!value:key==='coMobile'?/^[6-9][0-9]{9}$/.test(value):key==='coPan'?/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase()):value!==''&&Number(value)>=0;
        if(!valid){input.setCustomValidity(key==='coMobile'?'Enter a valid 10-digit mobile number':key==='coPan'?'Enter a valid PAN':key==='coIncome'?'Enter monthly income (zero or higher)':'Enter the co-party name');input.reportValidity();return false;}
        input.setCustomValidity('');
      }
    }
    return true;
  }
  document.addEventListener('input',e=>{if(e.target.matches('[data-party-field]')){e.target.setCustomValidity('');saveParties();}});
  document.addEventListener('change',e=>{if(e.target.matches('[data-party-field]'))saveParties();});
  const captureData=captureWizardData;
  captureWizardData=function(){captureData();saveParties();};
  const next=wizardNext;
  wizardNext=function(){if(wizard.step===2&&!validateParties())return;stopPhotoCamera();next();};
  const back=wizardBack;
  wizardBack=function(){stopPhotoCamera();back();};
  function openJourneyStep(index){
    if(index===wizard.step)return;
    captureWizardData();stopPhotoCamera();
    if(typeof stopCamera==='function')stopCamera();
    wizard.step=index;renderWizard();
  }
  const renderJourney=renderWizard;
  renderWizard=function(){
    renderJourney();
    document.querySelectorAll('.wizard-sidebar .step-item').forEach((item,index)=>{
      item.setAttribute('role','button');item.tabIndex=0;item.style.cursor='pointer';
      item.setAttribute('aria-label','Open '+steps[index]);
      if(index===wizard.step)item.setAttribute('aria-current','step');
      item.addEventListener('click',()=>openJourneyStep(index));
      item.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openJourneyStep(index);}});
    });
  };
  function stopPhotoCamera(){generation++;stream?.getTracks().forEach(t=>t.stop());stream=null;starting=false;}
  function photoMarkup(photo,editable){
    return '<section class="nf-live-photo"><div class="nf-applicant-title"><h4>Customer live photo</h4><span class="badge '+(photo?'green':'gray')+'">'+(photo?'Photo captured · Not identity verified':'Not captured')+'</span></div><div class="nf-photo-layout"><div class="nf-photo-preview">'+(photo?'<img src="'+esc(photo.dataUrl)+'" alt="Customer captured live photo">':'<video id="applicantLiveVideo" autoplay muted playsinline aria-label="Customer live camera"></video><span id="nfPhotoPlaceholder">No photo captured</span>')+'</div><div class="nf-photo-controls">'+(photo?'<small>Captured '+esc(new Date(photo.capturedAt).toLocaleString())+'</small>':'')+(editable?'<label class="check"><input type="checkbox" id="applicantPhotoConsent" '+(wizard.data.photoConsent?'checked':'')+'> Customer consents to photo capture</label><div class="action-row"><button type="button" class="secondary-btn" onclick="startApplicantPhoto()">'+(photo?'Retake photo':'Start camera')+'</button><button type="button" class="primary-btn" id="applicantCapturePhoto" onclick="captureApplicantPhoto()" disabled>Capture photo</button><button type="button" class="ghost-btn" onclick="cancelApplicantPhoto()">Stop camera</button>'+(photo?'<button type="button" class="ghost-btn" onclick="removeApplicantPhoto()">Remove photo</button>':'')+'</div><p id="applicantPhotoStatus" role="status">'+(photo?'Photo saved in this demo application.':'')+'</p>':'')+'</div></div></section>';
  }
  const applicant=stepApplicant;
  stepApplicant=function(){const html=applicant();return html.replace('<div class="wizard-actions">',photoMarkup(wizard.data.livePhoto,true)+'<div class="wizard-actions">');};
  document.addEventListener('change',e=>{if(e.target.id==='applicantPhotoConsent'){wizard.data.photoConsent=e.target.checked;if(!e.target.checked)cancelApplicantPhoto();}});
  window.startApplicantPhoto=async function(){
    const status=document.getElementById('applicantPhotoStatus');
    if(!document.getElementById('applicantPhotoConsent')?.checked){status.textContent='Customer consent is required before opening the camera.';return;}
    if(starting||stream)return;
    if(!navigator.mediaDevices?.getUserMedia){status.textContent='Camera is unavailable in this browser. Open this app using HTTPS and a supported browser.';return;}
    starting=true;const token=++generation;status.textContent='Opening camera…';
    try{
      const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
      if(token!==generation||!document.getElementById('applicantPhotoStatus')){media.getTracks().forEach(t=>t.stop());return;}
      stream=media;const box=document.querySelector('.nf-photo-preview');box.innerHTML='<video id="applicantLiveVideo" autoplay muted playsinline aria-label="Customer live camera"></video>';
      const video=document.getElementById('applicantLiveVideo');video.srcObject=media;await video.play();
      if(token!==generation)return;
      document.getElementById('applicantCapturePhoto').disabled=false;status.textContent='Camera ready';
    }catch(error){stopPhotoCamera();status.textContent=error.name==='NotAllowedError'?'Camera permission denied. Allow camera access, then press Start camera.':'Camera unavailable. Check your camera connection and try again.';}
    finally{starting=false;}
  };
  window.captureApplicantPhoto=function(){
    const video=document.getElementById('applicantLiveVideo');
    if(!stream||!video?.videoWidth){document.getElementById('applicantPhotoStatus').textContent='Wait for the camera to be ready.';return;}
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=Math.round(640*video.videoHeight/video.videoWidth);
    const context=canvas.getContext('2d');if(!context)return;context.drawImage(video,0,0,canvas.width,canvas.height);
    wizard.data.livePhoto={dataUrl:canvas.toDataURL('image/jpeg',0.8),capturedAt:new Date().toISOString(),source:'live-camera'};wizard.docs['LIVE PHOTO']=true;
    captureWizardData();stopPhotoCamera();renderWizard();
  };
  window.cancelApplicantPhoto=function(){stopPhotoCamera();if(document.getElementById('applicantPhotoStatus')){captureWizardData();renderWizard();document.getElementById('applicantPhotoStatus').textContent='Camera stopped';}};
  window.removeApplicantPhoto=function(){captureWizardData();stopPhotoCamera();delete wizard.data.livePhoto;delete wizard.docs['LIVE PHOTO'];renderWizard();};
  function partySummary(parties){return parties.map((p,i)=>'<section class="nf-co-entry"><h4>Co-applicant '+(i+1)+'</h4><div class="summary-grid">'+keys.map((k,n)=>summary(labels[n],esc(p[k]))).join('')+'</div></section>').join('');}
  function extraDetails(data){return (data.livePhoto?photoMarkup(data.livePhoto,false):'')+(data.coApplicants?.length?partySummary(data.coApplicants):'')+(data.guarantor?'<section class="nf-co-entry"><h4>Guarantor</h4><div class="summary-grid">'+keys.map((k,n)=>summary(labels[n],esc(data.guarantor[k]))).join('')+'</div></section>':'');}
  function selectedDetails(){const data=state();return {livePhoto:data.livePhoto?{...data.livePhoto}:null,coApplicants:wizard.coType==='Co-applicant'?data.coApplicants.map(p=>({...p})):[],guarantor:wizard.coType==='Guarantor'?{...data.guarantor}:null};}
  const review=stepReview;
  stepReview=function(){return review().replace('<div class="wizard-actions">',extraDetails(selectedDetails())+'<div class="wizard-actions">');};
  const submit=submitApplication;
  submitApplication=async function(){const details=selectedDetails();const ids=new Set(applications.map(a=>a.id));stopPhotoCamera();await submit.apply(this,arguments);const created=applications.find(a=>!ids.has(a.id))||getWizardApplication();if(created){Object.assign(created,details);renderCase(created.id);}};
  const section=renderCaseSection;
  renderCaseSection=function(a,tab){return section(a,tab)+(tab==='Applicant'?extraDetails(a):'');};
  const navigate=navTo;
  navTo=function(){stopPhotoCamera();return navigate.apply(this,arguments);};
  window.addEventListener('pagehide',stopPhotoCamera);
})();
</script>`;