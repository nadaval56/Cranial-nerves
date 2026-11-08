// הפה והצוואר: העצבים IX, X, XI ו-XII.
// שני איורים: הפה הפתוח (חך רך, ענבל, לשון) והצוואר והכתפיים (השריר הטרפזי ושריר ה-SCM).
// האדם מול הצופה: הצד הימני של האדם (R) מופיע משמאל במסך.
// כללים:
//   X (התועה): החך לא עולה בצד הפגוע, והענבל נמשך לצד הבריא.
//   XII (התת-לשוני): הלשון סוטה לצד הפגוע כשמוציאים אותה.
//   XI (הנלווה): הכתף בצד הפגוע עולה פחות; שריר ה-SCM של צד אחד מסובב את הראש לצד הנגדי.
//   רפלקס ההקאה: IX מרגיש (באותו צד שבו נוגעים), X מבצע (בשני הצדדים).

import { s, prefersReducedMotion } from '../lib/dom.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const SIDE = { R: 'ימני', L: 'שמאלי' };
const SIDE_F = { R: 'ימנית', L: 'שמאלית' }; // לשמות עצם בנקבה (כתף)
const SIDE_DIR = { R: 'ימינה', L: 'שמאלה' };
const OTHER = { R: 'L', L: 'R' };

const ACTIONS = [
  { id: 'rest', label: 'מנוחה', view: 'mouth' },
  { id: 'aah', label: 'להגיד "אההה"', view: 'mouth' },
  { id: 'tongue', label: 'להוציא לשון', view: 'mouth' },
  { id: 'gag-R', label: 'לגעת בלוע מימין', view: 'mouth' },
  { id: 'gag-L', label: 'לגעת בלוע משמאל', view: 'mouth' },
  { id: 'shrug', label: 'להרים כתפיים', view: 'neck' },
  { id: 'turn-R', label: 'לסובב את הראש ימינה', view: 'neck' },
  { id: 'turn-L', label: 'לסובב את הראש שמאלה', view: 'neck' },
];
const LESIONS = [
  { id: 'none', label: 'בלי פגיעה' },
  { id: 'IX-R', label: 'IX ימני' }, { id: 'IX-L', label: 'IX שמאלי' },
  { id: 'X-R', label: 'X ימני' }, { id: 'X-L', label: 'X שמאלי' },
  { id: 'XI-R', label: 'XI ימני' }, { id: 'XI-L', label: 'XI שמאלי' },
  { id: 'XII-R', label: 'XII ימני' }, { id: 'XII-L', label: 'XII שמאלי' },
];

let action = ACTIONS[0];
let lesion = 'none';

const lesionOf = (nerve) => {
  const [n, side] = lesion.split('-');
  return n === nerve ? side : null;
};

// ---------- המצב הרצוי של האיור לפי הפעולה והפגיעה ----------
// palR / palL: כמה כל צד של החך עולה (0..1). uv: הסטה של קצה הענבל (+ = לצד השמאלי של האדם, ימין המסך).
// out: כמה הלשון בחוץ. tx: הסטה של קצה הלשון. atrR/atrL: התנוונות של חצי לשון.
// shR/shL: כמה כל כתף עולה. droopR/L: שמיטה במנוחה. turn: סיבוב הראש (- = לימין האדם, שמאל המסך).
function target() {
  const t = { palR: 0, palL: 0, uv: 0, out: 0, tx: 0, atrR: 0, atrL: 0, shR: 0, shL: 0, droopR: 0, droopL: 0, turn: 0, scmR: 0, scmL: 0, touch: 0 };
  const x = lesionOf('X'), xii = lesionOf('XII'), xi = lesionOf('XI'), ix = lesionOf('IX');
  const palStrength = (side) => (x === side ? 0 : 1);
  if (xii) t[xii === 'R' ? 'atrR' : 'atrL'] = 1;
  if (xi) t[xi === 'R' ? 'droopR' : 'droopL'] = 1;
  // במנוחה החך בצד של עצב X פגוע מעט נמוך יותר
  if (x) t[x === 'R' ? 'palR' : 'palL'] = -0.35;

  const lift = () => {
    t.palR = palStrength('R'); t.palL = palStrength('L');
    if (x) t[x === 'R' ? 'palR' : 'palL'] = -0.35;
    t.uv = palStrength('L') - palStrength('R');
  };
  if (action.id === 'aah') lift();
  if (action.id === 'tongue') {
    t.out = 1;
    // כל צד דוחף לצד הנגדי; אם צד אחד חלש, הלשון סוטה אליו
    if (xii) t.tx = xii === 'R' ? -1 : 1;
  }
  if (action.id.startsWith('gag-')) {
    const touched = action.id.slice(4);
    t.touch = touched === 'R' ? -1 : 1;
    if (ix !== touched) lift();
  }
  if (action.id === 'shrug') {
    t.shR = xi === 'R' ? 0.15 : 1;
    t.shL = xi === 'L' ? 0.15 : 1;
  }
  if (action.id.startsWith('turn-')) {
    const dir = action.id.slice(5);
    const muscle = OTHER[dir];
    const strong = xi === muscle ? 0.25 : 1;
    t.turn = (dir === 'R' ? -1 : 1) * strong;
    t[muscle === 'R' ? 'scmR' : 'scmL'] = 1;
  }
  return t;
}

// ---------- ציור ----------
// לכל איור מזהים משלו (mxm- לפה, mxn- לצוואר): איור מוסתר לא יכול "להשאיל" מעברי צבע לאיור הגלוי

const STYLE = (p) => `
.mouth-svg { width: 100%; height: auto; display: block; }
.mouth-svg .mx-label { font: 600 13px Heebo, system-ui, sans-serif; fill: #f3eee8; paint-order: stroke; stroke: #1a1013; stroke-width: 3.5px; stroke-linejoin: round; }
.mouth-svg .mx-side { font: 500 12px Heebo, system-ui, sans-serif; fill: #e8ecf1; paint-order: stroke; stroke: #11151c; stroke-width: 3px; stroke-linejoin: round; }
.${p}svg .mx-skin { fill: url(#${p}skin); }
.${p}svg .mx-shade { fill: url(#${p}shade); }
.${p}svg .mx-lip { fill: url(#${p}lip); stroke: #7e3c38; stroke-width: 1.2; }
.${p}svg .mx-cavity { fill: url(#${p}cavity); }
.${p}svg .mx-palate { fill: url(#${p}palate); stroke: #b0606a; stroke-width: 1.2; }
.${p}svg .mx-arch { fill: none; stroke: #c4747c; stroke-width: 2.2; opacity: 0.8; stroke-linecap: round; }
.${p}svg .mx-uvula { fill: url(#${p}uvula); stroke: #9a4c50; stroke-width: 1.2; }
.${p}svg .mx-tooth { fill: url(#${p}tooth); stroke: #cbbfae; stroke-width: 0.8; }
.${p}svg .mx-tongue { fill: url(#${p}tongue); stroke: #a3545a; stroke-width: 1.3; }
.${p}svg .mx-head { fill: url(#${p}skin); stroke: #6e4636; stroke-width: 1.3; }
.${p}svg .mx-torso { fill: url(#${p}torso); stroke: #6e4636; stroke-width: 1.2; }
.${p}svg .mx-hair { fill: url(#${p}hair); }
.mouth-svg .mx-groove { fill: none; stroke: #b25f66; stroke-width: 2; stroke-linecap: round; opacity: 0.7; }
.mouth-svg .mx-atrophy { fill: none; stroke: #a3545a; stroke-width: 1.3; opacity: 0.75; stroke-linecap: round; }
.mouth-svg .mx-swab { stroke: #e8dcc6; stroke-width: 4; stroke-linecap: round; }
.mouth-svg .mx-swab-tip { fill: #f6efe3; stroke: #c9bba3; }
.mouth-svg .mx-nostril { fill: #6b3f30; opacity: 0.8; }
.mouth-svg .mx-line { fill: none; stroke: #8a5843; stroke-width: 1.6; stroke-linecap: round; opacity: 0.55; }
.mouth-svg .mx-trap { fill: none; stroke: #8a5843; stroke-width: 2; opacity: 0.6; stroke-linecap: round; }
.mouth-svg .mx-clav { fill: none; stroke: #8a5843; stroke-width: 2.2; opacity: 0.55; stroke-linecap: round; }
.mouth-svg .mx-scm { fill: none; stroke: #9c6a55; stroke-width: 10; stroke-linecap: round; opacity: 0.55; }
.mouth-svg .mx-scm.is-on { stroke: #f0c46b; opacity: 0.9; }
.mouth-svg .mx-ear { fill: #cf9a7d; stroke: #6e4636; stroke-width: 1.2; }
.mouth-svg .mx-eye { fill: #fbf8f4; stroke: #4a3020; stroke-width: 1.2; }
.mouth-svg .mx-iris { fill: #3f7181; }
.mouth-svg .mx-brow { fill: none; stroke: #4a3020; stroke-width: 4; stroke-linecap: round; }
.mouth-svg .mx-nose { fill: none; stroke: #8a5843; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.mouth-svg .mx-mouth { fill: #a4524b; stroke: #7e3c38; stroke-width: 1; }
`;

const grad = (id, kind, attrs, stops) => s(kind, { id, ...attrs }, ...stops.map(([o, c, op = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })));
const defs = (p) => s('defs', {},
  s('style', {}, document.createTextNode(STYLE(p))),
  grad(`${p}skin`, 'radialGradient', { cx: '50%', cy: '42%', r: '62%' }, [['0', '#e6bb9e'], ['0.6', '#d4a183'], ['1', '#a8705a']]),
  grad(`${p}shade`, 'radialGradient', { cx: '50%', cy: '50%', r: '50%' }, [['0.55', '#11151c', 0], ['1', '#11151c', 1]]),
  grad(`${p}lip`, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [['0', '#c46d65'], ['1', '#9c4c46']]),
  grad(`${p}cavity`, 'radialGradient', { cx: '50%', cy: '58%', r: '60%' }, [['0', '#2a0a0f'], ['0.6', '#4d161d'], ['1', '#6e252c']]),
  grad(`${p}palate`, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [['0', '#e8a3a0'], ['1', '#cf7780']]),
  grad(`${p}uvula`, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [['0', '#d87e86'], ['1', '#f0a6a8']]),
  grad(`${p}tooth`, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [['0', '#fbf7ef'], ['1', '#e0d5c3']]),
  grad(`${p}tongue`, 'radialGradient', { cx: '50%', cy: '28%', r: '78%' }, [['0', '#f2a9a9'], ['0.6', '#df8a8d'], ['1', '#b45d67']]),
  grad(`${p}torso`, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [['0', '#d4a183'], ['1', '#a8705a']]),
  grad(`${p}hair`, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [['0', '#3e2a1f'], ['1', '#21160f']]),
);
const txt = (attrs, t) => s('text', attrs, document.createTextNode(t));
const sides = (svg) => svg.append(txt({ class: 'mx-side', x: 20, y: 368 }, 'הצד הימני שלו'), txt({ class: 'mx-side', x: 380, y: 368, 'text-anchor': 'end' }, 'הצד השמאלי שלו'));

// --- הפה: חלק תחתון של הפנים, הפה פתוח לרווחה ---
// פתח הפה: אליפסה במרכז (200, 196), רוחב 108, גובה 92
const OX = 200, OY = 196, ORX = 108, ORY = 92;
const mouthSvg = s('svg', { class: 'mouth-svg mxm-svg', viewBox: '0 0 400 380', role: 'img', direction: 'ltr' });
mouthSvg.append(defs('mxm-'));
mouthSvg.querySelector('defs').append(
  s('clipPath', { id: 'mxm-cav' }, s('ellipse', { cx: OX, cy: OY, rx: ORX, ry: ORY })),
  s('clipPath', { id: 'mxm-out' }, s('rect', { x: 0, y: OY + 40, width: 400, height: 200 })),
  s('clipPath', { id: 'mxm-tg' }, s('path', { id: 'mxm-tg-path' })),
);
mouthSvg.append(s('rect', { x: 0, y: 0, width: 400, height: 380, rx: 18, fill: '#11151c' }));
mouthSvg.append(s('rect', { class: 'mx-skin', x: 0, y: 0, width: 400, height: 380, rx: 18 }));
// בסיס האף, קפלי הלחיים והסנטר
mouthSvg.append(
  s('path', { class: 'mx-line', d: 'M170 34 C176 46 188 52 200 52 C212 52 224 46 230 34' }),
  s('ellipse', { class: 'mx-nostril', cx: 184, cy: 38, rx: 9, ry: 4.5 }), s('ellipse', { class: 'mx-nostril', cx: 216, cy: 38, rx: 9, ry: 4.5 }),
  s('path', { class: 'mx-line', d: 'M120 60 C92 110 74 170 78 224' }), s('path', { class: 'mx-line', d: 'M280 60 C308 110 326 170 322 224' }),
  s('path', { class: 'mx-line', d: 'M150 356 C176 366 224 366 250 356' }),
);
const cav = s('g', { 'clip-path': 'url(#mxm-cav)' });
cav.append(s('ellipse', { class: 'mx-cavity', cx: OX, cy: OY, rx: ORX, ry: ORY }));
const palate = s('path', { class: 'mx-palate' });
const archBack = s('path', { class: 'mx-arch', opacity: 0.4 });
const archFront = s('path', { class: 'mx-arch' });
const uvula = s('path', { class: 'mx-uvula' });
const lowTeeth = s('g', {});
const tongueIn = s('path', { class: 'mx-tongue' });
const grooveIn = s('path', { class: 'mx-groove' });
const atrophyIn = s('g', { 'clip-path': 'url(#mxm-tg)' });
const upTeeth = s('g', {});
for (let i = 0; i < 10; i++) {
  const a = Math.PI * (0.16 + 0.68 * (i / 9));
  const x = OX - Math.cos(a) * (ORX - 4), y = OY - Math.sin(a) * (ORY - 2);
  upTeeth.append(s('rect', { class: 'mx-tooth', x: x - 10, y: y - 4, width: 20, height: 20, rx: 6 }));
}
for (let i = 0; i < 8; i++) {
  const a = Math.PI * (0.2 + 0.6 * (i / 7));
  const x = OX - Math.cos(a) * (ORX - 8), y = OY + Math.sin(a) * (ORY - 2);
  lowTeeth.append(s('rect', { class: 'mx-tooth', x: x - 9, y: y - 16, width: 18, height: 16, rx: 5 }));
}
cav.append(palate, archBack, archFront, uvula, lowTeeth, tongueIn, grooveIn, atrophyIn, upTeeth);
mouthSvg.append(cav);
mouthSvg.append(
  s('path', { class: 'mx-lip', d: `M78 ${OY} C88 120 150 88 200 100 C250 88 312 120 322 ${OY} L${OX + ORX} ${OY} A${ORX} ${ORY} 0 0 0 ${OX - ORX} ${OY} Z` }),
  s('path', { class: 'mx-lip', d: `M78 ${OY} C90 300 160 322 200 320 C240 322 310 300 322 ${OY} L${OX + ORX} ${OY} A${ORX} ${ORY} 0 0 1 ${OX - ORX} ${OY} Z` }),
);
const tongueOut = s('path', { class: 'mx-tongue', 'clip-path': 'url(#mxm-out)' });
const grooveOut = s('path', { class: 'mx-groove', 'clip-path': 'url(#mxm-out)' });
const atrophyOut = s('g', { 'clip-path': 'url(#mxm-tg)' });
const swab = s('g', {}, s('line', { class: 'mx-swab' }), s('ellipse', { class: 'mx-swab-tip', rx: 7, ry: 5 }));
const uvLabel = txt({ class: 'mx-label', 'text-anchor': 'start' }, 'ענבל');
const palLabel = txt({ class: 'mx-label', 'text-anchor': 'middle' }, 'החך הרך');
mouthSvg.append(tongueOut, grooveOut, atrophyOut, swab, palLabel, uvLabel);
sides(mouthSvg);

// --- הצוואר והכתפיים ---
const neckSvg = s('svg', { class: 'mouth-svg mxn-svg', viewBox: '0 0 400 380', role: 'img', direction: 'ltr' });
neckSvg.append(defs('mxn-'));
neckSvg.append(s('rect', { x: 0, y: 0, width: 400, height: 380, rx: 18, fill: '#11151c' }));
const torso = s('path', { class: 'mx-torso' });
const trapR = s('path', { class: 'mx-trap' });
const trapL = s('path', { class: 'mx-trap' });
const clavR = s('path', { class: 'mx-clav' });
const clavL = s('path', { class: 'mx-clav' });
const scmR = s('path', { class: 'mx-scm' });
const scmL = s('path', { class: 'mx-scm' });
const earR = s('ellipse', { class: 'mx-ear' });
const earL = s('ellipse', { class: 'mx-ear' });
const headShape = s('path', { class: 'mx-head', d: 'M200 26 C246 26 268 62 268 104 C268 150 240 186 200 192 C160 186 132 150 132 104 C132 62 154 26 200 26 Z' });
const hair = s('path', { class: 'mx-hair' });
const feat = s('g', {});
feat.append(
  s('path', { class: 'mx-brow', d: 'M164 88 C172 82 184 82 192 86' }), s('path', { class: 'mx-brow', d: 'M208 86 C216 82 228 82 236 88' }),
  s('ellipse', { class: 'mx-eye', cx: 178, cy: 104, rx: 12, ry: 7 }), s('circle', { class: 'mx-iris', cx: 178, cy: 104, r: 4.5 }),
  s('ellipse', { class: 'mx-eye', cx: 222, cy: 104, rx: 12, ry: 7 }), s('circle', { class: 'mx-iris', cx: 222, cy: 104, r: 4.5 }),
  s('path', { class: 'mx-nose', d: 'M200 108 L195 136 C198 141 204 141 207 137' }),
  s('path', { class: 'mx-mouth', d: 'M184 158 C194 154 206 154 216 158 C206 164 194 164 184 158 Z' }),
);
const head = s('g', {});
head.append(earR, earL, headShape, hair, feat);
neckSvg.append(torso, trapR, trapL, clavR, clavL, scmR, scmL, head);
neckSvg.append(txt({ class: 'mx-label', x: 200, y: 328, 'text-anchor': 'middle' }, 'SCM'));
sides(neckSvg);

const f = (n) => n.toFixed(1);

function draw(st) {
  // החך: וילון מעל הלוע. צד ימין של האדם = שמאל המסך. צד חלש נשאר נמוך
  const liftR = st.palR * 26, liftL = st.palL * 26;
  const apexX = OX + st.uv * 9, apexY = 150 - (liftR + liftL) / 2;
  const lA = [OX - 92, 226 - liftR * 0.6], rA = [OX + 92, 226 - liftL * 0.6];
  const curve = `C${OX - 86} ${f(170 - liftR)} ${OX - 48} ${f(146 - liftR)} ${f(apexX)} ${f(apexY)} C${OX + 48} ${f(146 - liftL)} ${OX + 86} ${f(170 - liftL)} ${rA[0]} ${f(rA[1])}`;
  palate.setAttribute('d', `M${OX - ORX} 90 L${lA[0]} ${f(lA[1])} ${curve} L${OX + ORX} 90 Z`);
  archFront.setAttribute('d', `M${lA[0]} ${f(lA[1])} ${curve}`);
  archBack.setAttribute('d', `M${lA[0] + 26} ${f(lA[1] + 10)} C${OX - 60} ${f(196 - liftR)} ${OX - 34} ${f(178 - liftR)} ${f(apexX)} ${f(apexY + 26)} C${OX + 34} ${f(178 - liftL)} ${OX + 60} ${f(196 - liftL)} ${rA[0] - 26} ${f(rA[1] + 10)}`);
  const tipX = apexX + st.uv * 14, tipY = apexY + 42;
  uvula.setAttribute('d', `M${f(apexX - 8)} ${f(apexY - 2)} C${f(apexX - 9)} ${f(apexY + 20)} ${f(tipX - 10)} ${f(tipY - 7)} ${f(tipX)} ${f(tipY)} C${f(tipX + 10)} ${f(tipY - 7)} ${f(apexX + 9)} ${f(apexY + 20)} ${f(apexX + 8)} ${f(apexY - 2)} Z`);
  uvLabel.setAttribute('x', f(tipX + 14)); uvLabel.setAttribute('y', f(tipY - 2));
  palLabel.setAttribute('x', OX - 52); palLabel.setAttribute('y', f(Math.min(lA[1], rA[1]) - 44));

  // הלשון: בפנים, ובהוצאה ממשיכה החוצה מעל השפה התחתונה. חצי מתנוון צר מעט וחיוור יותר
  const wR = 84 * (1 - 0.2 * st.atrR), wL = 84 * (1 - 0.2 * st.atrL);
  const out = st.out, tx = st.tx * 36 * out;
  const tipTY = 262 + out * 96, tipTX = OX + tx;
  const top = 228 - out * 4;
  const d = `M${f(OX - wR)} 300 C${f(OX - wR)} ${f(top)} ${f(OX + wL)} ${f(top)} ${f(OX + wL)} 300 `
    + `C${f(OX + wL * 0.8)} ${f(tipTY - 12)} ${f(tipTX + 38)} ${f(tipTY + 6)} ${f(tipTX)} ${f(tipTY + 6)} `
    + `C${f(tipTX - 38)} ${f(tipTY + 6)} ${f(OX - wR * 0.8)} ${f(tipTY - 12)} ${f(OX - wR)} 300 Z`;
  tongueIn.setAttribute('d', d);
  mouthSvg.querySelector('#mxm-tg-path').setAttribute('d', d);
  const show = out > 0.02;
  tongueOut.setAttribute('d', show ? d : 'M0 0');
  const groove = `M${OX} ${f(top + 16)} Q${f(OX + tx * 0.4)} ${f((top + tipTY) / 2)} ${f(tipTX)} ${f(tipTY - 8)}`;
  grooveIn.setAttribute('d', groove); grooveOut.setAttribute('d', show ? groove : 'M0 0');
  atrophyIn.replaceChildren(); atrophyOut.replaceChildren();
  for (const [side, a] of [['R', st.atrR], ['L', st.atrL]]) {
    if (a < 0.5) continue;
    const sx = side === 'R' ? -1 : 1;
    for (let i = 0; i < 4; i++) {
      const y = 250 + i * 14 + out * 40 * (i / 3);
      const x0 = OX + sx * (14 + i * 2) + tx * (0.3 + 0.2 * i);
      const dd = `M${f(x0)} ${f(y)} q${f(sx * 7)} -4 ${f(sx * 14)} 0 t${f(sx * 14)} 0 t${f(sx * 14)} 0`;
      atrophyIn.append(s('path', { class: 'mx-atrophy', d: dd }));
      if (show) atrophyOut.append(s('path', { class: 'mx-atrophy', d: dd }));
    }
  }
  swab.style.display = st.touch ? '' : 'none';
  if (st.touch) {
    const px = OX + st.touch * 50, py = 206;
    const line = swab.firstChild;
    line.setAttribute('x1', f(OX + st.touch * 150)); line.setAttribute('y1', '372');
    line.setAttribute('x2', f(px)); line.setAttribute('y2', f(py + 4));
    swab.lastChild.setAttribute('cx', f(px)); swab.lastChild.setAttribute('cy', f(py));
  }

  // הצוואר: כתף ימין של האדם = שמאל המסך
  const yR = 286 - st.shR * 26 + st.droopR * 10, yL = 286 - st.shL * 26 + st.droopL * 10;
  torso.setAttribute('d', `M0 380 L0 ${f(yR + 30)} C10 ${f(yR + 4)} 50 ${f(yR - 8)} 96 ${f(yR - 16)} C130 ${f(yR - 22)} 160 ${f(232 - st.shR * 8)} 168 196 L232 196 C240 ${f(232 - st.shL * 8)} 270 ${f(yL - 22)} 304 ${f(yL - 16)} C350 ${f(yL - 8)} 390 ${f(yL + 4)} 400 ${f(yL + 30)} L400 380 Z`);
  trapR.setAttribute('d', `M170 206 C150 ${f(238 - st.shR * 14)} 112 ${f(yR - 22)} 56 ${f(yR - 6)}`);
  trapL.setAttribute('d', `M230 206 C250 ${f(238 - st.shL * 14)} 288 ${f(yL - 22)} 344 ${f(yL - 6)}`);
  clavR.setAttribute('d', `M192 ${f(300)} C160 ${f(296)} 130 ${f(yR + 6)} 92 ${f(yR + 2)}`);
  clavL.setAttribute('d', `M208 ${f(300)} C240 ${f(296)} 270 ${f(yL + 6)} 308 ${f(yL + 2)}`);
  const turn = st.turn;
  scmR.setAttribute('d', `M${f(152 + turn * 6)} 164 C${f(164 + turn * 3)} 220 182 268 194 ${f(298 - st.scmR * 6)}`);
  scmL.setAttribute('d', `M${f(248 + turn * 6)} 164 C${f(236 + turn * 3)} 220 218 268 206 ${f(298 - st.scmL * 6)}`);
  scmR.classList.toggle('is-on', st.scmR > 0.5);
  scmL.classList.toggle('is-on', st.scmL > 0.5);
  feat.setAttribute('transform', `translate(${f(turn * 26)} 0)`);
  hair.setAttribute('d', `M134 98 C132 44 ${f(170 + turn * 8)} 20 200 22 C230 20 268 44 266 98 C${f(252 + turn * 12)} 64 ${f(148 + turn * 12)} 64 134 98 Z`);
  earR.setAttribute('cx', f(134 + Math.max(0, turn) * 8)); earR.setAttribute('cy', 112);
  earR.setAttribute('rx', f(9 * (1 - Math.max(0, -turn) * 0.85) + 1)); earR.setAttribute('ry', 19);
  earL.setAttribute('cx', f(266 + Math.min(0, turn) * 8)); earL.setAttribute('cy', 112);
  earL.setAttribute('rx', f(9 * (1 - Math.max(0, turn) * 0.85) + 1)); earL.setAttribute('ry', 19);
}

// ---------- מעבר חלק בין מצבים ----------
let cur = target();
let anim = 0;
const still = () => prefersReducedMotion() || document.documentElement.classList.contains('a11y-still');
function animateTo(t) {
  cancelAnimationFrame(anim);
  if (still()) { cur = t; draw(cur); return; }
  const from = { ...cur }, t0 = performance.now(), dur = 520;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) ** 3;
    for (const key of Object.keys(t)) cur[key] = from[key] + (t[key] - from[key]) * e;
    draw(cur);
    if (k < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}

// ---------- הסבר ----------
function explain() {
  const x = lesionOf('X'), xii = lesionOf('XII'), xi = lesionOf('XI'), ix = lesionOf('IX');
  const a = action.id;
  if (a === 'rest') {
    if (xii) return `במנוחה אפשר לראות שחצי הלשון ה${SIDE[xii]} קטן יותר ומקומט: השרירים שלו מתנוונים כשהעצב התת-לשוני (XII) לא מגיע אליהם. לפעמים רואים בו גם רטטים קטנים (פסיקולציות). בקשו להוציא לשון.`;
    if (xi) return `במנוחה הכתף ה${SIDE_F[xi]} שמוטה מעט, כי השריר הטרפזי בצד הזה חלש. עברו לפעולות של הצוואר.`;
    if (x) return `במנוחה הקשת של החך בצד ה${SIDE[x]} יכולה להיראות מעט נמוכה. ההבדל בולט יותר כשאומרים "אההה".`;
    return 'בחרו מה לבקש, ואיפה הפגיעה. שימו לב: ימין ושמאל הם של האדם, והוא עומד מולכם.';
  }
  if (a === 'aah') {
    if (x) return `החך עולה רק בצד הבריא. הצד ה${SIDE[x]} נשאר נמוך, והענבל נמשך אל הצד הבריא, ה${SIDE[OTHER[x]]}. זה הסימן האופייני לפגיעה בעצב התועה (X) בצד אחד.`;
    return 'כשאומרים "אההה", החך הרך עולה בשני הצדדים באותה מידה, והענבל נשאר באמצע.' + (lesion !== 'none' ? ' הפגיעה שבחרתם לא משפיעה על החך.' : '');
  }
  if (a === 'tongue') {
    if (xii) return `הלשון סוטה אל הצד ה${SIDE[xii]}, הצד הפגוע. כל צד של הלשון דוחף אותה קדימה ומעט לצד הנגדי. כשהצד ה${SIDE[xii]} חלש, הצד הבריא דוחף לבד, והלשון נוטה אל הצד החלש.`;
    return 'הלשון יוצאת ישר, באמצע: שני הצדדים דוחפים באותה מידה.' + (lesion !== 'none' ? ' הפגיעה שבחרתם לא משפיעה על הלשון.' : '');
  }
  if (a.startsWith('gag-')) {
    const t = a.slice(4);
    if (ix === t) return `הנגיעה בצד ה${SIDE[t]} של הלוע לא מעוררת רפלקס: העצב הלשוני-לועי (IX) בצד הזה הוא שמרגיש את המגע, והוא פגוע. נגיעה בצד השני כן תעורר רפלקס, כי העצב התועה בשני הצדדים תקין.`;
    if (x) return `הרפלקס מתעורר, כי התחושה עוברת ב-IX. אבל רק הצד הבריא של החך מתכווץ: הצד ה${SIDE[x]} לא זז, והענבל נמשך אל הצד הבריא. כאן הבעיה בצד המבצע, בעצב התועה (X).`;
    return 'הנגיעה מעוררת את רפלקס ההקאה: העצב הלשוני-לועי (IX) מרגיש את המגע, והעצב התועה (X) מכווץ את שני צדי החך והלוע.' + (ix ? ' (הפגיעה ב-IX היא בצד השני, ולכן הנגיעה בצד הזה עדיין עובדת.)' : '');
  }
  if (a === 'shrug') {
    if (xi) return `הכתף ה${SIDE_F[xi]} עולה פחות: השריר הטרפזי, שמרים את הכתף, מקבל פקודות מהעצב הנלווה (XI), והוא פגוע בצד הזה.`;
    return 'שתי הכתפיים עולות באותה מידה. את התנועה הזו עושה השריר הטרפזי בכל צד, שמקבל פקודות מהעצב הנלווה (XI).';
  }
  if (a.startsWith('turn-')) {
    const d = a.slice(5), m = OTHER[d];
    if (xi === m) return `קשה לסובב את הראש ${SIDE_DIR[d]}. את התנועה הזו עושה שריר ה-SCM (sternocleidomastoid) בצד ה${SIDE[m]}, הצד הנגדי, והעצב הנלווה (XI) שלו פגוע.`;
    return `את הראש ${SIDE_DIR[d]} מסובב שריר ה-SCM (sternocleidomastoid) בצד ה${SIDE[m]}, הצד הנגדי (מודגש באיור). כל SCM מסובב את הסנטר לצד השני.` + (xi ? ` הפגיעה ב-XI היא בצד ה${SIDE[xi]}, ולכן התנועה הזו תקינה. הסיבוב שייחלש הוא ${SIDE_DIR[OTHER[xi]]}.` : '');
  }
  return '';
}

const TIPS = {
  rest: 'כלל שכדאי לזכור: הענבל נמשך לצד הבריא, והלשון סוטה לצד הפגוע.',
  aah: 'בבדיקה מבקשים לפתוח את הפה ולומר "אההה", ומסתכלים אם שני צדי החך עולים באותה מידה.',
  tongue: 'הלשון סוטה לכיוון הצד הפגוע. זה הפוך מהענבל, שנמשך לכיוון הצד הבריא.',
  'gag-R': 'רפלקס ההקאה בודק שני עצבים: IX מרגיש, X מבצע. בודקים כל צד בנפרד.',
  'gag-L': 'רפלקס ההקאה בודק שני עצבים: IX מרגיש, X מבצע. בודקים כל צד בנפרד.',
  shrug: 'בבדיקה מבקשים להרים כתפיים נגד התנגדות של הבודק.',
  'turn-R': 'שריר ה-SCM מסובב את הראש לצד הנגדי. לכן פגיעה ב-XI מימין מחלישה את הסיבוב שמאלה.',
  'turn-L': 'שריר ה-SCM מסובב את הראש לצד הנגדי. לכן פגיעה ב-XI משמאל מחלישה את הסיבוב ימינה.',
};

// ---------- פקדים ----------
const controls = document.createElement('div');
controls.className = 'lab-controls';
controls.innerHTML = `
  <fieldset class="chip-set"><legend>מה לבקש</legend>
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
stageWrap.append(mouthSvg, neckSvg);
const layout = document.createElement('div');
layout.className = 'lab-layout';
layout.append(stageWrap, controls, readout);
root.append(layout);

function update() {
  const view = action.view;
  mouthSvg.style.display = view === 'mouth' ? '' : 'none';
  neckSvg.style.display = view === 'neck' ? '' : 'none';
  mouthSvg.setAttribute('aria-label', 'הפה פתוח, במבט מלפנים: החך הרך, הענבל והלשון. הצד הימני של האדם מופיע משמאל.');
  neckSvg.setAttribute('aria-label', 'הראש, הצוואר והכתפיים במבט מלפנים: השריר הטרפזי ושריר ה-SCM בכל צד. הצד הימני של האדם מופיע משמאל.');
  animateTo(target());
  document.getElementById('explain').textContent = explain();
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

draw(cur);
update();
