// רפלקס האישון לאור: פנס לעין אחת, ושני האישונים מגיבים.
// המודל: האור "נכנס" למוח רק דרך עצב II תקין של העין המוארת. המרכז ברפלקס (באזור הפרה-טקטלי)
// שולח פקודה לשני גרעיני אדינגר-וסטפאל, ומשם — דרך עצב III של כל צד — לאישון של אותו צד.
// הגדלים במ"מ משוערים, להמחשה: חדר מואר למחצה 5, תגובה לאור 2.5, עצב III פגוע 7.
// תסמונת הורנר: המסלול הסימפתטי (שמרחיב את האישון) פגוע, ולכן האישון בצד הזה קטן יותר, ההבדל בולט יותר בחושך,
// והרפלקס לאור תקין (עצבים II ו-III לא נפגעו). צניחת עפעף קלה בלבד.

import { s } from '../lib/dom.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const LESIONS = [
  { id: 'none', label: 'בלי פגיעה' },
  { id: 'II-R', label: 'II ימין' }, { id: 'II-L', label: 'II שמאל' },
  { id: 'III-R', label: 'III ימין' }, { id: 'III-L', label: 'III שמאל' },
  { id: 'H-R', label: 'הורנר ימין' }, { id: 'H-L', label: 'הורנר שמאל' },
];
const AMBIENT = [
  { id: 'normal', label: 'מואר למחצה' },
  { id: 'dim', label: 'עמום' },
];
const LIGHTS = [
  { id: 'off', label: 'כבוי' },
  { id: 'R', label: 'על העין הימנית' },
  { id: 'L', label: 'על העין השמאלית' },
  { id: 'swing', label: 'פנס מתנדנד' },
];
const SIZE = { rest: 5, lit: 2.5, blown: 7 };
// בחדר עמום אישון רגיל מתרחב; אישון עם הורנר כמעט לא
const DIM_REST = 6.5;
const HORNER = { rest: 3.5, dimRest: 4, lit: 2 };

let lesion = 'none';
let ambient = 'normal';
let lightMode = 'off';
let light = 'off'; // איפה הפנס עכשיו (במצב מתנדנד מתחלף)
let swingTimer = null;

// ---------- במה ----------

const W = 640, H = 300;
const EYES = { R: { cx: 220, cy: 120 }, L: { cx: 420, cy: 120 } };
const PX = 2.9; // פיקסלים למ"מ

const svg = s('svg', { class: 'pupil-stage', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'שתי עיניים, פנס, ותרשים של מסלול הרפלקס', direction: 'ltr' });

// סגנון ומעברי צבע של האיור, באותה שפה כמו הפנים במעבדת עצב הפנים. חל רק על האיור הזה.
const STYLE = `
.pupil-stage .px-socket { fill: url(#px-socket); }
.pupil-stage .px-bridge { fill: none; stroke: #9a6650; stroke-width: 1.8; stroke-linecap: round; opacity: 0.38; }
.pupil-stage .px-bridge-hi { fill: #f0cdb4; opacity: 0.3; }
.pupil-stage .px-brow { fill: #4a3022; stroke: #3a251a; stroke-width: 1; stroke-linejoin: round; }
.pupil-stage .eye-white { fill: url(#px-sclera); }
.pupil-stage .px-vessel { fill: none; stroke: #d48a80; stroke-width: 0.7; opacity: 0.35; }
.pupil-stage .iris { fill: url(#px-iris); stroke: none; }
.pupil-stage .px-fiber { stroke: #9cc3cf; stroke-width: 1; opacity: 0.32; }
.pupil-stage .px-fiber-d { stroke: #1f3d47; stroke-width: 1.1; opacity: 0.35; }
.pupil-stage .px-collarette { fill: none; stroke: #b9946a; stroke-width: 1.6; opacity: 0.45; }
.pupil-stage .px-limbus { fill: none; stroke: #16303a; stroke-width: 3; opacity: 0.85; }
.pupil-stage .pupil { fill: #07090b; }
.pupil-stage .glint { fill: #ffffff; opacity: 0.9; }
.pupil-stage .px-glint2 { fill: #ffffff; opacity: 0.45; }
.pupil-stage .px-lid { fill: url(#px-lid); }
.pupil-stage .px-lid-move { transition: transform 0.4s cubic-bezier(0.3, 0.6, 0.2, 1); }
.pupil-stage .px-lidedge { fill: none; stroke: #2a1a14; stroke-width: 3; stroke-linecap: round; }
.pupil-stage .px-lash { fill: none; stroke: #241610; stroke-width: 1.3; stroke-linecap: round; opacity: 0.9; }
.pupil-stage .stage-label { fill: #e8ecf1; paint-order: stroke; stroke: #0b0e12; stroke-width: 4px; stroke-linejoin: round; }
.pupil-stage .px-lidshadow { fill: none; stroke: #5a3426; stroke-width: 6; opacity: 0.18; }
.pupil-stage .eye-line { fill: none; stroke: #6e4636; stroke-width: 1.2; }
.pupil-stage .px-crease { fill: none; stroke: #8a5843; stroke-width: 1.6; stroke-linecap: round; opacity: 0.8; }
.pupil-stage .px-lowlid { fill: none; stroke: #a06c56; stroke-width: 1.3; stroke-linecap: round; opacity: 0.75; }
.pupil-stage .stage-mm { fill: #4a2d20; font-size: 13px; font-weight: 700; }
.pupil-stage .px-mm-bg { fill: #f3dccb; opacity: 0.55; }
@media (prefers-reduced-motion: reduce) { .pupil-stage .px-lid-move { transition: none; } }
html.a11y-still .pupil-stage .px-lid-move { transition: none; }
`;
const grad = (id, kind, attrs, stops) => s(kind, { id, ...attrs }, ...stops.map(([o, c, op = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })));
const defs = s('defs', {},
  s('style', {}, document.createTextNode(STYLE)),
  grad('beam', 'radialGradient', {}, [['0', '#fff7d6', 0.85], ['1', '#fff7d6', 0]]),
  grad('px-socket', 'radialGradient', {}, [['0.4', '#8a5340', 0.45], ['1', '#8a5340', 0]]),
  grad('px-sclera', 'radialGradient', { cx: '50%', cy: '42%', r: '62%' }, [['0', '#fdfaf6'], ['0.7', '#ece4dc'], ['1', '#c9bcb0']]),
  grad('px-iris', 'radialGradient', {}, [['0', '#6fa4b2'], ['0.45', '#4f8696'], ['0.85', '#2e5562'], ['1', '#1d3a44']]),
  grad('px-lid', 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#d8a98b'], ['0.85', '#c48f72'], ['1', '#a06c56']]),
  // העור דוהה בשוליים אל הרקע. הדהייה בתוך מעבר הצבע עצמו, בלי מסכה ובלי טשטוש:
  // מסכה מטושטשת מחושבת מחדש בכל פריים של אנימציה (האישונים, הפנס), ובטלפון זה מאט
  grad('px-skin-fade', 'radialGradient', { cx: '50%', cy: '50%', r: '50%' }, [['0', '#e2b597'], ['0.55', '#d6a587'], ['0.74', '#cc987a'], ['0.88', '#bd8669', 0.55], ['1', '#a8705a', 0]]),
);
svg.append(defs);
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));

// פלג הפנים העליון: עור, גשר האף וצללית סביב העיניים
const face = s('g');
face.append(s('ellipse', { cx: 320, cy: 102, rx: 282, ry: 102, fill: 'url(#px-skin-fade)' }));
for (const side of ['R', 'L']) face.append(s('ellipse', { class: 'px-socket', cx: EYES[side].cx + (side === 'R' ? 8 : -8), cy: EYES[side].cy - 4, rx: 96, ry: 58 }));
face.append(s('ellipse', { class: 'px-bridge-hi', cx: 320, cy: 128, rx: 10, ry: 40 }));
face.append(s('path', { class: 'px-bridge', d: 'M300 86 C306 112 304 146 296 182' }));
face.append(s('path', { class: 'px-bridge', d: 'M340 86 C334 112 336 146 344 182' }));
svg.append(face);

const parts = {};
for (const side of ['R', 'L']) {
  const { cx, cy } = EYES[side];
  // dir: 1 לכיוון האף. העין הימנית של האדם משמאל במסך, ולכן האף מימינה.
  const dir = side === 'R' ? 1 : -1;
  const almond = `M${cx - 70} ${cy} C${cx - 40} ${cy - 46} ${cx + 40} ${cy - 46} ${cx + 70} ${cy} C${cx + 40} ${cy + 44} ${cx - 40} ${cy + 44} ${cx - 70} ${cy} Z`;
  defs.append(s('clipPath', { id: `pclip-${side}` }, s('path', { d: almond })));

  // גבה: עבה ליד האף, דקה בקצה
  const bIn = cx + dir * 58, bOut = cx - dir * 74;
  svg.append(s('path', { class: 'px-brow', d: `M${bIn} ${cy - 54} C${cx + dir * 20} ${cy - 74} ${cx - dir * 40} ${cy - 76} ${bOut} ${cy - 58} C${cx - dir * 40} ${cy - 68} ${cx + dir * 20} ${cy - 64} ${bIn} ${cy - 46} Z` }));
  // קפל העפעף העליון
  svg.append(s('path', { class: 'px-crease', d: `M${cx - 64} ${cy - 16} C${cx - 36} ${cy - 56} ${cx + 36} ${cy - 56} ${cx + 64} ${cy - 16}` }));

  svg.append(s('path', { class: 'eye-white', d: almond }));
  const ball = s('g', { 'clip-path': `url(#pclip-${side})` });
  // כלי דם עדינים בלובן העין
  for (const k of [-1, 1]) ball.append(s('path', { class: 'px-vessel', d: `M${cx + k * 68} ${cy + 2} C${cx + k * 56} ${cy - 2} ${cx + k * 50} ${cy + 6} ${cx + k * 40} ${cy + 3}` }));
  ball.append(s('circle', { class: 'iris iris-big', cx, cy, r: 31 }));
  // מרקם רדיאלי של הקשתית
  const fibers = s('g');
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2 + (i % 2) * 0.03;
    const r0 = 13 + (i % 3), r1 = 28 - (i % 4);
    fibers.append(s('line', { class: i % 3 ? 'px-fiber' : 'px-fiber-d', x1: cx + Math.cos(a) * r0, y1: cy + Math.sin(a) * r0, x2: cx + Math.cos(a) * r1, y2: cy + Math.sin(a) * r1 }));
  }
  ball.append(fibers);
  ball.append(s('circle', { class: 'px-collarette', cx, cy, r: 18 }));
  ball.append(s('circle', { class: 'px-limbus', cx, cy, r: 30.5 }));
  const pupil = s('circle', { class: 'pupil pupil-anim', cx, cy, r: SIZE.rest * PX });
  ball.append(pupil);
  ball.append(s('circle', { class: 'glint', cx: cx + 10, cy: cy - 11, r: 4 }));
  ball.append(s('circle', { class: 'px-glint2', cx: cx - 9, cy: cy + 10, r: 1.8 }));
  // העפעף העליון: זז למטה כשעצב III פגוע (צניחת עפעף)
  const lid = s('g', { class: 'px-lid-move' });
  const edge = `M${cx - 74} ${cy - 2} C${cx - 40} ${cy - 41} ${cx + 40} ${cy - 41} ${cx + 74} ${cy - 2}`;
  lid.append(s('path', { class: 'px-lid', d: `${edge} L${cx + 80} ${cy - 120} L${cx - 80} ${cy - 120} Z` }));
  lid.append(s('path', { class: 'px-lidshadow', d: edge, transform: 'translate(0 3)' }));
  lid.append(s('path', { class: 'px-lidedge', d: edge }));
  ball.append(lid);
  ball.append(s('path', { class: 'px-lowlid', d: `M${cx - 62} ${cy + 8} C${cx - 36} ${cy + 38} ${cx + 36} ${cy + 38} ${cx + 62} ${cy + 8}` }));
  svg.append(ball);
  svg.append(s('path', { class: 'eye-line', d: almond }));
  // ריסים: יוצאים מקו העפעף וזזים איתו
  const lashes = s('g', { class: 'px-lid-move' });
  for (let i = 1; i < 10; i++) {
    const t = i / 10;
    const u = 1 - t;
    const x = u ** 3 * (cx - 74) + 3 * u * u * t * (cx - 40) + 3 * u * t * t * (cx + 40) + t ** 3 * (cx + 74);
    const y = u ** 3 * (cy - 2) + 3 * u * u * t * (cy - 41) + 3 * u * t * t * (cy - 41) + t ** 3 * (cy - 2);
    const lean = (x - cx) / 70;
    const len = 5 + 3 * Math.sin(t * Math.PI);
    lashes.append(s('path', { class: 'px-lash', d: `M${x} ${y} q${lean * 2} ${-len * 0.7} ${lean * 6 + (lean > 0 ? 2 : -2)} ${-len}` }));
  }
  svg.append(lashes);
  const beam = s('ellipse', { class: 'beam', cx, cy, rx: 70, ry: 54, fill: 'url(#beam)' });
  svg.append(beam);
  svg.append(s('text', { class: 'stage-label', x: cx, y: cy + 72, 'text-anchor': 'middle' }, document.createTextNode(side === 'R' ? 'העין הימנית' : 'העין השמאלית')));
  svg.append(s('rect', { class: 'px-mm-bg', x: cx - 34, y: cy - 104, width: 68, height: 22, rx: 11 }));
  const mm = s('text', { class: 'stage-mm', x: cx, y: cy - 88, 'text-anchor': 'middle' });
  svg.append(mm);
  parts[side] = { pupil, lid, lashes, beam, mm };
}

// תרשים המסלול: עין ← II ← מרכז הרפלקס ← III (לשני הצדדים) ← אישון
const circuit = s('g', { class: 'circuit' });
const C = { x: 320, y: 262 };
const paths = {
  'aff-R': `M${EYES.R.cx - 20} 196 C${EYES.R.cx - 10} 240 260 ${C.y} ${C.x - 30} ${C.y}`,
  'aff-L': `M${EYES.L.cx + 20} 196 C${EYES.L.cx + 10} 240 380 ${C.y} ${C.x + 30} ${C.y}`,
  'eff-R': `M${C.x - 30} ${C.y - 10} C250 ${C.y - 22} ${EYES.R.cx + 30} 236 ${EYES.R.cx + 24} 196`,
  'eff-L': `M${C.x + 30} ${C.y - 10} C390 ${C.y - 22} ${EYES.L.cx - 30} 236 ${EYES.L.cx - 24} 196`,
};
const segs = {};
for (const [k, d] of Object.entries(paths)) {
  segs[k] = s('path', { class: `seg ${k.startsWith('aff') ? 'seg-aff' : 'seg-eff'}`, d });
  circuit.append(segs[k]);
}
circuit.append(s('rect', { class: 'center-box', x: C.x - 34, y: C.y - 20, width: 68, height: 30, rx: 9 }));
circuit.append(s('text', { class: 'center-text', x: C.x, y: C.y }, document.createTextNode('גזע המוח')));
// תוויות וסימני "ניתוק" — באמצע כל מקטע, לפי האורך האמיתי של המסלול
const breaks = {};
const mids = {};
svg.append(circuit);
document.body.append(svg); // כדי ש-getPointAtLength יעבוד לפני שהבמה נכנסת לעמוד
for (const [k, path] of Object.entries(segs)) {
  const L = path.getTotalLength();
  const m = path.getPointAtLength(L * (k.startsWith('aff') ? 0.4 : 0.55));
  mids[k] = m;
  const off = k.startsWith('aff') ? (k.endsWith('R') ? -16 : 16) : (k.endsWith('R') ? 12 : -12);
  circuit.append(s('text', { class: 'seg-label', x: m.x + off, y: m.y - 6, 'text-anchor': 'middle' }, document.createTextNode(k.startsWith('aff') ? 'II' : 'III')));
  breaks[k] = s('g', { class: 'break', transform: `translate(${m.x} ${m.y})` }, s('path', { d: 'M-7 -7 L7 7 M7 -7 L-7 7' }));
  circuit.append(breaks[k]);
}


// ---------- פקדים ----------

const controls = document.createElement('div');
controls.className = 'lab-controls';
controls.innerHTML = `
  <fieldset class="chip-set"><legend>הפנס</legend>
    ${LIGHTS.map((l) => `<button type="button" class="chip" data-light="${l.id}" aria-pressed="${l.id === lightMode}">${l.label}</button>`).join('')}
  </fieldset>
  <fieldset class="chip-set"><legend>פגיעה <span class="muted">(ימין ושמאל של האדם)</span></legend>
    ${LESIONS.map((l) => `<button type="button" class="chip" data-lesion="${l.id}" aria-pressed="${l.id === lesion}">${l.label}</button>`).join('')}
  </fieldset>
  <fieldset class="chip-set"><legend>התאורה בחדר</legend>
    ${AMBIENT.map((a) => `<button type="button" class="chip" data-ambient="${a.id}" aria-pressed="${a.id === ambient}">${a.label}</button>`).join('')}
  </fieldset>`;

const readout = document.createElement('div');
readout.className = 'lab-readout';
readout.innerHTML = `<dl class="pupil-read">
    <div><dt>האישון הימני</dt><dd id="read-R"></dd></div>
    <div><dt>האישון השמאלי</dt><dd id="read-L"></dd></div>
  </dl>
  <p class="lab-explain" id="explain" role="status" aria-live="polite"></p>`;

const stageWrap = document.createElement('div');
stageWrap.className = 'lab-stage';
stageWrap.append(svg);
const layout = document.createElement('div');
layout.className = 'lab-layout';
layout.append(stageWrap, controls, readout);
root.append(layout);

// ---------- מודל ועדכון ----------

function state() {
  const [nerve, side] = lesion.split('-');
  const ii = { R: !(nerve === 'II' && side === 'R'), L: !(nerve === 'II' && side === 'L') };
  const iii = { R: !(nerve === 'III' && side === 'R'), L: !(nerve === 'III' && side === 'L') };
  const horner = { R: nerve === 'H' && side === 'R', L: nerve === 'H' && side === 'L' };
  const input = light !== 'off' && ii[light];
  const dim = ambient === 'dim';
  const size = {};
  for (const e of ['R', 'L']) {
    if (!iii[e]) size[e] = SIZE.blown;
    else if (horner[e]) size[e] = input ? HORNER.lit : dim ? HORNER.dimRest : HORNER.rest;
    else size[e] = input ? SIZE.lit : dim ? DIM_REST : SIZE.rest;
  }
  return { nerve, side, ii, iii, horner, input, dim, size };
}

const sideName = { R: 'הימנית', L: 'השמאלית' };

function explainHorner(st) {
  const sd = st.side === 'R' ? 'הימני' : 'השמאלי';
  const path = 'בתסמונת הורנר נפגע המסלול הסימפתטי, שמרחיב את האישון ומרים מעט את העפעף. זו שרשרת של שלושה נוירונים: מההיפותלמוס במוח, דרך חוט השדרה (בגובה חוליית החזה הראשונה, T1), אל הגנגליון הצווארי העליון, ומשם לאורך עורק התרדמה עד העין.';
  const contrast = 'זה ההפך מפגיעה בעצב III: שם האישון רחב, העפעף צנוח מאוד והעין פונה למטה והחוצה. בהורנר האישון קטן, הצניחה קלה והעין זזה כרגיל. לפעמים גם העור באותו צד של הפנים מזיע פחות.';
  if (light === 'off') {
    return st.dim
      ? `בחדר עמום ההבדל בולט: האישון השני מתרחב, והאישון ${sd} כמעט לא, כי המסלול שמרחיב אותו פגוע. ${path} ${contrast}`
      : `האישון ${sd} קטן מהשני, והעפעף מעליו צנוח מעט. נסו לעמעם את התאורה בחדר. ${path} ${contrast}`;
  }
  if (lightMode === 'swing') return `בפנס המתנדנד שני האישונים מגיבים כרגיל, כי עצבי הרפלקס (II ו-III) תקינים. האישון ${sd} פשוט קטן יותר כל הזמן. ${contrast}`;
  return `שני האישונים מתכווצים לאור, כי עצבי הרפלקס (II ו-III) תקינים. גם עכשיו האישון ${sd} קטן במעט מהשני. ההבדל בולט יותר כשהאור כבוי והחדר עמום. ${contrast}`;
}

function explain(st) {
  if (st.nerve === 'H') return explainHorner(st);
  if (light === 'off') {
    if (st.nerve === 'III') return `גם בלי פנס רואים את הפגיעה: האישון ${st.side === 'R' ? 'הימני' : 'השמאלי'} רחב והעפעף צנוח. הדליקו את הפנס.`;
    if (st.nerve === 'II') return 'בלי אור, אי אפשר לראות פגיעה בעצב II: האישונים נראים רגילים ושווים. הדליקו את הפנס על כל עין.';
    return st.dim ? 'בחדר עמום שני האישונים מתרחבים באותה מידה. הדליקו את הפנס.' : 'בחדר מואר למחצה שני האישונים בגודל בינוני ושווה. הדליקו את הפנס.';
  }
  // בפנס המתנדנד ההסבר כללי ולא תלוי באיזו עין מוארת ברגע זה (הוא לא מתעדכן בכל נדנוד)
  if (lightMode === 'swing') {
    const sd = st.side === 'R' ? 'הימנית' : 'השמאלית';
    if (st.nerve === 'II') return `בפנס המתנדנד מעבירים את האור מעין לעין. כשהאור עובר לעין ${sd}, שעצב II שלה פגוע, שני האישונים דווקא מתרחבים, כי המוח "מרגיש" פחות אור. זה סימן חשוב לפגיעה בעצב הראייה.`;
    if (st.nerve === 'III') return `בפנס המתנדנד מעבירים את האור מעין לעין. האישון בעין ${sd}, שעצב III שלה פגוע, נשאר רחב כל הזמן. האישון השני מתכווץ בכל פעם שהאור נכנס לאחת העיניים.`;
    return 'בפנס המתנדנד מעבירים את האור מעין לעין. בלי פגיעה, שני האישונים נשארים מכווצים באותה מידה, כי כל עין מעבירה את האור כרגיל.';
  }
  const lit = sideName[light];
  const other = sideName[light === 'R' ? 'L' : 'R'];
  if (!st.ii[light]) {
    const swing = lightMode === 'swing' ? ' בפנס המתנדנד זה נראה כך: כשהאור עובר לעין הפגועה, שני האישונים דווקא מתרחבים, כי המוח "מרגיש" פחות אור. זה סימן חשוב לפגיעה בעצב הראייה.' : '';
    return `האור נכנס לעין ${lit}, אבל עצב II שלה לא מעביר את המידע, ולכן המוח לא יודע שיש אור, ושני האישונים לא מתכווצים.${swing}`;
  }
  let t = `האור נכנס לעין ${lit}, עצב II מעביר אותו לגזע המוח, ומשם יוצאת פקודה דרך עצב III לשני הצדדים.`;
  const bad = ['R', 'L'].filter((e) => !st.iii[e]);
  if (bad.length) {
    const e = bad[0];
    t += ` האישון ${e === 'R' ? 'הימני' : 'השמאלי'} לא מגיב, כי עצב III שלו פגוע והפקודה לא מגיעה אליו.`
      + (e === light ? ` אבל האישון בעין ${other} כן מתכווץ: המידע על האור הגיע למוח.` : '');
  } else {
    t += ` לכן מתכווצים גם האישון בעין ${lit} (תגובה ישירה) וגם בעין ${other} (תגובה עקיפה).`;
  }
  return t;
}

// tick: עדכון מהטיימר של הפנס המתנדנד. אז לא משנים את טקסט ההסבר (אזור חי), כדי שקורא מסך לא יקריא אותו כל 1.8 שניות
function update(tick = false) {
  const st = state();
  for (const e of ['R', 'L']) {
    const { pupil, lid, lashes, beam, mm } = parts[e];
    pupil.style.transform = `scale(${st.size[e] / SIZE.rest})`;
    // עפעף צנוח בפגיעה בעצב III: קו העפעף יורד עד אמצע האישון. בהורנר: צניחה קלה בלבד
    const drop = `translate(0px, ${!st.iii[e] ? 31 : st.horner[e] ? 8 : 0}px)`;
    lid.style.transform = drop;
    lashes.style.transform = drop;
    beam.classList.toggle('is-on', light === e);
    mm.textContent = `${st.size[e]} מ"מ`;
    const lit = st.input && st.iii[e];
    const word = !st.iii[e] ? 'רחב, לא מגיב'
      : lit ? (light === e ? 'מתכווץ (ישיר)' : 'מתכווץ (עקיף)')
      : st.horner[e] ? 'קטן (הורנר)' : st.dim ? 'מורחב (חדר עמום)' : 'בגודל בינוני';
    document.getElementById(`read-${e}`).textContent = `${st.size[e]} מ"מ · ${word}`;
  }
  // תרשים המסלול
  for (const e of ['R', 'L']) {
    const affOn = light === e && st.ii[e];
    segs[`aff-${e}`].classList.toggle('is-on', affOn);
    segs[`eff-${e}`].classList.toggle('is-on', st.input && st.iii[e]);
    breaks[`aff-${e}`].classList.toggle('is-on', !st.ii[e]);
    breaks[`eff-${e}`].classList.toggle('is-on', !st.iii[e]);
  }
  if (!tick) document.getElementById('explain').textContent = explain(st);
}

function setLightMode(mode) {
  lightMode = mode;
  clearInterval(swingTimer);
  controls.querySelectorAll('[data-light]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.light === mode)));
  if (mode === 'swing') {
    light = 'R';
    // עצירת אנימציות בתפריט הנגישות עוצרת גם את הנדנוד; בחירה בפנס אחר עוצרת אותו תמיד
    swingTimer = setInterval(() => {
      if (document.documentElement.classList.contains('a11y-still')) return;
      light = light === 'R' ? 'L' : 'R'; update(true);
    }, 1800);
  } else light = mode;
  update();
}

controls.addEventListener('click', (e) => {
  const l = e.target.closest('[data-light]');
  if (l) setLightMode(l.dataset.light);
  const amb = e.target.closest('[data-ambient]');
  if (amb) {
    ambient = amb.dataset.ambient;
    controls.querySelectorAll('[data-ambient]').forEach((c) => c.setAttribute('aria-pressed', String(c === amb)));
    update();
  }
  const les = e.target.closest('[data-lesion]');
  if (les) {
    lesion = les.dataset.lesion;
    controls.querySelectorAll('[data-lesion]').forEach((c) => c.setAttribute('aria-pressed', String(c === les)));
    update();
  }
});

update();
