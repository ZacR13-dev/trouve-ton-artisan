/**
 * Mise en forme des données avant envoi au client.
 *
 * Deux objectifs : ne transmettre que les champs réellement utiles à
 * l'interface (une réponse d'API n'est pas un miroir de la base), et
 * offrir au front des noms de propriétés homogènes en camelCase.
 */

import { slugify } from './slug.js';

/**
 * Présente une catégorie pour le menu de navigation.
 * @param {import('../models/index.js').Categorie} categorie
 * @returns {{id: number, nom: string, slug: string}}
 */
export function presenterCategorie(categorie) {
  return {
    id: categorie.id_categorie,
    nom: categorie.nom,
    slug: slugify(categorie.nom)
  };
}

/**
 * Présente un artisan.
 * @param {import('../models/index.js').Artisan} artisan Instance chargée
 *   avec sa spécialité et la catégorie de celle-ci.
 * @param {object} [options]
 * @param {boolean} [options.detaille] Ajoute les champs réservés à la
 *   fiche complète (présentation, site web).
 * @returns {object}
 */
export function presenterArtisan(artisan, { detaille = false } = {}) {
  const specialite = artisan.specialite;
  const categorie = specialite?.categorie;

  const base = {
    id: artisan.id_artisan,
    nom: artisan.nom,
    note: artisan.note,
    ville: artisan.ville,
    image: artisan.image,
    artisanDuMois: Boolean(artisan.artisan_du_mois),
    specialite: specialite
      ? { id: specialite.id_specialite, nom: specialite.nom, slug: slugify(specialite.nom) }
      : null,
    categorie: categorie ? presenterCategorie(categorie) : null
  };

  if (!detaille) {
    return base;
  }

  return {
    ...base,
    aPropos: artisan.a_propos,
    siteWeb: artisan.site_web
  };
}
