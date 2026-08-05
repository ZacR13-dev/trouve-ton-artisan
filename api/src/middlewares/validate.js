/**
 * Passerelle entre express-validator et la gestion d'erreurs maison.
 *
 * Les règles de validation sont déclarées dans les fichiers de routes ;
 * ce middleware se contente de collecter leur résultat et d'interrompre
 * la requête si une donnée est invalide. Aucune valeur non validée
 * n'atteint donc les contrôleurs.
 */

import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * @type {import('express').RequestHandler}
 */
export function validerRequete(req, res, next) {
  const resultat = validationResult(req);

  if (resultat.isEmpty()) {
    return next();
  }

  // Les messages sont regroupés par champ pour que le front puisse les
  // afficher directement sous l'entrée concernée.
  const details = resultat.array().reduce((accumulateur, erreur) => {
    const champ = erreur.path ?? erreur.param ?? 'general';
    accumulateur[champ] = erreur.msg;
    return accumulateur;
  }, {});

  return next(ApiError.badRequest('Les données envoyées sont invalides.', details));
}
