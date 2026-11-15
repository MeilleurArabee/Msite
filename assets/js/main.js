/* =========================================================
   Astelsia — animations (GSAP + ScrollTrigger + SplitText + Lenis)
   ========================================================= */
(function () {
  'use strict';
  window.__astelsiaReady = true;
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Coordonnées (assets/js/config.js) ---------- */
  var C = window.ASTELSIA_CONTACT || {};
  document.querySelectorAll('[data-contact="phone"]').forEach(function (a) {
    if (!C.phone) return;
    a.textContent = C.phone;
    a.href = 'tel:+33' + C.phone.replace(/\D/g, '').replace(/^0/, '');
  });
  document.querySelectorAll('[data-contact="email"]').forEach(function (a) {
    if (!C.email) return;
    a.textContent = C.email;
    a.href = 'mailto:' + C.email;
  });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Choix d'une formule -> contact ---------- */
  var planBox = document.querySelector('.contact__plan');
  document.querySelectorAll('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var plan = btn.getAttribute('data-plan');
      planBox.hidden = false;
      planBox.querySelector('strong').textContent = plan;
      document.querySelectorAll('[data-contact="email"]').forEach(function (a) {
        a.href = 'mailto:' + (C.email || '') + '?subject=' + encodeURIComponent('Formule ' + plan + ' — mon projet');
      });
    });
  });

  /* ---------- Halo sur les formules (SpotlightCard) ---------- */
  document.querySelectorAll('.plan').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
    card.addEventListener('pointerdown', function () { card.classList.add('is-touched'); });
  });

  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('anim'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* ---------- Scroll fluide Lenis synchronisé avec GSAP ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      else if (target === 0) window.scrollTo(0, 0);
      else target.scrollIntoView();
    });
  });

  /* ---------- En-tête ---------- */
  var header = document.querySelector('.header');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', y > 300 && self.direction === 1);
    }
  });

  /* ---------- La descente : des étoiles au paysage ---------- */
  var scene = window.AstelsiaScene;
  var tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 0.8,
      onUpdate: function (self) { if (scene) scene.setStarsActive(self.progress < 0.75); }
    }
  });
  tl.to('.sky--night', { opacity: 0, duration: 0.5 }, 0.2)
    .to('.stars', reduced ? { opacity: 0, duration: 0.55 } : { opacity: 0, yPercent: -45, duration: 0.6 }, 0.1)
    .fromTo('.moon', { opacity: 0, y: reduced ? 0 : '25vh' }, { opacity: 1, y: 0, duration: 0.35 }, 0.42)
    .to('.glow', { opacity: 1, duration: 0.4 }, 0.6);
  if (reduced) {
    tl.fromTo('.land', { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.5);
  } else {
    [['.layer--far', 60], ['.layer--mid', 80], ['.layer--tree', 100], ['.layer--front', 130]].forEach(function (l, i) {
      tl.fromTo(l[0], { yPercent: l[1] }, { yPercent: 0, duration: 0.5 - i * 0.03, ease: 'power1.out' }, 0.5);
    });
  }
  tl.to({}, { duration: 0.01 }, 0.99); // timeline = 1 exactement

  if (reduced) { root.classList.remove('anim'); return; }

  /* ---------- Bandeau qui accélère avec le scroll (ScrollVelocity) ---------- */
  var loop = gsap.to('.marquee__track', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  loop.totalTime(loop.duration() * 100);
  var dir = 1;
  ScrollTrigger.create({
    onUpdate: function (self) {
      dir = self.direction;
      var boost = Math.min(Math.abs(self.getVelocity()) / 250, 6);
      gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.25, overwrite: true });
      gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.25 });
    }
  });

  /* ---------- Apparitions au scroll ---------- */
  gsap.set('[data-reveal]', { y: 34 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }); }
  });

  /* ---------- Prix qui s'incrémentent (CountUp) ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = +el.getAttribute('data-count'), o = { v: Math.round(end * 0.6) };
    gsap.to(o, {
      v: end, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('fr-FR').replace(/ /g, ' '); }
    });
  });

  /* ---------- Ligne de la méthode ---------- */
  gsap.fromTo('.steps__line span', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 60%', scrub: true }
  });

  /* ---------- Textes qui se révèlent (SplitText) ---------- */
  function splitReveal() {
    if (!window.SplitText) { root.classList.remove('anim'); return; }
    var hero = document.querySelector('[data-hero-title]');
    SplitText.create(hero, {
      type: 'words,lines', mask: 'lines', linesClass: 'line',
      onSplit: function (s) {
        gsap.set(hero, { visibility: 'visible' });
        var intro = gsap.timeline({ delay: 0.15 });
        intro.from(s.words, { yPercent: 115, rotate: 4, duration: 1.1, ease: 'power4.out', stagger: 0.06 })
             .to('.hero__in', { opacity: 1, duration: 1, stagger: 0.12, ease: 'power2.out' }, '-=0.6');
        gsap.from('.hero__in', { y: 20, duration: 1, stagger: 0.12, ease: 'power2.out', delay: 0.75 });
        return intro;
      }
    });
    document.querySelectorAll('[data-split]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: function (s) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(s.lines, {
            yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          });
        }
      });
    });
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(splitReveal);
})();
