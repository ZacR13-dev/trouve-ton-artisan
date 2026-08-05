import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { envoyerMessage } from '../controllers/contact.controller.js';
import { validerRequete } from '../middlewares/validate.js';
import { config } from '../config/env.js';

export const contactRoutes = Router();

/**
 * Seul point d'entrée en écriture de l'API, et donc le plus exposé :
 * sans limitation stricte, il deviendrait un relais d'envoi d'e-mails
 * gratuit pour un spammeur.
 */
const limiteurContact = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.rateLimit.contactMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erreur: 'Vous avez envoyé trop de messages en peu de temps. Merci de réessayer dans une heure.'
  }
});

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

    // Champ piège. Il n'est volontairement pas rejeté ici : c'est le
    // contrôleur qui renvoie un faux succès.
    body('siteWeb').optional().isLength({ max: 255 })
  ],
  validerRequete,
  envoyerMessage
);
