/**
 * Point d'entrée des modèles : déclare les associations entre les trois
 * entités, puis réexporte l'ensemble.
 *
 * Les associations traduisent exactement les règles de gestion du
 * cahier des charges :
 *   - une catégorie regroupe plusieurs spécialités ;
 *   - une spécialité appartient à une seule catégorie ;
 *   - une spécialité est exercée par plusieurs artisans ;
 *   - un artisan exerce une seule spécialité.
 */

import { sequelize } from '../config/database.js';
import { Categorie } from './Categorie.js';
import { Specialite } from './Specialite.js';
import { Artisan } from './Artisan.js';

// Categorie 1 --- n Specialite
Categorie.hasMany(Specialite, {
  foreignKey: 'id_categorie',
  as: 'specialites'
});
Specialite.belongsTo(Categorie, {
  foreignKey: 'id_categorie',
  as: 'categorie'
});

// Specialite 1 --- n Artisan
Specialite.hasMany(Artisan, {
  foreignKey: 'id_specialite',
  as: 'artisans'
});
Artisan.belongsTo(Specialite, {
  foreignKey: 'id_specialite',
  as: 'specialite'
});

export { sequelize, Categorie, Specialite, Artisan };
