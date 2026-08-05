/**
 * Gestion centralisée des erreurs et des routes inconnues.
 *
 * Toutes les erreurs de l'application aboutissent ici. Avec Express 5,
 * les rejets de promesses des gestionnaires asynchrones sont transmis
 * automatiquement, ce qui évite les try/catch répétitifs et surtout les
 * erreurs silencieusement avalées.
 */

import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Route inexistante : renvoie un 404 au format JSON plutôt que la page
 * HTML par défaut d'Express.
 * @type {import('express').RequestHandler}
 */
export function routeInconnue(req, res, next) {
  next(ApiError.notFound(`La route ${req.method} ${req.originalUrl} n'existe pas.`));
}

/**
 * Gestionnaire d'erreurs final.
 *
 * Règle de sécurité : le client ne reçoit jamais de détail technique
 * (pile d'appels, requête SQL, nom de table). Ces informations partent
 * dans les journaux du serveur, où elles sont utiles au développeur sans
 * renseigner un attaquant.
 *
 * @type {import('express').ErrorRequestHandler}
 */
export function gestionnaireErreurs(err, req, res, next) {
  // Express impose la signature à quatre paramètres pour reconnaître un
  // gestionnaire d'erreurs, même si `next` n'est pas utilisé ensuite.
  if (res.headersSent) {
    return next(err);
  }

  let statut = err.statusCode ?? 500;
  let message = err.message ?? 'Erreur interne du serveur.';
  const details = err.details;

  // Erreurs remontées par Sequelize : elles ne doivent jamais être
  // renvoyées telles quelles, elles exposeraient le schéma de la base.
  if (err.name?.startsWith('Sequelize')) {
    console.error('[erreur base de données]', err.name, err.message);
    statut = 503;
    message = 'Le service de données est momentanément indisponible.';
  } else if (!(err instanceof ApiError)) {
    console.error('[erreur inattendue]', err);
    statut = 500;
    message = 'Erreur interne du serveur.';
  } else if (statut >= 500) {
    console.error('[erreur applicative]', err.message);
  }

  const corps = { erreur: message };

  if (details) {
    corps.details = details;
  }

  // La pile d'appels n'est exposée qu'en développement.
  if (!config.isProduction && statut >= 500) {
    corps.stack = err.stack;
  }

  res.status(statut).json(corps);
}
