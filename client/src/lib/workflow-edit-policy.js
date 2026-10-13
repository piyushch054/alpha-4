// Demo workflow restriction; not a substitute for server-side authorization.
export const workflowEditPolicyScript = String.raw`<script>
(() => {
  const lockedCases = new Set();
  function locked(a) {
    if (!a) return true;
    if (a.status === 'Active Loan' || a.status === 'Disbursed' || a.workflow?.centralOps === 'Disbursed' || a.workflow?.dealId) lockedCases.add(a.id);
    return lockedCases.has(a.id);
  }
  function allowed(id) {
    const a = getApp(id);
    return !!a && !locked(a) && currentUser.role !== 'CEO';
  }
  function deny(id) {
    closeModal();
    showToast(currentUser.role === 'CEO' ? 'CEO can view applicant details but cannot edit them.' : 'Applicant details are locked after disbursement.');
  }
  const render = renderCase;
  renderCase = function(id) {
    const result = render.apply(this, arguments);
    if (!allowed(id)) document.querySelectorAll('[onclick*="editCaseApplicant("]').forEach(button => button.remove());
    return result;
  };
  const edit = editCaseApplicant, save = saveCaseApplicant;
  editCaseApplicant = function(id) { if (!allowed(id)) return deny(id); return edit.apply(this, arguments); };
  saveCaseApplicant = function(id) { if (!allowed(id)) return deny(id); return save.apply(this, arguments); };
})();
</script>`;