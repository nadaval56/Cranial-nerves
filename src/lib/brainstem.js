// איור גזע המוח במבט מלמטה (מהצד הקדמי), עם 12 זוגות העצבים.
// מחזיר מחרוזת SVG, כדי שאותו איור ישמש גם ב-build (עמודי העצבים הסטטיים) וגם בדפדפן (המפה בעמוד הבית).
// האיור סכמטי: הפרופורציות מפושטות, אבל מקומות היציאה של העצבים והסדר ביניהם נאמנים לאנטומיה.
//
// הצד הימני של האיור (x > 200) מצויר במלואו, והשמאלי הוא שיקוף שלו. במבט מלמטה, הצד הימני של האיור
// הוא הצד השמאלי של האדם — לכן התוויות (מספרי העצבים) מופיעות שם, ושמות המבנים בצד השני.

// לכל עצב: מסלול (או כמה), עובי קו ומיקום התווית
const PATHS = {
  olfactory: { d: ['M222 70 C223 88 225 104 226 120', 'M226 120 L240 132', 'M226 120 L213 132'], w: 3.2, bulb: true, label: [250, 32] },
  optic: { d: ['M262 112 C246 124 230 136 214 146'], w: 7, label: [282, 104] },
  oculomotor: { d: ['M212 224 C228 214 252 196 282 176'], w: 4.2, label: [298, 168] },
  trochlear: { d: ['M247 240 C262 236 280 226 296 212'], w: 2, label: [314, 206] },
  trigeminal: { d: ['M262 282 C282 278 300 272 316 268', 'M262 274 C280 268 296 264 312 260'], w: [8, 2.6], ganglion: true, label: [360, 238] },
  abducens: { d: ['M208 341 C212 326 218 312 228 298'], w: 2.6, label: [242, 302] },
  facial: { d: ['M254 338 C272 334 292 333 310 334'], w: 3.6, label: [328, 324] },
  vestibulocochlear: { d: ['M258 346 C278 348 298 351 318 354'], w: 4.6, label: [340, 352] },
  glossopharyngeal: { d: ['M238 364 C258 366 280 368 300 370', 'M238 370 C250 370 262 369 274 368'], w: [2.4, 1.6], label: [322, 374] },
  vagus: { d: ['M239 378 C262 384 284 390 304 394', 'M239 386 C252 388 266 391 280 392', 'M240 394 C252 394 264 393 276 393'], w: [3, 1.6, 1.6], label: [328, 398] },
  accessory: { d: ['M228 508 C234 476 240 446 248 420 C268 416 288 416 306 419'], w: 2.6, label: [330, 424] },
  hypoglossal: { d: ['M217 368 C226 390 240 412 258 426', 'M218 380 C226 396 238 412 252 422', 'M219 392 C226 404 236 414 248 420', 'M258 426 C270 436 282 444 292 452'], w: [1.6, 1.6, 1.6, 3], label: [314, 458] },
};

// שמות מבנים — בצד השמאלי של האיור, עם קו מוביל
const STRUCTURES = [
  { text: 'פקעת הריח', at: [178, 48], to: [120, 44] },
  { text: 'מצטלבת הראייה', at: [188, 148], to: [96, 140] },
  { text: 'רגל המוח', at: [166, 222], to: [62, 244] },
  { text: 'גשר המוח', at: [150, 304], to: [56, 322] },
  { text: 'הזית', at: [172, 384], to: [88, 392] },
  { text: 'המוח המוארך', at: [190, 430], to: [96, 440] },
  { text: 'המוחון', at: [86, 470], to: [40, 498] },
  { text: 'חוט השדרה', at: [190, 494], to: [116, 506] },
];

const ORDER = ['olfactory', 'optic', 'oculomotor', 'trochlear', 'trigeminal', 'abducens', 'facial', 'vestibulocochlear', 'glossopharyngeal', 'vagus', 'accessory', 'hypoglossal'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const MIRROR = 'matrix(-1 0 0 1 400 0)';

// המבנים של המוח (רקע): מצוירים לצד אחד, והצד השני הוא שיקוף
function halfAnatomy() {
  return [
    // המוחון — מאחורי גזע המוח
    '<path class="bs-cbl" d="M238 352 C262 330 318 326 356 350 C392 374 392 430 360 458 C330 484 276 486 248 466 C236 448 234 400 238 352 Z"/>',
    '<path class="bs-fold" d="M262 470 C300 466 340 450 366 420 M258 450 C296 446 334 430 360 398 M252 430 C286 426 318 410 340 386"/>',
    // אונה רקתית (קצה, לצד גזע המוח)
    '<path class="bs-lobe" d="M300 150 C340 152 372 186 374 232 C376 262 360 278 338 276 C312 274 286 250 278 214 C272 186 280 156 300 150 Z"/>',
    // אונה מצחית — גירוס ישר, שעליו מונחים פקעת הריח והמסלול
    '<path class="bs-lobe" d="M206 14 C240 8 276 24 286 58 C294 86 286 112 266 118 C246 124 222 116 210 100 C204 76 204 40 206 14 Z"/>',
    // רגל המוח והגומה שבין הרגליים
    '<path class="bs-stem" d="M212 198 C222 186 244 182 254 192 C258 210 254 230 248 246 L214 246 C210 232 208 214 212 198 Z"/>',
    // גשר המוח, עם הזרוע שלו אל המוחון
    '<path class="bs-pons" d="M200 240 C238 238 262 252 268 278 C286 280 298 292 298 304 C298 318 284 326 266 322 C258 336 236 342 200 342 Z"/>',
    '<path class="bs-groove" d="M214 256 C236 262 250 276 254 296 M214 324 C236 320 250 310 256 296"/>',
    // המוח המוארך: פירמידה וזית
    '<path class="bs-stem" d="M200 342 L240 342 C242 372 236 418 222 460 L200 460 Z"/>',
    '<path class="bs-groove" d="M214 346 C216 380 214 420 210 458"/>',
    '<ellipse class="bs-olive" cx="229" cy="384" rx="8.5" ry="22"/>',
    // חוט השדרה
    '<path class="bs-stem" d="M200 458 L222 458 C221 478 220 498 220 516 L200 516 Z"/>',
    // גוף הפטמה (mammillary)
    '<circle class="bs-stem" cx="207" cy="190" r="5.5"/>',
  ].join('');
}

function nervePaths(id, side) {
  const p = PATHS[id];
  const widths = Array.isArray(p.w) ? p.w : p.d.map(() => p.w);
  let out = p.d.map((d, i) => `<path class="bs-n" d="${d}" stroke-width="${widths[i]}"/>`).join('');
  if (p.bulb) out += '<ellipse class="bs-n-fill" cx="222" cy="48" rx="9" ry="22"/>';
  if (p.ganglion) out += '<path class="bs-n-fill" d="M314 256 C326 252 336 258 336 268 C336 280 326 284 316 280 C320 272 320 264 314 256 Z"/>'
    + '<path class="bs-n" d="M334 260 L350 248 M336 268 L354 268 M332 278 L348 290" stroke-width="2.6"/>';
  // מצטלבת הראייה ומסלולי הראייה — שייכים לעצב השני, בשני הצדדים יחד
  if (id === 'optic' && side === 'r') out += '<path class="bs-n-fill" d="M186 142 L214 142 L222 156 L178 156 Z"/>'
    + '<path class="bs-n" d="M216 154 C232 162 246 176 254 196" stroke-width="5" opacity="0.7"/>';
  return out;
}

const hitPath = (id) => PATHS[id].d.map((d) => `<path class="bs-hit" d="${d}"/>`).join('');

/**
 * @param {{ active?: string, interactive?: boolean, labels?: boolean, title?: string }} opts
 * active: מזהה עצב להדגשה. interactive: מוסיף שכבות לחיצה. labels: שמות המבנים.
 */
export function brainstemSvg({ active = null, interactive = false, labels = true, title = 'גזע המוח מלמטה ו-12 זוגות העצבים הקרניאליים' } = {}) {
  const nerves = ORDER.map((id, i) => {
    const [lx, ly] = PATHS[id].label;
    const cls = `bs-nerve${active === id ? ' is-active' : ''}`;
    const attrs = interactive ? ` data-id="${id}" tabindex="-1"` : '';
    return `<g class="${cls}" data-nerve="${id}"${attrs}>`
      + `<g>${nervePaths(id, 'r')}${interactive ? hitPath(id) : ''}</g>`
      + `<g transform="${MIRROR}">${nervePaths(id, 'l')}${interactive ? hitPath(id) : ''}</g>`
      + `<g class="bs-label"><circle cx="${lx}" cy="${ly}" r="12.5"/><text x="${lx}" y="${ly + 4.2}">${ROMAN[i]}</text></g>`
      + '</g>';
  }).join('');

  const structs = labels ? `<g class="bs-structs">${STRUCTURES.map(({ text, at, to }) =>
    `<path d="M${at[0]} ${at[1]} L${to[0] + 4} ${to[1]}"/><circle cx="${at[0]}" cy="${at[1]}" r="2"/><text x="${to[0]}" y="${to[1] - 4}">${text}</text>`).join('')}</g>` : '';

  return `<svg class="brainstem${active ? ' has-active' : ''}" viewBox="0 0 400 520" role="img" aria-label="${title}" direction="ltr">`
    + `<g class="bs-anat">${halfAnatomy()}<g transform="${MIRROR}">${halfAnatomy()}</g><path class="bs-midline" d="M200 236 L200 516"/></g>`
    + nerves + structs + '</svg>';
}

export const BRAINSTEM_ORDER = ORDER;
