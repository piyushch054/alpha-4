const fs = require('fs');
let content = fs.readFileSync('src/lib/workflow-ceo-oversight.js', 'utf8');

const mapping = 
      // Map config IDs to data-view IDs
      const configToView = {
        'tasks': 'taskSla',
        'casesView': 'applications',
        'leads': 'crm',
        'customerProfile': 'customer360',
        'banking': 'bankingAA',
        'fraud': 'rcu'
      };
      
      let mappedViews = new Set();
      allowedViews.forEach(v => {
        mappedViews.add(v);
        if (configToView[v]) mappedViews.add(configToView[v]);
      });
      allowedViews = mappedViews;
;

content = content.replace('      let allowedViews = new Set(selectedSubmodules);', '      let allowedViews = new Set(selectedSubmodules);' + mapping);
fs.writeFileSync('src/lib/workflow-ceo-oversight.js', content);
