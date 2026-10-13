const fs = require('fs');
const content = fs.readFileSync('src/lib/workflow-document.js', 'utf8');
const matches = content.match(/data-view="([^"]+)"/g);
console.log(matches.join('\n'));
