const fs = require('fs');
const content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  fs.writeFileSync('testOversight.js', scriptMatch[1]);
  console.log('Extracted script');
} else {
  console.log('No script found');
}
