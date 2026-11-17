# Astelsia — site vitrine

Sites web pour les commerces de proximité. En ligne sur https://astelsia.fr (GitHub Pages, branche `main`, fichier `CNAME`).

Le concept : on part des étoiles et, en descendant, on arrive dans un paysage à l'heure bleue
(grand chêne, balançoire, herbes roses, lucioles). Chaque étape du scroll s'anime un peu plus.

## Le créateur de site (page d'accueil)
1. Le visiteur tape le **nom** de son commerce.
2. Il tape son **métier**, en toutes lettres (une centaine reconnus : fleuriste, ostéopathe, tatoueur…).
   Un métier inconnu fonctionne aussi : le site reprend son mot.
3. Il choisit **n'importe quelle couleur**, un **style** (élégant, moderne, chaleureux),
   et **touche les textes de l'iPhone pour les réécrire**.

Ensuite, la bande-annonce s'adresse à lui par son nom, les formules lui donnent un conseil
selon son métier, et son iPhone montre son site en version Solo, Business ou Signature.
Le mail de contact est déjà rédigé.

**Lien personnalisé pour le démarchage** : envoyez par SMS ou par mail un lien comme
`https://astelsia.fr/?nom=Le%20Fournil&type=boulangerie`
Le commerçant ouvre le site et voit son propre site déjà créé, avec son nom.
- `nom` : le nom du commerce (`%20` = espace)
- `type` : le métier, en toutes lettres (ex. `fleuriste`, `garage`, `osteopathe`)
- `couleur` (facultatif) : une teinte de 0 à 359 (0 rouge, 30 orange, 130 vert, 210 bleu, 330 rose)
- `style` (facultatif) : `elegant`, `moderne` ou `chaleureux`

Les métiers reconnus et leurs textes sont dans `assets/js/builder.js` (liste `JOBS`).

## Les petits secrets à toucher (formule Signature, `assets/js/fx.js`)
- **Les étoiles dorées** : on les touche, elles tournent, rebondissent et jettent des étincelles.
  Cinq étoiles touchées : une pluie d'étoiles filantes.
- **Le ciel** : un doigt posé dans le ciel lance une étoile filante (« Faites un vœu ✦ »).
- **La lune** vacille, **la balançoire** part quand on la pousse, **l'herbe** laisse s'envoler des lucioles.
- À la souris : une poussière d'étoile suit le pointeur.
- Mode doux (moins d'animations demandé par l'appareil) : tout devient fondu, rien ne file.

## Le contact
Téléphone, mail pré-rempli, et **« Être rappelé »** : on choisit un moment (matin, midi, après-midi, soirée),
le message est déjà rédigé (SMS sur téléphone, mail sur ordinateur). Aucun serveur, aucune donnée stockée.

## Sites d'exemple (`demo/`)
Des sites de commerces **fictifs**, clairement marqués « site d'exemple », pour montrer chaque formule :
- **Solo** — cordonnerie « Talon & Clé » : `https://astelsia.fr/demo/cordonnerie/`
- **Business** — bistrot « L'Ardoise » (4 pages : accueil, carte, photos, infos) : `https://astelsia.fr/demo/restaurant/`
- **Signature** — boulangerie « Aube » (le jour se lève au scroll, commande en ligne avec retrait) : `https://astelsia.fr/demo/boulangerie/`

Ils s'affichent en direct dans l'iPhone des formules (onglets Solo / Business / Signature, liste `DEMOS` dans `assets/js/builder.js`).
Photos des exemples : Pexels (libres de droits, usage commercial autorisé).

Les numéros affichés sont réservés à la fiction (02 61 91 xx xx) ; les boutons « Appeler » et « Itinéraire »
affichent un petit message au lieu d'appeler. Les pages d'exemple ne sont pas indexées par Google (`noindex`).

## Modifier les coordonnées
Un seul fichier : `assets/js/config.js` (téléphone et mail).
Les mentions légales sont à compléter dans `mentions-legales.html` (champs surlignés).

## Voir le site en local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000

## Organisation
- `index.html` — la page
- `assets/css/style.css` — styles (mobile d'abord)
- `assets/js/main.js` — animations (GSAP, ScrollTrigger, SplitText, Lenis)
- `assets/js/builder.js` — le créateur de site, les formules à onglets, le mail pré-rempli
- `assets/js/scene.js` — étoiles, chargement du paysage, balançoire (vrai pendule), lune
- `assets/js/fx.js` — étincelles, étoiles filantes, lucioles : tout ce qui se touche
- `assets/js/stars3d.js` — les 3 étoiles dorées en 3D (WebGL fait maison), qu'on peut toucher
- `assets/scene/` — paysage peint en calques WebP (cadrage large + cadrage téléphone)
- `assets/fonts/` — Fraunces et Manrope, hébergées sur le site (licence SIL OFL)
- `assets/vendor/` — GSAP 3.15 et Lenis 1.3
- `tools/landscape/` — le « peintre » qui génère le paysage
  (`node tools/landscape/render.js tools/landscape assets/scene`, nécessite Playwright)

Aucun cookie, aucune requête vers un service tiers. Respecte `prefers-reduced-motion`.
