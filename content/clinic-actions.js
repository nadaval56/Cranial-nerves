// "קליניקה": כל השאלות והבדיקות שאפשר לבצע בכל מקרה, בכל סדר.
// normal = מה עונה או מה נמצא אצל אדם בריא. כל מקרה ב-content/cases.js מחליף רק את מה ששונה אצלו (exam).
// region = האזור בגוף שבו נמצאת הבדיקה (לשונית "בדיקה"). nerves = העצבים שהבדיקה בודקת: מוצג רק בסיכום, לא על הכפתור, כדי לא לרמוז.
// basic = שאלות רקע וסימנים חיוניים: הן אף פעם לא נחשבות "בדיקה מיותרת" בסיכום.

export const GROUPS = [
  { id: `history`, label: `שאלות (אנמנזה)`, basic: true },
  { id: `vitals`, label: `סימנים חיוניים`, basic: true },
  { id: `cranial`, label: `בדיקת עצבי הגולגולת` },
  { id: `general`, label: `בדיקה כללית ונוירולוגית` },
];

export const ACTIONS = [
  // שאלות
  { id: `h_onset`, group: `history`, label: `מתי זה התחיל?`, normal: `המטופל לא בטוח.` },
  { id: `h_course`, group: `history`, label: `זה התחיל פתאום או בהדרגה?`, normal: `המטופל לא בטוח.` },
  { id: `h_past`, group: `history`, label: `זה כבר קרה בעבר?`, normal: `לא, זו הפעם הראשונה.` },
  { id: `h_pain`, group: `history`, label: `יש כאב? איפה?`, normal: `אין כאב.` },
  { id: `h_background`, group: `history`, label: `מחלות רקע?`, normal: `אין מחלות רקע ידועות.` },
  { id: `h_meds`, group: `history`, label: `תרופות קבועות?`, normal: `לא נוטל תרופות קבועות.` },
  { id: `h_fever`, group: `history`, label: `היה חום או מחלה לאחרונה?`, normal: `לא היה חום, ולא הייתה מחלה לאחרונה.` },
  { id: `h_diplopia`, group: `history`, label: `יש ראייה כפולה?`, normal: `לא, הוא רואה תמונה אחת.` },
  { id: `h_hearing`, group: `history`, label: `יש בעיה בשמיעה או צלצול באוזניים?`, normal: `שומע טוב בשתי האוזניים, ואין צלצולים.` },
  { id: `h_dizzy`, group: `history`, label: `יש סחרחורת?`, normal: `אין סחרחורת.` },
  { id: `h_swallow`, group: `history`, label: `יש קושי בבליעה או בדיבור?`, normal: `בולע ומדבר כרגיל.` },
  { id: `h_taste`, group: `history`, label: `השתנה משהו בטעם?`, normal: `הטעם רגיל.` },
  { id: `h_limbs`, group: `history`, label: `יש חולשה או נימול ביד או ברגל?`, normal: `אין חולשה ואין נימול בידיים או ברגליים.` },
  { id: `h_headache`, group: `history`, label: `יש כאב ראש?`, normal: `אין כאב ראש.` },
  { id: `h_smoking`, group: `history`, label: `מעשן?`, normal: `לא מעשן.` },

  // סימנים חיוניים
  { id: `v_pulse`, group: `vitals`, label: `דופק`, normal: `76 פעימות בדקה, סדיר.` },
  { id: `v_bp`, group: `vitals`, label: `לחץ דם`, normal: `124/78.` },
  { id: `v_temp`, group: `vitals`, label: `חום`, normal: `36.8 מעלות.` },
  { id: `v_sat`, group: `vitals`, label: `ריווי חמצן`, normal: `98%.` },
  { id: `v_glucose`, group: `vitals`, label: `סוכר בדם`, normal: `102 מ"ג לדציליטר.` },
  { id: `v_ecg`, group: `vitals`, label: `אק"ג 3 לידים`, normal: `קצב סינוס סדיר.` },

  // עצבי הגולגולת
  { id: `c_smell`, group: `cranial`, region: `nose`, nerves: `I`, label: `ריח`, normal: `מזהה ריח של קפה בכל נחיר בנפרד.` },
  { id: `c_acuity`, group: `cranial`, region: `eyes`, nerves: `II`, label: `חדות ראייה`, normal: `קורא את השורה התחתונה בטבלה, בכל עין בנפרד.` },
  { id: `c_fields`, group: `cranial`, region: `eyes`, nerves: `II`, label: `שדות ראייה`, normal: `שדות הראייה מלאים בשתי העיניים.` },
  { id: `c_pupils`, group: `cranial`, region: `eyes`, nerves: `II, III`, label: `אישונים ותגובה לאור`, normal: `האישונים שווים בגודלם. שניהם מתכווצים כשמאירים על כל אחת מהעיניים.` },
  { id: `c_lids`, group: `cranial`, region: `eyes`, nerves: `III`, label: `עפעפיים`, normal: `העפעפיים במקומם, בלי צניחה.` },
  { id: `c_eyemoves`, group: `cranial`, region: `eyes`, nerves: `III, IV, VI`, label: `תנועות עיניים`, normal: `שתי העיניים זזות יחד לכל הכיוונים, בלי ראייה כפולה.` },
  { id: `c_facesens`, group: `cranial`, region: `face`, nerves: `V`, label: `תחושה בפנים`, normal: `מרגיש מגע ודקירה באופן שווה במצח, בלחיים ובסנטר, בשני הצדדים.` },
  { id: `c_corneal`, group: `cranial`, region: `face`, nerves: `V, VII`, label: `רפלקס הקרנית`, normal: `נגיעה בקרנית של כל אחת מהעיניים גורמת לשתי העיניים למצמץ.` },
  { id: `c_jaw`, group: `cranial`, region: `mouth`, nerves: `V`, label: `שרירי הלעיסה`, normal: `שרירי הלעיסה חזקים בשני הצדדים, והלסת נפתחת ישר.` },
  { id: `c_brow`, group: `cranial`, region: `face`, nerves: `VII`, label: `הרמת גבות וקימוט מצח`, normal: `המצח מתקמט שווה בשני הצדדים.` },
  { id: `c_eyeclose`, group: `cranial`, region: `face`, nerves: `VII`, label: `עצימת עיניים חזקה`, normal: `סוגר את שתי העיניים חזק, ואי אפשר לפתוח אותן בכוח.` },
  { id: `c_smile`, group: `cranial`, region: `face`, nerves: `VII`, label: `חיוך וחשיפת שיניים`, normal: `החיוך סימטרי.` },
  { id: `c_puff`, group: `cranial`, region: `face`, nerves: `VII`, label: `ניפוח לחיים`, normal: `מנפח את הלחיים, והאוויר לא בורח.` },
  { id: `c_taste`, group: `cranial`, region: `mouth`, nerves: `VII, IX`, label: `טעם`, normal: `מזהה מתוק ומלוח בשני צדי הלשון.` },
  { id: `c_hearing`, group: `cranial`, region: `ears`, nerves: `VIII`, label: `שמיעה ומבחני מזלג קול`, normal: `שומע לחישה בשתי האוזניים. במבחן וובר הצליל נשמע באמצע, ובמבחן רינה הוא נשמע טוב יותר באוויר מאשר דרך העצם, בשתי האוזניים.` },
  { id: `c_balance`, group: `cranial`, region: `ears`, nerves: `VIII`, label: `שיווי משקל ועמידה`, normal: `עומד יציב גם בעיניים עצומות, ואין ריצוד עיניים (ניסטגמוס).` },
  { id: `c_aah`, group: `cranial`, region: `mouth`, nerves: `IX, X`, label: `"אההה": החך והענבל`, normal: `החך הרך עולה שווה בשני הצדדים, והענבל במרכז.` },
  { id: `c_gag`, group: `cranial`, region: `mouth`, nerves: `IX, X`, label: `רפלקס הקאה`, normal: `רפלקס ההקאה קיים, כשנוגעים בכל אחד מצדי הלוע.` },
  { id: `c_voice`, group: `cranial`, region: `mouth`, nerves: `X`, label: `קול ובליעה`, normal: `הקול רגיל, ובולע מים בלי להשתעל.` },
  { id: `c_shrug`, group: `cranial`, region: `neck`, nerves: `XI`, label: `הרמת כתפיים`, normal: `מרים את שתי הכתפיים בכוח שווה.` },
  { id: `c_headturn`, group: `cranial`, region: `neck`, nerves: `XI`, label: `סיבוב ראש נגד התנגדות`, normal: `מסובב את הראש לשני הצדדים נגד התנגדות, בכוח שווה.` },
  { id: `c_tongue`, group: `cranial`, region: `mouth`, nerves: `XII`, label: `הוצאת לשון`, normal: `הלשון יוצאת ישר, בלי דלדול ובלי רטטים.` },

  // בדיקה כללית ונוירולוגית
  { id: `g_strength`, group: `general`, region: `limbs`, label: `כוח בידיים וברגליים`, normal: `הכוח בידיים וברגליים מלא ושווה.` },
  { id: `g_reflexes`, group: `general`, region: `limbs`, label: `החזרים (רפלקסים בגפיים)`, normal: `ההחזרים בידיים וברגליים תקינים ושווים בשני הצדדים.` },
  { id: `g_sensation`, group: `general`, region: `limbs`, label: `תחושה בגוף`, normal: `מרגיש מגע, דקירה וחום בגוף ובגפיים, באופן שווה.` },
  { id: `g_gait`, group: `general`, region: `limbs`, label: `הליכה וקואורדינציה`, normal: `הולך ישר, ובדיקת אצבע-אף תקינה בשתי הידיים.` },
  { id: `g_speech`, group: `general`, region: `mouth`, label: `דיבור ושפה`, normal: `מדבר ברור ובשטף, ומבין הכול.` },
  { id: `g_otoscope`, group: `general`, region: `ears`, label: `בדיקת אוזניים (אוטוסקופ)`, normal: `עור התוף תקין בשתי האוזניים.` },
  { id: `g_fundus`, group: `general`, region: `eyes`, label: `קרקעית העין`, normal: `הדיסקות האופטיות חדות ותקינות בשתי העיניים.` },
  { id: `g_neck`, group: `general`, region: `neck`, label: `בדיקת צוואר`, normal: `הצוואר רך, בלי גושים ובלי נוקשות.` },
  { id: `g_skin`, group: `general`, region: `skin`, label: `עור (פריחה, שלפוחיות)`, normal: `אין פריחה ואין שלפוחיות, גם לא באוזניים ובפה.` },
];

// אזורי הגוף בלשונית "בדיקה" (כל אזור פותח רק את הבדיקות שלו)
export const REGIONS = [
  { id: `eyes`, label: `עיניים` },
  { id: `face`, label: `פנים` },
  { id: `ears`, label: `אוזניים` },
  { id: `nose`, label: `אף` },
  { id: `mouth`, label: `פה ולשון` },
  { id: `neck`, label: `צוואר וכתפיים` },
  { id: `limbs`, label: `ידיים ורגליים` },
  { id: `skin`, label: `עור` },
];

// מכשירי המדידה בלשונית "מדדים". כל מכשיר מבצע פעולה אחת או יותר מהקטלוג
export const DEVICES = [
  { id: `cuff`, label: `דופק ולחץ דם`, acts: [`v_pulse`, `v_bp`] },
  { id: `oxi`, label: `ריווי חמצן (אוקסימטר)`, acts: [`v_sat`] },
  { id: `gluco`, label: `סוכר (סטיק)`, acts: [`v_glucose`] },
  { id: `thermo`, label: `חום`, acts: [`v_temp`] },
  { id: `ecg`, label: `אק"ג 3 לידים`, acts: [`v_ecg`] },
];

export const actionById = Object.fromEntries(ACTIONS.map((a) => [a.id, a]));
export const groupById = Object.fromEntries(GROUPS.map((g) => [g.id, g]));
// שאלות שכל מקרה חייב לענות עליהן בעצמו
export const REQUIRED = [`h_onset`, `h_course`];
