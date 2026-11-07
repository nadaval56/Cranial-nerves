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

// הגדרות ציור: מעברי צבע לעור, לשיער, לשפתיים ולקשתית, וסגנון שחל רק על האיור הזה
const STYLE = `
.face-stage .fx-skin { fill: url(#fx-skin); stroke: #6e4636; stroke-width: 1.4; }
.face-stage .fx-ear { fill: url(#fx-ear); stroke: #6e4636; stroke-width: 1.4; }
.face-stage .fx-ear-in { fill: none; stroke: #7d4f3d; stroke-width: 2; stroke-linecap: round; opacity: 0.7; }
.face-stage .fx-neck { fill: url(#fx-neck); }
.face-stage .fx-hair { fill: url(#fx-hair); }
.face-stage .fx-strand { fill: none; stroke: #5a3d2c; stroke-width: 1.4; stroke-linecap: round; opacity: 0.55; }
.face-stage .fx-shade { fill: url(#fx-shade); }
.face-stage .fx-blush { fill: url(#fx-blush); }
.face-stage .fx-nose { fill: none; stroke: #8a5843; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.face-stage .fx-nose-soft { fill: none; stroke: #9a6650; stroke-width: 1.5; stroke-linecap: round; opacity: 0.35; }
.face-stage .fx-nostril { fill: #6b3f30; opacity: 0.75; }
.face-stage .fx-nose-hi { fill: #f0cdb4; opacity: 0.45; }
.face-stage .fx-philtrum { fill: none; stroke: #9a6650; stroke-width: 1.3; stroke-linecap: round; opacity: 0.32; }
.face-stage .fx-chin { fill: none; stroke: #9a6650; stroke-width: 1.6; stroke-linecap: round; opacity: 0.45; }
.face-stage .fx-socket { fill: url(#fx-socket); }
.face-stage .wrinkles path { stroke: #8a5843; stroke-width: 1.8; opacity: 0.85; }
.face-stage .f-brow { fill: #4a3022; stroke: #3a251a; stroke-width: 1; stroke-linejoin: round; }
.face-stage .eye-white { fill: url(#fx-sclera); stroke: #a87a64; stroke-width: 0.8; }
.face-stage .iris { fill: url(#fx-iris); stroke: #2c4a55; stroke-width: 1.4; }
.face-stage .pupil { fill: #0b0d10; }
.face-stage .fx-glint { fill: #ffffff; opacity: 0.85; }
.face-stage .f-lid { stroke: #2a1a14; stroke-width: 3; }
.face-stage .fx-crease { fill: none; stroke: #8a5843; stroke-width: 1.6; stroke-linecap: round; }
.face-stage .fx-lowlid { fill: none; stroke: #a06c56; stroke-width: 1.3; stroke-linecap: round; opacity: 0.7; }
.face-stage .f-fold { stroke: #8a5843; stroke-width: 2; }
.face-stage .f-cheek { fill: url(#fx-puff); opacity: 1; }
.face-stage .f-lips { fill: url(#fx-lips); stroke: #7e3c35; stroke-width: 1.2; stroke-linejoin: round; }
.face-stage .f-mouth { stroke: #4a1f1b; stroke-width: 2.6; }
`;
const grad = (id, kind, attrs, stops) => s(kind, { id, ...attrs }, ...stops.map(([o, c, op = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })));
svg.append(s('defs', {},
  s('style', {}, document.createTextNode(STYLE)),
  grad('fx-skin', 'radialGradient', { cx: '50%', cy: '42%', r: '62%' }, [['0', '#e2b597'], ['0.55', '#cf9c7e'], ['1', '#a8705a']]),
  grad('fx-ear', 'radialGradient', { cx: '50%', cy: '45%', r: '60%' }, [['0', '#d29f81'], ['1', '#a06a53']]),
  grad('fx-neck', 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#8e5d48'], ['0.35', '#b8846a'], ['1', '#b8846a', 0]]),
  grad('fx-hair', 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#3e2a1f'], ['0.6', '#2a1c14'], ['1', '#20150f']]),
  grad('fx-shade', 'radialGradient', { cx: '50%', cy: '40%', r: '55%' }, [['0.6', '#5a3426', 0], ['1', '#5a3426', 0.45]]),
  grad('fx-blush', 'radialGradient', {}, [['0', '#d77f6e', 0.35], ['1', '#d77f6e', 0]]),
  grad('fx-socket', 'radialGradient', {}, [['0.35', '#8a5340', 0.4], ['1', '#8a5340', 0]]),
  grad('fx-sclera', 'radialGradient', { cx: '50%', cy: '45%', r: '60%' }, [['0', '#fbf8f4'], ['1', '#d9cfc6']]),
  grad('fx-iris', 'radialGradient', {}, [['0', '#2f5865'], ['0.55', '#4f8696'], ['1', '#2e5562']]),
  grad('fx-puff', 'radialGradient', { cx: '42%', cy: '38%', r: '62%' }, [['0', '#f0caae', 0.95], ['0.55', '#dcaa8d', 0.75], ['1', '#c99274', 0]]),
  grad('fx-lips', 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#b8615a'], ['0.5', '#a4524b'], ['1', '#c4736a']]),
));

svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));
// צוואר
svg.append(s('path', { class: 'fx-neck', d: 'M162 392 C164 420 160 440 150 452 L270 452 C260 440 256 420 258 392 Z' }));
// אוזניים
for (const d of [-1, 1]) {
  const x = (v) => CX + d * v;
  svg.append(s('path', { class: 'fx-ear', d: `M${x(132)} 208 C${x(160)} 196 ${x(166)} 232 ${x(160)} 256 C${x(156)} 276 ${x(146)} 290 ${x(132)} 288 Z` }));
  svg.append(s('path', { class: 'fx-ear-in', d: `M${x(136)} 220 C${x(152)} 214 ${x(156)} 240 ${x(150)} 258 C${x(146)} 270 ${x(140)} 274 ${x(136)} 272` }));
}
// ראש
const HEAD = 'M210 50 C292 50 338 110 340 200 C342 262 332 318 310 360 C286 404 252 432 210 434 C168 432 134 404 110 360 C88 318 78 262 80 200 C82 110 128 50 210 50 Z';
svg.append(s('path', { class: 'fx-skin', d: HEAD }));
svg.append(s('path', { class: 'fx-shade', d: HEAD }));
// סומק עדין בלחיים
for (const d of [-1, 1]) svg.append(s('ellipse', { class: 'fx-blush', cx: CX + d * 88, cy: 300, rx: 34, ry: 24 }));
// שיער: קו שיער מעל המצח, כך שקמטי המצח נשארים גלויים
svg.append(s('path', { class: 'fx-hair', d: 'M82 188 C76 100 132 40 212 40 C292 40 346 100 338 188 C330 150 318 128 300 116 C268 98 236 108 214 104 C186 100 150 100 122 116 C102 128 90 152 82 188 Z' }));
for (const d of ['M120 92 C150 70 186 62 214 62', 'M228 64 C262 66 292 80 314 104', 'M104 130 C120 100 150 84 186 80', 'M240 82 C270 86 298 100 320 130']) svg.append(s('path', { class: 'fx-strand', d }));
// אף
svg.append(s('path', { class: 'fx-nose-soft', d: 'M198 214 C197 236 194 254 190 268' }));
svg.append(s('path', { class: 'fx-nose-soft', d: 'M222 214 C223 236 226 254 230 268' }));
svg.append(s('ellipse', { class: 'fx-nose-hi', cx: CX, cy: 276, rx: 9, ry: 7 }));
svg.append(s('path', { class: 'fx-nose', d: 'M186 282 C176 288 178 300 190 300 C196 302 200 298 204 300 C208 304 212 304 216 300 C220 298 224 302 230 300 C242 300 244 288 234 282' }));
svg.append(s('ellipse', { class: 'fx-nostril', cx: CX - 13, cy: 296, rx: 6, ry: 3, transform: `rotate(-12 ${CX - 13} 296)` }));
svg.append(s('ellipse', { class: 'fx-nostril', cx: CX + 13, cy: 296, rx: 6, ry: 3, transform: `rotate(12 ${CX + 13} 296)` }));
// אמת השפה והסנטר
svg.append(s('path', { class: 'fx-philtrum', d: 'M204 312 C203 322 203 330 202 336 M216 312 C217 322 217 330 218 336' }));
svg.append(s('path', { class: 'fx-chin', d: 'M188 404 C200 412 220 412 232 404' }));

// חלקים לכל צד: dir = -1 לצד שמשמאל במסך (הצד הימני של האדם), +1 לצד שמימין
const P = {};
for (const side of ['R', 'L']) {
  const dir = side === 'R' ? -1 : 1;
  const ex = CX + dir * 62, ey = 214;
  const g = s('g');
  g.append(s('ellipse', { class: 'fx-socket', cx: ex, cy: ey - 4, rx: 42, ry: 26 }));
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
  const glint = s('circle', { class: 'fx-glint', cx: ex + 4, cy: ey - 4, r: 2.6, 'clip-path': `url(#${clipId})` });
  g.append(iris, pupil, glint);
  const lowLid = s('path', { class: 'fx-lowlid' });
  const lidLine = s('path', { class: 'f-lid' });
  const crease = s('path', { class: 'fx-crease' });
  g.append(lowLid, lidLine, crease);
  const fold = s('path', { class: 'f-fold' });
  g.append(fold);
  const cheek = s('ellipse', { class: 'f-cheek', cx: CX + dir * 84, cy: 312, rx: 0, ry: 0 });
  g.append(cheek);
  svg.append(g);
  P[side] = { dir, ex, ey, wr, brow, eyeShape, clipPath, iris, pupil, glint, lowLid, lidLine, crease, fold, cheek };
}
const mouth = s('path', { class: 'f-mouth' });
const lips = s('path', { class: 'f-lips' });
svg.append(lips, mouth);
svg.append(s('text', { class: 'stage-label', x: CX - 110, y: 470, 'text-anchor': 'middle' }, document.createTextNode('הצד הימני שלו')));
svg.append(s('text', { class: 'stage-label', x: CX + 110, y: 470, 'text-anchor': 'middle' }, document.createTextNode('הצד השמאלי שלו')));

function draw() {
  const st = strengths();
  const corner = {};
  for (const side of ['R', 'L']) {
    const p = P[side], d = p.dir, { upper, lower } = st[side];
    // גבה: עולה כשמרימים, יורדת מעט בעצימה חזקה
    const raise = action.brow * upper * 16 - action.close * upper * 5;
    const sag = upper < 0.5 ? 4 : 0; // גבה צנוחה מעט בצד המשותק
    const by = 172 - raise + sag;
    // גבה מלאה ומחודדת: עבה ליד האף, דקה בקצה
    p.brow.setAttribute('d', `M${CX + d * 26} ${by + 2} Q${CX + d * 60} ${by - 22} ${CX + d * 98} ${by + 4} Q${CX + d * 60} ${by - 10} ${CX + d * 26} ${by + 10} Z`);
    p.wr.style.opacity = String(action.brow * upper);

    // עין: פתיחה בין 0 (סגורה) ל-1; בצד המשותק היא פתוחה מעט יותר, ולא נסגרת
    const open = Math.max(0.04, (upper < 0.5 ? 1.12 : 1) - action.close * upper * 0.98 - action.smile * lower * 0.12);
    const top = 15 * open, bot = 9 * Math.max(0.15, open);
    const { ex, ey } = p;
    const shape = `M${ex - 30} ${ey} Q${ex} ${ey - top * 2} ${ex + 30} ${ey} Q${ex} ${ey + bot * 2} ${ex - 30} ${ey} Z`;
    p.eyeShape.setAttribute('d', shape);
    p.clipPath.setAttribute('d', shape);
    p.lidLine.setAttribute('d', `M${ex - 32} ${ey} Q${ex} ${ey - top * 2 - 3} ${ex + 32} ${ey}`);
    p.lowLid.setAttribute('d', `M${ex - 28} ${ey + 2} Q${ex} ${ey + bot * 2 + 4} ${ex + 28} ${ey + 2}`);
    p.crease.setAttribute('d', `M${ex - 28} ${ey - 4} Q${ex} ${ey - top * 2 - 13} ${ex + 30} ${ey - 3}`);
    p.crease.style.opacity = String(0.25 + 0.5 * Math.min(1, open));
    // תופעת בל: כשמנסים לעצום והעפעף לא נסגר, העין מתגלגלת למעלה
    const bell = action.close > 0.5 && upper < 0.5 ? -10 : 0;
    p.iris.setAttribute('cy', ey + bell);
    p.pupil.setAttribute('cy', ey + bell);
    p.glint.setAttribute('cy', ey - 4 + bell);

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
  // שפה עליונה עם "קשת קופידון", ושפה תחתונה מלאה
  lips.setAttribute('d', `M${R.x} ${R.y} Q${CX - 26} ${upY - 11} ${CX - 9} ${upY - 10} Q${CX} ${upY - 5} ${CX + 9} ${upY - 10} Q${CX + 26} ${upY - 11} ${L.x} ${L.y} Q${CX + 24} ${lowY + 2} ${CX} ${lowY + 2} Q${CX - 24} ${lowY + 2} ${R.x} ${R.y} Z`);
  svg.setAttribute('aria-label', `פנים מצוירות: ${action.label}. ${summary()}`);
}

function summary() {
  const [kind, side] = lesion.split('-');
  const name = { R: 'הימני', L: 'השמאלי' }, nameF = { R: 'הימנית', L: 'השמאלית' };
  const other = side === 'R' ? 'L' : 'R';
  if (kind === 'none') return 'שני הצדדים זזים באופן שווה.';
  if (kind === 'nerve') return `כל חצי הפנים ${name[side] ?? ''} חלש: המצח לא מתקמט, העין לא נסגרת וזווית הפה צנוחה. כך נראה, למשל, שיתוק בל (Bell's palsy).`;
  return `פגיעה במוח בצד ${side === 'L' ? 'שמאל' : 'ימין'}, מעל גרעין עצב הפנים, מחלישה את החלק התחתון של הפנים בצד ${other === 'R' ? 'ימין' : 'שמאל'}, בצד הנגדי. אבל המצח בשני הצדדים ממשיך לזוז, והעין ${nameF[other]} נסגרת: החלק העליון של הפנים מקבל פקודות משני צדי המוח.`;
}

const TIPS = {
  rest: 'במנוחה כבר אפשר לראות סימנים: זווית פה צנוחה וקפל אף-שפה שטוח בצד החלש.',
  brow: 'זה המבחן החשוב ביותר: האם המצח מתקמט בשני הצדדים?',
  close: 'בצד שבו עצב הפנים פגוע, העין לא נסגרת, ורואים אותה מתגלגלת למעלה. זו תנועה שקורית אצל כולם כשעוצמים עיניים, אבל בדרך כלל העפעף מסתיר אותה ("תופעת בל").',
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
