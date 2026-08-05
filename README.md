# Trouve ton artisan

Plateforme de mise en relation entre les particuliers et les artisans de la région Auvergne-Rhône-Alpes. Elle permet de rechercher un artisan par catégorie ou par nom, de consulter sa fiche, et de le contacter directement par formulaire.

Projet réalisé dans le cadre du devoir bilan du titre professionnel Développeur Web et Web Mobile.

## Sommaire

- [Aperçu fonctionnel](#aperçu-fonctionnel)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Sécurité](#sécurité)
- [Documentation](#documentation)

## Aperçu fonctionnel

| Page | Contenu |
|---|---|
| Accueil | Fonctionnement du site en 4 étapes, 3 artisans du mois |
| Liste | Artisans d'une catégorie ou résultats d'une recherche, sous forme de cartes |
| Fiche artisan | Nom, visuel, note, spécialité, localisation, présentation, site web et formulaire de contact |
| Pages légales | Mentions légales, données personnelles, accessibilité, cookies |
| 404 | Affichée pour toute adresse inconnue |

Le menu des catégories est alimenté depuis la base de données, jamais codé en dur.

## Technologies

**Front** : React 19, React Router, Bootstrap 5, Sass, Vite
**API** : Node.js, Express 5, Sequelize 6
**Base de données** : MySQL 8 ou MariaDB 10.4 et suivantes
**Outils** : Git, npm

## Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| Node.js | 18 (testé sur 22) | `node -v` |
| npm | 9 (testé sur 11) | `npm -v` |
| MySQL ou MariaDB | MySQL 8 / MariaDB 10.4 | `mysql --version` |
| Git | 2.x | `git --version` |

Un serveur MySQL doit être démarré et accessible. Sous Windows, la pile XAMPP ou WAMP convient.

## Installation

### 1. Récupérer le projet

```bash
git clone https://github.com/ZacR13-dev/trouve-ton-artisan.git
cd trouve-ton-artisan
```

### 2. Créer et alimenter la base de données

Depuis la racine du projet :

```bash
mysql -u root -p --default-character-set=utf8mb4 < database/01-create-database.sql
```

```bash
mysql -u root -p --default-character-set=utf8mb4 < database/02-seed-database.sql
```

Le premier script crée la base `trouve_ton_artisan`, ses trois tables, puis un compte applicatif `tta_app` limité à la lecture. **Modifiez le mot de passe de ce compte** dans `database/01-create-database.sql` avant de l'exécuter : il ne doit jamais rester à sa valeur d'exemple.

Le second script insère le jeu d'essai (4 catégories, 15 spécialités, 17 artisans) et affiche quatre requêtes de contrôle dont les résultats attendus sont documentés en commentaire.

### 3. Configurer et installer l'API

```bash
cd api
npm install
```

Copiez le modèle de configuration, puis renseignez-le :

```bash
cp .env.example .env
```

| Variable | Rôle |
|---|---|
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Connexion à la base. Utilisez le compte `tta_app`, jamais `root`. |
| `API_KEY` | Clé exigée sur chaque requête. Générez-la (voir ci-dessous). |
| `CORS_ORIGIN` | Adresse du front autorisée à appeler l'API. |
| `SMTP_*`, `MAIL_FROM` | Relais d'envoi des e-mails du formulaire. Laissez vide en développement : les messages s'affichent alors dans la console. |
| `MAIL_REDIRECT_TO` | Adresse vers laquelle rediriger tous les messages. Les adresses des artisans du jeu d'essai étant fictives, renseignez la vôtre. |

Génération d'une clé d'API :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configurer et installer le front

```bash
cd ../client
npm install
```

```bash
cp .env.example .env
```

Renseignez `VITE_API_URL` (par défaut `http://localhost:3001/api`) et reportez dans `VITE_API_KEY` **exactement la même valeur** que `API_KEY` côté API.

## Lancement

Deux terminaux sont nécessaires.

**Terminal 1, l'API** :

```bash
cd api && npm run dev
```

L'API écoute sur `http://localhost:3001`. Elle vérifie la connexion à la base avant d'ouvrir son port : si la base est injoignable, le démarrage échoue avec un message explicite.

**Terminal 2, le front** :

```bash
cd client && npm run dev
```

Le site est disponible sur `http://localhost:5173`.

### Production

```bash
cd client && npm run build
```

Les fichiers à mettre en ligne sont générés dans `client/dist`. Côté API :

```bash
cd api && npm start
```

Pensez à passer `NODE_ENV=production` : les requêtes SQL cessent d'être journalisées et les piles d'appels ne sont plus exposées.

## Structure du projet

```
trouve-ton-artisan/
├── api/                     API REST
│   └── src/
│       ├── config/          Variables d'environnement et connexion Sequelize
│       ├── models/          Modèles et associations
│       ├── controllers/     Logique métier
│       ├── routes/          Points d'entrée et règles de validation
│       ├── middlewares/     Clé d'API, validation, gestion des erreurs
│       ├── services/        Envoi d'e-mail
│       └── utils/           Erreurs applicatives, slugs, mise en forme
├── client/                  Application React
│   └── src/
│       ├── components/      Composants d'interface
│       ├── pages/           Une page par route
│       ├── services/        Couche d'accès à l'API
│       ├── hooks/           Chargement asynchrone
│       ├── contexts/        Catégories partagées
│       └── styles/          Sass, Bootstrap personnalisé
├── database/                Scripts SQL de création et d'alimentation
└── docs/                    Modèle de données, veille de sécurité, maquettes
```

## API

Toutes les routes sont préfixées par `/api` et exigent l'en-tête `x-api-key`, à l'exception du point de supervision.

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/sante` | Supervision, accessible sans clé |
| GET | `/api/categories` | Catégories du menu |
| GET | `/api/artisans` | Liste des artisans |
| GET | `/api/artisans?categorie=batiment` | Artisans d'une catégorie |
| GET | `/api/artisans?recherche=chocolat` | Recherche par nom |
| GET | `/api/artisans?top=true` | Artisans du mois |
| GET | `/api/artisans/:id` | Fiche complète |
| POST | `/api/contact` | Envoi d'un message à un artisan |

Exemple :

```bash
curl -H "x-api-key: VOTRE_CLE" "http://localhost:3001/api/artisans?categorie=alimentation"
```

## Sécurité

- Accès à l'API restreint par clé partagée, comparée en temps constant.
- CORS limité aux origines déclarées.
- Limitation de débit générale, renforcée sur le formulaire de contact.
- Validation et contrôle de longueur de toutes les entrées.
- Requêtes préparées par Sequelize, sans concaténation SQL.
- Compte de base de données limité à la lecture seule.
- Adresses e-mail des artisans jamais exposées par l'API.
- En-têtes de sécurité HTTP positionnés par Helmet.
- Secrets exclusivement en variables d'environnement, hors du dépôt.

Le détail de chaque mesure et la veille menée pendant le projet figurent dans [`docs/veille-securite.md`](docs/veille-securite.md).

## Documentation

| Document | Contenu |
|---|---|
| [`docs/base-de-donnees.md`](docs/base-de-donnees.md) | Règles de gestion, dictionnaire des données, MCD, MLD, MPD |
| [`docs/veille-securite.md`](docs/veille-securite.md) | Veille, vulnérabilités trouvées et traitées, mesures de sécurité |

## Auteur

Kévin Reis
