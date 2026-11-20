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

### Mail validé, version « sans site » (v1)
Objet : On a imaginé le site de [Nom]
> Bonjour,
> Nous sommes Astelsia, une petite équipe qui crée des sites pour les commerces. On s'est amusés à imaginer celui de [Nom], le voici :
> [image]
> Il vous plaît ? Répondez « oui » et on vous prépare la vraie version, avec vos photos et votre carte. C'est gratuit et sans engagement.
> L'équipe Astelsia
> Pas intéressé ? Répondez « non merci ».

### Mail validé, version « a déjà un site » (v1-site)
Objet : On a imaginé un nouveau site pour [Nom]
Même texte, avec : « On est passés sur le site de [Nom], et on s'est amusés à imaginer à quoi pourrait ressembler une nouvelle version : » et « Elle vous plaît ? ».

### Tests (comme TikTok)
- Une seule chose change à la fois : objet, première phrase, image, heure d'envoi.
- Au moins 10 envois par version avant de conclure. Le seul chiffre qui compte : le taux de réponse.
- Noter la version dans la colonne « Version du mail » du tableau.
- Prochain test prévu : objet « On a imaginé le site de X » contre « X, en version site » ; puis envoi vers 10 h contre vers 15 h.

## Maquettes pour les mails

- Générateur : `tools/maquette-resto/` (`site.html` + `palettes.json` + `render3.js` + `compose.py`). Une seule mise en page pour tous ; on change le nom, l'adresse, la photo et la palette.
- 5 palettes : Or, Terracotta, Vert, Rouge, Bleu.
- Image du mail : version PC et version téléphone côte à côte, **fond beige** (pas de blanc vide), pas de faux iPhone.
- **Leçon Au Buron (20/11)** : on a mis une fondue pour un restaurant auvergnat qui sert de l'aligot ; il a refusé. Règle : **photo du bon plat, sinon photo d'ambiance** (salle, table, terrasse). Pour une cuisine précise, utiliser leurs propres photos (captures Facebook envoyées par le gérant).
- Photos libres : Pexels (usage commercial autorisé) ; les télécharger depuis images.pexels.com.

## Astuces de fin de message

Le gérant veut, à la fin de chaque message, une courte astuce comme sur un écran de chargement de jeu vidéo :
- sur tout ce qui peut aider son activité (vente, outils, admin, réseaux, IA, organisation), de préférence astucieuse et peu connue ;
- **jamais deux fois la même**, pas forcément liée au message ;
- déjà données : lire Gmail pour résumer les réponses ; registre des entreprises pour trouver les commerces tout juste créés ; programmer l'envoi le mardi ou jeudi 9-10 h ; éviter « gratuit » dans l'objet ; une seule question fermée ; devis PDF le jour même ; posts Google Business Profile ; kit de marque ; compte Google au nom d'Astelsia ; captures d'outils avant de cliquer ; regarder « sous le capot » ; fiche de préparation d'appel ; garder les refus ; créneau 14 h 30-17 h des restaurateurs ; icône du tableau sur l'écran d'accueil.
