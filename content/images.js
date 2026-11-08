// תמונות היסטוריות באתר. רק נחלת הכלל (PD) או CC BY, אחרי בדיקה בעמוד הקובץ בוויקישיתוף.
// הקבצים ב-public/images/ (WebP, מוקטנים). הקרדיטים המלאים נבנים מכאן לעמוד אודות (#images).

const commons = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;
const PD = { license: `נחלת הכלל`, licenseUrl: `https://creativecommons.org/publicdomain/mark/1.0/deed.he` };
const CCBY4 = { license: `CC BY 4.0`, licenseUrl: `https://creativecommons.org/licenses/by/4.0/deed.he` };
const CCBY2 = { license: `CC BY 2.0`, licenseUrl: `https://creativecommons.org/licenses/by/2.0/deed.he` };
const CC0 = { license: `CC0`, licenseUrl: `https://creativecommons.org/publicdomain/zero/1.0/deed.he` };
const GRAY = (n) => ({ title: `Gray${n}.png`, author: `"האנטומיה של גריי", מהדורה 20 (1918)`, url: commons(`Gray${n}.png`), ...PD });

export const IMAGES = {
  vesalius: {
    file: `vesalius-1543-base.webp`, w: 800, h: 896,
    alt: `חיתוך עץ מ-1543: המוח במבט מלמטה, עם האונות, המוחון, גזע המוח ועצבים שיוצאים ממנו לשני הצדדים`,
    caption: `בסיס המוח בספר של וזאליוס, 1543. רואים את עצבי הראייה נפגשים (במרכז), ועצבים נוספים יוצאים מגזע המוח לצדדים.`,
    source: { title: `1543, Andreas Vesalius' Fabrica, Base Of The Brain.jpg`, author: `אנדראס וזאליוס, De humani corporis fabrica`, url: commons(`1543, Andreas Vesalius' Fabrica, Base Of The Brain.jpg`), ...PD },
  },
  willis: {
    file: `willis-1664-base.webp`, w: 900, h: 1015,
    alt: `תחריט מ-1664: בסיס המוח במבט מלמטה, עם גזע המוח, המוחון והעצבים`,
    caption: `בסיס המוח ב"אנטומיה של המוח" של וויליס, 1664, לפי ציור של כריסטופר רן.`,
    source: { title: `T. Willis, Cerebri anatome (Wellcome L0032335)`, author: `תומאס וויליס וכריסטופר רן; Wellcome Collection`, url: commons(`T. Willis, Cerebri anatome ; cui accessit n Wellcome L0032335.jpg`), ...CCBY4, modifications: `נחתך והוקטן` },
  },
  bell: {
    file: `bell-portrait.webp`, w: 560, h: 708,
    alt: `דיוקן של צ'רלס בל`,
    caption: `צ'רלס בל (1774–1842).`,
    source: { title: `Portrait of Sir Charles Bell (Wellcome L0011359)`, author: `אלמוני, לפי ג'ון סטיבנס; Wellcome Collection`, url: commons(`Portrait of Sir Charles Bell (1774-1842) Wellcome L0011359.jpg`), ...CCBY4, modifications: `נחתך לגבולות הציור והוקטן` },
  },
  loewi: {
    file: `loewi-1929.webp`, w: 600, h: 774,
    alt: `תצלום של אוטו לוי`,
    caption: `אוטו לוי ב-1929, בקונגרס הפיזיולוגיה הבינלאומי בבוסטון.`,
    source: { title: `Otto Loewi 1929.jpg`, author: `צלם לא ידוע; Wellcome Collection`, url: commons(`Otto Loewi 1929.jpg`), ...CCBY4, modifications: `הוקטן` },
  },
  base: {
    file: `gray724-base.webp`, w: 600, h: 588,
    alt: `איור של בסיס המוח מלמטה, עם העצבים הקרניאליים צבועים בצהוב, מעצבי הריח בחלק העליון ועד העצבים שליד המוח המוארך`,
    caption: `בסיס המוח מלמטה, מאטלס האנטומיה של גריי (1918). העצבים בצהוב, באותו צבע שבו הם מופיעים באתר. התוויות באנגלית.`,
    source: GRAY(724),
  },
  olfactory: {
    file: `gray772-olfactory.webp`, w: 400, h: 328,
    alt: `תרשים: תאי ריח בקרום האף, שהסיבים שלהם עולים לפקעת הריח ומתחברים שם לתאים נוספים`,
    caption: `מהאף אל פקעת הריח: תאי הריח בקרום האף (למטה) שולחים סיבים דקים שמתחברים בפקעת הריח לתאי העצב הבאים בתור (למעלה). מגריי, 1918.`,
    source: GRAY(772),
  },
  optic: {
    file: `gray774-optic.webp`, w: 330, h: 451,
    alt: `תרשים של מסלול הראייה: שני עצבי הראייה, מצטלבת הראייה, והסיבים שממשיכים אחורה במוח`,
    caption: `מסלול הראייה בתרשים מ-1918: הסיבים מהחצי הפנימי של כל רשתית חוצים בהצטלבות לצד השני. מגריי.`,
    source: GRAY(774),
  },
  orbit: {
    file: `gray777-orbit.webp`, w: 700, h: 455,
    alt: `איור של ארובת העין מהצד, עם העצבים שנכנסים אליה: העצב המניע את העין, עצב הגלגלת, העצב המרחיק והענף העיני של העצב התלת-ראשי`,
    caption: `ארובת העין מהצד: העצבים III, IV ו-VI נכנסים מאחור ומגיעים לשרירי העין, לצד הענף הראשון של העצב התלת-ראשי. מגריי, 1918.`,
    source: GRAY(777),
  },
  trigeminal: {
    file: `gray784-trigeminal.webp`, w: 600, h: 423,
    alt: `ראש מהצד, צבוע בשלושה אזורים לפי שלושת ענפי העצב התלת-ראשי, ומאחוריהם אזור של עצבי הצוואר`,
    caption: `שלושת אזורי התחושה של העצב התלת-ראשי (העליון, האמצעי והתחתון), ומאחוריהם עור שמקבל תחושה מעצבי הצוואר. מגריי, 1918.`,
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
    caption: `העצב התת-לשוני מגיע לשרירי הלשון. חלק מהענפים שנראים יוצאים ממנו הם סיבים של עצבי הצוואר, שרק "נוסעים" איתו. מגריי, 1918.`,
    source: GRAY(795),
  },
  profile: {
    file: `augustus-profile.webp`, w: 720, h: 998,
    alt: `ראש של פסל שיש רומי בפרופיל, פונה שמאלה`,
    caption: `ראש הפסל של אוגוסטוס (25-1 לפני הספירה), בסיס למפת ענפי עצב הפנים.`,
    source: { title: `Portrait Head of Augustus, left profile - Getty Museum (78.AA.261).jpg`, author: `J. Paul Getty Museum (צילום); הפסל: אמן רומי`, url: commons(`Portrait Head of Augustus, left profile - Getty Museum (78.AA.261).jpg`), ...CC0, modifications: `הרקע הוסר, נחתך והוקטן; הענפים צוירו מעליו` },
  },
  galen: {
    file: `galen-portrait.webp`, w: 500, h: 661,
    alt: `ליתוגרפיה של גלנוס: אדם מזוקן עם כובע, בפרופיל חלקי`,
    caption: `גלנוס (Galen), בליתוגרפיה מהמאה ה-19. אין דיוקן אמיתי שלו מימי חייו, וזו דמות מדומיינת.`,
    source: { title: `Galen. Lithograph by P. R. Vignéron (Wellcome V0002113)`, author: `פ. ר. ויניירון; Wellcome Collection`, url: commons(`Galen. Lithograph by P. R. Vignéron. Wellcome V0002113.jpg`), ...CCBY2, modifications: `הוקטן` },
  },
  whytt: {
    file: `whytt-portrait.webp`, w: 500, h: 679,
    alt: `דיוקן של רוברט וויט בפאה לבנה, במסגרת אליפטית`,
    caption: `רוברט וויט (Robert Whytt, 1714–1766), שתיאר את רפלקס האישון לאור.`,
    source: { title: `Portrait of Robert Whytt (Wellcome L0008120)`, author: `Wellcome Collection`, url: commons(`Portrait of Robert Whytt Wellcome L0008120.jpg`), ...CCBY4, modifications: `הוקטן` },
  },
  soemmerring: {
    file: `soemmerring-portrait.webp`, w: 500, h: 662,
    alt: `ציור שמן של סמואל תומאס פון זמרינג, אדם מבוגר בשיער לבן ובמעיל כהה`,
    caption: `סמואל תומאס פון זמרינג (Soemmerring), בציור של וונדלין מוסברוגר מ-1813. הוא קבע את החלוקה ל-12 זוגות.`,
    source: { title: `Wendelin Moosbrugger, Samuel Thomas Soemmerring, 1813`, author: `וונדלין מוסברוגר`, url: commons(`Wendelin Moosbrugger, Samuel Thomas Soemmerring, 1813 aus A.jpg`), ...PD, modifications: `הוקטן` },
  },
  faceMuscles: {
    file: `gray378-face-muscles.webp`, w: 620, h: 700,
    alt: `איור של שרירי הראש, הפנים והצוואר מהצד, בצבע אדום`,
    caption: `שרירי ההבעה של הפנים, שעצב הפנים מפעיל, מאטלס האנטומיה של גריי (1918). התוויות באנגלית.`,
    source: GRAY(378),
  },
  autonomic: {
    file: `gray839-autonomic.webp`, w: 664, h: 987,
    alt: `תרשים של מערכת העצבים האוטונומית: חוט השדרה במרכז, וקווים כחולים ואדומים אל האיברים`,
    caption: `מערכת העצבים האוטונומית: הסימפתטית באדום והפאראסימפתטית בכחול. רוב הסיבים הכחולים אל הלב, הריאות ומערכת העיכול עוברים בעצב התועה. מגריי, 1918.`,
    source: GRAY(839),
  },
  ear: {
    file: `gray907-ear.webp`, w: 600, h: 530,
    alt: `חתך של האוזן: האפרכסת, תעלת השמע, עור התוף, עצמות השמע והאוזן הפנימית`,
    caption: `האוזן החיצונית, התיכונה והפנימית בחתך אחד. הצליל עובר מתעלת השמע לעור התוף, דרך עצמות השמע, אל השבלול. מגריי, 1918.`,
    source: GRAY(907),
  },
  labyrinth: {
    file: `gray920-labyrinth.webp`, w: 500, h: 365,
    alt: `איור של המבוך הגרמי: שלוש תעלות חצי-מעגליות, המבואה והשבלול המסולסל`,
    caption: `המבוך באוזן הפנימית: השבלול (לשמיעה) ושלוש התעלות החצי-מעגליות (לשיווי המשקל). שני החלקים של עצב VIII מתחילים כאן. מגריי, 1918.`,
    source: GRAY(920),
  },
  membranous: {
    file: `gray925-membranous-labyrinth.webp`, w: 500, h: 361,
    alt: `תרשים של המבוך הקרומי עם התעלות החצי-מעגליות והשבלול, וענפי העצב אליהם`,
    caption: `המבוך הקרומי, עם ענפי העצב שיוצאים מאיברי שיווי המשקל ומהשבלול. מגריי, 1918.`,
    source: GRAY(925),
  },
  cochlea: {
    file: `gray928-cochlea.webp`, w: 600, h: 408,
    alt: `חתך אורך סכמטי של השבלול, עם הסיבובים שלו וסיבי עצב השמיעה במרכז`,
    caption: `חתך של השבלול: הסיבים של עצב השמיעה יוצאים ממרכז השבלול אל תאי השערה בכל סיבוב. מגריי, 1918.`,
    source: GRAY(928),
  },
  pharynx: {
    file: `gray994-pharynx.webp`, w: 600, h: 861,
    alt: `חתך באמצע הראש והצוואר: האף, הפה, הלוע והגרון`,
    caption: `חתך של האף, הפה, הלוע והגרון. העצב הלשוני-לועי נותן תחושה ללוע ולבסיס הלשון. מגריי, 1918.`,
    source: GRAY(994),
  },
  tuningFork: {
    file: `tuning-fork-psf.webp`, w: 800, h: 618,
    alt: `איור קווי של מזלג קול שעומד על קופסת תהודה מעץ`,
    caption: `מזלג קול על קופסת תהודה. מזלגות כאלה נכנסו לבדיקת השמיעה במאה ה-19.`,
    source: { title: `Tuning Fork (PSF).png`, author: `Pearson Scott Foresman`, url: commons(`Tuning Fork (PSF).png`), ...PD, modifications: `הוקטן` },
  },
  dogfish: {
    file: `dogfish-psf.webp`, w: 1000, h: 309,
    alt: `איור קווי של כריש קטן וצר, מהסוג שנקרא כלב-ים (dogfish)`,
    caption: `כריש קטן (dogfish). אצל כרישים תיאר פריטש לראשונה את עצב 0.`,
    source: { title: `Dogfish (PSF).png`, author: `Pearson Scott Foresman`, url: commons(`Dogfish (PSF).png`), ...PD, modifications: `הוקטן` },
  },
  fritsch: {
    file: `fritsch-1878-terminal.webp`, w: 500, h: 941,
    alt: `תחריט מ-1878: מוח של כריש במבט מלמעלה, עם פקעות הריח בחלק העליון, גזע המוח בחלק התחתון ותוויות קטנות באותיות לטיניות`,
    caption: `המוח של כריש (Galeorhinus galeus) בספר של פריטש מ-1878. כאן הוא תיאר לראשונה את העצב שנקרא היום עצב 0.`,
    source: { title: `Fritsch dogfish shark brain.png`, author: `גוסטב פריטש, 1878`, url: commons(`Fritsch dogfish shark brain.png`), ...PD },
  },
};

// תמונות בעמודי העצבים (בסעיף "מה הוא עושה")
export const ATLAS = {
  olfactory: [`olfactory`],
  optic: [`optic`],
  oculomotor: [`orbit`],
  trochlear: [`orbit`],
  trigeminal: [`trigeminal`],
  vestibulocochlear: [`labyrinth`],
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
  [`bell`, `ציר הזמן (1821), שיתוק בל`],
  [`loewi`, `ציר הזמן (1921)`],
  [`base`, `יסודות`],
  [`olfactory`, `עצב הריח, ציר הזמן (2020)`],
  [`optic`, `עצב הראייה`],
  [`orbit`, `העצבים III, IV ו-VI`],
  [`trigeminal`, `העצב התלת-ראשי`],
  [`face`, `עצב הפנים, שיתוק בל`],
  [`vagus`, `העצבים IX, X ו-XI`],
  [`hypoglossal`, `העצב התת-לשוני`],
  [`profile`, `עצב הפנים: מפת חמשת הענפים`],
  [`galen`, `ציר הזמן (גלנוס)`],
  [`whytt`, `ציר הזמן (1751)`],
  [`soemmerring`, `ציר הזמן (1778)`],
  [`labyrinth`, `עצב השמיעה ושיווי המשקל`],
  [`ear`, `מצבים: שמיעה ושיווי משקל`],
  [`cochlea`, `מצבים: ירידת שמיעה פתאומית`],
  [`membranous`, `מצבים: שיווי משקל`],
  [`faceMuscles`, `מצבים: עצב הפנים`],
  [`pharynx`, `מצבים: העצב הלשוני-לועי`],
  [`autonomic`, `ציר הזמן (1997), מצבים: העצב התועה`],
  [`tuningFork`, `ציר הזמן (1855)`],
  [`dogfish`, `ציר הזמן (1878)`],
  [`fritsch`, `עצב 0`],
].map(([k, where]) => ({ im: IMAGES[k], where }));
