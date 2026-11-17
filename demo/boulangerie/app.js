/* =========================================================
   Aube — site d'exemple Astelsia (formule Signature)
   • La nuit du boulanger : le ciel s'éclaire et l'horloge avance au scroll.
   • Petits secrets : la farine s'envole sous le doigt, la vapeur monte
     des produits qu'on touche, le soleil dit bonjour.
   • Commande en ligne (retrait en boutique) : panier, jour, heure.
     Site d'exemple : rien n'est envoyé nulle part.
   ========================================================= */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var soft = root.classList.contains('soft');
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var P = window.AUBE_PRODUCTS || [];
  var byId = {}; P.forEach(function (p) { byId[p.id] = p; });
  function euro(n) { return n.toFixed(2).replace('.', ',').replace(',00', '') + ' €'; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- 1. Heure de Paris et horaires ---------- */
  var DAY = [[420, 1170]], SUN = [[420, 780]];
  var HOURS = { 0: SUN, 1: [], 2: DAY, 3: DAY, 4: DAY, 5: DAY, 6: DAY };
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var DSHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  function hm(m) { var h = Math.floor(m / 60), mn = m % 60; return h + 'h' + (mn ? (mn < 10 ? '0' : '') + mn : ''); }
  function paris() {
    try {
      var o = {};
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute), date: new Date(+o.year, +o.month - 1, +o.day) };
    } catch (e) { var t = new Date(); return { day: t.getDay(), min: t.getHours() * 60 + t.getMinutes(), date: new Date(t.getFullYear(), t.getMonth(), t.getDate()) }; }
  }
  function status() {
    var n = paris(), slots = HOURS[n.day];
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      if (n.min >= s[0] && n.min < s[1]) return s[1] - n.min <= 30 ? { cls: 'is-soon', text: 'Ferme bientôt · à ' + hm(s[1]) } : { cls: 'is-open', text: 'Ouvert · jusqu’à ' + hm(s[1]) };
      if (n.min < s[0]) return { cls: 'is-closed', text: 'Fermé · ouvre à ' + hm(s[0]) };
    }
    for (var k = 1; k <= 7; k++) { var nd = (n.day + k) % 7; if (HOURS[nd].length) return { cls: 'is-closed', text: 'Fermé · ouvre ' + (k === 1 ? 'demain' : DAYS[nd]) + ' à ' + hm(HOURS[nd][0][0]) }; }
  }
  function paintStatus() {
    var st = status(), n = paris();
    $$('[data-status]').forEach(function (el) { el.classList.remove('is-open', 'is-closed', 'is-soon'); el.classList.add(st.cls); $('[data-status-text]', el).textContent = st.text; });
    $$('.hours li').forEach(function (li) { var day = +li.getAttribute('data-day'); li.classList.toggle('is-today', day === n.day); li.classList.toggle('is-closed', !HOURS[day].length); });
  }
  paintStatus(); setInterval(paintStatus, 30000);

  /* ---------- 2. En-tête, menu, scroll fluide ---------- */
  var top = $('.top'), home = d.body.classList.contains('page-home');
  function stuck() { top.classList.toggle('is-stuck', window.scrollY > (home ? innerHeight * 0.7 : 8)); }
  addEventListener('scroll', stuck, { passive: true }); stuck();
  var mb = $('.menu-btn');
  if (mb) mb.addEventListener('click', function () { var o = !root.classList.contains('is-menu'); root.classList.toggle('is-menu', o); mb.setAttribute('aria-expanded', String(o)); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-menu')) mb.click(); });
  if (fine && !soft && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    window.__lenis = lenis;
  }

  /* ---------- 3. Apparitions ---------- */
  $$('.hero__text > *').forEach(function (n, i) { n.style.setProperty('--i', i); });
  $$('[data-stagger]').forEach(function (g) { $$('[data-reveal]', g).forEach(function (n, i) { n.style.setProperty('--i', i); }); });
  var seen = $$('[data-reveal], .step, .map');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    seen.forEach(function (n) { io.observe(n); });
  } else seen.forEach(function (n) { n.classList.add('is-in'); });

  /* ---------- 4. Un petit mot, une seule fois ---------- */
  var said = {};
  function whisper(text, key, y) {
    if (said[key]) return; said[key] = true;
    var w = d.createElement('p'); w.className = 'whisper'; w.setAttribute('aria-hidden', 'true'); w.textContent = text;
    w.style.top = Math.round(clamp((y || innerHeight * 0.4) - 80, 90, innerHeight - 160)) + 'px';
    d.body.appendChild(w);
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('is-on'); }); });
    setTimeout(function () { w.classList.remove('is-on'); }, 2400); setTimeout(function () { w.remove(); }, 3600);
  }

  /* ---------- 5. La farine (accueil) : elle flotte, et s'envole sous le doigt ---------- */
  var cv = $('.flour');
  if (cv) (function () {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), dust = [], puffs = [], run = false, vis = true, last = 0;
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var n = W < 600 ? 46 : 90;
    for (var i = 0; i < n; i++) dust.push({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8, vx: 4 + Math.random() * 10, vy: -2 - Math.random() * 6, a: 0.15 + Math.random() * 0.45, p: Math.random() * 6.28 });
    function puff(x, y) {
      for (var k = 0; k < 70; k++) {
        var ang = Math.random() * 6.28, sp = soft ? 0 : 30 + Math.random() * 190;
        puffs.push({ x: x + (soft ? (Math.random() - 0.5) * 60 : 0), y: y + (soft ? (Math.random() - 0.5) * 40 : 0), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.6 - (soft ? 0 : 50), r: 0.8 + Math.random() * 2.6, life: 1, dec: 0.45 + Math.random() * 0.5 });
      }
      go();
    }
    function tick(t) {
      var dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fff6ea';
      dust.forEach(function (p) {
        if (!soft) { p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(t / 900 + p.p) * 0.15; if (p.x > W + 5) p.x = -5; if (p.y < -5) p.y = H + 5; }
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 700 + p.p)); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      });
      for (var i = puffs.length - 1; i >= 0; i--) {
        var q = puffs[i]; q.life -= q.dec * dt; if (q.life <= 0) { puffs.splice(i, 1); continue; }
        q.vx *= Math.pow(0.9, dt * 60); q.vy = q.vy * Math.pow(0.9, dt * 60) - 6 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
        ctx.globalAlpha = (soft ? Math.sin(q.life * Math.PI) : q.life) * 0.85; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1.6 - q.life * 0.6), 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (vis || puffs.length) requestAnimationFrame(tick); else run = false;
    }
    function go() { if (!run) { run = true; last = 0; requestAnimationFrame(tick); } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) go(); }).observe(cv);
    go();
    var hero = $('.hero');
    hero.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button')) return;
      var r = cv.getBoundingClientRect(); puff(e.clientX - r.left, e.clientY - r.top);
      whisper('Pfff… un nuage de farine ✦', 'flour', e.clientY);
    });
    if (fine && !soft) hero.addEventListener('pointermove', function (e) { // à la souris : la farine s'écarte du pointeur
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      dust.forEach(function (p) { var dx = p.x - x, dy = p.y - y, dd = dx * dx + dy * dy; if (dd < 6400) { p.x += dx / Math.sqrt(dd + 1) * 4; p.y += dy / Math.sqrt(dd + 1) * 4; } });
    });
  })();

  /* ---------- 6. La nuit du boulanger : le ciel, le soleil, l'horloge ---------- */
  var story = $('.story');
  if (story) (function () {
    var night = $('.sky-night', story), dawn = $('.sky-dawn', story), day = $('.sky-day', story), stars = $('.sky-stars', story), sun = $('.sun', story);
    var clock = $('.clock'), clockT = $('[data-clock]'), ticking = false, inView = false;
    function update() {
      ticking = false;
      var r = story.getBoundingClientRect(), total = r.height - innerHeight;
      var p = clamp(-r.top / total, 0, 1);
      night.style.opacity = 1 - smooth(0.3, 0.62, p);
      dawn.style.opacity = smooth(0.22, 0.52, p) * (1 - smooth(0.7, 0.92, p));
      day.style.opacity = smooth(0.7, 0.92, p);
      stars.style.opacity = 1 - smooth(0.12, 0.5, p);
      sun.style.transform = 'translateY(' + (-smooth(0.35, 1, p) * innerHeight * 0.72).toFixed(1) + 'px)';
      var m = Math.round(240 + p * 180), h = Math.floor(m / 60), mm = m % 60; // de 4h00 à 7h00
      if (clockT) clockT.textContent = (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
      if (clock) {
        clock.classList.toggle('is-on', inView && r.top < innerHeight * 0.3 && r.bottom > innerHeight * 0.5);
        clock.style.background = p > 0.8 ? 'rgba(42, 26, 16, .72)' : '';
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; onScroll(); }).observe(story); else inView = true;
    update();
    sun.addEventListener('click', function (e) {
      sun.classList.remove('is-poked'); void sun.offsetWidth; sun.classList.add('is-poked');
      whisper('Le soleil se lève, le pain aussi ✦', 'sun', e.clientY);
    });
  })();

  /* ---------- 7. Le panier (gardé pendant la visite) ---------- */
  var KEY = 'aube-panier', cart = {};
  try { cart = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { cart = {}; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function count() { var c = 0; Object.keys(cart).forEach(function (k) { c += cart[k]; }); return c; }
  function total() { var t = 0; Object.keys(cart).forEach(function (k) { if (byId[k]) t += cart[k] * byId[k].price; }); return t; }
  function badge(bump) {
    $$('.cart-btn').forEach(function (b) {
      var s = $('[data-count]', b); s.setAttribute('data-count', count()); s.textContent = count();
      if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); setTimeout(function () { b.classList.remove('bump'); }, 450); }
    });
  }
  badge(false);
  setTimeout(function () { refreshOrder(); }, 0);
  function setQty(id, q) { if (q <= 0) delete cart[id]; else cart[id] = Math.min(30, q); save(); badge(true); refreshOrder(); }

  // les boutons « + » des produits ; toucher la photo fait monter la vapeur (petit secret)
  $$('.product').forEach(function (card) {
    var id = card.getAttribute('data-id'), add = $('.add', card), fig = $('figure', card);
    if (add) add.addEventListener('click', function () {
      setQty(id, (cart[id] || 0) + 1);
      add.classList.add('is-done'); add.textContent = '✓';
      setTimeout(function () { add.classList.remove('is-done'); add.textContent = '+'; }, 1100);
      toast('<b>' + byId[id].name + '</b> ajouté à votre commande.');
    });
    if (fig) fig.addEventListener('click', function (e) {
      var s = $('.steam', fig);
      if (!s) { s = d.createElement('span'); s.className = 'steam'; s.innerHTML = '<i></i><i></i><i></i>'; fig.appendChild(s); }
      s.classList.remove('is-on'); void s.offsetWidth; s.classList.add('is-on');
      whisper('Tout chaud, tout juste sorti du four ✦', 'steam', e.clientY);
    });
  });

  /* ---------- 8. La commande : produits, jour, heure, prénom ---------- */
  var order = $('.order'), chosen = { day: null, slot: null };
  function openDays() { // les 6 prochains jours d'ouverture
    var n = paris(), out = [];
    for (var k = 0; out.length < 6 && k < 14; k++) {
      var dt = new Date(n.date.getFullYear(), n.date.getMonth(), n.date.getDate() + k), wd = dt.getDay(), h = HOURS[wd];
      if (!h.length) continue;
      if (k === 0 && n.min > h[h.length - 1][1] - 90) continue; // trop tard pour aujourd'hui
      out.push({ date: dt, wd: wd, today: k === 0, k: k });
    }
    return out;
  }
  function refreshOrder() {
    var c = count(), t = total(), bar = $('.basket');
    $$('[data-total]').forEach(function (n) { n.textContent = euro(t); });
    $$('[data-items]').forEach(function (n) { n.textContent = c ? c + ' article' + (c > 1 ? 's' : '') : 'Votre panier est vide'; });
    if (bar && !order) bar.classList.toggle('is-empty', !c); // page Produits : la barre apparaît dès le premier article
    if (!order) return;
    $$('.line', order).forEach(function (l) { var id = l.getAttribute('data-id'); $('output', l).textContent = cart[id] || 0; });
    $('[data-confirm]').setAttribute('aria-disabled', String(!(c && chosen.day && chosen.slot)));
  }
  if (order) (function () {
    var lines = $('.lines', order);
    lines.innerHTML = P.map(function (p) {
      return '<div class="line" data-id="' + p.id + '">' + (p.img ? '<img src="img/' + p.img + '.webp" alt="" loading="lazy" width="56" height="56">' : '<img src="img/pains.webp" alt="" loading="lazy" width="56" height="56">') +
        '<div><h3>' + p.name + '</h3><small>' + euro(p.price) + (p.unit ? ' · ' + p.unit : '') + '</small></div>' +
        '<div class="stepper"><button type="button" aria-label="Retirer un ' + p.name + '" data-minus>−</button><output aria-live="polite">0</output><button type="button" aria-label="Ajouter un ' + p.name + '" data-plus>+</button></div></div>';
    }).join('');
    lines.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var id = b.closest('.line').getAttribute('data-id');
      setQty(id, (cart[id] || 0) + (b.hasAttribute('data-plus') ? 1 : -1));
    });
    var daysBox = $('.days', order), slotsBox = $('.slots', order), days = openDays();
    daysBox.innerHTML = days.map(function (x, i) {
      return '<button type="button" aria-pressed="false" data-i="' + i + '">' + (x.today ? 'Aujourd’hui' : x.k === 1 ? 'Demain' : DSHORT[x.wd]) + '<b>' + x.date.getDate() + '</b></button>';
    }).join('');
    function slotsFor(x) {
      var h = HOURS[x.wd], n = paris(), out = [];
      h.forEach(function (s) { for (var m = s[0] + 30; m <= s[1] - 30; m += 30) out.push(m); });
      return out.map(function (m) { return { m: m, past: x.today && m < n.min + 60 }; });
    }
    function pickDay(i) {
      chosen.day = days[i]; chosen.slot = null;
      $$('button', daysBox).forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
      var s = slotsFor(days[i]);
      slotsBox.innerHTML = s.map(function (x) { return '<button type="button" aria-pressed="false" data-m="' + x.m + '"' + (x.past ? ' disabled' : '') + '>' + hm(x.m).replace('h', ':').replace(/:$/, ':00') + '</button>'; }).join('') + '<p>Retrait en boutique, sans attente. Paiement sur place.</p>';
      refreshOrder();
    }
    daysBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pickDay(+b.getAttribute('data-i')); });
    slotsBox.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      chosen.slot = +b.getAttribute('data-m');
      $$('button', slotsBox).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      refreshOrder();
    });
    pickDay(days[0] && days[0].today && slotsFor(days[0]).every(function (x) { return x.past; }) ? 1 : 0);
    refreshOrder();

    var done = $('.done');
    $('[data-confirm]').addEventListener('click', function (e) {
      e.preventDefault();
      var name = $('#prenom').value.trim();
      if (!count()) { toast('Ajoutez au moins un produit à votre commande.'); $('.lines').scrollIntoView({ behavior: soft ? 'auto' : 'smooth', block: 'center' }); return; }
      if (!chosen.slot) { toast('Choisissez l’heure à laquelle vous passez.'); slotsBox.scrollIntoView({ behavior: soft ? 'auto' : 'smooth', block: 'center' }); return; }
      if (!name) { toast('Indiquez votre prénom pour qu’on prépare votre commande.'); $('#prenom').focus(); return; }
      var x = chosen.day, when = (x.today ? 'aujourd’hui' : x.k === 1 ? 'demain' : DAYS[x.wd] + ' ' + x.date.getDate()) + ' à ' + hm(chosen.slot);
      $('[data-done-title]', done).innerHTML = 'C’est noté, <em>' + name.replace(/[<>&"]/g, '') + '</em>&nbsp;!';
      $('[data-done-when]', done).textContent = 'Votre commande vous attend ' + when + '.';
      $('[data-done-list]', done).innerHTML = Object.keys(cart).map(function (k) { return '<li><span>' + cart[k] + ' × ' + byId[k].name + '</span><b>' + euro(cart[k] * byId[k].price) + '</b></li>'; }).join('') + '<li><span><b>Total, à régler sur place</b></span><b>' + euro(total()) + '</b></li>';
      done.classList.add('is-open'); done.setAttribute('aria-hidden', 'false');
      cart = {}; save(); badge(false);
    });
    $('[data-done-close]', done).addEventListener('click', function () { done.classList.remove('is-open'); done.setAttribute('aria-hidden', 'true'); refreshOrder(); });
  })();

  /* ---------- 9. Les photos : visionneuse ---------- */
  var strip = $('.strip');
  if (strip) (function () {
    var items = $$('button', strip), lb = $('.lightbox'), img = $('img', lb), cap = $('figcaption', lb), cur = 0;
    function show(i) { cur = (i + items.length) % items.length; var s = $('img', items[cur]); img.style.opacity = 0; setTimeout(function () { img.src = s.currentSrc || s.src; img.alt = s.alt; cap.textContent = s.alt; img.style.opacity = 1; }, soft ? 0 : 120); }
    items.forEach(function (b, i) { b.addEventListener('click', function () { show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); }); });
    function close() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); }
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
  })();

  /* ---------- 10. Le catalogue : la catégorie suit la lecture ---------- */
  var chips = $$('.chips .chip');
  if (chips.length && 'IntersectionObserver' in window) {
    var secs = chips.map(function (c) { return $(c.getAttribute('href')); });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; var i = secs.indexOf(e.target); chips.forEach(function (c, j) { c.classList.toggle('is-on', i === j); }); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    secs.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- 11. Boutons de démonstration et petits messages ---------- */
  var tEl = $('.toast'), tt = 0;
  function toast(html) { tEl.innerHTML = html; tEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { tEl.classList.remove('is-on'); }, 3000); }
  var MSG = { call: '<b>Site d’exemple</b> : sur un vrai site, ce bouton appelle la boulangerie.', route: '<b>Site d’exemple</b> : sur un vrai site, ce bouton ouvre l’itinéraire dans votre GPS.' };
  d.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-demo]'); if (!a) return; e.preventDefault(); toast(MSG[a.getAttribute('data-demo')] || ''); });
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
