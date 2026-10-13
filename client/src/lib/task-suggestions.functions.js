export const generateTaskSuggestions = async (context) => {
  // Static rule-based suggestions based on context
  const text = (context || "").toLowerCase();
  const suggestions = [];
  
  if (text.includes("loan") || text.includes("disburse")) {
      suggestions.push("Review Loan Agreement", "Approve Disbursement");
  } else if (text.includes("kyc")) {
      suggestions.push("Verify ID Documents", "Check Bureau Score");
  } else {
      suggestions.push("Review Application", "Follow up with customer");
  }
  return suggestions;
};

export const suggestFinanceTasks = async (ctx) => {
  return ["Check daily collection", "Reconcile accounts", "Review pending approvals"];
};