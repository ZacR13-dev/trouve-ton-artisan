import { app } from './app.js';
import { config } from './config/env.js';
import { sequelize, testConnection } from './config/database.js';

/**
 * La connexion à la base est vérifiée avant l'ouverture du port : un
 * service qui répond « 200 OK » alors que sa base est injoignable serait
 * bien plus difficile à diagnostiquer qu'un démarrage refusé.
 */
async function demarrer() {
  try {
    await testConnection();
    console.info(
      `[api] Connexion établie à la base « ${config.database.name} » sur ${config.database.host}.`
    );
  } catch (erreur) {
    console.error('[api] Connexion à la base de données impossible :', erreur.message);
    console.error('      Vérifiez que MySQL est démarré et les variables DB_* du fichier .env.');
    process.exit(1);
  }

  const serveur = app.listen(config.port, () => {
    console.info(`[api] En écoute sur http://localhost:${config.port} (${config.env}).`);
  });

  /**
   * Arrêt propre : on cesse d'accepter de nouvelles connexions, on laisse
   * les requêtes en cours se terminer, puis on ferme le pool. Sans cela,
   * un redémarrage coupe les requêtes en vol et laisse des connexions
   * ouvertes côté MySQL.
   */
  const arreter = (signal) => {
    console.info(`[api] Signal ${signal} reçu, arrêt en cours.`);

    serveur.close(async () => {
      await sequelize.close();
      console.info('[api] Arrêt terminé.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('[api] Arrêt forcé : des connexions ne se sont pas fermées.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => arreter('SIGINT'));
  process.on('SIGTERM', () => arreter('SIGTERM'));
}

process.on('unhandledRejection', (raison) => {
  console.error('[api] Promesse rejetée sans gestionnaire :', raison);
  process.exit(1);
});

demarrer();
