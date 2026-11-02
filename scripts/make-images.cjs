// אייקונים ותמונת שיתוף (public/*.png) מתוך public/favicon.svg ומפת גזע המוח.
// הרצה: npm run build && npx vite preview --port 4173 (בחלון אחר), ואז node scripts/make-images.cjs
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const svg = fs.readFileSync('public/favicon.svg', 'utf8');
  for (const [f, n] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    const p = await b.newPage({ viewport: { width: n, height: n } });
    await p.setContent(`<style>html,body{margin:0;background:#0b0e12}svg{width:${n}px;height:${n}px;display:block}</style>${svg.replace('rx="14"', 'rx="0"')}`);
    await p.screenshot({ path: `public/${f}` });
  }
  // תמונת שיתוף: לכידה של מפת גזע המוח מהאתר הבנוי, עם כותרת
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('http://localhost:4173/');
  const fig = await p.$eval('#explorer-figure', (el) => el.innerHTML);
  const css = await p.$$eval('link[rel=stylesheet]', (ls) => ls.map((l) => l.href));
  await p.setContent(`<html dir="rtl" lang="he"><head>${css.map((h) => `<link rel="stylesheet" href="${h}">`).join('')}</head>
  <body style="margin:0;min-height:0;width:1200px;height:630px;overflow:hidden;flex-direction:row;display:flex;align-items:center;gap:40px;padding:0 70px;box-sizing:border-box;background:radial-gradient(ellipse at 30% 50%,#1d1a12,#0b0e12 70%)">
  <div style="flex:1"><p style="color:#f0c46b;font-size:28px;margin:0 0 12px;font-weight:600">העצבים הקרניאליים</p>
  <h1 style="font-size:76px;line-height:1.1;margin:0 0 20px;color:#e8ecf1">עצבי הגולגולת</h1>
  <p style="font-size:32px;color:#b4bdc8;margin:0">12 זוגות, מהריח ועד הלשון — מפה, סימולטורים ומבחן עצמי</p></div>
  <div style="width:420px;flex:none">${fig}</div></body></html>`);
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'public/og.png' });
  await b.close();
})();
