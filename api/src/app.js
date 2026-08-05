/**
 * Configuration de l'application Express.
 *
 * L'ordre des middlewares n'est pas indifférent : les protections
 * (en-têtes, CORS, limitation de débit, taille du corps) s'appliquent
 * avant que la moindre logique métier ne soit exécutée, et le
 * gestionnaire d'erreurs vient obligatoirement en dernier.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { config } from './config/env.js';
import { routes } from './routes/index.js';
import { gestionnaireErreurs, routeInconnue } from './middlewares/errorHandler.js';

export const app = express();

/**
 * En production, l'API tourne derrière un reverse proxy. Sans cette
 * option, toutes les requêtes sembleraient provenir de la même adresse
 * IP et la limitation de débit bloquerait tous les visiteurs à la fois.
 */
app.set('trust proxy', 1);

/**
 * Supprime l'en-tête « X-Powered-By: Express ». Annoncer sa pile
 * technique facilite le travail d'un attaquant qui cherche une faille
 * connue sur une version précise.
 */
app.disable('x-powered-by');

/**
 * Helmet positionne une douzaine d'en-têtes HTTP de sécurité, parmi
 * lesquels X-Content-Type-Options (interdit au navigateur de deviner le
 * type d'un contenu), X-Frame-Options (empêche l'insertion du site dans
 * une iframe, donc le clickjacking) et Strict-Transport-Security
 * (impose HTTPS pour les visites suivantes).
 */
app.use(helmet());

/**
 * CORS : seules les origines déclarées peuvent appeler l'API depuis un
 * navigateur. Les requêtes sans origine (outils en ligne de commande,
 * supervision) restent acceptées car CORS ne les concerne pas ; c'est
 * la clé d'API qui joue ce rôle de filtre.
 */
app.use(
  cors({
    origin(origine, callback) {
      if (!origine || config.corsOrigins.includes(origine)) {
        return callback(null, true);
      }
      return callback(new Error("Origine non autorisée par la politique CORS."));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
    maxAge: 86400
  })
);

/**
 * Corps de requête limité à 10 Ko. Le formulaire le plus lourd du site
 * en fait moins de 3 : au-delà, il s'agit d'une tentative de saturation
 * de la mémoire du serveur.
 */
app.use(express.json({ limit: '10kb' }));

/**
 * Limitation de débit générale, appliquée à toutes les routes de l'API.
 * Elle freine le moissonnage des données et les attaques par force brute
 * sur la clé d'API.
 */
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

// Toute autre URL n'existe pas : réponse JSON homogène.
app.use(routeInconnue);

// Gestionnaire d'erreurs : impérativement le dernier middleware monté.
app.use(gestionnaireErreurs);
