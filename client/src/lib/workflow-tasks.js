export const workflowTasksScript = String.raw`<script>
(function () {
  const hostOrigin = window.parent.location.origin;
  const originalTaskAction = window.taskAction;
  const findTask = id => v7Tasks.find(t => t.id === id);
  const taskTypeGroups = {
    'CEO & Business Review': ['Portfolio performance review', 'Branch performance review', 'Product growth strategy review', 'Board MIS review', 'High-value loan approval', 'Policy deviation approval'],
    'Risk & Compliance': ['Credit risk review', 'NPA / overdue account review', 'Fraud / RCU escalation review', 'KYC compliance review', 'Regulatory compliance review', 'Audit observation closure'],
    'Finance & Collections': ['Collections performance review', 'Recovery strategy approval', 'Settlement / write-off review', 'Liquidity & funding review', 'ALM review', 'Budget & expense approval'],
    'People & Operations': ['Disbursement exception review', 'Customer complaint escalation', 'Operational SLA escalation', 'HR / hiring approval', 'Project milestone review', 'Vendor / asset purchase approval'],
    'Loan Workflow': ['Customer clarification', 'Credit Cross Verification', 'Technical Visit', 'Legal Title Search', 'eSign Completion', 'Document Correction']
  };
  function taskTypeDropdown(id, selected) {
    const existing = document.getElementById(id);
    if (!existing || existing.closest('.nf-task-combobox')) return;
    const wrapper = document.createElement('div'); wrapper.className = 'nf-task-combobox';
    const input = document.createElement('input'); input.id = id; input.required = true;
    input.maxLength = 160; input.pattern = '[^<>]+'; input.autocomplete = 'off';
    input.value = selected || ''; input.placeholder = 'Select or type a task';
    input.setAttribute('aria-label', 'Task Type'); input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div'); list.id = id + 'Suggestions';
    list.className = 'nf-task-suggestions'; list.setAttribute('role', 'listbox'); list.hidden = true;
    input.setAttribute('aria-controls', list.id);
    const toggle = action('⌄', 'ghost-btn nf-task-toggle', () => {
      input.focus(); if (list.hidden) render(true); else hide();
    });
    toggle.setAttribute('aria-label', 'Show task types'); toggle.title = 'Show task types';
    let active = -1; let matches = []; let aiMatches = []; let timer; let pendingId = ''; let pendingPrefix = ''; let choosing = false; let aiBlocked = false;
    const tools = document.createElement('div'); tools.className = 'nf-task-ai-tools';
    const status = document.createElement('span'); status.className = 'nf-task-ai-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const aiButton = action('✦ AI suggestions', 'ghost-btn', () => { input.focus(); requestAI(); });
    const stopButton = action('Stop', 'ghost-btn', () => { stopAI(); status.textContent = 'Suggestions stopped'; }); stopButton.hidden = true;
    tools.append(aiButton, stopButton, status);
    function stopAI() {
      clearTimeout(timer);
      if (pendingId) window.parent.postMessage({ type: 'namdev-task-ai-stop', id: pendingId }, hostOrigin);
      pendingId = ''; stopButton.hidden = true; aiButton.disabled = aiBlocked;
    }
    function requestAI() {
      if (aiBlocked || !input.isConnected || !input.value.trim()) return;
      stopAI(); pendingPrefix = input.value.trim(); pendingId = crypto.randomUUID();
      aiButton.disabled = true; stopButton.hidden = false; status.classList.remove('is-error'); status.textContent = 'AI is suggesting…';
      const role = document.getElementById(id === 'taskType' ? 'taskRole' : 'editTaskOwner')?.value || 'Finance';
      window.parent.postMessage({ type: 'namdev-task-ai', id: pendingId, prefix: pendingPrefix, role }, hostOrigin);
    }
    const receiveAI = event => {
      if (event.source !== window.parent || event.origin !== hostOrigin || event.data?.type !== 'namdev-task-ai-result' || event.data.id !== pendingId) return;
      pendingId = ''; stopButton.hidden = true;
      const result = event.data;
      aiBlocked = [401,402,403,404].includes(result.status); aiButton.disabled = aiBlocked;
      if (!input.isConnected || input.value.trim() !== pendingPrefix) return;
      if (result.error) { status.textContent = result.error; status.classList.add('is-error'); return; }
      aiMatches = Array.isArray(result.suggestions) ? result.suggestions.filter(value => typeof value === 'string' && value.length <= 160).map(value => ({ value, group: 'AI suggestion' })) : [];
      status.textContent = aiMatches.length + ' AI suggestions';
      if (document.activeElement === input) render();
    };
    window.addEventListener('message', receiveAI);
    const cleanup = new MutationObserver(() => { if (!wrapper.isConnected) { stopAI(); window.removeEventListener('message', receiveAI); cleanup.disconnect(); } });
    const catalog = Object.entries(taskTypeGroups).flatMap(([group, values]) => values.map(value => ({ group, value })));
    function hide() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
    function choose(value) { stopAI(); choosing = true; input.value = value; input.setCustomValidity(''); hide(); input.dispatchEvent(new Event('input', { bubbles: true })); choosing = false; input.focus(); hide(); }
    function render(all = false) {
      const words = (all ? '' : input.value.trim().toLowerCase()).split(/\s+/).filter(Boolean);
      matches = [...(all ? [] : aiMatches), ...catalog.filter(item => words.every(word => (item.value + ' ' + item.group).toLowerCase().includes(word)))].filter((item,index,items) => items.findIndex(other => other.value === item.value) === index);
      list.replaceChildren(); active = -1; input.removeAttribute('aria-activedescendant');
      matches.forEach((item, index) => {
        const option = document.createElement('div'); option.id = list.id + index;
        option.className = 'nf-task-option' + (item.group === 'AI suggestion' ? ' nf-task-ai-option' : ''); option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false');
        const title = document.createElement('b'); title.textContent = item.value;
        const group = document.createElement('small'); group.textContent = item.group;
        option.append(title, group); option.addEventListener('mousedown', event => event.preventDefault());
        option.addEventListener('click', () => choose(item.value)); list.append(option);
      });
      if (!matches.length) {
        const empty = document.createElement('div'); empty.className = 'nf-task-empty';
        empty.textContent = 'Custom task · ' + input.value.trim(); list.append(empty);
      }
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    }
    input.addEventListener('focus', () => render(!aiMatches.length));
    input.addEventListener('input', () => { stopAI(); aiMatches = []; status.textContent = aiBlocked ? status.textContent : ''; input.setCustomValidity(''); render(); if (!choosing && !aiBlocked && input.value.trim()) timer = setTimeout(requestAI, 1000); });
    input.addEventListener('blur', () => { setTimeout(hide, 150); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); stopAI(); hide(); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); if (list.hidden) render(); if (!matches.length) return;
        active = (active + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
        Array.from(list.children).forEach((option, index) => option.setAttribute('aria-selected', String(index === active)));
        const option = list.children[active]; input.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter' && !list.hidden && active >= 0) {
        event.preventDefault(); choose(matches[active].value);
      } else if (event.key === 'Tab') hide();
    });
    wrapper.append(input, toggle, tools, list); existing.replaceWith(wrapper);
    if (taskModalRoot) cleanup.observe(taskModalRoot, { childList: true, subtree: true });
  }
  const originalCreateTaskModal = window.createTaskModal;
  window.createTaskModal = function() {
    originalCreateTaskModal();
    taskTypeDropdown('taskType', 'Portfolio performance review');
  };
  // Cover modal re-renders that recreate the legacy Create Task text field.
  const taskModalRoot = document.getElementById('modalRoot');
  if (taskModalRoot) {
    new MutationObserver(() => {
      const input = taskModalRoot.querySelector('input#taskType');
      if (input && !input.closest('.nf-task-combobox')) taskTypeDropdown('taskType', input.value);
    }).observe(taskModalRoot, { childList: true, subtree: true });
  }
  function modalFooter() {
    let footer = document.querySelector('#modalRoot .modal-footer');
    if (!footer) {
      footer = document.createElement('div'); footer.className = 'modal-footer';
      document.querySelector('#modalRoot .modal').append(footer);
    }
    return footer;
  }
  function action(label, className, handler) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = className;
    button.textContent = label; button.addEventListener('click', handler);
    return button;
  }
  window.taskAction = function(id) {
    if (!findTask(id)) { showToast('Task no longer exists'); return; }
    originalTaskAction(id);
    const footer = document.querySelector('#modalRoot .modal-footer');
    if (!footer) return;
    footer.prepend(action('Edit', 'ghost-btn', () => editWorkflowTask(id)), action('Delete', 'danger-btn', () => deleteWorkflowTask(id)));
  };
  window.editWorkflowTask = function(id) {
    const task = findTask(id); if (!task) return;
    showModal('Edit Task', '<form id="workflowTaskEdit"><div class="modal-kv"><label>Task type<input id="editTaskType" required maxlength="160"></label><label>Case<select id="editTaskCase"></select></label><label>Owner<select id="editTaskOwner"></select></label><label>Priority<select id="editTaskPriority"></select></label><label>Status<select id="editTaskStatus"></select></label><label>SLA (HH:MM:SS)<input id="editTaskSla" required pattern="[0-9]{2,3}:[0-5][0-9]:[0-5][0-9]"></label><label>Due<input id="editTaskDue" required maxlength="80"></label></div><label>Completion Evidence / Remarks<textarea id="editTaskRemarks" rows="3" maxlength="2000"></textarea></label></form>', '');
    function options(selector, values, selected) {
      const select = document.querySelector(selector);
      [...new Set([selected, ...values])].forEach(value => select.add(new Option(value || 'Unlinked', value || '')));
      select.value = selected || '';
    }
    taskTypeDropdown('editTaskType', task.type);
    document.querySelector('#editTaskSla').value = task.sla;
    document.querySelector('#editTaskDue').value = task.due;
    document.querySelector('#editTaskRemarks').value = task.remarks || '';
    options('#editTaskCase', ['', ...applications.map(a => a.id)], task.caseId);
    options('#editTaskOwner', Object.keys(ORG_ROLES), task.ownerRole);
    options('#editTaskPriority', ['Normal','High','Critical'], task.priority);
    options('#editTaskStatus', ['Open','In Progress','Waiting','Completed'], task.status);
    const form = document.querySelector('#workflowTaskEdit');
    form.addEventListener('input', event => event.target.setCustomValidity?.(''));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const type = document.querySelector('#editTaskType');
      const due = document.querySelector('#editTaskDue');
      type.setCustomValidity(type.value.trim() ? '' : 'Enter a task type.');
      due.setCustomValidity(due.value.trim() ? '' : 'Enter a due date or time.');
      if (!form.reportValidity()) return;
      const current = findTask(id); if (!current) return;
      const ownerRole = document.querySelector('#editTaskOwner').value;
      Object.assign(current, {type:type.value.trim(), caseId:document.querySelector('#editTaskCase').value, ownerRole, owner:roleMeta(ownerRole).name, priority:document.querySelector('#editTaskPriority').value, status:document.querySelector('#editTaskStatus').value, sla:document.querySelector('#editTaskSla').value, due:due.value.trim(), remarks:document.querySelector('#editTaskRemarks').value.trim()});
      persistV7Tasks(); closeModal(); renderTaskSLA(); showToast('Task updated');
    });
    const footer = modalFooter();
    footer.append(action('Cancel', 'ghost-btn', () => taskAction(id)), action('Save changes', 'primary-btn', () => form.requestSubmit()));
  };
  window.deleteWorkflowTask = function(id) {
    const task = findTask(id); if (!task) return;
    showModal('Delete task?', '<div class="notice warning">This will remove this demo task from the task list. The linked loan application will not be deleted.</div><p id="deleteTaskLabel"></p>', '');
    document.querySelector('#deleteTaskLabel').textContent = task.id + ' · ' + task.type;
    const footer = modalFooter();
    footer.append(action('Cancel', 'ghost-btn', () => taskAction(id)), action('Delete task', 'danger-btn', () => {
      const index = v7Tasks.indexOf(task); if (index < 0) return;
      v7Tasks.splice(index, 1); persistV7Tasks(); closeModal(); renderTaskSLA(); showToast('Task deleted');
    }));
  };
  const originalSaveNewTask = window.saveNewTask;
  window.saveNewTask = function() {
    const type = document.getElementById('taskType');
    if (type) {
      type.value = type.value.trim();
      if (!type.reportValidity()) return;
    }
    originalSaveNewTask();
    const created = v7Tasks[0]; if (!created) return;
    if (v7Tasks.slice(1).some(t => t.id === created.id)) {
      created.id = 'TSK-' + crypto.randomUUID(); persistV7Tasks(); renderTaskSLA();
    }
  };
})();
</script>`;