# מקורות

כל טענה אנטומית, קלינית או היסטורית באתר צריכה מקור. הקובץ הזה מרכז אותם.

## אנטומיה וקליניקה — לכל העצבים

- StatPearls (NCBI Bookshelf, גישה חופשית) — הסדרה "Neuroanatomy, Cranial Nerve". פרק לכל עצב:
  - I: https://www.ncbi.nlm.nih.gov/books/NBK556066/
  - VII: https://www.ncbi.nlm.nih.gov/books/NBK526024/
  - X: https://www.ncbi.nlm.nih.gov/books/NBK537171/
  - שאר הפרקים: חיפוש "StatPearls Neuroanatomy Cranial Nerve" ב-NCBI Bookshelf.
- Wikipedia: Cranial nerves — https://en.wikipedia.org/wiki/Cranial_nerves (סקירה, טבלת פתחים, היסטוריה).

## טענות ספציפיות שכדאי לזכור את המקור שלהן

| טענה | איפה באתר | מקור |
|---|---|---|
| כ-80% מהסיבים בעצב התועה תחושתיים (הערכה מקובלת) | עצב X | StatPearls, Vagus |
| ~400 סוגי קולטני ריח פעילים באדם | עצב I | Wikipedia: Olfactory receptor |
| השבלול: 2.5–2.75 סיבובים, ~3 ס"מ באורך פרוש | עצב VIII | Wikipedia: Cochlea |
| עצב הריח: ~20 צרורות (fila olfactoria), מיליוני אקסונים; העצב הקצר ביותר | עצב I | Wikipedia: Olfactory nerve |
| עצב הראייה: 770 אלף עד 1.7 מיליון סיבים, ~53% חוצים | עצב II | Wikipedia: Optic nerve |
| עור זווית הלסת — C2–C3, לא העצב החמישי | עצב V | Wikipedia: Trigeminal nerve |
| שריר הארכובה — שריר השלד הקטן ביותר | עצב VII | Wikipedia: Stapedius muscle |
| התעלפות וזו-וגאלית: האטת הלב (עצב התועה) + נסיגת הטונוס הסימפתטי | עצב X | Wikipedia: Reflex syncope |
| עצב VI כ"סימן ממקם כוזב" בלחץ תוך-גולגולתי | עצב VI | StatPearls, Abducens |
| שיתוק מרכזי חוסך את המצח (עצבוב קורטיקלי דו-צדדי של החלק העליון) | עצב VII, המעבדה | StatPearls, Facial |
| סיבי האישון בהיקף עצב III — לחץ חיצוני פוגע באישון מוקדם | עצב III | StatPearls, Oculomotor |
| לולאת מאייר = רבע עליון; קרינה קודקודית = רבע תחתון; חסכון מקולרי בקליפה | מסלול הראייה | Wikipedia: Visual field; Meyer's loop |

## היסטוריה (ציר הזמן)

לכל אירוע ב-`content/timeline.js` יש שדה `source` עם קישור. השנים:
גלנוס (~170, 7 זוגות) · וזאליוס (1543) · וויליס (1664, Cerebri Anatome, 9 זוגות, איורי כריסטופר רן) ·
וויט (1751, רפלקס האישון) · זמרינג (1778, 12 זוגות) · בל (1821) · רינה (1855) · פריטש (1878, העצב הטרמינלי) ·
לוי (1921, Vagusstoff; נובל 1936) · FDA (1997, P970003 — גירוי עצב התועה לאפילפסיה) · קורונה ואנוסמיה (2020; Brann et al., Science Advances).

## איורים ומודלים

כל האיורים הדו-ממדיים צוירו לאתר עצמו ב-SVG (src/lib/brainstem.js ורכיבי המעבדה).

המודל התלת-ממדי (`public/models/brain-cn.glb`): Anderson M. Winkler, Brain for Blender, https://brainder.org/research/brain-for-blender/ — CC BY-SA 3.0, דרך nadaval56/brain (assets/brain.glb). הנגזרת שלנו (scripts/make-model.py) משותפת באותו רישיון. מסלולי העצבים על המודל צוירו באתר (src/lib/brain3d.js) לפי מקומות היציאה מגזע המוח במודל; הם מפושטים.
אם יתווספו תמונות — אותם כללי רישיון כמו באתר הרנטגן: CC BY / CC0 / נחלת הכלל בלבד, בלי NC, ND או SA.

## כללים קליניים — אימות (נובמבר 2026)

### חיסכון במצח בפגיעה מוחית (עצב VII)
- **התצפית הקלינית** (בפגיעה מעל הגרעין המצח נשמר; בפגיעה בעצב — כל חצי הפנים): מוסכמת. Radiopaedia, "Facial palsy":
  "in the former there is sparing of the ipsilateral forehead muscles ... This is due to bilateral innervation of the forehead muscles"
  https://radiopaedia.org/articles/facial-palsy
- **המנגנון:** ההסבר הקלאסי (עצבוב דו-צדדי של החלק העליון) נתמך במחקר מעקב-מסלולים בקופים:
  Morecraft RJ et al., Brain 2001;124(1):176-208, doi:10.1093/brain/124.1.176 —
  "M1, LPMCv, LPMCd and M4 projected primarily to the contralateral lateral subnucleus, which innervated the perioral musculature" ;
  "M3 projected bilaterally to the dorsal and intermediate subnuclei, which innervated the frontalis and orbicularis oculi" ;
  "Bilateral innervation of the upper face is supplied by M2 and M3."
  https://academic.oup.com/brain/article/124/1/176/309282
  כלומר: הקלט הדו-צדדי למצח מגיע בעיקר מאזורים מוטוריים בצד הפנימי של המוח (M2, M3 — כולל קליפת החגורה), ולכן נשמר גם כששבץ פוגע בקליפה המוטורית הצדדית.
- **הסתייגות:** Radiopaedia מציין שההסבר המסורתי "may not be supported by the literature", ומפנה ל-
  Mahadevappa K et al., "Facial paralysis: a critical review of accepted explanation", Med Hypotheses 2010;74(3):508-9.
  הניסוח באתר ("החלק בגרעין שמפעיל את המצח מקבל פקודות משני צדי המוח") הוא הפישוט המקובל, ונתמך ב-Morecraft 2001.

### כיוון הסטייה של הלשון והענבל (עצבים XII ו-X)
- לשון: בפגיעה בעצב XII היא סוטה לצד הפגוע (הגניוגלוסוס הבריא דוחף לבד). ענבל: נמשך לצד הבריא בפגיעה בעצב X.
  Radiopaedia: https://radiopaedia.org/articles/98541 ; Medbullets Step 1: https://step1.medbullets.com/testview?qid=108926 ;
  Deranged Physiology, CN IX–X: https://derangedphysiology.com/main/required-reading/neurological-intensive-care/Chapter-469/lesions-glossopharyngeal-and-vagus-nerves-cn-ix-and-x

## המפות האינטראקטיביות (src/lib/diagrams.js)
- אזורי העצב החמישי וזווית הלסת (C2–C3, great auricular): Wikipedia: Trigeminal nerve — https://en.wikipedia.org/wiki/Trigeminal_nerve
- עצבוב הלשון (טעם: VII קדמי, IX אחורי כולל הפטמות המוקפות, X בסיס ומכסה הגרון; מגע: V3 קדמי, IX אחורי; תנועה: XII חוץ מ-palatoglossus שמקבל X): Wikipedia: Tongue — https://en.wikipedia.org/wiki/Tongue ; TeachMeAnatomy: https://teachmeanatomy.info/head/organs/tongue/
- חמשת ענפי עצב הפנים והשרירים שלהם: TeachMeAnatomy — https://teachmeanatomy.info/head/cranial-nerves/facial-nerve/
- החלום של אוטו לוי (עצב X): הסיפור של לוי עצמו, מצוטט ב-British Pharmacological Society, Pharmacology Hall of Fame — https://www.bps.ac.uk/about/About-pharmacology/Pharmacology-Hall-of-Fame/Articles/otto-loewi ; ראו גם https://en.wikipedia.org/wiki/Otto_Loewi (בחלק מהמקורות השנה 1920 ובחלקם 1921; הניסוי עצמו נעשה באביב 1921 — לכן באתר לא נכתבה שנה לחלום).
