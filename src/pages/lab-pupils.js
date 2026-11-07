// רפלקס האישון לאור: פנס לעין אחת, ושני האישונים מגיבים.
// המודל: האור "נכנס" למוח רק דרך עצב II תקין של העין המוארת. המרכז ברפלקס (באזור הפרה-טקטלי)
// שולח פקודה לשני גרעיני אדינגר-וסטפאל, ומשם — דרך עצב III של כל צד — לאישון של אותו צד.
// הגדלים במ"מ משוערים, להמחשה: חדר מואר-למחצה 5, תגובה לאור 2.5, עצב III פגוע 7.

import { s } from '../lib/dom.js';

const root = document.getElementById('lab-root');
root.innerHTML = '';

const LESIONS = [
  { id: 'none', label: 'בלי פגיעה' },
  { id: 'II-R', label: 'II ימין' }, { id: 'II-L', label: 'II שמאל' },
  { id: 'III-R', label: 'III ימין' }, { id: 'III-L', label: 'III שמאל' },
];
const LIGHTS = [
  { id: 'off', label: 'כבוי' },
  { id: 'R', label: 'על העין הימנית' },
  { id: 'L', label: 'על העין השמאלית' },
  { id: 'swing', label: 'פנס מתנדנד' },
];
const SIZE = { rest: 5, lit: 2.5, blown: 7 };

let lesion = 'none';
let lightMode = 'off';
let light = 'off'; // איפה הפנס עכשיו (במצב מתנדנד מתחלף)
let swingTimer = null;

// ---------- במה ----------

const W = 640, H = 300;
const EYES = { R: { cx: 220, cy: 120 }, L: { cx: 420, cy: 120 } };
const PX = 2.9; // פיקסלים למ"מ

const svg = s('svg', { class: 'pupil-stage', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'שתי עיניים, פנס, ותרשים של מסלול הרפלקס', direction: 'ltr' });
const defs = s('defs');
const glow = s('radialGradient', { id: 'beam' });
glow.append(s('stop', { offset: '0', 'stop-color': '#fff7d6', 'stop-opacity': '0.85' }), s('stop', { offset: '1', 'stop-color': '#fff7d6', 'stop-opacity': '0' }));
defs.append(glow);
svg.append(defs);
svg.append(s('rect', { class: 'stage-bg', x: 0, y: 0, width: W, height: H, rx: 18 }));

const parts = {};
for (const side of ['R', 'L']) {
  const { cx, cy } = EYES[side];
  const almond = `M${cx - 70} ${cy} C${cx - 40} ${cy - 46} ${cx + 40} ${cy - 46} ${cx + 70} ${cy} C${cx + 40} ${cy + 44} ${cx - 40} ${cy + 44} ${cx - 70} ${cy} Z`;
  defs.append(s('clipPath', { id: `pclip-${side}` }, s('path', { d: almond })));
  svg.append(s('path', { class: 'eye-white', d: almond }));
  const ball = s('g', { 'clip-path': `url(#pclip-${side})` });
  ball.append(s('circle', { class: 'iris iris-big', cx, cy, r: 30 }));
  const pupil = s('circle', { class: 'pupil pupil-anim', cx, cy, r: SIZE.rest * PX });
  ball.append(pupil);
  ball.append(s('circle', { class: 'glint', cx: cx + 9, cy: cy - 10, r: 3.5 }));
  const lid = s('rect', { class: 'lid lid-anim', x: cx - 80, y: cy - 60, width: 160, height: 16 });
  ball.append(lid);
  svg.append(ball);
  svg.append(s('path', { class: 'eye-line', d: almond }));
  const beam = s('ellipse', { class: 'beam', cx, cy, rx: 70, ry: 54, fill: 'url(#beam)' });
  svg.append(beam);
  svg.append(s('text', { class: 'stage-label', x: cx, y: cy + 72, 'text-anchor': 'middle' }, document.createTextNode(side === 'R' ? 'העין הימנית' : 'העין השמאלית')));
  const mm = s('text', { class: 'stage-mm', x: cx, y: cy - 58, 'text-anchor': 'middle' });
  svg.append(mm);
  parts[side] = { pupil, lid, beam, mm };
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
  <fieldset class="chip-set"><legend>פגיעה בעצב <span class="muted">(ימין ושמאל של האדם)</span></legend>
    ${LESIONS.map((l) => `<button type="button" class="chip" data-lesion="${l.id}" aria-pressed="${l.id === lesion}">${l.label}</button>`).join('')}
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
  const input = light !== 'off' && ii[light];
  const size = {};
  for (const e of ['R', 'L']) size[e] = !iii[e] ? SIZE.blown : input ? SIZE.lit : SIZE.rest;
  return { nerve, side, ii, iii, input, size };
}

const sideName = { R: 'הימנית', L: 'השמאלית' };

function explain(st) {
  if (light === 'off') {
    if (st.nerve === 'III') return `גם בלי פנס רואים את הפגיעה: האישון ${st.side === 'R' ? 'הימני' : 'השמאלי'} רחב והעפעף צנוח. הדליקו את הפנס.`;
    if (st.nerve === 'II') return 'בלי אור, אי אפשר לראות פגיעה בעצב II: האישונים נראים רגילים ושווים. הדליקו את הפנס על כל עין.';
    return 'בחדר מואר-למחצה שני האישונים בגודל בינוני ושווה. הדליקו את הפנס.';
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
    t += ` לכן מתכווצים גם האישון בעין ${lit} (תגובה ישירה) וגם בעין ${other} (תגובה מוסכמת).`;
  }
  return t;
}

function update() {
  const st = state();
  for (const e of ['R', 'L']) {
    const { pupil, lid, beam, mm } = parts[e];
    pupil.style.transform = `scale(${st.size[e] / SIZE.rest})`;
    lid.setAttribute('height', !st.iii[e] ? 62 : 16);
    beam.classList.toggle('is-on', light === e);
    mm.textContent = `${st.size[e]} מ"מ`;
    const word = !st.iii[e] ? 'רחב, לא מגיב' : st.size[e] === SIZE.lit ? (light === e ? 'מתכווץ (ישיר)' : 'מתכווץ (מוסכם)') : 'בגודל בינוני';
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
  document.getElementById('explain').textContent = explain(st);
}

function setLightMode(mode) {
  lightMode = mode;
  clearInterval(swingTimer);
  controls.querySelectorAll('[data-light]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.light === mode)));
  if (mode === 'swing') {
    light = 'R';
    swingTimer = setInterval(() => { light = light === 'R' ? 'L' : 'R'; update(); }, 1800);
  } else light = mode;
  update();
}

controls.addEventListener('click', (e) => {
  const l = e.target.closest('[data-light]');
  if (l) setLightMode(l.dataset.light);
  const les = e.target.closest('[data-lesion]');
  if (les) {
    lesion = les.dataset.lesion;
    controls.querySelectorAll('[data-lesion]').forEach((c) => c.setAttribute('aria-pressed', String(c === les)));
    update();
  }
});

update();
