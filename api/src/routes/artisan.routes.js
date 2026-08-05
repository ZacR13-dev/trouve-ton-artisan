/**
 * Routes des artisans, avec la validation de leurs paramètres.
 *
 * Toute donnée venant du client est contrôlée avant d'atteindre le
 * contrôleur : type, longueur et format. Ce qui n'est pas conforme est
 * rejeté en 400, jamais transmis à la couche d'accès aux données.
 */

import { Router } from 'express';
import { param, query } from 'express-validator';
import { listerArtisans, obtenirArtisan } from '../controllers/artisan.controller.js';
import { validerRequete } from '../middlewares/validate.js';

export const artisanRoutes = Router();

/**
 * GET /api/artisans
 * Filtres facultatifs : categorie, recherche, top.
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
      // Une recherche plus longue que le nom le plus long de la base ne
      // peut correspondre à rien : autant l'écarter tout de suite.
      .isLength({ max: 100 })
      .withMessage('La recherche est limitée à 100 caractères.'),
    query('top')
      .optional()
      .isIn(['true', 'false'])
      .withMessage("Le paramètre « top » attend « true » ou « false ».")
  ],
  validerRequete,
  listerArtisans
);

/**
 * GET /api/artisans/:id
 * Fiche complète. L'identifiant doit être un entier positif : cette
 * seule règle écarte les tentatives de passage de valeurs exotiques.
 */
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
