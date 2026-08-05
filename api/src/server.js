/**
 * Point d'entrée de l'API.
 *
 * La connexion à la base est vérifiée avant l'ouverture du port : un
 * service qui répondrait « 200 OK » alors que sa base est injoignable
 * serait bien plus difficile à diagnostiquer qu'un démarrage refusé.
 */

import { app } from './app.js';
import { config } from './config/env.js';
import { sequelize, testConnection } from './config/database.js';

async function demarrer() {
  try {
    await testConnection();
    console.info(
      `[api] Connexion établie à la base « ${config.database.name} » sur ${config.database.host}.`
    );
  } catch (erreur) {
    console.error('[api] Connexion à la base de données impossible :', erreur.message);
    console.error('      Vérifiez que le serveur MySQL est démarré et les variables DB_* du fichier .env.');
    process.exit(1);
  }

  const serveur = app.listen(config.port, () => {
    console.info(`[api] En écoute sur http://localhost:${config.port} (${config.env}).`);
  });

  /**
   * Arrêt propre : on cesse d'accepter de nouvelles connexions, on laisse
   * les requêtes en cours se terminer, puis on ferme le pool de la base.
   * Sans cela, un redémarrage coupe les requêtes en vol et laisse des
   * connexions ouvertes côté MySQL.
   *
   * @param {string} signal Signal reçu du système.
   */
  const arreter = (signal) => {
    console.info(`[api] Signal ${signal} reçu, arrêt en cours.`);

    serveur.close(async () => {
      await sequelize.close();
      console.info('[api] Arrêt terminé.');
      process.exit(0);
    });

    // Filet de sécurité : si une requête ne se termine pas, on force
    // l'arrêt au bout de dix secondes.
    setTimeout(() => {
      console.error("[api] Arrêt forcé : des connexions ne se sont pas fermées.");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => arreter('SIGINT'));
  process.on('SIGTERM', () => arreter('SIGTERM'));
}

/**
 * Erreurs qui échapperaient à toute la chaîne de gestion : on les
 * journalise avant de laisser le processus s'arrêter, plutôt que de
 * continuer dans un état incertain.
 */
process.on('unhandledRejection', (raison) => {
  console.error('[api] Promesse rejetée sans gestionnaire :', raison);
  process.exit(1);
});

demarrer();
