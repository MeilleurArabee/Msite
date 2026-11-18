/* =========================================================
   La Tonnelle — site d'exemple Astelsia (formule Signature)
   • « Ouvert ce soir » en direct, heure de Paris.
   • Petit secret : de petites lumières flottent sur la terrasse ; on les touche, elles s'illuminent.
   • Les phrases s'allument mot à mot quand on fait défiler.
   • Réservation en ligne : soir, heure, couverts, nom (site d'exemple : rien n'est envoyé).
   ========================================================= */
(function () {
  'use strict';
  var d = document, root = d.documentElement, soft = root.classList.contains('soft');
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- l'heure de Paris et les horaires ---------- */
  var OPEN = { 2: [1140, 1380], 3: [1140, 1380], 4: [1140, 1380], 5: [1140, 1410], 6: [1140, 1410] }; // en minutes
  var NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function paris() {
    try {
      var p = {}; new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: 'numeric', day: 'numeric' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var dt = new Date(+p.year, +p.month - 1, +p.day);
      return { day: dt.getDay(), min: (+p.hour % 24) * 60 + +p.minute, date: dt };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes(), date: n }; }
  }
  function hm(m) { var h = Math.floor(m / 60) % 24, mn = m % 60; return h + 'h' + (mn ? (mn < 10 ? '0' : '') + mn : ''); }
  function status() {
    var n = paris(), o = OPEN[n.day], txt, on = false;
    if (o && n.min >= o[0] && n.min < o[1]) { on = true; txt = 'Ouvert maintenant · jusqu’à ' + hm(o[1]); }
    else if (o && n.min < o[0]) txt = 'Ouvert ce soir dès ' + hm(o[0]);
    else { for (var k = 1; k < 8; k++) { var dd = (n.day + k) % 7; if (OPEN[dd]) { txt = 'Fermé · ouvre ' + (k === 1 ? 'demain' : NAMES[dd]) + ' à ' + hm(OPEN[dd][0]); break; } } }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('is-open', on); $('[data-status-text]', el).textContent = txt; });
    $$('[data-hours] li').forEach(function (li) { li.classList.toggle('is-today', +li.getAttribute('data-day') === n.day); });
  }
  status(); setInterval(status, 30000);

  /* ---------- petits messages ---------- */
  var toastEl = $('.toast'), tt = 0;
  function toast(html) { toastEl.innerHTML = html; toastEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3400); }
  var said = {};
  function whisper(text, key) {
    if (said[key]) return; said[key] = true;
    $$('.whisper').forEach(function (o) { o.remove(); });
    var w = d.createElement('p'); w.className = 'whisper'; w.setAttribute('aria-hidden', 'true'); w.textContent = text; d.body.appendChild(w);
    requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.add('is-on'); }); });
    setTimeout(function () { w.classList.remove('is-on'); }, 2600); setTimeout(function () { w.remove(); }, 3600);
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-demo]'); if (!a) return;
    e.preventDefault();
    toast(a.getAttribute('data-demo') === 'call' ? '<b>Site d’exemple</b> : sur un vrai site, ce bouton appelle le restaurant.' : '<b>Site d’exemple</b> : sur un vrai site, ce bouton ouvre l’itinéraire dans votre GPS.');
  });

  /* ---------- le décor : la photo s'approche, le voile fonce un peu en descendant ---------- */
  var scene = $('.scene'), tick = false;
  function onScroll() {
    tick = false;
    var p = Math.min(1, scrollY / Math.max(1, d.body.scrollHeight - innerHeight));
    scene.style.setProperty('--zoom', (soft ? 1.04 : 1.12 - p * 0.08).toFixed(3));
    scene.style.setProperty('--veil', (0.7 + p * 0.3).toFixed(3));
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- les petites lumières de la terrasse ---------- */
  var cv = $('.lights'), ctx = cv.getContext('2d'), W, H, dpr = Math.min(devicePixelRatio || 1, 1.5), list = [], sparks = [], taps = 0, last = 0;
  function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function make(y) {
    var small = W < 700, side = Math.random() < 0.5, lane = small ? 0.16 : 0.22;
    var x = Math.random() * lane * W + 6; if (!side) x = W - x;
    return { x: x, y: y == null ? Math.random() * H : y, r: (small ? 3 : 4) + Math.random() * (small ? 4 : 6), v: 6 + Math.random() * 10, ph: Math.random() * 6.28, glow: 0 };
  }
  function seed() { list = []; var n = W < 700 ? 10 : 18; for (var i = 0; i < n; i++) list.push(make()); }
  function draw(t) {
    var dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
    ctx.clearRect(0, 0, W, H);
    list.forEach(function (l, k) {
      if (!soft) { l.y -= l.v * dt; l.x += Math.sin(t / 1800 + l.ph) * 5 * dt; }
      if (l.y < -30) { list[k] = make(H + 30); return; }
      l.glow = Math.max(0, l.glow - dt * 0.5);
      var a = 0.35 + 0.25 * Math.sin(t / 900 + l.ph) + l.glow * 0.6, r = l.r * (1 + l.glow * 1.4);
      var g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, r * 5);
      g.addColorStop(0, 'rgba(255,240,200,' + Math.min(1, a + 0.3) + ')'); g.addColorStop(0.25, 'rgba(255,200,130,' + a * 0.55 + ')'); g.addColorStop(1, 'rgba(255,170,110,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(l.x, l.y, r * 5, 0, 7); ctx.fill();
    });
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i]; s.life -= dt * 1.4; if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 30 * dt;
      ctx.globalAlpha = s.life; ctx.fillStyle = '#ffe6b0'; ctx.beginPath(); ctx.arc(s.x, s.y, 1.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    }
    requestAnimationFrame(draw);
  }
  function hit(x, y) { for (var i = 0; i < list.length; i++) { var l = list[i]; if (Math.hypot(l.x - x, l.y - y) < l.r * 4 + 10) return l; } return null; }
  function blocked(el) { return !!(el && el.closest && el.closest('a, button, input, .card, .nav, .quick, .demo-bar')); }
  d.addEventListener('pointerdown', function (e) {
    if (blocked(e.target)) return;
    var l = hit(e.clientX, e.clientY); if (!l) return;
    l.glow = 1; taps++;
    if (!soft) for (var k = 0; k < 12; k++) { var a = Math.random() * 6.28, sp = 40 + Math.random() * 90; sparks.push({ x: l.x, y: l.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: 1 }); }
    whisper('Une lumière de plus sur la terrasse ✦', 'one');
    if (taps === 5) { list.forEach(function (o) { o.glow = 1; }); setTimeout(function () { whisper('Toute la terrasse s’illumine… bonne soirée ✦', 'five'); }, 300); }
    hint.classList.remove('is-on');
  }, { passive: true });
  if (fine) d.addEventListener('pointermove', function (e) { root.classList.toggle('on-light', !blocked(e.target) && !!hit(e.clientX, e.clientY)); }, { passive: true });
  size(); seed(); requestAnimationFrame(draw);
  addEventListener('resize', function () { var w = W; size(); if (Math.abs(W - w) > 120) seed(); });
  var hint = $('.hero__hint');
  setTimeout(function () { if (!taps && scrollY < 80) { hint.classList.add('is-on'); setTimeout(function () { hint.classList.remove('is-on'); }, 5000); } }, 3500);

  /* ---------- les phrases s'allument mot à mot ---------- */
  var lines = $$('[data-words]');
  lines.forEach(function (p) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(d.createTextNode(w)); return; } var s = d.createElement('span'); s.className = 'w'; s.textContent = w; f.appendChild(s); });
          node.replaceChild(f, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(p);
  });
  function light() {
    lines.forEach(function (p) {
      var ws = $$('.w', p), r = p.getBoundingClientRect();
      var k = Math.max(0, Math.min(1, (innerHeight * 0.9 - r.top) / (innerHeight * 0.45)));
      ws.forEach(function (w, i) { w.classList.toggle('is-lit', i < Math.round(k * ws.length)); });
    });
  }
  addEventListener('scroll', light, { passive: true }); light();

  /* ---------- la réservation ---------- */
  var covers = 2;
  function setCovers(n) { covers = Math.max(1, Math.min(12, n)); $$('[data-covers]').forEach(function (o) { o.textContent = covers; }); }
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { setCovers(covers + +b.getAttribute('data-step')); }); });
  var daysBox = $('[data-days]'), slotsBox = $('[data-slots]'), pick = { day: null, slot: null };
  var SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], days = [], n0 = paris();
  for (var k = 0; days.length < 4 && k < 14; k++) {
    var dt = new Date(n0.date.getFullYear(), n0.date.getMonth(), n0.date.getDate() + k), wd = dt.getDay();
    if (!OPEN[wd] || (k === 0 && n0.min > OPEN[wd][1] - 90)) continue;
    days.push({ date: dt, wd: wd, k: k });
  }
  daysBox.innerHTML = days.map(function (x, i) { return '<button type="button" aria-pressed="false" data-i="' + i + '">' + (x.k === 0 ? 'Ce soir' : x.k === 1 ? 'Demain' : SHORT[x.wd]) + '<b>' + x.date.getDate() + '</b></button>'; }).join('');
  function pickDay(i) {
    pick.day = days[i]; pick.slot = null;
    $$('button', daysBox).forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
    var o = OPEN[days[i].wd], out = [];
    for (var m = o[0]; m <= o[1] - 90; m += 30) if (!(days[i].k === 0 && m < n0.min + 30)) out.push(m);
    slotsBox.innerHTML = out.map(function (m) { return '<button type="button" aria-pressed="false" data-m="' + m + '">' + hm(m).replace('h', ':').replace(/:$/, ':00') + '</button>'; }).join('');
  }
  daysBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pickDay(+b.getAttribute('data-i')); });
  slotsBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; pick.slot = +b.getAttribute('data-m'); $$('button', slotsBox).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
  if (days.length) pickDay(0);
  $('[data-quick]').addEventListener('click', function () { toast('Parfait, <b>' + covers + ' couvert' + (covers > 1 ? 's' : '') + '</b> : choisissez le soir et l’heure.'); });
  $('[data-confirm]').addEventListener('click', function () {
    var name = $('#nom').value.trim().replace(/[<>&"]/g, '');
    if (!pick.slot) { toast('Choisissez l’heure de votre arrivée.'); return; }
    if (!name) { toast('Indiquez votre nom pour la réservation.'); $('#nom').focus(); return; }
    var x = pick.day, when = (x.k === 0 ? 'ce soir' : x.k === 1 ? 'demain' : NAMES[x.wd] + ' ' + x.date.getDate()) + ' à ' + hm(pick.slot);
    toast('C’est noté, <b>' + name + '</b> : ' + covers + ' couvert' + (covers > 1 ? 's' : '') + ', ' + when + '. <br>Site d’exemple : rien n’a été envoyé.');
  });
})();
