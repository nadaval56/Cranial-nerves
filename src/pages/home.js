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
  + `<span class="pick-roman">${n.roman}</span><span class="pick-name">${esc(n.name)}</span></button>`).join('');

const intro = `<div class="panel-intro"><p class="panel-kicker">בחרו עצב</p>`
  + `<p>לחצו על עצב במפה או על אחד הכפתורים. הצבעים: <span class="type-tag type-sensory">תחושתי</span> <span class="type-tag type-motor">תנועתי</span> <span class="type-tag type-mixed">מעורב</span></p>`
  + `<p class="muted">המספרים מופיעים רק בצד אחד של האיור, אבל כל עצב קיים בזוג — אחד לכל צד.</p></div>`;

let selected = null;

function render(id) {
  if (!id) { panel.innerHTML = intro; return; }
  const n = byId[id];
  panel.innerHTML = `<article class="panel-card t-${n.type}">`
    + `<div class="panel-head">${romanBadge(n, 'roman-lg')}<div><p class="panel-kicker">עצב ${n.num} · ${typeTag(n.type)}</p>`
    + `<h3>${esc(n.name)}</h3><p class="nerve-latin" dir="ltr" lang="en">${esc(n.en)}</p></div></div>`
    + `<p>${esc(n.tagline)}</p>`
    + `<ul class="comp-list comp-list-sm">${n.components.map((c) => `<li><span class="comp comp-${c.kind}">${COMPONENTS[c.kind]}</span><span>${esc(c.text)}</span></li>`).join('')}</ul>`
    + `<p class="panel-exit"><strong>יוצא דרך:</strong> ${esc(foramen[n.foramen].name)}</p>`
    + `<a class="btn btn-primary" href="${nerveUrl(n.id)}">לעמוד של ${esc(n.name)}</a></article>`;
}

function highlight(id) {
  svg.classList.toggle('has-active', !!id);
  svg.querySelectorAll('.bs-nerve').forEach((g) => g.classList.toggle('is-active', g.dataset.id === id));
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

// קוביות "מה יש באתר"
const CARDS = [
  ['nerves', './nerves.html', 'העצבים', 'עמוד לכל אחד מ-12 העצבים: תפקיד, מסלול, בדיקה ומה קורה כשהוא נפגע.'],
  ['basics', './basics.html', 'היסודות', 'גזע המוח, סוגי העצבים, ולמה מיקום הפגיעה משנה את מה שרואים.'],
  ['exam', './exam.html', 'הבדיקה', 'איך בודקים את כל העצבים בעשר דקות, ואילו רפלקסים מחברים ביניהם.'],
  ['lab', './lab.html', 'המעבדה', 'סימולטורים: עיניים, אישונים, מסלול הראייה, הפנים ובסיס הגולגולת.'],
  ['history', './history.html', 'היסטוריה', 'משבעה זוגות אצל גלנוס ועד שנים-עשר — ומה עוד גילו בדרך.'],
];
document.getElementById('home-cards').innerHTML = CARDS.map(([ico, href, title, text]) => `<article class="card"><div class="card-body">`
  + `<svg class="card-icon" viewBox="0 0 36 36" aria-hidden="true">${ICONS[ico]}</svg>`
  + `<h3><a class="card-link" href="${href}">${title}</a></h3><p>${text}</p></div></article>`).join('');
