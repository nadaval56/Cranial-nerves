// מסלול הראייה: בוחרים נקודת פגיעה בתרשים (מבט מלמעלה), ורואים את שדה הראייה של כל עין.
// בתרשים: העיניים למעלה, העורף למטה; הצד הימני של האדם הוא הצד הימני של המסך.
// צבעים: סיבים שנושאים את חצי השדה השמאלי — כחול; את החצי הימני — כתום.
// שדות הראייה מצוירים כפי שהנבדק רואה אותם: ימין העיגול = ימין שלו.

import { s } from '../lib/dom.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const LESIONS = [
  { id: 'none', label: 'בלי פגיעה', name: 'אין פגיעה', at: null,
    fields: {}, text: 'שתי העיניים רואות את כל השדה. כל חצי מוח מקבל את החצי הנגדי של העולם משתי העיניים: החצי השמאלי של העולם (כחול) מגיע לחצי המוח הימני.' },
  { id: 'optic-L', label: '1 · עצב הראייה השמאלי', at: [214, 112],
    fields: { L: ['all'] }, text: 'כל הסיבים של העין השמאלית עוברים כאן, לפני המצטלבת. לכן העין השמאלית לא רואה בכלל, והעין הימנית רואה כרגיל. (ייתכן שהאדם לא ישים לב לכך מיד, כי העין השנייה מכסה על רוב השדה.)' },
  { id: 'optic-R', label: '2 · עצב הראייה הימני', at: [386, 112],
    fields: { R: ['all'] }, text: 'כל הסיבים של העין הימנית עוברים כאן. העין הימנית לא רואה, והשמאלית רואה כרגיל.' },
  { id: 'chiasm', label: '3 · מצטלבת הראייה', at: [300, 176],
    fields: { L: ['left'], R: ['right'] }, text: 'במרכז המצטלבת חוצים רק הסיבים מהחצי הפנימי של כל רשתית, אלה שרואים את הצדדים. לחץ במקום הזה (למשל מבלוטת יותרת המוח, שיושבת ממש מתחת) מוחק את שני החצאים החיצוניים של שדה הראייה. השם: "המיאנופסיה ביטמפורלית", ובשפה פשוטה: ראייה כמו עם משקפי סוס.' },
  { id: 'tract-R', label: '4 · מסלול הראייה הימני', at: [348, 228],
    fields: { L: ['left'], R: ['left'] }, text: 'אחרי המצטלבת, המסלול הימני נושא את כל המידע על החצי השמאלי של העולם, משתי העיניים. פגיעה בו מוחקת את החצי השמאלי בשתי העיניים ("המיאנופסיה הומונימית").' },
  { id: 'meyer-R', label: '5 · לולאת מאייר הימנית', at: [414, 296],
    fields: { L: ['left-top'], R: ['left-top'] }, text: 'חלק מקרינת הראייה עוקף דרך האונה הרקתית, בלולאה שנקראת לולאת מאייר. הסיבים האלה נושאים את החלק העליון של השדה. פגיעה בהם מוחקת רבע עליון בשתי העיניים. באנגלית קוראים לזה "pie in the sky", פשטידה בשמיים.' },
  { id: 'parietal-R', label: '6 · הקרינה בצד הקודקודי', at: [360, 362],
    fields: { L: ['left-bottom'], R: ['left-bottom'] }, text: 'החלק העליון של קרינת הראייה עובר באונה הקודקודית ונושא את החלק התחתון של השדה. פגיעה כאן מוחקת רבע תחתון בשתי העיניים.' },
  { id: 'occipital-R', label: '7 · קליפת הראייה הימנית', at: [334, 410],
    fields: { L: ['left', 'spare'], R: ['left', 'spare'] }, text: 'פגיעה בקליפת הראייה באונה העורפית מוחקת את החצי השמאלי בשתי העיניים, אבל לעיתים קרובות המרכז (המקולה) נשמר. אחת ההשערות: לאזור המקולה בקליפה יש אספקת דם כפולה.' },
];

const BLUE = 'var(--field-left)', ORANGE = 'var(--field-right)';

// ---------- תרשים המסלול ----------

const svg = s('svg', { class: 'visual-stage', viewBox: '0 0 600 460', role: 'img', 'aria-label': 'מסלול הראייה במבט מלמעלה: מהעיניים, דרך המצטלבת, אל קליפת הראייה', direction: 'ltr' });
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: 600, height: 460, rx: 18 }));
// קווי מתאר של המוח
svg.append(s('path', { class: 'vp-brain', d: 'M300 140 C190 140 120 190 112 280 C104 380 190 450 300 450 C410 450 496 380 488 280 C480 190 410 140 300 140 Z' }));
svg.append(s('path', { class: 'vp-mid', d: 'M300 150 L300 446' }));

// עיניים: חצי פנימי (nasal) וחיצוני (temporal) של הרשתית
const eyes = { L: 210, R: 390 };
for (const [side, x] of Object.entries(eyes)) {
  svg.append(s('circle', { class: 'vp-eye', cx: x, cy: 58, r: 34 }));
  // הרשתית — קשת בחלק האחורי של העין. בשתי העיניים, החצי השמאלי של הרשתית רואה את הצד הימני של העולם (כתום)
  // והחצי הימני רואה את הצד השמאלי (כחול) — העדשה הופכת את התמונה.
  svg.append(s('path', { class: 'vp-retina', d: `M${x - 30} 70 A32 32 0 0 0 ${x} 90`, stroke: ORANGE }));
  svg.append(s('path', { class: 'vp-retina', d: `M${x} 90 A32 32 0 0 0 ${x + 30} 70`, stroke: BLUE }));
  svg.append(s('text', { class: 'stage-label', x, y: 18, 'text-anchor': 'middle' }, document.createTextNode(side === 'L' ? 'עין שמאל' : 'עין ימין')));
}
// סיבים. העין השמאלית: הרשתית החיצונית (משמאל) רואה את הצד הימני של העולם — כתום — ונשארת בצד שמאל.
// הרשתית הפנימית (מימין) רואה את הצד השמאלי — כחול — וחוצה לצד ימין. ובמראה לעין הימנית.
const fibers = [
  // [color, d]
  [ORANGE, 'M196 88 C200 130 278 160 286 176 C282 200 252 220 236 240 C220 262 214 290 218 320 C222 360 250 396 266 414'],
  [BLUE, 'M222 88 C230 130 288 156 300 176 C312 196 340 214 358 238 C374 262 384 292 382 320 C378 360 350 396 334 414'],
  [BLUE, 'M404 88 C400 130 322 160 314 176 C318 200 348 220 364 240 C380 262 386 290 382 320 C378 360 350 396 334 414'],
  [ORANGE, 'M378 88 C370 130 312 156 300 176 C288 196 260 214 242 238 C226 262 216 292 218 320 C222 360 250 396 266 414'],
];
for (const [c, d] of fibers) svg.append(s('path', { class: 'vp-fiber', d, stroke: c }));
// לולאות מאייר (סיבים עליונים שעוקפים דרך האונה הרקתית)
svg.append(s('path', { class: 'vp-fiber vp-meyer', d: 'M366 252 C420 268 420 320 392 352 C372 376 350 396 334 414', stroke: BLUE }));
svg.append(s('path', { class: 'vp-fiber vp-meyer', d: 'M234 252 C180 268 180 320 208 352 C228 376 250 396 266 414', stroke: ORANGE }));
// תחנות
svg.append(s('ellipse', { class: 'vp-node', cx: 300, cy: 178, rx: 30, ry: 10 }));
svg.append(s('circle', { class: 'vp-node', cx: 240, cy: 244, r: 9 }));
svg.append(s('circle', { class: 'vp-node', cx: 360, cy: 244, r: 9 }));
svg.append(s('path', { class: 'vp-cortex', d: 'M240 418 C262 438 284 442 296 440 M360 418 C338 438 316 442 304 440' }));
const tag = (x, y, t) => svg.append(s('text', { class: 'vp-tag', x, y, 'text-anchor': 'middle' }, document.createTextNode(t)));
tag(300, 202, 'מצטלבת'); tag(196, 236, 'LGN'); tag(404, 236, 'LGN'); tag(300, 432, 'קליפת הראייה');

// נקודות פגיעה
const marks = {};
for (const l of LESIONS.filter((x) => x.at)) {
  const [x, y] = l.at;
  const g = s('g', { class: 'vp-mark', transform: `translate(${x} ${y})`, 'data-id': l.id });
  g.append(s('circle', { r: 13 }));
  g.append(s('text', { y: 4.5, 'text-anchor': 'middle' }, document.createTextNode(l.label.split(' ')[0])));
  g.append(s('path', { class: 'vp-x', d: 'M-8 -8 L8 8 M8 -8 L-8 8' }));
  svg.append(g);
  marks[l.id] = g;
}

// ---------- שדות ראייה ----------

const R = 66;
function fieldSvg(side) {
  const f = s('svg', { class: 'field', viewBox: '-80 -80 160 160', role: 'img', direction: 'ltr' });
  f.append(s('path', { class: 'field-half', d: `M0 ${-R} A${R} ${R} 0 0 0 0 ${R} Z`, fill: BLUE }));
  f.append(s('path', { class: 'field-half', d: `M0 ${-R} A${R} ${R} 0 0 1 0 ${R} Z`, fill: ORANGE }));
  const dark = s('g', { class: 'field-dark' });
  f.append(dark);
  f.append(s('circle', { class: 'field-ring', r: R }));
  f.append(s('path', { class: 'field-axis', d: `M0 ${-R} V${R} M${-R} 0 H${R}` }));
  f.append(s('circle', { class: 'field-fix', r: 2.5 }));
  return { el: f, dark };
}
const SHAPES = {
  all: `M0 ${-R} A${R} ${R} 0 1 0 0.01 ${-R} Z`,
  left: `M0 ${-R} A${R} ${R} 0 0 0 0 ${R} Z`,
  right: `M0 ${-R} A${R} ${R} 0 0 1 0 ${R} Z`,
  'left-top': `M0 0 L0 ${-R} A${R} ${R} 0 0 0 ${-R} 0 Z`,
  'left-bottom': `M0 0 L${-R} 0 A${R} ${R} 0 0 0 0 ${R} Z`,
};

const fields = document.createElement('div');
fields.className = 'fields';
const fieldEls = {};
for (const side of ['L', 'R']) {
  const { el, dark } = fieldSvg(side);
  const fig = document.createElement('figure');
  fig.className = 'field-fig';
  fig.append(el);
  const cap = document.createElement('figcaption');
  cap.textContent = side === 'L' ? 'מה רואה העין השמאלית' : 'מה רואה העין הימנית';
  fig.append(cap);
  fields.append(fig);
  fieldEls[side] = { el, dark };
}

// ---------- פקדים ----------

const controls = document.createElement('div');
controls.className = 'lab-controls';
controls.innerHTML = `<fieldset class="chip-set chip-set-col"><legend>איפה הפגיעה?</legend>
  ${LESIONS.map((l) => `<button type="button" class="chip" data-id="${l.id}" aria-pressed="${l.id === 'none'}">${l.label}</button>`).join('')}
</fieldset>`;
const explain = document.createElement('p');
explain.className = 'lab-explain';
explain.setAttribute('role', 'status');
explain.setAttribute('aria-live', 'polite');

const stageWrap = document.createElement('div');
stageWrap.className = 'lab-stage';
stageWrap.append(svg);
const side = document.createElement('div');
side.className = 'lab-readout';
const legend = document.createElement('p');
legend.className = 'field-legend';
legend.innerHTML = '<span class="sw sw-left"></span>חצי השדה השמאלי <span class="sw sw-right"></span>חצי השדה הימני <span class="sw sw-dark"></span>לא נראה';
side.append(fields, legend, explain);

const layout = document.createElement('div');
layout.className = 'lab-layout';
layout.append(stageWrap, controls, side);
root.append(layout);

function select(id) {
  const l = LESIONS.find((x) => x.id === id);
  controls.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === id)));
  Object.entries(marks).forEach(([k, g]) => g.classList.toggle('is-active', k === id));
  for (const sideKey of ['L', 'R']) {
    const { el, dark } = fieldEls[sideKey];
    dark.innerHTML = '';
    const list = l.fields[sideKey] ?? [];
    for (const shape of list) {
      if (shape === 'spare') dark.append(s('circle', { class: 'field-spare', r: 15 }));
      else dark.append(s('path', { d: SHAPES[shape] }));
    }
    el.setAttribute('aria-label', `${sideKey === 'L' ? 'העין השמאלית' : 'העין הימנית'}: ${list.length ? 'חלק מהשדה חסר' : 'כל השדה נראה'}`);
  }
  explain.textContent = l.text;
}

controls.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) select(c.dataset.id); });
svg.addEventListener('click', (e) => { const g = e.target.closest('.vp-mark'); if (g) select(g.dataset.id); });
select('none');
