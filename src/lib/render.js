// HTML לעמודים שנבנים מהנתונים: עמוד עצב, רשימת העצבים וציר הזמן.
// פונקציות טהורות שמחזירות מחרוזת — רצות גם ב-build (vite.config.js, עמודים סטטיים לכל עצב)
// וגם בדפדפן (בשרת הפיתוח, ובסינון ברשימה). כל טקסט מהנתונים עובר esc.

import { NERVES, TYPES, COMPONENTS, BRAIN, byId, nerveUrl } from '../../content/nerves.js';
import { FORAMINA } from '../../content/foramina.js';
import { brainstemSvg } from './brainstem.js';
import { DIAGRAMS } from './diagrams.js';
import { RESEARCH, RESEARCH_UPDATED } from '../../content/research.js';
import { PRESS } from '../../content/press.js';
import { IMAGES } from '../../content/images.js';
import { CONDITIONS, titlesFor, isTreatment } from '../../content/conditions.js';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const foramenById = Object.fromEntries(FORAMINA.map((f) => [f.id, f]));

export const typeTag = (type) => `<span class="type-tag type-${type}">${esc(TYPES[type].label)}</span>`;
export const romanBadge = (n, cls = '') => `<span class="roman roman-${n.type} ${cls}" aria-hidden="true">${n.roman}</span>`;

const icon = (id) => `<svg aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;

// אייקונים לכותרות הפרקים בעמוד עצב
export const NERVE_ICONS = `<svg class="icon-sprite" aria-hidden="true" focusable="false">
  <symbol id="i-q" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17" r=".9" fill="currentColor"/></symbol>
  <symbol id="i-do" viewBox="0 0 24 24"><path d="M13 3 5 14h6l-1 7 8-11h-6z"/></symbol>
  <symbol id="i-path" viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h6a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h6"/></symbol>
  <symbol id="i-test" viewBox="0 0 24 24"><path d="M9 4h6v3H9z"/><path d="M15 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="m9 13 2 2 4-4"/></symbol>
  <symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".9" fill="currentColor"/></symbol>
  <symbol id="i-lab" viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 15h9"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></symbol>
  <symbol id="i-map" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
</svg>`;

function section(id, ico, title, body, extraClass = '') {
  return `<section id="${id}" class="lesson ${extraClass}" aria-labelledby="${id}-h">`
    + `<header class="lesson-title"><span class="lesson-ico" aria-hidden="true">${icon(ico)}</span><h2 id="${id}-h">${title}</h2></header>`
    + body + '</section>';
}

// שאלת "נסו קודם": בלי JS — התשובה בתוך <details>. עם JS — src/pages/nerve.js הופך את האפשרויות לכפתורים.
function tryFirst(n) {
  const t = n.try;
  return `<div class="try" data-answer="${t.answer}">`
    + `<p class="try-q">${esc(t.q)}</p>`
    + `<ol class="quiz-options" type="א">${t.options.map((o, i) => `<li><button type="button" class="quiz-option" data-i="${i}" disabled>${esc(o)}</button></li>`).join('')}</ol>`
    + `<p class="try-feedback" role="status" aria-live="polite"></p>`
    + `<details class="try-answer"><summary>הצגת התשובה</summary><p><strong>${esc(t.options[t.answer])}.</strong> ${esc(t.explain)}</p></details>`
    + '</div>';
}

export function nerveBody(n) {
  const i = n.num - 1;
  const prev = NERVES[i - 1], next = NERVES[i + 1];

  const strip = `<nav class="nerve-strip" aria-label="12 העצבים"><ol>${NERVES.map((m) =>
    `<li><a href="${nerveUrl(m.id)}" class="t-${m.type}"${m.id === n.id ? ' aria-current="page"' : ''} title="${esc(m.name)}" aria-label="עצב ${m.roman}: ${esc(m.name)}">${m.roman}</a></li>`).join('')}</ol></nav>`;

  const head = `<header class="nerve-head">`
    + `<nav class="breadcrumb" aria-label="נתיב"><a href="./nerves.html">העצבים</a> / עצב ${n.roman}</nav>`
    + `<div class="nerve-title">${romanBadge(n, 'roman-xl')}<div>`
    + `<p class="nerve-kicker">העצב הקרניאלי ה-${n.num} · ${typeTag(n.type)}</p>`
    + `<h1>${esc(n.name)}</h1>`
    + `<p class="nerve-latin" lang="la" dir="ltr">${esc(n.latin)} · <span lang="en">${esc(n.en)}</span></p>`
    + `</div></div><p class="lead">${esc(n.tagline)}</p></header>`;

  const facts = `<dl class="nerve-facts">`
    + `<div><dt>סוג</dt><dd>${esc(TYPES[n.type].long)}</dd></div>`
    + `<div><dt>מקום החיבור למוח</dt><dd>${esc(BRAIN[n.brain])}</dd></div>`
    + `<div><dt>יוצא מהגולגולת</dt><dd>${esc(n.exit)}</dd></div>`
    + `<div><dt>מרכיבים</dt><dd class="comp-badges">${[...new Set(n.components.map((c) => c.kind))].map((k) => `<span class="comp comp-${k}">${COMPONENTS[k]}</span>`).join('')}</dd></div>`
    + `</dl>`;

  const locator = `<figure class="nerve-locator">${brainstemSvg({ active: n.id, title: `גזע המוח מלמטה, ועליו מודגש ${n.name} (${n.roman})` })}`
    + `<figcaption>${esc(n.name)} מודגש. <span class="muted">${esc(n.attach)}.</span></figcaption></figure>`;

  const does = section('does', 'do', 'מה הוא עושה',
    `<ul class="comp-list">${n.components.map((c) => `<li><span class="comp comp-${c.kind}">${COMPONENTS[c.kind]}</span><span>${esc(c.text)}</span></li>`).join('')}</ul>`
    + `<div class="prose">${n.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`
    + (n.atlas ?? []).map((im) => figure(im, 'pic-atlas')).join(''));

  const maps = (n.diagrams ?? []).map((d, i) => section(`map-${i + 1}`, 'map', DIAGRAMS[d.id].title, DIAGRAMS[d.id].html(d), 'lesson-map')).join('');

  const path = section('path', 'path', 'המסלול',
    `<ol class="route">${n.path.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>`
    + `<p class="route-foramen">יוצא מחלל הגולגולת דרך: ${(n.foramina ?? [n.foramen]).map((id) => { const x = foramenById[id]; return `<a href="./lab-skull.html#${x.id}">${esc(x.name)}</a> <span class="muted" lang="en" dir="ltr">(${esc(x.en)})</span>`; }).join(' · ')}</p>`);

  const test = section('test', 'test', 'איך בודקים',
    `<ol class="exam-steps">${n.test.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`
    + `<p class="callout">${esc(n.test.tip)}</p>`);

  const conds = CONDITIONS.filter((c) => c.nerve === n.id && !isTreatment(c));
  const treats = CONDITIONS.filter((c) => c.nerve === n.id && isTreatment(c));
  const lesion = section('lesion', 'warn', 'כשמשהו משתבש',
    `<div class="prose"><p>${esc(n.lesion.text)}</p></div><ul class="sign-list">${n.lesion.signs.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`
    + (conds.length ? `<p class="cond-links">${conds.map((c) => `<a class="lab-link" href="${conditionUrl(c.id)}">לעמוד המלא: ${esc(c.title)} ←</a>`).join(' ')}</p>` : ''), 'lesson-warn');

  const facts2 = section('facts', 'star', 'עוד משהו מעניין',
    `<ul class="fact-list">${n.facts.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`
    + (n.lab ? `<p><a class="lab-link" href="./${n.lab.href}">${esc(n.lab.label)} ←</a></p>` : '')
    + treats.map((c) => `<div class="treat-card"><p class="panel-kicker">טיפול דרך העצב</p><h3><a href="${conditionUrl(c.id)}">${esc(c.title)}</a> <span class="cond-en" lang="en" dir="ltr">${esc(c.en)}</span></h3><p>${esc(c.short)}</p></div>`).join(''));

  const papers = RESEARCH[n.id] ?? [];
  const research = papers.length ? section('research', 'lab', 'מהמחקר החדש',
    `<p class="muted">מאמרים מהשנה האחרונה על ${esc(n.name)}, מתוך PubMed, מאגר המאמרים הרפואיים של ספריית הרפואה האמריקאית. הכותרות תורגמו לעברית; המאמרים עצמם באנגלית.</p>`
    + `<ul class="papers">${papers.map((a) => `<li><a class="paper-title" href="https://pubmed.ncbi.nlm.nih.gov/${esc(a.pmid)}/" rel="noopener" target="_blank">${esc(a.he)}</a>`
      + `<p class="paper-en" lang="en" dir="ltr">${esc(a.en)}</p>`
      + `<p class="paper-meta"><span class="paper-kind">${esc(a.kind)}</span> <span lang="en" dir="ltr">${esc(a.journal)}</span> · ${esc(a.date)}</p></li>`).join('')}</ul>`
    + `<p class="paper-note muted">עודכן ב-${heDate(RESEARCH_UPDATED)}. הרשימה מתעדכנת מדי שבוע. המאמרים מוצגים לעיון ולא כהמלצה רפואית.</p>`) : '';

  const report = `<p class="report-error muted">מצאתם טעות בעמוד? נשמח לשמוע: <a href="mailto:nadaval56@gmail.com?subject=${encodeURIComponent(`טעות בעמוד ${n.name}`)}">nadaval56@gmail.com</a></p>`;

  const press = PRESS.filter((x) => x.nerve === n.id);
  const inNews = press.length ? `<aside class="in-news"><p class="in-news-kicker">בתקשורת</p>${press.map((x) => `<p><a href="${pressUrl(x.id)}">${esc(x.title)}</a> <span class="muted">· ${pressDate(x)}</span></p>`).join('')}</aside>` : '';

  const related = `<section class="related" aria-labelledby="related-h"><h2 id="related-h">עצבים קשורים</h2><div class="grid grid-3">${n.related.map((id) => nerveCard(byId[id])).join('')}</div></section>`;

  const pager = `<nav class="pager" aria-label="מעבר בין העצבים">`
    + (prev ? `<a class="pager-link pager-prev" href="${nerveUrl(prev.id)}"><span class="pager-dir">העצב הקודם · ${prev.roman}</span><span class="pager-title">${esc(prev.name)}</span></a>` : '<span></span>')
    + (next ? `<a class="pager-link pager-next" href="${nerveUrl(next.id)}"><span class="pager-dir">העצב הבא · ${next.roman}</span><span class="pager-title">${esc(next.name)}</span></a>` : '<span></span>')
    + '</nav>';

  return NERVE_ICONS + strip + `<div class="nerve-top"><div class="nerve-intro">${head}${facts}</div>${locator}</div>`
    + `<section class="lesson try-section" aria-labelledby="try-h"><header class="lesson-title"><span class="lesson-ico" aria-hidden="true">${icon('q')}</span><h2 id="try-h">נסו קודם</h2></header>`
    + `<p class="muted">לפני שקוראים: מה דעתכם?</p>${tryFirst(n)}</section>`
    + `<div class="lessons">${does}${maps}${path}${test}${lesion}${facts2}${research}</div>` + inNews + report + related + pager;
}

export function nerveCard(n) {
  return `<article class="card nerve-card t-${n.type}" data-type="${n.type}"><div class="card-body">`
    + `<div class="nerve-card-head">${romanBadge(n)}${typeTag(n.type)}</div>`
    + `<h3><a class="card-link" href="${nerveUrl(n.id)}">${esc(n.name)}</a></h3>`
    + `<p class="nerve-card-en" lang="en" dir="ltr">${esc(n.en)}</p>`
    + `<p>${esc(n.tagline)}</p></div></article>`;
}

export function nervesList(nerves) {
  const rows = nerves.map((n) => `<tr data-type="${n.type}"><td>${romanBadge(n)}</td>`
    + `<th scope="row"><a href="${nerveUrl(n.id)}">${esc(n.name)}</a><span class="muted" lang="en" dir="ltr">${esc(n.en)}</span></th>`
    + `<td data-label="סוג">${typeTag(n.type)}</td><td data-label="חיבור למוח">${esc(BRAIN[n.brain])}</td><td data-label="פתח">${(n.foramina ?? [n.foramen]).map((id) => esc(foramenById[id].name)).join(', ')}</td>`
    + `<td data-label="מרכיבים">${[...new Set(n.components.map((c) => c.kind))].map((k) => `<span class="comp comp-${k}">${COMPONENTS[k]}</span>`).join(' ')}</td></tr>`).join('');
  return `<p class="result-count" role="status">${nerves.length} עצבים</p>`
    + `<div class="grid grid-3 nerve-grid">${nerves.map(nerveCard).join('')}</div>`
    + `<h2 class="table-title">כל העצבים בטבלה אחת</h2>`
    + `<div class="table-wrap" tabindex="0" role="region" aria-label="טבלת 12 העצבים"><table class="data-table nerve-table"><caption class="visually-hidden">12 העצבים הקרניאליים: סוג, מקום החיבור למוח, פתח היציאה ומרכיבים</caption>`
    + `<thead><tr><th scope="col">#</th><th scope="col">שם</th><th scope="col">סוג</th><th scope="col">חיבור למוח</th><th scope="col">פתח</th><th scope="col">מרכיבים</th></tr></thead>`
    + `<tbody>${rows}</tbody></table></div>`;
}

const HE_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
export const heDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ב${HE_MONTHS[m - 1]} ${y}`; };

// תמונה עם כיתוב וקרדיט קצר. image: { file, alt, caption, source: { title, author, url, license, licenseUrl } }
export const imgUrl = (file) => `./images/${file}`;
export function figure(im, cls = '') {
  const src = im.source;
  return `<figure class="pic ${cls}"><a class="pic-zoom" href="${imgUrl(esc(im.file))}" target="_blank" rel="noopener">`
    + `<img src="${imgUrl(esc(im.file))}" alt="${esc(im.alt)}" loading="lazy" decoding="async"${im.w ? ` width="${im.w}" height="${im.h}"` : ''}><span class="visually-hidden"> (הגדלה, נפתח בכרטיסייה חדשה)</span></a>`
    + `<figcaption>${esc(im.caption)} <span class="pic-credit">${esc(src.author)} · <a href="${esc(src.url)}" rel="noopener" target="_blank">${esc(src.license)}</a></span></figcaption></figure>`;
}

// רשימת קרדיטים לכל התמונות באתר (עמוד אודות)
export function creditsList(items) {
  return `<ul class="credits">${items.map(({ im, where }) => `<li><img src="${imgUrl(esc(im.file))}" alt="" loading="lazy">`
    + `<div><p class="credit-title"><a href="${esc(im.source.url)}" rel="noopener" target="_blank" lang="en" dir="ltr">${esc(im.source.title)}</a></p>`
    + `<p class="muted">${esc(im.source.author)} · ${im.source.licenseUrl ? `<a href="${esc(im.source.licenseUrl)}" rel="noopener" target="_blank">${esc(im.source.license)}</a>` : esc(im.source.license)}`
    + `${im.source.modifications ? ` · ${esc(im.source.modifications)}` : ''}</p><p class="muted">מופיעה ב: ${esc(where)}</p></div></li>`).join('')}</ul>`;
}

export function timeline(events) {
  const link = (l) => `<a class="tl-case" href="./${esc(l.href)}">${esc(l.label)}</a>`;
  const nav = `<nav class="tl-nav" aria-label="קפיצה לשנה"><ol>${events.map((e) => `<li><a href="#tl-${esc(e.id)}" data-id="${esc(e.id)}">${esc(e.year)}</a></li>`).join('')}</ol></nav>`;
  const items = events.map((e) => {
    const sources = [e.source, ...(e.moreSources ?? [])].map((s, i) => `<a href="${esc(s.url)}" rel="noopener" target="_blank">${i ? '' : 'מקור: '}${esc(s.label)}</a>`).join('');
    const fig = e.image ? figure(e.image, 'tl-figure') : '';
    return `<li class="tl-item" id="tl-${esc(e.id)}"><div class="tl-marker" aria-hidden="true"><span>${esc(e.year)}</span></div><article class="tl-card">${fig}`
      + `<p class="tl-date">${esc(e.date)}</p><h2 class="tl-title">${esc(e.title)}</h2><p class="tl-text">${esc(e.text)}</p>`
      + `<p class="tl-meta">${sources}${e.link ? link(e.link) : ''}</p></article></li>`;
  }).join('');
  return `<div class="timeline">${nav}<ol class="tl-list">${items}</ol></div>`;
}

// הבדיקה צעד אחר צעד (exam.html) — נבנית מ-test.steps של כל עצב, כך שהתוכן נשאר במקום אחד
const EXAM_SHORT = {
  olfactory: 'ריח', optic: 'ראייה, שדות ראייה ואישונים', oculomotor: 'עפעפיים, אישונים ותנועות עיניים', trochlear: 'מבט למטה ופנימה',
  trigeminal: 'תחושה בפנים ולעיסה', abducens: 'מבט לצדדים', facial: 'הבעות פנים', vestibulocochlear: 'שמיעה ושיווי משקל',
  glossopharyngeal: 'תחושה בלוע', vagus: 'חך, קול ובליעה', accessory: 'כתפיים וסיבוב ראש', hypoglossal: 'לשון',
};
export function examList(nerves) {
  return nerves.map((n, i) => `<details class="exam-item t-${n.type}" id="exam-${n.id}"${i === 0 ? ' open' : ''}>`
    + `<summary>${romanBadge(n)}<span class="exam-name">${esc(n.name)}</span><span class="exam-what">${EXAM_SHORT[n.id]}</span></summary>`
    + `<div class="exam-body"><ol class="exam-steps">${n.test.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`
    + `<p class="callout">${esc(n.test.tip)}</p><p><a href="${nerveUrl(n.id)}">לעמוד של ${esc(n.name)} ←</a></p></div></details>`).join('');
}

// "בתקשורת": רשימת הסיפורים (press.html) ועמוד לכל סיפור (press-<id>.html)
export const pressUrl = (id) => `./press-${id}.html`;
const pressDate = (x) => x.dateLabel ?? heDate(x.date);
const pressNerve = (x) => `<a href="${nerveUrl(x.nerve)}">${esc(byId[x.nerve].name)} (${byId[x.nerve].roman})</a>`;
const extLinks = (arr) => arr.map((l) => `<a href="${esc(l.url)}" rel="noopener" target="_blank">${esc(l.label)}</a>`).join(' · ');

export function pressCards(items) {
  return `<ol class="press-cards">${[...items].sort((a, b) => b.date.localeCompare(a.date)).map((x) => `<li class="press-card t-${byId[x.nerve].type}">`
    + `<p class="press-date">${pressDate(x)} · <span class="press-nerve">${esc(byId[x.nerve].name)} (${byId[x.nerve].roman})</span></p>`
    + `<h2><a class="card-link" href="${pressUrl(x.id)}">${esc(x.title)}</a></h2>`
    + `<p>${esc(x.teaser)}</p><p class="press-more" aria-hidden="true">לסיפור המלא ←</p></li>`).join('')}</ol>`;
}

export function pressStory(x) {
  return `<nav class="breadcrumb" aria-label="נתיב"><a href="./press.html">בתקשורת</a> / ${esc(x.title)}</nav>`
    + `<article class="press-item" aria-labelledby="story-h">`
    + `<p class="press-date">${pressDate(x)} · ${pressNerve(x)}</p>`
    + `<h1 id="story-h">${esc(x.title)}</h1>`
    + x.summary.map((t) => `<p>${esc(t)}</p>`).join('')
    + (x.quote ? `<blockquote class="press-quote"><p>"${esc(x.quote)}"</p></blockquote>` : '')
    + `<p class="press-sources">בחדשות: ${extLinks(x.sources)}</p>`
    + `<section class="press-known" aria-labelledby="known-h"><h2 id="known-h">מה ידוע</h2><ul>${x.known.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
    + `<p class="press-sources muted">מקורות: ${extLinks(x.knownSources)}</p></section>`
    + `<p class="press-links">${x.links.map((l) => `<a class="lab-link" href="./${esc(l.href)}">${esc(l.label)} ←</a>`).join(' ')}</p>`
    + `</article><p class="press-back"><a href="./press.html">→ לכל הסיפורים בתקשורת</a></p>`;
}

// "פגיעות ומחלות": רשימה (conditions.html) ועמוד לכל פגיעה (condition-<id>.html)
export const conditionUrl = (id) => `./condition-${id}.html`;
const DISCLAIMER_NOTE = 'המידע כאן לימודי וכללי, ואינו תחליף לרופא. האתר אינו כלי אבחון ואינו ממליץ על טיפול.';
const condBlock = (items) => items.map((it) => (typeof it === 'string'
  ? `<p>${esc(it)}</p>`
  : `<ul>${it.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`)).join('');

export function conditionCards(items) {
  return `<ol class="press-cards cond-cards">${items.map((c) => { const n = byId[c.nerve]; return `<li class="press-card t-${n.type}">`
    + `<p class="press-date"><span class="press-nerve">${esc(n.name)} (${n.roman})</span></p>`
    + `<h2><a class="card-link" href="${conditionUrl(c.id)}">${esc(c.title)}</a> <span class="cond-en" lang="en" dir="ltr">${esc(c.en)}</span></h2>`
    + `<p>${esc(c.short)}</p><p class="press-more" aria-hidden="true">לעמוד המלא ←</p></li>`; }).join('')}</ol>`;
}

export function conditionPage(c) {
  const n = byId[c.nerve];
  const T = titlesFor(c);
  const treat = isTreatment(c);
  const order = ['what', 'epidemiology', 'causes', 'symptoms', 'diagnosis', 'differential', 'treatment', 'course', 'redFlags'];
  const toc = `<nav class="cond-toc" aria-label="בעמוד הזה"><p class="cond-toc-title">בעמוד הזה</p><ol>${order.map((k) => `<li><a href="#c-${k}">${T[k]}</a></li>`).join('')}</ol></nav>`;
  const body = order.map((k) => {
    const v = c.sections[k];
    let inner;
    if (k === 'differential') inner = `<dl class="cond-ddx">${v.map((d) => `<div><dt>${esc(d.name)}</dt><dd>${esc(d.tell)}</dd></div>`).join('')}</dl>`;
    else inner = condBlock(v);
    if (k === 'treatment') inner = `<p class="callout cond-note">${DISCLAIMER_NOTE}</p>` + inner;
    inner += (c.images ?? []).filter((im) => im.after === k).map((im) => figure(IMAGES[im.key], 'pic-atlas cond-pic')).join('');
    const cls = k === 'redFlags' ? ' cond-red' : k === 'treatment' ? ' cond-treat' : '';
    return `<section id="c-${k}" class="cond-sec${cls}" aria-labelledby="c-${k}-h"><h2 id="c-${k}-h">${T[k]}</h2><div class="prose">${inner}</div></section>`;
  }).join('');
  const parent = treat ? `<a href="${nerveUrl(n.id)}">${esc(n.name)} (${n.roman})</a>` : `<a href="./conditions.html">פגיעות ומחלות</a>`;
  return `<nav class="breadcrumb" aria-label="נתיב"><a href="./nerves.html">העצבים</a> / ${parent} / ${esc(c.title)}</nav>`
    + `<header class="page-head cond-head"><p class="press-date">${esc(n.name)} (${n.roman}) · עודכן ב-${heDate(c.updated)}</p>`
    + `<h1>${esc(c.title)} <span class="cond-en" lang="en" dir="ltr">${esc(c.en)}</span></h1><p class="lead">${esc(c.short)}</p>`
    + `<p class="callout cond-note">${DISCLAIMER_NOTE}${treat ? '' : ' מי שיש לו תסמינים כאלה צריך לפנות לרופא.'}</p></header>`
    + toc + `<div class="cond-body">${body}</div>`
    + `<section class="cond-sec" aria-labelledby="c-links-h"><h2 id="c-links-h">עוד באתר</h2><ul class="cond-links">${c.links.map((l) => `<li><a href="./${esc(l.href)}"><span class="cond-link-kind">${esc(l.kind ?? '')}</span><span class="cond-link-label">${esc(l.label)}</span></a></li>`).join('')}</ul></section>`
    + `<p class="press-sources muted">מקורות: ${c.sources.map((x) => `<a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.label)}</a>`).join(' · ')}</p>`
    + (treat ? `<p class="press-back"><a href="${nerveUrl(n.id)}">→ לעמוד של ${esc(n.name)}</a></p>` : `<p class="press-back"><a href="./conditions.html">→ לכל הפגיעות</a></p>`);
}
