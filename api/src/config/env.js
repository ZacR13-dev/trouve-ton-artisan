/**
 * Chargement et validation des variables d'environnement.
 *
 * Aucun identifiant n'est écrit en dur dans le code : tout provient du
 * fichier .env, exclu du dépôt Git. Les variables indispensables sont
 * vérifiées au démarrage pour que l'application échoue immédiatement et
 * bruyamment plutôt que de tourner dans un état incohérent.
 */

import 'dotenv/config';

/** Variables sans lesquelles l'API ne peut pas fonctionner. */
const REQUIRED = ['DB_NAME', 'DB_USER', 'API_KEY'];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[config] Variables d'environnement manquantes : ${missing.join(', ')}.\n` +
      "          Copiez api/.env.example vers api/.env et renseignez-les."
  );
  process.exit(1);
}

/**
 * Convertit une chaîne d'environnement en entier, avec valeur de repli.
 * @param {string|undefined} value Valeur brute lue dans process.env.
 * @param {number} fallback Valeur utilisée si la conversion échoue.
 * @returns {number}
 */
const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: toInt(process.env.PORT, 3001),

  database: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, 3306),
    dialect: 'mysql'
  },

  /**
   * Clé partagée entre le front et l'API. Le cahier des charges impose
   * que « l'accès à l'API soit limité à l'application » : toute requête
   * sans cette clé est rejetée.
   */
  apiKey: process.env.API_KEY,

  /**
   * Origines autorisées par CORS. Plusieurs valeurs possibles, séparées
   * par des virgules (front local et front de production).
   */
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  mail: {
    host: process.env.SMTP_HOST,
    port: toInt(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.MAIL_FROM ?? 'Trouve ton artisan <no-reply@trouve-ton-artisan.fr>',
    /**
     * Adresse de redirection. Les e-mails du jeu d'essai appartiennent à
     * des artisans fictifs : quand cette variable est renseignée, tous
     * les messages y sont redirigés au lieu d'être envoyés aux adresses
     * de la base. Indispensable pour démontrer la fonctionnalité sans
     * écrire à des inconnus.
     */
    redirectTo: process.env.MAIL_REDIRECT_TO ?? null
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 100),
    contactMax: toInt(process.env.RATE_LIMIT_CONTACT_MAX, 5)
  }
};
