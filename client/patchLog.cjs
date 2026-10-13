const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

content = content.replace(
  "const kpiId = map[text];",
  "const kpiId = map[text]; console.log('CEO KPI Check:', text, kpiId, allowedKpis.has(kpiId));"
);

fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
