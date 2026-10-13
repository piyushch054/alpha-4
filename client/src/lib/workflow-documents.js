// Actual browser-local document bytes, separate from legacy readiness percentages.
export const workflowDocumentsScript = String.raw`<link rel="stylesheet" href="/workflow/document-viewer.css"><script>
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selected = '', files = [], query = '', category = 'All categories', previewUrls = [], loadVersion = 0;
  const drafts = new WeakMap(), pending = new Set();
  const db = new Promise((resolve, reject) => {
    const request = indexedDB.open('namdev-case-documents', 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('files', {keyPath:'key'}); request.result.createObjectStore('cases', {keyPath:'id'}); };
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  db.catch(() => {});
  async function read(store) {
    const database = await db;
    return new Promise((resolve, reject) => { const request = database.transaction(store).objectStore(store).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
  }
  async function write(store, records) {
    const database = await db;
    return new Promise((resolve, reject) => { const tx = database.transaction(store, 'readwrite'); records.forEach(record => tx.objectStore(store).put(record)); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
  }
  function release() { previewUrls.forEach(url => URL.revokeObjectURL(url)); previewUrls = []; }
  const close = closeModal;
  closeModal = function() { release(); return close.apply(this, arguments); };
  const modal = showModal;
  showModal = function() { release(); return modal.apply(this, arguments); };
  const originalHub = renderDocumentsHub;
  renderDocumentsHub = function() {
    originalHub();
    const table = document.querySelector('#content table'); if (!table) return;
    const controls = document.createElement('div'); controls.className = 'nf-doc-controls';
    controls.innerHTML = '<label>Customer / Case<input id="nfDocCase" list="nfDocCases" placeholder="Search case ID or customer" autocomplete="off"><datalist id="nfDocCases">'+applications.map(a => '<option value="'+esc(a.id+' · '+a.customer)+'"></option>').join('')+'</datalist></label><label>Document search<input id="nfDocSearch" placeholder="Search documents" value="'+esc(query)+'"></label><label>Category<select id="nfDocCategory">'+['All categories', ...new Set(docChecklist.map(d => d.category))].map(c => '<option '+(c===category?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select></label>';
    table.closest('.table-wrap').before(controls);
    const info = document.createElement('p'); info.id='nfDocInfo'; info.className='nf-doc-info'; info.setAttribute('role','status'); controls.after(info);
    const current = getApp(selected); document.getElementById('nfDocCase').value = current ? current.id+' · '+current.customer : '';
    table.tHead.rows[0].insertAdjacentHTML('beforeend','<th>File status</th><th>Documents</th>');
    updateRows(); refreshFiles();
  };
  function matches() { return docChecklist.map((doc,index) => ({doc,index})).filter(({doc}) => (category==='All categories'||doc.category===category)&& (doc.name+' '+doc.category).toLowerCase().includes(query.toLowerCase())); }
  function forDoc(index) {
    const found = files.filter(file => file.caseId===selected && file.document===docChecklist[index].name);
    const photo = getApp(selected)?.livePhoto;
    if (index===0 && !found.length && /^data:image\/(jpeg|png|webp);base64,/.test(photo?.dataUrl || '')) found.push({name:'Live photo.jpg', side:'front', dataUrl:photo.dataUrl, uploadedAt:photo.capturedAt});
    return found;
  }
  function status(index) { const list=forDoc(index); return !selected?'Select case':!list.length?'Missing':docChecklist[index].side==='frontRear'&&!(list.some(f=>f.side==='front')&&list.some(f=>f.side==='rear'))?'Partial':'Available'; }
  function updateRows() {
    const table = document.querySelector('#content table'); if (!table || !document.getElementById('nfDocInfo')) return;
    table.tBodies[0].innerHTML = matches().map(({doc:d,index}) => '<tr><td><span class="badge gray">'+esc(d.category)+'</span></td><td><b>'+esc(d.name)+'</b></td><td>'+esc(d.mandatory)+'</td><td>'+esc(d.type)+'</td><td><span class="badge '+(status(index)==='Available'?'green':status(index)==='Partial'?'amber':'gray')+'">'+status(index)+'</span></td><td><button class="ghost-btn nf-doc-view" data-doc-view="'+index+'">View'+(forDoc(index).length?' ('+forDoc(index).length+')':'')+'</button></td></tr>').join('') || '<tr><td colspan="6">No matching documents</td></tr>';
    const a=getApp(selected), count=docChecklist.filter((_,i)=>forDoc(i).length).length;
    document.getElementById('nfDocInfo').textContent = a ? a.customer+' · '+a.product+' · '+a.branch+' — '+count+'/'+docChecklist.length+' document fields have files. Browser-local demo files; checklist percentages do not prove file availability.' : 'Select a customer / case to view its uploaded files.';
  }
  async function refreshFiles() {
    const token=++loadVersion;
    try { const records=await read('files'); if(token!==loadVersion)return; files=records; updateRows(); }
    catch { const info=document.getElementById('nfDocInfo'); if(info)info.textContent='Local file storage is unavailable. Please enable browser storage and reload.'; }
  }
  function openViewer(index) {
    const d=docChecklist[index]; if(!d)return;
    if(!selected) { showToast('Choose a customer / case first, then view its documents'); const picker=document.getElementById('nfDocCase'); if(picker){picker.focus();picker.scrollIntoView({block:'center'});} return; }
    const a=getApp(selected); if(!a)return;
    const list=forDoc(index);
    showModal('Document viewer', '<div class="nf-doc-context" data-no-translate><b>'+esc(d.name)+'</b><span>'+esc(a.id+' · '+a.customer)+'</span></div><p>'+esc(d.mandatory+' · '+d.type)+'</p><div class="nf-doc-tabs">'+(list.map((file,i)=>'<button class="ghost-btn" data-doc-file="'+i+'" data-doc-index="'+index+'">'+(file.side==='rear'?'Rear':'Front / File')+'</button>').join(''))+'</div><div id="nfDocPreview" class="nf-doc-preview"></div><div class="nf-doc-upload">'+(d.side==='frontRear'?['front','rear']:['front']).map(side=>'<label class="upload-btn">Upload '+(d.side==='frontRear'?side:'file')+'<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" data-doc-upload="'+index+'" data-doc-side="'+side+'" data-doc-case="'+esc(a.id)+'"></label>').join('')+'</div><p id="nfDocUploadStatus" role="status">Browser-local demo files · No identity verification</p>', '<button class="ghost-btn" data-doc-checklist>Back to checklist</button><button class="primary-btn" onclick="closeModal()">Close</button>');
    const dialog=document.querySelector('#modalRoot .modal'); dialog.classList.add('nf-doc-dialog'); dialog.setAttribute('role','dialog'); dialog.setAttribute('aria-modal','true'); dialog.setAttribute('aria-label','Document viewer');
    document.querySelector('[data-doc-checklist]').focus(); showFile(index,0);
  }
  function showFile(index,position) {
    release(); const box=document.getElementById('nfDocPreview'); if(!box)return;
    const file=forDoc(index)[position];
    if(!file) { box.innerHTML='<div class="empty-state"><h3>Document not uploaded</h3><p>No file is available for this case and document field.</p></div>'; return; }
    const url=file.blob?URL.createObjectURL(file.blob):file.dataUrl; if(file.blob)previewUrls.push(url);
    const mime=file.blob?.type || 'image/jpeg';
    box.innerHTML='<div class="nf-doc-file-meta" data-no-translate><b>'+esc(file.name)+'</b><span>'+esc(new Date(file.uploadedAt).toLocaleString())+'</span><a class="ghost-btn" href="'+esc(url)+'" download="'+esc(file.name)+'">Download</a></div>'+(mime==='application/pdf'?'<iframe title="Uploaded PDF document" src="'+esc(url)+'"></iframe>':'<img src="'+esc(url)+'" alt="'+esc(docChecklist[index].name)+'">');
    document.querySelectorAll('[data-doc-file]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.docFile)===position)));
  }
  function valid(file) { if(file.size>20*1024*1024){showToast('File must be 20 MB or smaller');return false;} if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)){showToast('Choose a JPG, PNG, WebP or PDF file');return false;}return true; }
  document.addEventListener('input',event=>{ if(event.target.id==='nfDocSearch'){query=event.target.value;updateRows();} });
  document.addEventListener('change',async event=>{
    const input=event.target;
    if(input.id==='nfDocCase'){ const value=input.value.trim(); const next=applications.find(a=>a.id===value||a.id+' · '+a.customer===value)?.id||''; if(next!==selected){selected=next;updateRows();} }
    if(input.id==='nfDocCategory'){category=input.value;updateRows();}
    if(input.matches('[data-doc-upload]')) {
      const file=input.files?.[0], index=Number(input.dataset.docUpload), id=input.dataset.docCase; if(!file||!valid(file)||!getApp(id))return;
      const message=document.getElementById('nfDocUploadStatus'); message.textContent='Saving file…';
      const record={key:JSON.stringify([id,docChecklist[index].name,input.dataset.docSide]),caseId:id,document:docChecklist[index].name,side:input.dataset.docSide,name:file.name,blob:file,uploadedAt:new Date().toISOString()};
      input.disabled=true;
      try { await write('files',[record]); files=files.filter(f=>f.key!==record.key).concat(record);updateRows(); if(message.isConnected&&selected===id)openViewer(index); showToast('Document saved locally'); }
      catch { message.textContent='File could not be saved. Check browser storage space and try again.';input.disabled=false; }
    }
  });
  document.addEventListener('click',event=>{ const button=event.target.closest('[data-doc-view],[data-doc-file],[data-doc-checklist]'); if(!button)return; if(button.hasAttribute('data-doc-view'))openViewer(Number(button.dataset.docView)); if(button.hasAttribute('data-doc-file'))showFile(Number(button.dataset.docIndex),Number(button.dataset.docFile)); if(button.hasAttribute('data-doc-checklist')){closeModal();navTo('documents');} });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.querySelector('.nf-doc-dialog'))closeModal();});
  openCaseDocuments=function(id){if(!getApp(id))return;selected=id;closeModal();navTo('documents');};
  const mark=markUploaded;
  markUploaded=function(input,nameKey,side){const file=input.files?.[0],d=docChecklist.find(d=>cssSafe(d.name)===nameKey);if(!file||!d||!valid(file))return;const list=drafts.get(wizard)||[];drafts.set(wizard,list.filter(f=>!(f.document===d.name&&f.side===side)).concat({document:d.name,side,name:file.name,blob:file,uploadedAt:new Date().toISOString()}));mark(input,nameKey,side);};
  const submit=submitApplication;
  submitApplication=async function(){
    if(pending.size)return;const token={};pending.add(token);
    const list=drafts.get(wizard)||[],ids=new Set(applications.map(a=>a.id));
    try {
      submit.apply(this,arguments); const created=applications.find(a=>!ids.has(a.id)); if(!created)return;
      await write('cases',[{...created}]);
      const records=list.map(f=>({...f,caseId:created.id,key:JSON.stringify([created.id,f.document,f.side])}));
      await write('files',records);files=files.concat(records);
    }catch{showToast('Document storage failed. Any created case remains in this session; retry uploads in Documents.');}
    finally{pending.delete(token);}
  };
  read('cases').then(records=>{records.forEach(a=>{if(!getApp(a.id))applications.unshift(a);}); if(document.getElementById('nfDocCase'))renderDocumentsHub();}).catch(()=>{});
  window.addEventListener('pagehide',release);
})();
</script>`;