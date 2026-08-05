/**
 * Erreur métier porteuse d'un code HTTP.
 *
 * Elle permet aux contrôleurs de signaler une situation précise
 * (ressource absente, requête invalide) sans connaître la façon dont la
 * réponse sera formatée : c'est le gestionnaire d'erreurs centralisé qui
 * s'en charge.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode Code HTTP à renvoyer au client.
   * @param {string} message Message destiné au client (jamais technique).
   * @param {object} [details] Détails optionnels, par exemple les erreurs
   *   de validation champ par champ.
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    // Marque l'erreur comme prévue par l'application, par opposition à un
    // plantage inattendu qui, lui, ne doit rien révéler au client.
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /** Requête mal formée ou paramètres invalides. */
  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  /** Clé d'API absente ou incorrecte. */
  static unauthorized(message = "Accès non autorisé.") {
    return new ApiError(401, message);
  }

  /** Ressource inexistante. */
  static notFound(message = 'Ressource introuvable.') {
    return new ApiError(404, message);
  }

  /** Défaillance d'un service tiers, par exemple le serveur d'e-mail. */
  static serviceUnavailable(message) {
    return new ApiError(503, message);
  }
}
