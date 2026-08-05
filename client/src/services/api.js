/**
 * Couche d'accès à l'API.
 *
 * Tous les appels réseau du site passent par ici : adresse de l'API, clé
 * d'accès et traitement des erreurs sont définis une seule fois. Les
 * composants n'ont jamais à manipuler fetch ni à connaître le format des
 * réponses d'erreur.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const CLE_API = import.meta.env.VITE_API_KEY ?? '';

/**
 * Erreur porteuse du code HTTP et du détail par champ. Elle permet de
 * distinguer un « artisan introuvable » (404, qui doit afficher la page
 * 404) d'une panne réseau.
 */
export class ErreurApi extends Error {
  constructor(message, statut, details) {
    super(message);
    this.name = 'ErreurApi';
    this.statut = statut;
    this.details = details;
  }
}

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
    // Une requête interrompue volontairement (changement de page) n'est
    // pas une panne : on la relaie telle quelle.
    if (erreur.name === 'AbortError') {
      throw erreur;
    }
    throw new ErreurApi(
      'Le service est momentanément injoignable. Vérifiez votre connexion, puis réessayez.',
      null
    );
  }

  let corps = null;
  try {
    corps = await reponse.json();
  } catch {
    corps = null;
  }

  if (!reponse.ok) {
    throw new ErreurApi(
      corps?.erreur ?? 'Une erreur est survenue lors du chargement des données.',
      reponse.status,
      corps?.details
    );
  }

  return corps;
}

export async function recupererCategories(signal) {
  const reponse = await appelApi('/categories', { signal });
  return reponse.donnees;
}

/** @param {{categorie?: string, recherche?: string, top?: boolean}} filtres */
export async function recupererArtisans(filtres = {}, signal) {
  const parametres = new URLSearchParams();

  if (filtres.categorie) parametres.set('categorie', filtres.categorie);
  if (filtres.recherche) parametres.set('recherche', filtres.recherche);
  if (filtres.top) parametres.set('top', 'true');

  const chaine = parametres.toString();
  const reponse = await appelApi(`/artisans${chaine ? `?${chaine}` : ''}`, { signal });
  return reponse.donnees;
}

export async function recupererArtisan(id, signal) {
  const reponse = await appelApi(`/artisans/${encodeURIComponent(id)}`, { signal });
  return reponse.donnees;
}

export async function envoyerMessageContact(donnees) {
  return appelApi('/contact', {
    method: 'POST',
    body: JSON.stringify(donnees)
  });
}
