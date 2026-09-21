const fs = require('fs');
let code = fs.readFileSync('apps/web/src/components/PCBCanvas.jsx', 'utf8');

const IS_STEP_BY_STEP = 
  const IS_STEP_BY_STEP = true;
;

code = code.replace(
  'let globalFade = 1;',
  IS_STEP_BY_STEP + '\n  let globalFade = 1;'
);

code = code.replace(
  '{/* Substrate */}',
  '{!IS_STEP_BY_STEP && (<>\n        {/* Substrate */}'
);

code = code.replace(
  '<Track categoryKey="dec5" data={pcbCategories.dec5} isActive={false} scrollProgress={0} entries={[]} />',
  '<Track categoryKey="dec5" data={pcbCategories.dec5} isActive={false} scrollProgress={0} entries={[]} />\n        </>)}'
);

fs.writeFileSync('apps/web/src/components/PCBCanvas.jsx', code);
console.log('Done');
