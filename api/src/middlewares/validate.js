import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Collecte le résultat des règles déclarées dans les fichiers de routes
 * et interrompt la requête si une donnée est invalide. Aucune valeur non
 * validée n'atteint donc les contrôleurs.
 */
export function validerRequete(req, res, next) {
  const resultat = validationResult(req);

  if (resultat.isEmpty()) {
    return next();
  }

  // Regroupés par champ, pour que le front les affiche sous l'entrée
  // concernée.
  const details = resultat.array().reduce((accumulateur, erreur) => {
    const champ = erreur.path ?? erreur.param ?? 'general';
    accumulateur[champ] = erreur.msg;
    return accumulateur;
  }, {});

  return next(ApiError.badRequest('Les données envoyées sont invalides.', details));
}
