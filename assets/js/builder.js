/* =========================================================
   Astelsia — le créateur de site en page d'accueil
   Le visiteur tape le nom de son commerce, choisit son activité
   et son ambiance : le site se construit en direct dans l'iPhone.
   Uniquement du texte et des couleurs : instantané, même sur un
   vieux téléphone. Fonctionne sans GSAP.

   Lien personnalisé pour le démarchage :
   https://astelsia.fr/?nom=Le%20Fournil&type=boulangerie&ambiance=dore
   types : restaurant, coiffeur, boulangerie, boutique, artisan, garage
   ambiances : dore, rose, sauge, nuit
   ========================================================= */
(function () {
  'use strict';

  var TYPES = {
    restaurant: { label: 'Restaurant', tagline: 'Une cuisine de saison, faite maison.', cta: 'Réserver une table', nav: 'Carte · Réserver', section: 'La carte', items: [['Entrée du jour', '9 €'], ['Plat du marché', '19 €'], ['Dessert maison', '8 €']], amb: 'dore' },
    coiffeur: { label: 'Salon de coiffure', tagline: 'Votre style, sublimé.', cta: 'Prendre rendez-vous', nav: 'Prestations · RDV', section: 'Prestations', items: [['Coupe & brushing', '38 €'], ['Couleur', 'dès 55 €'], ['Balayage', 'dès 85 €']], amb: 'rose' },
    boulangerie: { label: 'Boulangerie artisanale', tagline: 'Le pain du matin, comme autrefois.', cta: 'Commander', nav: 'Pains · Commander', section: 'Nos pains', items: [['Tradition', '1,30 €'], ['Pain de campagne', '3,90 €'], ['Croissant', '1,20 €']], amb: 'dore' },
    boutique: { label: 'Boutique', tagline: 'Des pièces choisies avec soin.', cta: 'Voir la boutique', nav: 'Boutique · Contact', section: 'Nouveautés', items: [['Carnet en lin', '18 €'], ['Bougie parfumée', '24 €'], ['Tote bag brodé', '15 €']], amb: 'rose' },
    artisan: { label: 'Artisan', tagline: 'Le travail bien fait, près de chez vous.', cta: 'Demander un devis', nav: 'Réalisations · Devis', section: 'Savoir-faire', items: [['Rénovation', '✓'], ['Sur mesure', '✓'], ['Dépannage rapide', '✓']], amb: 'sauge' },
    garage: { label: 'Garage', tagline: 'Entretien, réparation. En confiance.', cta: 'Prendre rendez-vous', nav: 'Services · RDV', section: 'Services', items: [['Vidange & révision', '✓'], ['Freins & pneus', '✓'], ['Diagnostic', '✓']], amb: 'nuit' }
  };
  var DEFAULT = { label: 'Votre activité', tagline: 'Bienvenue, entrez donc.', cta: 'Nous trouver', nav: 'Accueil · Contact', section: 'Nos horaires', items: [['Mardi – Samedi', '9h – 19h'], ['Dimanche', 'Fermé']] };
  var AMB = { dore: 'dorée', rose: 'rosée', sauge: 'sauge', nuit: 'nuit' };
  var PLANS = { solo: 'Solo', business: 'Business', signature: 'Signature' };
  var ORDER = ['solo', 'business', 'signature'];

  var state = { name: '', type: null, amb: 'nuit', ambTouched: false, plan: 'business', step: 1 };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var root = document.querySelector('.builder');
  var mini = document.querySelector('.mini');
  var device = document.querySelector('.device');
  if (!root || !mini) return;
  var input = document.getElementById('b-name');

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- Rendu du mini-site ---------- */
  var lastName = null;
  function render() {
    var t = state.type ? TYPES[state.type] : DEFAULT;
    var name = state.name.trim();
    $all('.mini [data-b="name"]').forEach(function (el) { el.textContent = name || 'Votre commerce'; });
    $all('.builder [data-b="name"]').forEach(function (el) { el.textContent = name || 'votre commerce'; });
    $all('[data-b="plans-title"]').forEach(function (el) { el.textContent = name ? 'Le site de ' + name + '.' : 'Trois formules.'; });
    mini.querySelector('[data-b="label"]').textContent = t.label;
    mini.querySelector('[data-b="tagline"]').textContent = t.tagline;
    mini.querySelector('[data-b="cta"]').textContent = t.cta;
    mini.querySelector('[data-b="nav"]').textContent = t.nav;
    mini.querySelector('[data-b="section"]').textContent = t.section;
    mini.querySelector('[data-b="items"]').innerHTML = t.items.map(function (it) { return '<p><span>' + esc(it[0]) + '</span><span>' + esc(it[1]) + '</span></p>'; }).join('');
    mini.setAttribute('data-amb', state.amb);
    if (name !== lastName && !reduced) { // petit « pop » quand le nom change
      var h = mini.querySelector('.mini__hero strong');
      h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop');
    }
    lastName = name;
    $all('.chip').forEach(function (c) { c.setAttribute('aria-checked', String(c.getAttribute('data-type') === state.type)); });
    $all('.swatch').forEach(function (s) { s.setAttribute('aria-checked', String(s.getAttribute('data-amb') === state.amb)); });
    updateContact();
  }

  /* ---------- Étapes ---------- */
  function go(step) {
    state.step = step;
    root.setAttribute('data-step', step);
    $all('.builder__step', root).forEach(function (s) {
      var on = +s.getAttribute('data-s') === step;
      s.hidden = !on;
      if (on && !reduced) { s.classList.remove('enter'); void s.offsetWidth; s.classList.add('enter'); }
    });
    device.classList.toggle('is-done', step === 3);
    // sur téléphone, si le panneau dépasse en bas de l'écran, on le remonte doucement
    if (started) {
      var r = root.getBoundingClientRect(), over = r.bottom - window.innerHeight + 12;
      if (over > 0) window.scrollBy({ top: over, behavior: reduced ? 'auto' : 'smooth' });
    }
    started = true;
  }
  var started = false;

  root.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); input.blur(); go(2); });
  input.addEventListener('input', function () { state.name = input.value; render(); });
  $all('[data-go]', root).forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-go')); }); });
  $all('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      state.type = c.getAttribute('data-type');
      if (!state.ambTouched) state.amb = TYPES[state.type].amb;
      render();
    });
  });
  $all('.swatch').forEach(function (s) {
    s.addEventListener('click', function () { state.amb = s.getAttribute('data-amb'); state.ambTouched = true; render(); });
  });

  /* ---------- Formules : boutons + cartes qui pivotent ---------- */
  var cards = {}; ORDER.forEach(function (k) { cards[k] = document.querySelector('.plan[data-plan="' + k + '"]'); });
  var timers = [];
  function selectPlan(key, fromUser) {
    if (!PLANS[key] || key === state.plan && fromUser !== 'force') { syncTabs(); return; }
    var prev = state.plan, dir = ORDER.indexOf(key) > ORDER.indexOf(prev) ? 1 : -1;
    state.plan = key;
    var incoming = cards[key], outgoing = cards[prev];
    timers.forEach(clearTimeout); timers = [];
    ORDER.forEach(function (k) { if (k !== key && k !== prev) cards[k].classList.remove('is-on', 'to-left', 'to-right', 'from-left', 'from-right'); });
    if (outgoing && outgoing !== incoming) {
      outgoing.classList.remove('is-on', 'from-left', 'from-right');
      outgoing.classList.add(dir > 0 ? 'to-left' : 'to-right');
      timers.push(setTimeout(function () { outgoing.classList.remove('to-left', 'to-right'); }, 700));
    }
    incoming.classList.add('no-trans', dir > 0 ? 'from-right' : 'from-left');
    void incoming.offsetWidth;
    incoming.classList.remove('no-trans', 'from-left', 'from-right');
    incoming.classList.add('is-on');
    syncTabs();
    updateContact();
  }
  function syncTabs() {
    $all('[data-plan-tab]').forEach(function (t) {
      var on = t.getAttribute('data-plan-tab') === state.plan;
      t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on));
    });
    $all('[data-plan-pick]').forEach(function (t) { t.classList.toggle('is-on', t.getAttribute('data-plan-pick') === state.plan); });
  }
  $all('[data-plan-tab]').forEach(function (t) { t.addEventListener('click', function () { selectPlan(t.getAttribute('data-plan-tab'), true); }); });
  $all('[data-plan-pick]').forEach(function (t) { t.addEventListener('click', function () { selectPlan(t.getAttribute('data-plan-pick'), true); }); });
  // flèches du clavier dans la barre d'onglets
  var tablist = document.querySelector('.tabs[role="tablist"]');
  if (tablist) tablist.addEventListener('keydown', function (e) {
    var i = ORDER.indexOf(state.plan);
    if (e.key === 'ArrowRight' && i < 2) { selectPlan(ORDER[i + 1], true); document.getElementById('t-' + ORDER[i + 1]).focus(); }
    if (e.key === 'ArrowLeft' && i > 0) { selectPlan(ORDER[i - 1], true); document.getElementById('t-' + ORDER[i - 1]).focus(); }
  });
  // glisser la carte du doigt
  var plansBox = document.querySelector('.plans'), sx = 0, sy = 0;
  if (plansBox) {
    plansBox.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    plansBox.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      var i = ORDER.indexOf(state.plan) + (dx < 0 ? 1 : -1);
      if (i >= 0 && i < 3) selectPlan(ORDER[i], true);
    }, { passive: true });
  }
  $all('[data-choose]').forEach(function (b) {
    b.addEventListener('click', function () { selectPlan(b.closest('.plan').getAttribute('data-plan'), true); showChoice(); });
  });

  /* ---------- Contact : le mail est déjà rédigé ---------- */
  var chosen = false;
  function showChoice() {
    chosen = true;
    var box = document.querySelector('.contact__plan');
    if (!box) return;
    var name = state.name.trim();
    box.hidden = false;
    box.innerHTML = 'Formule choisie&nbsp;: <strong>' + PLANS[state.plan] + '</strong>' + (name ? ' pour <strong>' + esc(name) + '</strong>' : '');
  }
  function updateContact() {
    var C = window.ASTELSIA_CONTACT || {};
    if (!C.email) return;
    var name = state.name.trim();
    var what = [];
    if (state.type) what.push(TYPES[state.type].label.toLowerCase());
    if (state.type || state.ambTouched) what.push('ambiance ' + AMB[state.amb]);
    var subject = 'Mon site Astelsia' + (name ? ' — ' + name : '');
    var body = 'Bonjour,\n\nJe souhaite un site pour ' + (name || 'mon commerce') + (what.length ? ' (' + what.join(', ') + ')' : '') + '.\n'
      + 'Formule : ' + PLANS[state.plan] + '.\n\nMon numéro : \n\nMerci !';
    $all('[data-contact="email"]').forEach(function (a) {
      a.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
    if (chosen) showChoice();
  }

  /* ---------- Lien personnalisé (démarchage) ---------- */
  var q = new URLSearchParams(location.search);
  var qName = (q.get('nom') || '').slice(0, 32), qType = (q.get('type') || '').toLowerCase(), qAmb = (q.get('ambiance') || '').toLowerCase();
  if (qName) { state.name = qName; input.value = qName; }
  if (TYPES[qType]) { state.type = qType; state.amb = TYPES[qType].amb; }
  if (AMB[qAmb]) { state.amb = qAmb; state.ambTouched = true; }

  render();
  syncTabs();
  go(qName ? 3 : 1);

  window.AstelsiaBuilder = { state: state, selectPlan: selectPlan };
})();
