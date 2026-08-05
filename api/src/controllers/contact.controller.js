/**
 * Contrôleur du formulaire de contact.
 *
 * L'internaute n'écrit jamais directement à l'artisan : il envoie son
 * message à l'API, qui retrouve l'adresse du destinataire en base et
 * effectue l'envoi. L'adresse e-mail de l'artisan n'apparaît donc jamais
 * dans le code source du site ni dans les réponses de l'API.
 */

import { Artisan } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { envoyerMessageArtisan } from '../services/mailer.js';

/**
 * POST /api/contact
 *
 * Corps attendu : artisanId, nom, email, objet, message.
 * Le champ `siteWeb` est un piège à robots : invisible pour un humain,
 * il n'est rempli que par les automates de spam.
 *
 * @type {import('express').RequestHandler}
 */
export async function envoyerMessage(req, res) {
  const { artisanId, nom, email, objet, message, siteWeb } = req.body;

  // Piège à robots. On renvoie une réponse de succès sans rien envoyer :
  // signaler la détection apprendrait au robot à contourner le piège.
  if (siteWeb) {
    console.warn('[contact] Soumission automatisée écartée (piège rempli).');
    return res.status(202).json({
      message: 'Votre message a bien été transmis.'
    });
  }

  // unscoped() lève l'exclusion de la colonne email posée par défaut sur
  // le modèle : elle est nécessaire ici, et uniquement ici.
  const artisan = await Artisan.unscoped().findByPk(artisanId);

  if (!artisan) {
    throw ApiError.notFound("Cet artisan n'existe pas ou n'est plus référencé.");
  }

  const { redirige } = await envoyerMessageArtisan({
    artisan,
    nom,
    email,
    objet,
    message
  });

  res.status(202).json({
    message: `Votre message a bien été transmis à ${artisan.nom}. Une réponse vous sera apportée sous 48 heures.`,
    // Information utile en démonstration, sans intérêt pour un attaquant.
    modeDemonstration: redirige
  });
}
