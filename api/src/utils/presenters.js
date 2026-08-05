import { slugify } from './slug.js';

/**
 * Mise en forme des données avant envoi au client. Une réponse d'API
 * n'est pas un miroir de la base : on ne transmet que ce dont
 * l'interface a besoin, avec des noms de propriétés homogènes.
 */

export function presenterCategorie(categorie) {
  return {
    id: categorie.id_categorie,
    nom: categorie.nom,
    slug: slugify(categorie.nom)
  };
}

/**
 * @param {boolean} detaille Ajoute les champs réservés à la fiche
 *   complète : présentation et site web.
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
