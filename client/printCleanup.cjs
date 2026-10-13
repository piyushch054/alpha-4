const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');
const match = content.match(/const cleanupUI = \(\) => \{([\s\S]*?)const origApply/);
if (match) console.log(match[1]);
