// עמוד הבית: מפת גזע המוח האינטראקטיבית, וקוביות "מה יש באתר".
import { NERVES, TYPES, COMPONENTS, byId, nerveUrl } from '../../content/nerves.js';
import { FORAMINA } from '../../content/foramina.js';
import { brainstemSvg } from '../lib/brainstem.js';
import { esc, romanBadge, typeTag } from '../lib/render.js';
import { ICONS } from '../config.js';

const fig = document.getElementById('explorer-figure');
const panel = document.getElementById('explorer-panel');
const picker = document.getElementById('explorer-picker');
const foramen = Object.fromEntries(FORAMINA.map((f) => [f.id, f]));

fig.innerHTML = brainstemSvg({ interactive: true });
const svg = fig.querySelector('svg');

picker.innerHTML = NERVES.map((n) => `<button type="button" class="pick t-${n.type}" data-id="${n.id}" aria-pressed="false">`
  + `<span class="pick-roman">${n.roman}</span><span class="pick-name">${esc(n.name)}</span></button>`).join('')
  // עצב 0 — לא חלק מ-12 הזוגות, אבל מקבל כפתור משלו בסוף
  + `<button type="button" class="pick pick-zero" data-id="terminal" aria-pressed="false"><span class="pick-roman">0</span><span class="pick-name">העצב הטרמינלי</span></button>`;

const intro = `<div class="panel-intro"><p class="panel-kicker">בחרו עצב</p>`
  + `<p>לחצו על עצב במפה או על אחד הכפתורים. הצבעים: <span class="type-tag type-sensory">תחושתי</span> <span class="type-tag type-motor">תנועתי</span> <span class="type-tag type-mixed">מעורב</span></p>`
  + `<p class="muted">המספרים מופיעים רק בצד אחד של האיור, אבל כל עצב קיים בזוג, אחד בכל צד.</p></div>`;

let selected = null;

function render(id) {
  if (!id) { panel.innerHTML = intro; return; }
  if (id === 'terminal') {
    panel.innerHTML = `<article class="panel-card panel-zero"><div class="panel-head"><span class="roman roman-lg roman-zero" aria-hidden="true">0</span><div>`
      + `<p class="panel-kicker">לא נכלל ב-12 הזוגות · <span class="type-tag type-zero">תפקיד לא ידוע</span></p>`
      + `<h3>העצב הטרמינלי</h3><p class="nerve-latin" dir="ltr" lang="en">Terminal nerve · CN 0</p></div></div>`
      + `<p>רשת דקיקה של סיבים מתחת לאונה המצחית, ליד עצב הריח. התגלה ב-1878, ועד היום לא ברור מה הוא עושה.</p>`
      + `<a class="btn btn-primary" href="./nerve-zero.html">לעמוד של עצב 0</a></article>`;
    return;
  }
  const n = byId[id];
  panel.innerHTML = `<article class="panel-card t-${n.type}">`
    + `<div class="panel-head">${romanBadge(n, 'roman-lg')}<div><p class="panel-kicker">עצב ${n.num} · ${typeTag(n.type)}</p>`
    + `<h3>${esc(n.name)}</h3><p class="nerve-latin" dir="ltr" lang="en">${esc(n.en)}</p></div></div>`
    + `<p>${esc(n.tagline)}</p>`
    + `<ul class="comp-list comp-list-sm">${n.components.map((c) => `<li><span class="comp comp-${c.kind}">${COMPONENTS[c.kind]}</span><span>${esc(c.text)}</span></li>`).join('')}</ul>`
    + `<p class="panel-exit"><strong>יוצא דרך:</strong> ${(n.foramina ?? [n.foramen]).map((id) => esc(foramen[id].name)).join(", ")}</p>`
    + `<a class="btn btn-primary" href="${nerveUrl(n.id)}">לעמוד של ${esc(n.name)}</a></article>`;
}

// המפה מוצגת קודם כאיור דו-ממדי, ומוחלפת במודל התלת-ממדי כשהוא נטען (אם הדפדפן תומך ב-WebGL)
let view3d = null;
let mode = '2d';

function highlight(id) {
  svg.classList.toggle('has-active', !!id);
  svg.querySelectorAll('.bs-nerve').forEach((g) => g.classList.toggle('is-active', g.dataset.id === id));
  view3d?.highlight(id);
}

function select(id) {
  selected = selected === id ? null : id;
  highlight(selected);
  picker.querySelectorAll('.pick').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === selected)));
  render(selected);
}

svg.addEventListener('click', (e) => {
  const g = e.target.closest('.bs-nerve');
  if (g) select(g.dataset.id);
});
// ריחוף בעכבר: תצוגה מקדימה בלבד, בלי לשנות את הבחירה
svg.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse') return;
  const g = e.target.closest('.bs-nerve');
  highlight(g ? g.dataset.id : selected);
});
svg.addEventListener('pointerleave', () => highlight(selected));
picker.addEventListener('click', (e) => {
  const b = e.target.closest('.pick');
  if (b) select(b.dataset.id);
});

render(null);

// ---------- תלת-ממד ----------
const svgWrap = document.createElement('div');
svgWrap.className = 'explorer-2d';
svgWrap.append(svg);
fig.append(svgWrap);

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
}

async function start3d() {
  const box = document.createElement('div');
  box.className = 'b3d';
  box.hidden = true;
  const bar = document.createElement('div');
  bar.className = 'b3d-bar';
  bar.innerHTML = `<div class="b3d-group" role="group" aria-label="זווית מבט">
      <button type="button" class="chip" data-view="ventral" aria-pressed="true">מלמטה</button>
      <button type="button" class="chip" data-view="oblique" aria-pressed="false">באלכסון</button>
      <button type="button" class="chip" data-view="lateral" aria-pressed="false">מהצד</button>
      <button type="button" class="chip" data-view="front" aria-pressed="false">מלפנים</button>
    </div>
    <div class="b3d-group" role="group" aria-label="המוח הגדול">
      <button type="button" class="chip" data-shell="ghost" aria-pressed="true">מוח שקוף</button>
      <button type="button" class="chip" data-shell="hidden" aria-pressed="false">בלי מוח</button>
      <button type="button" class="chip" data-shell="solid" aria-pressed="false">מוח מלא</button>
    </div>`;
  const stage = document.createElement('div');
  stage.className = 'b3d-stage';
  const status = document.createElement('p');
  status.className = 'b3d-status';
  status.textContent = 'טוען מודל תלת-ממדי…';
  stage.append(status);
  box.append(stage, bar);
  fig.append(box);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn btn-ghost b3d-toggle';
  toggle.hidden = true;
  fig.append(toggle);
  const hint = document.createElement('p');
  hint.className = 'b3d-hint muted';
  hint.textContent = 'גררו כדי לסובב, צבטו או גללו כדי להתקרב. לחיצה על עצב בוחרת אותו.';
  hint.hidden = true;
  fig.append(hint);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
  try {
    const { createBrain3D } = await import('../lib/brain3d.js');
    box.hidden = false; // צריך מידות לפני היצירה
    svgWrap.hidden = true;
    view3d = await createBrain3D(stage, {
      glbUrl: `${import.meta.env.BASE_URL}models/brain-cn.glb`,
      reducedMotion,
      extra: true,
      onSelect: (id) => { if (id) { if (id !== selected) select(id); } else if (selected) select(selected); },
    });
    status.remove();
    view3d.highlight(selected);
    mode = '3d';
  } catch (err) {
    console.warn('3D map unavailable, keeping the 2D illustration', err);
    box.remove(); svgWrap.hidden = false;
    return;
  }

  const setMode = (m) => {
    mode = m;
    box.hidden = m !== '3d';
    svgWrap.hidden = m !== '2d';
    hint.hidden = m !== '3d';
    toggle.textContent = m === '3d' ? 'לאיור הדו-ממדי' : 'למודל התלת-ממדי';
  };
  setMode('3d');
  toggle.hidden = false;
  toggle.addEventListener('click', () => setMode(mode === '3d' ? '2d' : '3d'));
  bar.addEventListener('click', (e) => {
    const v = e.target.closest('[data-view]');
    if (v) { view3d.setView(v.dataset.view); bar.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b === v))); }
    const sh = e.target.closest('[data-shell]');
    if (sh) { view3d.setShell(sh.dataset.shell); bar.querySelectorAll('[data-shell]').forEach((b) => b.setAttribute('aria-pressed', String(b === sh))); }
  });
}

if (webglOk()) start3d();

// קוביות "מה יש באתר"
const CARDS = [
  ['nerves', './nerves.html', 'העצבים', 'עמוד לכל אחד מ-12 העצבים: תפקיד, מסלול, בדיקה ומה קורה כשהוא נפגע.'],
  ['basics', './basics.html', 'היסודות', 'גזע המוח, סוגי העצבים, ולמה מיקום הפגיעה משנה את מה שרואים.'],
  ['exam', './exam.html', 'הבדיקה', 'איך בודקים את כל העצבים בעשר דקות, ואילו רפלקסים מחברים ביניהם.'],
  ['lab', './lab.html', 'המעבדה', 'סימולטורים: עיניים, אישונים, מסלול הראייה, הפנים ובסיס הגולגולת.'],
  ['press', './press.html', 'בתקשורת', 'סיפורים מהחדשות בישראל: מה קרה, ומה המחקר יודע על זה.'],
  ['history', './history.html', 'היסטוריה', 'משבעה זוגות אצל גלנוס ועד שנים-עשר, ומה עוד גילו בדרך.'],
];
document.getElementById('home-cards').innerHTML = CARDS.map(([ico, href, title, text]) => `<article class="card"><div class="card-body">`
  + `<svg class="card-icon" viewBox="0 0 36 36" aria-hidden="true">${ICONS[ico]}</svg>`
  + `<h3><a class="card-link" href="${href}">${title}</a></h3><p>${text}</p></div></article>`).join('');
