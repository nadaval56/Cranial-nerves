// בדיקת התוכן לפני build: כל השדות קיימים, הקישורים בין עצבים ופתחים תקינים, והתשובות בטווח.
// נכשל (exit 1) אם משהו חסר — כדי שעמוד שבור לא יעלה לאוויר.
import { NERVES, TYPES, BRAIN, COMPONENTS, byId } from '../content/nerves.js';
import { FORAMINA } from '../content/foramina.js';
import { EVENTS } from '../content/timeline.js';
import { DIAGRAMS } from '../src/lib/diagrams.js';
import { CASES, LEVELS } from '../content/cases.js';
import { ACTIONS, actionById, REQUIRED, REGIONS, DEVICES } from '../content/clinic-actions.js';
import { DISTRACTORS, distractorById, ADD_KEYS } from '../content/distractors.js';
import { existsSync } from 'node:fs';
import { CONDITIONS, SECTION_TITLES } from '../content/conditions.js';

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
  (n.foramina ?? []).forEach((id) => { if (!foramina.has(id)) err(w, `פתח לא מוכר: ${id}`); });
  if (!foramina.has(n.foramen)) err(w, `פתח לא מוכר: ${n.foramen}`);
  else if (!FORAMINA.find((f) => f.id === n.foramen).nerves.includes(n.id)) err(w, `הפתח ${n.foramen} לא מונה את העצב`);
  n.components?.forEach((c) => { if (!COMPONENTS[c.kind]) err(w, `מרכיב לא מוכר: ${c.kind}`); });
  n.diagrams?.forEach((d) => { if (!DIAGRAMS[d.id]) err(w, `מפה לא קיימת: ${d.id}`); });
  n.related?.forEach((r) => { if (!byId[r]) err(w, `עצב קשור לא קיים: ${r}`); });
  const t = n.try;
  if (t && !(Number.isInteger(t.answer) && t.answer >= 0 && t.answer < t.options.length)) err(w, 'תשובה מחוץ לטווח');
  if (!n.test?.steps?.length || !n.test?.tip) err(w, 'חסרה בדיקה');
  // מירכאות: ישרות בלבד (בקשה של נדב)
  if (/[„“”]/.test(JSON.stringify(n))) err(w, 'מירכאות לא ישרות');
});
FORAMINA.forEach((f) => f.nerves.forEach((id) => { if (!byId[id]) err(`פתח ${f.id}`, `עצב לא קיים: ${id}`); }));
EVENTS.forEach((e) => { if (!e.source?.url || !e.title || !e.text) err(`ציר זמן ${e.id}`, 'חסר מקור, כותרת או טקסט'); });

// מקרי הקליניקה
const caseIds = new Set();
const pageExists = (href) => {
  const [file, hash] = href.split('#');
  const m = file.match(/^nerve-([\w-]+)\.html$/);
  const ok = m ? (m[1] === 'zero' || !!byId[m[1]]) : /^press-[\w-]+\.html$/.test(file) || /^condition-[\w-]+\.html$/.test(file) || existsSync(new URL(`../${file}`, import.meta.url));
  if (ok && hash && file === 'lab-skull.html' && !foramina.has(hash)) return false;
  return ok;
};
DEVICES.forEach((d) => d.acts.forEach((id) => { if (!actionById[id]) err('מכשירי המדידה', `פעולה לא קיימת: ${id}`); }));
const actionIds = new Set();
ACTIONS.forEach((a) => {
  if (actionIds.has(a.id)) err('קטלוג הבדיקות', `מזהה כפול: ${a.id}`); actionIds.add(a.id);
  if (!a.label || !a.normal) err('קטלוג הבדיקות', `חסר טקסט: ${a.id}`);
  if (/[„“”]/.test(a.label + a.normal)) err('קטלוג הבדיקות', `מירכאות לא ישרות: ${a.id}`);
  if (/—/.test(a.label + a.normal)) err('קטלוג הבדיקות', `מקף ארוך: ${a.id}`);
  if (/\((?:[IVX]+(?:,\s*[IVX]+)*)\)/.test(a.label)) err('קטלוג הבדיקות', `על הכפתור לא כותבים את העצב (זה רומז על התשובה): ${a.id}`);
  if ((a.group === 'cranial' || a.group === 'general') && !REGIONS.some((r) => r.id === a.region)) err('קטלוג הבדיקות', `לבדיקה אין אזור בגוף: ${a.id}`);
});
CASES.forEach((c, i) => {
  const w = `מקרה ${c.id ?? i}`;
  if (typeof c.cns !== 'boolean') err(w, `חסר שדה cns (true/false: האם יש גם פגיעה במוח או בגזע המוח)`);
  if (!Array.isArray(c.nerves) || (!c.nerves.length && !c.cns)) err(w, `צריך לפחות עצב אחד, או cns: true`);
  Object.keys(c.q1Notes ?? {}).forEach((id) => { if (!byId[id] && id !== 'cns') err(w, `q1Notes: עצב לא קיים ${id}`); });
  for (const k of ['id', 'title', 'teaser', 'story', 'exam', 'key', 'where', 'explain', 'links', 'sources']) {
    if (c[k] == null || (Array.isArray(c[k]) && !c[k].length)) err(w, `חסר שדה ${k}`);
  }
  if (caseIds.has(c.id)) err(w, 'מזהה כפול'); caseIds.add(c.id);
  if (!LEVELS[c.level]) err(w, `רמה לא מוכרת: ${c.level}`);
  [...(c.nerves ?? []), ...(c.alsoOk ?? [])].forEach((id) => { if (!byId[id]) err(w, `עצב לא קיים: ${id}`); });
  const opts = c.where?.options ?? [];
  if (opts.length < 3 || opts.length > 4) err(w, 'צריכות להיות 3 או 4 אפשרויות מקום');
  if (!opts.some((o) => o.id === c.where?.answer)) err(w, 'התשובה הנכונה לשאלת המקום לא נמצאת באפשרויות');
  c.links?.forEach((l) => { if (!pageExists(l.href)) err(w, `קישור שבור: ${l.href}`); });
  c.sources?.forEach((s) => { if (!/^https:\/\//.test(s.url ?? '') || !s.label) err(w, 'מקור לא תקין'); });
  Object.keys(c.exam ?? {}).forEach((id) => { if (!actionById[id]) err(w, `בדיקה לא קיימת בקטלוג: ${id}`); });
  REQUIRED.forEach((id) => { if (!c.exam?.[id]) err(w, `חסרה תשובה מותאמת ל-${id}`); });
  (c.key ?? []).forEach((id) => { if (!actionById[id]) err(w, `ממצא מפתח לא קיים: ${id}`); else if (!c.exam?.[id]) err(w, `לממצא המפתח ${id} אין תשובה מותאמת`); });
  (c.redFlags ?? []).forEach((id) => { if (!actionById[id]) err(w, `סימן אזהרה לא קיים: ${id}`); });
  if (c.ecg != null && (!['sinus', 'af'].includes(c.ecg.rhythm) || !(c.ecg.rate >= 30 && c.ecg.rate <= 180))) err(w, `ecg צריך להיות { rhythm: 'sinus' | 'af', rate: 30-180 }`);
  // מסיחים: קיימים, ולא מתנגשים בתשובות של המקרה, בממצאי המפתח או בסימני האזהרה
  if (!Array.isArray(c.distractors) || c.distractors.length < 2) err(w, 'צריך לפחות 2 מסיחים (למטופל ב ולמטופל ג)');
  const protectedIds = new Set([...Object.keys(c.exam ?? {}), ...(c.key ?? []), ...(c.redFlags ?? [])]);
  (c.distractors ?? []).forEach((did) => {
    const d = distractorById[did];
    if (!d) { err(w, `מסיח לא קיים: ${did}`); return; }
    Object.keys(d.exam ?? {}).forEach((id) => { if (protectedIds.has(id)) err(w, `המסיח ${did} מחליף את ${id}, שהוא חלק מהמקרה`); });
    Object.keys(d.add ?? {}).forEach((id) => {
      if ((c.key ?? []).includes(id) || (c.redFlags ?? []).includes(id)) err(w, `המסיח ${did} מוסיף ל-${id}, שהוא ממצא מפתח`);
      if (/^(אין|לא )/.test(c.exam?.[id] ?? '')) err(w, `המסיח ${did} מוסיף ל-${id}, אבל במקרה כתוב "${c.exam[id].slice(0, 20)}"`);
    });
  });
  // מטופל ג: שני המסיחים לא מחליפים את אותה בדיקה
  const [, c1, c2] = c.distractors ?? [];
  if (c1 && c2 && distractorById[c1] && distractorById[c2]) {
    Object.keys(distractorById[c1].exam ?? {}).forEach((id) => { if (distractorById[c2].exam?.[id]) err(w, `במטופל ג שני מסיחים מחליפים את ${id}`); });
  }
  const txt = JSON.stringify(c);
  if (/[„“”]/.test(txt)) err(w, 'מירכאות לא ישרות');
  if (/—/.test(txt)) err(w, 'מקף ארוך בטקסט');
});

// ספריית המסיחים
DISTRACTORS.forEach((d) => {
  const w = `מסיח ${d.id}`;
  for (const k of ['id', 'label', 'explain']) if (!d[k]) err(w, `חסר שדה ${k}`);
  if (!d.exam && !d.add) err(w, 'צריך exam או add');
  Object.keys(d.exam ?? {}).forEach((id) => { if (!actionById[id]) err(w, `בדיקה לא קיימת: ${id}`); });
  Object.keys(d.add ?? {}).forEach((id) => { if (!ADD_KEYS.includes(id)) err(w, `add מותר רק ל-${ADD_KEYS.join(', ')}`); });
  const txt = JSON.stringify(d);
  if (/[„“”]/.test(txt)) err(w, 'מירכאות לא ישרות');
  if (/—/.test(txt)) err(w, 'מקף ארוך');
  if (/\((?:[IVX]+(?:, ?[IVX]+)*)\)/.test(d.label)) err(w, 'שם עצב בסוגריים בתווית');
});

// מצבים ומחלות
const condIds = new Set();
CONDITIONS.forEach((c, i) => {
  const w = `מצב ${c.id ?? i}`;
  for (const k of ['id', 'nerve', 'title', 'en', 'short', 'updated', 'sections', 'links', 'sources']) if (c[k] == null) err(w, `חסר שדה ${k}`);
  if (condIds.has(c.id)) err(w, 'מזהה כפול'); condIds.add(c.id);
  if (!byId[c.nerve]) err(w, `עצב לא קיים: ${c.nerve}`);
  for (const k of Object.keys(SECTION_TITLES)) if (!c.sections?.[k]?.length) err(w, `חסר סעיף ${k}`);
  if ((c.sources ?? []).length < 3) err(w, 'פחות משלושה מקורות');
  (c.sources ?? []).forEach((x) => { if (!/^https:\/\//.test(x.url ?? '') || !x.label) err(w, 'מקור לא תקין'); });
  (c.links ?? []).forEach((l) => { if (!pageExists(l.href)) err(w, `קישור שבור: ${l.href}`);
    const [f, h] = l.href.split('#'); if (f === 'clinic.html' && h && !caseIds.has(h.replace(/^case-/, ''))) err(w, `מקרה לא קיים: ${h}`); });
  const txt = JSON.stringify(c);
  if (/[„“”]/.test(txt)) err(w, 'מירכאות לא ישרות');
  if (/—/.test(txt)) err(w, 'מקף ארוך');
});

if (errors.length) {
  console.error(`✗ ${errors.length} שגיאות:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${NERVES.length} עצבים, ${FORAMINA.length} פתחים, ${EVENTS.length} אירועים, ${CASES.length} מקרים, ${CONDITIONS.length} מצבים: הכול תקין`);
