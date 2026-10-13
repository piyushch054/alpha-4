// Track in-document workspace pages without rewriting legacy workflow handlers.
export const workflowNavigationScript = String.raw`<script>
(() => {
  const pages = []; let current = null, depth = 0, restoring = false;
  function visit(page, action) {
    const outer = depth === 0; depth++;
    try {
      const result = action();
      if (outer) {
        if (!restoring && current && (current.view !== page.view || current.arg !== page.arg)) pages.push(current);
        current = page;
        if (pages.length > 100) pages.shift();
      }
      return result;
    } finally { depth--; }
  }
  const navigate = navTo;
  navTo = function(view, arg) { return visit({view, arg}, () => navigate.apply(this, arguments)); };
  const casePage = renderCase;
  renderCase = function(id) { return visit({view:'case', arg:id}, () => casePage.apply(this, arguments)); };
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== window.parent.location.origin || event.data?.type !== 'namdev-go-back') return;
    closeModal();
    const previous = pages.pop();
    if (!previous) { window.parent.postMessage({type:'namdev-back-fallback'}, window.parent.location.origin); return; }
    restoring = true;
    try { navTo(previous.view, previous.arg); } finally { restoring = false; }
  });
})();
</script>`;