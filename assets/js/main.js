/* =========================================================
   Astelsia — animations
   GSAP + ScrollTrigger + SplitText + Lenis.
   Un champ de lavande au coucher du soleil ; la photo s'approche quand on descend.
   Scroll libre au doigt (aucun aimant). À la molette : un cran = une phrase.
   Mode doux (moins d'animations) : fondus uniquement.
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
  document.querySelectorAll('[data-contact-mail]').forEach(function (el) { if (C.email) el.textContent = C.email; });
  document.querySelectorAll('[data-contact-phone]').forEach(function (el) { if (C.phone) el.textContent = C.phone; });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Halo qui suit la souris sur les formules ---------- */
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

  /* ---------- Le logo recharge la page ---------- */
  var logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', function (e) {
    e.preventDefault();
    try { history.scrollRestoration = 'manual'; } catch (err) {}
    window.scrollTo(0, 0);
    location.reload();
  });

  /* ---------- Menu plein écran ---------- */
  var menuBtn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-btn__label').textContent = open ? 'Fermer' : 'Menu';
    menu.setAttribute('aria-hidden', String(!open));
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* =========================================================
     LES PHRASES : chaque mot s'allume quand la phrase monte dans l'écran
     (sans bibliothèque ; builder.js appelle refresh() quand le nom change)
     ========================================================= */
  var Trailer = (function () {
    var box = document.querySelector('.trailer');
    var lines = box ? Array.prototype.slice.call(box.querySelectorAll('.tl-line')) : [];
    var ticking = false;
    function wrap(el) {
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            if (!c.textContent.trim()) return;
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
              else { var s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); }
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1 && !c.classList.contains('w')) walk(c);
        });
      })(el);
      el._w = Array.prototype.slice.call(el.querySelectorAll('.w'));
    }
    function update() {
      ticking = false;
      var vh = innerHeight, start = vh * 0.94, end = vh * 0.56; // tout est allumé un peu avant le centre de l'écran
      lines.forEach(function (el) {
        if (!el._w) return;
        var r = el.getBoundingClientRect(), mid = r.top + r.height / 2;
        var p = Math.max(0, Math.min(1, (start - mid) / (start - end)));
        var n = el._w.length;
        el._w.forEach(function (w, i) { w.classList.toggle('is-lit', p >= 1 || p * (n + 0.6) > i + 0.6); });
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    function refresh() { lines.forEach(wrap); update(); }
    if (lines.length) {
      refresh();
      box.classList.add('tl-ready');
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
    }
    return { refresh: refresh, update: update, lines: lines };
  })();
  window.AstelsiaTrailer = Trailer;

  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('anim'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Scroll fluide Lenis (ordinateur) synchronisé avec GSAP ---------- */
  var lenis = null;
  if (!reduced && window.Lenis && finePointer) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, autoRaf: false });
    window.__lenis = lenis; // pour les tests automatiques
    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', Trailer.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Clic sur un lien interne : une longue descente, douce ---------- */
  var easeIO = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var glide = null;
  function stopGlide() { if (glide) { glide.kill(); glide = null; } }
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stopGlide, { passive: true }); });
  function scrollToTarget(target) {
    var y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY;
    // « Découvrir la suite » : on s'arrête pile sur la première phrase, au centre de l'écran
    if (target && target.classList && target.classList.contains('trailer')) {
      var first = target.querySelector('.tl-line');
      if (first) y = first.getBoundingClientRect().top + window.scrollY + first.offsetHeight / 2 - innerHeight / 2;
    }
    y = Math.max(0, Math.min(y, ScrollTrigger.maxScroll(window)));
    var dist = Math.abs(y - window.scrollY);
    var dur = Math.min(3.6, 1.4 + dist / 2600); // plus c'est loin, plus la descente dure
    if (lenis) { lenis.scrollTo(y, { duration: dur, easing: easeIO, force: true }); return; }
    stopGlide();
    var o = { y: window.scrollY };
    glide = gsap.to(o, { y: y, duration: reduced ? Math.min(dur, 1.6) : dur, ease: 'power2.inOut', onUpdate: function () { window.scrollTo(0, o.y); }, onComplete: function () { glide = null; } });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = id === '#top' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });

  /* ---------- En-tête qui se cache en descendant, revient en remontant ---------- */
  var header = document.querySelector('.header');
  ScrollTrigger.create({
    start: 0, end: function () { return ScrollTrigger.maxScroll(window); },
    onUpdate: function (self) {
      var y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', y > 300 && self.direction === 1);
    }
  });


  /* =========================================================
     Le champ, au fil de la descente
     ========================================================= */
  var mm = gsap.matchMedia();
  mm.add({ mobile: '(max-width: 899px)', desktop: '(min-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
    var c = ctx.conditions, g = c.reduce; // mode doux : fondus uniquement
    var sc = g ? true : 0.6;

    /* 1. Le champ de lavande : la photo s'approche doucement pendant la descente,
          et le voile fonce un peu plus bas pour que les textes restent lisibles */
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: sc } })
      .fromTo('.lav img', { scale: g ? 1.04 : 1.14 }, { scale: 1.02 }, 0)
      .fromTo('.lav__veil', { opacity: 0.3 }, { opacity: 1 }, 0);

    /* 4. Ordinateur : les formules se lèvent une fois */
    if (c.desktop) {
      gsap.from(['.plan-preview', '.plan[data-plan="solo"]', '.plan[data-plan="business"]', '.plan[data-plan="signature"]'], {
        y: g ? 0 : 80, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.plans', start: 'top 85%', once: true }
      });
    }

  });

  /* ---------- Ordinateur : un cran de molette = une glissade douce jusqu'à la phrase suivante ---------- */
  (function () {
    var lines = Trailer.lines;
    if (!lenis || !lines.length) return;
    function docTop(el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; }
    var busy = false;
    function stations() { return lines.map(function (l) { return Math.round(docTop(l) + l.offsetHeight / 2 - innerHeight / 2); }); }
    lenis.options.virtualScroll = function (d) {
      if (!d.event || d.event.type !== 'wheel') return true; // le doigt n'est jamais intercepté
      if (Math.abs(d.deltaY) < Math.abs(d.deltaX) || root.classList.contains('menu-open')) return true;
      var st = stations(), y = lenis.targetScroll, zone = innerHeight * 0.6;
      if (y < st[0] - zone || y > st[st.length - 1] + zone) return true; // en dehors des phrases : scroll normal
      if (busy) { if (d.event.cancelable) d.event.preventDefault(); return false; }
      var to = null, i;
      if (d.deltaY > 0) { for (i = 0; i < st.length; i++) if (st[i] > y + 4) { to = st[i]; break; } }
      else { for (i = st.length - 1; i >= 0; i--) if (st[i] < y - 4) { to = st[i]; break; } }
      if (to === null) return true; // après la dernière phrase (ou avant la première) : on continue normalement
      if (d.event.cancelable) d.event.preventDefault();
      busy = true;
      lenis.scrollTo(to, { duration: 1.1, easing: easeIO, lock: true, force: true, onComplete: function () { setTimeout(function () { busy = false; }, 220); } });
      return false;
    };
  })();

  /* ---------- Apparitions au scroll ---------- */
  gsap.set('[data-reveal]', { y: reduced ? 0 : 30 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }); }
  });

  /* ---------- Titres qui se révèlent ligne par ligne ; l'accueil attend la fin du chargement ---------- */
  function splitReveal() {
    if (!window.SplitText) { root.classList.remove('anim'); return; }
    var hero = document.querySelector('[data-hero-title]');
    SplitText.create(hero, {
      type: 'words,lines', mask: 'lines', autoSplit: true,
      onSplit: function (s) {
        gsap.set(hero, { visibility: 'visible' });
        var intro = gsap.timeline({ delay: 0.3, paused: true });
        intro.from(s.words, reduced ? { opacity: 0, duration: 0.8, stagger: 0.05 } : { yPercent: 115, rotate: 4, duration: 1.05, ease: 'power4.out', stagger: 0.07 })
             .fromTo('.hero__in', { opacity: 0, y: reduced ? 0 : 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' }, '-=0.6');
        (window.__loaderDone || Promise.resolve()).then(function () { intro.play(); });
        return intro;
      }
    });
    document.querySelectorAll('[data-split]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: function (s) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(s.lines, { yPercent: reduced ? 0 : 110, opacity: reduced ? 0 : 1, duration: 1.05, ease: 'power4.out', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
        }
      });
    });
    ScrollTrigger.refresh();
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(splitReveal);
})();
