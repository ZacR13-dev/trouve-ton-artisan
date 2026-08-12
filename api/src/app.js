import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
 *
 * Le contrôle est monté sur « /api » et non sur le service entier. En
 * production, ce même service distribue aussi les fichiers du front :
 * appliqué globalement, il rejetterait les propres fichiers du site,
 * alors qu'ils sont servis depuis la même origine et ne relèvent donc
 * pas de CORS.
 */
app.use(
  '/api',
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

/**
 * Freine le moissonnage des données et la force brute sur la clé d'API.
 *
 * Monté sur « /api », comme le contrôle CORS. Appliqué au service entier,
 * il compterait aussi les fichiers du front que ce même service distribue
 * en production : une seule page consomme cinq requêtes, et un visiteur
 * normal épuiserait le quota en une vingtaine de pages avant d'être
 * bloqué un quart d'heure.
 */
app.use(
  '/api',
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erreur: 'Trop de requêtes envoyées. Merci de patienter quelques minutes.' }
  })
);

app.use('/api', routes);

/**
 * En production, ce même service sert aussi le front compilé. Le site et
 * son API partagent alors une seule origine : le navigateur n'a plus de
 * requête inter-origine à faire, et il n'y a qu'un hébergement à
 * maintenir. En développement, rien ne change : Vite garde son propre
 * serveur sur le port 5173.
 */
if (config.isProduction) {
  const racineApi = fileURLToPath(new URL('.', import.meta.url));
  const dossierFront = path.resolve(racineApi, '../../client/dist');

  /**
   * Les fichiers d'assets portent une empreinte dans leur nom : ils sont
   * mis en cache un an sans risque de servir une version périmée.
   * « index: false » laisse index.html au repli ci-dessous, qui lui ne
   * doit jamais être mis en cache.
   */
  app.use(express.static(dossierFront, { maxAge: '1y', index: false }));

  /**
   * Repli du routeur React : toute adresse qui n'est pas une route d'API
   * renvoie index.html, à charge pour react-router d'afficher la bonne
   * page, y compris sa page 404. Sans ce repli, recharger la page sur
   * /artisan/12 tomberait sur une erreur du serveur au lieu du site.
   */
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(dossierFront, 'index.html'));
  });
}

app.use(routeInconnue);
app.use(gestionnaireErreurs);
