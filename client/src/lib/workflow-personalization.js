// Extend the isolated checklist without changing the uploaded workflow source.
export const workflowPersonalizationScript = `<script>
(() => {
  const originalOpen = window.openCEOPersonalizer;
  const originalRecommended = window.selectRecommendedCEO;
  function checks() {
    return Array.from(document.querySelectorAll('#kpiLibrary .ceo-kpi-check, .ceo-chart-check'));
  }
  function syncAll() {
    const master = document.getElementById('ceoSelectAll');
    if (!master) return;
    const items = checks();
    const selected = items.filter(item => item.checked).length;
    master.checked = items.length > 0 && selected === items.length;
    master.indeterminate = selected > 0 && selected < items.length;
  }
  window.openCEOPersonalizer = function(...args) {
    originalOpen.apply(this, args);
    const library = document.getElementById('kpiLibrary');
    if (!library) return;
    const row = document.createElement('div');
    row.className = 'ops-checklist';
    const label = document.createElement('label');
    label.className = 'ops-check';
    const master = document.createElement('input');
    master.type = 'checkbox';
    master.id = 'ceoSelectAll';
    const text = document.createElement('span');
    text.textContent = 'Select All';
    label.append(master, text);
    row.append(label);
    library.before(row);
    master.addEventListener('change', () => {
      checks().forEach(item => { item.checked = master.checked; });
      syncAll();
    });
    checks().forEach(item => item.addEventListener('change', syncAll));
    syncAll();
  };
  window.selectRecommendedCEO = function(...args) {
    originalRecommended.apply(this, args);
    syncAll();
  };
  // Preserve all chosen cards rather than silently truncating the selection to 24.
  window.saveCEOPersonalization = function() {
    const product = document.getElementById('ceoPrefProduct');
    if (!product) return;
    const next = {
      product: product.value,
      kpis: checks().filter(item => item.classList.contains('ceo-kpi-check') && item.checked).map(item => item.value),
      charts: checks().filter(item => item.classList.contains('ceo-chart-check') && item.checked).map(item => item.value),
    };
    try {
      localStorage.setItem('skf_ceo_dashboard_prefs', JSON.stringify(next));
    } catch {
      showToast('Dashboard could not be saved. Please try again.');
      return;
    }
    ceoPrefs = next;
    closeModal();
    showToast('CEO dashboard personalized');
    renderCEOPersonalizedDashboard();
  };
})();
</script>`;