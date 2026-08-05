import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { config } from './config/env.js';
import { routes } from './routes/index.js';
import { gestionnaireErreurs, routeInconnue } from './middlewares/errorHandler.js';

export const app = express();

/**
 * L'ordre des middlewares compte : les protections s'appliquent avant
 * la moindre logique métier, et le gestionnaire d'erreurs vient
 * obligatoirement en dernier.
 */

// Derrière un reverse proxy, sans cette option toutes les requêtes
// sembleraient venir de la même IP et la limitation de débit bloquerait
// tous les visiteurs à la fois.
app.set('trust proxy', 1);

// Annoncer sa pile technique facilite le travail de reconnaissance.
app.disable('x-powered-by');

// Helmet pose les en-têtes de sécurité : nosniff, protection contre le
// clickjacking, HTTPS imposé pour les visites suivantes.
app.use(helmet());

/**
 * Seules les origines déclarées peuvent appeler l'API depuis un
 * navigateur. Les requêtes sans origine (outils en ligne de commande,
 * supervision) passent, car CORS ne les concerne pas : c'est la clé
 * d'API qui joue ce rôle de filtre.
 */
app.use(
  cors({
    origin(origine, callback) {
      if (!origine || config.corsOrigins.includes(origine)) {
        return callback(null, true);
      }
      return callback(new Error('Origine non autorisée par la politique CORS.'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
    maxAge: 86400
  })
);

// Le formulaire le plus lourd du site fait moins de 3 Ko : au-delà de
// 10 Ko, il s'agit d'une tentative de saturation.
app.use(express.json({ limit: '10kb' }));

// Freine le moissonnage des données et la force brute sur la clé d'API.
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erreur: 'Trop de requêtes envoyées. Merci de patienter quelques minutes.' }
  })
);

app.use('/api', routes);

app.use(routeInconnue);
app.use(gestionnaireErreurs);
