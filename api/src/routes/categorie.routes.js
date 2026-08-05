/**
 * Routes des catégories.
 */

import { Router } from 'express';
import { listerCategories } from '../controllers/categorie.controller.js';

export const categorieRoutes = Router();

/** GET /api/categories : alimente le menu principal du site. */
categorieRoutes.get('/', listerCategories);
