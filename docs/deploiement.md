# Déploiement sur o2switch

Procédure de mise en ligne du site sur un hébergement mutualisé o2switch (cPanel).

## Avant tout : ce qui ne doit pas bouger

Le compte héberge déjà deux sites. **Aucune étape de cette procédure ne doit toucher à leurs domaines, à leur répertoire ni à leurs bases.** Tout ce qui suit crée des éléments neufs, à côté :

| Élément créé | Ce qu'il ne faut surtout pas faire |
|---|---|
| Un sous-domaine dédié | Ne pas réutiliser un domaine existant, ni pointer sa racine sur un répertoire déjà occupé |
| Un répertoire `trouve-ton-artisan/` | Ne pas le placer dans le `public_html` d'un site existant |
| Une base de données neuve | Ne jamais importer un script dans une base existante : vérifier le nom de la base sélectionnée dans phpMyAdmin avant de cliquer sur « Exécuter » |
| Un utilisateur MySQL dédié | Ne pas réutiliser l'utilisateur d'un autre site |
| Une application Node.js | Son URL doit être le nouveau sous-domaine, jamais un domaine existant : cPanel écrit un `.htaccess` dans la racine indiquée, ce qui détournerait le site qui s'y trouve |

Le script `database/03-deploiement-mutualise.sql` a été construit sans aucune instruction destructrice : ni `DROP`, ni `TRUNCATE`, ni `DELETE`. Importé par erreur sur une base occupée, il s'arrête sur une erreur de clé en double sans rien effacer.

## Ce que le brief exige

> « Vous devez héberger le site. »

Et parmi les livrables du dossier : « Le lien de votre site accessible en ligne. »

## Architecture retenue

Un seul service Node sert à la fois l'API et le site. Le front compilé est distribué par Express, à la même origine que l'API.

```
https://trouve-ton-artisan.<votre-domaine>.fr
    │
    ├── /            → client/dist (fichiers statiques + repli du routeur React)
    └── /api/*       → l'API Express, qui interroge MySQL
```

L'intérêt : une seule application à héberger, une seule origine, donc aucune requête inter-origine entre le site et son API. C'est le comportement activé par `NODE_ENV=production` dans `api/src/app.js`.

## Arborescence attendue sur le serveur

Le chemin du front est résolu depuis `api/src/`, les deux répertoires doivent donc rester voisins :

```
/home/<compte>/trouve-ton-artisan/
    ├── api/
    │   ├── src/server.js        ← fichier de démarrage
    │   ├── package.json
    │   └── .env                 ← à créer sur le serveur, jamais versionné
    └── client/
        └── dist/                ← le front compilé, envoyé depuis le poste
```

## Étape 1 : le sous-domaine

cPanel → **Domaines** → *Créer un sous-domaine*.

- Sous-domaine : `trouve-ton-artisan`
- Domaine : l'un de vos deux domaines
- Racine du document : laisser cPanel proposer un répertoire **neuf**, par exemple `/home/<compte>/trouve-ton-artisan-web`

Ce répertoire servira de point d'ancrage à l'application Node. Il ne contiendra pas le site : c'est Node qui le distribue.

## Étape 2 : la base de données

cPanel → **Bases de données MySQL**.

1. Créer une base, par exemple `tta`. cPanel la préfixe automatiquement : le nom réel sera du type `abcd1234_tta`.
2. Créer un utilisateur, par exemple `tta_app`, avec un mot de passe fort. Il sera lui aussi préfixé.
3. Ajouter l'utilisateur à la base, puis **ne cocher que `SELECT`**.

Ce dernier point n'est pas cosmétique : il reprend le principe du moindre privilège du script de référence. L'API ne fait que lire le catalogue. Sans `INSERT`, `UPDATE`, `DELETE` ni `DROP`, une injection SQL réussie ne pourrait ni modifier ni détruire les données.

## Étape 3 : le schéma et les données

cPanel → **phpMyAdmin**.

1. **Sélectionner la base créée à l'étape 2** dans la colonne de gauche. Vérifier son nom en haut de l'écran.
2. Onglet *Importer*, choisir `database/03-deploiement-mutualise.sql`, jeu de caractères `utf-8`.
3. Exécuter, puis vérifier : 4 catégories, 15 spécialités, 17 artisans.

Les scripts `01-create-database.sql` et `02-seed-database.sql` restent les scripts de référence du projet, exigés comme livrables. Ils ne sont pas utilisables ici : ils contiennent `CREATE DATABASE`, `CREATE USER` et `GRANT`, trois opérations refusées au compte client sur un hébergement mutualisé.

## Étape 4 : envoyer le projet

Depuis le poste, compiler le front avec la clé d'API destinée à la production :

```bash
cd client && VITE_API_KEY=<la-cle-de-production> npm run build
```

`VITE_API_URL` vaut déjà `/api`, il est fixé par `client/.env.production`.

Envoyer ensuite sur le serveur, par le Gestionnaire de fichiers ou en SSH :

- `api/` en entier, **sans** `node_modules/` ni `.env`
- `client/dist/`

Rappel : `client/dist/` est exclu du dépôt Git, un `git clone` sur le serveur ne le contiendra pas.

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
| `CORS_ORIGIN` | `https://trouve-ton-artisan.<votre-domaine>.fr` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | les identifiants du relais d'envoi |
| `MAIL_FROM` | l'adresse d'expédition |
| `MAIL_REDIRECT_TO` | votre adresse : les artisans du jeu d'essai sont fictifs |

`CORS_ORIGIN` doit contenir l'adresse exacte du site, en `https` et sans barre oblique finale. Le formulaire de contact envoie une requête `POST` : le navigateur y joint l'en-tête `Origin`, même vers sa propre origine. Une valeur absente ou erronée fait échouer l'envoi.

Ne pas renseigner `PORT` : Passenger l'impose lui-même.

Enfin, cliquer sur **Run NPM Install**, puis démarrer l'application.

## Étape 6 : le certificat

cPanel → **SSL/TLS Status**. Le sous-domaine doit apparaître couvert par AutoSSL. Si ce n'est pas le cas, lancer *Run AutoSSL*. Attendre que `https://` réponde avant de passer à la suite.

## Étape 7 : vérifier

```bash
curl -s https://trouve-ton-artisan.<votre-domaine>.fr/api/sante
```

Réponse attendue : `{"statut":"ok"}`.

Puis dans un navigateur :

- la page d'accueil affiche les trois artisans du mois ;
- le menu « Bâtiment » liste bien quatre artisans ;
- une fiche artisan s'ouvre et le formulaire de contact accepte un envoi ;
- recharger la page sur une fiche artisan ne renvoie pas d'erreur du serveur ;
- une adresse inventée affiche la page 404 du site.

## Étape 8 : reporter l'adresse dans le dossier

1. Dans `docs/dossier/dossier.html`, partie 7, le paragraphe `id="lien-site"` porte aujourd'hui la mention « lien à insérer ». La remplacer par l'URL publique.
2. Mettre à jour de la même façon la ligne « Mise en ligne » du tableau de conformité, et `docs/conformite-cahier-des-charges.md`.
3. Regénérer le PDF : `node docs/dossier/generer-pdf.js`.
4. Relancer la validation W3C sur l'adresse publique (CSS et HTML) et reporter le résultat.
