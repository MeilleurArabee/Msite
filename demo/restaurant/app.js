/* =========================================================
   L'Ardoise — site d'exemple Astelsia (formule Business)
   Fait maison, sans bibliothèque : menu, apparitions, plat du jour
   et horaires en direct, carte qui suit le scroll, galerie photo.
   ========================================================= */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var soft = root.classList.contains('soft');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- 1. Heure de Paris, horaires, plat du jour ---------- */
  var MIDI = [720, 840], SOIR = [1140, 1320], SOIR_TARD = [1140, 1380];
  var HOURS = { 0: [], 1: [], 2: [MIDI, SOIR], 3: [MIDI, SOIR], 4: [MIDI, SOIR], 5: [MIDI, SOIR_TARD], 6: [MIDI, SOIR_TARD] };
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var DISHES = {
    2: ['Bœuf bourguignon', 'purée maison', '14,50 €'],
    3: ['Poulet rôti, jus corsé', 'frites maison', '14 €'],
    4: ['Lasagnes de la maison', 'salade de saison', '13,50 €'],
    5: ['Filet de lieu, beurre blanc', 'légumes du marché', '15,50 €'],
    6: ['Moules marinières', 'et leurs frites', '15 €']
  };
  function hm(m) { var h = Math.floor(m / 60), mn = m % 60; return h + 'h' + (mn ? (mn < 10 ? '0' : '') + mn : ''); }
  function now() {
    try {
      var o = {};
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var t = new Date(); return { day: t.getDay(), min: t.getHours() * 60 + t.getMinutes() }; }
  }
  function status() {
    var n = now(), slots = HOURS[n.day] || [];
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      if (n.min >= s[0] && n.min < s[1]) {
        var left = s[1] - n.min;
        return left <= 30 ? { cls: 'is-soon', text: 'Le service se termine · ' + hm(s[1]) } : { cls: 'is-open', text: 'Ouvert maintenant · jusqu’à ' + hm(s[1]) };
      }
      if (n.min < s[0]) return { cls: 'is-closed', text: 'Fermé · ' + (i ? 'service du soir à ' : 'ouvre à ') + hm(s[0]) };
    }
    for (var k = 1; k <= 7; k++) {
      var nd = (n.day + k) % 7;
      if (HOURS[nd].length) return { cls: 'is-closed', text: 'Fermé · ouvre ' + (k === 1 ? 'demain' : DAYS[nd]) + ' à ' + hm(HOURS[nd][0][0]) };
    }
  }
  function paint() {
    var st = status(), n = now();
    $$('[data-status]').forEach(function (el) {
      el.classList.remove('is-open', 'is-closed', 'is-soon'); el.classList.add(st.cls);
      $('[data-status-text]', el).textContent = st.text;
    });
    $$('.hours li').forEach(function (li) {
      var day = +li.getAttribute('data-day');
      li.classList.toggle('is-today', day === n.day);
      li.classList.toggle('is-closed', !HOURS[day].length);
    });
    // l'ardoise du jour (si on est fermé : celle du prochain jour d'ouverture)
    var box = $('[data-today]');
    if (box) {
      var day = n.day, label = 'Aujourd’hui à l’ardoise';
      if (!DISHES[day]) { for (var k = 1; k < 7; k++) { var nd = (n.day + k) % 7; if (DISHES[nd]) { day = nd; label = (k === 1 ? 'Demain' : DAYS[nd].charAt(0).toUpperCase() + DAYS[nd].slice(1)) + ' à l’ardoise'; break; } } }
      $('[data-today-label]', box).textContent = label;
      $('[data-today-dish]', box).textContent = DISHES[day][0];
      $('[data-today-side]', box).textContent = DISHES[day][1];
      $('[data-today-price]', box).textContent = DISHES[day][2];
    }
  }
  paint();
  setInterval(paint, 30000);

  /* ---------- 2. En-tête et menu ---------- */
  var top = $('.top');
  function onScroll() { top.classList.toggle('is-stuck', window.scrollY > (d.body.classList.contains('page-home') ? innerHeight * 0.6 : 8)); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var mb = $('.menu-btn');
  if (mb) mb.addEventListener('click', function () {
    var open = !root.classList.contains('is-menu');
    root.classList.toggle('is-menu', open);
    mb.setAttribute('aria-expanded', String(open));
    mb.querySelector('span').textContent = open ? 'Fermer' : 'Menu';
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-menu')) mb.click(); });

  /* ---------- 3. Apparitions au fil du scroll ---------- */
  $$('.hero__text > *').forEach(function (n, i) { n.style.setProperty('--i', i); });
  $$('[data-stagger]').forEach(function (g) { $$('[data-reveal]', g).forEach(function (n, i) { n.style.setProperty('--i', i); }); });
  var seen = $$('[data-reveal], .map, .writes');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    seen.forEach(function (n) { io.observe(n); });
  } else seen.forEach(function (n) { n.classList.add('is-in'); });

  /* ---------- 4. Petite photo du haut : elle glisse un peu plus lentement que la page ---------- */
  var heroImg = $('.hero__img');
  if (heroImg && !soft) {
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; var y = Math.min(window.scrollY, innerHeight); heroImg.style.transform = 'translateY(' + (y * 0.28).toFixed(1) + 'px)'; });
    }, { passive: true });
  }

  /* ---------- 5. La carte : la catégorie suit la lecture ---------- */
  var chips = $$('.chips .chip');
  if (chips.length && 'IntersectionObserver' in window) {
    var secs = chips.map(function (c) { return $(c.getAttribute('href')); });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = secs.indexOf(e.target);
        chips.forEach(function (c, j) { c.classList.toggle('is-on', i === j); });
        var c = chips[i], bar = c.parentNode;
        bar.scrollTo({ left: c.offsetLeft - 16, behavior: soft ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    secs.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- 6. Les photos : filtres et visionneuse ---------- */
  var gallery = $('.gallery');
  if (gallery) {
    var items = $$('button', gallery), lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb), cur = 0;
    $$('.filters button').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter');
        $$('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        items.forEach(function (it) { it.classList.toggle('is-hidden', f !== 'tout' && it.getAttribute('data-cat') !== f); });
      });
    });
    function visible() { return items.filter(function (it) { return !it.classList.contains('is-hidden'); }); }
    function show(i) {
      var v = visible(); if (!v.length) return;
      cur = (i + v.length) % v.length;
      var it = v[cur], img = $('img', it);
      lbImg.style.opacity = 0;
      setTimeout(function () { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt; lbImg.style.opacity = 1; }, soft ? 0 : 120);
    }
    items.forEach(function (it) {
      it.addEventListener('click', function () { show(visible().indexOf(it)); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); $('.lb-close', lb).focus({ preventScroll: true }); });
    });
    function close() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); }
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1);
    });
    var sx = 0; // glisser du doigt pour changer de photo
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
  }

  /* ---------- 7. Boutons de démonstration (le commerce est fictif) ---------- */
  var toast = $('.toast'), tt = 0;
  var MSG = {
    call: '<b>Site d’exemple</b> : sur un vrai site, ce bouton appelle directement le restaurant.',
    route: '<b>Site d’exemple</b> : sur un vrai site, ce bouton ouvre l’itinéraire dans votre GPS.'
  };
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-demo]');
    if (!a) return;
    e.preventDefault();
    toast.innerHTML = MSG[a.getAttribute('data-demo')] || '';
    toast.classList.add('is-on');
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-on'); }, 3400);
  });

  /* ---------- 8. Barre d'action (téléphone) ---------- */
  var dock = $('.dock'), foot = $('.foot'), first = $('.hero__btns') || $('.head');
  if (dock && first && 'IntersectionObserver' in window) {
    var vis = { a: true, b: false };
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target === foot ? 'b' : 'a'] = e.isIntersecting; });
      dock.classList.toggle('is-on', !vis.a && !vis.b && !root.classList.contains('is-menu'));
    });
    dio.observe(first); if (foot) dio.observe(foot);
  }

  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
