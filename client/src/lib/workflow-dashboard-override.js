export const workflowDashboardOverrideScript = String.raw`<script>
(() => {
  window.renderDashboard = function() {
    if (typeof setPage === 'function') setPage("Dashboard", "Executive / Dashboard");
    const content = document.getElementById("content");
    if (content) content.innerHTML = '<div id="react-dashboard-mount" style="position: relative;"></div>';

    
    document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === "dashboard"));
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    
    window.parent.postMessage({ type: 'namdev-dashboard-mount-ready' }, window.location.origin);
  };
})();
</script>`;