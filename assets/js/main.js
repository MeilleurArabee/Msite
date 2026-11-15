/* =========================================================
   Astelsia — animations
   GSAP + ScrollTrigger + SplitText + Lenis.
   Plus on descend, plus ça s'anime. Rien ne bouge si
   l'appareil demande à réduire les animations.
   Réactivité : sections épinglées courtes, effet « aimant »
   (snap) sur téléphone, aucun retard entre le doigt et l'écran.
   ========================================================= */
(function () {
  'use strict';
  window.__astelsiaReady = true;
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Coordonnées (assets/js/config.js) ---------- */
  var C = window.ASTELSIA_CONTACT || {};
  function setText(a, t) { var el = a.querySelector('[data-contact-text]') || a; el.textContent = t; }
  document.querySelectorAll('[data-contact="phone"]').forEach(function (a) {
    if (!C.phone) return;
    setText(a, C.phone);
    a.href = 'tel:+33' + C.phone.replace(/\D/g, '').replace(/^0/, '');
  });
  document.querySelectorAll('[data-contact="email"]').forEach(function (a) { if (C.email) setText(a, C.email); });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Halo sur les formules (SpotlightCard) ---------- */
  if (finePointer) {
    document.querySelectorAll('.plan').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--y', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Lucioles ---------- */
  (function () {
    var box = document.querySelector('.fireflies');
    if (!box) return;
    var n = window.innerWidth < 700 ? 9 : 18;
    for (var i = 0; i < n; i++) {
      var f = document.createElement('i');
      f.style.left = (4 + Math.random() * 92) + '%';
      f.style.bottom = (3 + Math.random() * 38) + '%';
      f.style.setProperty('--d', (6 + Math.random() * 8).toFixed(1) + 's');
      f.style.setProperty('--b', (2 + Math.random() * 3).toFixed(1) + 's');
      f.style.setProperty('--delay', (-Math.random() * 8).toFixed(1) + 's');
      f.style.setProperty('--dx', ((Math.random() - 0.5) * 70).toFixed(0) + 'px');
      f.style.setProperty('--dy', (-10 - Math.random() * 50).toFixed(0) + 'px');
      box.appendChild(f);
    }
  })();

  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('anim'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Scroll fluide Lenis (ordinateur) synchronisé avec GSAP ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.13, wheelMultiplier: 1.05, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });
  // l'aimant n'est utile qu'au doigt : au trackpad/souris, Lenis s'occupe de la douceur
  var snap = !lenis;

  /* ---------- En-tête qui se cache en descendant ---------- */
  var header = document.querySelector('.header');
  ScrollTrigger.create({
    start: 0, end: function () { return ScrollTrigger.maxScroll(window); },
    onUpdate: function (self) {
      var y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', y > 300 && self.direction === 1);
    }
  });

  /* ---------- Boutons aimantés (souris uniquement) ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.btn--magnet').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
      var yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  var scene = window.AstelsiaScene;

  /* =========================================================
     Les scènes. D'abord les sections épinglées (pin),
     puis le ciel, qui se cale sur leurs positions.
     ========================================================= */
  var mm = gsap.matchMedia();
  mm.add({ mobile: '(max-width: 899px)', desktop: '(min-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
    var c = ctx.conditions;

    var g = c.reduce; // mode doux : fondus uniquement, aucun déplacement
    {
      /* 1. Bande-annonce : 3 phrases, une par « cran » */
      var lines = gsap.utils.toArray('.tl-line');
      var IN = g ? { opacity: 0, scale: 1, yPercent: -50 } : { opacity: 0, scale: 0.9, yPercent: -36 };
      var OUT = g ? { opacity: 0, scale: 1, yPercent: -50 } : { opacity: 0, scale: 1.08, yPercent: -64 };
      gsap.fromTo(lines[0], IN, {
        opacity: 1, scale: 1, yPercent: -50, ease: 'power2.out',
        scrollTrigger: { trigger: '.trailer', start: 'top 80%', end: 'top top', scrub: true }
      });
      var tr = gsap.timeline({
        scrollTrigger: {
          trigger: '.trailer', start: 'top top', end: '+=150%', pin: true, scrub: 0.3,
          snap: snap ? { snapTo: 'labels', duration: { min: 0.25, max: 0.6 }, delay: 0.04, ease: 'power2.inOut' } : false
        }
      });
      tr.addLabel('l0').to({}, { duration: 0.15 });
      lines.forEach(function (l, i) {
        if (i === 0) return;
        tr.fromTo(lines[i - 1], { opacity: 1, scale: 1, yPercent: -50 }, Object.assign({ duration: 0.5, ease: 'power2.in', immediateRender: false }, OUT))
          .fromTo(l, IN, { opacity: 1, scale: 1, yPercent: -50, duration: 0.6, ease: 'power2.out', immediateRender: false }, '-=0.15')
          .addLabel('l' + i);
      });
      tr.to({}, { duration: 0.25 });

      /* 2. Le nom : la phrase apparaît, puis on traverse le mot */
      // le mot arrive pendant qu'on approche : jamais d'écran vide
      gsap.fromTo('.zoom__word', { scale: g ? 1 : 0.7, opacity: 0 }, {
        scale: 1, opacity: 1, ease: 'power2.out',
        scrollTrigger: { trigger: '.zoom', start: 'top 85%', end: 'top 15%', scrub: true }
      });
      gsap.fromTo('.zoom__line', { opacity: 0, y: g ? 0 : 24 }, {
        opacity: 1, y: 0, ease: 'power2.out',
        scrollTrigger: { trigger: '.zoom', start: 'top 45%', end: 'top top', scrub: true }
      });
      gsap.timeline({
        scrollTrigger: {
          trigger: '.zoom', start: 'top top', end: '+=80%', pin: true, scrub: 0.3,
          snap: snap ? { snapTo: [0, 1], duration: { min: 0.25, max: 0.6 }, delay: 0.04 } : false
        }
      })
        .to({}, { duration: 0.2 })
        .fromTo('.zoom__line', { opacity: 1, y: 0 }, { opacity: 0, y: g ? 0 : -20, duration: 0.2, immediateRender: false })
        .fromTo('.zoom__word', { scale: 1, opacity: 1 }, { scale: g ? 1 : 12, opacity: 0, duration: 0.6, ease: 'power2.in', immediateRender: false }, '<');

      /* 3. Formules (ordinateur) : les 3 cartes se lèvent une fois */
      if (c.desktop) {
        gsap.from(['.plan-preview', '.plan[data-plan="solo"]', '.plan[data-plan="business"]', '.plan[data-plan="signature"]'], {
          y: g ? 0 : 80, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '.plans', start: 'top 85%', once: true }
        });
      }
    }

    /* 4. Le ciel : nuit → heure bleue → paysage */
    var red = c.reduce, sc = red ? true : 0.5;
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.trailer', start: 'top 70%', endTrigger: '#formules', end: 'top 30%', scrub: sc } })
      .to('.sky--night', { opacity: 0 }, 0)
      .to('.stars', red ? { opacity: 0.55 } : { opacity: 0.55, yPercent: -15 }, 0);

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#formules', start: 'top 30%', endTrigger: '#serenite', end: 'center center', scrub: sc,
        onUpdate: function (self) { if (scene) scene.setStarsActive(self.progress < 0.95); }
      }
    })
      .to('.sky--twilight', { opacity: 0, duration: 1 }, 0)
      .fromTo('.clouds', { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.1)
      .to('.stars', red ? { opacity: 0, duration: 1 } : { opacity: 0, yPercent: -35, duration: 1 }, 0)
      .fromTo('.moon', { opacity: 0, y: red ? 0 : '20vh' }, { opacity: 1, y: 0, duration: 0.7 }, 0.3)
      .to('.glow', { opacity: 1, duration: 0.6 }, 0.4);

    var land = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#contact', start: 'top 95%', endTrigger: '.footer', end: 'bottom bottom', scrub: sc } });
    if (red) {
      land.fromTo('.land', { opacity: 0 }, { opacity: 1, duration: 1 }, 0);
    } else {
      [['.layer--far', 100], ['.layer--mid', 110], ['.layer--tree', 125], ['.layer--front', 150]].forEach(function (l, i) {
        land.fromTo(l[0], { yPercent: l[1] }, { yPercent: 0, duration: 1 - i * 0.08, ease: 'power1.out' }, i * 0.04);
      });
    }
    land.to('.fireflies', { opacity: 1, duration: 0.3 }, 0.7);
  });

  /* ---------- Petite étoile d'altitude (ordinateur) ---------- */
  var dot = document.querySelector('.altitude span');
  if (dot && finePointer) {
    var bar = document.querySelector('.altitude'), setY = gsap.quickSetter(dot, 'y', 'px');
    ScrollTrigger.create({
      start: 0, end: function () { return ScrollTrigger.maxScroll(window); },
      onUpdate: function (self) { setY(self.progress * Math.max(0, bar.offsetHeight - 7)); }
    });
  }

  /* ---------- Bandeau qui accélère avec le scroll (ScrollVelocity) ---------- */
  var loop = gsap.to('.marquee__track', { xPercent: -50, duration: reduced ? 70 : 30, ease: 'none', repeat: -1 });
  loop.totalTime(loop.duration() * 100);
  var dir = 1, settle = null;
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: function (self) {
      dir = self.direction;
      var boost = reduced ? 0 : Math.min(Math.abs(self.getVelocity()) / 300, 5);
      loop.timeScale(dir * (1 + boost));
      if (settle) settle.kill();
      settle = gsap.to(loop, { timeScale: dir, duration: 1, delay: 0.15 });
    }
  });

  /* ---------- Apparitions au scroll ---------- */
  gsap.set('[data-reveal]', { y: reduced ? 0 : 30 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 92%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }); }
  });

  /* ---------- Textes qui se révèlent (SplitText) ---------- */
  function splitReveal() {
    if (!window.SplitText) { root.classList.remove('anim'); return; }
    var hero = document.querySelector('[data-hero-title]');
    SplitText.create(hero, {
      type: 'words,lines', mask: 'lines', autoSplit: true,
      onSplit: function (s) {
        gsap.set(hero, { visibility: 'visible' });
        var intro = gsap.timeline({ delay: 0.1 });
        intro.from(s.words, reduced ? { opacity: 0, duration: 0.8, stagger: 0.05 } : { yPercent: 115, rotate: 4, duration: 1, ease: 'power4.out', stagger: 0.06 })
             .fromTo('.hero__in', { opacity: 0, y: reduced ? 0 : 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' }, '-=0.6');
        return intro;
      }
    });
    document.querySelectorAll('[data-split]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: function (s) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(s.lines, { yPercent: reduced ? 0 : 110, opacity: reduced ? 0 : 1, duration: 1, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
        }
      });
    });
    ScrollTrigger.refresh();
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(splitReveal);
})();
