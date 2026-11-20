const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const P = JSON.parse(fs.readFileSync(__dirname + '/palettes.json', 'utf8'));
  const list = JSON.parse(fs.readFileSync(__dirname + '/' + (process.argv[3] || 'sites2.json') + '', 'utf8')); const only = process.argv[2];
  const b = await chromium.launch();
  for (const d0 of list) {
    if (only && d0.id !== only) continue;
    const d = Object.assign({}, P[d0.pal], d0);
    const url = 'http://localhost:8766/site.html?d=' + encodeURIComponent(JSON.stringify(d));
    for (const [tag, vp, sf] of [['pc', { width: 1440, height: 900 }, 1], ['tel', { width: 390, height: 844 }, 2]]) {
      const p = await b.newPage({ viewport: vp, deviceScaleFactor: sf });
      p.on('pageerror', e => console.log('ERR', d.id, e.message));
      await p.goto(url); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
      await p.screenshot({ path: __dirname + '/s-' + d.id + '-' + tag + '.png' }); await p.close();
    }
    console.log('ok', d.id);
  }
  await b.close();
})();
