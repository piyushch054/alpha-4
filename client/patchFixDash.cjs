const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

// First, remove the late dash declaration
content = content.replace("const dash = document.querySelector('.nf-ceo-dashboard');", "");

// Now add it at the top of cleanupUI, before doc is accessed
content = content.replace(
  "const cleanupUI = () => { console.log(\"CLEANUP UI RUNNING!\", JSON.stringify(Array.from(allowedViews)));",
  "const cleanupUI = () => { console.log(\"CLEANUP UI RUNNING!\", JSON.stringify(Array.from(allowedViews)));\n          const dash = document.querySelector('.nf-ceo-dashboard');\n          if(!dash) return;"
);

// We need to remove the old if(!dash) return;
content = content.replace("if (!dash) return;", "");

fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
