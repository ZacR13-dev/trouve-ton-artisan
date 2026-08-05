/**
 * Instance Sequelize partagée par toute l'application.
 *
 * Sequelize est le composant d'accès aux données : il construit des
 * requêtes préparées, dans lesquelles les valeurs transmises par
 * l'utilisateur sont toujours passées en paramètres et jamais
 * concaténées au SQL. C'est la première protection contre l'injection
 * SQL.
 */

import { Sequelize } from 'sequelize';
import { config } from './env.js';

export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,

    // Les requêtes ne sont tracées qu'en développement : en production
    // ces journaux exposeraient la structure de la base.
    logging: config.isProduction ? false : (msg) => console.log(`[sql] ${msg}`),

    define: {
      // Les tables sont créées par les scripts SQL fournis : Sequelize
      // ne doit ni les renommer au pluriel ni ajouter de colonnes.
      freezeTableName: true,
      timestamps: false
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    dialectOptions: {
      charset: 'utf8mb4',
      // Empêche le driver d'exécuter plusieurs requêtes dans un même
      // appel, ce qui neutralise les injections SQL « en chaîne ».
      multipleStatements: false
    }
  }
);

/**
 * Vérifie que la base est joignable au démarrage de l'API.
 * @throws {Error} si la connexion échoue.
 */
export async function testConnection() {
  await sequelize.authenticate();
}
