// הגדרות אתר מרוכזות. הקובץ נטען גם ב-Node (vite.config.js) וגם בדפדפן, ולכן אין בו API של דפדפן.

export const SITE = {
  name: 'עצבי הגולגולת',
  tagline: '12 זוגות, מהריח ועד הלשון',
  // TODO: דומיין סופי. עד אז — כתובת GitHub Pages של הריפו (לקישורים מלאים ב-sitemap וב-Open Graph).
  url: 'https://cranialnerves.co.il/',
};

// icon: תוכן ה-SVG (viewBox 0 0 36 36). מוצג רק בתפריט הנפתח בנייד ובקוביות בעמוד הבית.
export const ICONS = {
  nerves: '<path d="M18 4v28" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M18 9 8 6M18 9l10-3M18 16H6M18 16h12M18 23l-9 5M18 23l9 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="6" r="1.8" fill="currentColor"/><circle cx="28" cy="6" r="1.8" fill="currentColor"/><circle cx="6" cy="16" r="1.8" fill="currentColor"/><circle cx="30" cy="16" r="1.8" fill="currentColor"/><circle cx="9" cy="28" r="1.8" fill="currentColor"/><circle cx="27" cy="28" r="1.8" fill="currentColor"/>',
  basics: '<path d="M6 8c4-2 8-2 12 1v21c-4-3-8-3-12-1zM30 8c-4-2-8-2-12 1v21c4-3 8-3 12-1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 13c2-.8 4-.8 6 .3M9 18c2-.8 4-.8 6 .3M21 13.3c2-1.1 4-1.1 6-.3M21 18.3c2-1.1 4-1.1 6-.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>',
  exam: '<circle cx="11" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 12v6a7 7 0 0 0 14 0v-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="25" cy="12" r="3" fill="currentColor"/><path d="M6 30h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>',
  lab: '<path d="M14 4h8M15 4v10L6 29a2 2 0 0 0 1.7 3h20.6a2 2 0 0 0 1.7-3L21 14V4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M10.5 23h15l3 5.5H7.5z" fill="currentColor" opacity=".5"/>',
  conditions: '<path d="M4 19h6l3-8 4 15 3-9h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="7" r="3" fill="currentColor" opacity=".6"/>',
  press: '<rect x="5" y="7" width="22" height="23" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M27 12h3v15a3 3 0 0 1-3 3" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="11" width="14" height="6" rx="1" fill="currentColor" opacity=".6"/><path d="M9 21h14M9 25h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  clinic: '<rect x="6" y="6" width="24" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13" y="3.5" width="10" height="5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18 14v10M13 19h10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  history: '<path d="M9 4h18M9 32h18M11 4c0 8 7 10 7 14s-7 6-7 14M25 4c0 8-7 10-7 14s7 6 7 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 30c1-3 5-5 5-8 0 3 4 5 5 8z" fill="currentColor" opacity=".6"/>',
  about: '<circle cx="18" cy="18" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18 16v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="11.5" r="1.6" fill="currentColor"/>',
};

export const NAV = [
  { href: 'nerves.html', label: 'העצבים', pages: ['nerves', 'nerve', 'nerve-zero'], icon: ICONS.nerves },
  { href: 'conditions.html', label: 'מצבים', pages: ['conditions', 'condition'], icon: ICONS.conditions },
  { href: 'basics.html', label: 'היסודות', pages: ['basics'], icon: ICONS.basics },
  { href: 'exam.html', label: 'הבדיקה', pages: ['exam'], icon: ICONS.exam },
  { href: 'lab.html', label: 'המעבדה', pages: ['lab', 'lab-eyes', 'lab-pupils', 'lab-face', 'lab-visual', 'lab-skull', 'lab-mouth', 'lab-reflex'], icon: ICONS.lab },
  { href: 'clinic.html', label: 'קליניקה', pages: ['clinic'], icon: ICONS.clinic },
  { href: 'history.html', label: 'היסטוריה', pages: ['history'], icon: ICONS.history },
  { href: 'press.html', label: 'בתקשורת', pages: ['press', 'press-story'], icon: ICONS.press },
  { href: 'about.html', label: 'אודות', pages: ['about'], icon: ICONS.about },
];

// כלי המעבדה, לפי הסדר — לתפריט המעבדה, לעמוד המעבדה ולמעבר "הקודם / הבא"
export const LAB = [
  { page: 'lab-eyes', label: 'תנועות העיניים', nerves: 'III · IV · VI', text: 'מזיזים מטרה, העיניים עוקבות. "פוגעים" בעצב אחד ורואים איך העין נתקעת ומה רואה מי שרואה כפול.' },
  { page: 'lab-pupils', label: 'רפלקס האישון', nerves: 'II · III', text: 'מאירים בפנס לעין אחת ושני האישונים מגיבים. מה קורה כשהעצב שקולט את האור נפגע, ומה כשנפגע זה שמכווץ?' },
  { page: 'lab-visual', label: 'מסלול הראייה', nerves: 'II', text: 'בוחרים נקודה במסלול מהעין למוח, ורואים איזה חלק של העולם נעלם.' },
  { page: 'lab-face', label: 'עצב הפנים', nerves: 'VII', text: 'פנים שמבצעות הבעות. בעיה בעצב עצמו או בעיה במוח? התשובה כתובה על המצח.' },
  { page: 'lab-skull', label: 'בסיס הגולגולת', nerves: 'I–XII', text: 'מפה של רצפת הגולגולת: איזה עצב יוצא מאיזה פתח, ומה עוד עובר שם.' },
  { page: 'lab-mouth', label: 'הפה והצוואר', nerves: 'IX · X · XI · XII', text: 'אומרים "אההה", מוציאים לשון, מרימים כתפיים ומסובבים ראש. "פוגעים" בעצב אחד ורואים לאן נמשך הענבל, לאן סוטה הלשון ואיזה צד נחלש.' },
  { page: 'lab-reflex', label: 'מעגלי רפלקס', nerves: 'V · VII · VIII · IX · X', text: 'מגרים צד אחד ואז את השני: הקרנית, הלוע, האוזן והסנטר. פוגעים בעצב הקולט או בעצב המבצע, ומגלים איפה הבעיה לפי מי שלא מגיב.' },
];

// שורה קצרה בפוטר, שמקשרת להבהרה המלאה בעמוד אודות (about.html#medical).
export const DISCLAIMER = 'ללימוד בלבד, לא לאבחון רפואי';

// פס "עוד אתרים שלי" בתחתית כל עמוד — אותו פס כמו בשאר האתרים של נדב (geniza-explorer, RATA, רנטגן, השמש, רעידות אדמה, עב"מים, לוח עברי, מזג האוויר, קל וחומר).
// קישורים בלבד: שום דבר לא נטען מהאתרים האלה. [אימוג'י, כתובת, טקסט הקישור, המשך שאינו קישור]
export const SISTER_INVITE = 'https://chat.whatsapp.com/JPkp1hyk4J938apVTFu6J1';
export const SISTER_SITES = [
  ['🔭', SISTER_INVITE, 'קבוצת ווטסאפ · עדכוני אסטרונומיה יומיים (קבוצה שקטה)', ''],
  ['🩻', 'https://roentgen.co.il/', 'רנטגן · לראות מבפנים', ''],
  ['☀️', 'https://sunspots.co.il/', 'השמש היום · כתמי שמש בזמן אמת', ''],
  ['📜', 'https://geniza.co.il/', 'הגניזה הקהירית', ''],
  ['🛠️', 'https://making-il.co.il/', 'מייקינג', ' · יצירה טכנולוגית'],
  ['💶', 'https://banknote.co.il/', 'Banknote · שטרות ומטבעות', ''],
  ['🛩️', 'https://dronexam.co.il/', 'לעוף לשמיים · מבחן רת"א לרחפנים', ''],
  ['🌱', 'https://holisticcenter.co.il/', 'מעט צרי · רפואה משלימה', ''],
  ['🛸', 'https://pursue.co.il/', 'PURSUE · ארכיון עב"מים', ''],
  ['🌍', 'https://quake.co.il/', 'רעידת אדמה · רעידות היסטוריות', ''],
  ['📅', 'https://heb-cal.co.il/', 'לוח עברי', ''],
  ['🌱', 'https://holisticcenter.co.il/', 'מעט צרי · רפואה משלימה', ''],
  ['🛸', 'https://pursue.co.il/', 'PURSUE · ארכיון עב"מים', ''],
  ['🌍', 'https://quake.co.il/', 'רעידת אדמה · רעידות היסטוריות', ''],
  ['📅', 'https://heb-cal.co.il/', 'לוח עברי', ''],
];
