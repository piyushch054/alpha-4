const fs = require('fs');
let c = fs.readFileSync('src/lib/workflow-document.ts', 'utf8');
c = c.replace(
  '<div class="nf-nav-group-items">\\n            <button class="nav-item" data-view="crm">',
  '<div class="nf-nav-group-items">\\n            <button class="nav-item" data-view="dashboard"><span class="nav-icon">◱</span><span>Dashboard</span></button>\\n            <button class="nav-item" data-view="crm">'
);
fs.writeFileSync('src/lib/workflow-document.ts', c);
console.log('Sidebar updated');
