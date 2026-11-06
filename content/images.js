// תמונות היסטוריות באתר. רק נחלת הכלל (PD) או CC BY, אחרי בדיקה בעמוד הקובץ בוויקישיתוף.
// הקבצים ב-public/images/ (WebP, מוקטנים). הקרדיטים המלאים נבנים מכאן לעמוד אודות (#images).

const commons = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;
const PD = { license: `נחלת הכלל`, licenseUrl: `https://creativecommons.org/publicdomain/mark/1.0/deed.he` };
const CCBY4 = { license: `CC BY 4.0`, licenseUrl: `https://creativecommons.org/licenses/by/4.0/deed.he` };
const GRAY = (n) => ({ title: `Gray${n}.png`, author: `"האנטומיה של גריי", מהדורה 20 (1918)`, url: commons(`Gray${n}.png`), ...PD });

export const IMAGES = {
  vesalius: {
    file: `vesalius-1543-base.webp`, w: 800, h: 896,
    alt: `חיתוך עץ מ-1543: המוח במבט מלמטה, עם האונות, המוחון, גזע המוח ועצבים שיוצאים ממנו לשני הצדדים`,
    caption: `בסיס המוח בספר של וזאליוס, 1543. רואים את עצבי הראייה נפגשים (במרכז), ועצבים נוספים יוצאים מגזע המוח לצדדים.`,
    source: { title: `1543, Andreas Vesalius' Fabrica, Base Of The Brain.jpg`, author: `אנדראס וזאליוס, De humani corporis fabrica`, url: commons(`1543, Andreas Vesalius' Fabrica, Base Of The Brain.jpg`), ...PD },
  },
  willis: {
    file: `willis-1664-base.webp`,
    alt: `תחריט מ-1664: בסיס המוח במבט מלמטה, עם גזע המוח, המוחון והעצבים`,
    caption: `בסיס המוח ב"אנטומיה של המוח" של וויליס, 1664 — לפי ציור של כריסטופר רן.`,
    source: { title: `T. Willis, Cerebri anatome (Wellcome L0032335)`, author: `תומאס וויליס וכריסטופר רן; Wellcome Collection`, url: commons(`T. Willis, Cerebri anatome ; cui accessit n Wellcome L0032335.jpg`), ...CCBY4, modifications: `נחתך והוקטן` },
  },
  bell: {
    file: `bell-portrait.webp`,
    alt: `דיוקן של צ'רלס בל`,
    caption: `צ'רלס בל (1774–1842).`,
    source: { title: `Portrait of Sir Charles Bell (Wellcome L0011359)`, author: `אלמוני, לפי ג'ון סטיבנס; Wellcome Collection`, url: commons(`Portrait of Sir Charles Bell (1774-1842) Wellcome L0011359.jpg`), ...CCBY4, modifications: `הוקטן` },
  },
  loewi: {
    file: `loewi-1929.webp`,
    alt: `תצלום של אוטו לוי`,
    caption: `אוטו לוי ב-1929, בקונגרס הפיזיולוגיה הבינלאומי בבוסטון.`,
    source: { title: `Otto Loewi 1929.jpg`, author: `צלם לא ידוע; Wellcome Collection`, url: commons(`Otto Loewi 1929.jpg`), ...CCBY4, modifications: `הוקטן` },
  },
  base: {
    file: `gray724-base.webp`, w: 600, h: 588,
    alt: `איור של בסיס המוח מלמטה, עם העצבים הקרניאליים צבועים בצהוב, מעצבי הריח בחלק העליון ועד העצבים שליד המוח המוארך`,
    caption: `בסיס המוח מלמטה, מאטלס האנטומיה של גריי (1918). העצבים בצהוב — אותו צבע שבו הם מופיעים באתר. התוויות באנגלית.`,
    source: GRAY(724),
  },
  olfactory: {
    file: `gray772-olfactory.webp`, w: 400, h: 328,
    alt: `תרשים: תאי ריח בקרום האף, שהסיבים שלהם עולים לפקעת הריח ומתחברים שם לתאים נוספים`,
    caption: `מהאף אל פקעת הריח: תאי הריח בקרום האף (למטה) שולחים סיבים דקים שמתחברים בפקעת הריח לתאי העצב הבאים בתור (למעלה). מגריי, 1918.`,
    source: GRAY(772),
  },
  optic: {
    file: `gray774-optic.webp`,
    alt: `תרשים של מסלול הראייה: שני עצבי הראייה, ההצטלבות, והסיבים שממשיכים אחורה במוח`,
    caption: `מסלול הראייה בתרשים מ-1918: הסיבים מהחצי הפנימי של כל רשתית חוצים בהצטלבות לצד השני. מגריי.`,
    source: GRAY(774),
  },
  orbit: {
    file: `gray777-orbit.webp`, w: 700, h: 455,
    alt: `איור של ארובת העין מהצד, עם העצבים שנכנסים אליה: עצב העין המניע, העצב הגלגלתי, העצב המרחיק וענף העין של העצב המשולש`,
    caption: `ארובת העין מהצד: העצבים III, IV ו-VI נכנסים מאחור ומגיעים לשרירי העין, לצד הענף הראשון של העצב המשולש. מגריי, 1918.`,
    source: GRAY(777),
  },
  trigeminal: {
    file: `gray784-trigeminal.webp`, w: 600, h: 423,
    alt: `ראש מהצד, צבוע בשלושה אזורים לפי שלושת ענפי העצב המשולש, ומאחוריהם אזור של עצבי הצוואר`,
    caption: `שלושת אזורי התחושה של העצב המשולש — העליון, האמצעי והתחתון — ומאחוריהם עור שמקבל תחושה מעצבי הצוואר. מגריי, 1918.`,
    source: GRAY(784),
  },
  face: {
    file: `gray790-face.webp`, w: 620, h: 726,
    alt: `איור של הראש והצוואר מהצד, עם עצבים רבים בצהוב על הפנים, הקרקפת והצוואר`,
    caption: `העצבים של הפנים, הקרקפת והצוואר, ובהם ענפי עצב הפנים שמתפרסים על הלחי והלסת. מגריי, 1918.`,
    source: GRAY(790),
  },
  vagus: {
    file: `gray793-vagus.webp`, w: 432, h: 1000,
    alt: `איור של העצב התועה יורד מבסיס הגולגולת, לאורך הצוואר, ליד הלב ועד הקיבה`,
    caption: `העצב התועה במלוא אורכו: מבסיס הגולגולת, לאורך הצוואר, ליד הלב והריאות ועד הקיבה. למעלה יוצאים איתו גם העצבים IX ו-XI. מגריי, 1918.`,
    source: GRAY(793),
  },
  hypoglossal: {
    file: `gray795-hypoglossal.webp`, w: 475, h: 600,
    alt: `תרשים של העצב התת-לשוני והענפים שלו לשרירי הלשון, יחד עם סיבים מעצבי הצוואר העליונים`,
    caption: `העצב התת-לשוני מגיע לשרירי הלשון. חלק מהענפים שנראים יוצאים ממנו הם בעצם סיבים של עצבי הצוואר, שרק "נוסעים" איתו. מגריי, 1918.`,
    source: GRAY(795),
  },
};

// תמונות בעמודי העצבים (בסעיף "מה הוא עושה")
export const ATLAS = {
  olfactory: [`olfactory`],
  optic: [`optic`],
  oculomotor: [`orbit`],
  trochlear: [`orbit`],
  trigeminal: [`trigeminal`],
  abducens: [`orbit`],
  facial: [`face`],
  glossopharyngeal: [`vagus`],
  vagus: [`vagus`],
  accessory: [`vagus`],
  hypoglossal: [`hypoglossal`],
};

// איפה כל תמונה מופיעה — לרשימת הקרדיטים בעמוד אודות
export const CREDITS = [
  [`vesalius`, `ציר הזמן (1543)`],
  [`willis`, `ציר הזמן (1664)`],
  [`bell`, `ציר הזמן (1821)`],
  [`loewi`, `ציר הזמן (1921)`],
  [`base`, `יסודות`],
  [`olfactory`, `עצב הריח`],
  [`optic`, `עצב הראייה`],
  [`orbit`, `העצבים III, IV ו-VI`],
  [`trigeminal`, `העצב המשולש`],
  [`face`, `עצב הפנים`],
  [`vagus`, `העצבים IX, X ו-XI`],
  [`hypoglossal`, `העצב התת-לשוני`],
].map(([k, where]) => ({ im: IMAGES[k], where }));
