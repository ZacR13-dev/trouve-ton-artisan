import { Router } from 'express';
import { verifierCleApi } from '../middlewares/apiKey.js';
import { categorieRoutes } from './categorie.routes.js';
import { artisanRoutes } from './artisan.routes.js';
import { contactRoutes } from './contact.routes.js';

export const routes = Router();

/**
 * Point de supervision, volontairement ouvert : il permet à l'hébergeur
 * de vérifier que le service répond, sans divulguer ni version ni état
 * de la base.
 */
routes.get('/sante', (req, res) => {
  res.json({ statut: 'ok' });
});

// La clé est vérifiée une fois pour toutes les routes métier : une route
// ajoutée plus tard est protégée d'office.
routes.use(verifierCleApi);

routes.use('/categories', categorieRoutes);
routes.use('/artisans', artisanRoutes);
routes.use('/contact', contactRoutes);
