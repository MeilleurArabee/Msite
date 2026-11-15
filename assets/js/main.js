/* =========================================================
   Astelsia — animations
   GSAP + ScrollTrigger + SplitText + Lenis.
   Plus on descend, plus ça s'anime. Rien ne bouge si
   l'appareil demande à réduire les animations.
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
  document.querySelectorAll('[data-contact="email"]').forEach(function (a) {
    if (!C.email) return;
    setText(a, C.email);
    a.href = 'mailto:' + C.email;
  });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Choix d'une formule : on la retient pour le contact ---------- */
  var planBox = document.querySelector('.contact__plan');
  document.querySelectorAll('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var plan = btn.getAttribute('data-plan');
      if (planBox) { planBox.hidden = false; planBox.querySelector('strong').textContent = plan; }
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

  /* ---------- Lucioles ---------- */
  (function () {
    var box = document.querySelector('.fireflies');
    if (!box) return;
    var n = window.innerWidth < 700 ? 12 : 22;
    for (var i = 0; i < n; i++) {
      var f = document.createElement('i');
      f.style.left = (4 + Math.random() * 92) + '%';
      f.style.bottom = (3 + Math.random() * 38) + '%';
      f.style.setProperty('--d', (6 + Math.random() * 8).toFixed(1) + 's');
      f.style.setProperty('--b', (2 + Math.random() * 3).toFixed(1) + 's');
      f.style.setProperty('--delay', (-Math.random() * 8).toFixed(1) + 's');
      f.style.setProperty('--dx', ((Math.random() - 0.5) * 70).toFixed(0) + 'px');
      f.style.setProperty('--dy', (-10 - Math.random() * 50).toFixed(0) + 'px');
      if (Math.random() > 0.6) { f.style.width = f.style.height = '3px'; }
      box.appendChild(f);
    }
  })();

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
      if (lenis) lenis.scrollTo(target, { duration: 1.8 });
      else if (target === 0) window.scrollTo(0, 0);
      else target.scrollIntoView();
    });
  });

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
     Les scènes, selon l'écran.
     Ordre important : d'abord les sections épinglées (pin),
     puis le ciel, qui se cale sur leurs positions.
     ========================================================= */
  var mm = gsap.matchMedia();
  mm.add({
    deck: '(max-width: 899px) and (min-height: 600px)',
    desktop: '(min-width: 900px)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, function (ctx) {
    var c = ctx.conditions;

    if (!c.reduce) {
      /* 1. Bande-annonce : les phrases arrivent une par une */
      var lines = gsap.utils.toArray('.tl-line');
      // la 1re phrase apparaît pendant qu'on arrive, pour ne jamais montrer d'écran vide
      gsap.fromTo(lines[0], { opacity: 0, scale: 0.86, filter: 'blur(14px)', yPercent: -38 }, {
        opacity: 1, scale: 1, filter: 'blur(0px)', yPercent: -50, ease: 'power2.out',
        scrollTrigger: { trigger: '.trailer', start: 'top 75%', end: 'top top', scrub: 0.8 }
      });
      var tr = gsap.timeline({
        scrollTrigger: { trigger: '.trailer', start: 'top top', end: '+=' + (lines.length * 62) + '%', pin: true, scrub: 0.8 }
      });
      lines.forEach(function (l, i) {
        var last = i === lines.length - 1;
        if (i > 0) tr.fromTo(l, { opacity: 0, scale: 0.86, filter: 'blur(14px)', yPercent: -38 },
                     { opacity: 1, scale: 1, filter: 'blur(0px)', yPercent: -50, duration: 1, ease: 'power2.out' });
        if (!last) tr.to(l, { opacity: 0, scale: 1.1, filter: 'blur(10px)', yPercent: -62, duration: 0.8, ease: 'power2.in' }, i === 0 ? '+=0.3' : '+=0.4');
        else tr.to(l, { scale: 1.05, duration: 0.7 }, '+=0.15');
      });

      /* 2. On passe à travers le nom « Astelsia » */
      gsap.timeline({ scrollTrigger: { trigger: '.zoom', start: 'top top', end: '+=110%', pin: true, scrub: 0.6 } })
        .fromTo('.zoom__word', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' })
        .to('.zoom__word', { scale: 34, duration: 1, ease: 'power3.in' })
        .to('.zoom__word', { opacity: 0, duration: 0.2 }, '-=0.22');

      /* 3a. Téléphone : les formules en pile (ScrollStack) */
      if (c.deck) {
        var cards = gsap.utils.toArray(['.plan--signature', '.plan--solo', '.plan--featured']);
        gsap.set(cards.slice(1), { yPercent: 115, rotationX: -24 });
        var deck = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: '.plans__stage', start: 'top top', end: '+=260%', pin: true, scrub: 0.8 }
        });
        deck.from(cards[0], { yPercent: 25, rotationX: -18, opacity: 0, duration: 0.8 });
        cards.forEach(function (card, i) {
          if (i === 0) return;
          var at = 0.4 + i * 1.2;
          deck.to(card, { yPercent: 0, rotationX: 0, duration: 1 }, at);
          for (var j = 0; j < i; j++) {
            deck.to(cards[j], { scale: 1 - (i - j) * 0.05, y: -(i - j) * 12, filter: 'brightness(' + (1 - (i - j) * 0.28) + ')', duration: 1 }, at);
          }
        });
        deck.to({}, { duration: 0.5 });
      }

      /* 3b. Ordinateur : les 3 cartes se lèvent, Business au centre */
      if (c.desktop) {
        gsap.from(['.plan--signature', '.plan--featured', '.plan--solo'], {
          y: 140, rotationX: -24, opacity: 0, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.plans', start: 'top 90%', end: 'top 35%', scrub: 1 }
        });
      }
    }

    /* 4. Le ciel : nuit → heure bleue → paysage */
    var red = c.reduce;
    // nuit → crépuscule bleu, pendant la bande-annonce
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.trailer', start: 'top 60%', endTrigger: '#formules', end: 'top 20%', scrub: red ? true : 1
      }
    })
      .to('.sky--night', { opacity: 0 }, 0)
      .to('.stars', red ? { opacity: 0.55 } : { opacity: 0.55, yPercent: -18 }, 0);

    // crépuscule → heure bleue et horizon rose, pendant les formules
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#formules', start: 'top 20%', endTrigger: '#abonnement', end: 'center center', scrub: red ? true : 1,
        onUpdate: function (self) { if (scene) scene.setStarsActive(self.progress < 0.95); }
      }
    })
      .to('.sky--twilight', { opacity: 0, duration: 1 }, 0)
      .fromTo('.clouds', { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.1)
      .to('.stars', red ? { opacity: 0, duration: 1 } : { opacity: 0, yPercent: -40, duration: 1 }, 0)
      .fromTo('.moon', { opacity: 0, y: red ? 0 : '22vh' }, { opacity: 1, y: 0, duration: 0.7 }, 0.3)
      .to('.glow', { opacity: 1, duration: 0.6 }, 0.4);

    // le paysage monte, plan par plan, jusqu'au contact
    var land = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#contact', start: 'top 95%', endTrigger: '.footer', end: 'bottom bottom', scrub: red ? true : 1 }
    });
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
  if (dot) {
    var bar = document.querySelector('.altitude');
    ScrollTrigger.create({
      start: 0, end: function () { return ScrollTrigger.maxScroll(window); },
      onUpdate: function (self) { gsap.set(dot, { y: self.progress * Math.max(0, bar.offsetHeight - 7) }); }
    });
  }

  if (reduced) { root.classList.remove('anim'); return; }

  /* ---------- Bandeau qui accélère avec le scroll (ScrollVelocity) ---------- */
  var loop = gsap.to('.marquee__track', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
  loop.totalTime(loop.duration() * 100);
  ScrollTrigger.create({
    onUpdate: function (self) {
      var dir = self.direction;
      var boost = Math.min(Math.abs(self.getVelocity()) / 250, 6);
      gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.25, overwrite: true });
      gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.25 });
    }
  });

  /* ---------- Apparitions au scroll ---------- */
  gsap.set('[data-reveal]', { y: 34 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }); }
  });

  /* ---------- Textes qui se révèlent (SplitText) ---------- */
  function splitReveal() {
    if (!window.SplitText) { root.classList.remove('anim'); return; }
    var hero = document.querySelector('[data-hero-title]');
    SplitText.create(hero, {
      type: 'words,lines', mask: 'lines', autoSplit: true,
      onSplit: function (s) {
        gsap.set(hero, { visibility: 'visible' });
        var intro = gsap.timeline({ delay: 0.15 });
        intro.from(s.words, { yPercent: 115, rotate: 4, duration: 1.15, ease: 'power4.out', stagger: 0.06 })
             .fromTo('.hero__in', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'power2.out' }, '-=0.6');
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
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          });
        }
      });
    });
    ScrollTrigger.refresh();
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(splitReveal);
})();
