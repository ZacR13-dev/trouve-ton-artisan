/**
 * Modèle Specialite : le métier exercé par l'artisan.
 * Il reflète la table `specialite` créée par 01-create-database.sql.
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Specialite = sequelize.define(
  'Specialite',
  {
    id_specialite: {
      type: DataTypes.SMALLINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    id_categorie: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    }
  },
  {
    tableName: 'specialite'
  }
);
