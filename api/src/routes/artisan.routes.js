import { Router } from 'express';
import { param, query } from 'express-validator';
import { listerArtisans, obtenirArtisan } from '../controllers/artisan.controller.js';
import { validerRequete } from '../middlewares/validate.js';

export const artisanRoutes = Router();

/**
 * Toute donnée venant du client est contrôlée avant d'atteindre le
 * contrôleur : type, longueur et format. Ce qui n'est pas conforme part
 * en 400 et n'approche jamais la couche d'accès aux données.
 */
artisanRoutes.get(
  '/',
  [
    query('categorie')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('La catégorie demandée est invalide.'),
    query('recherche')
      .optional()
      .trim()
      // Plus long que le nom le plus long de la base : inutile d'aller
      // interroger MySQL.
      .isLength({ max: 100 })
      .withMessage('La recherche est limitée à 100 caractères.'),
    query('top')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Le paramètre « top » attend « true » ou « false ».')
  ],
  validerRequete,
  listerArtisans
);

artisanRoutes.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage("L'identifiant de l'artisan doit être un entier positif.")
      .toInt()
  ],
  validerRequete,
  obtenirArtisan
);
