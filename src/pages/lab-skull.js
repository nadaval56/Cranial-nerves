// בסיס הגולגולת: מבט מלמעלה על רצפת הגולגולת (החלק הקדמי למעלה). תרשים סכמטי, לא בקנה מידה.
// לחיצה על פתח — מה עובר בו. בחירת עצב — איפה הפתח שלו. כתובת עם #<id של פתח> בוחרת אותו מראש.

import { s } from '../lib/dom.js';
import { FORAMINA } from '../../content/foramina.js';
import { NERVES, byId, nerveUrl } from '../../content/nerves.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const W = 420, H = 540, CX = 210;
const MIRROR = `matrix(-1 0 0 1 ${W} 0)`;

// צורות הפתחים — לצד הימני של התרשים; הצד השני הוא שיקוף
const SHAPES = {
  cribriform: { el: 'ellipse', a: { cx: 222, cy: 118, rx: 7, ry: 24 } },
  optic: { el: 'circle', a: { cx: 238, cy: 190, r: 6.5 } },
  sof: { el: 'path', a: { d: 'M246 202 C258 198 280 188 300 178 C302 182 302 186 298 188 C282 198 262 208 250 210 Z' } },
  rotundum: { el: 'circle', a: { cx: 258, cy: 226, r: 5.5 } },
  ovale: { el: 'ellipse', a: { cx: 270, cy: 252, rx: 9, ry: 6, transform: 'rotate(-25 270 252)' } },
  spinosum: { el: 'circle', a: { cx: 288, cy: 266, r: 3.6 } },
  iam: { el: 'ellipse', a: { cx: 282, cy: 330, rx: 8, ry: 5.5, transform: 'rotate(-30 282 330)' } },
  jugular: { el: 'path', a: { d: 'M256 366 C264 356 284 356 292 364 C296 372 288 380 276 380 C266 380 254 376 256 366 Z' } },
  hypoglossal: { el: 'circle', a: { cx: 246, cy: 400, r: 5 } },
};

const svg = s('svg', { class: 'skull-stage', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'תרשים של בסיס הגולגולת מלמעלה, עם הפתחים שדרכם יוצאים העצבים', direction: 'ltr' });
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));

function half() {
  const g = s('g');
  // גבולות הגומות: הכנף הקטנה של עצם הטריז, והרכס של העצם הסלעית
  g.append(s('path', { class: 'sk-ridge', d: 'M226 174 C262 160 320 150 372 160' }));
  g.append(s('path', { class: 'sk-ridge', d: 'M232 300 C270 290 330 270 378 248' }));
  // האוכף הטורקי וגב האוכף
  g.append(s('path', { class: 'sk-line', d: 'M210 206 C220 206 228 214 228 226 C228 238 220 244 210 244' }));
  return g;
}

svg.append(s('path', { class: 'sk-outline', d: 'M210 30 C320 30 392 110 398 250 C404 390 330 516 210 516 C90 516 16 390 22 250 C28 110 100 30 210 30 Z' }));
// רצפה בגווני עומק: הגומה האמצעית והאחורית נמוכות יותר
svg.append(s('path', { class: 'sk-fossa sk-mid', d: 'M210 196 C250 186 300 160 372 160 C392 200 396 230 378 248 C330 270 270 290 232 300 C220 280 216 250 210 246 C204 250 200 280 188 300 C150 290 90 270 42 248 C24 230 28 200 48 160 C120 160 170 186 210 196 Z' }));
svg.append(s('path', { class: 'sk-fossa sk-post', d: 'M232 300 C270 290 330 270 378 248 C398 330 360 470 210 506 C60 470 22 330 42 248 C90 270 150 290 188 300 C196 318 204 330 210 336 C216 330 224 318 232 300 Z' }));
svg.append(half());
svg.append(s('g', { transform: MIRROR }, half()));
// רכס התרנגול (crista galli) והמדרון (clivus)
svg.append(s('path', { class: 'sk-line', d: 'M210 86 L210 152' }));
svg.append(s('path', { class: 'sk-clivus', d: 'M196 248 C196 300 198 336 200 360 L220 360 C222 336 224 300 224 248 Z' }));

const fossaLabel = (y, t) => svg.append(s('text', { class: 'sk-fossa-label', x: 60, y }, document.createTextNode(t)));
fossaLabel(120, 'גומה קדמית');
fossaLabel(222, 'גומה אמצעית');
fossaLabel(400, 'גומה אחורית');
svg.append(s('text', { class: 'sk-dir', x: CX, y: 22, 'text-anchor': 'middle' }, document.createTextNode('↑ פנים')));

// פתחים
const holes = {};
for (const f of FORAMINA) {
  const g = s('g', { class: 'sk-hole', 'data-id': f.id });
  if (f.id === 'magnum') {
    g.append(s('ellipse', { cx: CX, cy: 420, rx: 34, ry: 40 }));
  } else {
    const { el, a } = SHAPES[f.id];
    g.append(s(el, a));
    g.append(s('g', { transform: MIRROR }, s(el, a)));
  }
  svg.append(g);
  holes[f.id] = g;
}

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
    ${NERVES.map((n) => `<button type="button" class="chip t-${n.type}" data-nerve="${n.id}" aria-pressed="false" title="${n.name}">${n.roman}</button>`).join('')}
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
