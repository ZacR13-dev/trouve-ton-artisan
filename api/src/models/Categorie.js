import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/** Les quatre familles d'artisanat affichées dans le menu principal. */
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
  { tableName: 'categorie' }
);
