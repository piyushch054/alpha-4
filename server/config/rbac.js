// Server-side authorization. Roles come from the authenticated user record (JWT -> User), never from the request.
const ADMIN = ['System Admin', 'admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN'];
const OVERSIGHT = ['CEO', 'Audit Manager', 'Compliance Manager'];

// Every role offered by the login role selector; each receives its own server-resolved demo session.
const DEMO_ROLES = ['CEO', 'BSO', 'BDM', 'ASM', 'RSM', 'ZSM', 'CBO', 'BCM', 'ACM', 'ZCM', 'Credit Head', 'Technical Verifier', 'Technical Head', 'Legal Verifier', 'Legal Head', 'Disbursement Officer', 'Central Operations', 'Appraiser', 'Underwriter', 'KYC Executive', 'Document Verifier', 'RCU Analyst', 'RCU Head', 'Operations Checker', 'Partner Manager', 'Compliance Officer', 'Accountant', 'Finance Manager', 'CFO', 'System Admin', 'HR Manager', 'Project Manager', 'IT Asset Manager', 'Admin Manager', 'Audit Manager', 'Compliance Manager', 'CCTV Supervisor', 'Travel Desk'];

const PERMISSIONS = {
  manage_users: [...ADMIN, 'CEO'],
  view_hr: [...ADMIN, ...OVERSIGHT, 'HR Manager'],
  manage_hr: [...ADMIN, 'HR Manager'],
  view_ceo_oversight: [...ADMIN, ...OVERSIGHT, 'Credit Head'],
  manage_ceo_oversight: [...ADMIN, 'CEO'],
};

const can = (user, permission) => !!user && !!PERMISSIONS[permission]?.includes(user.role);

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
  if (!can(req.user, permission)) {
    return res.status(403).json({ success: false, message: 'Access restricted for your role' });
  }
  next();
};

module.exports = { DEMO_ROLES, PERMISSIONS, can, requirePermission };
