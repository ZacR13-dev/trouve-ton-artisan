import 'dotenv/config';

/**
 * Chargement et validation des variables d'environnement.
 *
 * Aucun identifiant n'est écrit dans le code : tout vient du fichier
 * .env, exclu du dépôt. Les variables indispensables sont vérifiées au
 * démarrage pour que l'application échoue tout de suite plutôt que de
 * tourner à moitié configurée.
 */

const REQUISES = ['DB_NAME', 'DB_USER', 'API_KEY'];

const manquantes = REQUISES.filter((cle) => !process.env[cle]);

if (manquantes.length > 0) {
  console.error(
    `[config] Variables d'environnement manquantes : ${manquantes.join(', ')}.\n` +
      '          Copiez api/.env.example vers api/.env et renseignez-les.'
  );
  process.exit(1);
}

const entier = (valeur, defaut) => {
  const converti = Number.parseInt(valeur ?? '', 10);
  return Number.isNaN(converti) ? defaut : converti;
};

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: entier(process.env.PORT, 3001),

  database: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    host: process.env.DB_HOST ?? 'localhost',
    port: entier(process.env.DB_PORT, 3306),
    dialect: 'mysql'
  },

  /** Clé partagée avec le front, exigée sur chaque requête. */
  apiKey: process.env.API_KEY,

  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origine) => origine.trim())
    .filter(Boolean),

  mail: {
    host: process.env.SMTP_HOST,
    port: entier(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.MAIL_FROM ?? 'Trouve ton artisan <no-reply@trouve-ton-artisan.fr>',
    /**
     * Les adresses du jeu d'essai appartiennent à des artisans fictifs.
     * Quand cette variable est renseignée, tous les messages y sont
     * redirigés au lieu de partir vers ces adresses.
     */
    redirectTo: process.env.MAIL_REDIRECT_TO ?? null
  },

  rateLimit: {
    windowMs: entier(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: entier(process.env.RATE_LIMIT_MAX, 100),
    contactMax: entier(process.env.RATE_LIMIT_CONTACT_MAX, 5)
  }
};
