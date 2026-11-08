// רצועת אק"ג של 3 לידים (I, II, III) כ-SVG סטטי, לקליניקה.
// rhythm: 'sinus' (סדיר, עם גל P) או 'af' (פרפור פרוזדורים: מרווחים לא סדירים, בלי גל P, קו בסיס רוטט).
// הצורה סכמטית ומפושטת: היא נועדה להראות את ההבדל בין קצב סדיר ללא סדיר, לא לפענוח מדויק.

const W = 640, LEAD_H = 92, SEC = 6; // 6 שניות לרוחב הרצועה
const PX_PER_S = W / SEC;
const LEADS = [
  { name: 'I', amp: 0.55, t: 0.22, p: 0.08 },
  { name: 'II', amp: 1, t: 0.3, p: 0.13 },
  { name: 'III', amp: 0.45, t: 0.1, p: 0.06 },
];

// מספרים "אקראיים" קבועים לכל מקרה, כדי שהרצועה תיראה אותו דבר בכל פעם
function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

const gauss = (x, mu, sd) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd));

// גל אחד של פעימה, ביחידות "מילי-וולט" יחסיות, כפונקציה של הזמן מתחילת הפעימה (שניות)
function beat(t, lead, withP) {
  let v = 0;
  if (withP) v += lead.p * gauss(t, -0.16, 0.035);
  v += -0.08 * lead.amp * gauss(t, -0.025, 0.01); // Q
  v += 1.0 * lead.amp * gauss(t, 0, 0.012); // R
  v += -0.22 * lead.amp * gauss(t, 0.03, 0.012); // S
  v += lead.t * gauss(t, 0.26, 0.06); // T
  return v;
}

function beatTimes(rhythm, rate, rand) {
  // פעימות בתוך "מחזור" אחד של SEC שניות. הרצועה בנויה משני מחזורים זהים, כדי שאפשר יהיה לגלול אותה בלולאה בלי תפר
  const mean = 60 / Math.max(30, Math.min(180, rate || 76));
  const n = Math.max(1, Math.round(SEC / mean));
  const step = SEC / n;
  const times = [];
  if (rhythm === 'af') {
    let t = rand() * step;
    while (t < SEC) { times.push(t); t += mean * (0.55 + rand() * 0.95); }
  } else {
    for (let i = 0; i < n; i++) times.push(i * step + step * 0.4);
  }
  return times;
}

export function ecgSvg({ rhythm = 'sinus', rate = 76, seed = 'x', title = 'אק"ג' } = {}) {
  const rand = rng(seed);
  const base = beatTimes(rhythm, rate, rand);
  const times = [-1, 0, 1, 2].flatMap((k) => base.map((b) => b + k * SEC));
  const fib = [rand() * 6, rand() * 6, rand() * 6];
  const grid = [];
  for (let x = 0; x <= W; x += 8) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${LEAD_H * 3}" class="ecg-g${x % 40 ? '' : ' ecg-g2'}"/>`);
  for (let y = 0; y <= LEAD_H * 3; y += 8) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" class="ecg-g${y % 40 ? '' : ' ecg-g2'}"/>`);
  const fibW = (2 * Math.PI) / SEC; // תדרי הרטט כפולות שלמות של המחזור, כדי שגם הם יתחברו בלי תפר
  const paths = LEADS.map((lead, li) => {
    const y0 = LEAD_H * li + LEAD_H * 0.62;
    const pts = [];
    for (let x = 0; x <= 2 * W; x += 1.5) {
      const ts = x / PX_PER_S;
      let v = 0;
      for (const b of times) { const d = ts - b; if (d > -0.3 && d < 0.6) v += beat(d, lead, rhythm !== 'af'); }
      if (rhythm === 'af') v += 0.035 * (Math.sin(ts * fibW * 35 + fib[li]) + 0.7 * Math.sin(ts * fibW * 51 + fib[li] * 2) + 0.5 * Math.sin(ts * fibW * 68));
      pts.push(`${x.toFixed(1)},${(y0 - v * 46).toFixed(1)}`);
    }
    return `<text x="${W - 8}" y="${LEAD_H * li + 18}" class="ecg-lead" text-anchor="end">${lead.name}</text><polyline points="${pts.join(' ')}" class="ecg-line"/>`;
  }).join('');
  // המסילה (ecg-track) רחבה פי שניים מהחלון וזזה שמאלה במחזור אחד, בלולאה
  return `<svg class="ecg" viewBox="0 0 ${W} ${LEAD_H * 3}" role="img" aria-label="${title}" direction="ltr"><defs><clipPath id="ecg-clip"><rect width="${W}" height="${LEAD_H * 3}"/></clipPath></defs>${grid.join('')}`
    + `<g clip-path="url(#ecg-clip)"><g class="ecg-track" style="--ecg-w:${W}px;--ecg-s:${SEC}s">${paths.replace(/<text[^>]*>[^<]*<\/text>/g, '')}</g></g>`
    + LEADS.map((lead, li) => `<text x="${W - 8}" y="${LEAD_H * li + 18}" class="ecg-lead" text-anchor="end">${lead.name}</text>`).join('') + `</svg>`;
}
