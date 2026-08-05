import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/** Route inexistante : un 404 en JSON plutôt que la page HTML d'Express. */
export function routeInconnue(req, res, next) {
  next(ApiError.notFound(`La route ${req.method} ${req.originalUrl} n'existe pas.`));
}

/**
 * Gestionnaire d'erreurs final. Toutes les erreurs de l'application
 * aboutissent ici, y compris les rejets de promesses des gestionnaires
 * asynchrones, transmis automatiquement depuis Express 5.
 *
 * Le client ne reçoit jamais de détail technique : pile d'appels, requête
 * SQL ou nom de table dessineraient une carte du système. Ces
 * informations partent dans les journaux du serveur.
 */
export function gestionnaireErreurs(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statut = err.statusCode ?? 500;
  let message = err.message ?? 'Erreur interne du serveur.';
  const details = err.details;

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

  if (!config.isProduction && statut >= 500) {
    corps.stack = err.stack;
  }

  res.status(statut).json(corps);
}
