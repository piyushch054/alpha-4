const fs = require('fs');
const content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('\\') && i !== 1 && i !== lines.length - 2) {
    console.log('Line ' + (i + 1) + ': ' + line);
  }
});
