// ציר הזמן: התוכן נבנה מראש ב-build; כאן — סימון השנה שבמסך בסרגל העליון.
import { EVENTS } from '../../content/timeline.js';
import { timeline } from '../lib/render.js';

const root = document.getElementById('timeline-root');
if (!root.querySelector('.timeline')) root.innerHTML = timeline(EVENTS);

const nav = root.querySelector('.tl-nav');
if ('IntersectionObserver' in window && nav) {
  const links = new Map([...nav.querySelectorAll('a')].map((a) => [a.dataset.id, a]));
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const id = en.target.id.slice(3);
      links.forEach((a, key) => a.toggleAttribute('aria-current', key === id));
      const a = links.get(id);
      const ol = nav.querySelector('ol');
      if (a && ol.scrollWidth > ol.clientWidth) ol.scrollTo({ left: a.offsetLeft - ol.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  root.querySelectorAll('.tl-item').forEach((li) => io.observe(li));
}
