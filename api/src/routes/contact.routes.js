/**
 * Route du formulaire de contact.
 *
 * C'est le seul point d'entrée en écriture de l'API, et donc le plus
 * exposé : il cumule une limitation de débit renforcée, une validation
 * stricte de chaque champ et un piège à robots.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { envoyerMessage } from '../controllers/contact.controller.js';
import { validerRequete } from '../middlewares/validate.js';
import { config } from '../config/env.js';

export const contactRoutes = Router();

/**
 * Limitation propre au formulaire, bien plus stricte que la limitation
 * générale : sans elle, l'API deviendrait un relais d'envoi d'e-mails
 * gratuit pour un spammeur.
 */
const limiteurContact = rateLimit({
  windowMs: 60 * 60 * 1000, // une heure
  max: config.rateLimit.contactMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erreur:
      'Vous avez envoyé trop de messages en peu de temps. Merci de réessayer dans une heure.'
  }
});

/** POST /api/contact */
contactRoutes.post(
  '/',
  limiteurContact,
  [
    body('artisanId')
      .isInt({ min: 1 })
      .withMessage("L'artisan destinataire est invalide.")
      .toInt(),

    body('nom')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom doit contenir entre 2 et 100 caractères.'),

    body('email')
      .trim()
      .isEmail()
      .withMessage("L'adresse e-mail n'est pas valide.")
      // Ramène l'adresse à une forme canonique, sans toucher au domaine.
      .normalizeEmail({ gmail_remove_dots: false })
      .isLength({ max: 255 })
      .withMessage("L'adresse e-mail est trop longue."),

    body('objet')
      .trim()
      .isLength({ min: 3, max: 150 })
      .withMessage("L'objet doit contenir entre 3 et 150 caractères."),

    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Le message doit contenir entre 10 et 2000 caractères.'),

    // Piège à robots : le champ « siteWeb » est masqué dans le
    // formulaire, un humain ne peut donc pas le remplir. Il n'est
    // volontairement pas rejeté ici. C'est le contrôleur qui l'examine et
    // renvoie un faux succès : répondre « 400 champ interdit » enseignerait
    // au robot quel champ laisser vide au prochain essai.
    body('siteWeb').optional().isLength({ max: 255 })
  ],
  validerRequete,
  envoyerMessage
);
