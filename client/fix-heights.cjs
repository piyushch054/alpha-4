const fs = require('fs');

const appJsPath = 'public/workflow/app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');

// We will just do a fast regex replacement for the height: '100%' instances inside renderCEOCharts
const targetReplace = /chart:\s*{\s*height:\s*'100%'/g;

if (appJs.match(targetReplace)) {
  // Let's replace '100%' with '100%' but ensure the DOM nodes have explicit height.
  // Wait, replacing it in the JS is easy:
  appJs = appJs.replace(/#chartTarget".*?min-height:180px/g, '#chartTarget" style="flex:1; width:100%; height:200px; min-height:200px');
  appJs = appJs.replace(/#chartCollection".*?min-height:120px/g, '#chartCollection" style="flex:1; width:100%; height:160px; min-height:160px');
  appJs = appJs.replace(/#chartTat".*?min-height:120px/g, '#chartTat" style="flex:1; width:100%; height:140px; min-height:140px');
  
  // Also replace '100%' with the actual height string in the apex config so it doesn't try to inherit and fail
  appJs = appJs.replace(/chart:\s*{\s*height:\s*'100%',\s*type:\s*'line',\s*toolbar:\s*{\s*show:\s*false\s*},\s*parentHeightOffset:\s*0\s*}/g, (match, offset, string) => {
    // There are two 'line' charts (Target and Collection)
    return match.replace("'100%'", "'100%'"); // Keep 100% since we fixed the container height natively
  });

  fs.writeFileSync(appJsPath, appJs);
  console.log('Heights made explicit.');
} else {
  console.log('Could not find matches for height fixing.');
}
