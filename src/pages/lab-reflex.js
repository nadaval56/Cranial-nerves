// מעגלי רפלקס: עצב קולט מביא את הגירוי לגזע המוח, ומשם פקודה יוצאת דרך עצב מבצע לשני הצדדים.
// המודל: יש תגובה בצד מסוים אם המידע נכנס (העצב הקולט בצד המגורה תקין) והעצב המבצע של אותו צד תקין.
// ברפלקס הלסת אותו עצב (V3) גם מרגיש וגם מבצע, וההקשה על הסנטר באמצע, ולכן הפגיעה היא "V ימין" או "V שמאל".
// ימין ושמאל = של האדם; בפנים מול הצופה, הצד הימני של האדם מופיע משמאל.

import { s } from '../lib/dom.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const HE_F = { R: 'הימנית', L: 'השמאלית' };
const HE_M = { R: 'הימני', L: 'השמאלי' };
const SIDE = { R: 'ימין', L: 'שמאל' };
const other = (e) => (e === 'R' ? 'L' : 'R');

const REFLEXES = {
  corneal: {
    label: 'רפלקס הקרנית',
    aff: { n: 'V1', full: 'הענף העיני של העצב התלת-ראשי (V1)', short: 'V1' },
    eff: { n: 'VII', full: 'עצב הפנים (VII)', short: 'עצב הפנים' },
    trig: { R: 'נגיעה בקרנית הימנית', L: 'נגיעה בקרנית השמאלית' },
    stim: (e) => `נגעתם בקרנית ${HE_F[e]}`,
    part: (e) => `העין ${HE_F[e]}`, yes: 'ממצמצת', no: 'לא ממצמצת',
    both: 'לכן שתי העיניים ממצמצות: זו שנגעתם בה (תגובה ישירה) וגם השנייה (תגובה עקיפה).',
  },
  gag: {
    label: 'רפלקס ההקאה',
    aff: { n: 'IX', full: 'העצב הלשוני-לועי (IX)', short: 'העצב הלשוני-לועי' },
    eff: { n: 'X', full: 'העצב התועה (X)', short: 'העצב התועה' },
    trig: { R: 'נגיעה בלוע מימין', L: 'נגיעה בלוע משמאל' },
    stim: (e) => `נגעתם בדופן הלוע בצד ${SIDE[e]}`,
    part: (e) => `החך בצד ${SIDE[e]}`, yes: 'עולה', no: 'לא עולה',
    both: 'לכן שרירי הלוע מתכווצים, והחך עולה בשני הצדדים באופן שווה. הענבל נשאר באמצע.',
    effExtra: (bad) => ` הענבל נמשך לצד ${SIDE[other(bad)]}, הצד הבריא, כי רק שם השרירים עובדים.`,
  },
  stapedius: {
    label: 'רפלקס שריר הארכובה',
    aff: { n: 'VIII', full: 'עצב השמיעה (VIII)', short: 'עצב השמיעה' },
    eff: { n: 'VII', full: 'עצב הפנים (VII)', short: 'עצב הפנים' },
    trig: { R: 'צליל חזק באוזן הימנית', L: 'צליל חזק באוזן השמאלית' },
    stim: (e) => `השמעתם צליל חזק באוזן ${HE_F[e]}`,
    part: (e) => `שריר הארכובה ${HE_M[e]}`, yes: 'מתכווץ', no: 'לא מתכווץ',
    both: 'לכן שריר הארכובה (stapedius) מתכווץ בשתי האוזניים, גם באוזן שלא שמעה את הצליל, ומרסן את עצמות השמע.',
    effExtra: () => ' בלי השריר הזה, צלילים חזקים נשמעים באוזן הזו חזקים מדי.',
  },
  jaw: {
    label: 'רפלקס הלסת',
    aff: { n: 'V3', full: 'העצב התלת-ראשי (V3)', short: 'V3' },
    eff: { n: 'V3', full: 'העצב התלת-ראשי (V3)', short: 'V3' },
    trig: { M: 'הקשה על הסנטר' },
    part: (e) => `שריר המעסה ${HE_M[e]}`, yes: 'מתכווץ', no: 'לא מתכווץ',
  },
};

let reflex = 'corneal';
let lesion = 'none'; // aff-R / aff-L / eff-R / eff-L, ובלסת: V-R / V-L

function lesionsFor(id) {
  const r = REFLEXES[id];
  if (id === 'jaw') return [{ id: 'none', label: 'בלי פגיעה' }, { id: 'V-R', label: 'V3 ימין' }, { id: 'V-L', label: 'V3 שמאל' }];
  return [
    { id: 'none', label: 'בלי פגיעה' },
    { id: 'aff-R', label: `${r.aff.n} ימין (קולט)` }, { id: 'aff-L', label: `${r.aff.n} שמאל (קולט)` },
    { id: 'eff-R', label: `${r.eff.n} ימין (מבצע)` }, { id: 'eff-L', label: `${r.eff.n} שמאל (מבצע)` },
  ];
}

// ---------- במה ----------

const W = 640, H = 450;
const C = { x: 320, y: 404 }; // גזע המוח
const svg = s('svg', { class: 'rx-stage', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'פנים מלפנים, גזע המוח מתחתן, והמסלול של הרפלקס: עצב קולט אל גזע המוח ועצבים מבצעים לשני הצדדים', direction: 'ltr' });

const STYLE = `
.rx-stage .rx-skin { fill: url(#rx-skin); }
.rx-stage .rx-shade { fill: url(#rx-shade); }
.rx-stage .rx-hair { fill: url(#rx-hair); }
.rx-stage .rx-ear { fill: url(#rx-ear); stroke: #8a5845; stroke-width: 1.2; }
.rx-stage .rx-ear-in { fill: none; stroke: #8a5845; stroke-width: 1.4; opacity: 0.6; }
.rx-stage .rx-brow { fill: #4a3022; }
.rx-stage .rx-sclera { fill: #f6f1ec; }
.rx-stage .rx-iris { fill: url(#rx-iris); }
.rx-stage .rx-pupil { fill: #0a0c0e; }
.rx-stage .rx-eyeline { fill: none; stroke: #5b3a2c; stroke-width: 1.4; }
.rx-stage .rx-lid { fill: #c99377; stroke: #5b3a2c; stroke-width: 1.4; transform-box: fill-box; transform-origin: 50% 0%; transform: scaleY(0.12); transition: transform 0.14s ease-out; }
.rx-stage .rx-lid.is-closed { transform: scaleY(1); }
.rx-stage .rx-nose { fill: none; stroke: #8f5d48; stroke-width: 1.6; stroke-linecap: round; opacity: 0.55; }
.rx-stage .rx-lips { fill: #b8615a; }
.rx-stage .rx-mouth-open { fill: #3a1416; stroke: #8e4a45; stroke-width: 2; }
.rx-stage .rx-palate { fill: none; stroke: #e9a39b; stroke-width: 3; stroke-linecap: round; transition: transform 0.25s ease-out; }
.rx-stage .rx-uvula { fill: #e48f88; transition: transform 0.25s ease-out; }
.rx-stage .rx-throat { fill: #5a1d20; }
.rx-stage .rx-masseter { fill: #d77f6e; opacity: 0; transition: opacity 0.2s; }
.rx-stage .rx-masseter.is-on { opacity: 0.55; }
.rx-stage .rx-earglow { fill: none; stroke: var(--nerve, #f0c46b); stroke-width: 3; opacity: 0; transition: opacity 0.2s; }
.rx-stage .rx-earglow.is-on { opacity: 1; }
.rx-stage .rx-stem { fill: url(#rx-stem); stroke: #3b4452; stroke-width: 1.2; }
.rx-stage .rx-stem-text { fill: #c9d1db; font-size: 13px; text-anchor: middle; }
.rx-stage .rx-seg { fill: none; stroke-width: 4; stroke-linecap: round; opacity: 0.35; }
.rx-stage .rx-seg-under { fill: none; stroke: #0b0e12; stroke-width: 7; stroke-linecap: round; opacity: 0.55; }
.rx-stage .rx-aff { stroke: var(--t-sensory, #7cc7dc); }
.rx-stage .rx-eff { stroke: var(--t-motor, #ef9a8f); }
.rx-stage .rx-seg.is-on { opacity: 1; }
.rx-stage .rx-inter { fill: none; stroke: #e8ecf1; stroke-width: 2.5; stroke-dasharray: 4 4; opacity: 0.3; }
.rx-stage .rx-inter.is-on { opacity: 0.95; }
.rx-stage .rx-seg-label { font-size: 13px; font-weight: 700; font-family: Georgia, serif; paint-order: stroke; stroke: #0b0e12; stroke-width: 4px; stroke-linejoin: round; }
.rx-stage .rx-seg-label.rx-aff { fill: var(--t-sensory, #7cc7dc); stroke: #0b0e12; }
.rx-stage .rx-seg-label.rx-eff { fill: var(--t-motor, #ef9a8f); stroke: #0b0e12; }
.rx-stage .rx-break { stroke: #ff6b5e; stroke-width: 3.5; stroke-linecap: round; display: none; }
.rx-stage .rx-break circle { fill: #2a1414; stroke: #ff6b5e; stroke-width: 2; }
.rx-stage .rx-break.is-on { display: inline; }
.rx-stage .rx-stim { fill: var(--nerve, #f0c46b); stroke: #0b0e12; stroke-width: 2; opacity: 0; }
.rx-stage .rx-stim.is-on { opacity: 1; }
.rx-stage .rx-dot { fill: #fff; filter: drop-shadow(0 0 4px #fff); opacity: 0; }
.rx-stage .rx-mark { font-size: 24px; font-weight: 700; text-anchor: middle; paint-order: stroke; stroke: #0b0e12; stroke-width: 4px; stroke-linejoin: round; }
.rx-stage .rx-mark.is-yes { fill: #8fe0a8; }
.rx-stage .rx-mark.is-no { fill: #ff8a80; }
.rx-stage .rx-side { fill: #9aa4b2; font-size: 12px; text-anchor: middle; }
.rx-stage [hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .rx-stage * { transition: none !important; } }
html.a11y-still .rx-stage * { transition: none !important; }
`;

const grad = (id, kind, attrs, stops) => s(kind, { id, ...attrs }, ...stops.map(([o, c, op = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })));
svg.append(s('defs', {},
  s('style', {}, document.createTextNode(STYLE)),
  grad('rx-skin', 'radialGradient', { cx: '50%', cy: '42%', r: '62%' }, [['0', '#e2b597'], ['0.6', '#cf9c7e'], ['1', '#a8705a']]),
  grad('rx-shade', 'radialGradient', { cx: '50%', cy: '40%', r: '55%' }, [['0.65', '#5a3426', 0], ['1', '#5a3426', 0.4]]),
  grad('rx-hair', 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#3e2a1f'], ['1', '#20150f']]),
  grad('rx-ear', 'radialGradient', { cx: '50%', cy: '45%', r: '60%' }, [['0', '#d29f81'], ['1', '#a06a53']]),
  grad('rx-iris', 'radialGradient', {}, [['0', '#6fa4b2'], ['0.6', '#4f8696'], ['1', '#244852']]),
  grad('rx-stem', 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#2a313b'], ['1', '#1a1f26']]),
));
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));

// ---------- הפנים ----------
const FACE = { cx: 320, cy: 158, rx: 112, ry: 136 };
const EYES = { R: { x: 274, y: 132 }, L: { x: 366, y: 132 } };
const EARS = { R: { x: 206, y: 160 }, L: { x: 434, y: 160 } };
const MOUTH = { x: 320, y: 232 };

const face = s('g', {});
// אוזניים מאחורי הראש
const earGlow = {};
for (const e of ['R', 'L']) {
  const { x, y } = EARS[e], k = e === 'R' ? -1 : 1;
  face.append(s('path', { class: 'rx-ear', d: `M${x - k * 4} ${y - 30} C${x + k * 22} ${y - 34} ${x + k * 24} ${y + 4} ${x + k * 12} ${y + 22} C${x + k * 6} ${y + 32} ${x - k * 4} ${y + 30} ${x - k * 6} ${y + 22} Z` }));
  face.append(s('path', { class: 'rx-ear-in', d: `M${x + k * 2} ${y - 20} C${x + k * 14} ${y - 20} ${x + k * 14} ${y + 2} ${x + k * 6} ${y + 12}` }));
  earGlow[e] = s('circle', { class: 'rx-earglow', cx: x + k * 6, cy: y - 2, r: 20 });
  face.append(earGlow[e]);
}
face.append(s('path', { d: `M290 280 L290 318 L350 318 L350 280 Z`, fill: '#a8705a' })); // צוואר
face.append(s('ellipse', { class: 'rx-skin', cx: FACE.cx, cy: FACE.cy, rx: FACE.rx, ry: FACE.ry }));
face.append(s('ellipse', { class: 'rx-shade', cx: FACE.cx, cy: FACE.cy, rx: FACE.rx, ry: FACE.ry }));
face.append(s('path', { class: 'rx-hair', d: `M${FACE.cx - FACE.rx + 2} 132 C${FACE.cx - FACE.rx - 4} 50 ${FACE.cx - 60} 18 ${FACE.cx} 20 C${FACE.cx + 60} 18 ${FACE.cx + FACE.rx + 4} 50 ${FACE.cx + FACE.rx - 2} 132 C${FACE.cx + 88} 92 ${FACE.cx + 50} 70 ${FACE.cx} 72 C${FACE.cx - 50} 70 ${FACE.cx - 88} 92 ${FACE.cx - FACE.rx + 2} 132 Z` }));
// שרירי המעסה (מוסתרים, נדלקים ברפלקס הלסת)
const masseter = {};
for (const e of ['R', 'L']) {
  masseter[e] = s('ellipse', { class: 'rx-masseter', cx: e === 'R' ? 240 : 400, cy: 236, rx: 18, ry: 30 });
  face.append(masseter[e]);
}
// עיניים
const lids = {};
for (const e of ['R', 'L']) {
  const { x, y } = EYES[e], k = e === 'R' ? 1 : -1;
  const almond = `M${x - 26} ${y} C${x - 14} ${y - 15} ${x + 14} ${y - 15} ${x + 26} ${y} C${x + 14} ${y + 12} ${x - 14} ${y + 12} ${x - 26} ${y} Z`;
  face.append(s('path', { class: 'rx-brow', d: `M${x + k * 26} ${y - 22} C${x + k * 6} ${y - 34} ${x - k * 20} ${y - 32} ${x - k * 30} ${y - 22} C${x - k * 18} ${y - 26} ${x + k * 6} ${y - 27} ${x + k * 26} ${y - 17} Z` }));
  face.append(s('path', { class: 'rx-sclera', d: almond }));
  face.append(s('circle', { class: 'rx-iris', cx: x, cy: y - 1, r: 9.5 }));
  face.append(s('circle', { class: 'rx-pupil', cx: x, cy: y - 1, r: 4 }));
  face.append(s('circle', { cx: x + 3, cy: y - 4, r: 1.8, fill: '#fff', opacity: 0.85 }));
  lids[e] = s('path', { class: 'rx-lid', d: `M${x - 27} ${y - 1} C${x - 14} ${y - 16} ${x + 14} ${y - 16} ${x + 27} ${y - 1} C${x + 14} ${y + 13} ${x - 14} ${y + 13} ${x - 27} ${y - 1} Z` });
  face.append(lids[e]);
  face.append(s('path', { class: 'rx-eyeline', d: almond }));
}
face.append(s('path', { class: 'rx-nose', d: 'M312 136 C310 160 304 180 306 196 C312 202 328 202 334 196 C336 180 330 160 328 136' }));
// פה סגור / פה פתוח (ברפלקס ההקאה)
const mouthClosed = s('g', {},
  s('path', { class: 'rx-lips', d: `M${MOUTH.x - 30} ${MOUTH.y} C${MOUTH.x - 14} ${MOUTH.y - 8} ${MOUTH.x - 4} ${MOUTH.y - 4} ${MOUTH.x} ${MOUTH.y - 2} C${MOUTH.x + 4} ${MOUTH.y - 4} ${MOUTH.x + 14} ${MOUTH.y - 8} ${MOUTH.x + 30} ${MOUTH.y} C${MOUTH.x + 14} ${MOUTH.y + 12} ${MOUTH.x - 14} ${MOUTH.y + 12} ${MOUTH.x - 30} ${MOUTH.y} Z` }),
  s('path', { d: `M${MOUTH.x - 30} ${MOUTH.y} C${MOUTH.x - 10} ${MOUTH.y + 3} ${MOUTH.x + 10} ${MOUTH.y + 3} ${MOUTH.x + 30} ${MOUTH.y}`, fill: 'none', stroke: '#6e2f2b', 'stroke-width': 1.5 }));
const palate = {};
const uvula = s('path', { class: 'rx-uvula', d: `M${MOUTH.x - 4} ${MOUTH.y - 12} C${MOUTH.x - 4} ${MOUTH.y - 2} ${MOUTH.x - 3} ${MOUTH.y + 2} ${MOUTH.x} ${MOUTH.y + 3} C${MOUTH.x + 3} ${MOUTH.y + 2} ${MOUTH.x + 4} ${MOUTH.y - 2} ${MOUTH.x + 4} ${MOUTH.y - 12} Z` });
const mouthOpen = s('g', { hidden: '' },
  s('ellipse', { class: 'rx-mouth-open', cx: MOUTH.x, cy: MOUTH.y + 4, rx: 38, ry: 26 }),
  s('ellipse', { class: 'rx-throat', cx: MOUTH.x, cy: MOUTH.y + 10, rx: 20, ry: 14 }));
for (const e of ['R', 'L']) {
  const k = e === 'R' ? -1 : 1;
  palate[e] = s('path', { class: 'rx-palate', d: `M${MOUTH.x} ${MOUTH.y - 12} C${MOUTH.x + k * 10} ${MOUTH.y - 14} ${MOUTH.x + k * 24} ${MOUTH.y - 8} ${MOUTH.x + k * 30} ${MOUTH.y + 10}` });
  mouthOpen.append(palate[e]);
}
mouthOpen.append(uvula);
face.append(mouthClosed, mouthOpen);
svg.append(face);

// תוויות צד
svg.append(s('text', { class: 'rx-side', x: 150, y: 30 }, document.createTextNode('הצד הימני שלו')));
svg.append(s('text', { class: 'rx-side', x: 490, y: 30 }, document.createTextNode('הצד השמאלי שלו')));

// ---------- גזע המוח והמסלולים ----------
svg.append(s('rect', { class: 'rx-stem', x: C.x - 70, y: C.y - 26, width: 140, height: 48, rx: 14 }));
svg.append(s('text', { class: 'rx-stem-text', x: C.x, y: C.y + 4 }, document.createTextNode('גזע המוח')));
const inter = s('path', { class: 'rx-inter', d: `M${C.x - 52} ${C.y - 14} L${C.x + 52} ${C.y - 14}` });
svg.append(inter);

const circuit = s('g', {});
svg.append(circuit);
const marks = { R: s('text', { class: 'rx-mark', x: 0, y: 0 }), L: s('text', { class: 'rx-mark', x: 0, y: 0 }) };
const stimDots = { R: s('circle', { class: 'rx-stim', r: 7 }), L: s('circle', { class: 'rx-stim', r: 7 }), M: s('circle', { class: 'rx-stim', r: 7 }) };
const dot = s('circle', { class: 'rx-dot', r: 5.5 });
const dot2 = s('circle', { class: 'rx-dot', r: 5.5 });
svg.append(marks.R, marks.L, stimDots.R, stimDots.L, stimDots.M, dot, dot2);

// נקודות הגירוי והתגובה לכל רפלקס (בקואורדינטות הבמה)
function geometry(id) {
  const k = (e) => (e === 'R' ? -1 : 1);
  if (id === 'corneal') return {
    stim: { R: { x: EYES.R.x + 6, y: EYES.R.y + 6 }, L: { x: EYES.L.x - 6, y: EYES.L.y + 6 } },
    from: (e) => ({ x: EYES[e].x + k(e) * 10, y: EYES[e].y + 12 }),
    to: (e) => ({ x: EYES[e].x + k(e) * 26, y: EYES[e].y }),
    mark: (e) => ({ x: EYES[e].x, y: EYES[e].y - 42 }),
  };
  if (id === 'gag') return {
    stim: { R: { x: MOUTH.x - 14, y: MOUTH.y + 12 }, L: { x: MOUTH.x + 14, y: MOUTH.y + 12 } },
    from: (e) => ({ x: MOUTH.x + k(e) * 16, y: MOUTH.y + 20 }),
    to: (e) => ({ x: MOUTH.x + k(e) * 30, y: MOUTH.y + 6 }),
    mark: (e) => ({ x: MOUTH.x + k(e) * 70, y: MOUTH.y - 16 }),
  };
  if (id === 'stapedius') return {
    stim: { R: { x: EARS.R.x - 26, y: EARS.R.y - 6 }, L: { x: EARS.L.x + 26, y: EARS.L.y - 6 } },
    from: (e) => ({ x: EARS[e].x + k(e) * 6, y: EARS[e].y + 22 }),
    to: (e) => ({ x: EARS[e].x - k(e) * 2, y: EARS[e].y + 8 }),
    mark: (e) => ({ x: EARS[e].x + k(e) * 4, y: EARS[e].y - 44 }),
  };
  return { // jaw
    stim: { M: { x: MOUTH.x, y: 286 } },
    from: (e) => ({ x: (e === 'R' ? 240 : 400), y: 262 }),
    to: (e) => ({ x: (e === 'R' ? 240 : 400), y: 214 }),
    mark: (e) => ({ x: (e === 'R' ? 196 : 444), y: 242 }),
  };
}

let segs = {};
let breaks = {};
function buildCircuit() {
  circuit.replaceChildren();
  segs = {}; breaks = {};
  const g = geometry(reflex);
  const r = REFLEXES[reflex];
  for (const e of ['R', 'L']) {
    const k = e === 'R' ? -1 : 1;
    const f = g.from(e), t = g.to(e);
    const affPort = { x: C.x + k * 52, y: C.y - 14 };
    const effPort = { x: C.x + k * 30, y: C.y - 26 };
    const aff = `M${f.x} ${f.y} C${f.x + k * 120} ${f.y + 60} ${C.x + k * 200} ${C.y - 10} ${affPort.x} ${affPort.y}`;
    const eff = `M${effPort.x} ${effPort.y} C${C.x + k * 60} ${C.y - 90} ${t.x + k * 70} ${t.y + 70} ${t.x} ${t.y}`;
    for (const [key, d, cls] of [[`aff-${e}`, aff, 'rx-aff'], [`eff-${e}`, eff, 'rx-eff']]) {
      circuit.append(s('path', { class: 'rx-seg-under', d }));
      segs[key] = s('path', { class: `rx-seg ${cls}`, d });
      circuit.append(segs[key]);
    }
  }
  // תוויות ושברים באמצע כל מקטע
  for (const [key, path] of Object.entries(segs)) {
    const L = path.getTotalLength();
    const m = path.getPointAtLength(L * 0.62);
    const lp = path.getPointAtLength(L * 0.32);
    const isAff = key.startsWith('aff');
    const name = isAff ? r.aff.n : r.eff.n;
    const dx = (key.endsWith('R') ? -1 : 1) * (isAff ? 20 : -20);
    circuit.append(s('text', { class: `rx-seg-label ${isAff ? 'rx-aff' : 'rx-eff'}`, x: lp.x + dx, y: lp.y + 4, 'text-anchor': 'middle' }, document.createTextNode(name)));
    breaks[key] = s('g', { class: 'rx-break', transform: `translate(${m.x} ${m.y})` }, s('circle', { r: 10 }), s('path', { d: 'M-5 -5 L5 5 M5 -5 L-5 5' }));
    circuit.append(breaks[key]);
  }
  for (const [e, p] of Object.entries(g.stim)) { stimDots[e].setAttribute('cx', p.x); stimDots[e].setAttribute('cy', p.y); }
  for (const e of ['R', 'L']) { const p = g.mark(e); marks[e].setAttribute('x', p.x); marks[e].setAttribute('y', p.y); }
  mouthOpen.toggleAttribute('hidden', reflex !== 'gag');
  mouthClosed.toggleAttribute('hidden', reflex === 'gag');
}

// ---------- פקדים ----------
const controls = document.createElement('div');
controls.className = 'lab-controls';
const readout = document.createElement('div');
readout.className = 'lab-readout';
readout.innerHTML = `<dl class="pupil-read">
    <div><dt>הצד הימני</dt><dd id="rx-read-R">-</dd></div>
    <div><dt>הצד השמאלי</dt><dd id="rx-read-L">-</dd></div>
  </dl>
  <p class="lab-explain" id="rx-explain" role="status" aria-live="polite"></p>`;

function renderControls() {
  const r = REFLEXES[reflex];
  const trig = Object.entries(r.trig).map(([side, label]) => `<button type="button" class="btn btn-primary rx-trigger" data-trig="${side}">${label}</button>`).join('');
  controls.innerHTML = `
    <fieldset class="chip-set"><legend>הרפלקס</legend>
      ${Object.entries(REFLEXES).map(([id, x]) => `<button type="button" class="chip" data-reflex="${id}" aria-pressed="${id === reflex}">${x.label}</button>`).join('')}
    </fieldset>
    <fieldset class="chip-set"><legend>פגיעה בעצב <span class="muted">(ימין ושמאל של האדם)</span></legend>
      ${lesionsFor(reflex).map((l) => `<button type="button" class="chip" data-lesion="${l.id}" aria-pressed="${l.id === lesion}">${l.label}</button>`).join('')}
    </fieldset>
    <div class="rx-triggers" role="group" aria-label="הפעלת הרפלקס">${trig}</div>`;
}

const stageWrap = document.createElement('div');
stageWrap.className = 'lab-stage';
stageWrap.append(svg);
const layout = document.createElement('div');
layout.className = 'lab-layout';
layout.append(stageWrap, controls, readout);
root.append(layout);

// ---------- מודל ----------
function intact(kind, e) {
  if (reflex === 'jaw') return lesion !== `V-${e}`;
  return lesion !== `${kind}-${e}`;
}

function outcome(trig) {
  if (reflex === 'jaw') {
    // ההקשה מותחת את שני שרירי המעסה; כל צד שהעצב שלו תקין מעביר ומבצע
    const input = intact('aff', 'R') || intact('aff', 'L');
    return { input, resp: { R: input && intact('eff', 'R'), L: input && intact('eff', 'L') } };
  }
  const input = intact('aff', trig);
  return { input, resp: { R: input && intact('eff', 'R'), L: input && intact('eff', 'L') } };
}

function explain(trig, out) {
  const r = REFLEXES[reflex];
  if (reflex === 'jaw') {
    if (lesion === 'none') return 'הקשתם על הסנטר. המתיחה של שרירי הלעיסה עוברת דרך V3 לגזע המוח, והפקודה חוזרת דרך V3 לשני שרירי המעסה, והלסת נסגרת מעט. אצל רוב הבריאים הרפלקס הזה חלש מאוד. רפלקס לסת ער במיוחד מרמז על פגיעה במוח מעל גזע המוח, בשני הצדדים.';
    const bad = lesion.slice(-1);
    return `הקשתם על הסנטר. כאן אותו עצב, V3, גם מרגיש וגם מבצע. V3 ${HE_M[bad]} פגוע, ולכן שריר המעסה ${HE_M[bad]} לא מתכווץ, והלסת נסגרת רק בכוח הצד ${HE_M[other(bad)]}.`;
  }
  const st = r.stim(trig);
  const [kind, bad] = lesion === 'none' ? [null, null] : lesion.split('-');
  if (!out.input) {
    return `${st}, אבל ${r.aff.full} ${HE_M[trig]} פגוע, והמידע לא מגיע לגזע המוח. לכן אין תגובה בשום צד. נסו לגרות את הצד השני: שם הרפלקס יעבוד בשני הצדדים. כך נראית פגיעה בצד הקולט.`;
  }
  let t = `${st}. ${r.aff.full} מעביר את המידע לגזע המוח, ומשם יוצאת פקודה דרך ${r.eff.full} לשני הצדדים.`;
  if (kind === 'eff') {
    t += ` אבל ${r.eff.short} ${HE_M[bad]} פגוע, ולכן ${r.part(bad)} ${r.no}, ו${r.part(other(bad))} ${r.yes}.`;
    t += r.effExtra ? r.effExtra(bad) : '';
    t += ' בפגיעה בצד המבצע, הצד הפגוע לא מגיב, לא משנה באיזה צד מגרים.';
    return t;
  }
  t += ` ${r.both}`;
  if (kind === 'aff') t += ` הפגיעה ב-${r.aff.n} ${HE_M[bad]} לא משנה כאן, כי גיריתם את הצד התקין.`;
  return t;
}

// ---------- תצוגה ----------
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
let anim = null;
function stopAnim() { if (anim) { cancelAnimationFrame(anim.raf); clearTimeout(anim.t); anim = null; } dot.style.opacity = 0; dot2.style.opacity = 0; }

function clearResult() {
  stopAnim();
  for (const e of ['R', 'L']) {
    marks[e].textContent = '';
    lids[e].classList.remove('is-closed');
    masseter[e].classList.remove('is-on');
    earGlow[e].classList.remove('is-on');
    palate[e].style.transform = '';
    document.getElementById(`rx-read-${e}`).textContent = '-';
  }
  uvula.style.transform = '';
  Object.values(stimDots).forEach((d) => d.classList.remove('is-on'));
  Object.values(segs).forEach((p) => p.classList.remove('is-on'));
  inter.classList.remove('is-on');
}

function showLesion() {
  for (const [key, b] of Object.entries(breaks)) {
    const [kind, e] = key.split('-');
    b.classList.toggle('is-on', !intact(kind, e));
  }
}

function showResponse(trig, out) {
  const r = REFLEXES[reflex];
  for (const e of ['R', 'L']) {
    const yes = out.resp[e];
    marks[e].textContent = yes ? '✓' : '✗';
    marks[e].setAttribute('class', `rx-mark ${yes ? 'is-yes' : 'is-no'}`);
    document.getElementById(`rx-read-${e}`).textContent = `${r.part(e)} ${yes ? r.yes : r.no}`;
    if (reflex === 'corneal' && yes) {
      lids[e].classList.add('is-closed');
      if (!reduced()) setTimeout(() => lids[e].classList.remove('is-closed'), 420);
    }
    if (reflex === 'jaw') masseter[e].classList.toggle('is-on', yes);
    if (reflex === 'stapedius') earGlow[e].classList.toggle('is-on', yes);
    if (reflex === 'gag') palate[e].style.transform = yes ? 'translateY(-5px)' : '';
  }
  if (reflex === 'gag') {
    const shift = out.resp.R === out.resp.L ? 0 : out.resp.R ? -6 : 6; // הענבל נמשך לצד שעובד (במסך: ימין האדם משמאל)
    uvula.style.transform = out.resp.R || out.resp.L ? `translate(${shift}px, -5px)` : '';
  }
  document.getElementById('rx-explain').textContent = explain(trig, out);
}

function lightPaths(trig, out) {
  if (reflex === 'jaw') { segs['aff-R'].classList.toggle('is-on', intact('aff', 'R')); segs['aff-L'].classList.toggle('is-on', intact('aff', 'L')); }
  else segs[`aff-${trig}`].classList.toggle('is-on', out.input);
  inter.classList.toggle('is-on', out.input);
  for (const e of ['R', 'L']) segs[`eff-${e}`].classList.toggle('is-on', out.input);
}

// אות שנע לאורך מקטע (או שניים בבת אחת); אחרי זה ממשיכים
function travel(paths, dur, done) {
  const lens = paths.map((p) => (p ? p.getTotalLength() : 0));
  const dots = [dot, dot2];
  const t0 = performance.now();
  const step = (now) => {
    if (!anim) return;
    const k = Math.min(1, (now - t0) / dur);
    paths.forEach((p, i) => {
      if (!p) return;
      const pt = p.getPointAtLength(lens[i] * k);
      dots[i].setAttribute('cx', pt.x); dots[i].setAttribute('cy', pt.y); dots[i].style.opacity = 1;
    });
    if (k < 1) anim.raf = requestAnimationFrame(step);
    else { dots.forEach((d) => { d.style.opacity = 0; }); done(); }
  };
  anim.raf = requestAnimationFrame(step);
}

function trigger(trig) {
  clearResult();
  showLesion();
  const out = outcome(trig);
  stimDots[trig].classList.add('is-on');
  const finish = () => { lightPaths(trig, out); showResponse(trig, out); anim = null; };
  if (reduced()) { finish(); return; }
  anim = {};
  // קולט: עד השבר (אם יש) או עד גזע המוח
  const affPaths = reflex === 'jaw' ? [intact('aff', 'R') ? segs['aff-R'] : null, intact('aff', 'L') ? segs['aff-L'] : null] : [out.input ? segs[`aff-${trig}`] : null];
  if (reflex !== 'jaw') segs[`aff-${trig}`].classList.add('is-on');
  else { segs['aff-R'].classList.add('is-on'); segs['aff-L'].classList.add('is-on'); }
  if (!out.input) { // האות נעצר בשבר
    anim.t = setTimeout(finish, 450);
    return;
  }
  travel(affPaths, 480, () => {
    inter.classList.add('is-on');
    anim.t = setTimeout(() => {
      segs['eff-R'].classList.add('is-on'); segs['eff-L'].classList.add('is-on');
      travel([segs['eff-R'], segs['eff-L']], 480, finish);
    }, 120);
  });
}

function setReflex(id) {
  reflex = id;
  lesion = 'none';
  renderControls();
  buildCircuit();
  clearResult();
  showLesion();
  document.getElementById('rx-explain').textContent = `בחרו פגיעה (או השאירו בלי פגיעה), ולחצו על ${Object.values(REFLEXES[id].trig).join(' או על ')}.`;
}

controls.addEventListener('click', (e) => {
  const rf = e.target.closest('[data-reflex]');
  if (rf) { setReflex(rf.dataset.reflex); controls.querySelector(`[data-reflex="${rf.dataset.reflex}"]`)?.focus(); return; }
  const les = e.target.closest('[data-lesion]');
  if (les) {
    lesion = les.dataset.lesion;
    controls.querySelectorAll('[data-lesion]').forEach((c) => c.setAttribute('aria-pressed', String(c === les)));
    clearResult();
    showLesion();
    return;
  }
  const tr = e.target.closest('[data-trig]');
  if (tr) trigger(tr.dataset.trig);
});

setReflex('corneal');
