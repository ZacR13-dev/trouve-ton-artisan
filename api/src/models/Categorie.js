/**
 * Modèle Categorie : les quatre familles d'artisanat du menu principal.
 * Il reflète la table `categorie` créée par 01-create-database.sql.
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Categorie = sequelize.define(
  'Categorie',
  {
    id_categorie: {
      type: DataTypes.TINYINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: 'categorie'
  }
);
