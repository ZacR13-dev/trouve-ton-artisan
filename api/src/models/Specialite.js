import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/** Métier exercé par l'artisan : boulanger, plombier, coiffeur... */
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
  { tableName: 'specialite' }
);
