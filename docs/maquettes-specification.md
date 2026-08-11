# Spécification des maquettes

Plan de construction des maquettes Figma. Chaque élément est justifié par une citation du cahier des charges : rien n'est ajouté par interprétation.

## Formats à produire

Le cahier des charges impose de « réaliser les maquettes pour tous les supports (mobile, tablette et ordinateur) ».

| Support | Largeur de frame | Référence |
|---|---|---|
| Mobile | 390 px | iPhone 14 |
| Tablette | 768 px | iPad mini |
| Ordinateur | 1440 px | Desktop standard |

**5 écrans × 3 supports = 15 frames.**

## Styles communs

### Couleurs (imposées, partie 4.4 du cahier des charges)

| Nom du style Figma | Valeur | Usage |
|---|---|---|
| `fond/clair` | `#f1f8fc` | Fonds de section |
| `bleu/principal` | `#0074c7` | Boutons, liens, éléments actifs |
| `bleu/fonce` | `#00497c` | Titres, survols |
| `texte/anthracite` | `#384050` | Texte courant, pied de page |
| `alerte/rouge` | `#cd2c2e` | Erreurs, champs obligatoires |
| `validation/vert` | `#82b864` | Badge artisan du mois |
| `neutre/blanc` | `#ffffff` | Fond des cartes |
| `neutre/bordure` | `#d9e4ec` | Bordures, séparateurs |

### Typographie

« La région utilise la police "Graphik" pour tous ses supports. » Graphik étant sous licence commerciale, la charte de la Région prévoit **Arial** en substitution. Les maquettes utilisent Arial, comme le site.

| Style | Taille mobile | Taille ordinateur | Graisse |
|---|---|---|---|
| Titre H1 | 28 px | 36 px | Bold |
| Titre H2 | 22 px | 28 px | Bold |
| Titre H3 | 18 px | 18 px | Bold |
| Corps | 16 px | 16 px | Regular |
| Petit texte | 14 px | 14 px | Regular |

### Logo et favicon

Ceux fournis dans le cahier des charges, disponibles dans `docs/assets/`.

---

## Écran 1 : Page d'accueil

### En-tête, présent à l'identique sur les 5 écrans

> « Le header est présent et identique sur toutes les pages »
> « Le logo avec un lien qui ramène vers la page d'accueil »
> « Un menu avec des liens vers les pages "Bâtiment", "Services", "Fabrication" et "Alimentation" »
> « Une barre de recherche qui devra faire ressortir les artisans en cherchant sur les noms des artisans »

- Logo à gauche, cliquable vers l'accueil.
- Menu : **Bâtiment, Services, Fabrication, Alimentation**, dans cet ordre (celui des identifiants en base).
- Champ de recherche avec l'invite « Rechercher un artisan » et un bouton « Rechercher ».
- Sur mobile : menu replié derrière un bouton, à montrer dans les deux états (fermé et déplié).

### Corps de la page

> « L'explication étape par étape du fonctionnement du site »
> « Vous nommerez cette rubrique "Comment trouver mon artisan ?" »
> « le numéro et le texte de chaque étape devra obligatoirement apparaitre »

Titre de section exact : **Comment trouver mon artisan ?**

Les quatre étapes, numéro **et** texte repris à l'identique :

| N° | Texte exact |
|---|---|
| 1 | Choisir la catégorie d'artisanat dans le menu. |
| 2 | Choisir un artisan. |
| 3 | Le contacter via le formulaire de contact. |
| 4 | Une réponse sera apportée sous 48h. |

> « Les trois artisans du mois, avec pour chacun : Le nom de l'artisan ou de l'entreprise, Sa note sur cinq avec des étoiles, Sa spécialité, Sa localisation. »

Les trois artisans marqués « Top » dans le fichier client, avec leurs données réelles :

| Nom | Note | Spécialité | Localisation |
|---|---|---|---|
| Orville Salmons | 5,0 | Chauffagiste | Evian |
| Chocolaterie Labbé | 4,9 | Chocolatier | Lyon |
| Au pain chaud | 4,8 | Boulanger | Montélimar |

Les étoiles sont dessinées, et la note est écrite en chiffres à côté (ne jamais reposer sur la seule forme visuelle).

### Pied de page, présent à l'identique sur les 5 écrans

> « Le footer est présent et identique sur toutes les pages »
> « Un menu pour les pages légales (mentions légales, données personnelles, accessibilité, cookies) »
> « L'adresse et les contacts de l'antenne à Lyon »

- Liens : **Mentions légales, Données personnelles, Accessibilité, Cookies**.
- Adresse reprise mot pour mot :

```
101 cours Charlemagne
CS 20033
69269 LYON CEDEX 02
France
+33 (0)4 26 73 40 00
```

### Répartition selon le support

| Support | Étapes | Artisans du mois |
|---|---|---|
| Mobile | 1 colonne | 1 carte par ligne |
| Tablette | 2 colonnes | 2 cartes par ligne |
| Ordinateur | 4 colonnes | 3 cartes par ligne |

---

## Écran 2 : Liste des artisans d'une catégorie

> « 1 page avec la liste des artisans selon la catégorie/recherche »
> « Une petite fiche (card) pour chaque artisan, contenant : Le nom de l'artisan ou de l'entreprise, Sa note sur cinq avec des étoiles, Sa spécialité, Sa localisation. »
> « Chaque fiche doit être cliquable et renvoyer vars la fiche complète de l'artisan. »

Catégorie retenue pour la maquette : **Bâtiment**, avec ses quatre artisans réels.

| Nom | Note | Spécialité | Localisation |
|---|---|---|---|
| Orville Salmons | 5,0 | Chauffagiste | Evian |
| Boutot & fils | 4,7 | Menuisier | Bourg-en-Bresse |
| Mont Blanc Eléctricité | 4,5 | Electricien | Chamonix |
| Vallis Bellemare | 4,0 | Plombier | Vienne |

- Titre de page : le nom de la catégorie.
- Élément actif du menu marqué visuellement (couleur **et** soulignement épais).
- La carte entière constitue la zone cliquable.

---

## Écran 3 : Fiche artisan

> « Le nom de l'artisan ou de l'entreprise »
> « Une image (photo, logo, …) »
> « Sa note avec des étoiles »
> « Sa spécialité »
> « Sa localisation »
> « Une rubrique "A propos" »
> « Un formulaire de contact (nom, email, objet et message) qui envoie un e-mail à l'artisan »
> « Le site web de l'artisan le cas échéant »

Artisan retenu : **Chocolaterie Labbé**, qui possède un site web et permet donc de montrer ce cas.

| Donnée | Valeur réelle |
|---|---|
| Nom | Chocolaterie Labbé |
| Note | 4,9 |
| Spécialité | Chocolatier |
| Localisation | Lyon |
| Site web | https://chocolaterie-labbe.fr |
| À propos | Le texte du jeu d'essai |

Formulaire, dans cet ordre, avec les quatre champs exigés :

1. Nom
2. Email
3. Objet
4. Message

Plus un bouton d'envoi. Les champs obligatoires sont signalés par un astérisque **et** une mention écrite, jamais par la seule couleur.

Le lien vers le site web n'apparaît que si l'artisan en possède un.

---

## Écran 4 : Page 404

> « Une image. »
> « Un texte ("Page non trouvée", "La page que vous avez demandé", par exemple) »

- Une illustration.
- Le code **404**.
- Titre : **Page non trouvée**.
- Un texte explicatif.
- Un bouton de retour à l'accueil.
- En-tête et pied de page identiques aux autres écrans.

---

## Écran 5 : Page légale

> « Ces pages devront être "vides" et seront remplies plus tard par un cabinet spécialisé (header + footer et un texte d'attente : "Page en construction", par exemple) »

- Titre de la page : **Mentions légales**.
- Texte d'attente : **Page en construction**.
- En-tête et pied de page identiques.
- Rien d'autre : la page doit rester vide, conformément à la demande.

---

## Organisation du fichier Figma

```
Trouve ton artisan
├── Page « Styles »        couleurs, typographie, logo
├── Page « Composants »    en-tête, pied de page, carte artisan, étoiles, bouton
├── Page « Mobile »        5 frames à 390 px
├── Page « Tablette »      5 frames à 768 px
└── Page « Ordinateur »    5 frames à 1440 px
```

L'en-tête, le pied de page et la carte artisan sont construits en composants réutilisables : le cahier des charges impose qu'ils soient identiques sur toutes les pages, un composant garantit cette identité.

## Enchaînement des écrans

À relier en mode prototype :

```
Accueil ──menu catégorie──▶ Liste ──clic sur une carte──▶ Fiche artisan
   │                                                          │
   └──barre de recherche──▶ Liste                             ▼
                                                    Formulaire de contact

Depuis tout écran : logo ──▶ Accueil
                    liens du pied ──▶ Pages légales
                    adresse inconnue ──▶ 404
```
