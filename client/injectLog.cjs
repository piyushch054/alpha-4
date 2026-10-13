const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');
content = content.replace('console.log("CLEANUP UI RUNNING!", Array.from(allowedViews));', 'console.log("CLEANUP UI RUNNING!", JSON.stringify(Array.from(allowedViews)));');
fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
