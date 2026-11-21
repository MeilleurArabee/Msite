# Astelsia : mémoire de travail

Ce fichier est relu automatiquement au début de chaque session. Il garde les règles et les leçons, pour qu'elles survivent à la fin d'une conversation. Mets-le à jour dès qu'une nouvelle règle est décidée.

## Qui, quoi

- Astelsia crée des sites pour les commerces (formules Solo 249,90 €, Business 649,90 €, Signature 1 349,90 €). Le gérant vend, Claude construit et s'occupe de la prospection.
- Réponds en français, avec le tutoiement, simplement et sans jargon.
- Suivi de la prospection : tableau « Sheets » https://claude.ai/artifact/BDdVAyJtGw8RtazCmjywsy (onglet Commerces : statut, date, version du mail, notes).

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
- Pas de prénom (signer « L'équipe Astelsia »), pas de numéro de téléphone, parler au pluriel (« nous », « on »).
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
- Photos libres : Pexels (usage commercial autorisé) ; les télécharger depuis images.pexels.com.

## Astuces de fin de message

Le gérant veut, à la fin de chaque message, une courte astuce comme sur un écran de chargement de jeu vidéo :
- sur tout ce qui peut aider son activité (vente, outils, admin, réseaux, IA, organisation), de préférence astucieuse et peu connue ;
- **jamais deux fois la même**, pas forcément liée au message ;
- déjà données : lire Gmail pour résumer les réponses ; registre des entreprises pour trouver les commerces tout juste créés ; programmer l'envoi le mardi ou jeudi 9-10 h ; éviter « gratuit » dans l'objet ; une seule question fermée ; devis PDF le jour même ; posts Google Business Profile ; kit de marque ; compte Google au nom d'Astelsia ; captures d'outils avant de cliquer ; regarder « sous le capot » ; fiche de préparation d'appel ; garder les refus ; créneau 14 h 30-17 h des restaurateurs ; icône du tableau sur l'écran d'accueil.

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
