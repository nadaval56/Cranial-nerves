// עצב הפנים: פנים מצוירות שמבצעות הבעות, ופגיעה היקפית (בעצב) או מרכזית (במוח).
// הפנים מול הצופה: הצד הימני של האדם (R) מופיע משמאל במסך.
// לכל צד שני "כוחות" בין 0 ל-1: upper (מצח ועין) ו-lower (לחי ופה).
//   פגיעה בעצב בצד X: upper=0, lower=0 בצד X.
//   פגיעה במוח בצד X: lower חלש בצד הנגדי; upper נשמר בשני הצדדים (המצח מקבל פקודות משני צדי המוח).

import { s } from '../lib/dom.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const ACTIONS = [
  { id: 'rest', label: 'מנוחה', brow: 0, close: 0, smile: 0, puff: 0 },
  { id: 'brow', label: 'להרים גבות', brow: 1, close: 0, smile: 0, puff: 0 },
  { id: 'close', label: 'לעצום עיניים חזק', brow: 0, close: 1, smile: 0, puff: 0 },
  { id: 'smile', label: 'לחייך חזק', brow: 0, close: 0.25, smile: 1, puff: 0 },
  { id: 'puff', label: 'לנפח לחיים', brow: 0, close: 0, smile: 0, puff: 1 },
];
const LESIONS = [
  { id: 'none', label: 'בלי פגיעה' },
  { id: 'nerve-R', label: 'עצב הפנים הימני' },
  { id: 'nerve-L', label: 'עצב הפנים השמאלי' },
  { id: 'brain-L', label: 'במוח, בצד שמאל' },
  { id: 'brain-R', label: 'במוח, בצד ימין' },
];

let action = ACTIONS[0];
let lesion = 'none';

function strengths() {
  const st = { R: { upper: 1, lower: 1 }, L: { upper: 1, lower: 1 } };
  const [kind, side] = lesion.split('-');
  if (kind === 'nerve') st[side] = { upper: 0, lower: 0 };
  if (kind === 'brain') st[side === 'L' ? 'R' : 'L'].lower = 0.12;
  return st;
}

// ---------- ציור ----------

const W = 420, H = 480, CX = 210;
const svg = s('svg', { class: 'face-stage', viewBox: `0 0 ${W} ${H}`, role: 'img', direction: 'ltr' });
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));
svg.append(s('path', { class: 'face-ear', d: 'M78 220 C56 214 52 262 70 282 C80 292 90 286 92 276 Z' }));
svg.append(s('path', { class: 'face-ear', d: 'M342 220 C364 214 368 262 350 282 C340 292 330 286 328 276 Z' }));
const head = s('path', { class: 'face-skin', d: 'M210 52 C300 52 344 118 344 214 C344 330 290 430 210 432 C130 430 76 330 76 214 C76 118 120 52 210 52 Z' });
svg.append(head);
svg.append(s('path', { class: 'face-hair', d: 'M84 176 C84 96 136 46 210 46 C284 46 336 96 336 176 C318 128 280 104 210 104 C140 104 102 128 84 176 Z' }));
svg.append(s('path', { class: 'face-nose', d: 'M210 200 C206 244 198 270 192 290 C200 300 220 300 228 290 C222 270 214 244 210 200' }));

// חלקים לכל צד: dir = -1 לצד שמשמאל במסך (הצד הימני של האדם), +1 לצד שמימין
const P = {};
for (const side of ['R', 'L']) {
  const dir = side === 'R' ? -1 : 1;
  const ex = CX + dir * 62, ey = 214;
  const g = s('g');
  const wr = s('g', { class: 'wrinkles' });
  for (let i = 0; i < 3; i++) wr.append(s('path', { d: `M${CX + dir * 12} ${128 + i * 13} Q${CX + dir * 50} ${122 + i * 13} ${CX + dir * 92} ${130 + i * 13}` }));
  g.append(wr);
  const brow = s('path', { class: 'f-brow' });
  g.append(brow);
  const clipId = `fclip-${side}`;
  const eyeShape = s('path', { class: 'eye-white' });
  const clip = s('clipPath', { id: clipId });
  const clipPath = s('path');
  clip.append(clipPath);
  svg.append(s('defs', {}, clip));
  g.append(eyeShape);
  const iris = s('circle', { class: 'iris', cx: ex, cy: ey, r: 13, 'clip-path': `url(#${clipId})` });
  const pupil = s('circle', { class: 'pupil', cx: ex, cy: ey, r: 5, 'clip-path': `url(#${clipId})` });
  g.append(iris, pupil);
  const lidLine = s('path', { class: 'f-lid' });
  g.append(lidLine);
  const fold = s('path', { class: 'f-fold' });
  g.append(fold);
  const cheek = s('ellipse', { class: 'f-cheek', cx: CX + dir * 84, cy: 312, rx: 0, ry: 0 });
  g.append(cheek);
  svg.append(g);
  P[side] = { dir, ex, ey, wr, brow, eyeShape, clipPath, iris, pupil, lidLine, fold, cheek };
}
const mouth = s('path', { class: 'f-mouth' });
const lips = s('path', { class: 'f-lips' });
svg.append(lips, mouth);
svg.append(s('text', { class: 'stage-label', x: CX - 110, y: 466, 'text-anchor': 'middle' }, document.createTextNode('הצד הימני שלו')));
svg.append(s('text', { class: 'stage-label', x: CX + 110, y: 466, 'text-anchor': 'middle' }, document.createTextNode('הצד השמאלי שלו')));

function draw() {
  const st = strengths();
  const corner = {};
  for (const side of ['R', 'L']) {
    const p = P[side], d = p.dir, { upper, lower } = st[side];
    // גבה: עולה כשמרימים, יורדת מעט בעצימה חזקה
    const raise = action.brow * upper * 16 - action.close * upper * 5;
    const sag = upper < 0.5 ? 4 : 0; // גבה צנוחה מעט בצד המשותק
    const by = 172 - raise + sag;
    p.brow.setAttribute('d', `M${CX + d * 26} ${by + 6} Q${CX + d * 60} ${by - 12} ${CX + d * 96} ${by + 4}`);
    p.wr.style.opacity = String(action.brow * upper);

    // עין: פתיחה בין 0 (סגורה) ל-1; בצד המשותק היא פתוחה מעט יותר, ולא נסגרת
    const open = Math.max(0.04, (upper < 0.5 ? 1.12 : 1) - action.close * upper * 0.98 - action.smile * lower * 0.12);
    const top = 15 * open, bot = 9 * Math.max(0.15, open);
    const { ex, ey } = p;
    const shape = `M${ex - 30} ${ey} Q${ex} ${ey - top * 2} ${ex + 30} ${ey} Q${ex} ${ey + bot * 2} ${ex - 30} ${ey} Z`;
    p.eyeShape.setAttribute('d', shape);
    p.clipPath.setAttribute('d', shape);
    p.lidLine.setAttribute('d', `M${ex - 32} ${ey} Q${ex} ${ey - top * 2 - 3} ${ex + 32} ${ey}`);
    // תופעת בל: כשמנסים לעצום והעפעף לא נסגר, העין מתגלגלת למעלה
    const bell = action.close > 0.5 && upper < 0.5 ? -10 : 0;
    p.iris.setAttribute('cy', ey + bell);
    p.pupil.setAttribute('cy', ey + bell);

    // קפל האף-שפה: מתחדד בחיוך, משוטח בצד חלש
    const fx = CX + d * 34;
    const depth = (lower > 0.5 ? 1 : 0.35) * (1 + action.smile * lower * 0.8);
    p.fold.setAttribute('d', `M${fx} 282 Q${fx + d * 18 * depth} 318 ${fx + d * 22} ${352 - action.smile * lower * 8}`);
    p.fold.style.opacity = String(0.25 + 0.55 * Math.min(1, depth));

    // לחי: מתנפחת רק בצד שעובד (בצד החלש האוויר בורח מזווית הפה)
    const puff = action.puff * lower;
    p.cheek.setAttribute('rx', 28 * puff);
    p.cheek.setAttribute('ry', 22 * puff);

    // זווית הפה: עולה בחיוך, צנוחה במנוחה בצד החלש
    corner[side] = { x: CX + d * (46 + action.smile * lower * 14 + puff * 4), y: 360 - action.smile * lower * 18 + (lower < 0.5 ? 9 : 0) };
  }
  const R = corner.R, L = corner.L;
  const midY = 362 + action.smile * 4 - action.puff * 2;
  const upY = midY - 2 - action.smile * 2;
  const lowY = midY + 6 + action.smile * 16;
  mouth.setAttribute('d', `M${R.x} ${R.y} Q${CX - 20} ${upY} ${CX} ${upY} Q${CX + 20} ${upY} ${L.x} ${L.y}`);
  lips.setAttribute('d', `M${R.x} ${R.y} Q${CX - 20} ${upY - 8} ${CX} ${upY - 6} Q${CX + 20} ${upY - 8} ${L.x} ${L.y} Q${CX + 24} ${lowY} ${CX} ${lowY} Q${CX - 24} ${lowY} ${R.x} ${R.y} Z`);
  svg.setAttribute('aria-label', `פנים מצוירות: ${action.label}. ${summary()}`);
}

function summary() {
  const [kind, side] = lesion.split('-');
  const name = { R: 'הימני', L: 'השמאלי' }, nameF = { R: 'הימנית', L: 'השמאלית' };
  const other = side === 'R' ? 'L' : 'R';
  if (kind === 'none') return 'שני הצדדים זזים באופן שווה.';
  if (kind === 'nerve') return `כל חצי הפנים ${name[side] ?? ''} חלש: המצח לא מתקמט, העין לא נסגרת וזווית הפה צנוחה. כך נראה, למשל, שיתוק בל (Bell's palsy).`;
  return `פגיעה במוח בצד ${side === 'L' ? 'שמאל' : 'ימין'}, מעל גרעין עצב הפנים, מחלישה את החלק התחתון של הפנים בצד ${other === 'R' ? 'ימין' : 'שמאל'} — הצד הנגדי. אבל המצח בשני הצדדים ממשיך לזוז, והעין ${nameF[other]} נסגרת: החלק העליון של הפנים מקבל פקודות משני צדי המוח.`;
}

const TIPS = {
  rest: 'במנוחה כבר אפשר לראות סימנים: זווית פה צנוחה וקפל אף-שפה שטוח בצד החלש.',
  brow: 'זה המבחן החשוב ביותר: האם המצח מתקמט בשני הצדדים?',
  close: 'בצד שבו עצב הפנים פגוע, העין לא נסגרת — ורואים אותה מתגלגלת למעלה. זו תנועה שקורית אצל כולם כשעוצמים עיניים, אבל בדרך כלל העפעף מסתיר אותה ("תופעת בל").',
  smile: 'בחיוך, הפה נמשך לצד החזק.',
  puff: 'כשמנפחים לחיים, האוויר בורח מזווית הפה בצד החלש.',
};

// ---------- פקדים ----------

const controls = document.createElement('div');
controls.className = 'lab-controls';
controls.innerHTML = `
  <fieldset class="chip-set"><legend>מה לבקש מהפנים</legend>
    ${ACTIONS.map((a) => `<button type="button" class="chip" data-action="${a.id}" aria-pressed="${a.id === 'rest'}">${a.label}</button>`).join('')}
  </fieldset>
  <fieldset class="chip-set"><legend>איפה הפגיעה <span class="muted">(ימין ושמאל של האדם)</span></legend>
    ${LESIONS.map((l) => `<button type="button" class="chip" data-lesion="${l.id}" aria-pressed="${l.id === 'none'}">${l.label}</button>`).join('')}
  </fieldset>`;
const readout = document.createElement('div');
readout.className = 'lab-readout';
readout.innerHTML = '<p class="lab-explain" id="explain" role="status" aria-live="polite"></p><p class="callout" id="tip"></p>';

const stageWrap = document.createElement('div');
stageWrap.className = 'lab-stage lab-stage-narrow';
stageWrap.append(svg);
const layout = document.createElement('div');
layout.className = 'lab-layout';
layout.append(stageWrap, controls, readout);
root.append(layout);

function update() {
  draw();
  document.getElementById('explain').textContent = summary();
  document.getElementById('tip').textContent = TIPS[action.id];
}

controls.addEventListener('click', (e) => {
  const a = e.target.closest('[data-action]');
  if (a) {
    action = ACTIONS.find((x) => x.id === a.dataset.action);
    controls.querySelectorAll('[data-action]').forEach((c) => c.setAttribute('aria-pressed', String(c === a)));
  }
  const l = e.target.closest('[data-lesion]');
  if (l) {
    lesion = l.dataset.lesion;
    controls.querySelectorAll('[data-lesion]').forEach((c) => c.setAttribute('aria-pressed', String(c === l)));
  }
  if (a || l) update();
});

update();
