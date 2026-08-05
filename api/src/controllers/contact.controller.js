import { Artisan } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { envoyerMessageArtisan } from '../services/mailer.js';

/**
 * POST /api/contact
 *
 * L'internaute n'écrit jamais directement à l'artisan : il envoie son
 * message à l'API, qui retrouve l'adresse en base et se charge de
 * l'envoi. L'adresse n'apparaît donc ni dans le code du site ni dans les
 * réponses de l'API.
 */
export async function envoyerMessage(req, res) {
  const { artisanId, nom, email, objet, message, siteWeb } = req.body;

  // Champ piège, invisible pour un humain. On répond un faux succès :
  // signaler la détection apprendrait au robot à contourner le piège.
  if (siteWeb) {
    console.warn('[contact] Soumission automatisée écartée (piège rempli).');
    return res.status(202).json({ message: 'Votre message a bien été transmis.' });
  }

  const artisan = await Artisan.unscoped().findByPk(artisanId);

  if (!artisan) {
    throw ApiError.notFound("Cet artisan n'existe pas ou n'est plus référencé.");
  }

  const { redirige } = await envoyerMessageArtisan({ artisan, nom, email, objet, message });

  res.status(202).json({
    message: `Votre message a bien été transmis à ${artisan.nom}. Une réponse vous sera apportée sous 48 heures.`,
    modeDemonstration: redirige
  });
}
