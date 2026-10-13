// Extend the isolated demo workflow without changing the legacy lending scripts.
export const workflowKycScript = String.raw`<script>
(() => {
  const verifiedAt = new Map();
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function numberFor(id) {
    let hash = 2166136261;
    for (const ch of id) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0;
    return 'DEMO-KYC-' + String(hash).padStart(10, '0');
  }
  function details(id) {
    const a = getApp(id), k = v7Kyc[id];
    if (!a || !k) return '';
    return '<div class="verification-grid nf-kyc-details"><div class="verification-card"><span>Customer</span><b>' + escapeHtml(a.customer) + '</b></div><div class="verification-card"><span>Application</span><b>' + escapeHtml(id) + '</b></div><div class="verification-card"><span>Demo KYC number</span><b>' + numberFor(id) + '</b></div><div class="verification-card"><span>KYC status</span><b>' + escapeHtml(k.status === 'Verified' ? 'Verified' : 'Not verified · ' + k.status) + '</b></div></div>';
  }
  function receipt(id, success) {
    const title = success ? 'KYC verified successfully' : 'KYC not verified';
    const message = success ? 'All six KYC checks are complete.' : 'Complete all six checks before verifying this customer.';
    const time = verifiedAt.get(id);
    showModal(title, '<div class="notice ' + (success ? 'success' : 'info') + '"><b>' + title + '</b><p>' + message + '</p></div>' + details(id) + (success && time ? '<p class="nf-kyc-time">Verified at ' + escapeHtml(time) + '</p>' : '') + '<div class="notice info">Demo verification only · This reference is not a government-issued CKYC number.</div>', '<button class="ghost-btn" onclick="openKycCase(\'' + escapeHtml(id) + '\')">' + (success ? 'View KYC details' : 'Return to checklist') + '</button><button class="primary-btn" onclick="closeModal()">Done</button>');
    const modal = document.querySelector('#modalRoot .modal');
    if (modal) {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', title);
      modal.querySelector('.primary-btn')?.focus();
    }
  }
  const originalOpen = openKycCase;
  openKycCase = function(id) {
    originalOpen(id);
    const body = document.querySelector('#modalRoot .modal-body');
    if (!body) return;
    const summary = document.createElement('div');
    summary.innerHTML = details(id);
    body.prepend(summary);
  };
  const originalRender = renderKycDedupe;
  renderKycDedupe = function() {
    originalRender();
    const table = document.querySelector('#content table');
    if (!table) return;
    const header = table.querySelector('thead tr');
    for (const label of ['Demo KYC number', 'KYC status']) {
      const th = document.createElement('th');
      th.textContent = label;
      header?.insertBefore(th, header.lastElementChild);
    }
    table.querySelectorAll('tbody tr').forEach(row => {
      const id = row.querySelector('td b')?.textContent;
      if (!id || !v7Kyc[id]) return;
      const action = row.lastElementChild;
      const number = document.createElement('td');
      number.textContent = numberFor(id);
      row.insertBefore(number, action);
      const status = document.createElement('td');
      const badge = document.createElement('span');
      const verified = v7Kyc[id].status === 'Verified';
      badge.className = 'nf-kyc-status ' + (verified ? 'is-verified' : 'is-pending');
      badge.textContent = verified ? 'Verified' : 'Not verified';
      status.appendChild(badge);
      row.insertBefore(status, action);
    });
  };
  const originalComplete = completeKyc;
  completeKyc = function(id) {
    if (!getApp(id) || !v7Kyc[id]) return;
    const checks = Array.from(document.querySelectorAll('#modalRoot .kyc-check'));
    if (checks.length !== 6 || checks.some(check => !check.checked)) {
      receipt(id, false);
      return;
    }
    originalComplete(id);
    verifiedAt.set(id, new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'}) + ' IST');
    receipt(id, v7Kyc[id].status === 'Verified');
  };
})();
</script>`;