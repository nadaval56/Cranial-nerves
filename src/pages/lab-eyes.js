// תנועות העיניים: מטרה שגוררים, שתי עיניים שעוקבות אחריה, ואפשרות "להשבית" עצב III, IV או VI בצד אחד.
//
// קואורדינטות: gx, gy בין -1 ל-1 במסך (gx חיובי = ימין המסך, gy חיובי = למטה).
// הפנים מול הצופה, ולכן העין הימנית של האדם (R) מופיעה בצד שמאל של המסך.
// לכל עין מחשבים abd — כמה היא מורחקת מהאף (חיובי = החוצה, לכיוון הרקה) — ומפעילים עליו את מגבלות הפגיעה.
//
// הפישוט: כל שריר מוצג לפי הכיוון העיקרי שלו (מבחן ה-H). סיבוב העין סביב הציר שלה לא מוצג.

import { s } from '../lib/dom.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const LESIONS = [
  { id: 'none', label: 'בלי פגיעה' },
  { id: 'VI-R', label: 'VI ימין' }, { id: 'VI-L', label: 'VI שמאל' },
  { id: 'IV-R', label: 'IV ימין' }, { id: 'IV-L', label: 'IV שמאל' },
  { id: 'III-R', label: 'III ימין' }, { id: 'III-L', label: 'III שמאל' },
];

const MUSCLES = {
  LR: { name: 'הישר הצדדי', nerve: 'VI' },
  MR: { name: 'הישר הפנימי', nerve: 'III' },
  SR: { name: 'הישר העליון', nerve: 'III' },
  IR: { name: 'הישר התחתון', nerve: 'III' },
  IO: { name: 'האלכסוני התחתון', nerve: 'III' },
  SO: { name: 'האלכסוני העליון', nerve: 'IV' },
};

const EXPLAIN = {
  none: 'כל השרירים עובדים. שתי העיניים זזות יחד ומכוונות לאותה נקודה, ולכן המוח מקבל שתי תמונות שמתלכדות לאחת.',
  VI: 'השריר הישר הצדדי לא עובד, ולכן העין לא מצליחה לפנות לכיוון הרקה. גם במנוחה היא נמשכת מעט לכיוון האף, כי אין מי שיתנגד לשריר הישר הפנימי. הראייה הכפולה אופקית, והיא גדלה כשמסתכלים לצד הפגוע.',
  IV: 'השריר האלכסוני העליון לא עובד. העין הפגועה גבוהה מעט מהשנייה, והפער גדל כשהיא פונה לכיוון האף ומסתכלת למטה — שם האלכסוני העליון הוא השריר העיקרי שמוריד אותה. הראייה הכפולה אנכית.',
  III: 'ארבעה שרירים לא עובדים, וגם השריר שמרים את העפעף. נשארים רק הישר הצדדי (VI) והאלכסוני העליון (IV), ולכן העין "למטה ולחוץ". האישון רחב, כי גם הסיבים שמכווצים אותו עוברים בעצב השלישי.',
};

let lesion = 'none';
let lidLifted = false;
let gx = 0, gy = 0;
let anim = null;

// ---------- מודל ----------

function eyePose(side, gx, gy) {
  const lat = side === 'R' ? -1 : 1; // כיוון "החוצה" במסך
  let abd = gx * lat;
  let v = gy;
  const [nerve, lside] = lesion.split('-');
  if (lside === side) {
    if (nerve === 'VI') abd = Math.min(abd, -0.2);
    if (nerve === 'III') {
      abd = Math.max(abd, 0.6);
      v = Math.max(v * 0.35, 0.3);
    }
    if (nerve === 'IV') {
      const add = Math.max(0, -abd), down = Math.max(0, v);
      v = v - (0.08 + 0.42 * add * down + 0.08 * down);
    }
  }
  return { h: abd * lat, v: Math.max(-1.1, Math.min(1.1, v)), abd };
}

function activeMuscles(abd, v) {
  const out = [];
  if (abd > 0.18) out.push('LR'); else if (abd < -0.18) out.push('MR');
  if (v < -0.18) out.push(abd >= -0.05 ? 'SR' : 'IO');
  else if (v > 0.18) out.push(abd >= -0.05 ? 'IR' : 'SO');
  return out;
}

// ---------- ציור ----------

const W = 640, H = 360;
const EYES = { R: { cx: 228, cy: 176 }, L: { cx: 412, cy: 176 } };
const RX = 30, RY = 17; // טווח תנועה של הקשתית

const svg = s('svg', { class: 'eyes-stage', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'שתי עיניים שעוקבות אחרי מטרה', direction: 'ltr', tabindex: '0' });
const defs = s('defs');
svg.append(defs);

// רקע ופנים
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));
svg.append(s('path', { class: 'face-skin', d: 'M140 70 C200 30 440 30 500 70 C540 110 540 250 500 300 C440 350 200 350 140 300 C100 250 100 110 140 70 Z' }));
svg.append(s('path', { class: 'face-nose', d: 'M320 168 C316 210 306 240 300 262 C312 272 328 272 340 262 C334 240 324 210 320 168' }));

const parts = {};
for (const side of ['R', 'L']) {
  const { cx, cy } = EYES[side];
  const almond = `M${cx - 62} ${cy} C${cx - 36} ${cy - 40} ${cx + 36} ${cy - 40} ${cx + 62} ${cy} C${cx + 36} ${cy + 38} ${cx - 36} ${cy + 38} ${cx - 62} ${cy} Z`;
  const clip = s('clipPath', { id: `clip-${side}` }, s('path', { d: almond }));
  defs.append(clip);
  const g = s('g', { class: 'eye' });
  g.append(s('path', { class: 'eye-white', d: almond }));
  const ball = s('g', { 'clip-path': `url(#clip-${side})` });
  const iris = s('g', { class: 'iris-g' });
  iris.append(s('circle', { class: 'iris', cx, cy, r: 21 }));
  const pupil = s('circle', { class: 'pupil', cx, cy, r: 8.5 });
  iris.append(pupil);
  iris.append(s('circle', { class: 'glint', cx: cx + 6, cy: cy - 7, r: 3 }));
  ball.append(iris);
  // עפעף עליון: מלבן בצבע העור שיורד מלמעלה, חתוך לצורת העין
  const lid = s('rect', { class: 'lid', x: cx - 70, y: cy - 60, width: 140, height: 0 });
  ball.append(lid);
  g.append(ball);
  g.append(s('path', { class: 'eye-line', d: almond }));
  const brow = s('path', { class: 'brow', d: `M${cx - 60} ${cy - 48} C${cx - 20} ${cy - 68} ${cx + 20} ${cy - 68} ${cx + 60} ${cy - 50}` });
  if (side === 'L') brow.setAttribute('d', `M${cx - 60} ${cy - 50} C${cx - 20} ${cy - 68} ${cx + 20} ${cy - 68} ${cx + 60} ${cy - 48}`);
  g.append(brow);
  svg.append(g);
  svg.append(s('text', { class: 'stage-label', x: cx, y: cy + 70, 'text-anchor': 'middle' }, document.createTextNode(side === 'R' ? 'העין הימנית' : 'העין השמאלית')));
  parts[side] = { iris, pupil, lid, cx, cy };
}

// המטרה
const target = s('g', { class: 'target' });
target.append(s('circle', { r: 16, class: 'target-ring' }));
target.append(s('circle', { r: 5, class: 'target-dot' }));
svg.append(target);

// ---------- פקדים ----------

const controls = document.createElement('div');
controls.className = 'lab-controls';
controls.innerHTML = `
  <fieldset class="chip-set"><legend>פגיעה בעצב <span class="muted">(ימין ושמאל של האדם)</span></legend>
    ${LESIONS.map((l) => `<button type="button" class="chip" data-lesion="${l.id}" aria-pressed="${l.id === lesion}">${l.label}</button>`).join('')}
  </fieldset>
  <div class="btn-row">
    <button type="button" class="btn" id="h-test">מבחן ה-H אוטומטי</button>
    <button type="button" class="btn" id="center">למרכז</button>
    <button type="button" class="btn" id="lift" hidden aria-pressed="false">להרים את העפעף</button>
  </div>`;

const readout = document.createElement('div');
readout.className = 'lab-readout';
readout.innerHTML = `
  <div class="muscles">
    <div class="muscle-col"><p class="muscle-h">העין הימנית</p><ul id="mus-R"></ul></div>
    <div class="muscle-col"><p class="muscle-h">העין השמאלית</p><ul id="mus-L"></ul></div>
  </div>
  <div class="diplo">
    <p class="muscle-h">מה האדם רואה</p>
    <svg class="diplo-view" viewBox="-60 -40 120 80" aria-hidden="true" direction="ltr">
      <rect x="-60" y="-40" width="120" height="80" rx="8" class="diplo-bg"/>
      <g id="img-L"><circle r="9" class="diplo-img-l"/></g>
      <g id="img-R"><circle r="9" class="diplo-img-r"/></g>
    </svg>
    <p class="diplo-text" id="diplo-text" role="status" aria-live="polite"></p>
  </div>
  <p class="lab-explain" id="explain"></p>`;

const stageWrap = document.createElement('div');
stageWrap.className = 'lab-stage';
stageWrap.append(svg);
const hint = document.createElement('p');
hint.className = 'muted stage-hint';
hint.textContent = 'גררו את המטרה (או לחצו על המסך). במקלדת: חיצים.';
stageWrap.append(hint);

const layout = document.createElement('div');
layout.className = 'lab-layout';
layout.append(stageWrap, controls, readout);
root.append(layout);

// ---------- עדכון ----------

function update() {
  const tx = W / 2 + gx * 290, ty = H / 2 + gy * 150;
  target.setAttribute('transform', `translate(${tx} ${ty})`);

  const [nerve, lside] = lesion.split('-');
  const poses = {};
  for (const side of ['R', 'L']) {
    const p = eyePose(side, gx, gy);
    poses[side] = p;
    const { iris, pupil, lid, cy } = parts[side];
    iris.setAttribute('transform', `translate(${p.h * RX} ${p.v * RY})`);
    const hit = lside === side && nerve === 'III';
    pupil.setAttribute('r', hit ? 14 : 8.5);
    // העפעף עוקב מעט אחרי מבט למטה; בפגיעה ב-III הוא צנוח כמעט עד הסוף
    const base = 16 + Math.max(0, p.v) * 10;
    const droop = hit && !lidLifted ? 56 : base;
    lid.setAttribute('height', droop);
    lid.setAttribute('y', cy - 60);

    const list = document.getElementById(`mus-${side}`);
    // השרירים שהמבט הזה *דורש* — לפי הכיוון המבוקש, לא לפי מה שהעין הצליחה לעשות
    const mus = activeMuscles(gx * (side === 'R' ? -1 : 1), gy);
    list.innerHTML = mus.length
      ? mus.map((m) => {
        const bad = lside === side && MUSCLES[m].nerve === nerve;
        return `<li class="${bad ? 'is-bad' : ''}">${MUSCLES[m].name} <span class="nerve-num">(${MUSCLES[m].nerve})</span>${bad ? ' — לא עובד' : ''}</li>`;
      }).join('')
      : '<li class="muted">מבט ישר — כל השרירים במתח מאוזן</li>';
  }

  // ראייה כפולה: כמה כל עין סוטה מהמקום שהייתה אמורה להיות בו
  const off = {};
  for (const side of ['R', 'L']) {
    const want = { h: gx, v: gy };
    off[side] = { x: (poses[side].h - want.h), y: -(poses[side].v - want.v) };
  }
  const dx = off.R.x - off.L.x, dy = off.R.y - off.L.y;
  const sep = Math.hypot(dx, dy);
  const ptoClosed = nerve === 'III' && !lidLifted;
  const scale = 40;
  const c = (v, m) => Math.max(-m, Math.min(m, v * scale));
  document.getElementById('img-L').setAttribute('transform', `translate(${c(off.L.x, 46)} ${c(off.L.y, 26)})`);
  document.getElementById('img-R').setAttribute('transform', `translate(${c(off.R.x, 46)} ${c(off.R.y, 26)})`);
  document.getElementById('img-R').style.opacity = ptoClosed && lside === 'R' ? 0 : 1;
  document.getElementById('img-L').style.opacity = ptoClosed && lside === 'L' ? 0 : 1;
  const text = document.getElementById('diplo-text');
  if (ptoClosed) text.textContent = 'העפעף הצנוח מכסה את העין — ולכן אין ראייה כפולה. הרימו אותו כדי לראות.';
  else if (sep < 0.05) text.textContent = 'תמונה אחת: העיניים מכוונות יחד.';
  else {
    const dir = Math.abs(dx) > Math.abs(dy) * 1.6 ? 'זו ליד זו (אופקית)' : Math.abs(dy) > Math.abs(dx) * 1.6 ? 'זו מעל זו (אנכית)' : 'באלכסון';
    text.textContent = `ראייה כפולה: שתי תמונות ${dir}. ${sep > 0.35 ? 'הפער גדול.' : 'הפער קטן.'}`;
  }

  document.getElementById('explain').textContent = EXPLAIN[nerve === 'none' ? 'none' : nerve];
  document.getElementById('lift').hidden = nerve !== 'III';
}

// ---------- אינטראקציה ----------

function setFromPointer(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  gx = Math.max(-1, Math.min(1, (p.x - W / 2) / 290));
  gy = Math.max(-1, Math.min(1, (p.y - H / 2) / 150));
  update();
}
let dragging = false;
svg.addEventListener('pointerdown', (e) => { stopAnim(); dragging = true; svg.setPointerCapture(e.pointerId); setFromPointer(e); });
svg.addEventListener('pointermove', (e) => { if (dragging) setFromPointer(e); });
svg.addEventListener('pointerup', () => { dragging = false; });
svg.addEventListener('pointercancel', () => { dragging = false; });
svg.addEventListener('keydown', (e) => {
  const step = 0.1;
  const k = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (!k) return;
  e.preventDefault(); stopAnim();
  gx = Math.max(-1, Math.min(1, gx + k[0]));
  gy = Math.max(-1, Math.min(1, gy + k[1]));
  update();
});

controls.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-lesion]');
  if (chip) {
    lesion = chip.dataset.lesion;
    lidLifted = false;
    controls.querySelectorAll('[data-lesion]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    document.getElementById('lift').setAttribute('aria-pressed', 'false');
    document.getElementById('lift').textContent = 'להרים את העפעף';
    update();
  }
});
document.getElementById('center').addEventListener('click', () => { stopAnim(); gx = 0; gy = 0; update(); });
document.getElementById('lift').addEventListener('click', (e) => {
  lidLifted = !lidLifted;
  e.currentTarget.setAttribute('aria-pressed', String(lidLifted));
  e.currentTarget.textContent = lidLifted ? 'לשחרר את העפעף' : 'להרים את העפעף';
  update();
});

// מבחן ה-H: מסלול של נקודות, עם עצירה קצרה בכל אחת מ-6 העמדות
const H_PATH = [[0, 0], [0.85, 0], [0.85, -0.8], [0.85, 0.8], [0.85, 0], [-0.85, 0], [-0.85, -0.8], [-0.85, 0.8], [-0.85, 0], [0, 0]];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
function stopAnim() { if (anim) { cancelAnimationFrame(anim.raf); clearTimeout(anim.t); anim = null; } }
document.getElementById('h-test').addEventListener('click', () => {
  stopAnim();
  let i = 0;
  anim = {};
  const next = () => {
    if (!anim) return;
    if (++i >= H_PATH.length) { anim = null; return; }
    const [fx, fy] = [gx, gy], [tx, ty] = H_PATH[i];
    if (reduced) { gx = tx; gy = ty; update(); anim.t = setTimeout(next, 1100); return; }
    const t0 = performance.now(), dur = 650;
    const step = (now) => {
      if (!anim) return;
      const k = Math.min(1, (now - t0) / dur), ease = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      gx = fx + (tx - fx) * ease; gy = fy + (ty - fy) * ease; update();
      if (k < 1) anim.raf = requestAnimationFrame(step); else anim.t = setTimeout(next, 650);
    };
    anim.raf = requestAnimationFrame(step);
  };
  gx = 0; gy = 0; update();
  anim.t = setTimeout(next, 300);
});

update();
