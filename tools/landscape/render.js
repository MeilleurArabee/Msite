const { chromium } = require('playwright');
const fs = require('fs');
const R = process.argv[2], OUT = process.argv[3]  // R : dossier de paint.js, OUT : dossier de sortie, modes = (process.argv[4] || 'wide,tall').split(',');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.setContent('<html><body></body></html>');
  await p.addScriptTag({ path: R + '/paint.js' });
  for (const m of modes) {
    const res = await p.evaluate(m => window.paintScene(m), m);
    for (const k of ['clouds', 'far', 'mid', 'tree', 'front']) {
      const buf = Buffer.from(res[k].split(',')[1], 'base64');
      fs.writeFileSync(`${OUT}/${m}-${k}.webp`, buf);
      console.log(m, k, (buf.length / 1024).toFixed(0) + 'KB');
    }
    fs.writeFileSync(`${R}/preview-${m}.jpg`, Buffer.from(res.preview.split(',')[1], 'base64'));
    console.log(m, 'meta', JSON.stringify(res.meta));
  }
  await b.close();
})();
