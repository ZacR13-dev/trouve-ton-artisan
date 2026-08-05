/**
 * Couche d'accès à l'API.
 *
 * Tous les appels réseau du site passent par ce module : l'adresse de
 * l'API, la clé d'accès et le traitement des erreurs y sont définis une
 * seule fois. Les composants n'ont jamais à manipuler `fetch`
 * directement, ni à connaître le format des réponses d'erreur.
 */

/** Adresse de base de l'API, injectée à la construction par Vite. */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

/** Clé exigée par l'API dans l'en-tête x-api-key. */
const CLE_API = import.meta.env.VITE_API_KEY ?? '';

/**
 * Erreur d'appel à l'API, porteuse du code HTTP et du détail par champ.
 * Elle permet aux composants de distinguer « artisan introuvable » (404,
 * qui doit afficher la page 404) d'une panne réseau.
 */
export class ErreurApi extends Error {
  /**
   * @param {string} message Message affichable par l'interface.
   * @param {number|null} statut Code HTTP, ou null si la requête n'a pas abouti.
   * @param {object} [details] Erreurs de validation, champ par champ.
   */
  constructor(message, statut, details) {
    super(message);
    this.name = 'ErreurApi';
    this.statut = statut;
    this.details = details;
  }
}

/**
 * Exécute un appel à l'API et normalise les erreurs.
 *
 * @param {string} chemin Chemin relatif, par exemple « /artisans ».
 * @param {RequestInit & {signal?: AbortSignal}} [options] Options fetch.
 * @returns {Promise<object>} Corps de la réponse déjà décodé.
 * @throws {ErreurApi} En cas de réponse en erreur ou d'échec réseau.
 */
async function appelApi(chemin, options = {}) {
  let reponse;

  try {
    reponse = await fetch(`${BASE_URL}${chemin}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLE_API,
        ...options.headers
      }
    });
  } catch (erreur) {
    // Une requête interrompue volontairement (changement de page) ne doit
    // pas être présentée comme une panne : elle est relayée telle quelle.
    if (erreur.name === 'AbortError') {
      throw erreur;
    }
    throw new ErreurApi(
      "Le service est momentanément injoignable. Vérifiez votre connexion, puis réessayez.",
      null
    );
  }

  // Une réponse vide ou non JSON ne doit pas faire échouer le décodage
  // de manière incompréhensible.
  let corps = null;
  try {
    corps = await reponse.json();
  } catch {
    corps = null;
  }

  if (!reponse.ok) {
    throw new ErreurApi(
      corps?.erreur ?? "Une erreur est survenue lors du chargement des données.",
      reponse.status,
      corps?.details
    );
  }

  return corps;
}

/**
 * Récupère les catégories qui alimentent le menu principal.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{id: number, nom: string, slug: string}>>}
 */
export async function recupererCategories(signal) {
  const reponse = await appelApi('/categories', { signal });
  return reponse.donnees;
}

/**
 * Récupère une liste d'artisans, éventuellement filtrée.
 *
 * @param {object} [filtres]
 * @param {string} [filtres.categorie] Slug de catégorie.
 * @param {string} [filtres.recherche] Terme recherché sur le nom.
 * @param {boolean} [filtres.top] Limiter aux artisans du mois.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<object>>}
 */
export async function recupererArtisans(filtres = {}, signal) {
  const parametres = new URLSearchParams();

  if (filtres.categorie) parametres.set('categorie', filtres.categorie);
  if (filtres.recherche) parametres.set('recherche', filtres.recherche);
  if (filtres.top) parametres.set('top', 'true');

  const chaine = parametres.toString();
  const reponse = await appelApi(`/artisans${chaine ? `?${chaine}` : ''}`, { signal });
  return reponse.donnees;
}

/**
 * Récupère la fiche complète d'un artisan.
 * @param {string|number} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function recupererArtisan(id, signal) {
  const reponse = await appelApi(`/artisans/${encodeURIComponent(id)}`, { signal });
  return reponse.donnees;
}

/**
 * Transmet un message du formulaire de contact.
 * @param {object} donnees Champs du formulaire.
 * @returns {Promise<{message: string}>}
 */
export async function envoyerMessageContact(donnees) {
  return appelApi('/contact', {
    method: 'POST',
    body: JSON.stringify(donnees)
  });
}
