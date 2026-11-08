// מטופלים בקליניקה: תבניות טקסט שמתאימות את עצמן למין המטופל.
// {זכר|נקבה}: מילה בשתי צורות, לפי sex של המטופל ('m' או 'f'). למשל: {הוא|היא} {מרגיש|מרגישה}.
// {name}: השם המלא · {first}: השם הפרטי · {age}: הגיל.
// הקוד רץ גם בדפדפן וגם ב-scripts/validate.mjs.

const PAIR = /\{([^{}|]*)\|([^{}|]*)\}/g;
const TOKEN = /\{(name|first|age)\}/g;

export const firstName = (p) => p.name.split(' ')[0];

export function tpl(str, p) {
  if (str == null) return str;
  return String(str)
    .replace(PAIR, (_, m, f) => (p.sex === 'f' ? f : m))
    .replace(TOKEN, (_, k) => (k === 'name' ? p.name : k === 'first' ? firstName(p) : String(p.age)));
}

// לבדיקה: האם נשארו סוגריים מסולסלים אחרי ההחלפה (תבנית שבורה או מילה לא מוכרת)
export const leftover = (s) => /[{}]/.test(s);

// ראשי תיבות לתמונת המטופל (עיגול עם אותיות)
export const initials = (p) => p.name.split(' ').slice(0, 2).map((w) => w.replace(/^[^֐-׿A-Za-z]+/, '')[0] ?? '').join('');
