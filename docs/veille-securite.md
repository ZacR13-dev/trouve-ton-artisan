# Veille de sécurité - Trouve ton artisan

## 1. Méthode de veille

La sécurité étant « un point important pour les collectivités », la veille n'a pas été faite en une fois à la fin du projet mais tout au long du développement.

| Source | Usage | Fréquence |
|---|---|---|
| [GitHub Advisory Database](https://github.com/advisories) | Base de référence des failles des paquets npm, consultée pour chaque alerte remontée | À chaque alerte |
| `npm audit` | Analyse automatique de l'arbre de dépendances | À chaque installation de paquet et avant chaque livraison |
| [OWASP Top 10](https://owasp.org/www-project-top-ten/) | Grille de relecture du code (injection, mauvaise configuration, contrôle d'accès) | À chaque fonctionnalité |
| [MDN Web Docs](https://developer.mozilla.org/) | Comportement réel des en-têtes HTTP de sécurité et de CORS | Ponctuel |
| [Bulletins de l'ANSSI](https://www.cert.ssi.gouv.fr/) | Alertes générales sur l'écosystème Node.js | Hebdomadaire |

**Principe retenu** : une alerte de `npm audit` n'est jamais traitée mécaniquement. Chaque vulnérabilité est lue dans son avis d'origine, puis confrontée à l'usage réel qu'en fait le projet. C'est ce qui a permis d'éviter un correctif automatique bien plus dangereux que la faille elle-même (cas n° 1).

## 2. Vulnérabilités trouvées pendant le projet

### Cas n° 1 : react-router, contournement de protection CSRF en mode RSC

| | |
|---|---|
| **Référence** | [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) |
| **Paquet** | `react-router` 7.12.0 à 8.2.0, via `react-router-dom` |
| **Gravité** | Élevée |
| **Détection** | `npm audit` à l'installation de React Router |

**Nature de la faille.** En mode RSC (React Server Components), une requête d'action est exécutée par le serveur *avant* que le contrôle d'origine ne rejette la requête avec un code 400. La protection contre le CSRF arrive donc trop tard : l'action a déjà produit ses effets.

**Analyse de l'exposition.** Le projet utilise React Router en mode SPA (`createBrowserRouter`, rendu entièrement côté navigateur). Il n'y a ni React Server Components, ni actions serveur, ni rendu côté serveur. Le code vulnérable n'est jamais exécuté : **l'application n'est pas exposée**.

**Le piège du correctif automatique.** `npm audit fix --force` proposait de revenir à `react-router-dom@7.11.0`. Cette version a été installée puis auditée pour vérification. Résultat :

> `react-router 6.0.0 - 7.17.0` : **14 vulnérabilités** de gravité élevée, dont une exécution de code à distance non authentifiée via `turbo-stream` ([GHSA-49rj-9fvp-4h2h](https://github.com/advisories/GHSA-49rj-9fvp-4h2h)), plusieurs XSS stockées et par redirection ouverte ([GHSA-2w69-qvjg-hvjx](https://github.com/advisories/GHSA-2w69-qvjg-hvjx), [GHSA-jjmj-jmhj-qwj2](https://github.com/advisories/GHSA-jjmj-jmhj-qwj2)), et deux dénis de service non authentifiés ([GHSA-chx6-hx7r-mcp5](https://github.com/advisories/GHSA-chx6-hx7r-mcp5)).

Le correctif recommandé par l'outil aurait donc remplacé une faille inexploitable dans notre contexte par quatorze failles réellement exploitables sur une SPA.

**Décision.** Conserver `react-router-dom@7.18.2`, la version la plus récente, qui corrige les quatorze failles précédentes et ne conserve que celle du mode RSC, inatteignable ici. Un suivi de l'avis est à maintenir : une version 7.19 ou 8.3 corrigeant le mode RSC devra être installée dès sa publication.

**Enseignement.** Le nombre de lignes affichées par `npm audit` ne mesure pas le risque réel. Une faille se juge sur trois critères : le code vulnérable est-il présent, est-il atteignable depuis l'extérieur, et le correctif proposé n'introduit-il pas pire.

### Cas n° 2 : uuid, dépassement de tampon via Sequelize

| | |
|---|---|
| **Référence** | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) |
| **Paquet** | `uuid` < 11.1.1, dépendance transitive de `sequelize` 6.37.8 |
| **Gravité** | Modérée |
| **Détection** | `npm audit` sur le dossier `api` |

**Nature de la faille.** Les fonctions `v3`, `v5` et `v6` d'`uuid` ne vérifient pas les bornes du tampon lorsqu'un paramètre `buf` leur est fourni. Un tampon trop court entraîne une écriture hors limites.

**Analyse de l'exposition.** Le projet n'emploie aucun identifiant UUID : les clés primaires sont des entiers auto-incrémentés. Sequelize n'appelle `uuid` que pour ses propres identifiants internes, sans jamais transmettre de tampon. Le chemin de code vulnérable n'est pas atteint.

**Le piège du correctif automatique.** Ici encore, `npm audit fix --force` proposait `sequelize@3.30.0`, soit un retour trois versions majeures en arrière, incompatible avec l'ensemble du code de l'API.

**Correction appliquée.** Plutôt que de toucher à Sequelize, la dépendance transitive a été forcée vers une version corrigée, au moyen du mécanisme `overrides` de npm, dans `api/package.json` :

```json
"overrides": {
  "uuid": "^11.1.1"
}
```

**Vérification.** Après réinstallation, `npm ls uuid` confirme la résolution vers `uuid@11.1.1`, `npm audit` ne remonte plus aucune vulnérabilité, et les 31 tests de l'API passent toujours : la montée de version n'a rien cassé.

## 3. État à la livraison

| Périmètre | Vulnérabilités connues | Détail |
|---|---|---|
| `api` | **0** | uuid corrigé par `overrides` |
| `client` | 2 (élevées) | Uniquement `GHSA-qwww-vcr4-c8h2`, code non atteignable en mode SPA, aucune version corrigée disponible |

## 4. Failles évitées par conception dans le code du projet

Au-delà des dépendances, la relecture du code selon la grille OWASP a conduit aux protections suivantes. Chacune répond à une attaque précise.

| Attaque | Protection mise en place | Emplacement |
|---|---|---|
| **Injection SQL** | Requêtes préparées par Sequelize, aucune concaténation de chaîne SQL ; `multipleStatements: false` interdit l'enchaînement de requêtes ; identifiants validés en entier avant toute requête | `api/src/config/database.js`, `api/src/routes/artisan.routes.js` |
| **Injection de joker LIKE** | Les caractères `%`, `_` et `\` saisis dans la barre de recherche sont échappés, sinon une recherche sur `%` extrairait toute la base | `api/src/controllers/artisan.controller.js` |
| **Injection d'en-tête SMTP** | Les retours à la ligne sont retirés de l'objet et du nom avant construction du message, ce qui empêche l'ajout d'un en-tête `Bcc:` et l'usage du formulaire comme relais de spam | `api/src/services/mailer.js` |
| **XSS dans les e-mails** | Le contenu saisi est échappé avant insertion dans le corps HTML du message | `api/src/services/mailer.js` |
| **Moissonnage des adresses e-mail** | La colonne `email` est exclue par défaut de toutes les réponses de l'API ; le serveur seul connaît le destinataire | `api/src/models/Artisan.js` |
| **Élévation de privilèges via la base** | L'API se connecte avec un compte MySQL limité au `SELECT` sur trois tables ; une injection réussie ne permettrait ni modification ni suppression | `database/01-create-database.sql` |
| **Attaque temporelle sur la clé d'API** | La clé est comparée en temps constant (`timingSafeEqual` sur empreintes SHA-256), le temps de réponse ne révèle donc pas le nombre de caractères corrects | `api/src/middlewares/apiKey.js` |
| **Déni de service** | Limitation de débit générale, limitation renforcée sur le formulaire, corps de requête plafonné à 10 Ko | `api/src/app.js`, `api/src/routes/contact.routes.js` |
| **Spam automatisé** | Champ piège invisible ; un robot qui le remplit reçoit un faux succès plutôt qu'une erreur, pour ne pas lui apprendre à le contourner | `api/src/controllers/contact.controller.js` |
| **Fuite d'informations techniques** | En-tête `X-Powered-By` supprimé, erreurs Sequelize jamais renvoyées telles quelles, pile d'appels réservée au mode développement | `api/src/app.js`, `api/src/middlewares/errorHandler.js` |
| **Divulgation de secrets** | Aucun identifiant dans le code ; tout passe par des variables d'environnement, `.env` exclu du dépôt, seul `.env.example` est publié | `api/.env.example`, `.gitignore` |
| **Clickjacking, sniffing de type MIME** | En-têtes de sécurité positionnés par Helmet (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`) | `api/src/app.js` |

## 5. Limite connue et assumée : la clé d'API côté navigateur

Le cahier des charges demande que « l'accès à l'API soit limité à l'application ». La clé d'API est donc exigée sur chaque requête.

Il faut être lucide sur la portée de cette mesure : **une clé embarquée dans une application front est lisible**. N'importe quel visiteur peut ouvrir l'onglet réseau de son navigateur et la relever. Elle écarte les appels opportunistes et le moissonnage automatisé, mais elle ne constitue pas un secret au sens cryptographique.

La restriction réelle repose donc sur un ensemble :

1. la clé d'API, qui filtre les appels non intentionnels ;
2. la politique CORS, qui empêche un autre site web d'appeler l'API depuis le navigateur d'un visiteur ;
3. la limitation de débit, qui rend le moissonnage massif impraticable ;
4. le compte de base de données en lecture seule, qui borne les conséquences d'un accès non prévu.

La seule façon de garder un secret réellement secret serait d'introduire un composant serveur intermédiaire, ou une authentification par jeton à durée de vie courte. Ce serait la piste à retenir si la plateforme venait à exposer des données personnelles, ce qui n'est pas le cas ici : toutes les données servies sont publiques par nature.

## 6. Suivi à poursuivre après la livraison

- Surveiller la publication d'une version de React Router corrigeant [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) et l'installer.
- Réexécuter `npm audit` sur les deux dossiers à chaque intervention sur le projet.
- Revoir le mécanisme d'accès à l'API si l'application d'alimentation prévue par le client vient à exposer des données non publiques.
