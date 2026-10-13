const fs = require('fs');
let content = fs.readFileSync('src/routes/workspace.jsx', 'utf8');
content = content.replace(
  'workflowEditPolicyScript + workflowCeoOversightScript',
  'workflowEditPolicyScript + workspaceConfigScript + workflowCeoOversightScript'
).replace(
  'workflowLocalizationScript + workspaceConfigScript +',
  'workflowLocalizationScript +'
);
fs.writeFileSync('src/routes/workspace.jsx', content);
