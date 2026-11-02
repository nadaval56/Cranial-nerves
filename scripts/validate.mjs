// בדיקת התוכן לפני build: כל השדות קיימים, הקישורים בין עצבים ופתחים תקינים, והתשובות בטווח.
// נכשל (exit 1) אם משהו חסר — כדי שעמוד שבור לא יעלה לאוויר.
import { NERVES, TYPES, BRAIN, COMPONENTS, byId } from '../content/nerves.js';
import { FORAMINA } from '../content/foramina.js';
import { EVENTS } from '../content/timeline.js';

const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const foramina = new Set(FORAMINA.map((f) => f.id));

if (NERVES.length !== 12) err('nerves', `צריכים להיות 12 עצבים, יש ${NERVES.length}`);
NERVES.forEach((n, i) => {
  const w = `עצב ${n.id ?? i}`;
  for (const k of ['id', 'roman', 'name', 'latin', 'en', 'type', 'brain', 'attach', 'exit', 'foramen', 'tagline', 'intro', 'path', 'test', 'lesion', 'facts', 'try', 'related', 'components']) {
    if (n[k] == null || (Array.isArray(n[k]) && !n[k].length)) err(w, `חסר שדה ${k}`);
  }
  if (n.num !== i + 1) err(w, `מספר ${n.num} לא תואם למקום ${i + 1}`);
  if (!TYPES[n.type]) err(w, `סוג לא מוכר: ${n.type}`);
  if (!BRAIN[n.brain]) err(w, `מקום חיבור לא מוכר: ${n.brain}`);
  if (!foramina.has(n.foramen)) err(w, `פתח לא מוכר: ${n.foramen}`);
  else if (!FORAMINA.find((f) => f.id === n.foramen).nerves.includes(n.id)) err(w, `הפתח ${n.foramen} לא מונה את העצב`);
  n.components?.forEach((c) => { if (!COMPONENTS[c.kind]) err(w, `מרכיב לא מוכר: ${c.kind}`); });
  n.related?.forEach((r) => { if (!byId[r]) err(w, `עצב קשור לא קיים: ${r}`); });
  const t = n.try;
  if (t && !(Number.isInteger(t.answer) && t.answer >= 0 && t.answer < t.options.length)) err(w, 'תשובה מחוץ לטווח');
  if (!n.test?.steps?.length || !n.test?.tip) err(w, 'חסרה בדיקה');
  // מירכאות: ישרות בלבד (בקשה של נדב)
  if (/[„“”]/.test(JSON.stringify(n))) err(w, 'מירכאות לא ישרות');
});
FORAMINA.forEach((f) => f.nerves.forEach((id) => { if (!byId[id]) err(`פתח ${f.id}`, `עצב לא קיים: ${id}`); }));
EVENTS.forEach((e) => { if (!e.source?.url || !e.title || !e.text) err(`ציר זמן ${e.id}`, 'חסר מקור, כותרת או טקסט'); });

if (errors.length) {
  console.error(`✗ ${errors.length} שגיאות:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${NERVES.length} עצבים, ${FORAMINA.length} פתחים, ${EVENTS.length} אירועים — הכול תקין`);
