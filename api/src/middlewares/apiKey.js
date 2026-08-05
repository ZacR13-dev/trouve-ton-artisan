/**
 * Restriction de l'accès à l'API.
 *
 * Le cahier des charges impose que « l'accès à l'API soit limité à
 * l'application ». Chaque requête doit donc présenter la clé partagée
 * dans l'en-tête `x-api-key`. Combinée à la restriction CORS, elle écarte
 * les appels directs depuis un autre site ou un client automatisé.
 */

import { createHash, timingSafeEqual } from 'node:crypto';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Compare deux chaînes en temps constant.
 *
 * Une comparaison classique avec === s'interrompt au premier caractère
 * différent : le temps de réponse renseigne alors un attaquant sur le
 * nombre de caractères corrects, ce qui permet de reconstituer la clé
 * caractère par caractère. Le passage par une empreinte SHA-256 donne
 * deux tampons de longueur identique, condition exigée par
 * timingSafeEqual.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function comparaisonSecurisee(a, b) {
  const empreinteA = createHash('sha256').update(String(a)).digest();
  const empreinteB = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(empreinteA, empreinteB);
}

/**
 * Middleware Express de contrôle de la clé d'API.
 * @type {import('express').RequestHandler}
 */
export function verifierCleApi(req, res, next) {
  const cleFournie = req.get('x-api-key');

  if (!cleFournie || !comparaisonSecurisee(cleFournie, config.apiKey)) {
    // Le message reste volontairement vague : préciser que la clé est
    // « absente » plutôt qu'« invalide » aiderait un attaquant.
    return next(ApiError.unauthorized("Accès refusé : clé d'API invalide."));
  }

  return next();
}
