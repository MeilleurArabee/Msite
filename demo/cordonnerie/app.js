/* =========================================================
   Talon & Clé — site d'exemple Astelsia (formule Solo)
   Fait maison, sans bibliothèque : horaires en direct, apparitions,
   coutures qui se cousent, tarifs à onglets, étiquette qui se balance.
   ========================================================= */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var soft = root.classList.contains('soft');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- 1. Horaires et « ouvert maintenant » (heure de Paris) ---------- */
  // créneaux en minutes depuis minuit ; 0 = dimanche
  var WEEK = [[540, 750], [840, 1140]];
  var HOURS = { 0: [], 1: [], 2: WEEK, 3: WEEK, 4: WEEK, 5: WEEK, 6: [[540, 1080]] };
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function hm(m) { var h = Math.floor(m / 60), mn = m % 60; return h + 'h' + (mn ? (mn < 10 ? '0' : '') + mn : ''); }
  function parisNow() {
    try {
      var o = {};
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) {
      var t = new Date(); return { day: t.getDay(), min: t.getHours() * 60 + t.getMinutes() };
    }
  }
  function currentStatus() {
    var n = parisNow(), slots = HOURS[n.day] || [];
    for (var i = 0; i < slots.length; i++) {
      var s = slots[i];
      if (n.min >= s[0] && n.min < s[1]) {
        var left = s[1] - n.min;
        return left <= 30
          ? { cls: 'is-soon', text: 'Ferme bientôt · à ' + hm(s[1]) }
          : { cls: 'is-open', text: 'Ouvert maintenant · jusqu’à ' + hm(s[1]) };
      }
      if (n.min < s[0]) return { cls: 'is-closed', text: 'Fermé · ' + (i ? 'r' : '') + 'ouvre à ' + hm(s[0]), day: n.day };
    }
    for (var k = 1; k <= 7; k++) {
      var nd = (n.day + k) % 7;
      if (HOURS[nd].length) return { cls: 'is-closed', text: 'Fermé · ouvre ' + (k === 1 ? 'demain' : DAYS[nd]) + ' à ' + hm(HOURS[nd][0][0]), day: n.day };
    }
  }
  function paintHours() {
    var st = currentStatus(), today = parisNow().day;
    $$('[data-status]').forEach(function (el) {
      el.classList.remove('is-open', 'is-closed', 'is-soon');
      el.classList.add(st.cls);
      $('[data-status-text]', el).textContent = st.text;
    });
    $$('.hours li').forEach(function (li) {
      var day = +li.getAttribute('data-day');
      li.classList.toggle('is-today', day === today);
      li.classList.toggle('is-closed', !HOURS[day].length);
    });
  }
  paintHours();
  setInterval(paintHours, 30000);

  /* ---------- 2. Coutures : le fil se coud tout seul ---------- */
  // Un long pointillé (les points) suivi d'un grand vide, que l'on fait glisser :
  // aucun masque, donc très peu de calcul pour le téléphone.
  function Seam(paths, dash, gap, dur) {
    this.paths = paths; this.dash = dash; this.gap = gap; this.dur = dur; this.done = soft;
  }
  Seam.prototype.layout = function () {
    var L = this.paths[0].getTotalLength(), self = this;
    if (!L) return;
    var unit = this.dash + this.gap, n = Math.ceil(L / unit) + 1, arr = [];
    for (var i = 0; i < n; i++) arr.push(this.dash, this.gap);
    arr.push(0, Math.ceil(L + unit));
    this.paths.forEach(function (p) {
      p.style.transition = 'none';
      p.style.strokeDasharray = self.done ? self.dash + ' ' + self.gap : arr.join(' ');
      p.style.strokeDashoffset = self.done ? 0 : n * unit;
    });
  };
  Seam.prototype.run = function (delay) {
    if (this.done) return;
    this.done = true;
    var self = this;
    this.paths.forEach(function (p) {
      p.getBoundingClientRect(); // fixe l'état de départ avant de lancer
      p.style.transition = 'stroke-dashoffset ' + self.dur + 's cubic-bezier(.45,.05,.25,1) ' + (delay || 0) + 's';
      p.style.strokeDashoffset = 0;
    });
  };

  // la couture de l'étiquette, à l'arrivée
  var fobSeam = $$('.fob__seam .seam');
  if (fobSeam.length) {
    var tagSeam = new Seam(fobSeam, 7, 6, 2.4);
    tagSeam.layout();
    setTimeout(function () { tagSeam.run(0); }, 550);
  }

  // la couture des cartes, quand elles apparaissent
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var n = d.createElementNS(NS, tag);
    for (var a in attrs) n.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function roundRect(x, y, w, h, r) { // r = [haut-gauche, haut-droit, bas-droit, bas-gauche]
    return 'M' + (x + r[0]) + ' ' + y + 'H' + (x + w - r[1]) + (r[1] ? 'A' + r[1] + ' ' + r[1] + ' 0 0 1 ' + (x + w) + ' ' + (y + r[1]) : '') +
      'V' + (y + h - r[2]) + (r[2] ? 'A' + r[2] + ' ' + r[2] + ' 0 0 1 ' + (x + w - r[2]) + ' ' + (y + h) : '') +
      'H' + (x + r[3]) + (r[3] ? 'A' + r[3] + ' ' + r[3] + ' 0 0 1 ' + x + ' ' + (y + h - r[3]) : '') +
      'V' + (y + r[0]) + (r[0] ? 'A' + r[0] + ' ' + r[0] + ' 0 0 1 ' + (x + r[0]) + ' ' + y : '') + 'Z';
  }
  function stitch(host) {
    var inset = host.classList.contains('prices') || host.classList.contains('foot__shop') ? 10 : 8;
    var svg = el('svg', { 'class': 'stitch', 'aria-hidden': 'true' });
    var hole = el('path', { 'class': 'hole', transform: 'translate(0 1)' }, svg);
    var thread = el('path', { 'class': 'thread' }, svg);
    var seam = host.__seam = new Seam([hole, thread], 6, 5, 1.6);
    host.appendChild(svg);
    var lastW = 0, lastH = 0;
    function draw() {
      var w = host.offsetWidth, h = host.offsetHeight, cs = getComputedStyle(host);
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      var r = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']
        .map(function (k) { return Math.max(0, Math.min(parseFloat(cs[k]) || 0, h / 2, w / 2) - inset); });
      var p = roundRect(inset, inset, w - inset * 2, h - inset * 2, r);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      hole.setAttribute('d', p); thread.setAttribute('d', p);
      seam.layout();
    }
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(host);
    else window.addEventListener('resize', draw);
  }
  $$('[data-stitch]').forEach(stitch);

  /* ---------- 3. Apparitions au fil du scroll ---------- */
  $$('.services .service').forEach(function (n, i) { n.style.setProperty('--i', i); });
  var watched = $$('[data-reveal], [data-stitch]');
  var show = function (n) {
    n.classList.add('is-in');
    if (n.__seam) n.__seam.run(0.2 + (parseFloat(n.style.getPropertyValue('--i')) || 0) * 0.09);
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    watched.forEach(function (n) { io.observe(n); });
  } else {
    watched.forEach(show);
  }

  /* ---------- 4. Tarifs à onglets ---------- */
  var sw = $('.switch'), tabs = $$('.switch__btn'), lists = $$('.price-list');
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      if (t.classList.contains('is-on')) return;
      sw.setAttribute('data-on', i);
      tabs.forEach(function (o, j) { o.classList.toggle('is-on', i === j); o.setAttribute('aria-selected', i === j); });
      lists.forEach(function (l, j) {
        l.hidden = i !== j;
        l.classList.remove('is-anim');
        if (i === j) {
          $$('li', l).forEach(function (li, k) { li.style.setProperty('--i', k); });
          void l.offsetWidth; // relance l'animation
          l.classList.add('is-anim');
        }
      });
    });
  });

  /* ---------- 5. L'étiquette qui se balance ---------- */
  var fob = $('[data-fob]'), key = $('.fob__key'), hero = $('.hero');
  if (fob && !soft) {
    var th = 11, om = 0, ph = 0, phv = 0, last = 0, raf = 0, lastY = window.scrollY;
    var K = 21, C = 1.5, K2 = 34, C2 = 2.6;
    var step = function (t) {
      var dt = Math.min(0.1, last ? (t - last) / 1000 : 0.016); last = t;
      // petits pas de calcul : le mouvement reste juste même si l'écran rame
      for (var n = Math.ceil(dt / 0.008), h = dt / n; n > 0; n--) {
        var acc = -K * th - C * om;
        om += acc * h; th += om * h;
        var acc2 = -K2 * ph - C2 * phv - 0.55 * acc; // la clé suit avec un temps de retard
        phv += acc2 * h; ph += phv * h;
        ph = Math.max(-24, Math.min(24, ph));
      }
      fob.style.transform = 'rotate(' + th.toFixed(3) + 'deg)';
      if (key) key.style.transform = 'rotate(' + ph.toFixed(3) + 'deg)';
      if (Math.abs(th) + Math.abs(om) + Math.abs(ph) + Math.abs(phv) < 0.03) {
        th = om = ph = phv = 0; raf = 0; last = 0;
        fob.style.transform = ''; if (key) key.style.transform = '';
        return;
      }
      raf = requestAnimationFrame(step);
    };
    var kick = function (v) {
      om = Math.max(-90, Math.min(90, om + v));
      if (!raf) { last = 0; raf = requestAnimationFrame(step); }
    };
    // lâchée au chargement, en même temps qu'elle arrive
    setTimeout(function () { raf = requestAnimationFrame(step); }, 150);

    // le scroll la fait bouger (seulement quand elle est visible)
    window.addEventListener('scroll', function () {
      var y = window.scrollY, dy = y - lastY; lastY = y;
      if (y < hero.offsetHeight) kick(Math.max(-14, Math.min(14, dy * 0.35)));
    }, { passive: true });
    // on la touche : elle part dans l'autre sens
    fob.addEventListener('pointerdown', function (e) {
      var r = fob.getBoundingClientRect();
      kick(e.clientX < r.left + r.width / 2 ? 55 : -55);
    });
    // à la souris, elle suit le mouvement
    fob.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' && e.movementX) kick(Math.max(-6, Math.min(6, e.movementX * 0.5)));
    });
  }

  /* ---------- 6. Boutons de démonstration ---------- */
  var toast = $('.toast'), toastTimer = 0;
  var MSG = {
    call: '<b>Site d’exemple</b> : sur un vrai site, ce bouton appelle directement le commerce.',
    route: '<b>Site d’exemple</b> : sur un vrai site, ce bouton ouvre l’itinéraire dans votre GPS.'
  };
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-demo]');
    if (!a) return;
    e.preventDefault();
    toast.innerHTML = MSG[a.getAttribute('data-demo')] || '';
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 3400);
  });

  /* ---------- 7. Barre d'action (téléphone) et en-tête ---------- */
  var dock = $('.dock'), heroActions = $('.hero .actions'), foot = $('.foot'), top = $('.top');
  if ('IntersectionObserver' in window && dock) {
    var seen = { hero: true, foot: false };
    var dockIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target === foot ? 'foot' : 'hero'] = e.isIntersecting; });
      dock.classList.toggle('is-on', !seen.hero && !seen.foot);
    });
    dockIO.observe(heroActions); dockIO.observe(foot);
  }
  var onScroll = function () { top.classList.toggle('is-stuck', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- 8. Année ---------- */
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
