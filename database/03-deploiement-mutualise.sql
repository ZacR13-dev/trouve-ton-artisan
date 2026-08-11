-- =====================================================================
-- Projet      : Trouve ton artisan - Région Auvergne-Rhône-Alpes
-- Fichier     : 03-deploiement-mutualise.sql
-- Objet       : Schéma et données pour un hébergement mutualisé (cPanel)
-- SGBD        : MySQL 8.0+ / MariaDB 10.4+
-- =====================================================================
--
-- Ce fichier est DÉRIVÉ de 01-create-database.sql et 02-seed-database.sql,
-- qui restent les scripts de référence du projet. Il n'existe que pour le
-- déploiement en hébergement mutualisé, où trois opérations sont refusées
-- au compte client et relèvent du panneau de l'hébergeur :
--
--   * CREATE DATABASE : la base est créée depuis cPanel, qui préfixe son
--     nom avec l'identifiant du compte (par exemple « abcd1234_tta »).
--   * CREATE USER     : le compte applicatif est créé depuis cPanel, lui
--     aussi préfixé.
--   * GRANT           : les droits se cochent dans cPanel. Le principe du
--     moindre privilège reste entier : ne cocher que SELECT, jamais
--     INSERT, UPDATE, DELETE ni DROP, comme dans le script de référence.
--
-- Mode d'emploi : créer d'abord la base et l'utilisateur dans cPanel, puis
-- importer CE fichier dans phpMyAdmin, base sélectionnée. Aucune ligne
-- « USE » n'y figure : le script s'applique à la base ouverte. VÉRIFIEZ
-- DONC LA BASE SÉLECTIONNÉE AVANT D'IMPORTER.
--
-- Ce script ne contient volontairement aucune instruction destructrice :
-- ni DROP, ni TRUNCATE, ni DELETE. Importé par erreur sur une base déjà
-- occupée, il s'arrête sur une erreur sans rien effacer.
-- =====================================================================

SET NAMES utf8mb4;




-- ---------------------------------------------------------------------
-- Table : categorie
-- Les 4 grandes familles d'artisanat affichées dans le menu principal.
-- Le libellé du menu est lu ici, jamais codé en dur dans le front.
-- ---------------------------------------------------------------------
CREATE TABLE categorie (
    id_categorie TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom          VARCHAR(50)      NOT NULL,

    CONSTRAINT pk_categorie PRIMARY KEY (id_categorie),
    -- Deux catégories ne peuvent pas porter le même nom.
    CONSTRAINT uq_categorie_nom UNIQUE (nom)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Catégories d''artisanat (Bâtiment, Services, Fabrication, Alimentation)';


-- ---------------------------------------------------------------------
-- Table : specialite
-- Métier précis exercé par l'artisan (Boulanger, Plombier...).
-- Règle de gestion : une spécialité est rattachée à une seule catégorie.
-- ---------------------------------------------------------------------
CREATE TABLE specialite (
    id_specialite SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom           VARCHAR(50)       NOT NULL,
    id_categorie  TINYINT UNSIGNED  NOT NULL,

    CONSTRAINT pk_specialite PRIMARY KEY (id_specialite),
    CONSTRAINT uq_specialite_nom UNIQUE (nom),
    -- RESTRICT : on interdit la suppression d'une catégorie encore
    -- utilisée, ce qui évite de laisser des spécialités orphelines.
    CONSTRAINT fk_specialite_categorie
        FOREIGN KEY (id_categorie) REFERENCES categorie (id_categorie)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Spécialités artisanales, rattachées à une seule catégorie';

-- Index sur la clé étrangère : accélère le filtrage des spécialités
-- d'une catégorie (page liste des artisans par catégorie).
CREATE INDEX idx_specialite_categorie ON specialite (id_categorie);


-- ---------------------------------------------------------------------
-- Table : artisan
-- Fiche d'un artisan ou d'une entreprise artisanale.
-- Règle de gestion : un artisan apparaît dans une seule spécialité.
-- ---------------------------------------------------------------------
CREATE TABLE artisan (
    id_artisan      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom             VARCHAR(100)      NOT NULL,
    -- Note sur 5 avec une décimale (ex. 4.5). La contrainte CHECK
    -- garantit qu'une valeur aberrante ne peut pas entrer en base,
    -- même par une voie extérieure à l'application.
    note            DECIMAL(2,1)      NOT NULL DEFAULT 0.0,
    ville           VARCHAR(100)      NOT NULL,
    a_propos        TEXT              NULL,
    email           VARCHAR(255)      NOT NULL,
    -- Site web facultatif : tous les artisans n'en possèdent pas.
    site_web        VARCHAR(255)      NULL,
    -- Visuel de la fiche artisan (le cahier des charges impose une image).
    -- NULL = le front affiche l'illustration générique de la spécialité.
    image           VARCHAR(255)      NULL,
    -- Mis en avant dans la rubrique « Les artisans du mois » de l'accueil.
    artisan_du_mois BOOLEAN           NOT NULL DEFAULT FALSE,
    id_specialite   SMALLINT UNSIGNED NOT NULL,

    CONSTRAINT pk_artisan PRIMARY KEY (id_artisan),
    CONSTRAINT ck_artisan_note CHECK (note >= 0 AND note <= 5),
    CONSTRAINT fk_artisan_specialite
        FOREIGN KEY (id_specialite) REFERENCES specialite (id_specialite)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Artisans référencés sur la plateforme';

-- Index de la clé étrangère (jointure spécialité puis catégorie).
CREATE INDEX idx_artisan_specialite ON artisan (id_specialite);
-- Index sur le nom : sert la barre de recherche du header.
CREATE INDEX idx_artisan_nom ON artisan (nom);
-- Index sur le drapeau : l'accueil ne remonte que les artisans du mois.
CREATE INDEX idx_artisan_du_mois ON artisan (artisan_du_mois);

-- Le vidage préalable des tables, présent dans 02-seed-database.sql,
-- a été volontairement retiré de ce script de déploiement : sur un
-- hébergement partagé, un TRUNCATE lancé sur la mauvaise base effacerait
-- les données d'un autre site. Ce script s'adresse à une base neuve et
-- vide. Réimporté par erreur, il échoue sur les clés primaires en double
-- plutôt que d'effacer quoi que ce soit.


-- ---------------------------------------------------------------------
-- 1. Catégories : les 4 entrées du menu principal
-- ---------------------------------------------------------------------
INSERT INTO categorie (id_categorie, nom) VALUES
    (1, 'Bâtiment'),
    (2, 'Services'),
    (3, 'Fabrication'),
    (4, 'Alimentation');


-- ---------------------------------------------------------------------
-- 2. Spécialités : chacune rattachée à une seule catégorie
-- ---------------------------------------------------------------------
INSERT INTO specialite (id_specialite, nom, id_categorie) VALUES
    -- Bâtiment
    (1,  'Chauffagiste', 1),
    (2,  'Electricien',  1),
    (3,  'Menuisier',    1),
    (4,  'Plombier',     1),
    -- Services
    (5,  'Coiffeur',     2),
    (6,  'Fleuriste',    2),
    (7,  'Toiletteur',   2),
    (8,  'Webdesign',    2),
    -- Fabrication
    (9,  'Bijoutier',    3),
    (10, 'Couturier',    3),
    (11, 'Ferronier',    3),
    -- Alimentation
    (12, 'Boucher',      4),
    (13, 'Boulanger',    4),
    (14, 'Chocolatier',  4),
    (15, 'Traiteur',     4);


-- ---------------------------------------------------------------------
-- 3. Artisans : les 17 fiches fournies par le client
-- ---------------------------------------------------------------------
-- Le texte « À propos » est identique pour tous les artisans dans le jeu
-- d'essai fourni. Il est stocké dans une variable de session pour éviter
-- 17 répétitions et garder le script lisible.
SET @a_propos = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eleifend ante sem, id volutpat massa fermentum nec. Praesent volutpat scelerisque mauris, quis sollicitudin tellus sollicitudin.';

-- La colonne « image » reste NULL : le front affiche alors
-- l'illustration générique de la spécialité, en attendant que
-- l'application d'alimentation prévue par le client fournisse les
-- photos réelles des artisans.
-- Les données sont reprises du fichier client, à la seule exception de
-- la casse de deux villes normalisée pour l'affichage public
-- (« Bourg-en-Bresse » et « Aix-les-Bains »).
INSERT INTO artisan (nom, note, ville, a_propos, email, site_web, image, artisan_du_mois, id_specialite) VALUES
    -- --- Alimentation ---
    ('Boucherie Dumont',       4.5, 'Lyon',             @a_propos, 'boucherie.dumond@gmail.com',             NULL,                                     NULL, FALSE, 12),
    ('Au pain chaud',          4.8, 'Montélimar',       @a_propos, 'aupainchaud@hotmail.com',                NULL,                                     NULL, TRUE,  13),
    ('Chocolaterie Labbé',     4.9, 'Lyon',             @a_propos, 'chocolaterie-labbe@gmail.com',           'https://chocolaterie-labbe.fr',          NULL, TRUE,  14),
    ('Traiteur Truchon',       4.1, 'Lyon',             @a_propos, 'contact@truchon-traiteur.fr',            'https://truchon-traiteur.fr',            NULL, FALSE, 15),

    -- --- Bâtiment ---
    ('Orville Salmons',        5.0, 'Evian',            @a_propos, 'o-salmons@live.com',                     NULL,                                     NULL, TRUE,  1),
    ('Mont Blanc Eléctricité', 4.5, 'Chamonix',         @a_propos, 'contact@mont-blanc-electricite.com',     'https://mont-blanc-electricite.com',     NULL, FALSE, 2),
    ('Boutot & fils',          4.7, 'Bourg-en-Bresse',  @a_propos, 'boutot-menuiserie@gmail.com',            'https://boutot-menuiserie.com',          NULL, FALSE, 3),
    ('Vallis Bellemare',       4.0, 'Vienne',           @a_propos, 'v.bellemare@gmail.com',                  'https://plomberie-bellemare.com',        NULL, FALSE, 4),

    -- --- Fabrication ---
    ('Claude Quinn',           4.2, 'Aix-les-Bains',    @a_propos, 'claude.quinn@gmail.com',                 NULL,                                     NULL, FALSE, 9),
    ('Amitee Lécuyer',         4.5, 'Annecy',           @a_propos, 'a.amitee@hotmail.com',                   'https://lecuyer-couture.com',            NULL, FALSE, 10),
    ('Ernest Carignan',        5.0, 'Le Puy-en-Velay',  @a_propos, 'e-carigan@hotmail.com',                  NULL,                                     NULL, FALSE, 11),

    -- --- Services ---
    ('Royden Charbonneau',     3.8, 'Saint-Priest',     @a_propos, 'r.charbonneau@gmail.com',                NULL,                                     NULL, FALSE, 5),
    ('Leala Dennis',           3.8, 'Chambéry',         @a_propos, 'l.dennos@hotmail.fr',                    'https://coiffure-leala-chambery.fr',     NULL, FALSE, 5),
    ('C''est sup''hair',       4.1, 'Romans-sur-Isère', @a_propos, 'sup-hair@gmail.com',                     'https://sup-hair.fr',                    NULL, FALSE, 5),
    ('Le monde des fleurs',    4.6, 'Annonay',          @a_propos, 'contact@le-monde-des-fleurs-annonay.fr', 'https://le-monde-des-fleurs-annonay.fr', NULL, FALSE, 6),
    ('Valérie Laderoute',      4.5, 'Valence',          @a_propos, 'v-laredoute@gmail.com',                  NULL,                                     NULL, FALSE, 7),
    ('CM Graphisme',           4.4, 'Valence',          @a_propos, 'contact@cm-graphisme.com',               'https://cm-graphisme.com',               NULL, FALSE, 8);


-- =====================================================================
-- JEU D'ESSAI : requêtes de contrôle
-- Exécutées à la suite de l'alimentation, elles vérifient que les
-- données et les relations sont conformes aux règles de gestion.
-- =====================================================================

-- Attendu : 4 catégories, 15 spécialités, 17 artisans.
SELECT 'categories' AS table_controlee, COUNT(*) AS total FROM categorie
UNION ALL
SELECT 'specialites', COUNT(*) FROM specialite
UNION ALL
SELECT 'artisans',    COUNT(*) FROM artisan;

-- Attendu : exactement 3 artisans du mois
-- (Au pain chaud, Chocolaterie Labbé, Orville Salmons).
SELECT nom, ville, note
FROM artisan
WHERE artisan_du_mois = TRUE;

-- Attendu : Alimentation 4, Bâtiment 4, Fabrication 3, Services 6.
SELECT c.nom AS categorie, COUNT(a.id_artisan) AS nb_artisans
FROM categorie c
    LEFT JOIN specialite s ON s.id_categorie = c.id_categorie
    LEFT JOIN artisan    a ON a.id_specialite = s.id_specialite
GROUP BY c.id_categorie, c.nom
ORDER BY c.nom;

-- Attendu : aucune ligne. Vérifie qu'aucune note n'est hors de [0 ; 5].
SELECT id_artisan, nom, note
FROM artisan
WHERE note < 0 OR note > 5;

-- Attendu : un aperçu complet de la jointure des 3 tables.
SELECT a.nom AS artisan, s.nom AS specialite, c.nom AS categorie, a.ville, a.note
FROM artisan a
    INNER JOIN specialite s ON s.id_specialite = a.id_specialite
    INNER JOIN categorie  c ON c.id_categorie  = s.id_categorie
ORDER BY c.nom, s.nom, a.nom;

