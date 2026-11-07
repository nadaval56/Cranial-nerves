// פתחים בבסיס הגולגולת ומה עובר בהם — לכלי "בסיס הגולגולת" ולעמודי העצבים.
// nerves: מזהי עצבים מ-content/nerves.js. other: מבנים נוספים שעוברים באותו פתח.
// fossa: anterior · middle · posterior (הגומה הקדמית, האמצעית והאחורית של הגולגולת)

export const FORAMINA = [
  {
    id: `cribriform`, name: `הלוחית המנוקבת`, en: `Cribriform plate`, bone: `עצם המסננת`, fossa: `anterior`,
    nerves: [`olfactory`], other: [],
    text: `לוחית עצם דקה כמו נייר, מלאה בחורים זעירים. כעשרים הצרורות הדקים של עצב הריח עוברים בהם מחלל האף אל פקעת הריח.`,
  },
  {
    id: `optic`, name: `תעלת הראייה`, en: `Optic canal`, bone: `עצם הטריז (הכנף הקטנה)`, fossa: `middle`,
    nerves: [`optic`], other: [`עורק העין (ophthalmic artery)`],
    text: `תעלה קצרה שמובילה מחלל הגולגולת אל קודקוד ארובת העין.`,
  },
  {
    id: `sof`, name: `הסדק העליון של ארובת העין`, en: `Superior orbital fissure`, bone: `עצם הטריז (בין הכנף הגדולה לקטנה)`, fossa: `middle`,
    nerves: [`oculomotor`, `trochlear`, `trigeminal`, `abducens`], other: [`הווריד העליון של העין`],
    text: `סדק צר בין שתי הכנפיים של עצם הטריז. דרכו עוברים כל עצבי תנועות העין, וגם הענף העיני של העצב החמישי (V1).`,
    note: `מהעצב החמישי עובר כאן רק הענף העיני (V1).`,
  },
  {
    id: `rotundum`, name: `החור העגול`, en: `Foramen rotundum`, bone: `עצם הטריז (הכנף הגדולה)`, fossa: `middle`,
    nerves: [`trigeminal`], other: [],
    text: `פתח עגול קטן שמוביל קדימה אל הגומה הכנפית-חכית (pterygopalatine fossa), מאחורי ומתחת לארובת העין.`,
    note: `עובר כאן הענף של הלסת העליונה (V2).`,
  },
  {
    id: `ovale`, name: `החור הסגלגל`, en: `Foramen ovale`, bone: `עצם הטריז (הכנף הגדולה)`, fossa: `middle`,
    nerves: [`trigeminal`], other: [`העצב הסלעי הקטן (סיבים של העצב התשיעי בדרך לבלוטת הפרוטיד)`],
    text: `פתח סגלגל גדול יחסית, שמוביל למטה אל אזור הלסת.`,
    note: `עובר כאן הענף של הלסת התחתונה (V3), שנושא גם את הסיבים לשרירי הלעיסה.`,
  },
  {
    id: `spinosum`, name: `החור הקוצני`, en: `Foramen spinosum`, bone: `עצם הטריז (הכנף הגדולה)`, fossa: `middle`,
    nerves: [], other: [`עורק קרום המוח האמצעי (middle meningeal artery)`, `ענף קטן של V3 לקרומי המוח`],
    text: `פתח קטן מאחורי החור הסגלגל. לא עובר בו אף אחד מ-12 העצבים כגזע. עובר בו בעיקר עורק שמזין את קרומי המוח.`,
  },
  {
    id: `iam`, name: `פתח השמע הפנימי`, en: `Internal acoustic meatus`, bone: `העצם הרקתית (החלק הסלעי)`, fossa: `posterior`,
    nerves: [`facial`, `vestibulocochlear`], other: [`עורק המבוך (labyrinthine artery)`],
    text: `פתח בצד הפנימי של העצם הסלעית. הוא לא מוביל החוצה מהגולגולת אלא פנימה, אל האוזן הפנימית ותעלת עצב הפנים.`,
  },
  {
    id: `jugular`, name: `החור הצווארי`, en: `Jugular foramen`, bone: `בין העצם הרקתית לעצם העורף`, fossa: `posterior`,
    nerves: [`glossopharyngeal`, `vagus`, `accessory`], other: [`הווריד הצווארי הפנימי (internal jugular vein)`],
    text: `פתח גדול ולא סדיר. שלושה עצבים עוברים בו יחד, ולכן בעיה במקום הזה פוגעת בדרך כלל בשלושתם.`,
  },
  {
    id: `hypoglossal`, name: `תעלת העצב התת-לשוני`, en: `Hypoglossal canal`, bone: `עצם העורף`, fossa: `posterior`,
    nerves: [`hypoglossal`], other: [],
    text: `תעלה קצרה מעל הפרקים שבהם הגולגולת נשענת על החוליה הראשונה.`,
  },
  {
    id: `magnum`, name: `החור הגדול`, en: `Foramen magnum`, bone: `עצם העורף`, fossa: `posterior`,
    nerves: [`accessory`], other: [`המעבר בין המוח המוארך לחוט השדרה`, `העורקים החולייתיים (vertebral arteries)`],
    text: `הפתח הגדול ביותר בבסיס הגולגולת. כאן המוח המוארך הופך לחוט השדרה.`,
    note: `העצב הנלווה (XI) נכנס כאן לגולגולת מלמטה, ויוצא שוב דרך החור הצווארי.`,
  },
];
