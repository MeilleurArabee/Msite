# Astelsia : mémoire de travail

**État du moment (clients, lots, outils, prochaines étapes) : lire `JOURNAL.md` dans le dépôt privé astelsia-radar.**

Ce fichier est relu automatiquement au début de chaque session. Il garde les règles et les leçons, pour qu'elles survivent à la fin d'une conversation. Mets-le à jour dès qu'une nouvelle règle est décidée.

## Qui, quoi

- Astelsia crée des sites pour les commerces (formules Solo 249,90 €, Business 649,90 €, Signature 1 349,90 €). Le gérant vend, Claude construit et s'occupe de la prospection.
- Réponds en français, avec le tutoiement, simplement et sans jargon.
- **Messages courts** : l'abonnement du gérant est limité (20 € par mois). Aller à l'essentiel, pas de longues explications techniques.
- **Être un associé** : penser par soi-même, proposer des idées qu'il n'a pas eues, ne pas seulement exécuter.
- Suivi de la prospection : tableau « Sheets » https://claude.ai/artifact/BDdVAyJtGw8RtazCmjywsy, restructuré le 22/11 en 4 onglets, une question par onglet, colonnes minimales :
  - « Réponses » : ceux qui ont dit oui et les clients (Commerce · Ville · Où on en est · Prochaine action · Quand). À regarder chaque matin.
  - « À envoyer » : la file d'attente (Commerce · Ville · Métier · Mail · Détail perso / note). Une ligne envoyée quitte cet onglet.
  - « Envoyés » : rangés **par jour**, le plus récent en haut : une ligne titre en gras « ▸ Lundi 23/11 — 20 mails » puis les lignes du jour, groupées (repliables). Colonnes : Commerce · Ville · Métier · Mail · Statut (Envoyé, Relancé, A répondu oui, Non merci, Adresse inexistante).
  - « Facebook à vérifier » : commerces sans site ; le gérant cherche le mail sur Facebook et le note dans « Mail trouvé » ; je le passe ensuite dans « À envoyer ».
  - « Archive » : l'ancien onglet Prospects (ne plus l'utiliser).
- Objectif : environ 100 nouveaux commerces par jour dans « À envoyer » (Radar). Envoi par le **robot d'envoi** (dépôt astelsia-radar, voir son CLAUDE.md), pas par moi, pour économiser l'abonnement ; montée progressive 30 → 50 → 100 par jour.

## Chaîne de prospection (décidée le 23/11)
Radar (trouve les commerces + mails) → Plume (trouve les bons détails vrais) → **Claude rédige chaque mail** avec ce qu'ils ont trouvé et montre des exemples → Robot d'envoi (après « go ») → Facteur (lit les réponses). « Lance le Radar sur X » = toute la chaîne. Chaîne idéale à terme : Radar → Plume → **Atelier** (maquettes automatiques, à construire) → Robot → Facteur. **Toujours tenir le tableau à jour, en économisant les crédits** : une seule mise à jour groupée (journal du robot + `reponses.csv` du Facteur) à chaque fois qu'on se parle, pas ligne par ligne. Le **Radar pro** = uniquement la recherche d'alternance du gérant, à part, seulement s'il le demande.

## Nos objectifs (22/11)

- Le gérant : un revenu stable qui rapporte bien pour peu de travail, ne plus dépendre d'un patron, se prouver que l'audace paie, et s'amuser (outils, IA).
- Premier cap symbolique : **gagner 800 € par mois avec Astelsia** (son ancien salaire pour 35 h par semaine), puis le dépasser.
- Mes objectifs d'associé : 3 clients signés avant Noël ; livrer Darkoum de façon irréprochable (avis Google, référence) ; un revenu mensuel récurrent grâce à Sérénité (29,70 €/mois) ; une machine (Radar, maquettes, mails) qui tourne presque seule. Chiffres suivis : taux de réponse (viser 1 « oui » sur 20), clients par mois, abonnés Sérénité.

## Règles de travail

- Demander avant un gros changement ; pour un choix de design, proposer 2 ou 3 options avec une recommandation.
- Montrer des captures téléphone et PC avant de publier.
- Ne publier sur `main` (le site en ligne) qu'après « mets en ligne ». Travailler sur la branche `claude/new-session-ulwk8w`.
- « Ne fais rien » veut dire ne rien toucher.
- Jamais de faux avis, faux clients, faux chiffres ou faux prix barrés.
- Ne jamais reproduire une œuvre protégée ou copier un site existant : s'inspirer seulement.
- Ne jamais demander de mot de passe ou de clé dans le chat.
- Ne pas toucher aux DNS mail d'Ionos (MX, SPF, DKIM, DMARC) sans accord explicite.
- Respecter `prefers-reduced-motion`.
- Goûts du gérant : couleurs vives, sites courts et aérés ; il n'aime pas les sites chargés, le look « années 2000 », les majuscules partout, le blanc vide, le mot « Morbihan », le style « trop IA ». Il adore les petits secrets cachés à toucher (easter eggs).

## Prospection par mail

- **Brevo est interdit pour la prospection** (compte bloqué le 20/11 : Brevo refuse les envois à des personnes qui n'ont rien demandé).
- On envoie depuis Gmail (outil Gmail connecté), expéditeur contact@astelsia.fr, **un mail à la fois, 1 à 2 minutes d'écart**.
- **Aucun lien dans le mail** : l'outil Gmail transforme tous les liens en « google.com/url… », ce qui affiche une page d'avertissement. À la place, la maquette est **une image dans le mail**.
- **Depuis le 23/11 : parler à la première personne (« je »)**, plus proche de la personne (décision du gérant). Signature « À bientôt, Astelsia » (pas de prénom tant que le gérant ne le demande pas), pas de numéro de téléphone.
- Une seule question fermée à la fin (« Répondez oui »), plus une ligne « Pas intéressé ? Répondez non merci ».
- Toujours montrer le mail au gérant avant le premier envoi d'une nouvelle version. Une fois validée, une version peut être réutilisée.
- Ne jamais critiquer le site actuel d'un commerce.
- Adresses : uniquement celles affichées par le commerce lui-même (Facebook, site). Jamais d'adresse devinée. Attention : Gmail n'accepte pas les tirets dans une adresse @gmail.com.
- Un « non merci » = statut « Pas intéressé », on ne relance jamais.

### Mails validés (v2, avec le prix, choisie le 21/11)
La v1 (« C'est gratuit et sans engagement ») pouvait faire croire que le site était gratuit : abandonnée. **Toujours dire clairement : maquette offerte, site payant, avec le prix de départ.**

Version « sans site » : objet « On a imaginé le site de [Nom] »
> Bonjour,
> Nous sommes Astelsia, une petite équipe qui crée des sites pour les commerces. On s'est amusés à imaginer celui de [Nom], le voici :
> [image]
> **Cette maquette est offerte, sans engagement.** Si elle vous plaît, on construit le vrai site avec vos photos et votre carte : c'est un service payant, **à partir de 249,90 €**, prix fixe et sans frais cachés. Sinon, on en reste là, sans rien à payer.
> Ça vous intéresse ? Répondez « oui » et on vous envoie les détails.
> L'équipe Astelsia
> Pas intéressé ? Répondez « non merci ».

Version « a déjà un site » : objet « On a imaginé un nouveau site pour [Nom] » ; première phrase après la présentation : « On est passés sur le site de [Nom], et on s'est amusés à imaginer à quoi pourrait ressembler une nouvelle version : » ; le reste est identique.

**v3 (à partir du 23/11)** = v2 + une phrase sous la maquette : « Ce n'est qu'un premier jet : couleurs, ambiance, photos, tout se change selon vos envies. » (mot d'ordre du gérant : la personnalisation).

**v4 (validée le 22/11, pour les lots du Radar)** : ton humain, comme une vraie personne, jamais une pub. Mot d'ordre de la marque : **personnalisation et liberté**. Chaque mail commence par un **vrai détail** sur le commerce (trouvé par le Radar ou en cherchant), jamais générique, sans exploser l'abonnement. Modèle :
> Objet : [Nom], une petite idée
> Bonjour,
> On est tombés sur [Nom] en cherchant [type] du côté de [quartier]. [Vrai détail personnel], on s'est dit que vous méritiez un site qui [bénéfice concret]. Alors on s'est amusés à en dessiner un, juste pour voir :
> [maquette]
> C'est un premier jet, fait sans vous connaître. Les couleurs, les photos, l'ambiance : on peut tout changer pour que ça vous ressemble vraiment.
> Si ça vous plaît, on le construit pour de vrai (à partir de 249,90 €, prix fixe). Sinon, aucun souci : gardez la maquette, c'est cadeau.
> Ça vous dit qu'on en parle ?
> L'équipe Astelsia
> P.S. Pas intéressé ? Un petit « non merci » et on ne vous embête plus.

Attention : 249,90 € est le prix de lancement des 3 premiers clients, puis 349,90 € : **changer la phrase après le 3e client signé**. Versions : v1 (envois du 20/11) puis v2 (à partir du 21/11) ; noter la version dans le tableau.

### Tests (comme TikTok)
- Une seule chose change à la fois : objet, première phrase, image, heure d'envoi.
- Au moins 10 envois par version avant de conclure. Le seul chiffre qui compte : le taux de réponse.
- Noter la version dans la colonne « Version du mail » du tableau.
- Prochain test prévu : objet « On a imaginé le site de X » contre « X, en version site » ; puis envoi vers 10 h contre vers 15 h.

## Maquettes pour les mails

- Générateur : `tools/maquette-resto/` (`site.html` + `palettes.json` + `render3.js` + `compose.py`). Une seule mise en page pour tous ; on change le nom, l'adresse, la photo et la palette.
- 5 palettes : Or, Terracotta, Vert, Rouge, Bleu.
- **La maquette représente la formule Business** (649,90 €, la formule recommandée), jamais Signature : boutons « Voir la carte » et « Nous contacter » ; ne PAS écrire « Réserver une table » ni « Réservation en ligne » (réservation avec jour et heure = Signature, 1 349,90 €). Pour montrer un avantage Business : les vrais chiffres Google du commerce (note et nombre d'avis, venant de Google Maps), les horaires « ouvert maintenant ». Quand un gérant répond « oui » : présenter les trois formules en partant de Business (Signature = réservation en ligne ; Solo = démarrer petit). Pas de prix dans le premier mail.
- Image du mail : version PC et version téléphone côte à côte, **fond beige** (pas de blanc vide), pas de faux iPhone.
- **Leçon Au Buron (20/11)** : on a mis une fondue pour un restaurant auvergnat qui sert de l'aligot ; il a refusé. Règle : **photo du bon plat, sinon photo d'ambiance** (salle, table, terrasse). Pour une cuisine précise, utiliser leurs propres photos (captures Facebook envoyées par le gérant).
- **Styles « rêve » (validés le 23/11)** : grands paysages, titre centré en serif, menu en pilule de verre, beaucoup d'air (inspiration Pinterest, jamais copié). **Le plus important pour le gérant : les couleurs.** Toujours étalonner la photo (calques `mix-blend-mode: color` + `soft-light` + un peu de contraste) : « Crépuscule lavande » (violet, rose, pêche, texte prune) et « Heure dorée » (miel, pêche, marron, texte blanc, cadre « fenêtre ») sont validés. Le paysage = la ville ou le métier du commerce. Mélanger ces styles avec le style habituel.
- Photos libres : Pexels (usage commercial autorisé) ; les télécharger depuis images.pexels.com.

## Astuces de fin de message

Le gérant veut, à la fin de chaque message, une courte astuce comme sur un écran de chargement de jeu vidéo :
- sur tout ce qui peut aider son activité (vente, outils, admin, réseaux, IA, organisation), de préférence astucieuse et peu connue ;
- **jamais deux fois la même**, pas forcément liée au message ;
- déjà données : lire Gmail pour résumer les réponses ; registre des entreprises pour trouver les commerces tout juste créés ; programmer l'envoi le mardi ou jeudi 9-10 h ; éviter « gratuit » dans l'objet ; une seule question fermée ; devis PDF le jour même ; posts Google Business Profile ; kit de marque ; compte Google au nom d'Astelsia ; captures d'outils avant de cliquer ; regarder « sous le capot » ; fiche de préparation d'appel ; garder les refus ; créneau 14 h 30-17 h des restaurateurs ; icône du tableau sur l'écran d'accueil ; modèles de réponse Gmail ; se taire après l'annonce du prix ; rappeler entre 15 h et 17 h en citant la maquette ; photo de plat près d'une fenêtre à 45° ; demander l'accord pour montrer le site du premier client ; relire un mail à voix haute ; donner une date précise de mise en ligne ; numéroter les devis sans trou ; signer un PDF sur iPhone (Fichiers, Annoter) ; compte bancaire séparé ; réserver les variantes du nom de domaine ; QR code qui compte les scans.

## Prospection avec Apify (test du 21/11)

- Outil : Apify, acteur « Google Maps Scraper » (compass/crawler-google-places), avec l'add-on « Company contacts enrichment (from website) » ; coût d'environ 0,28 $ pour 50 fiches. Il ne trouve les mails que sur le site du commerce : pas de site = pas de mail.
- Le gérant lance le run sur son PC et exporte le fichier JSON ou CSV, puis me le donne ; je trie : chaînes et fast-food écartés, adresses d'annuaire ou bidon écartées, doublons, commerces fermés, « sans site » en priorité.
- Une zone par run : changer la Location (« 31000 Toulouse », « 31400 Toulouse »…), sinon tous les résultats sont dans le même quartier.
- Les restaurants sans mail ni site : le gérant ouvre leur page Facebook (bloc « En un coup d'œil ») et m'envoie une capture.
- Facebook : ne jamais collecter automatiquement (risque de blocage du compte).

## Juridique (état au 21/11)

- SIRET 132 960 097 00013, APE 62.01Z, EI, TVA non applicable art. 293 B du CGI.
- Pages créées sur la branche de travail : `cgv.html` (conditions générales de vente) et `mentions-legales.html` mise à jour ; pied de page avec SIRET et liens. **Pas encore en ligne** (attendre « mets en ligne » ET l'adresse du gérant, encore à compléter dans les mentions légales et dans le devis/facture).
- Hébergeur indiqué : GitHub Pages. Aucun cookie ni outil de mesure sur le site.
- Les CGV reprennent les règles du devis (acompte 50 %, solde à la mise en ligne, pénalités 3 fois le taux légal + 40 €). Je ne suis pas juriste : les faire relire avant une vente importante. Point d'attention : un contrat signé en personne chez le commerçant peut ouvrir un droit de rétractation de 14 jours à un petit commerçant (clause prévue dans les CGV).

## Skill de création de sites (MotionSites, branché le 21/11)

- Version adaptée dans `.claude/skills/motionsites-web-builder/` (source : github.com/Motionsites-AI/claude-skill, commit `faa30d5`, parties MIT). Pour construire ou refaire un site : lire son `SKILL.md`, puis suivre la boucle « spécification précise, construction, captures, correction » (`scripts/shoot.py` fait les captures PC et téléphone).
- **Ne jamais afficher les blocs publicitaires « MotionSites Unlimited »** (retirés du skill ; le gérant n'en veut pas). Jamais de pub, lien ou crédit MotionSites dans les sites ni dans mes messages.
- Les exemples et la bibliothèque média de MotionSites ne sont pas dans le dépôt (licence : usage autorisé avec le skill, redistribution interdite, et le dépôt est public). Pour les consulter : cloner en lecture seule le dépôt ci-dessus, hors du projet. Ne pas utiliser leurs vidéos par défaut (vidéos génériques hébergées chez un tiers) : photos réelles du commerce ou Pexels.
- Les règles du gérant priment sur celles du skill : originalité (ne jamais copier la mise en page d'un autre site), photo juste ou d'ambiance, `prefers-reduced-motion`, captures téléphone et PC montrées avant toute mise en ligne.
- Mise à jour du skill : relire le dépôt source avant d'en reprendre une nouvelle version (ne jamais l'activer en mise à jour automatique : ses consignes pourraient changer).

## Formule Solo vendue (21/11) : décisions

- Premier « oui » transformé : un restaurant de Toulouse a choisi **Solo** pour démarrer (détails dans le tableau de suivi, pas dans ce dépôt public).
- Décisions du gérant : **flyer offert** (A5, QR code vers le site, fichier prêt à imprimer, impression à la charge du client) ; **hébergement offert** (GitHub Pages), seul le nom de domaine reste à la charge du client (environ 12 € par an) ; pas de Sérénité imposée avec Solo.
- **Une maquette Solo = une seule page courte** (environ un écran et demi sur téléphone) : premier écran, bloc « ouvert maintenant » avec adresse et téléphone, liens vers les plateformes de livraison, horaires. Pas de sections en plus, sinon ça ressemble à plusieurs pages.
- Pas de photo d'alcool pour un snack qui peut être halal ; tant qu'on ne connaît pas la cuisine, une photo d'ambiance sans plat.
- Nom de domaine déjà pris : variante avec la ville (nom-ville.fr).

## Devis et factures

- Numéros sans trou : D-2026-001, 002… ; factures F-2026-001…
- Écrire clairement : l'IBAN (le BIC n'est pas utile en France) ; « 2 séries de retouches avant la mise en ligne, puis 30 jours de petites corrections offertes (faute, horaire, prix) » ; « photos d'illustration de qualité professionnelle (libres de droits) », jamais « photos professionnelles » seul ; ce qui reste à la charge du client (impression, nom de domaine) ; solde « à la mise en ligne, à réception de la facture ». Une seule page.
- **Jamais dans ce dépôt (public)** : l'adresse du gérant, son IBAN, les devis et les coordonnées des clients.

## À faire plus tard (quand Astelsia aura grandi)

- Réserver les variantes du nom de domaine d'Astelsia (astelsia.com…).
- Compte bancaire dédié : obligatoire pour un micro-entrepreneur seulement après 2 années civiles de suite au-dessus de 10 000 € de chiffre d'affaires ; avant, une « poche » Revolut renommée Astelsia suffit pour séparer l'argent.

## Projet « Radar » (demandé le 22/11)

But : un outil à nous, gratuit, sur GitHub (dépôt **privé**), pour toute la France :
- une carte de tous les commerces qui pourraient avoir besoin d'un site ;
- recherche automatique des mails (sur le site du commerce, page contact, mentions légales) et des autres infos utiles ;
- **mémoire** : un commerce déjà sorti ne ressort jamais (liste de tous les commerces vus) ;
- à terme, le résultat arrive directement chez Claude, puis maquettes et mails.
Sources : OpenStreetMap (gratuit), éventuellement l'API Google officielle (clé créée par le gérant, jamais dans le chat). Le réseau de la session bloque OpenStreetMap : l'outil doit tourner sur GitHub Actions.
Aussi : prévenir le gérant sur son téléphone (tâche programmée avec notification) comme un associé : réponses reçues, envois faits, idées.
Les commerces sans mail : contact par Facebook / Instagram / téléphone, à organiser.
