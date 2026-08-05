-- =====================================================================
-- Projet      : Trouve ton artisan - Région Auvergne-Rhône-Alpes
-- Fichier     : 01-create-database.sql
-- Objet       : Création de la base de données et de son schéma physique
-- SGBD        : MySQL 8.0+ / MariaDB 10.4+
-- Encodage    : UTF-8 (fichier) / utf8mb4 (base)
-- Utilisation : mysql -u root -p --default-character-set=utf8mb4 < 01-create-database.sql
-- =====================================================================

-- Le jeu de caractères de la connexion est forcé dès l'ouverture du
-- script : sans cela, les libellés accentués (« Bâtiment ») seraient
-- enregistrés de façon incorrecte selon la configuration du client.
SET NAMES utf8mb4;

-- Recréation complète : le script est rejouable à l'identique.
DROP DATABASE IF EXISTS trouve_ton_artisan;

CREATE DATABASE trouve_ton_artisan
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE trouve_ton_artisan;


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


-- =====================================================================
-- SÉCURITÉ : utilisateur applicatif dédié
-- ---------------------------------------------------------------------
-- L'API ne se connecte JAMAIS avec le compte root. Ce compte ne possède
-- que les droits strictement nécessaires à la lecture du catalogue
-- (principe du moindre privilège) : pas de INSERT, UPDATE, DELETE ni
-- DROP. Même en cas d'injection SQL réussie, un attaquant ne pourrait
-- ni modifier ni détruire les données.
--
-- Remplacez le mot de passe ci-dessous avant toute exécution, et
-- reportez-le dans la variable DB_PASSWORD du fichier api/.env.
-- =====================================================================
CREATE USER IF NOT EXISTS 'tta_app'@'localhost'
    IDENTIFIED BY 'CHANGEZ_MOI_mot_de_passe_fort';

GRANT SELECT ON trouve_ton_artisan.categorie  TO 'tta_app'@'localhost';
GRANT SELECT ON trouve_ton_artisan.specialite TO 'tta_app'@'localhost';
GRANT SELECT ON trouve_ton_artisan.artisan    TO 'tta_app'@'localhost';

FLUSH PRIVILEGES;
