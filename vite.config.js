import { defineConfig } from 'vite';
import { resolve, basename } from 'node:path';
import { SITE, NAV, LAB, DISCLAIMER, SISTER_SITES, SISTER_INVITE } from './src/config.js';
import { NERVES } from './content/nerves.js';
import { EVENTS } from './content/timeline.js';
import { nerveBody, nervesList, timeline, examList } from './src/lib/render.js';

const PAGES = [
  'index', 'nerves', 'nerve', 'basics', 'exam', 'history', 'about',
  'lab', ...LAB.map((t) => t.page), 'privacy', 'accessibility', '404',
];

// מכניס HTML סטטי לתוך אלמנט ריק (או אלמנט שיש בו רק <noscript>) בעמוד שנבנה
function fill(html, open, inner) {
  const re = new RegExp(`(${open.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?:\\s*<noscript>[\\s\\S]*?</noscript>\\s*)?(</div>)`);
  if (!re.test(html)) throw new Error(`prerender: לא נמצא ${open}`);
  return html.replace(re, (_, a, b) => `${a}${inner}${b}`);
}

const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const pageUrl = (page) => `${SITE.url}${page === 'index' ? '' : `${page}.html`}`;

// תגיות שיתוף ו-canonical לעמוד. תמונת השיתוף אחת לכל האתר (public/og.png).
function metaTags({ page, title, description }) {
  return [
    '<!--og-->',
    page === '404' ? '' : `<link rel="canonical" href="${pageUrl(page)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="he_IL" />`,
    `<meta property="og:site_name" content="${attr(SITE.name)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:url" content="${pageUrl(page)}" />`,
    `<meta property="og:image" content="${SITE.url}og.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    '<!--/og-->',
  ].filter(Boolean).join('\n    ');
}

// בשרת הפיתוח partials נקראים מחדש בכל בקשה, כדי ששינוי בהם ייראה מיד
import { readFileSync } from 'node:fs';
const partial = (name) => readFileSync(resolve(import.meta.dirname, 'src/partials', `${name}.html`), 'utf8');

// מחליף <!-- @head --> / <!-- @header --> / <!-- @footer --> בכל עמוד ב-partial המשותף,
// מסמן את פריט הניווט הפעיל וממלא את שם האתר מקובץ ההגדרות.
function layoutPartials() {
  return {
    name: 'layout-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = basename(ctx.filename, '.html');
        const navItems = NAV.map((item) => {
          const current = item.pages.includes(page) ? ' aria-current="page"' : '';
          const icon = item.icon ? `<svg class="nav-icon" viewBox="0 0 36 36" aria-hidden="true" focusable="false">${item.icon}</svg>` : '';
          return `<li><a href="./${item.href}"${current}>${icon}<span>${item.label}</span></a></li>`;
        }).join('\n          ');

        const title = html.match(/<title>(.*?)<\/title>/)?.[1]?.replaceAll('{{SITE_NAME}}', SITE.name).replaceAll('{{SITE_TAGLINE}}', SITE.tagline) ?? SITE.name;
        const description = (html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '').replace(/&quot;/g, '"');
        const og = metaTags({ page, title, description });

        const isTool = LAB.some((t) => t.page === page);
        return html
          .replace('<header class="page-head">', isTool ? '<header class="page-head">\n          <span class="eyebrow">המעבדה</span>' : '<header class="page-head">')
          .replace('<!-- @labnav -->', labNav(page))
          .replace('<!-- @labpager -->', labPager(page))
          .replace('<!-- @head -->', `${partial('head')}\n    ${og}`)
          .replace('<!-- @header -->', partial('header').replace('{{NAV}}', navItems))
          .replace('<!-- @footer -->', partial('footer').replace('{{DISCLAIMER}}', DISCLAIMER).replace('{{SISTER}}', sisterNav()))
          .replaceAll('{{SITE_NAME}}', SITE.name)
          .replaceAll('{{SITE_TAGLINE}}', SITE.tagline);
      },
    },
  };
}

// פס "עוד אתרים שלי". הרשימה כתובה פעמיים: העותק השני קיים רק כדי שהגלילה האיטית
// (public/sister.js) תהיה רציפה; הוא מוסתר מקורא מסך ומהמקלדת, וב"בלי תנועה" מוסתר לגמרי.
function sisterNav() {
  const items = (clone) => SISTER_SITES.map(([emoji, url, text, tail]) => {
    const tab = clone ? ' tabindex="-1"' : '';
    const icon = `<span aria-hidden="true">${emoji}</span>`;
    if (tail) return `<span class="sister-item">${icon} <a href="${url}" rel="noopener"${tab}>${attr(text)}</a>${attr(tail)}</span>`;
    const cls = url === SISTER_INVITE ? ' class="sister-invite"' : '';
    return `<a href="${url}" rel="noopener"${cls}${tab}>${icon} ${attr(text)}</a>`;
  }).join('');
  return `<nav class="sister" aria-label="האתרים הנוספים שלי"><span class="sister-lbl">עוד אתרים שלי</span>`
    + `<div class="sister-view"><div class="sister-track"><div class="sister-set">${items(false)}</div>`
    + `<div class="sister-set sister-clone" aria-hidden="true">${items(true)}</div></div></div></nav>`
    + `<script src="./sister.js" defer vite-ignore></script>`;
}

// תפריט המעבדה בראש כל עמוד כלי: כל הכלים, עם הכלי הנוכחי מסומן
function labNav(page) {
  const items = LAB.map(({ page: p, label }) =>
    `<li><a href="./${p}.html"${p === page ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
  return `<nav class="subnav" aria-label="כלי המעבדה"><ul><li><a href="./lab.html">כל המעבדה</a></li>${items}</ul></nav>`;
}

// מעבר לכלי הקודם / הבא בתחתית עמוד כלי
function labPager(page) {
  const i = LAB.findIndex((t) => t.page === page);
  if (i < 0) return '';
  const prev = LAB[i - 1], next = LAB[i + 1];
  const link = (t, dir) => (t
    ? `<a class="pager-link pager-${dir}" href="./${t.page}.html"><span class="pager-dir">${dir === 'prev' ? 'הכלי הקודם' : 'הכלי הבא'}</span><span class="pager-title">${t.label}</span></a>`
    : '<span></span>');
  return `<nav class="pager" aria-label="מעבר בין כלי המעבדה">${link(prev, 'prev')}${link(next, 'next')}</nav>`;
}

// עמוד סטטי לכל עצב, תוכן סטטי לעמודים שנבנים ב-JS, sitemap.xml ו-robots.txt
function staticPages() {
  return {
    name: 'static-pages',
    enforce: 'post',
    // בשרת הפיתוח אין עמודים סטטיים לעצבים: nerve-<id>.html מוגש כ-nerve.html?id=<id>
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const m = req.url?.match(/^\/nerve-([\w-]+)\.html(\?.*)?$/);
        if (m) req.url = `/nerve.html?id=${m[1]}`;
        next();
      });
    },
    generateBundle(_, bundle) {
      const page = (name, fn) => { bundle[name].source = fn(String(bundle[name].source)); };
      page('nerves.html', (html) => fill(html, '<div id="nerves-root">', nervesList(NERVES)));
      page('history.html', (html) => fill(html, '<div id="timeline-root">', timeline(EVENTS)));
      page('exam.html', (html) => fill(html, '<div id="exam-root" class="exam-list">', examList(NERVES)));

      // עמוד סטטי לכל עצב: עותק של nerve.html עם כותרת, תיאור ותוכן משלו
      const base = String(bundle['nerve.html'].source);
      for (const n of NERVES) {
        const title = `${n.name} (${n.roman}) · ${SITE.name}`;
        const description = `העצב הקרניאלי ה-${n.num}: ${n.tagline} ${n.intro[0]}`.slice(0, 158);
        const og = metaTags({ page: `nerve-${n.id}`, title, description });
        let html = base
          .replace('<html lang="he" dir="rtl">', `<html lang="he" dir="rtl" data-nerve-id="${attr(n.id)}">`)
          .replace(/<title>.*?<\/title>/, `<title>${attr(title)}</title>`)
          .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${attr(description)}"`)
          .replace(/<!--og-->[\s\S]*?<!--\/og-->/, og);
        html = fill(html, '<div class="container" id="nerve-root">', nerveBody(n));
        this.emitFile({ type: 'asset', fileName: `nerve-${n.id}.html`, source: html });
      }
      delete bundle['nerve.html'];

      const urls = [
        ...PAGES.filter((p) => p !== 'nerve' && p !== '404').map((p) => (p === 'index' ? '' : `${p}.html`)),
        ...NERVES.map((n) => `nerve-${n.id}.html`),
      ].map((u) => `  <url><loc>${SITE.url}${u}</loc></url>`).join('\n');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${SITE.url}sitemap.xml\n` });
    },
  };
}

export default defineConfig({
  // נתיבים יחסיים: עובד גם ב-GitHub Pages תחת תת-תיקייה וגם בדומיין עצמאי
  base: './',
  plugins: [layoutPartials(), staticPages()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((p) => [p, resolve(import.meta.dirname, `${p}.html`)])),
    },
  },
});
