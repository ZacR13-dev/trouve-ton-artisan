import { sequelize } from '../config/database.js';
import { Categorie } from './Categorie.js';
import { Specialite } from './Specialite.js';
import { Artisan } from './Artisan.js';

/**
 * Associations entre les trois entités. Elles traduisent les règles de
 * gestion du cahier des charges : une catégorie regroupe plusieurs
 * spécialités, une spécialité appartient à une seule catégorie, et un
 * artisan exerce une seule spécialité.
 */

Categorie.hasMany(Specialite, { foreignKey: 'id_categorie', as: 'specialites' });
Specialite.belongsTo(Categorie, { foreignKey: 'id_categorie', as: 'categorie' });

Specialite.hasMany(Artisan, { foreignKey: 'id_specialite', as: 'artisans' });
Artisan.belongsTo(Specialite, { foreignKey: 'id_specialite', as: 'specialite' });

export { sequelize, Categorie, Specialite, Artisan };
