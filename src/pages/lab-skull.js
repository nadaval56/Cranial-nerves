// בסיס הגולגולת: מבט מלמעלה על רצפת הגולגולת (החלק הקדמי למעלה). תרשים סכמטי, לא בקנה מידה.
// לחיצה על פתח — מה עובר בו. בחירת עצב — איפה הפתח שלו. כתובת עם #<id של פתח> בוחרת אותו מראש.

import { s } from '../lib/dom.js';
import { FORAMINA } from '../../content/foramina.js';
import { NERVES, byId, nerveUrl } from '../../content/nerves.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const W = 420, H = 548, CX = 210;
const MIRROR = `matrix(-1 0 0 1 ${W} 0)`;

// צורות הפתחים לחצי הימני של התרשים; החצי השני הוא שיקוף (התרשים סימטרי, ולכן אין כאן עניין של צד).
// המיקומים היחסיים לפי האנטומיה של רצפת הגולגולת במבט מלמעלה: קדימה למעלה, אחורה למטה.
const SHAPES = {
  cribriform: { el: 'path', a: { d: 'M214 98 C219 97 223 104 223 116 C223 132 221 150 218 160 C216 163 213 163 212 158 C211 146 211 120 211 106 C211 101 212 98 214 98 Z' } },
  optic: { el: 'ellipse', a: { cx: 228, cy: 199, rx: 5.5, ry: 6.5, transform: 'rotate(-30 228 199)' } },
  sof: { el: 'path', a: { d: 'M245 215 C255 209 276 199 296 191 C300 190 302 193 299 196 C284 206 264 218 251 224 C246 226 242 220 245 215 Z' } },
  rotundum: { el: 'circle', a: { cx: 252, cy: 238, r: 5 } },
  ovale: { el: 'ellipse', a: { cx: 266, cy: 259, rx: 9, ry: 5.5, transform: 'rotate(35 266 259)' } },
  spinosum: { el: 'circle', a: { cx: 284, cy: 274, r: 3.6 } },
  iam: { el: 'ellipse', a: { cx: 273, cy: 322, rx: 7.5, ry: 5, transform: 'rotate(25 273 322)' } },
  jugular: { el: 'path', a: { d: 'M252 358 C258 350 274 349 284 355 C290 360 287 369 278 371 C268 373 258 371 253 367 C250 364 250 361 252 358 Z' } },
  hypoglossal: { el: 'ellipse', a: { cx: 243, cy: 386, rx: 4.6, ry: 4, transform: 'rotate(30 243 386)' } },
};
// אזור לחיצה מוגדל לכל פתח (הפתחים הקטנים קשים ללחיצה במגע)
const HITS = {
  cribriform: [217, 130, 14], optic: [228, 199, 13], sof: [272, 207, 16], rotundum: [252, 238, 11], ovale: [266, 259, 12],
  spinosum: [286, 276, 10], iam: [273, 322, 13], jugular: [269, 361, 15], hypoglossal: [243, 386, 10],
};

// הציור עצמו: חצי ימני של התרשים, שמשוכפל במראה לחצי השמאלי
const HALF = `
  <path class="skb-ant" d="M210 44 C262 44 318 64 352 104 C370 126 380 150 382 176 C346 168 300 178 262 192 C246 198 238 206 236 222 C228 214 220 211 210 211 Z"/>
  <path class="skb-mid" d="M236 222 C238 206 246 198 262 192 C300 178 346 168 382 176 C392 214 396 262 392 300 C390 322 388 338 386 350 C330 326 280 300 238 280 C232 276 228 268 226 258 C232 248 236 236 236 222 Z"/>
  <path class="skb-post" d="M238 280 C280 300 330 326 386 350 C384 410 352 474 300 500 C272 512 240 518 210 518 L210 446 C226 446 238 432 240 414 C242 396 238 380 232 370 C228 356 226 340 224 300 C228 290 232 284 238 280 Z"/>
  <path class="skb-orbit" d="M232 112 C262 92 318 98 350 132 C362 146 368 160 370 172 C340 168 300 176 268 188 C254 172 240 150 232 112 Z"/>
  <g class="skb-juga">
    <path d="M250 112 C262 128 270 150 276 178"/><path d="M272 106 C288 124 300 148 306 172"/><path d="M296 108 C314 124 328 146 334 168"/><path d="M320 118 C336 134 348 152 354 168"/>
  </g>
  <path class="skb-shadow" d="M242 230 C250 210 290 192 382 184"/>
  <path class="skb-shadow" d="M234 292 C272 306 330 334 386 356"/>
  <path class="skb-wing" d="M236 222 C236 206 244 196 262 190 C300 176 346 164 384 172 C385 176 384 179 381 179 C346 172 302 182 266 196 C252 202 244 210 242 224 C240 228 236 227 236 222 Z"/>
  <path class="skb-clinoid" d="M236 222 C240 228 244 236 240 242 C236 244 232 236 232 228 Z"/>
  <path class="skb-temporal" d="M262 232 C292 220 340 214 372 228 C384 262 384 300 378 334 C340 316 300 296 270 280 C256 272 250 250 262 232 Z"/>
  <path class="skb-petrous" d="M226 272 C232 266 244 266 258 272 C300 290 344 312 390 334 C392 342 390 350 386 352 C340 336 290 314 248 296 C236 290 226 284 226 272 Z"/>
  <path class="skb-ridge" d="M232 270 C262 280 330 312 388 340"/>
  <path class="skb-groove" d="M210 494 C252 494 312 478 352 446 C372 428 380 404 372 388 C362 372 330 368 304 366 C292 365 286 362 284 358"/>
  <path class="skb-groove-hi" d="M210 490 C252 490 310 474 348 444 C366 428 374 406 367 391"/>
  <path class="skb-cerebellar" d="M242 420 C262 402 300 392 336 404 C360 416 362 446 338 468 C306 494 262 500 230 492 C226 470 230 440 242 420 Z"/>
  <path class="skb-carotid" d="M228 248 C234 252 236 262 232 268"/>
  <path class="skb-lacerum" d="M228 268 C234 264 242 266 242 272 C242 278 234 280 230 277 C227 275 226 271 228 268 Z"/>
`;

const ART = `
  <defs>
    <radialGradient id="skb-bone" cx="50%" cy="38%" r="70%">
      <stop offset="0" stop-color="#bcae94"/><stop offset="0.6" stop-color="#9d8f76"/><stop offset="1" stop-color="#736652"/>
    </radialGradient>
    <linearGradient id="skb-rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9ceb6"/><stop offset="1" stop-color="#a3957a"/>
    </linearGradient>
    <radialGradient id="skb-antg" cx="50%" cy="60%" r="70%">
      <stop offset="0" stop-color="#b3a58a"/><stop offset="1" stop-color="#8c7e66"/>
    </radialGradient>
    <radialGradient id="skb-midg" cx="62%" cy="55%" r="60%">
      <stop offset="0" stop-color="#5e5345"/><stop offset="0.6" stop-color="#7a6d58"/><stop offset="1" stop-color="#998a70"/>
    </radialGradient>
    <radialGradient id="skb-postg" cx="40%" cy="45%" r="75%">
      <stop offset="0" stop-color="#55493b"/><stop offset="0.65" stop-color="#6e6250"/><stop offset="1" stop-color="#8f8168"/>
    </radialGradient>
    <linearGradient id="skb-petg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ddd1b8"/><stop offset="1" stop-color="#b4a589"/>
    </linearGradient>
    <linearGradient id="skb-clivg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9bba0"/><stop offset="1" stop-color="#8d7f68"/>
    </linearGradient>
    <radialGradient id="skb-sellag" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="#5e5343"/><stop offset="1" stop-color="#8f8169"/>
    </radialGradient>
    <radialGradient id="skb-hole" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#050403"/><stop offset="0.75" stop-color="#14100c"/><stop offset="1" stop-color="#3a3126"/>
    </radialGradient>
    <filter id="skb-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0.55 0" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="skb-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
    <filter id="skb-soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
    <filter id="skb-drop" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.55"/></filter>
    <clipPath id="skb-inner"><path d="M210 44 C318 44 384 118 390 250 C396 382 330 504 210 518 C90 504 24 382 30 250 C36 118 102 44 210 44 Z"/></clipPath>
  </defs>
  <style>
    .skb .sk-hole > *, .skb .sk-hole g > * { fill: url(#skb-hole); stroke: #2a231b; stroke-width: 1.4; }
    .skb .sk-hole:hover > *, .skb .sk-hole:hover g > * { stroke: var(--accent, #f0c46b); stroke-width: 1.8; }
    .skb .sk-hole.is-active > *, .skb .sk-hole.is-active g > * { fill: var(--nerve, #f5c84b); stroke: #fff3c4; stroke-width: 1.4; filter: drop-shadow(0 0 5px rgba(255, 210, 120, 0.75)); }
    .skb .sk-hole .skb-hit, .skb .sk-hole g .skb-hit { fill: transparent; stroke: none; filter: none; }
    .skb .sk-hole:focus-visible { outline: none; }
    .skb-skull { fill: url(#skb-rim); filter: url(#skb-drop); }
    .skb-base { fill: url(#skb-bone); }
    .skb-ant { fill: url(#skb-antg); }
    .skb-mid { fill: url(#skb-midg); }
    .skb-post { fill: url(#skb-postg); }
    .skb-orbit { fill: #c8ba9e; opacity: 0.3; filter: url(#skb-soft); }
    .skb-juga path { fill: none; stroke: #6d6150; stroke-width: 2.4; stroke-linecap: round; opacity: 0.35; filter: url(#skb-soft2); }
    .skb-wing { fill: #e2d7bf; stroke: #6f6350; stroke-width: 0.8; }
    .skb-clinoid { fill: #ddd1b8; stroke: #6f6350; stroke-width: 0.8; }
    .skb-temporal { fill: #4a4033; opacity: 0.7; filter: url(#skb-soft); }
    .skb-petrous { fill: url(#skb-petg); stroke: #6f6350; stroke-width: 0.8; }
    .skb-ridge { fill: none; stroke: #f1e9d6; stroke-width: 1.6; stroke-linecap: round; opacity: 0.85; }
    .skb-groove { fill: none; stroke: #4c4234; stroke-width: 7; stroke-linecap: round; opacity: 0.6; }
    .skb-groove-hi { fill: none; stroke: #cbbd9f; stroke-width: 1.2; opacity: 0.5; }
    .skb-cerebellar { fill: #42392d; opacity: 0.7; filter: url(#skb-soft); }
    .skb-carotid { fill: none; stroke: #5b5040; stroke-width: 3; stroke-linecap: round; opacity: 0.7; }
    .skb-lacerum { fill: #3a3024; opacity: 0.45; }
    .skb-clivus { fill: url(#skb-clivg); stroke: #6f6350; stroke-width: 0.8; }
    .skb-sella { fill: url(#skb-sellag); stroke: #6f6350; stroke-width: 0.8; }
    .skb-dorsum { fill: #e0d5bd; stroke: #6f6350; stroke-width: 0.8; }
    .skb-galli { fill: #eadfc8; stroke: #6f6350; stroke-width: 0.8; }
    .skb-crest { fill: none; stroke: #d9cdb3; stroke-width: 3; stroke-linecap: round; }
    .skb-ioc { fill: #d5c8ad; stroke: #6f6350; stroke-width: 0.8; }
    .skb-cut { fill: none; stroke: #f3ecdc; stroke-width: 1.2; opacity: 0.6; }
    .skb-grain { filter: url(#skb-grain); opacity: 0.6; pointer-events: none; mix-blend-mode: multiply; }
    .skb-shadow { fill: none; stroke: #241d15; stroke-width: 9; stroke-linecap: round; opacity: 0.55; filter: url(#skb-soft); }
    .skb-pores circle { fill: #2d251c; }
    .skb-label { fill: #e9dfc9; font-size: 12px; font-weight: 600; font-family: var(--font, sans-serif); paint-order: stroke; stroke: rgba(20, 16, 12, 0.85); stroke-width: 3px; stroke-linejoin: round; }
    .skb-dir { fill: var(--text-muted, #8a95a3); font-size: 12px; font-family: var(--font, sans-serif); }
  </style>
  <path class="skb-skull" d="M210 26 C330 26 404 110 410 252 C416 396 338 532 210 532 C82 532 4 396 10 252 C16 110 90 26 210 26 Z"/>
  <path class="skb-cut" d="M210 30 C326 30 400 112 406 252 C412 392 336 528 210 528 C84 528 8 392 14 252 C20 112 94 30 210 30 Z"/>
  <g clip-path="url(#skb-inner)">
    <path class="skb-base" d="M210 44 C318 44 384 118 390 250 C396 382 330 504 210 518 C90 504 24 382 30 250 C36 118 102 44 210 44 Z"/>
    <g class="skb-half">${HALF}</g>
    <g class="skb-half" transform="${MIRROR}">${HALF}</g>
    <path class="skb-crest" d="M210 50 L210 88"/>
    <path class="skb-galli" d="M210 88 C214 96 215 116 213 140 C212 148 208 148 207 140 C205 116 206 96 210 88 Z"/>
    <path class="skb-sella" d="M190 214 C196 210 224 210 230 214 C234 228 232 244 226 250 L194 250 C188 244 186 228 190 214 Z"/>
    <path class="skb-dorsum" d="M190 248 C198 252 222 252 230 248 C232 252 230 258 226 258 L194 258 C190 258 188 252 190 248 Z"/>
    <circle class="skb-dorsum" cx="226" cy="252" r="3.6"/><circle class="skb-dorsum" cx="194" cy="252" r="3.6"/>
    <path class="skb-clivus" d="M194 258 L226 258 C230 290 234 330 236 370 C226 366 194 366 184 370 C186 330 190 290 194 258 Z"/>
    <path class="skb-ioc" d="M206 446 C206 462 206 474 204 488 C208 494 212 494 216 488 C214 474 214 462 214 446 Z"/>
    <ellipse class="skb-ioc" cx="210" cy="494" rx="9" ry="6"/>
    <rect class="skb-grain" x="0" y="0" width="${W}" height="${H}"/>
  </g>
`;

const svg = s('svg', { class: 'skull-stage skb', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'איור של בסיס הגולגולת מבפנים, במבט מלמעלה (הפנים למעלה), עם הפתחים שדרכם יוצאים העצבים', direction: 'ltr' });
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));
const art = s('g', { class: 'skb-art', 'aria-hidden': 'true' });
art.innerHTML = ART;
svg.append(art);

// נקבוביות הלוחית המנוקבת (קישוט, לא לחיץ — הלחיצה על הלוחית עצמה)
const pores = s('g', { class: 'skb-pores', 'pointer-events': 'none' });

const label = (x, y, t) => svg.append(s('text', { class: 'skb-label', x, y, 'text-anchor': 'middle', 'pointer-events': 'none' }, document.createTextNode(t)));
label(118, 140, 'גומה קדמית');
label(92, 262, 'גומה אמצעית');
label(110, 440, 'גומה אחורית');
svg.append(s('text', { class: 'skb-dir', x: CX, y: 18, 'text-anchor': 'middle' }, document.createTextNode('↑ פנים')));

// פתחים
const holes = {};
for (const f of FORAMINA) {
  const g = s('g', { class: 'sk-hole', 'data-id': f.id });
  if (f.id === 'magnum') {
    g.append(s('ellipse', { cx: CX, cy: 408, rx: 29, ry: 37 }));
  } else {
    const { el, a } = SHAPES[f.id];
    const [hx, hy, hr] = HITS[f.id];
    g.append(s(el, a), s('circle', { class: 'skb-hit', cx: hx, cy: hy, r: hr }));
    g.append(s('g', { transform: MIRROR }, s(el, a), s('circle', { class: 'skb-hit', cx: hx, cy: hy, r: hr })));
  }
  svg.append(g);
  holes[f.id] = g;
}
// נקבוביות מעל הלוחית המנוקבת, בשני הצדדים
for (const [x, y] of [[215, 108], [218, 117], [215, 126], [219, 135], [216, 144], [218, 152], [214, 118], [217, 128], [215, 138]]) {
  pores.append(s('circle', { cx: x, cy: y, r: 1.1 }), s('circle', { cx: 2 * CX - x, cy: y, r: 1.1 }));
}
svg.append(pores);

// ---------- פאנל ופקדים ----------

const panel = document.createElement('div');
panel.className = 'lab-readout skull-panel';
panel.setAttribute('aria-live', 'polite');

const controls = document.createElement('div');
controls.className = 'lab-controls';
controls.innerHTML = `
  <fieldset class="chip-set"><legend>פתח</legend>
    ${FORAMINA.map((f) => `<button type="button" class="chip" data-foramen="${f.id}" aria-pressed="false">${f.name}</button>`).join('')}
  </fieldset>
  <fieldset class="chip-set chip-set-roman"><legend>או: איפה יוצא העצב…</legend>
    ${NERVES.map((n) => `<button type="button" class="chip t-${n.type}" data-nerve="${n.id}" aria-pressed="false" title="${n.name}" aria-label="עצב ${n.roman}: ${n.name}">${n.roman}</button>`).join('')}
  </fieldset>`;

const stageWrap = document.createElement('div');
stageWrap.className = 'lab-stage lab-stage-narrow';
stageWrap.append(svg);
const layout = document.createElement('div');
layout.className = 'lab-layout';
layout.append(stageWrap, controls, panel);
root.append(layout);

const nerveLink = (id) => { const n = byId[id]; return `<a class="nerve-pill t-${n.type}" href="${nerveUrl(id)}"><b>${n.roman}</b> ${n.name}</a>`; };

function showForamen(id) {
  const f = FORAMINA.find((x) => x.id === id);
  Object.entries(holes).forEach(([k, g]) => g.classList.toggle('is-active', k === id));
  controls.querySelectorAll('[data-foramen]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.foramen === id)));
  controls.querySelectorAll('[data-nerve]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
  panel.innerHTML = `<p class="panel-kicker">${f.bone}</p><h2 class="skull-title">${f.name} <span class="muted" lang="en" dir="ltr">${f.en}</span></h2>`
    + `<p>${f.text}</p>`
    + (f.nerves.length ? `<p class="muscle-h">עצבים</p><div class="pill-row">${f.nerves.map(nerveLink).join('')}</div>` : '')
    + (f.note ? `<p class="muted">${f.note}</p>` : '')
    + (f.other.length ? `<p class="muscle-h">עוד עובר כאן</p><ul class="plain-list">${f.other.map((o) => `<li>${o}</li>`).join('')}</ul>` : '');
  history.replaceState(null, '', `#${id}`);
}

function showNerve(id) {
  const n = byId[id];
  const list = FORAMINA.filter((f) => f.nerves.includes(id));
  Object.entries(holes).forEach(([k, g]) => g.classList.toggle('is-active', list.some((f) => f.id === k)));
  controls.querySelectorAll('[data-nerve]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.nerve === id)));
  controls.querySelectorAll('[data-foramen]').forEach((c) => c.setAttribute('aria-pressed', 'false'));
  panel.innerHTML = `<p class="panel-kicker">עצב ${n.roman}</p><h2 class="skull-title">${n.name}</h2>`
    + `<p>${n.exit}.</p>`
    + `<ul class="plain-list">${list.map((f) => `<li><button type="button" class="link-btn" data-goto="${f.id}">${f.name}</button>${f.note ? ` <span class="muted">(${f.note})</span>` : ''}</li>`).join('')}</ul>`
    + `<p><a href="${nerveUrl(id)}">לעמוד של ${n.name} ←</a></p>`;
}

function intro() {
  panel.innerHTML = '<p class="panel-kicker">בסיס הגולגולת</p><p>לחצו על פתח בתרשים או ברשימה. הפתחים מסומנים בשני הצדדים, כי כל עצב קיים בזוג.</p>'
    + '<p class="muted">בגומה הקדמית יושבות האונות המצחיות, באמצעית האונות הרקתיות, ובאחורית גזע המוח והמוחון.</p>';
}

svg.addEventListener('click', (e) => { const g = e.target.closest('.sk-hole'); if (g) showForamen(g.dataset.id); });
controls.addEventListener('click', (e) => {
  const f = e.target.closest('[data-foramen]');
  if (f) showForamen(f.dataset.foramen);
  const n = e.target.closest('[data-nerve]');
  if (n) showNerve(n.dataset.nerve);
});
panel.addEventListener('click', (e) => { const b = e.target.closest('[data-goto]'); if (b) showForamen(b.dataset.goto); });

const hash = location.hash.slice(1);
if (FORAMINA.some((f) => f.id === hash)) showForamen(hash); else intro();
