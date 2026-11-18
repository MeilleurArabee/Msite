/* Pivoine — site d'exemple Astelsia (formule Solo) : « ouvert maintenant » en direct, et les boutons de démonstration. */
(function () {
  'use strict';
  var d = document;
  var OPEN = { 0: [540, 780], 2: [540, 1140], 3: [540, 1140], 4: [540, 1140], 5: [540, 1140], 6: [540, 1140] };
  var NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function paris() {
    try {
      var p = {}; new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: 'numeric', day: 'numeric' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { day: new Date(+p.year, +p.month - 1, +p.day).getDay(), min: (+p.hour % 24) * 60 + +p.minute };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function hm(m) { var h = Math.floor(m / 60), mn = m % 60; return h + 'h' + (mn ? (mn < 10 ? '0' : '') + mn : ''); }
  function status() {
    var n = paris(), o = OPEN[n.day], txt, on = false;
    if (o && n.min >= o[0] && n.min < o[1]) { on = true; txt = 'Ouvert · jusqu’à ' + hm(o[1]); }
    else if (o && n.min < o[0]) txt = 'Fermé · ouvre à ' + hm(o[0]);
    else for (var k = 1; k < 8; k++) { var dd = (n.day + k) % 7; if (OPEN[dd]) { txt = 'Fermé · ouvre ' + (k === 1 ? 'demain' : NAMES[dd]) + ' à ' + hm(OPEN[dd][0]); break; } }
    d.querySelectorAll('[data-status]').forEach(function (el) { el.classList.toggle('is-open', on); el.querySelector('[data-status-text]').textContent = txt; });
    d.querySelectorAll('[data-hours] li').forEach(function (li) { li.classList.toggle('is-today', +li.getAttribute('data-day') === n.day); });
  }
  status(); setInterval(status, 30000);
  var t = d.querySelector('.toast'), tt = 0;
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-demo]'); if (!a) return;
    e.preventDefault();
    t.innerHTML = a.getAttribute('data-demo') === 'call' ? '<b>Site d’exemple</b> : sur un vrai site, ce bouton appelle la boutique.' : '<b>Site d’exemple</b> : sur un vrai site, ce bouton ouvre l’itinéraire dans votre GPS.';
    t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('is-on'); }, 3000);
  });
})();
