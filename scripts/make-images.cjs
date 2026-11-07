// אייקונים ותמונות שיתוף (public/*.png, public/og/*.png) מתוך public/favicon.svg ומפת גזע המוח.
// הרצה: npm run build && npx vite preview --port 4173 (בחלון אחר), ואז node scripts/make-images.cjs
// התמונות נדחסות בסוף ל-256 צבעים (Python + Pillow, אם מותקן) כדי שיישארו קטנות.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

(async () => {
  const { brainstemSvg } = await import(pathToFileURL(path.join(root, 'src/lib/brainstem.js')).href);
  const { NERVES } = await import(pathToFileURL(path.join(root, 'content/nerves.js')).href);
  const b = await chromium.launch();

  const svg = fs.readFileSync(path.join(root, 'public/favicon.svg'), 'utf8');
  for (const [f, n] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    const p = await b.newPage({ viewport: { width: n, height: n } });
    await p.setContent(`<style>html,body{margin:0;background:#0b0e12}svg{width:${n}px;height:${n}px;display:block}</style>${svg.replace('rx="14"', 'rx="0"')}`);
    await p.screenshot({ path: path.join(root, 'public', f) });
  }

  // תמונות שיתוף: כותרת מימין, מפת גזע המוח משמאל, בסגנון האתר הבנוי (ה-CSS נלקח מהאתר)
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('http://localhost:4173/');
  const css = await p.$$eval('link[rel=stylesheet]', (ls) => ls.map((l) => l.href));
  const head = css.map((h) => `<link rel="stylesheet" href="${h}">`).join('');
  const shot = async (file, { kicker, title, sub, map, badge = '' }) => {
    await p.setContent(`<html dir="rtl" lang="he"><head>${head}</head>
    <body style="margin:0;min-height:0;width:1200px;height:630px;overflow:hidden;flex-direction:row;display:flex;align-items:center;gap:40px;padding:0 70px;box-sizing:border-box;background:radial-gradient(ellipse at 30% 50%,#1d1a12,#0b0e12 70%)">
    <div style="flex:1"><p style="color:#f0c46b;font-size:28px;margin:0 0 12px;font-weight:600">${esc(kicker)}</p>
    <div style="display:flex;align-items:center;gap:22px;margin:0 0 20px">${badge}<h1 style="font-size:${title.length > 14 ? 64 : 76}px;line-height:1.1;margin:0;color:#e8ecf1">${esc(title)}</h1></div>
    <p style="font-size:32px;line-height:1.35;color:#b4bdc8;margin:0">${esc(sub)}</p></div>
    <div style="width:420px;flex:none">${map}</div></body></html>`, { waitUntil: 'load' });
    await p.waitForTimeout(300);
    await p.screenshot({ path: file });
  };
  const badge = (txt, color, dashed) => `<span style="flex:none;display:inline-grid;place-items:center;min-width:96px;height:96px;padding:0 14px;box-sizing:border-box;border:3px ${dashed ? 'dashed' : 'solid'} ${color};border-radius:22px;color:${color};font:700 46px Georgia,serif;direction:ltr">${txt}</span>`;
  const TYPE_COLOR = { sensory: '#7cc7dc', motor: '#ef9a8f', mixed: '#c3a6f0' };

  await shot(path.join(root, 'public/og.png'), {
    kicker: 'העצבים הקרניאליים', title: 'עצבי הגולגולת',
    sub: '12 זוגות, מהריח ועד הלשון. מפה, סימולטורים ומבחן עצמי', map: brainstemSvg(),
  });
  fs.mkdirSync(path.join(root, 'public/og'), { recursive: true });
  for (const n of NERVES) {
    await shot(path.join(root, `public/og/nerve-${n.id}.png`), {
      kicker: `עצבי הגולגולת · העצב ה-${n.num}`, title: n.name, sub: n.tagline,
      map: brainstemSvg({ active: n.id }), badge: badge(n.roman, TYPE_COLOR[n.type]),
    });
  }
  await shot(path.join(root, 'public/og/nerve-zero.png'), {
    kicker: 'העצב הטרמינלי · לא נכלל ב-12 הזוגות', title: 'עצב 0',
    sub: 'רשת דקיקה של סיבים ליד עצב הריח, ועד היום לא ברור מה הוא עושה', map: brainstemSvg(), badge: badge('0', '#9aa4b2', true),
  });
  await b.close();
  const files = ['public/og.png', ...fs.readdirSync(path.join(root, 'public/og')).map((f) => `public/og/${f}`)].map((f) => path.join(root, f));
  try {
    require('child_process').execFileSync('python3', ['-I', '-c',
      'import sys\nfrom PIL import Image\nfor f in sys.argv[1:]:\n  Image.open(f).convert("RGB").quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(f, optimize=True)', ...files]);
  } catch (e) { console.warn('דחיסת PNG דולגה:', e.message); }
})();
