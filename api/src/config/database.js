import { Sequelize } from 'sequelize';
import { config } from './env.js';

/**
 * Instance Sequelize partagée par toute l'application.
 *
 * C'est le composant d'accès aux données : les valeurs transmises par
 * l'utilisateur sont toujours passées en paramètres liés et jamais
 * concaténées au SQL, ce qui constitue la première protection contre
 * l'injection.
 */
export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,

    // En production, ces journaux exposeraient la structure de la base.
    logging: config.isProduction ? false : (message) => console.log(`[sql] ${message}`),

    define: {
      // Les tables viennent des scripts SQL fournis : Sequelize ne doit
      // ni les renommer au pluriel ni ajouter de colonnes.
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
      // Interdit d'enchaîner plusieurs requêtes dans un même appel.
      multipleStatements: false
    }
  }
);

export async function testConnection() {
  await sequelize.authenticate();
}
