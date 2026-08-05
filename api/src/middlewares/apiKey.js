import { createHash, timingSafeEqual } from 'node:crypto';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Compare deux chaînes en temps constant.
 *
 * Une comparaison avec === s'interrompt au premier caractère différent :
 * le temps de réponse renseigne alors un attaquant sur le nombre de
 * caractères corrects, ce qui permet de reconstituer la clé morceau par
 * morceau. Passer par une empreinte donne en prime deux tampons de
 * longueur identique, ce qu'exige timingSafeEqual.
 */
function comparaisonSecurisee(a, b) {
  const empreinteA = createHash('sha256').update(String(a)).digest();
  const empreinteB = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(empreinteA, empreinteB);
}

/**
 * Le cahier des charges impose de limiter l'accès à l'API à
 * l'application : chaque requête doit présenter la clé partagée.
 */
export function verifierCleApi(req, res, next) {
  const cleFournie = req.get('x-api-key');

  if (!cleFournie || !comparaisonSecurisee(cleFournie, config.apiKey)) {
    // Message volontairement vague : distinguer « absente » d'« invalide »
    // renseignerait l'attaquant.
    return next(ApiError.unauthorized("Accès refusé : clé d'API invalide."));
  }

  return next();
}
