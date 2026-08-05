/**
 * Assemblage des routes de l'API sous le préfixe /api.
 *
 * La clé d'API est vérifiée ici, une fois, pour l'ensemble des routes
 * métier : impossible d'oublier de protéger une route ajoutée plus tard.
 * Seul le point de supervision reste ouvert.
 */

import { Router } from 'express';
import { verifierCleApi } from '../middlewares/apiKey.js';
import { categorieRoutes } from './categorie.routes.js';
import { artisanRoutes } from './artisan.routes.js';
import { contactRoutes } from './contact.routes.js';

export const routes = Router();

/**
 * GET /api/sante
 * Point de supervision, volontairement accessible sans clé : il permet
 * à l'hébergeur de vérifier que le service répond. Il ne divulgue
 * aucune donnée (ni version, ni état de la base).
 */
routes.get('/sante', (req, res) => {
  res.json({ statut: 'ok' });
});

// À partir d'ici, toute requête doit présenter une clé d'API valide.
routes.use(verifierCleApi);

routes.use('/categories', categorieRoutes);
routes.use('/artisans', artisanRoutes);
routes.use('/contact', contactRoutes);
