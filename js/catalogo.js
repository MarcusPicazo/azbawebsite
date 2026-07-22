import { renderCatalog } from './catalog-render.js';
import { initQuoteForm, initWhatsappLinks } from './contact.js';

function initNavToggle() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', id);
      document.querySelector('.nav-toggle')?.classList.remove('is-open');
      document.querySelector('.main-nav')?.classList.remove('is-open');
    });
  });
}

renderCatalog();
initWhatsappLinks();
initQuoteForm();
initNavToggle();
initSmoothAnchors();
