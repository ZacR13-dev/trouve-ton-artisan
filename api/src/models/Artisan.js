/**
 * Modèle Artisan : la fiche d'un artisan ou d'une entreprise.
 * Il reflète la table `artisan` créée par 01-create-database.sql.
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Artisan = sequelize.define(
  'Artisan',
  {
    id_artisan: {
      type: DataTypes.SMALLINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    note: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0,
      /**
       * Le pilote MySQL renvoie les DECIMAL sous forme de chaîne
       * ("4.5") pour préserver la précision. Le front a besoin d'un
       * nombre pour calculer l'affichage des étoiles : la conversion
       * est faite ici, une fois pour toutes.
       * @returns {number|null}
       */
      get() {
        const valeur = this.getDataValue('note');
        return valeur === null ? null : Number(valeur);
      }
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    a_propos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    site_web: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    artisan_du_mois: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    id_specialite: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false
    }
  },
  {
    tableName: 'artisan',
    defaultScope: {
      /**
       * L'adresse e-mail des artisans n'est jamais exposée par l'API :
       * le formulaire de contact envoie le message côté serveur, à
       * partir de l'identifiant de l'artisan. Une adresse publiée dans
       * une réponse JSON serait immédiatement moissonnée par les robots
       * de spam.
       *
       * Seul le contrôleur de contact lève cette restriction, via
       * `Artisan.unscoped()`, pour connaître le destinataire du message.
       */
      attributes: { exclude: ['email'] }
    }
  }
);
