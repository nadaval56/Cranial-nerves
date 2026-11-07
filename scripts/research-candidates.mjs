// מועמדים לעדכון "מהמחקר החדש" (content/research.js).
// מושך מ-PubMed את המאמרים האחרונים לכל עצב (סקירות, ניסויים ומטה-אנליזות, באנגלית, עם תקציר)
// ומדפיס רק את מה שעוד לא נמצא ברשימה. הבחירה והתרגום לעברית נעשים ידנית.
// הרצה: node scripts/research-candidates.mjs [ימים אחורה, ברירת מחדל 30]
import { RESEARCH } from '../content/research.js';

const days = Number(process.argv[2] ?? 30);
const Q = {
  olfactory: '"olfactory nerve"[mh] OR "olfaction disorders"[mh]',
  optic: '"optic nerve"[mh] OR "optic nerve diseases"[mh]',
  oculomotor: '"oculomotor nerve"[mh] OR "oculomotor nerve diseases"[mh]',
  trochlear: '"trochlear nerve"[mh] OR "trochlear nerve diseases"[mh] OR "fourth nerve palsy"[tiab]',
  trigeminal: '"trigeminal nerve"[mh] OR "trigeminal neuralgia"[mh]',
  abducens: '"abducens nerve"[mh] OR "abducens nerve diseases"[mh] OR "sixth nerve palsy"[tiab]',
  facial: '"facial nerve"[mh] OR "facial paralysis"[mh]',
  vestibulocochlear: '"vestibulocochlear nerve"[mh] OR "vestibular neuronitis"[mh]',
  glossopharyngeal: '"glossopharyngeal nerve"[mh] OR "glossopharyngeal nerve diseases"[mh]',
  vagus: '"vagus nerve"[mh] OR "vagus nerve stimulation"[mh]',
  accessory: '"accessory nerve"[mh] OR "accessory nerve injuries"[mh] OR "spinal accessory nerve"[tiab]',
  hypoglossal: '"hypoglossal nerve"[mh] OR "hypoglossal nerve diseases"[mh]',
};
const TYPES = '(review[pt] OR clinical trial[pt] OR meta-analysis[pt] OR systematic review[pt] OR practice guideline[pt])';
const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (path, params) => {
  const res = await fetch(`${BASE}${path}?${new URLSearchParams({ ...params, retmode: 'json', tool: 'cranial-nerves-site' })}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
};

const out = {};
for (const [id, q] of Object.entries(Q)) {
  const have = new Set((RESEARCH[id] ?? []).map((a) => a.pmid));
  const term = `(${q}) AND ${TYPES} AND english[la] AND hasabstract`;
  const s = await get('esearch.fcgi', { db: 'pubmed', term, sort: 'pub_date', retmax: 20, datetype: 'edat', reldate: days });
  await sleep(400);
  const ids = s.esearchresult.idlist.filter((p) => !have.has(p));
  if (!ids.length) { out[id] = []; continue; }
  const r = (await get('esummary.fcgi', { db: 'pubmed', id: ids.join(',') })).result;
  await sleep(400);
  out[id] = ids.map((p) => ({ pmid: p, title: r[p].title, journal: r[p].fulljournalname, date: r[p].pubdate, types: r[p].pubtype.filter((t) => t !== 'Journal Article') }));
}
console.log(JSON.stringify(out, null, 1));
