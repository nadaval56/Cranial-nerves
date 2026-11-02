// הבדיקה צעד אחר צעד. ב-build התוכן כבר בתוך העמוד; בשרת הפיתוח הוא נבנה כאן.
import { NERVES } from '../../content/nerves.js';
import { examList } from '../lib/render.js';

const root = document.getElementById('exam-root');
if (!root.children.length) root.innerHTML = examList(NERVES);
