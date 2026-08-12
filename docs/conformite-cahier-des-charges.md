# Conformité au cahier des charges

Relecture point par point du brief « Créer le site Trouve ton artisan ». Chaque exigence est reprise dans sa formulation d'origine, avec l'endroit du projet qui y répond.

**Légende** : ✅ conforme, 🟡 partiel, ⏳ en attente d'une action externe.

## 1. Le header

| Exigence | État | Où |
|---|---|---|
| Présent et identique sur toutes les pages | ✅ | `App.jsx` place `EnTete` en dehors des routes |
| Logo avec un lien qui ramène vers la page d'accueil | ✅ | `EnTete.jsx`, logo enveloppé dans un `Link` vers `/` |
| Menu avec liens vers Bâtiment, Services, Fabrication, Alimentation | ✅ | `EnTete.jsx` |
| Textes de ces liens alimentés depuis la base de données | ✅ | `GET /api/categories` → `CategoriesContext` → menu. Aucun libellé codé en dur |
| Barre de recherche portant sur les noms des artisans | ✅ | `EnTete.jsx` → `/recherche?q=` → `WHERE nom LIKE` |

## 2. Le footer

| Exigence | État | Où |
|---|---|---|
| Présent et identique sur toutes les pages | ✅ | `App.jsx` |
| Menu vers les 4 pages légales | ✅ | `PiedDePage.jsx` |
| Pages légales « vides » : header, footer et texte d'attente | ✅ | `PageLegale.jsx`, texte « Page en construction » |
| Adresse et contacts de l'antenne de Lyon | ✅ | `PiedDePage.jsx`, adresse complète et téléphone cliquable |

## 3. La page d'accueil

| Exigence | État | Où |
|---|---|---|
| Explication du fonctionnement en 4 étapes | ✅ | `Accueil.jsx` |
| Rubrique nommée « Comment trouver mon artisan ? » | ✅ | Libellé repris à l'identique |
| Numéro **et** texte de chaque étape affichés | ✅ | Numéro dans une pastille, texte en dessous, textes repris mot pour mot |
| Les trois artisans du mois | ✅ | `GET /api/artisans?top=true` |
| Pour chacun : nom, note sur cinq en étoiles, spécialité, localisation | ✅ | `CarteArtisan.jsx` |

## 4. La page liste

| Exigence | État | Où |
|---|---|---|
| Liste selon la catégorie ou la recherche | ✅ | `ListeArtisans.jsx` sert les deux cas |
| Une carte par artisan : nom, note en étoiles, spécialité, localisation | ✅ | `CarteArtisan.jsx` |
| Chaque carte cliquable, renvoie vers la fiche complète | ✅ | La carte entière est un lien |

## 5. La fiche artisan

| Exigence | État | Où |
|---|---|---|
| Nom de l'artisan ou de l'entreprise | ✅ | `FicheArtisan.jsx` |
| Une image (photo, logo...) | ✅ | `VisuelArtisan.jsx`. Le jeu d'essai ne fournit aucune photo : une illustration propre à la catégorie est affichée, et la colonne `image` est prête pour les visuels réels |
| Note avec des étoiles | ✅ | `NoteEtoiles.jsx` |
| Spécialité | ✅ | |
| Localisation | ✅ | |
| Rubrique « À propos » | ✅ | |
| Formulaire de contact : nom, email, objet, message | ✅ | `FormulaireContact.jsx` |
| Envoi d'un e-mail à l'artisan | ✅ | `POST /api/contact` → `mailer.js`. Envoi réel via SMTP, vérifié sur le site en ligne, redirigé en démonstration pour ne pas écrire aux adresses fictives du jeu d'essai |
| Site web de l'artisan le cas échéant | ✅ | Affiché seulement si renseigné |

## 6. La page 404

| Exigence | État | Où |
|---|---|---|
| Une image | ✅ | Illustration SVG dans `NonTrouvee.jsx` |
| Un texte du type « Page non trouvée » | ✅ | Titre et texte explicatif |
| Apparaît pour toute adresse non prévue | ✅ | Route `*` du routeur, plus catégorie ou artisan inexistant |

## 7. Référencement

| Exigence | État | Où |
|---|---|---|
| Un titre et une description par page | ✅ | `MetaPage.jsx`, appelé par chacune des pages |

## 8. Technologies imposées

| Exigence | État | Détail |
|---|---|---|
| Figma pour la maquette | ✅ | 17 frames réparties sur trois pages, une par support. Styles de charte et composants réutilisables déclarés dans le fichier |
| ReactJS | ✅ | React 19.2 |
| Bootstrap | ✅ | Bootstrap 5.3, personnalisé par surcharge de ses variables Sass |
| Sass | ✅ | 7 feuilles, une par domaine |
| Node.js | ✅ | Node 22 |
| MySQL ou MariaDB | ✅ | Testé sur MariaDB 10.4 |
| Express | ✅ | Express 5 |
| Sequelize pour l'accès aux données | ✅ | Sequelize 6, aucune requête SQL écrite à la main |
| Git et GitHub | ✅ | Dépôt public, commits thématiques |
| Code propre, commenté, indenté | ✅ | 16 % de lignes de commentaire, `.editorconfig` et `.gitattributes` |
| Conformité aux vérificateurs du W3C | ✅ | HTML : 5 pages rendues à 0 erreur, contrôle rejoué sur la construction déployée. CSS : 2 erreurs, toutes deux dans une règle de Bootstrap 5.3, aucune dans les feuilles du projet |
| Hébergement | ✅ | <https://trouve-ton-artisan.agence-anima.fr>, o2switch, certificat Let's Encrypt |

## 9. Identité graphique

| Exigence | État | Détail |
|---|---|---|
| Police Graphik | 🟡 | Police sous licence commerciale, non embarquable. La charte de la Région prévoit Arial en substitution : c'est cette pile qui est utilisée |
| Logo fourni | ✅ | Extrait du cahier des charges, en-tête et page de garde du dossier |
| Favicon fourni | ✅ | `client/public/favicon.png` |
| Palette de 6 couleurs | ✅ | Reprise à l'identique dans `_variables.scss` |

## 10. Attentes de la Région

| Exigence | État | Détail |
|---|---|---|
| Site accessible à tous, norme WCAG 2.1 | ✅ | Contrastes mesurés sur le rendu, navigation clavier vérifiée, lien d'évitement, structure sémantique, libellés de formulaire |
| Conception mobile first | ✅ | Points de rupture en `min-width` uniquement, vérifié sans débordement dès 375 px |
| Fonctionnement sur une variété de tailles d'écran | ✅ | Contrôlé en 390, 768 et 1440 px |
| Sécurité | ✅ | 12 mesures détaillées dans le dossier, dont 10 vérifiées par des tests automatisés |
| Accès à l'API limité à l'application | ✅ | Clé d'API comparée en temps constant, CORS restreint, limitation de débit. La limite intrinsèque d'une clé côté navigateur est documentée honnêtement |
| Cohérence avec l'environnement numérique de la Région | 🟡 | Palette, logo et police officiels appliqués. Le site institutionnel est protégé contre les robots, la comparaison visuelle directe reste à faire de visu |

## 11. Livrables du dossier

| Exigence | État |
|---|---|
| Dossier au format PDF | ✅ 31 pages |
| Page de garde | ✅ |
| Sommaire | ✅ numéroté, vérifié contre la pagination réelle |
| En-tête et pied de page | ✅ sur chaque page |
| Contexte du projet | ✅ partie 1 |
| Maquettes Figma, captures et lien | ✅ partie 2, captures des 15 écrans et lien de partage |
| Présentation de la base de données (MCD, MLD) | ✅ partie 3 |
| Éléments de sécurité, mise en œuvre et intérêt | ✅ partie 4 |
| Description de la veille de sécurité | ✅ partie 5, deux vulnérabilités réelles analysées |
| Lien vers le dépôt GitHub | ✅ partie 7 |
| Lien du site en ligne | ✅ partie 7 |

## 12. Contenu du dépôt

| Exigence | État |
|---|---|
| Code du projet | ✅ |
| Script de création de la base (.sql) | ✅ `database/01-create-database.sql` |
| Script d'alimentation de la base (.sql) | ✅ `database/02-seed-database.sql` |
| README.md avec prérequis, installation et lancement | ✅ à la racine |

## Ce qui reste à faire

1. **Cohérence visuelle** : comparer de visu avec le site institutionnel de la Région, dont l'accès automatisé est protégé contre les robots.

## Limites connues et assumées

- La feuille de style compilée relève **2 erreurs** au validateur du W3C. Elles proviennent d'une règle de Bootstrap 5.3 associant `:is()` et la pseudo-classe `:autofill`, que le validateur ne reconnaît pas. Les corriger imposerait de modifier une bibliothèque imposée par le cahier des charges, et interdirait ses mises à jour.
- La limitation de débit de l'API a été montée sur `/api` seulement. Appliquée au service entier, qui distribue aussi le site, elle comptait chaque fichier JS, CSS et image dans le quota : un visiteur normal se serait retrouvé bloqué au bout d'une vingtaine de pages.
