/**
 * Erreur métier porteuse d'un code HTTP. Les contrôleurs signalent une
 * situation précise sans se soucier du format de la réponse : c'est le
 * gestionnaire d'erreurs qui s'en charge.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    // Distingue une erreur prévue d'un plantage inattendu, qui lui ne
    // doit rien révéler au client.
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Accès non autorisé.') {
    return new ApiError(401, message);
  }

  static notFound(message = 'Ressource introuvable.') {
    return new ApiError(404, message);
  }

  static serviceUnavailable(message) {
    return new ApiError(503, message);
  }
}
