// הבדיקה צעד אחר צעד. ב-build התוכן כבר בתוך העמוד; בשרת הפיתוח הוא נבנה כאן.
import { NERVES } from '../../content/nerves.js';
import { examList } from '../lib/render.js';

const root = document.getElementById('exam-root');
if (!root.children.length) root.innerHTML = examList(NERVES);

// קישור ישיר לבדיקה של עצב מסוים (exam.html#exam-facial): פותחים אותה וגוללים אליה
const target = location.hash && document.getElementById(location.hash.slice(1));
if (target && target.tagName === 'DETAILS') { target.open = true; target.scrollIntoView({ block: 'start' }); }
