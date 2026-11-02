import { LAB } from '../config.js';

document.getElementById('lab-grid').innerHTML = LAB.map((t) => `<article class="card lab-card"><div class="card-body">`
  + `<p class="lab-card-nerves" dir="ltr">${t.nerves}</p>`
  + `<h2><a class="card-link" href="./${t.page}.html">${t.label}</a></h2><p>${t.text}</p></div></article>`).join('');
