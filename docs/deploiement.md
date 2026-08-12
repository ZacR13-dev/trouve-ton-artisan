# Déploiement

Procédure de mise en ligne du site sur un hébergement mutualisé o2switch (cPanel). Le site est déployé selon cette procédure à l'adresse <https://trouve-ton-artisan.agence-anima.fr>.

Le cahier des charges l'exige explicitement : « Vous devez héberger le site. » Le lien du site en ligne fait par ailleurs partie des livrables du dossier.

## Architecture retenue

Un seul service Node sert à la fois l'API et le site. Le front compilé est distribué par Express, à la même origine que l'API.

```
https://trouve-ton-artisan.agence-anima.fr
    │
    ├── /            → client/dist (fichiers statiques + repli du routeur React)
    └── /api/*       → l'API Express, qui interroge MySQL
```

Une seule application à héberger, une seule origine, donc aucune requête inter-origine entre le site et son API. Ce comportement n'est actif que lorsque `NODE_ENV=production`, dans `api/src/app.js` : en développement, Vite garde son propre serveur.

Conséquence directe de ce choix : le contrôle CORS et la limitation de débit sont montés sur `/api` et non sur le service entier. Appliqués globalement, ils s'exerceraient aussi sur les fichiers du site que ce même service distribue. Le premier rejetterait les propres fichiers de l'application, le second compterait chaque fichier JS, CSS et image dans le quota de requêtes.

## Isolation sur un hébergement partagé

Un compte mutualisé héberge en général plusieurs sites. Le déploiement crée donc uniquement des éléments dédiés, et ne réutilise aucune ressource existante :

| Élément créé | Règle d'isolation |
|---|---|
| Un sous-domaine dédié | Ne pas réutiliser un domaine déjà servi, ni pointer sa racine vers un répertoire occupé |
| Un répertoire `trouve-ton-artisan/` | Le placer hors du `public_html` de tout site existant |
| Une base de données neuve | Contrôler le nom de la base sélectionnée dans phpMyAdmin avant tout import |
| Un utilisateur MySQL dédié | Ne pas réutiliser le compte d'un autre site |
| Une application Node.js | Son URL doit être le nouveau sous-domaine : cPanel écrit un `.htaccess` dans la racine indiquée, ce qui détournerait le site qui s'y trouverait |

Le script `database/03-deploiement-mutualise.sql` est construit sans aucune instruction destructrice : ni `DROP`, ni `TRUNCATE`, ni `DELETE`. Importé par erreur sur une base occupée, il s'arrête sur une erreur de clé en double sans rien effacer.

## Arborescence attendue sur le serveur

Le chemin du front est résolu depuis `api/src/`, les deux répertoires doivent donc rester voisins :

```
/home/<compte>/trouve-ton-artisan/
    ├── api/
    │   ├── src/server.js        ← fichier de démarrage
    │   └── package.json
    └── client/
        └── dist/                ← le front compilé, envoyé depuis le poste
```

## Étape 1 : le sous-domaine

cPanel → **Domaines** → *Créer un sous-domaine*.

- Sous-domaine : `trouve-ton-artisan`
- Domaine : un domaine du compte
- Racine du document : conserver le répertoire **neuf** proposé par cPanel

Ce répertoire sert de point d'ancrage à l'application Node. Il ne contient pas le site : c'est Node qui le distribue.

## Étape 2 : la base de données

cPanel → **Bases de données MySQL**.

1. Créer une base, par exemple `tta`. cPanel la préfixe automatiquement avec l'identifiant du compte : le nom réel est du type `abcd1234_tta`.
2. Créer un utilisateur, par exemple `tta_app`, avec un mot de passe fort. Il est lui aussi préfixé.
3. Rattacher l'utilisateur à la base, puis **ne cocher que `SELECT`**.

Ce dernier point n'est pas cosmétique : il reprend le principe du moindre privilège du script de référence. L'API ne fait que lire le catalogue. Sans `INSERT`, `UPDATE`, `DELETE` ni `DROP`, une injection SQL réussie ne pourrait ni modifier ni détruire les données.

Le rattachement est une opération distincte de la création. Omis, il produit l'erreur `Access denied for user ... to database ...`, qui signale des privilèges absents et non des identifiants erronés.

## Étape 3 : le schéma et les données

cPanel → **phpMyAdmin**.

1. **Sélectionner la base créée à l'étape 2** dans la colonne de gauche, et contrôler son nom en haut de l'écran.
2. Onglet *Importer*, choisir `database/03-deploiement-mutualise.sql`, jeu de caractères `utf-8`.
3. Exécuter, puis vérifier : 4 catégories, 15 spécialités, 17 artisans.

Les scripts `01-create-database.sql` et `02-seed-database.sql` restent les scripts de référence du projet, exigés comme livrables. Ils ne sont pas utilisables ici : ils contiennent `CREATE DATABASE`, `CREATE USER` et `GRANT`, trois opérations refusées au compte client sur un hébergement mutualisé et qui relèvent du panneau de l'hébergeur.

## Étape 4 : envoyer le projet

Depuis le poste, compiler le front avec la clé d'API destinée à la production :

```bash
cd client && VITE_API_KEY=<la-cle-de-production> npm run build
```

`VITE_API_URL` vaut déjà `/api`, fixé par `client/.env.production`.

Envoyer ensuite sur le serveur, par le Gestionnaire de fichiers ou en SSH :

- `api/` en entier, **sans** `node_modules/` ni `.env`
- `client/dist/`

À noter : `client/dist/` est exclu du dépôt Git, un `git clone` sur le serveur ne le contiendrait pas.

## Étape 5 : l'application Node.js

cPanel → **Setup Node.js App** → *Create Application*.

| Champ | Valeur |
|---|---|
| Node.js version | 20 ou 22 (le projet exige ≥ 18) |
| Application mode | Production |
| Application root | `trouve-ton-artisan/api` |
| Application URL | le sous-domaine de l'étape 1 |
| Application startup file | `src/server.js` |

Déclarer ensuite les variables d'environnement dans la même page :

| Variable | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_NAME` | le nom **préfixé** de la base |
| `DB_USER` | le nom **préfixé** de l'utilisateur |
| `DB_PASSWORD` | le mot de passe de l'étape 2 |
| `API_KEY` | la même clé que celle utilisée à la compilation du front |
| `CORS_ORIGIN` | l'adresse publique du site |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | les identifiants du relais d'envoi |
| `MAIL_FROM` | l'adresse d'expédition |
| `MAIL_REDIRECT_TO` | l'adresse qui reçoit les messages : les artisans du jeu d'essai sont fictifs |

`CORS_ORIGIN` doit contenir l'adresse exacte du site, en `https` et sans barre oblique finale. Le formulaire de contact envoie une requête `POST` : le navigateur y joint l'en-tête `Origin`, même vers sa propre origine. Une valeur absente ou erronée fait échouer l'envoi.

Les variables `SMTP_USER` et `SMTP_PASSWORD` ne sont pas facultatives en production : sans elles, le message est journalisé au lieu d'être expédié, et le formulaire annonce un envoi qui n'a pas lieu.

`PORT` n'est pas à renseigner, Passenger l'impose lui-même.

Cliquer enfin sur **Run NPM Install**, puis démarrer l'application.

## Étape 6 : le certificat

cPanel → **SSL/TLS Status**. Le sous-domaine doit apparaître couvert par AutoSSL. Sinon, lancer *Run AutoSSL* et attendre que `https://` réponde avant de poursuivre.

## Étape 7 : vérifier

```bash
curl -s https://trouve-ton-artisan.agence-anima.fr/api/sante
```

Réponse attendue : `{"statut":"ok"}`.

Puis dans un navigateur :

- la page d'accueil affiche les trois artisans du mois ;
- le menu « Bâtiment » liste bien quatre artisans ;
- une fiche artisan s'ouvre et le formulaire de contact accepte un envoi ;
- recharger la page sur une fiche artisan ne renvoie pas d'erreur du serveur ;
- une adresse inventée affiche la page 404 du site.

Un contrôle complémentaire vérifie que la limitation de débit ne s'applique pas aux fichiers du site : la commande ci-dessous ne doit rien renvoyer, alors que la même sur `/api/sante` doit afficher les en-têtes `RateLimit`.

```bash
curl -sD - -o /dev/null https://trouve-ton-artisan.agence-anima.fr/ | grep -i ratelimit
```

## Étape 8 : reporter l'adresse dans le dossier

1. Renseigner l'adresse publique dans `docs/dossier/dossier.html`, partie 7, paragraphe `id="lien-site"`.
2. Mettre à jour `docs/conformite-cahier-des-charges.md`.
3. Regénérer le PDF : `node docs/dossier/generer-pdf.js`.
4. Relancer les vérificateurs du W3C sur l'adresse publique, HTML et CSS, et reporter le résultat dans la partie 6.
