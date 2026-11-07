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
  { id: 'MLF-R', label: 'MLF ימין (INO)' }, { id: 'MLF-L', label: 'MLF שמאל (INO)' },
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
  IV: 'השריר האלכסוני העליון לא עובד. העין הפגועה גבוהה מעט מהשנייה, והפער גדל כשהיא פונה לכיוון האף ומסתכלת למטה, כי בכיוון הזה האלכסוני העליון הוא השריר העיקרי שמוריד אותה. הראייה הכפולה אנכית.',
  MLF: 'העצבים והשרירים כולם תקינים. נפגע ה-MLF (medial longitudinal fasciculus), מסילה בגזע המוח שמחברת את גרעין העצב השישי בצד אחד לגרעין העצב השלישי בצד השני, כדי ששתי העיניים יזוזו יחד במבט לצדדים. כשהיא נפגעת, העין בצד הפגיעה לא מצליחה לפנות לכיוון האף במבט לצד השני, והעין השנייה פונה החוצה כרגיל, ולרוב רועדת קצת (ניסטגמוס). מבט למעלה ולמטה תקין, ובהתכנסות (מבט לנקודה קרובה) גם העין "התקועה" פונה פנימה, כי השריר והעצב השלישי עצמם בסדר: הבעיה היא רק בחיבור. השם: "אופתלמופלגיה בין-גרעינית" (INO), לפי הצד של הפגיעה. אצל צעירים הסיבה השכיחה היא טרשת נפוצה (לעיתים בשני הצדדים), ואצל מבוגרים שבץ.',
  III: 'ארבעה שרירים לא עובדים, וגם השריר שמרים את העפעף. נשארים רק הישר הצדדי (VI) והאלכסוני העליון (IV), ולכן העין "למטה והחוצה". האישון רחב, כי גם הסיבים שמכווצים אותו עוברים בעצב השלישי.',
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
    // INO: העין בצד הפגיעה כמעט לא פונה לכיוון האף במבט לצדדים (אבל כן בהתכנסות, שלא מוצגת כאן)
    if (nerve === 'MLF') abd = Math.max(abd, -0.12);
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

// סגנון ומעברי צבע של האיור, באותה שפה כמו מעבדות הפנים והאישונים. חל רק על האיור הזה.
const STYLE = `
.eyes-stage .ex-skin { fill: url(#ex-skin); }
.eyes-stage .ex-socket { fill: url(#ex-socket); }
.eyes-stage .ex-bridge { fill: none; stroke: #9a6650; stroke-width: 1.8; stroke-linecap: round; opacity: 0.38; }
.eyes-stage .ex-bridge-hi { fill: #f0cdb4; opacity: 0.3; }
.eyes-stage .ex-nostril { fill: #7a4a3a; opacity: 0.35; }
.eyes-stage .ex-brow { fill: #4a3022; stroke: #3a251a; stroke-width: 1; stroke-linejoin: round; }
.eyes-stage .eye-white { fill: url(#ex-sclera); }
.eyes-stage .ex-vessel { fill: none; stroke: #d48a80; stroke-width: 0.7; opacity: 0.35; }
.eyes-stage .iris { fill: url(#ex-iris); stroke: none; }
.eyes-stage .ex-fiber { stroke: #9cc3cf; stroke-width: 0.9; opacity: 0.32; }
.eyes-stage .ex-fiber-d { stroke: #1f3d47; stroke-width: 1; opacity: 0.35; }
.eyes-stage .ex-collarette { fill: none; stroke: #b9946a; stroke-width: 1.3; opacity: 0.45; }
.eyes-stage .ex-limbus { fill: none; stroke: #16303a; stroke-width: 2.4; opacity: 0.85; }
.eyes-stage .pupil { fill: #07090b; }
.eyes-stage .glint { fill: #ffffff; opacity: 0.9; }
.eyes-stage .ex-glint2 { fill: #ffffff; opacity: 0.45; }
.eyes-stage .ex-lid { fill: url(#ex-lid); }
.eyes-stage .ex-lidedge { fill: none; stroke: #2a1a14; stroke-width: 2.6; stroke-linecap: round; }
.eyes-stage .ex-lidshadow { fill: none; stroke: #5a3426; stroke-width: 6; opacity: 0.18; }
.eyes-stage .ex-lash { fill: none; stroke: #241610; stroke-width: 1.2; stroke-linecap: round; opacity: 0.9; }
.eyes-stage .eye-line { fill: none; stroke: #6e4636; stroke-width: 1.2; }
.eyes-stage .ex-crease { fill: none; stroke: #8a5843; stroke-width: 1.5; stroke-linecap: round; opacity: 0.8; }
.eyes-stage .ex-lowlid { fill: none; stroke: #a06c56; stroke-width: 1.2; stroke-linecap: round; opacity: 0.75; }
.eyes-stage .stage-label { fill: #e8ecf1; paint-order: stroke; stroke: #0b0e12; stroke-width: 4px; stroke-linejoin: round; }
.eyes-stage .target-ring { stroke-width: 2.5; }
.eyes-stage .ex-target-halo { fill: none; stroke: #0b0e12; stroke-width: 5; opacity: 0.55; }
`;
const grad = (id, kind, attrs, stops) => s(kind, { id, ...attrs }, ...stops.map(([o, c, op = 1]) => s('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })));
const defs = s('defs', {},
  s('style', {}, document.createTextNode(STYLE)),
  grad('ex-skin', 'radialGradient', { cx: '50%', cy: '42%', r: '62%' }, [['0', '#e2b597'], ['0.6', '#cf9c7e'], ['1', '#a8705a']]),
  grad('ex-socket', 'radialGradient', {}, [['0.4', '#8a5340', 0.45], ['1', '#8a5340', 0]]),
  grad('ex-sclera', 'radialGradient', { cx: '50%', cy: '42%', r: '62%' }, [['0', '#fdfaf6'], ['0.7', '#ece4dc'], ['1', '#c9bcb0']]),
  grad('ex-iris', 'radialGradient', {}, [['0', '#6fa4b2'], ['0.45', '#4f8696'], ['0.85', '#2e5562'], ['1', '#1d3a44']]),
  grad('ex-lid', 'linearGradient', { x1: '0', y1: '0', x2: '0', y2: '1' }, [['0', '#d8a98b'], ['0.85', '#c48f72'], ['1', '#a06c56']]),
  // העור דוהה בשוליים אל הרקע
  // (בלי פילטר טשטוש: הוא מחושב מחדש בכל תזוזה של העיניים, ובטלפון זה גרם לעיכוב. מעבר שקיפות רדיאלי זול בהרבה)
  grad('ex-fade', 'radialGradient', { cx: '50%', cy: '48%', r: '50%' }, [['0', '#fff'], ['0.6', '#fff'], ['1', '#fff', 0]]),
  s('mask', { id: 'ex-face', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H },
    s('rect', { x: 40, y: 10, width: 560, height: 330, fill: 'url(#ex-fade)' })),
);
svg.append(defs);

// רקע ופלג הפנים העליון: עור, גשר האף וצללית סביב העיניים
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));
const face = s('g', { mask: 'url(#ex-face)' });
face.append(s('rect', { class: 'ex-skin', x: 0, y: 0, width: W, height: H }));
for (const side of ['R', 'L']) face.append(s('ellipse', { class: 'ex-socket', cx: EYES[side].cx + (side === 'R' ? 8 : -8), cy: EYES[side].cy - 4, rx: 90, ry: 56 }));
face.append(s('ellipse', { class: 'ex-bridge-hi', cx: 320, cy: 200, rx: 10, ry: 48 }));
face.append(s('path', { class: 'ex-bridge', d: 'M302 140 C308 172 306 214 296 262' }));
face.append(s('path', { class: 'ex-bridge', d: 'M338 140 C332 172 334 214 344 262' }));
face.append(s('path', { class: 'ex-bridge', d: 'M296 262 C290 284 300 296 320 298 C340 296 350 284 344 262' }));
face.append(s('ellipse', { class: 'ex-nostril', cx: 306, cy: 292, rx: 7, ry: 3.5 }));
face.append(s('ellipse', { class: 'ex-nostril', cx: 334, cy: 292, rx: 7, ry: 3.5 }));
svg.append(face);

// מיקום שפת העפעף העליון במנוחה (ביחס לגובה המרכז), ומשרעת המעקב אחרי מבט
const LID_REST = 4;
const parts = {};
for (const side of ['R', 'L']) {
  const { cx, cy } = EYES[side];
  // dir: 1 לכיוון האף. העין הימנית של האדם משמאל במסך, ולכן האף מימינה.
  const dir = side === 'R' ? 1 : -1;
  const almond = `M${cx - 62} ${cy} C${cx - 36} ${cy - 40} ${cx + 36} ${cy - 40} ${cx + 62} ${cy} C${cx + 36} ${cy + 38} ${cx - 36} ${cy + 38} ${cx - 62} ${cy} Z`;
  defs.append(s('clipPath', { id: `clip-${side}` }, s('path', { d: almond })));

  // גבה: עבה ליד האף, דקה בקצה
  const bIn = cx + dir * 52, bOut = cx - dir * 66;
  svg.append(s('path', { class: 'ex-brow', d: `M${bIn} ${cy - 48} C${cx + dir * 18} ${cy - 66} ${cx - dir * 36} ${cy - 68} ${bOut} ${cy - 52} C${cx - dir * 36} ${cy - 61} ${cx + dir * 18} ${cy - 57} ${bIn} ${cy - 41} Z` }));
  // קפל העפעף העליון
  svg.append(s('path', { class: 'ex-crease', d: `M${cx - 56} ${cy - 14} C${cx - 32} ${cy - 50} ${cx + 32} ${cy - 50} ${cx + 56} ${cy - 14}` }));

  svg.append(s('path', { class: 'eye-white', d: almond }));
  const ball = s('g', { 'clip-path': `url(#clip-${side})` });
  for (const k of [-1, 1]) ball.append(s('path', { class: 'ex-vessel', d: `M${cx + k * 60} ${cy + 2} C${cx + k * 50} ${cy - 2} ${cx + k * 44} ${cy + 5} ${cx + k * 36} ${cy + 3}` }));
  const iris = s('g', { class: 'iris-g' });
  iris.append(s('circle', { class: 'iris', cx, cy, r: 21 }));
  const fibers = s('g');
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + (i % 2) * 0.03;
    const r0 = 9.5 + (i % 3) * 0.7, r1 = 19 - (i % 4) * 0.7;
    fibers.append(s('line', { class: i % 3 ? 'ex-fiber' : 'ex-fiber-d', x1: cx + Math.cos(a) * r0, y1: cy + Math.sin(a) * r0, x2: cx + Math.cos(a) * r1, y2: cy + Math.sin(a) * r1 }));
  }
  iris.append(fibers);
  iris.append(s('circle', { class: 'ex-collarette', cx, cy, r: 12.5 }));
  iris.append(s('circle', { class: 'ex-limbus', cx, cy, r: 20.6 }));
  const pupil = s('circle', { class: 'pupil', cx, cy, r: 8.5 });
  iris.append(pupil);
  iris.append(s('circle', { class: 'glint', cx: cx + 7, cy: cy - 8, r: 3 }));
  iris.append(s('circle', { class: 'ex-glint2', cx: cx - 6, cy: cy + 7, r: 1.4 }));
  ball.append(iris);
  // העפעף העליון: עוקב מעט אחרי מבט למעלה ולמטה, וצונח בפגיעה בעצב III
  const edge = `M${cx - 66} ${cy - 2} C${cx - 36} ${cy - 37} ${cx + 36} ${cy - 37} ${cx + 66} ${cy - 2}`;
  const lid = s('g');
  lid.append(s('path', { class: 'ex-lid', d: `${edge} L${cx + 72} ${cy - 110} L${cx - 72} ${cy - 110} Z` }));
  lid.append(s('path', { class: 'ex-lidshadow', d: edge, transform: 'translate(0 3)' }));
  lid.append(s('path', { class: 'ex-lidedge', d: edge }));
  ball.append(lid);
  ball.append(s('path', { class: 'ex-lowlid', d: `M${cx - 54} ${cy + 8} C${cx - 32} ${cy + 33} ${cx + 32} ${cy + 33} ${cx + 54} ${cy + 8}` }));
  svg.append(ball);
  svg.append(s('path', { class: 'eye-line', d: almond }));
  // ריסים: יוצאים מקו העפעף וזזים איתו
  const lashes = s('g');
  for (let i = 1; i < 10; i++) {
    const t = i / 10, u = 1 - t;
    const x = u ** 3 * (cx - 66) + 3 * u * u * t * (cx - 36) + 3 * u * t * t * (cx + 36) + t ** 3 * (cx + 66);
    const y = u ** 3 * (cy - 2) + 3 * u * u * t * (cy - 37) + 3 * u * t * t * (cy - 37) + t ** 3 * (cy - 2);
    const lean = (x - cx) / 62;
    const len = 4.5 + 3 * Math.sin(t * Math.PI);
    lashes.append(s('path', { class: 'ex-lash', d: `M${x} ${y} q${lean * 2} ${-len * 0.7} ${lean * 5.5 + (lean > 0 ? 2 : -2)} ${-len}` }));
  }
  svg.append(lashes);
  svg.append(s('text', { class: 'stage-label', x: cx, y: cy + 70, 'text-anchor': 'middle' }, document.createTextNode(side === 'R' ? 'העין הימנית' : 'העין השמאלית')));
  parts[side] = { iris, pupil, lid, lashes, cx, cy };
}

// המטרה
const target = s('g', { class: 'target' });
target.append(s('circle', { r: 17.5, class: 'ex-target-halo' }));
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
    const { iris, pupil, lid, lashes } = parts[side];
    iris.setAttribute('transform', `translate(${p.h * RX} ${p.v * RY})`);
    const hit = lside === side && nerve === 'III';
    pupil.setAttribute('r', hit ? 14 : 8.5);
    // העפעף עוקב מעט אחרי המבט (עולה במבט למעלה, יורד במבט למטה); בפגיעה ב-III הוא צנוח כמעט עד הסוף
    const follow = LID_REST + (p.v < 0 ? p.v * 7 : p.v * 9);
    const off = hit && !lidLifted ? 30 : follow;
    lid.setAttribute('transform', `translate(0 ${off})`);
    lashes.setAttribute('transform', `translate(0 ${off})`);

    const list = document.getElementById(`mus-${side}`);
    // השרירים שהמבט הזה *דורש* — לפי הכיוון המבוקש, לא לפי מה שהעין הצליחה לעשות
    const mus = activeMuscles(gx * (side === 'R' ? -1 : 1), gy);
    list.innerHTML = mus.length
      ? mus.map((m) => {
        const bad = lside === side && MUSCLES[m].nerve === nerve;
        const noSignal = lside === side && nerve === 'MLF' && m === 'MR';
        return `<li class="${bad || noSignal ? 'is-bad' : ''}">${MUSCLES[m].name} <span class="nerve-num">(${MUSCLES[m].nerve})</span>${bad ? ': לא עובד' : noSignal ? ': תקין, אבל הפקודה לא מגיעה אליו' : ''}</li>`;
      }).join('')
      : '<li class="muted">מבט ישר: כל השרירים במתח מאוזן</li>';
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
  if (ptoClosed) text.textContent = 'העפעף הצנוח מכסה את העין, ולכן אין ראייה כפולה. הרימו אותו כדי לראות.';
  else if (sep < 0.05) text.textContent = 'תמונה אחת: העיניים מכוונות יחד.';
  else {
    const dir = Math.abs(dx) > Math.abs(dy) * 1.6 ? 'זו ליד זו (אופקית)' : Math.abs(dy) > Math.abs(dx) * 1.6 ? 'זו מעל זו (אנכית)' : 'באלכסון';
    text.textContent = `ראייה כפולה: שתי תמונות ${dir}. ${sep > 0.35 ? 'הפער גדול.' : 'הפער קטן.'}`;
  }

  document.getElementById('explain').textContent = EXPLAIN[nerve === 'none' ? 'none' : nerve];
  document.getElementById('lift').hidden = nerve !== 'III';
}

// ---------- אינטראקציה ----------

// עדכון אחד לכל פריים, גם כשהאצבע שולחת הרבה אירועי תנועה
let rafPending = 0;
function setFromPointer(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  gx = Math.max(-1, Math.min(1, (p.x - W / 2) / 290));
  gy = Math.max(-1, Math.min(1, (p.y - H / 2) / 150));
  if (!rafPending) rafPending = requestAnimationFrame(() => { rafPending = 0; update(); });
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
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
function stopAnim() { if (anim) { cancelAnimationFrame(anim.raf); clearTimeout(anim.t); anim = null; } }
document.getElementById('h-test').addEventListener('click', () => {
  stopAnim();
  let i = 0;
  anim = {};
  const next = () => {
    if (!anim) return;
    if (++i >= H_PATH.length) { anim = null; return; }
    const [fx, fy] = [gx, gy], [tx, ty] = H_PATH[i];
    if (reduced()) { gx = tx; gy = ty; update(); anim.t = setTimeout(next, 1100); return; }
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
