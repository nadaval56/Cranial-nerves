import { defineConfig } from 'vite';
import { resolve, basename } from 'node:path';
import { SITE, NAV, LAB, DISCLAIMER, SISTER_SITES, SISTER_INVITE } from './src/config.js';
import { NERVES, byId } from './content/nerves.js';
import { EVENTS } from './content/timeline.js';
import { nerveBody, nervesList, timeline, examList, pressCards, pressStory, conditionCards, conditionPage, figure, creditsList } from './src/lib/render.js';
import { IMAGES, CREDITS } from './content/images.js';
import { PRESS } from './content/press.js';
import { CONDITIONS, isTreatment } from './content/conditions.js';
import { CASES } from './content/cases.js';
import { caseCards } from './src/lib/clinic.js';

const PAGES = [
  'index', 'nerves', 'nerve', 'nerve-zero', 'basics', 'exam', 'clinic', 'history', 'press', 'press-story', 'conditions', 'condition', 'about',
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

// תגיות שיתוף, canonical ונתונים מובנים (JSON-LD) לעמוד. תמונת השיתוף: public/og.png,
// ולעמודי העצבים תמונה משלהם (public/og/nerve-<id>.png, נוצרת ב-scripts/make-images.cjs).
const CRUMB = {
  nerves: ['העצבים'], 'nerve-zero': ['העצבים', 'עצב 0'], basics: ['היסודות'], exam: ['הבדיקה'],
  history: ['היסטוריה'], clinic: ['קליניקה'], press: ['בתקשורת'], conditions: ['העצבים', 'מצבים ומחלות'], about: ['אודות'], lab: ['המעבדה'], privacy: ['מדיניות פרטיות'], accessibility: ['הצהרת נגישות'],
  ...Object.fromEntries(LAB.map((t) => [t.page, ['המעבדה', t.label]])),
  ...Object.fromEntries(NERVES.map((n) => [`nerve-${n.id}`, ['העצבים', `${n.name} (${n.roman})`]])),
  ...Object.fromEntries(PRESS.map((x) => [`press-${x.id}`, ['בתקשורת', x.title]])),
  ...Object.fromEntries(CONDITIONS.map((c) => [`condition-${c.id}`, ['העצבים', isTreatment(c) ? `${byId[c.nerve].name} (${byId[c.nerve].roman})` : 'מצבים ומחלות', c.title]])),
};
const CRUMB_PAGE = { 'העצבים': 'nerves', 'המעבדה': 'lab', 'בתקשורת': 'press', 'מצבים ומחלות': 'conditions',
  ...Object.fromEntries(NERVES.map((n) => [`${n.name} (${n.roman})`, `nerve-${n.id}`])) };
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE.url}#website`, name: SITE.name, url: SITE.url, inLanguage: 'he' };
const EDU_LEVEL = 'תיכון, סטודנטים למקצועות הבריאות';

function jsonLd({ page, title, description, nerve, condition }) {
  if (page === '404') return '';
  const url = pageUrl(page);
  const name = title.split(' · ').slice(0, -1).join(' · ') || title;
  const graph = [];
  if (page === 'index') {
    graph.push({ ...WEBSITE, description });
  } else {
    const labels = CRUMB[page] ?? [name];
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
      itemListElement: [{ name: SITE.name, url: SITE.url }, ...labels.map((l, i) => ({
        name: l, url: i === labels.length - 1 ? url : pageUrl(CRUMB_PAGE[l] ?? page),
      }))].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
    });
    const about = nerve
      ? { '@type': 'AnatomicalStructure', name: nerve.en, alternateName: [nerve.latin, nerve.name] }
      : page === 'nerve-zero' ? { '@type': 'AnatomicalStructure', name: 'Terminal nerve', alternateName: ['Nervus terminalis', 'Cranial nerve zero', 'העצב הטרמינלי'] }
      : condition && isTreatment(condition) ? { '@type': 'MedicalTherapy', name: condition.en, alternateName: condition.title }
      : condition ? { '@type': 'MedicalCondition', name: condition.en, alternateName: condition.title }
      : null;
    const isLesson = !!about || page === 'basics' || page === 'exam' || page === 'history' || page === 'clinic' || LAB.some((t) => t.page === page);
    graph.push({
      '@type': isLesson ? ['WebPage', 'LearningResource'] : 'WebPage',
      '@id': url, url, name, description, inLanguage: 'he',
      isPartOf: { '@id': WEBSITE['@id'] }, breadcrumb: { '@id': `${url}#breadcrumb` },
      ...(isLesson ? { learningResourceType: LAB.some((t) => t.page === page) ? 'simulation' : page === 'clinic' ? 'case study' : 'lesson', educationalLevel: EDU_LEVEL, isAccessibleForFree: true } : {}),
      ...(about ? { about } : {}),
    });
    graph.push(WEBSITE);
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

function metaTags({ page, title, description, nerve, condition }) {
  const image = nerve ? `og/nerve-${nerve.id}.png` : page === 'nerve-zero' ? 'og/nerve-zero.png' : 'og.png';
  return [
    '<!--og-->',
    page === '404' ? '' : `<link rel="canonical" href="${pageUrl(page)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="he_IL" />`,
    `<meta property="og:site_name" content="${attr(SITE.name)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:url" content="${pageUrl(page)}" />`,
    `<meta property="og:image" content="${SITE.url}${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    jsonLd({ page, title, description, nerve, condition }),
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
        const m = req.url?.match(/^\/nerve-(?!zero\.)([\w-]+)\.html(\?.*)?$/);
        if (m) req.url = `/nerve.html?id=${m[1]}`;
        const ps = req.url?.match(/^\/press-(?!story\.)([\w-]+)\.html(\?.*)?$/);
        if (ps) req.url = `/press-story.html?id=${ps[1]}`;
        const cs = req.url?.match(/^\/condition-([\w-]+)\.html(\?.*)?$/);
        if (cs) req.url = `/condition.html?id=${cs[1]}`;
        next();
      });
    },
    generateBundle(_, bundle) {
      const page = (name, fn) => { bundle[name].source = fn(String(bundle[name].source)); };
      page('nerves.html', (html) => fill(html, '<div id="nerves-root">', nervesList(NERVES)));
      page('clinic.html', (html) => fill(html, '<div id="case-list">', caseCards(CASES)));
      page('press.html', (html) => fill(html, '<div id="press-root">', pressCards(PRESS)));
      page('conditions.html', (html) => fill(html, '<div id="conditions-root">', conditionCards(CONDITIONS.filter((c) => !isTreatment(c)))));
      page('history.html', (html) => fill(html, '<div id="timeline-root">', timeline(EVENTS)));
      page('basics.html', (html) => fill(html, '<div id="basics-atlas">', figure(IMAGES.base, 'pic-atlas')));
      page('about.html', (html) => fill(html, '<div id="credits-root">', creditsList(CREDITS)));
      page('lab.html', (html) => fill(html, '<div class="grid grid-3 lab-grid" id="lab-grid">', LAB.map((t) => `<article class="card lab-card"><div class="card-body">`
        + `<p class="lab-card-nerves" dir="ltr">${t.nerves}</p>`
        + `<h2><a class="card-link" href="./${t.page}.html">${t.label}</a></h2><p>${t.text}</p></div></article>`).join('')));
      page('exam.html', (html) => fill(html, '<div id="exam-root" class="exam-list">', examList(NERVES)));

      // עמוד סטטי לכל עצב: עותק של nerve.html עם כותרת, תיאור ותוכן משלו
      const base = String(bundle['nerve.html'].source);
      for (const n of NERVES) {
        const title = `${n.name} (${n.roman}) · ${SITE.name}`;
        const description = `העצב הקרניאלי ה-${n.num}: ${n.tagline} ${n.intro[0]}`.slice(0, 158);
        const og = metaTags({ page: `nerve-${n.id}`, title, description, nerve: n });
        let html = base
          .replace('<html lang="he" dir="rtl">', `<html lang="he" dir="rtl" data-nerve-id="${attr(n.id)}">`)
          .replace(/<title>.*?<\/title>/, `<title>${attr(title)}</title>`)
          .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${attr(description)}"`)
          .replace(/<!--og-->[\s\S]*?<!--\/og-->/, og);
        html = fill(html, '<div class="container" id="nerve-root">', nerveBody(n));
        this.emitFile({ type: 'asset', fileName: `nerve-${n.id}.html`, source: html });
      }
      delete bundle['nerve.html'];

      // עמוד סטטי לכל סיפור ב"בתקשורת"
      const storyBase = String(bundle['press-story.html'].source);
      for (const x of PRESS) {
        const title = `${x.title} · בתקשורת · ${SITE.name}`;
        const description = x.teaser.slice(0, 158);
        let html = storyBase
          .replace('<html lang="he" dir="rtl">', `<html lang="he" dir="rtl" data-story-id="${attr(x.id)}">`)
          .replace(/<title>.*?<\/title>/, `<title>${attr(title)}</title>`)
          .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${attr(description)}"`)
          .replace(/<!--og-->[\s\S]*?<!--\/og-->/, metaTags({ page: `press-${x.id}`, title, description }));
        html = fill(html, '<div class="container" id="story-root">', pressStory(x));
        this.emitFile({ type: 'asset', fileName: `press-${x.id}.html`, source: html });
      }
      delete bundle['press-story.html'];

      // עמוד סטטי לכל מצב ב"מצבים ומחלות"
      const condBase = String(bundle['condition.html'].source);
      for (const c of CONDITIONS) {
        const title = `${c.title} · ${isTreatment(c) ? byId[c.nerve].name : 'מצבים ומחלות'} · ${SITE.name}`;
        const description = c.short.slice(0, 158);
        let html = condBase
          .replace('<html lang="he" dir="rtl">', `<html lang="he" dir="rtl" data-condition-id="${attr(c.id)}">`)
          .replace(/<title>.*?<\/title>/, `<title>${attr(title)}</title>`)
          .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${attr(description)}"`)
          .replace(/<!--og-->[\s\S]*?<!--\/og-->/, metaTags({ page: `condition-${c.id}`, title, description, condition: c }));
        html = fill(html, '<div class="container" id="condition-root">', conditionPage(c));
        // טיפול שייך לעמוד העצב, לא לרשימת המצבים: בתפריט מודגש "העצבים"
        if (isTreatment(c)) html = html.replaceAll('href="./conditions.html" aria-current="page"', 'href="./conditions.html"').replaceAll('<li><a href="./nerves.html"><svg', '<li><a href="./nerves.html" aria-current="page"><svg');
        this.emitFile({ type: 'asset', fileName: `condition-${c.id}.html`, source: html });
      }
      delete bundle['condition.html'];

      const urls = [
        ...PAGES.filter((p) => p !== 'nerve' && p !== 'press-story' && p !== 'condition' && p !== '404').map((p) => (p === 'index' ? '' : `${p}.html`)),
        ...NERVES.map((n) => `nerve-${n.id}.html`),
        ...PRESS.map((x) => `press-${x.id}.html`),
        ...CONDITIONS.map((c) => `condition-${c.id}.html`),
      ].map((u) => `  <url><loc>${SITE.url}${u}</loc></url>`).join('\n');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
      // המבחן העצמי עבר לתחתית עמוד הבית: הכתובת הישנה מפנה לשם
      this.emitFile({ type: 'asset', fileName: 'lab-quiz.html', source: `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}#quiz"><meta http-equiv="refresh" content="0; url=./#quiz"><title>מבחן עצמי</title></head><body><p><a href="./#quiz">המבחן העצמי עבר לעמוד הבית</a></p></body></html>\n` });
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
