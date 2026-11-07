// מפות אינטראקטיביות לעמודי העצבים: אזורי העצב החמישי בפנים, מפת הלשון, וענפי עצב הפנים.
// כל מפה: html(opts) — מחרוזת (רצה גם ב-build, כך שהמפה נראית גם בלי JS), ו-init(el) — אינטראקציה בדפדפן.
// עצב מוצג בעמוד לפי השדה diagrams ב-content/nerves.js. מקורות: content/sources.md.

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// כל מפה בנויה כך: איור SVG עם אזורים (data-k), כפתורים לכל אזור, ופאנל הסבר.
function shell({ id, svg, buttons, intro, legend = '' }) {
  return `<div class="dgm" data-dgm="${id}">`
    + `<div class="dgm-fig">${svg}</div>`
    + `<div class="dgm-side">${buttons}${legend}<div class="dgm-info" aria-live="polite">${intro}</div></div></div>`;
}
const btns = (items, label) => `<div class="dgm-btns" role="group" aria-label="${esc(label)}">${items.map((it) =>
  `<button type="button" class="chip dgm-btn" data-k="${it.k}" aria-pressed="false" style="--dc:${it.c}">${it.label}</button>`).join('')}</div>`;

// חיבור משותף: לחיצה על כפתור או על אזור באיור בוחרת אותו; ריחוף בעכבר — תצוגה מקדימה.
// מחזיר api שאפשר לעדכן (intro, render) ולחבר מחדש אחרי החלפת האיור (bindSvg).
function wire(el, intro, render) {
  const box = el.querySelector('.dgm-info');
  let cur = null;
  const api = {
    intro, render,
    show(k) {
      el.querySelectorAll('[data-k]').forEach((x) => {
        const isBtn = x.classList.contains('dgm-btn');
        x.classList.toggle('is-on', x.dataset.k === k);
        x.classList.toggle('is-off', !!k && x.dataset.k !== k && !isBtn);
        if (isBtn) x.setAttribute('aria-pressed', String(x.dataset.k === k));
      });
      box.innerHTML = k ? api.render(k) : api.intro;
    },
    reset() { cur = null; api.show(null); },
    bindSvg() {
      const svg = el.querySelector('.dgm-fig svg');
      svg.addEventListener('pointerover', (e) => {
        if (e.pointerType !== 'mouse') return;
        const t = e.target.closest('[data-k]');
        api.show(t ? t.dataset.k : cur);
      });
      svg.addEventListener('pointerleave', () => api.show(cur));
    },
  };
  el.addEventListener('click', (e) => {
    const t = e.target.closest('[data-k]');
    if (!t) return;
    cur = cur === t.dataset.k ? null : t.dataset.k;
    api.show(cur);
  });
  api.bindSvg();
  return api;
}

// ---------- 1. אזורי העצב החמישי בפנים ----------

const FACE_ZONES = {
  v1: { label: 'V1 · העיני', c: '#7cc7dc', title: 'הענף העיני (V1)',
    area: 'המצח והקרקפת עד קודקוד הראש, העפעף העליון, הקרנית, וגב האף עד הקצה.',
    exit: 'יוצא מהגולגולת דרך הסדק העליון של ארובת העין.', note: 'תחושה בלבד. זה גם הענף שמרגיש את הקרנית ברפלקס הקרנית.' },
  v2: { label: 'V2 · הלסת העליונה', c: '#c3a6f0', title: 'ענף הלסת העליונה (V2)',
    area: 'העפעף התחתון, הלחי, צד האף, השפה העליונה, השיניים העליונות והחך.',
    exit: 'יוצא דרך החור העגול, ומגיע לפנים דרך פתח מתחת לארובת העין.', note: 'תחושה בלבד.' },
  v3: { label: 'V3 · הלסת התחתונה', c: '#f0a372', title: 'ענף הלסת התחתונה (V3)',
    area: 'השפה התחתונה, הסנטר, עור הלסת התחתונה, השיניים התחתונות, העור שלפני האוזן ועד הרקה, וגם תחושת מגע בשני השלישים הקדמיים של הלשון.',
    exit: 'יוצא דרך החור הסגלגל.', note: 'הענף היחיד שנושא גם סיבים תנועתיים, לשרירי הלעיסה.' },
  c2: { label: 'זווית הלסת', c: '#8a95a3', title: 'זווית הלסת: לא העצב החמישי',
    area: 'העור שמעל זווית הלסת ומתחת לאוזן.',
    exit: 'מקבל תחושה מעצב צווארי (great auricular nerve, ממקטעי חוט השדרה C2–C3).', note: 'לכן כשבודקים את העצב החמישי, בודקים במצח, בלחי ובסנטר, ולא בזווית הלסת.' },
};

function faceZonesSvg() {
  const face = 'M150 28 C214 28 252 74 254 140 C256 176 250 206 242 232 C232 268 214 306 186 328 C172 338 160 342 150 342 C140 342 128 338 114 328 C86 306 68 268 58 232 C50 206 44 176 46 140 C48 74 86 28 150 28 Z';
  return `<svg class="dgm-svg" viewBox="0 0 300 370" role="img" aria-label="פנים מלפנים, מחולקות לשלושת אזורי התחושה של העצב החמישי" direction="ltr">
  <defs><clipPath id="fz-clip"><path d="${face}"/></clipPath></defs>
  <path d="M48 150 C30 150 26 196 44 214 Z M252 150 C270 150 274 196 256 214 Z" class="dgm-ear"/>
  <g clip-path="url(#fz-clip)">
    <path data-k="v1" class="dgm-zone" style="--dc:${FACE_ZONES.v1.c}" d="M0 0 H300 V146 L184 146 C176 158 172 176 170 196 L164 236 H136 L130 196 C128 176 124 158 116 146 L0 146 Z"/>
    <path data-k="v2" class="dgm-zone" style="--dc:${FACE_ZONES.v2.c}" d="M58 146 H116 C124 158 128 176 130 196 L136 236 H164 L170 196 C172 176 176 158 184 146 H242 C242 190 232 232 222 262 C198 272 174 274 150 274 C126 274 102 272 78 262 C68 232 58 190 58 146 Z"/>
    <path data-k="v3" class="dgm-zone" style="--dc:${FACE_ZONES.v3.c}" d="M0 120 H58 C58 190 68 232 78 262 C102 272 126 274 150 274 C174 274 198 272 222 262 C232 232 242 190 242 120 H300 V370 H0 Z"/>
    <path data-k="c2" class="dgm-zone" style="--dc:${FACE_ZONES.c2.c}" d="M0 232 L52 236 C60 270 74 302 96 334 L60 370 L0 370 Z M300 232 L248 236 C240 270 226 302 204 334 L240 370 L300 370 Z"/>
  </g>
  <path d="${face}" class="dgm-outline"/>
  <g class="dgm-features">
    <path d="M92 132 C106 124 122 124 134 130 M166 130 C178 124 194 124 208 132"/>
    <path d="M96 158 C106 150 124 150 132 158 C124 164 106 164 96 158 Z M168 158 C176 150 194 150 204 158 C194 164 176 164 168 158 Z"/>
    <path d="M150 164 C148 196 140 216 134 230 C142 238 158 238 166 230 C160 216 152 196 150 164"/>
    <path d="M118 270 C134 262 166 262 182 270 C166 282 134 282 118 270 Z"/>
  </g>
  <g class="dgm-tags" text-anchor="middle">
    <text x="150" y="92">V1</text><text x="100" y="214">V2</text><text x="200" y="214">V2</text><text x="150" y="316">V3</text>
  </g>
</svg>`;
}

const FACE_INTRO = '<p>לחצו על אזור בפנים או על אחד הכפתורים. כל ענף של העצב החמישי מרגיש שליש אחר של הפנים, והגבולות ביניהם חדים יחסית.</p>';
const faceInfo = (k) => { const z = FACE_ZONES[k]; return `<p class="dgm-title" style="--dc:${z.c}">${z.title}</p><p>${z.area}</p><p class="muted">${z.exit}</p><p>${z.note}</p>`; };

// ---------- 2. מפת הלשון ----------

const TONGUE_NERVES = {
  V: { roman: 'V3', name: 'העצב הלשוני (ענף של V3)', c: '#7cc7dc' },
  VII: { roman: 'VII', name: 'עצב הפנים (דרך עצב מיתר התוף)', c: '#c3a6f0' },
  IX: { roman: 'IX', name: 'העצב הלשוני-לועי', c: '#7fcf9b' },
  X: { roman: 'X', name: 'העצב התועה', c: '#ef9a8f' },
  XII: { roman: 'XII', name: 'העצב תת-הלשוני', c: '#f0c46b' },
};
// מי אחראי על כל אזור בכל מצב: front — שני השלישים הקדמיים, back — השליש האחורי, root — בסיס הלשון והמכסה של הגרון
const TONGUE_MODES = {
  taste: { label: 'טעם', front: 'VII', back: 'IX', root: 'X',
    text: 'הטעם מגיע למוח בשלושה עצבים שונים: מהחלק הקדמי בעצב הפנים, מהחלק האחורי (כולל פטמות הטעם הגדולות שבצורת V) בעצב הלשוני-לועי, ומבסיס הלשון ומהמכסה של הגרון בעצב התועה.' },
  touch: { label: 'מגע וכאב', front: 'V', back: 'IX', root: 'X',
    text: 'מגע, כאב וחום בחלק הקדמי מגיעים דרך ענף של העצב החמישי, כך שבאותו חלק של הלשון הטעם והמגע נוסעים בעצבים שונים. מהחלק האחורי הם מגיעים בעצב הלשוני-לועי.' },
  move: { label: 'תנועה', front: 'XII', back: 'XII', root: 'XII',
    text: 'כל שרירי הלשון מקבלים פקודות מהעצב התת-לשוני (XII), חוץ משריר אחד, palatoglossus, שמחבר את הלשון לחך ומקבל עצבים מהעצב התועה.' },
};
const TONGUE_PART = { front: 'שני השלישים הקדמיים', back: 'השליש האחורי', root: 'בסיס הלשון והמכסה של הגרון' };

function tongueSvg(mode) {
  const m = TONGUE_MODES[mode];
  const fill = (part) => `style="--dc:${TONGUE_NERVES[m[part]].c}"`;
  const papillae = [[104, 132], [122, 142], [140, 150], [160, 150], [178, 142], [196, 132], [150, 122]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6"/>`).join('');
  return `<svg class="dgm-svg" viewBox="0 0 300 380" role="img" aria-label="הלשון מלמעלה, מחולקת לחלק קדמי, אחורי ובסיס" direction="ltr">
  <path data-k="root" class="dgm-zone" ${fill('root')} d="M112 30 C120 14 180 14 188 30 C196 46 176 62 150 62 C124 62 104 46 112 30 Z"/>
  <path data-k="back" class="dgm-zone" ${fill('back')} d="M64 92 C70 72 96 64 150 64 C204 64 230 72 236 92 L242 128 L150 168 L58 128 Z"/>
  <path data-k="front" class="dgm-zone" ${fill('front')} d="M58 128 L150 168 L242 128 C248 190 238 262 216 312 C198 350 176 364 150 364 C124 364 102 350 84 312 C62 262 52 190 58 128 Z"/>
  <path class="dgm-outline" d="M64 92 C70 72 96 64 150 64 C204 64 230 72 236 92 C248 170 240 262 216 312 C198 350 176 364 150 364 C124 364 102 350 84 312 C60 262 52 170 64 92 Z"/>
  <path class="dgm-sulcus" d="M58 128 L150 168 L242 128"/>
  <path class="dgm-midline" d="M150 176 L150 340"/>
  <g class="dgm-papillae">${papillae}</g>
  <g class="dgm-tags" text-anchor="middle">
    <text x="150" y="42">${TONGUE_NERVES[m.root].roman}</text>
    <text x="150" y="104">${TONGUE_NERVES[m.back].roman}</text>
    <text x="150" y="262">${TONGUE_NERVES[m.front].roman}</text>
  </g>
  <g class="dgm-small" text-anchor="middle"><text x="150" y="378">קצה הלשון</text><text x="150" y="10">← לכיוון הגרון</text></g>
</svg>`;
}
const tongueLegend = (mode) => {
  const m = TONGUE_MODES[mode];
  const used = [...new Set([m.front, m.back, m.root])];
  return `<ul class="dgm-legend">${used.map((n) => `<li><i style="--dc:${TONGUE_NERVES[n].c}"></i><b>${TONGUE_NERVES[n].roman}</b> ${TONGUE_NERVES[n].name}</li>`).join('')}</ul>`;
};
const tongueInfo = (mode, k) => {
  const m = TONGUE_MODES[mode]; const n = TONGUE_NERVES[m[k]];
  return `<p class="dgm-title" style="--dc:${n.c}">${TONGUE_PART[k]} · ${m.label}</p><p><b>${n.roman}</b> · ${n.name}.</p><p class="muted">${m.text}</p>`;
};

// ---------- 3. ענפי עצב הפנים ----------

const BRANCHES = {
  temporal: { title: 'הענף הרקתי', label: 'רקתי', en: 'Temporal', c: '#7cc7dc', d: 'M214 196 C210 160 196 128 170 96', muscles: 'שריר המצח והחלק העליון של השריר הטבעתי של העין.', action: 'הרמת גבות וקימוט המצח.' },
  zygomatic: { title: 'הענף הזיגומטי', label: 'זיגומטי', en: 'Zygomatic', c: '#c3a6f0', d: 'M212 202 C190 186 160 172 128 160', muscles: 'השריר הטבעתי של העין.', action: 'עצימת עיניים חזקה.' },
  buccal: { title: 'הענף הבוקלי', label: 'בוקלי', en: 'Buccal', c: '#7fcf9b', d: 'M212 210 C186 210 156 214 116 218', muscles: 'שרירי הלחי (buccinator) והשרירים שמרימים את השפה העליונה וזוויות הפה.', action: 'חיוך, ניפוח לחיים, שריקה.' },
  mandibular: { title: 'ענף שפת הלסת', label: 'שפת הלסת', en: 'Marginal mandibular', c: '#f0a372', d: 'M214 222 C200 250 178 268 132 272', muscles: 'השרירים של השפה התחתונה והסנטר.', action: 'הורדת השפה התחתונה, "פרצוף עצוב".' },
  cervical: { title: 'הענף הצווארי', label: 'צווארי', en: 'Cervical', c: '#ef9a8f', d: 'M220 228 C222 262 216 296 204 330', muscles: 'שריר הצוואר הדק (platysma).', action: 'מתיחת עור הצוואר כלפי מטה.' },
};

function branchesSvg() {
  const paths = Object.entries(BRANCHES).map(([k, b]) => `<g data-k="${k}" class="dgm-branch" style="--dc:${b.c}"><path class="dgm-hit" d="${b.d}"/><path d="${b.d}"/></g>`).join('');
  return `<svg class="dgm-svg" viewBox="0 0 320 350" role="img" aria-label="ראש בפרופיל, ועליו חמשת הענפים של עצב הפנים שיוצאים מבלוטת הפרוטיד" direction="ltr">
  <path class="dgm-head" d="M248 336 L250 292 C276 286 296 260 300 226 C306 186 304 140 290 104 C270 52 222 22 166 22 C110 22 72 54 58 96 C52 114 52 128 48 138 L30 172 C26 178 30 184 38 184 L46 186 L44 200 L52 206 L48 216 C46 228 54 236 66 236 L74 238 C80 256 94 266 116 268 L140 270 C150 296 160 318 172 336 Z"/>
  <path class="dgm-ear" d="M236 170 C232 146 252 134 266 146 C280 158 280 196 268 214 C260 226 244 222 240 208 Z"/>
  <path class="dgm-parotid" d="M222 176 C236 178 244 196 242 216 C240 238 232 252 220 252 C206 250 200 230 202 210 C204 192 210 176 222 176 Z"/>
  <path class="dgm-features" d="M96 150 C106 144 120 144 128 150 M92 132 C104 124 122 124 134 130 M82 228 C94 232 108 232 118 228"/>
  ${paths}
  <circle class="dgm-origin" cx="226" cy="200" r="5"/>
  <g class="dgm-small"><text x="248" y="268">בלוטת הפרוטיד</text></g>
</svg>`;
}
const branchesInfo = (k) => { const b = BRANCHES[k]; return `<p class="dgm-title" style="--dc:${b.c}">${b.title} <span class="muted" dir="ltr" lang="en">(${b.en})</span></p><p><b>שרירים:</b> ${b.muscles}</p><p><b>תנועה:</b> ${b.action}</p>`; };
const BRANCHES_INTRO = '<p>עצב הפנים יוצא מהגולגולת מתחת לאוזן, חודר לבלוטת הפרוטיד ומתפצל בתוכה לחמישה ענפים. לחצו על ענף כדי לראות אילו שרירים הוא מפעיל.</p><p class="muted" dir="ltr" lang="en">To Zanzibar By Motor Car</p>';

// ---------- רישום ----------

export const DIAGRAMS = {
  'face-zones': {
    title: 'מפת התחושה של הפנים',
    html: () => shell({ id: 'face-zones', svg: faceZonesSvg(), intro: FACE_INTRO,
      buttons: btns(Object.entries(FACE_ZONES).map(([k, z]) => ({ k, label: z.label, c: z.c })), 'אזורי העצב החמישי') }),
    init: (el) => { wire(el, FACE_INTRO, faceInfo); },
  },
  'facial-branches': {
    title: 'חמשת הענפים בפנים',
    html: () => shell({ id: 'facial-branches', svg: branchesSvg(), intro: BRANCHES_INTRO,
      buttons: btns(Object.entries(BRANCHES).map(([k, b]) => ({ k, label: b.label, c: b.c })), 'ענפי עצב הפנים') }),
    init: (el) => { wire(el, BRANCHES_INTRO, branchesInfo); },
  },
  tongue: {
    title: 'מפת הלשון: מי מרגיש, מי טועם, מי מזיז',
    html: ({ mode = 'taste' } = {}) => {
      const modes = `<div class="dgm-modes" role="group" aria-label="מה מציגים">${Object.entries(TONGUE_MODES).map(([k, m]) =>
        `<button type="button" class="chip" data-mode="${k}" aria-pressed="${k === mode}">${m.label}</button>`).join('')}</div>`;
      return shell({ id: 'tongue', svg: tongueSvg(mode), intro: `<p>${TONGUE_MODES[mode].text}</p>`, buttons: modes, legend: tongueLegend(mode) })
        .replace('data-dgm="tongue"', `data-dgm="tongue" data-mode="${mode}"`);
    },
    init: (el) => {
      let mode = el.dataset.mode;
      const api = wire(el, `<p>${TONGUE_MODES[mode].text}</p>`, (k) => tongueInfo(mode, k));
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-mode]');
        if (!b || b.dataset.mode === mode) return;
        mode = b.dataset.mode;
        el.querySelector('.dgm-fig').innerHTML = tongueSvg(mode);
        el.querySelector('.dgm-legend').outerHTML = tongueLegend(mode);
        el.querySelectorAll('button[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === mode)));
        api.intro = `<p>${TONGUE_MODES[mode].text}</p>`;
        api.render = (k) => tongueInfo(mode, k);
        api.bindSvg();
        api.reset();
      });
    },
  },
};
