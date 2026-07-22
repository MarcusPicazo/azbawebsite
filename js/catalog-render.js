import { CATALOG, catalogStats } from './catalog-data.js';
import { PRODUCT_IMAGES } from './product-images.js';

function formatPrice(n) {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: hasCents ? 2 : 0, maximumFractionDigits: 2 }) + ' <small>MXN</small>';
}

function priceMarkup(item) {
  if (item.priceLabel) {
    const isQuote = /cotizar/i.test(item.priceLabel);
    return `<span class="price${isQuote ? ' is-quote' : ''}">${item.priceLabel}</span>`;
  }
  return `<span class="price">${formatPrice(item.price)}</span>`;
}

function rowMarkup(item) {
  const img = PRODUCT_IMAGES[item.name];
  const thumb = img ? `<img class="cat-row__thumb" src="${img}" alt="" loading="lazy">` : '<span class="cat-row__thumb cat-row__thumb--empty"></span>';
  return `
    <div class="cat-row">
      ${thumb}
      <span class="name">${item.name}${item.desc ? `<small>${item.desc}</small>` : ''}</span>
      <span class="leader"></span>
      ${priceMarkup(item)}
    </div>`;
}

function groupMarkup(group) {
  return `
    <div class="cat-group">
      <h3>${group.name}</h3>
      ${group.items.map(rowMarkup).join('')}
    </div>`;
}

function sectionMarkup(section) {
  const itemCount = section.groups.reduce((n, g) => n + g.items.length, 0);
  const head = `
    <div class="cat-section__head">
      <h2>${section.title}</h2>
      <span class="cat-section__count">${itemCount} artículos</span>
    </div>`;
  const banner = section.image
    ? `
    <figure class="cat-banner">
      <img src="${section.image.src}" alt="${section.title}">
      <div class="cat-banner__scrim">${head}</div>
      <figcaption class="cat-banner__credit">${section.image.credit}</figcaption>
    </figure>`
    : head;
  return `
    <section class="cat-section" id="${section.id}">
      ${banner}
      ${section.note ? `<p class="cat-section__note">${section.note}</p>` : ''}
      <div class="cat-groups">
        ${section.groups.map(groupMarkup).join('')}
      </div>
    </section>`;
}

function navMarkup(section) {
  return `<a href="#${section.id}">${section.title}</a>`;
}

export function renderCatalog() {
  const root = document.querySelector('#catalog-root');
  const nav = document.querySelector('#cat-subnav-list');
  if (root) root.innerHTML = CATALOG.map(sectionMarkup).join('');
  if (nav) nav.innerHTML = CATALOG.map(navMarkup).join('');

  const stats = catalogStats();
  document.querySelectorAll('[data-stat-items]').forEach((el) => (el.textContent = `${stats.items}+`));
  document.querySelectorAll('[data-stat-categories]').forEach((el) => (el.textContent = stats.categories));

  // active pill highlight on scroll — measured against the real, current
  // on-screen position of the sticky subnav rather than a guessed offset,
  // so it stays correct as the floating header changes height.
  const links = Array.from(document.querySelectorAll('.cat-subnav__list a'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const subnav = document.querySelector('.cat-subnav');
  const setActive = () => {
    const threshold = (subnav ? subnav.getBoundingClientRect().bottom : 140) + 24;
    let idx = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= threshold) idx = i; });
    links.forEach((a, i) => a.classList.toggle('is-active', i === idx));
  };
  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
}
