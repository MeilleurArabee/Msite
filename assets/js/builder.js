/* =========================================================
   Astelsia — le créateur de site en page d'accueil
   1. le nom du commerce   2. le métier (champ libre « intelligent »)
   3. le style : n'importe quelle couleur, 3 styles, et chaque texte
      se modifie en le touchant dans l'iPhone.
   Puis la page raconte la suite à son nom, et les formules
   montrent son propre site, version Solo / Business / Signature.
   Uniquement du texte et des couleurs : instantané, même sur un
   vieux téléphone. Fonctionne sans GSAP.

   Lien personnalisé pour le démarchage :
   https://astelsia.fr/?nom=Le%20Fournil&type=boulangerie
   (type = n'importe quel métier, ex. fleuriste, ostéopathe, garage)
   options : &couleur=0-360 (teinte)  &style=elegant|moderne|chaleureux
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Les grandes familles de métiers ---------- */
  var FAM = {
    resto: { tagline: 'Une cuisine de saison, faite maison.', cta: 'Réserver une table', nav: 'Carte · Réserver', section: 'La carte', items: [['Entrée du jour', '9 €'], ['Plat du marché', '19 €'], ['Dessert maison', '8 €']], hue: 22, rec: 'business', why: 'votre carte, vos photos et vos horaires, sur plusieurs pages.' },
    food: { tagline: 'Le goût du fait maison.', cta: 'Commander', nav: 'Produits · Commander', section: 'Nos produits', items: [['Le produit phare', '—'], ['La spécialité', '—'], ['Le coup de cœur', '—']], hue: 32, rec: 'business', why: 'vos produits, vos photos et vos horaires, sur plusieurs pages.' },
    beaute: { tagline: 'Prenez soin de vous.', cta: 'Prendre rendez-vous', nav: 'Prestations · RDV', section: 'Prestations', items: [['Prestation signature', 'dès 35 €'], ['Soin du moment', 'dès 45 €'], ['Forfait', 'dès 60 €']], hue: 345, rec: 'signature', why: 'vos clients prennent rendez-vous en ligne, même quand le salon est fermé.' },
    sante: { tagline: 'À votre écoute, près de chez vous.', cta: 'Prendre rendez-vous', nav: 'Soins · RDV', section: 'Consultations', items: [['Première consultation', 'sur RDV'], ['Suivi', 'sur RDV'], ['À domicile', 'sur demande']], hue: 172, rec: 'signature', why: 'vos patients prennent rendez-vous en ligne, sans avoir à vous appeler.' },
    artisan: { tagline: 'Le travail bien fait, près de chez vous.', cta: 'Demander un devis', nav: 'Réalisations · Devis', section: 'Savoir-faire', items: [['Rénovation', '✓'], ['Sur mesure', '✓'], ['Dépannage', '✓']], hue: 140, rec: 'business', why: 'vos réalisations en photos et une demande de devis toute simple.' },
    boutique: { tagline: 'Des pièces choisies avec soin.', cta: 'Nous rendre visite', nav: 'Boutique · Contact', section: 'Nouveautés', items: [['Coup de cœur', 'dès 15 €'], ['Idée cadeau', 'dès 20 €'], ['Nouvelle collection', '✓']], hue: 310, rec: 'business', why: 'votre catalogue et vos photos, sur plusieurs pages.' },
    auto: { tagline: 'Entretien, réparation. En confiance.', cta: 'Prendre rendez-vous', nav: 'Services · RDV', section: 'Services', items: [['Révision', '✓'], ['Freins & pneus', '✓'], ['Diagnostic', '✓']], hue: 215, rec: 'business', why: 'vos services, vos tarifs et vos photos, sur plusieurs pages.' },
    heberg: { tagline: 'Une parenthèse, le temps d’un séjour.', cta: 'Réserver', nav: 'Chambres · Réserver', section: 'Nos chambres', items: [['Chambre double', 'dès 79 €'], ['Suite', 'dès 119 €'], ['Petit-déjeuner', '12 €']], hue: 198, rec: 'signature', why: 'vos clients réservent directement chez vous, sans intermédiaire.' },
    sport: { tagline: 'Bougez, progressez, à votre rythme.', cta: 'Réserver un cours', nav: 'Cours · Réserver', section: 'Nos cours', items: [['Cours collectif', '✓'], ['Coaching individuel', '✓'], ['Planning', 'lun. – sam.']], hue: 262, rec: 'signature', why: 'vos élèves réservent leurs cours en ligne, en deux gestes.' },
    services: { tagline: 'Un service de proximité, en toute confiance.', cta: 'Nous contacter', nav: 'Services · Contact', section: 'Nos services', items: [['Conseil', '✓'], ['Sur mesure', '✓'], ['Sur rendez-vous', '✓']], hue: 245, rec: 'business', why: 'vos services et vos photos, présentés clairement sur plusieurs pages.' }
  };

  /* ---------- Les métiers reconnus : [mots, nom affiché, famille, détails] ---------- */
  var JOBS = [
    ['restaurant|resto|brasserie|bistrot', 'Restaurant', 'resto'],
    ['creperie|crepes|galettes', 'Crêperie', 'resto', { tagline: 'Galettes et crêpes, faites minute.', section: 'Nos galettes', items: [['Complète', '9,50 €'], ['Galette du moment', '12 €'], ['Beurre-sucre', '4 €']] }],
    ['pizzeria|pizza', 'Pizzeria', 'resto', { tagline: 'Pâte maison, cuite au feu de bois.', section: 'Nos pizzas', cta: 'Commander', items: [['Margherita', '10 €'], ['Reine', '12 €'], ['La maison', '14 €']] }],
    ['kebab|snack|fast food|burger|tacos', 'Snack', 'resto', { tagline: 'Généreux, rapide, fait maison.', cta: 'Commander', items: [['Menu classique', '9 €'], ['Assiette', '12 €'], ['Menu étudiant', '7 €']] }],
    ['sushi|japonais|asiatique|chinois|thai|vietnamien|indien|libanais|italien', 'Restaurant', 'resto', { tagline: 'Des saveurs d’ailleurs, préparées ici.' }],
    ['bar|pub|bar a vin', 'Bar', 'resto', { tagline: 'Un verre, une ambiance.', section: 'À la carte', cta: 'Nous trouver', items: [['Bière pression', '5 €'], ['Cocktail maison', '9 €'], ['Planche apéro', '14 €']] }],
    ['cafe|salon de the|coffee shop|coffee', 'Café', 'resto', { tagline: 'Une pause, comme à la maison.', section: 'À la carte', cta: 'Nous trouver', items: [['Café', '2 €'], ['Thé maison', '3 €'], ['Pâtisserie', '4,50 €']] }],
    ['traiteur', 'Traiteur', 'resto', { tagline: 'Vos réceptions, cuisinées avec soin.', section: 'Nos formules', cta: 'Demander un devis', items: [['Buffet', 'dès 18 €/pers.'], ['Cocktail', 'dès 12 €/pers.'], ['Plateau repas', '15 €']] }],
    ['food truck|foodtruck', 'Food truck', 'resto', { tagline: 'La bonne cuisine vient à vous.', cta: 'Où nous trouver' }],
    ['boulangerie|boulanger|patisserie|patissier', 'Boulangerie', 'food', { tagline: 'Le pain du matin, comme autrefois.', section: 'Nos pains', items: [['Tradition', '1,30 €'], ['Pain de campagne', '3,90 €'], ['Croissant', '1,20 €']] }],
    ['boucherie|boucher|charcuterie|charcutier', 'Boucherie', 'food', { tagline: 'Des viandes choisies avec exigence.', section: 'Nos viandes', items: [['Entrecôte', '29 €/kg'], ['Volaille fermière', '14 €/kg'], ['Saucisses maison', '16 €/kg']] }],
    ['fromagerie|fromager|cremerie', 'Fromagerie', 'food', { tagline: 'Des fromages affinés avec patience.', section: 'Nos fromages', items: [['Comté 24 mois', '32 €/kg'], ['Chèvre fermier', '4,50 €'], ['Plateau du moment', 'dès 25 €']] }],
    ['epicerie|epicerie fine|vrac', 'Épicerie fine', 'food', { tagline: 'Le meilleur des petits producteurs.' }],
    ['caviste|cave a vin|cave|vins|vin', 'Cave à vins', 'food', { tagline: 'Des vins de vignerons, choisis pour vous.', section: 'Notre sélection', items: [['Vin du moment', '12 €'], ['Champagne', 'dès 32 €'], ['Coffret cadeau', 'dès 25 €']] }],
    ['chocolatier|chocolaterie|confiserie|confiseur', 'Chocolatier', 'food', { tagline: 'Le chocolat, travaillé à la main.' }],
    ['primeur|fruits et legumes|maraicher', 'Primeur', 'food', { tagline: 'Les fruits et légumes de la saison.' }],
    ['poissonnerie|poissonnier|poisson|ecailler', 'Poissonnerie', 'food', { tagline: 'La pêche du jour, sur l’étal ce matin.' }],
    ['glacier|glaces', 'Glacier', 'food', { tagline: 'Des glaces artisanales, parfums de saison.' }],
    ['coiffeur|coiffeuse|coiffure|salon de coiffure', 'Salon de coiffure', 'beaute', { tagline: 'Votre style, sublimé.', items: [['Coupe & brushing', '38 €'], ['Couleur', 'dès 55 €'], ['Balayage', 'dès 85 €']] }],
    ['barbier|barber|barbershop', 'Barbier', 'beaute', { tagline: 'La coupe, la barbe, le geste juste.', items: [['Coupe homme', '22 €'], ['Taille de barbe', '15 €'], ['Coupe + barbe', '32 €']] }],
    ['estheticienne|institut|institut de beaute|esthetique|beaute|soins', 'Institut de beauté', 'beaute', { tagline: 'Un moment rien que pour vous.', items: [['Soin du visage', 'dès 45 €'], ['Épilation', 'dès 12 €'], ['Modelage', 'dès 50 €']] }],
    ['onglerie|ongles|prothesiste ongulaire|nail|manucure', 'Onglerie', 'beaute', { tagline: 'Des mains impeccables, du bout des ongles.', items: [['Pose gel', '40 €'], ['Remplissage', '32 €'], ['Semi-permanent', '25 €']] }],
    ['spa|massage|bien etre|masseur|masseuse', 'Spa & bien-être', 'beaute', { tagline: 'Respirez. On s’occupe du reste.', items: [['Massage relaxant', '60 €'], ['Soin du corps', '75 €'], ['Accès spa', '25 €']] }],
    ['tatoueur|tatouage|tattoo|piercing|pierceur', 'Salon de tatouage', 'beaute', { tagline: 'Votre histoire, à fleur de peau.', items: [['Flash', 'dès 80 €'], ['Projet sur mesure', 'sur devis'], ['Piercing', 'dès 30 €']] }],
    ['maquilleuse|maquillage|cils|extension de cils|sourcils', 'Studio beauté', 'beaute'],
    ['osteopathe|osteo', 'Ostéopathe', 'sante'],
    ['kine|kinesitherapeute|kinesitherapie', 'Kinésithérapeute', 'sante'],
    ['naturopathe|naturopathie', 'Naturopathe', 'sante'],
    ['sophrologue|sophrologie|hypnose|hypnotherapeute', 'Sophrologue', 'sante'],
    ['psychologue|psy|therapeute|psychotherapeute', 'Psychologue', 'sante'],
    ['podologue|pedicure', 'Podologue', 'sante'],
    ['infirmier|infirmiere|cabinet infirmier', 'Cabinet infirmier', 'sante'],
    ['dentiste|cabinet dentaire|orthodontiste', 'Cabinet dentaire', 'sante'],
    ['medecin|docteur|generaliste|sage femme|orthophoniste|dieteticien|dieteticienne', 'Cabinet médical', 'sante'],
    ['veterinaire|veto|clinique veterinaire', 'Vétérinaire', 'sante', { section: 'Nos soins', tagline: 'Prendre soin d’eux, avec vous.' }],
    ['pharmacie|pharmacien', 'Pharmacie', 'sante', { cta: 'Nous trouver', section: 'Nos services', items: [['Conseil', '✓'], ['Parapharmacie', '✓'], ['Garde', 'voir planning']], rec: 'business' }],
    ['artisan', 'Artisan', 'artisan'],
    ['plombier|plomberie', 'Plombier', 'artisan', { tagline: 'Dépannage et installation, sans mauvaise surprise.', items: [['Dépannage', 'rapide'], ['Salle de bain', 'sur devis'], ['Chauffe-eau', 'sur devis']] }],
    ['electricien|electricite', 'Électricien', 'artisan', { tagline: 'Une installation sûre, aux normes.' }],
    ['menuisier|menuiserie|ebeniste|charpentier', 'Menuisier', 'artisan', { tagline: 'Le bois, travaillé sur mesure.' }],
    ['macon|maconnerie|terrassement', 'Maçon', 'artisan', { tagline: 'Du solide, construit pour durer.' }],
    ['peintre|peinture|plaquiste|platrier', 'Peintre en bâtiment', 'artisan', { tagline: 'Des finitions soignées, du sol au plafond.' }],
    ['couvreur|toiture|zingueur', 'Couvreur', 'artisan', { tagline: 'Votre toit entre de bonnes mains.' }],
    ['carreleur|carrelage', 'Carreleur', 'artisan'],
    ['chauffagiste|chauffage|climatisation|frigoriste', 'Chauffagiste', 'artisan'],
    ['serrurier|serrurerie', 'Serrurier', 'artisan', { tagline: 'Ouverture, sécurité, dépannage.' }],
    ['paysagiste|jardinier|jardin|elagage|elagueur', 'Paysagiste', 'artisan', { tagline: 'Des jardins qui vous ressemblent.', hue: 112 }],
    ['cordonnier|cordonnerie|cles', 'Cordonnerie', 'services', { tagline: 'Réparer plutôt que jeter.' }],
    ['couturier|couturiere|retouches|couture', 'Atelier de couture', 'services', { tagline: 'Retouches et créations, au point près.' }],
    ['boutique|magasin|commerce|concept store', 'Boutique', 'boutique'],
    ['fleuriste|fleurs|fleur', 'Fleuriste', 'boutique', { tagline: 'Des fleurs fraîches, chaque matin.', section: 'Nos bouquets', cta: 'Commander un bouquet', items: [['Bouquet du jour', '25 €'], ['Composition', 'dès 35 €'], ['Plante verte', 'dès 15 €']] }],
    ['librairie|libraire|livres|bd|bandes dessinees', 'Librairie', 'boutique', { tagline: 'Des livres choisis, des conseils sincères.', section: 'Coups de cœur' }],
    ['vetements|pret a porter|mode|friperie|habillement', 'Boutique de mode', 'boutique', { section: 'Nouvelle collection' }],
    ['bijouterie|bijoux|bijoutier|horlogerie', 'Bijouterie', 'boutique', { tagline: 'Des bijoux pour les moments qui comptent.' }],
    ['decoration|deco|maison|cadeaux|cadeau', 'Décoration & cadeaux', 'boutique'],
    ['chaussures|maroquinerie|sacs', 'Chaussures & maroquinerie', 'boutique'],
    ['jouets|jeux|jeux de societe', 'Magasin de jouets', 'boutique'],
    ['animalerie|animaux', 'Animalerie', 'boutique'],
    ['tabac|presse|tabac presse', 'Tabac-presse', 'boutique', { cta: 'Nous trouver' }],
    ['opticien|optique|lunettes', 'Opticien', 'boutique', { cta: 'Prendre rendez-vous', tagline: 'Bien voir, et être bien vu.' }],
    ['garage|garagiste|mecanicien|mecanique|automobile', 'Garage', 'auto'],
    ['carrosserie|carrossier', 'Carrosserie', 'auto', { tagline: 'Votre voiture comme neuve.' }],
    ['controle technique', 'Contrôle technique', 'auto'],
    ['moto|scooter', 'Garage moto', 'auto'],
    ['velo|cycles|cycliste', 'Magasin de cycles', 'auto', { tagline: 'Vente, réparation, conseils.' }],
    ['auto ecole|permis', 'Auto-école', 'auto', { tagline: 'Votre permis, sereinement.', cta: 'S’inscrire', section: 'Nos formules', items: [['Code', 'dès 30 €'], ['Permis B', 'dès 1 190 €'], ['Conduite accompagnée', '✓']] }],
    ['taxi|vtc|ambulance', 'Taxi', 'auto', { cta: 'Réserver une course', tagline: 'À l’heure, à chaque fois.' }],
    ['hotel', 'Hôtel', 'heberg'],
    ['gite|location saisonniere|location de vacances', 'Gîte', 'heberg', { section: 'Le gîte' }],
    ['chambre d hotes|chambres d hotes|maison d hotes', 'Chambres d’hôtes', 'heberg'],
    ['camping', 'Camping', 'heberg', { section: 'Nos emplacements', items: [['Emplacement', 'dès 22 €'], ['Mobil-home', 'dès 59 €'], ['Piscine', '✓']] }],
    ['coach|coach sportif|personal trainer', 'Coach sportif', 'sport'],
    ['salle de sport|fitness|musculation|crossfit', 'Salle de sport', 'sport'],
    ['yoga|pilates|meditation', 'Studio de yoga', 'sport', { tagline: 'Respirer, s’étirer, se retrouver.' }],
    ['danse|ecole de danse', 'École de danse', 'sport'],
    ['boxe|karate|judo|arts martiaux|self defense', 'Club de sport', 'sport'],
    ['equitation|centre equestre|poney', 'Centre équestre', 'sport'],
    ['pressing|laverie|blanchisserie', 'Pressing', 'services'],
    ['photographe|photo|videaste', 'Photographe', 'services', { cta: 'Réserver une séance', section: 'Prestations', tagline: 'Vos plus beaux moments, pour toujours.', rec: 'signature', why: 'vos clients réservent leur séance en ligne et voient vos plus belles photos.' }],
    ['immobilier|agence immobiliere|agent immobilier', 'Agence immobilière', 'services', { section: 'Nos biens', tagline: 'Le bon bien, au bon prix.' }],
    ['toilettage|toiletteur|toiletteuse', 'Toilettage', 'beaute', { tagline: 'Beaux, propres et chouchoutés.', items: [['Bain & séchage', 'dès 30 €'], ['Toilettage complet', 'dès 45 €'], ['Coupe des griffes', '10 €']] }],
    ['informatique|reparation telephone|reparation|depannage informatique', 'Réparation & informatique', 'services'],
    ['nettoyage|menage|aide a domicile|conciergerie', 'Services à domicile', 'services'],
    ['architecte|decorateur|architecte d interieur', 'Architecte', 'services', { tagline: 'Des lieux pensés pour vous.' }],
    ['avocat|notaire|expert comptable|comptable|cabinet', 'Cabinet', 'services', { tagline: 'Un conseil clair, à vos côtés.', cta: 'Prendre rendez-vous' }],
    ['creche|garderie|assistante maternelle|nounou', 'Crèche', 'services', { tagline: 'Un cocon pour grandir.' }],
    ['ecole|cours particuliers|soutien scolaire|formation|musique|ecole de musique', 'École & cours', 'sport', { tagline: 'Apprendre, avec plaisir.' }]
  ];
  var POPULAR = ['Restaurant', 'Salon de coiffure', 'Boulangerie', 'Fleuriste', 'Plombier', 'Garage'];
  var STYLES = { elegant: 'élégant', moderne: 'moderne', chaleureux: 'chaleureux' };
  var PLANS = { solo: 'Solo', business: 'Business', signature: 'Signature' };
  var ORDER = ['solo', 'business', 'signature'];
  var CAPS = {
    solo: '<strong>Solo</strong> · Un vrai exemple&nbsp;: Talon &amp; Clé, une cordonnerie imaginaire. Une belle page claire, avec horaires, tarifs, carte et bouton pour appeler.',
    business: '<strong>Business</strong> · Un site élégant de plusieurs pages&nbsp;: menu de navigation, votre carte ou vos produits, une galerie photo.',
    signature: '<strong>Signature</strong> · L\'expérience complète, comme ce site&nbsp;: un univers animé sur mesure et la réservation en ligne intégrée.'
  };

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'\-_.]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function cap1(s) { s = String(s).trim(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  JOBS.forEach(function (j) { j.keys = j[0].split('|').map(norm); j.nlabel = norm(j[1]); });

  // trouve le métier le plus proche de ce que la personne a tapé
  function findJob(text) {
    var q = norm(text);
    if (q.length < 2) return null;
    var best = null, score = 0;
    JOBS.forEach(function (j) {
      j.keys.concat([j.nlabel]).forEach(function (k) {
        var s = 0;
        if (q === k) s = 100;
        else if ((' ' + q + ' ').indexOf(' ' + k + ' ') >= 0) s = 60 + k.length;    // « salon de coiffure lys »
        else if (q.length >= 3 && k.indexOf(q) === 0) s = 40 + q.length;          // « fleur » → fleuriste
        else if (q.length >= 4 && q.indexOf(k) === 0 && k.length >= 4) s = 30 + k.length;
        if (s > score) { score = s; best = j; }
      });
    });
    return best;
  }
  function suggest(text) {
    var q = norm(text);
    if (!q) return POPULAR;
    var out = [];
    JOBS.forEach(function (j) {
      if (out.length >= 4 || out.indexOf(j[1]) >= 0) return;
      if (j.nlabel.indexOf(q) === 0 || j.keys.some(function (k) { return k.indexOf(q) === 0; })) out.push(j[1]);
    });
    if (out.length < 4) JOBS.forEach(function (j) {
      if (out.length < 4 && out.indexOf(j[1]) < 0 && q.length >= 3 && j.nlabel.indexOf(q) > 0) out.push(j[1]);
    });
    return out;
  }
  // le modèle de site correspondant au métier (ou un modèle qui reprend son mot)
  function template() {
    var raw = state.job.trim();
    var j = findJob(raw);
    if (j) {
      var f = FAM[j[2]], o = j[3] || {}, t = {};
      Object.keys(f).forEach(function (k) { t[k] = f[k]; });
      Object.keys(o).forEach(function (k) { t[k] = o[k]; });
      t.label = j[1];
      return t;
    }
    if (norm(raw).length >= 3) {
      var g = FAM.services, u = {};
      Object.keys(g).forEach(function (k) { u[k] = g[k]; });
      u.label = cap1(raw);
      u.tagline = 'Votre ' + raw.trim().toLowerCase() + ', tout près de chez vous.';
      return u;
    }
    return { label: 'Votre activité', tagline: 'Bienvenue, entrez donc.', cta: 'Nous trouver', nav: 'Accueil · Contact', section: 'Nos horaires', items: [['Mardi – Samedi', '9h – 19h'], ['Dimanche', 'Fermé']], hue: 232, rec: 'business', why: null };
  }

  var state = { name: '', job: '', hue: null, style: 'elegant', custom: {}, plan: 'business', step: 1, done: false };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.querySelector('.builder');
  var heroMini = document.querySelector('.hero .mini');
  var device = document.querySelector('.hero .device');
  var heroEl = document.querySelector('.hero');
  var Stars = function () { return window.AstelsiaStars || { setBuilding: function () {}, pulse: function () {} }; };
  // dès que la personne commence à créer son site, l'iPhone apparaît dans la lumière des étoiles
  function setBuilding(on) {
    if (heroEl.classList.contains('is-building') === on) return;
    heroEl.classList.toggle('is-building', on);
    Stars().setBuilding(on);
  }
  if (!root || !heroMini) return;
  var minis = $all('.mini');
  var nameInput = document.getElementById('b-name'), jobInput = document.getElementById('b-job');
  var hueInput = document.getElementById('b-hue'), editBox = root.querySelector('.editor'), editInput = document.getElementById('b-edit');
  var editLabel = root.querySelector('[data-edit-label]'), hint = root.querySelector('.builder__hint');
  var mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (hint) hint.textContent = mouse ? '✎ Cliquez sur un texte de l\'aperçu pour le modifier.' : '✎ Touchez un texte dans l\'aperçu pour le modifier.';

  /* ---------- Couleurs : toute la palette depuis une seule teinte ---------- */
  function palette(h) {
    return {
      '--hero': 'linear-gradient(140deg, hsl(' + h + ' 55% 62%), hsl(' + h + ' 50% 27%))',
      '--g2': 'linear-gradient(140deg, hsl(' + h + ' 50% 80%), hsl(' + h + ' 40% 46%))',
      '--g3': 'linear-gradient(140deg, hsl(' + ((h + 24) % 360) + ' 45% 66%), hsl(' + h + ' 45% 32%))',
      '--bg': 'hsl(' + h + ' 38% 97%)',
      '--ink': 'hsl(' + h + ' 38% 14%)',
      '--accent': 'hsl(' + h + ' 55% 42%)',
      '--h': String(h)
    };
  }

  /* ---------- Rendu de tous les mini-sites ---------- */
  var lastName = null, lastLabel = null, lastTl = null;
  function render() {
    var t = template(), name = state.name.trim();
    var hue = state.hue !== null ? state.hue : t.hue;
    var pal = palette(hue);
    var txt = {
      name: name || 'Votre commerce', label: t.label,
      tagline: state.custom.tagline || t.tagline, cta: state.custom.cta || t.cta,
      section: state.custom.section || t.section, nav: t.nav
    };
    var items = t.items.map(function (it) { return '<p><span>' + esc(it[0]) + '</span><span>' + esc(it[1]) + '</span></p>'; }).join('');
    minis.forEach(function (m) {
      Object.keys(pal).forEach(function (k) { m.style.setProperty(k, pal[k]); });
      m.setAttribute('data-style', state.style);
      $all('[data-b]', m).forEach(function (el) {
        var k = el.getAttribute('data-b');
        if (k === 'items') el.innerHTML = items; else if (txt[k] !== undefined) el.textContent = txt[k];
      });
    });
    if (hueInput && state.hue === null) hueInput.value = t.hue;
    if ((name !== lastName || t.label !== lastLabel) && !reduced) {
      minis.forEach(function (m) { var h = m.querySelector('.mini__hero'); h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); });
    }
    lastName = name; lastLabel = t.label;

    // textes de la page qui reprennent son nom
    $all('.builder [data-b="name"]').forEach(function (el) { el.textContent = name || 'votre commerce'; });
    $all('[data-b="plans-title"]').forEach(function (el) { el.textContent = name ? 'Le site de ' + name + '.' : 'Trois formules.'; });
    var tl1 = document.querySelector('[data-b="tl1"]');
    if (tl1 && name !== lastTl) {
      lastTl = name;
      tl1.innerHTML = name ? esc(name) + ', vous avez mis des années à construire <em>votre commerce.</em>' : 'Vous avez mis des années à construire <em>votre commerce.</em>';
      if (window.AstelsiaTrailer) window.AstelsiaTrailer.refresh(); // les mots de la phrase se rallument au scroll
    }
    $all('.style-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-style') === state.style)); });

    // le conseil selon le métier, et la formule recommandée qui suit
    var rec = t.rec || 'business';
    var advice = document.querySelector('.plans__advice');
    if (advice) {
      if (t.why) {
        advice.hidden = false;
        advice.innerHTML = 'Notre conseil pour ' + (name ? '<em>' + esc(name) + '</em>' : 'votre activité') + '&nbsp;: <strong>' + PLANS[rec] + '</strong>, ' + esc(t.why);
      } else advice.hidden = true;
    }
    setRecommended(rec);
    renderSuggest();
    updateContact();
  }

  /* ---------- Suggestions de métiers ---------- */
  var sugBox = root.querySelector('.suggest');
  function renderSuggest() {
    if (!sugBox) return;
    var list = suggest(state.job), cur = template().label;
    sugBox.innerHTML = list.map(function (l) { return '<button type="button" class="chip' + (l === cur && state.job ? ' is-on' : '') + '">' + esc(l) + '</button>'; }).join('');
  }
  if (sugBox) sugBox.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    state.job = b.textContent; jobInput.value = state.job; render();
  });

  /* ---------- Étapes ---------- */
  var started = false;
  function go(step) {
    state.step = step;
    root.setAttribute('data-step', step);
    $all('.builder__step', root).forEach(function (s) {
      var on = +s.getAttribute('data-s') === step;
      s.hidden = !on;
      if (on && !reduced) { s.classList.remove('enter'); void s.offsetWidth; s.classList.add('enter'); }
    });
    heroMini.classList.toggle('is-editable', step === 3);
    if (step > 1) setBuilding(true);
    if (step === 4) Stars().pulse();
    device.classList.toggle('is-done', step === 4);
    if (step !== 3) closeEditor();
    if (step === 4 && !state.done) { state.done = true; selectPlan(currentRec, 'force'); }
    setLive(heroMini, step === 4);
    if (started) { // sur téléphone, si le panneau dépasse en bas de l'écran, on le remonte doucement
      var r = root.getBoundingClientRect(), over = r.bottom - window.innerHeight + 12;
      if (over > 0) window.scrollBy({ top: over, behavior: reduced ? 'auto' : 'smooth' });
    }
    started = true;
  }
  $all('form', root).forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); $all('input', f).forEach(function (i) { i.blur(); }); go(+f.getAttribute('data-s') + 1); });
  });
  $all('[data-go]', root).forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-go')); }); });
  nameInput.addEventListener('input', function () {
    state.name = nameInput.value; render();
    setBuilding(state.name.trim().length > 0 || state.step > 1);
    Stars().pulse();
  });
  jobInput.addEventListener('input', function () { state.job = jobInput.value; render(); });
  if (hueInput) hueInput.addEventListener('input', function () { state.hue = +hueInput.value; render(); });
  $all('.style-btn').forEach(function (b) { b.addEventListener('click', function () { state.style = b.getAttribute('data-style'); render(); }); });

  /* ---------- « Touchez un texte pour le modifier » ---------- */
  var LABELS = { name: 'Le nom', tagline: 'Le slogan', cta: 'Le bouton', section: 'Le titre de la section' };
  var editing = null;
  heroMini.addEventListener('click', function (e) {
    if (state.step !== 3) return;
    var el = e.target.closest('[data-edit]'); if (!el) return;
    editing = el.getAttribute('data-edit');
    editLabel.textContent = LABELS[editing];
    editInput.value = el.textContent;
    editBox.hidden = false; hint.hidden = true;
    $all('[data-edit]', heroMini).forEach(function (x) { x.classList.toggle('is-editing', x === el); });
    editInput.focus({ preventScroll: true });
    editInput.select();
  });
  editInput.addEventListener('input', function () {
    if (!editing) return;
    if (editing === 'name') { state.name = editInput.value; nameInput.value = state.name; }
    else state.custom[editing] = editInput.value;
    render();
  });
  function closeEditor() {
    editing = null; editBox.hidden = true; hint.hidden = false;
    $all('[data-edit]', heroMini).forEach(function (x) { x.classList.remove('is-editing'); });
  }
  root.querySelector('.editor__ok').addEventListener('click', function () { editInput.blur(); closeEditor(); });
  editInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); editInput.blur(); closeEditor(); } });

  /* ---------- Formules : boutons + carte qui pivote + iPhone qui change ---------- */
  var cards = {}; ORDER.forEach(function (k) { cards[k] = document.querySelector('.plan[data-plan="' + k + '"]'); });
  var planMini = document.querySelector('.plan-preview .mini'), planCap = document.querySelector('.plan-preview__cap');

  /* ---------- Aperçu vivant : on peut défiler et toucher dans l'iPhone ---------- */
  var mouseHint = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hintEl = document.querySelector('.plan-preview__hint');
  if (hintEl) hintEl.textContent = mouseHint ? 'Faites défiler et cliquez dans l\'aperçu' : 'Faites défiler et touchez l\'aperçu';
  function toast(m, text) {
    var t = m.querySelector('.mini__toast'); if (!t) return;
    t.textContent = text; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }
  function revealCheck(m) {
    var sc = m.querySelector('.mini__scroll'), box = sc.getBoundingClientRect();
    $all('.mini__reveal', m).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < box.bottom - box.height * 0.08) el.classList.add('in');
    });
  }
  function scrollMiniTo(m, el) {
    var sc = m.querySelector('.mini__scroll');
    var y = el ? el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - sc.clientHeight * 0.12 : 0;
    sc.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
  }
  function setLive(m, on) {
    if (!m) return;
    m.classList.toggle('is-live', on);
    if (!on || m._live) return;
    m._live = true;
    var sc = m.querySelector('.mini__scroll'), demo = !reduced, dir = 1, last = 0, wait = 1200;
    // petit défilement de démonstration, qui s'arrête dès que la personne touche l'aperçu
    function stop() { demo = false; }
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) { m.addEventListener(ev, stop, { passive: true }); });
    function loop(now) {
      if (!demo) return;
      var dt = Math.min(50, now - (last || now)); last = now;
      if (m.classList.contains('is-live') && m.getBoundingClientRect().bottom > 0 && m.getBoundingClientRect().top < innerHeight) {
        if (wait > 0) wait -= dt;
        else {
          var max = sc.scrollHeight - sc.clientHeight;
          sc.scrollTop += dir * dt * 0.035;
          if (sc.scrollTop >= max - 1) { dir = -1; wait = 1400; } else if (sc.scrollTop <= 0) { dir = 1; wait = 1400; }
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    sc.addEventListener('scroll', function () { revealCheck(m); }, { passive: true });
    revealCheck(m);
    // ce qu'on peut toucher
    m.addEventListener('click', function (e) {
      if (!m.classList.contains('is-live')) return;
      var view = m.getAttribute('data-view'), el;
      if ((el = e.target.closest('.mini__pages span'))) {
        $all('.mini__pages span', m).forEach(function (x) { x.classList.toggle('on', x === el); });
        var i = $all('.mini__pages span', m).indexOf(el);
        scrollMiniTo(m, i === 0 ? null : i === 1 ? m.querySelector('.mini__sec.mini__multi') : i === 2 ? m.querySelector('.mini__gal') : m.querySelector('.mini__map'));
        return;
      }
      if ((el = e.target.closest('.mini__days span, .mini__slots span'))) {
        $all('span', el.parentNode).forEach(function (x) { x.classList.toggle('on', x === el); });
        var d = m.querySelector('.mini__days .on'), h = m.querySelector('.mini__slots .on');
        toast(m, 'Réservé · ' + (d ? d.textContent.replace(/(\D+)(\d+)/, '$1 $2') : '') + ' à ' + (h ? h.textContent : '') + ' ✓');
        return;
      }
      if ((el = e.target.closest('.mini__book, .mini__hero i'))) {
        if (view === 'signature') scrollMiniTo(m, m.querySelector('.mini__resa'));
        else { scrollMiniTo(m, m.querySelector('.mini__map')); toast(m, 'Exemple de bouton'); }
        return;
      }
      if ((el = e.target.closest('.mini__call span'))) { toast(m, el.textContent + ' · exemple'); }
    });
  }
  setLive(planMini, true);

  /* ---------- Les vrais sites d'exemple, dans le téléphone des formules ----------
     Ajouter ici les exemples Business et Signature quand ils seront prêts. */
  var DEMOS = { solo: 'demo/cordonnerie/' };
  var site = document.querySelector('.plan-site'), siteScreen = site && site.querySelector('.plan-site__screen');
  var siteFrame = site && site.querySelector('iframe'), siteLink = document.querySelector('.plan-preview__link');
  function fitSite() {
    if (!site || site.hidden) return;
    var w = siteScreen.clientWidth, h = siteScreen.clientHeight;
    if (!w || !h) return;
    var k = w / 390; // le site s'affiche exactement comme sur un vrai iPhone
    siteFrame.style.height = Math.round(h / k) + 'px';
    siteFrame.style.transform = 'scale(' + k + ')';
  }
  if (siteScreen && window.ResizeObserver) new ResizeObserver(fitSite).observe(siteScreen);
  function showSite(key) {
    if (!site) return;
    var url = DEMOS[key];
    site.hidden = !url;
    planMini.style.visibility = url ? 'hidden' : '';
    if (hintEl) hintEl.hidden = !!url;
    if (siteLink) { siteLink.hidden = !url; if (url) siteLink.href = url; }
    if (!url) return;
    if (siteFrame.getAttribute('src') !== url) {
      site.classList.remove('is-loaded');
      siteFrame.onload = function () { site.classList.add('is-loaded'); };
      siteFrame.setAttribute('src', url);
    }
    requestAnimationFrame(fitSite);
  }
  var timers = [], currentRec = 'business';
  function setRecommended(rec) {
    if (rec === currentRec && cards.business.dataset.recSet) return;
    currentRec = rec; cards.business.dataset.recSet = '1';
    ['business', 'signature'].forEach(function (k) {
      var on = k === rec, card = cards[k], badge = card.querySelector('.badge');
      card.classList.toggle('plan--featured', on);
      card.querySelector('.btn').classList.toggle('btn--ghost', !on);
      if (k === 'business') { badge.hidden = !on; badge.textContent = 'Recommandé'; }
      else { badge.textContent = on ? 'Recommandé pour vous' : 'Le plus complet'; badge.classList.toggle('badge--gold', !on); }
    });
    if (state.done) selectPlan(rec, 'force');
  }
  function selectPlan(key, fromUser) {
    if (!PLANS[key]) return;
    if (key === state.plan && fromUser !== 'force') { syncTabs(); return; }
    var prev = state.plan, dir = ORDER.indexOf(key) > ORDER.indexOf(prev) ? 1 : -1;
    state.plan = key;
    if (key !== prev) {
      var incoming = cards[key], outgoing = cards[prev];
      ORDER.forEach(function (k) { if (k !== key && k !== prev) cards[k].classList.remove('is-on', 'to-left', 'to-right', 'from-left', 'from-right'); });
      outgoing.classList.remove('is-on', 'from-left', 'from-right');
      outgoing.classList.add(dir > 0 ? 'to-left' : 'to-right');
      clearTimeout(outgoing._t);
      outgoing._t = setTimeout(function () { if (!outgoing.classList.contains('is-on')) outgoing.classList.remove('to-left', 'to-right'); }, 700);
      // la carte qui revient oublie toute sortie en cours : elle ne peut plus rester bloquée sur le côté
      clearTimeout(incoming._t);
      incoming.classList.remove('to-left', 'to-right');
      incoming.classList.add('no-trans', dir > 0 ? 'from-right' : 'from-left');
      void incoming.offsetWidth;
      incoming.classList.remove('no-trans', 'from-left', 'from-right');
      incoming.classList.add('is-on');
    }
    if (planMini) {
      planMini.setAttribute('data-view', key);
      planMini.querySelector('.mini__scroll').scrollTop = 0;
      revealCheck(planMini);
      if (!reduced) { var d = planMini.closest('.device'); d.classList.remove('flash'); void d.offsetWidth; d.classList.add('flash'); }
    }
    if (planCap) planCap.innerHTML = CAPS[key];
    showSite(key);
    syncTabs();
    updateContact();
  }
  function syncTabs() {
    $all('[data-plan-tab]').forEach(function (t) {
      var on = t.getAttribute('data-plan-tab') === state.plan;
      t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
    });
    var tl = document.querySelector('.tabs'); // la pastille glisse sous l'onglet choisi
    if (tl) tl.style.setProperty('--i', ORDER.indexOf(state.plan));
  }
  $all('[data-plan-tab]').forEach(function (t) { t.addEventListener('click', function () { selectPlan(t.getAttribute('data-plan-tab'), true); }); });
  var tablist = document.querySelector('.tabs[role="tablist"]');
  if (tablist) tablist.addEventListener('keydown', function (e) {
    var i = ORDER.indexOf(state.plan);
    if (e.key === 'ArrowRight' && i < 2) { selectPlan(ORDER[i + 1], true); document.getElementById('t-' + ORDER[i + 1]).focus(); }
    if (e.key === 'ArrowLeft' && i > 0) { selectPlan(ORDER[i - 1], true); document.getElementById('t-' + ORDER[i - 1]).focus(); }
  });
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
    var box = document.querySelector('.contact__plan'); if (!box) return;
    var name = state.name.trim();
    box.hidden = false;
    box.innerHTML = 'Formule choisie&nbsp;: <strong>' + PLANS[state.plan] + '</strong>' + (name ? ' pour <strong>' + esc(name) + '</strong>' : '');
  }
  function updateContact() {
    var C = window.ASTELSIA_CONTACT || {};
    if (!C.email) return;
    var name = state.name.trim(), t = template(), what = [];
    if (state.job.trim()) what.push(t.label.toLowerCase());
    if (state.step >= 3 || state.done) what.push('style ' + STYLES[state.style]);
    var subject = 'Mon site Astelsia' + (name ? ' — ' + name : '');
    var body = 'Bonjour,\n\nJe souhaite un site pour ' + (name || 'mon commerce') + (what.length ? ' (' + what.join(', ') + ')' : '') + '.\n'
      + 'Formule : ' + PLANS[state.plan] + '.\n\nMon numéro : \n\nMerci !';
    $all('[data-contact="email"]').forEach(function (a) {
      a.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });

    // le rappel : un SMS sur téléphone, un mail sur ordinateur, déjà rédigés avec le moment choisi
    var send = document.querySelector('[data-rappel]'), note = document.querySelector('[data-rappel-note]');
    if (send) {
      var who = name ? 'le site de ' + name + (state.job.trim() ? ' (' + t.label.toLowerCase() + ')' : '') : 'mon site';
      var msg = 'Bonjour, pouvez-vous me rappeler ' + moment + ' ? C’est pour ' + who + (chosen ? ', formule ' + PLANS[state.plan] : '') + '. Merci !';
      if (touchDevice && C.phone) {
        send.href = 'sms:+33' + C.phone.replace(/\D/g, '').replace(/^0/, '') + '?&body=' + encodeURIComponent(msg);
        if (note) note.textContent = 'Le message est déjà rédigé : il part de votre téléphone. Je vous rappelle dès que possible.';
      } else {
        send.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Être rappelé' + (name ? ' — ' + name : '')) + '&body=' + encodeURIComponent(msg + '\n\nMon numéro : ');
        if (note) note.textContent = 'Le mail est déjà rédigé : ajoutez simplement votre numéro. Je vous rappelle dès que possible.';
      }
    }
    if (chosen) showChoice();
  }

  /* ---------- « Être rappelé » : on choisit un moment, rien d'autre à faire ---------- */
  var callBtn = document.querySelector('.way--call'), rappel = document.getElementById('rappel'), moment = 'le midi';
  var touchDevice = matchMedia('(hover: none), (pointer: coarse)').matches;
  if (callBtn && rappel) {
    callBtn.addEventListener('click', function () {
      var open = rappel.hidden;
      rappel.hidden = !open;
      callBtn.setAttribute('aria-expanded', String(open));
      if (open) {
        updateContact();
        if (!reduced) { rappel.classList.remove('is-open'); void rappel.offsetWidth; rappel.classList.add('is-open'); }
      }
    });
    $all('[data-moment]', rappel).forEach(function (b) {
      b.addEventListener('click', function () {
        moment = b.getAttribute('data-moment');
        $all('[data-moment]', rappel).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        updateContact();
      });
    });
  }

  /* ---------- Lien personnalisé (démarchage) ---------- */
  var q = new URLSearchParams(location.search);
  var OLD = { dore: 30, rose: 350, sauge: 130, nuit: 230 };
  var qName = (q.get('nom') || '').slice(0, 32), qJob = (q.get('type') || q.get('metier') || '').slice(0, 40);
  var qHue = q.get('couleur'), qAmb = (q.get('ambiance') || '').toLowerCase(), qStyle = (q.get('style') || '').toLowerCase();
  if (qName) { state.name = qName; nameInput.value = qName; }
  if (qJob) { state.job = qJob; jobInput.value = qJob; }
  if (qHue !== null && !isNaN(+qHue)) state.hue = ((+qHue % 360) + 360) % 360;
  else if (OLD[qAmb] !== undefined) state.hue = OLD[qAmb];
  if (STYLES[qStyle]) state.style = qStyle;
  if (state.hue !== null && hueInput) hueInput.value = state.hue;

  render();
  selectPlan(currentRec, 'force');
  go(qName ? 4 : 1);
  if (qName) setTimeout(function () { setBuilding(true); }, 0);

  window.AstelsiaBuilder = { state: state, selectPlan: selectPlan, findJob: findJob };
})();
