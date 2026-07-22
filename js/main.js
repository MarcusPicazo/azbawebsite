import { FrameReel } from './scroll-sequence.js';
import { initQuoteForm, initWhatsappLinks } from './contact.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = window.matchMedia('(max-width: 860px), (pointer: coarse)').matches;

const REELS = {
  hero: { section: '#reel-hero', folder: 'assets/frames/hero-orbit', count: 97 },
  macro: { section: '#macro', folder: 'assets/frames/macro', count: 97 },
  engineering: { section: '#engineering', folder: 'assets/frames/exploded', count: 97 },
};

function setLoaderProgress(p) {
  const pct = Math.round(p * 100);
  const fill = document.querySelector('.loader__bar-fill');
  const label = document.querySelector('.loader__pct');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
}

function hideLoader() {
  const loader = document.querySelector('#loader');
  if (loader) loader.classList.add('is-hidden');
}

function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initNavToggle() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });
}

function closeMobileNav() {
  document.querySelector('.nav-toggle')?.classList.remove('is-open');
  document.querySelector('.main-nav')?.classList.remove('is-open');
}

function initNavLinks(lenis) {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileNav();
      if (lenis) lenis.scrollTo(target, { offset: -100, duration: 1.3 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function revealSection(selector, opts = {}) {
  const els = document.querySelectorAll(selector);
  els.forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: (opts.stagger || 0) * i,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  });
}

function initStaticReveals() {
  ['.story .reveal', '.catalog-teaser .reveal', '.catalog-teaser__card', '.cta .reveal', '.site-footer'].forEach((sel) => {
    revealSection(sel, { stagger: 0.06 });
  });
}

/* ---------------- Cinematic desktop mode ---------------- */

async function initCinematicMode() {
  gsap.registerPlugin(ScrollTrigger);

  const heroCfg = REELS.hero;
  const heroCanvas = document.querySelector(`${heroCfg.section} canvas`);
  const heroReel = new FrameReel({ canvas: heroCanvas, folder: heroCfg.folder, count: heroCfg.count });
  await heroReel.preload((p) => setLoaderProgress(p));
  heroReel.resize();
  heroReel.draw(0, true);
  hideLoader();

  const lenis = new Lenis({
    duration: 1.45,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 0.85,
    autoRaf: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // GSAP inserts pin-spacer elements (growing document height) as each ScrollTrigger
  // is created below; Lenis must re-measure its scroll limit whenever that happens,
  // or it caps scrolling at whatever height existed when it was constructed.
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  window.__lenis = lenis;

  initNavLinks(lenis);
  setupHeroTimeline(heroReel);

  const macroReel = new FrameReel({ canvas: document.querySelector(`${REELS.macro.section} canvas`), folder: REELS.macro.folder, count: REELS.macro.count });
  const engineeringReel = new FrameReel({ canvas: document.querySelector(`${REELS.engineering.section} canvas`), folder: REELS.engineering.folder, count: REELS.engineering.count });

  setupMacroTimeline(macroReel);
  setupEngineeringTimeline(engineeringReel);

  // load the remaining sequences in the background, after the hero is interactive
  macroReel.preload();
  engineeringReel.preload();

  initStaticReveals();
  ScrollTrigger.refresh();
}

function setupHeroTimeline(reel) {
  const section = document.querySelector(REELS.hero.section);
  gsap.set('.hero__kicker, .hero__tagline', { y: 18 });
  gsap.set('.hero__scrollcue', { y: 8 });

  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero__kicker', { opacity: 1, y: 0, duration: 0.9 }, 0.15)
    .to('.hero__logo', { opacity: 1, duration: 1.4 }, 0.3)
    .to('.hero__tagline', { opacity: 1, y: 0, duration: 1 }, 0.65)
    .to('.hero__scrollcue', { opacity: 1, y: 0, duration: 0.8 }, 1.05);

  const mult = 3.2;
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => '+=' + window.innerHeight * mult,
    pin: true,
    scrub: 0.85,
    onUpdate: (self) => {
      reel.setProgress(self.progress);
      const fade = 1 - Math.min(1, self.progress / 0.28);
      gsap.set('.hero__textgroup', { opacity: fade });
      gsap.set('.hero__scrollcue', { opacity: self.progress > 0.03 ? 0 : 1 });
    },
  });
}

function setupMacroTimeline(reel) {
  const section = document.querySelector(REELS.macro.section);
  const mult = 3.6;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * mult,
      pin: true,
      scrub: 0.85,
      onUpdate: (self) => reel.setProgress(self.progress),
    },
  });
  tl.fromTo('.macro .reel__label--1', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.12 }, 0.06)
    .to('.macro .reel__label--1', { opacity: 0, y: -18, duration: 0.1 }, 0.27)
    .fromTo('.macro .reel__label--2', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.12 }, 0.39)
    .to('.macro .reel__label--2', { opacity: 0, y: -18, duration: 0.1 }, 0.59)
    .fromTo('.macro .reel__label--3', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.12 }, 0.7)
    .to('.macro .reel__label--3', { opacity: 0, y: -18, duration: 0.12 }, 0.92);
}

function setupEngineeringTimeline(reel) {
  const section = document.querySelector(REELS.engineering.section);
  const mult = 3.4;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + window.innerHeight * mult,
      pin: true,
      scrub: 0.85,
      onUpdate: (self) => reel.setProgress(self.progress),
    },
  });
  tl.fromTo('.engineering__intro', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.14 }, 0.04)
    .to('.engineering__intro', { opacity: 0, y: -16, duration: 0.1 }, 0.26)
    .fromTo('.spec-chip--1', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.1 }, 0.52)
    .fromTo('.spec-chip--2', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.1 }, 0.66)
    .fromTo('.spec-chip--3', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.1 }, 0.8);
}

/* ---------------- Lite mode: touch devices ---------------- */

function initLiteMode() {
  document.body.classList.add('is-lite');
  document.querySelectorAll('.reel__video').forEach((v) => v.play().catch(() => {}));
  gsap.set('.hero__kicker, .hero__logo, .hero__tagline, .hero__scrollcue', { opacity: 1, y: 0 });
  hideLoader();
  initNavLinks(null);

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ['.macro .reel__label--1', '.macro .reel__label--2', '.macro .reel__label--3', '.engineering__intro'].forEach((sel) => {
      revealSection(sel);
    });
    document.querySelectorAll('.spec-chip').forEach((el, i) => revealSection('.spec-chip'));
    initStaticReveals();
  }
}

/* ---------------- Static mode: reduced motion ---------------- */

function initStaticModeMinimal() {
  document.body.classList.add('is-static');
  hideLoader();
  initNavLinks(null);
  initHeader();
}

async function boot() {
  initWhatsappLinks();
  initQuoteForm();
  initHeader();
  initNavToggle();

  if (REDUCED_MOTION) {
    initStaticModeMinimal();
    return;
  }

  if (IS_TOUCH) {
    initLiteMode();
    return;
  }

  try {
    await initCinematicMode();
  } catch (err) {
    console.error('Cinematic mode failed, falling back to lite mode.', err);
    document.querySelectorAll('.reel__video').forEach((v) => {
      if (!v.getAttribute('src')) return;
    });
    initLiteMode();
  }
}

boot();
