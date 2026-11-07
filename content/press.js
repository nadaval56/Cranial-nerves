// "בתקשורת": סיפורים מהחדשות בישראל שקשורים לעצבים הקרניאליים.
// כללים: תקציר במילים שלנו, ציטוט קצר בלבד, קישור לכתבות המקוריות. לא מעתיקים כתבות ולא מטמיעים פוסטים
// (הטמעה טוענת קוד של צד שלישי). חלק "מה ידוע" — עם מקור לכל טענה (גם ב-content/sources.md).
// date בפורמט ISO. החדש ראשון.

export const PRESS = [
  {
    id: `gilad-bell`,
    date: `2026-11-06`,
    nerve: `facial`,
    title: `אברי גלעד: "אני משותק בחצי פנים"`,
    summary: [
      `איש התקשורת אברי גלעד סיפר בפייסבוק ובפודקאסט שלו שקם בבוקר וגילה שחצי מהפנים שלו לא זז. האבחנה: שיתוק בל, פגיעה פתאומית בעצב הפנים (VII) בצד אחד. הוא סיפר שכבר עבר בירור אצל רופאים וקיבל תרופות.`,
      `גלעד העלה את האפשרות שהסיבה היא לעיסת מסטיק מהבוקר עד הערב. למחרת הודיע שהוא ממשיך לשדר כרגיל.`,
    ],
    quote: `אמרו לי שזה יעבור. או לא.`,
    known: [
      `הסיבה המדויקת לשיתוק בל לא ידועה. ההשערה המובילה היא דלקת ונפיחות של העצב בתוך התעלה הצרה שלו בעצם הרקתית, אולי בעקבות התעוררות של נגיף ממשפחת ההרפס. לא מצאנו מחקר שמראה שלעיסת מסטיק גורמת לו.`,
      `אצל רוב האנשים השיפור מתחיל בתוך כמה שבועות, ורובם מחלימים לגמרי בתוך כמה חודשים. אצל מיעוט ההחלמה חלקית.`,
      `טיפול בסטרואידים שמתחיל בתוך 72 שעות מתחילת השיתוק מקטין את הסיכוי להחלמה חלקית. לכן חשוב לפנות לרופא מהר.`,
      `חולשה פתאומית בפנים יכולה להיות גם סימן לשבץ. בשבץ המצח ממשיך לזוז, ובשיתוק בל גם המצח משותק. את ההבדל אפשר לראות במעבדת הפנים.`,
    ],
    links: [
      { href: `nerve-facial.html`, label: `עצב הפנים` },
      { href: `lab-face.html`, label: `מעבדת הפנים: שבץ מול שיתוק בל` },
    ],
    sources: [
      { label: `ynet`, url: `https://www.ynet.co.il/entertainment/article/hyvg6qo6fe` },
      { label: `mako`, url: `https://www.mako.co.il/news-entertainment/2026_q4/Article-7ba45b6ab60b1a1027.htm` },
      { label: `ice`, url: `https://www.ice.co.il/media/news/article/1136603` },
      { label: `ice (למחרת)`, url: `https://www.ice.co.il/media/news/article/1136632` },
    ],
    knownSources: [
      { label: `NIHR: סטרואידים בתוך 72 שעות`, url: `https://evidence.nihr.ac.uk/alert/corticosteroids-improve-recovery-rates-after-bells-palsy` },
      { label: `סקירה: Bell's palsy (PMC)`, url: `https://pmc.ncbi.nlm.nih.gov/articles/PMC3275144/` },
      { label: `patient.info: Bell's palsy`, url: `https://patient.info/health/bells-palsy` },
    ],
  },
];
