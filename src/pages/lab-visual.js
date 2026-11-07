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
    fields: { L: ['left-top'], R: ['left-top'] }, text: 'חלק מקרינת הראייה עוקף דרך האונה הרקתית, בלולאה שנקראת לולאת מאייר. הסיבים האלה נושאים את החלק העליון של השדה. פגיעה בהם מצד ימין מוחקת את הרבע השמאלי העליון בשתי העיניים. באנגלית קוראים לזה "pie in the sky", פשטידה בשמיים.' },
  { id: 'parietal-R', label: '6 · הקרינה הקודקודית הימנית', at: [360, 362],
    fields: { L: ['left-bottom'], R: ['left-bottom'] }, text: 'החלק העליון של קרינת הראייה עובר באונה הקודקודית ונושא את החלק התחתון של השדה. פגיעה כאן מצד ימין מוחקת את הרבע השמאלי התחתון בשתי העיניים.' },
  { id: 'occipital-R', label: '7 · קליפת הראייה הימנית', at: [334, 410],
    fields: { L: ['left', 'spare'], R: ['left', 'spare'] }, text: 'פגיעה בקליפת הראייה באונה העורפית מוחקת את החצי השמאלי בשתי העיניים, אבל לעיתים קרובות המרכז (המקולה) נשמר. אחת ההשערות: לאזור המקולה בקליפה יש אספקת דם כפולה.' },
];

const BLUE = 'var(--field-left)', ORANGE = 'var(--field-right)';

// ---------- תרשים המסלול ----------

const svg = s('svg', { class: 'visual-stage', viewBox: '0 0 600 460', role: 'img', 'aria-label': 'מסלול הראייה במבט מלמעלה: מהעיניים, דרך המצטלבת, אל קליפת הראייה', direction: 'ltr' });
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: 600, height: 460, rx: 18 }));
// ---------- איור: מבט מלמעלה על בסיס המוח, בסגנון של שאר המעבדות ----------
// הגדרות (מעברי צבע) וסגנון פנימי, שחלים רק על התרשים הזה
const defs = s('defs');
defs.innerHTML = `
  <radialGradient id="vpv-hemi" cx="50%" cy="42%" r="70%">
    <stop offset="0" stop-color="#3a3029"/><stop offset="0.6" stop-color="#2a231f"/><stop offset="1" stop-color="#191512"/>
  </radialGradient>
  <radialGradient id="vpv-sclera" cx="45%" cy="40%" r="65%">
    <stop offset="0" stop-color="#fbf8f3"/><stop offset="0.7" stop-color="#e6ded2"/><stop offset="1" stop-color="#b9ad9c"/>
  </radialGradient>
  <linearGradient id="vpv-iris" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#2d5f73"/><stop offset="0.5" stop-color="#5b9fb5"/><stop offset="1" stop-color="#2d5f73"/>
  </linearGradient>
  <radialGradient id="vpv-node" cx="40%" cy="35%" r="70%">
    <stop offset="0" stop-color="#e8d9a8"/><stop offset="1" stop-color="#a8935c"/>
  </radialGradient>
  <linearGradient id="vpv-cortex" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#6d5a4b"/><stop offset="1" stop-color="#4a3c32"/>
  </linearGradient>
  <radialGradient id="vpv-glow" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#f0c46b" stop-opacity="0.16"/><stop offset="1" stop-color="#f0c46b" stop-opacity="0"/>
  </radialGradient>`;
svg.append(defs);
svg.append(s('style', {}, document.createTextNode(`
  .visual-stage .vpv-hemi { fill: url(#vpv-hemi); stroke: #4a3d33; stroke-width: 1.5; }
  .visual-stage .vpv-gyrus { fill: none; stroke: #120f0d; stroke-width: 1.6; stroke-linecap: round; opacity: 0.55; }
  .visual-stage .vpv-sheen { fill: #fff; opacity: 0.04; }
  .visual-stage .vpv-gyrus-hi { fill: none; stroke: #5a4a3e; stroke-width: 1; stroke-linecap: round; opacity: 0.45; }
  .visual-stage .vpv-sheath { fill: none; stroke: #c9b07a; stroke-linecap: round; opacity: 0.28; }
  .visual-stage .vpv-rad { fill: #c9b07a; opacity: 0.1; }
  .visual-stage .vpv-fiber-shadow { fill: none; stroke: #0b0e12; stroke-width: 6; stroke-linecap: round; opacity: 0.55; }
  .visual-stage .vpv-chiasm { fill: url(#vpv-node); opacity: 0.55; stroke: #d8c389; stroke-width: 1; }
  .visual-stage .vpv-lgn { fill: url(#vpv-node); stroke: #3a3024; stroke-width: 1.2; }
  .visual-stage .vpv-cortex { fill: url(#vpv-cortex); stroke: #8a7360; stroke-width: 1; }
  .visual-stage .vpv-calc { fill: none; stroke: #b39a7c; stroke-width: 1.4; stroke-dasharray: 1.5 3; opacity: 0.8; }
  .visual-stage .vpv-sclera { fill: url(#vpv-sclera); stroke: #6f6355; stroke-width: 1.2; }
  .visual-stage .vpv-cornea { fill: rgba(220, 238, 246, 0.35); stroke: rgba(240, 250, 255, 0.7); stroke-width: 1; }
  .visual-stage .vpv-iris { fill: url(#vpv-iris); }
  .visual-stage .vpv-lens { fill: rgba(235, 228, 200, 0.55); stroke: rgba(120, 110, 90, 0.5); stroke-width: 0.8; }
  .visual-stage .vpv-shine { fill: #fff; opacity: 0.7; }
  .visual-stage .vpv-glow { fill: url(#vpv-glow); }
  .visual-stage .vp-tag { paint-order: stroke; stroke: #0d1117; stroke-width: 3.5px; stroke-linejoin: round; fill: #cfd6de; }
  .visual-stage .stage-label { paint-order: stroke; stroke: #10141a; stroke-width: 3px; }
`)));

// שתי ההמיספרות במבט מלמטה-מלמעלה (האונות המצחיות למעלה, האונות הרקתיות בצדדים, העורף למטה)
const HEMI_L = 'M296 150 C268 138 214 136 178 158 C146 178 134 212 142 248 C124 272 116 312 124 350 C134 398 182 440 238 450 C266 455 284 452 296 446 Z';
const HEMI_R = HEMI_L.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (m, x, y) => `${600 - Number(x)} ${y}`);
svg.append(s('path', { class: 'vpv-hemi', d: HEMI_L }));
svg.append(s('path', { class: 'vpv-hemi', d: HEMI_R }));
// אור רך מלמעלה, שנותן לאונות נפח
svg.append(s('path', { class: 'vpv-sheen', d: 'M200 168 C230 152 270 152 290 160 C272 176 240 180 214 194 C200 190 194 178 200 168 Z' }));
svg.append(s('path', { class: 'vpv-sheen', d: 'M400 168 C370 152 330 152 310 160 C328 176 360 180 386 194 C400 190 406 178 400 168 Z' }));
// קפלי קליפת המוח (מעט, כדי לרמוז על מרקם)
const gyri = [
  'M180 196 C200 186 226 190 240 204', 'M156 232 C180 226 200 236 206 252', 'M150 300 C168 290 186 300 190 318',
  'M160 360 C182 350 200 362 204 380', 'M196 418 C214 404 236 410 244 426', 'M262 168 C270 182 266 198 254 208',
];
for (const d of gyri) {
  svg.append(s('path', { class: 'vpv-gyrus', d }));
  svg.append(s('path', { class: 'vpv-gyrus', d: d.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (m, x, y) => `${600 - Number(x)} ${y}`) }));
}
// החריץ בין ההמיספרות
svg.append(s('path', { class: 'vp-mid', d: 'M300 150 L300 446' }));
// הילה רכה סביב המצטלבת
svg.append(s('ellipse', { class: 'vpv-glow', cx: 300, cy: 178, rx: 70, ry: 40 }));

// עיניים במבט מלמעלה: גלגל העין, הקרנית והקשתית בחזית (למעלה), הרשתית מאחור
const eyes = { L: 210, R: 390 };
for (const [side, x] of Object.entries(eyes)) {
  svg.append(s('circle', { class: 'vpv-sclera', cx: x, cy: 58, r: 34 }));
  svg.append(s('path', { class: 'vpv-cornea', d: `M${x - 17} 30 Q${x} 14 ${x + 17} 30 Z` }));
  svg.append(s('rect', { class: 'vpv-iris', x: x - 17, y: 28.5, width: 34, height: 4, rx: 2 }));
  svg.append(s('ellipse', { class: 'vpv-lens', cx: x, cy: 37, rx: 11, ry: 5 }));
  svg.append(s('ellipse', { class: 'vpv-shine', cx: x - 12, cy: 46, rx: 4, ry: 2.4 }));
  // הרשתית: קשת בחלק האחורי של העין. בשתי העיניים, החצי השמאלי של הרשתית רואה את הצד הימני של העולם (כתום)
  // והחצי הימני רואה את הצד השמאלי (כחול), כי העדשה הופכת את התמונה.
  svg.append(s('path', { class: 'vp-retina', d: `M${x - 30} 70 A32 32 0 0 0 ${x} 90`, stroke: ORANGE }));
  svg.append(s('path', { class: 'vp-retina', d: `M${x} 90 A32 32 0 0 0 ${x + 30} 70`, stroke: BLUE }));
  svg.append(s('text', { class: 'stage-label', x, y: 16, 'text-anchor': 'middle' }, document.createTextNode(side === 'L' ? 'עין שמאל' : 'עין ימין')));
}

// מעטפת העצבים: עצבי הראייה, המצטלבת והמסלולים, כצינור בהיר מתחת לסיבים הצבעוניים
svg.append(s('path', { class: 'vpv-sheath', d: 'M210 90 C220 130 270 160 300 176 C330 160 380 130 390 90', 'stroke-width': 18 }));
svg.append(s('path', { class: 'vpv-sheath', d: 'M300 176 C280 196 252 220 240 244 M300 176 C320 196 348 220 360 244', 'stroke-width': 14 }));
// קרינת הראייה: מניפה רכה מהגוף הברכי אל קליפת הראייה
svg.append(s('path', { class: 'vpv-rad', d: 'M236 244 C196 270 190 330 214 372 C232 404 256 420 274 424 L290 418 C268 400 236 360 232 320 C230 290 238 262 248 248 Z' }));
svg.append(s('path', { class: 'vpv-rad', d: 'M364 244 C404 270 410 330 386 372 C368 404 344 420 326 424 L310 418 C332 400 364 360 368 320 C370 290 362 262 352 248 Z' }));
// המצטלבת
svg.append(s('ellipse', { class: 'vpv-chiasm', cx: 300, cy: 178, rx: 30, ry: 10 }));
// קליפת הראייה בקצה האונה העורפית, עם חריץ הקלקרין
svg.append(s('path', { class: 'vpv-cortex', d: 'M240 420 C256 440 280 448 296 446 L296 432 C280 432 262 426 250 414 Z' }));
svg.append(s('path', { class: 'vpv-cortex', d: 'M360 420 C344 440 320 448 304 446 L304 432 C320 432 338 426 350 414 Z' }));
svg.append(s('path', { class: 'vpv-calc', d: 'M250 422 C264 434 282 440 294 440 M350 422 C336 434 318 440 306 440' }));

// סיבים. העין השמאלית: הרשתית החיצונית (משמאל) רואה את הצד הימני של העולם (כתום) ונשארת בצד שמאל.
// הרשתית הפנימית (מימין) רואה את הצד השמאלי (כחול) וחוצה לצד ימין. ובמראה לעין הימנית.
const fibers = [
  // [color, d]
  [ORANGE, 'M196 88 C200 130 278 160 286 176 C282 200 252 220 236 240 C220 262 214 290 218 320 C222 360 250 396 266 414'],
  [BLUE, 'M222 88 C230 130 288 156 300 176 C312 196 340 214 358 238 C374 262 384 292 382 320 C378 360 350 396 334 414'],
  [BLUE, 'M404 88 C400 130 322 160 314 176 C318 200 348 220 364 240 C380 262 386 290 382 320 C378 360 350 396 334 414'],
  [ORANGE, 'M378 88 C370 130 312 156 300 176 C288 196 260 214 242 238 C226 262 216 292 218 320 C222 360 250 396 266 414'],
];
for (const [, d] of fibers) svg.append(s('path', { class: 'vpv-fiber-shadow', d }));
for (const [c, d] of fibers) svg.append(s('path', { class: 'vp-fiber', d, stroke: c }));
// לולאות מאייר (סיבים עליונים שעוקפים דרך האונה הרקתית)
svg.append(s('path', { class: 'vp-fiber vp-meyer', d: 'M366 252 C420 268 420 320 392 352 C372 376 350 396 334 414', stroke: BLUE }));
svg.append(s('path', { class: 'vp-fiber vp-meyer', d: 'M234 252 C180 268 180 320 208 352 C228 376 250 396 266 414', stroke: ORANGE }));
// הגופים הברכיים (LGN) בתלמוס
svg.append(s('ellipse', { class: 'vpv-lgn', cx: 240, cy: 244, rx: 10, ry: 8 }));
svg.append(s('ellipse', { class: 'vpv-lgn', cx: 360, cy: 244, rx: 10, ry: 8 }));
const tag = (x, y, t) => svg.append(s('text', { class: 'vp-tag', x, y, 'text-anchor': 'middle' }, document.createTextNode(t)));
tag(240, 182, 'מצטלבת'); tag(196, 236, 'גוף ברכי'); tag(404, 236, 'גוף ברכי'); tag(300, 458, 'קליפת הראייה');

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

// אחרי בחירה: אם שדות הראייה לא נראים במסך, גוללים אליהם (בלי זה, במחשב התוצאה מוסתרת מתחת לקצה המסך)
function reveal() {
  const r = side.getBoundingClientRect();
  if (r.top > innerHeight - 120 || r.bottom < 80) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
    side.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
}
controls.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { select(c.dataset.id); reveal(); } });
svg.addEventListener('click', (e) => { const g = e.target.closest('.vp-mark'); if (g) { select(g.dataset.id); reveal(); } });
select('none');
