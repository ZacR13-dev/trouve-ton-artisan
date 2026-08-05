/**
 * Contrôleur des artisans.
 *
 * Il couvre les trois besoins d'affichage du site : les artisans du mois
 * de la page d'accueil, la liste filtrée par catégorie ou par recherche,
 * et la fiche complète d'un artisan.
 */

import { Op } from 'sequelize';
import { Artisan, Categorie, Specialite } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { presenterArtisan } from '../utils/presenters.js';
import { slugify } from '../utils/slug.js';

/**
 * Jointure commune : chaque artisan est toujours renvoyé avec sa
 * spécialité et la catégorie de celle-ci, informations affichées sur les
 * cartes comme sur la fiche.
 */
const INCLURE_SPECIALITE = {
  model: Specialite,
  as: 'specialite',
  attributes: ['id_specialite', 'nom'],
  include: [
    {
      model: Categorie,
      as: 'categorie',
      attributes: ['id_categorie', 'nom']
    }
  ]
};

/**
 * Retrouve une catégorie à partir de son slug ou de son identifiant.
 *
 * La table ne contient que quatre lignes : les charger pour comparer les
 * slugs en mémoire évite de dupliquer en SQL la logique de suppression
 * des accents, qui vit déjà dans slugify().
 *
 * @param {string} valeur Slug (« batiment ») ou identifiant (« 1 »).
 * @returns {Promise<Categorie>}
 * @throws {ApiError} 404 si aucune catégorie ne correspond.
 */
async function resoudreCategorie(valeur) {
  const categories = await Categorie.findAll();
  const recherche = slugify(valeur);

  const trouvee = categories.find(
    (categorie) =>
      slugify(categorie.nom) === recherche || String(categorie.id_categorie) === String(valeur)
  );

  if (!trouvee) {
    throw ApiError.notFound(`La catégorie « ${valeur} » n'existe pas.`);
  }

  return trouvee;
}

/**
 * Prépare un motif LIKE sûr.
 *
 * Sequelize transmet la valeur en paramètre lié, ce qui écarte déjà
 * l'injection SQL. Restent les caractères joker de LIKE : sans
 * échappement, une recherche sur « % » remonterait toute la table.
 *
 * @param {string} terme Terme saisi par l'internaute.
 * @returns {string} Motif prêt pour l'opérateur LIKE.
 */
function motifRecherche(terme) {
  const echappe = terme.trim().replace(/[\\%_]/g, (caractere) => `\\${caractere}`);
  return `%${echappe}%`;
}

/**
 * GET /api/artisans
 *
 * Paramètres de requête acceptés :
 *   - `categorie` : slug ou identifiant, filtre la liste d'une catégorie ;
 *   - `recherche` : filtre sur le nom de l'artisan (barre de recherche) ;
 *   - `top`       : « true » pour ne remonter que les artisans du mois.
 *
 * @type {import('express').RequestHandler}
 */
export async function listerArtisans(req, res) {
  const { categorie, recherche, top } = req.query;

  const conditions = {};
  // La jointure est copiée avant modification : l'objet partagé
  // INCLURE_SPECIALITE ne doit pas être altéré d'une requête à l'autre.
  const jointure = { ...INCLURE_SPECIALITE };

  if (top === 'true') {
    conditions.artisan_du_mois = true;
  }

  if (recherche) {
    conditions.nom = { [Op.like]: motifRecherche(recherche) };
  }

  if (categorie) {
    const categorieTrouvee = await resoudreCategorie(categorie);
    jointure.where = { id_categorie: categorieTrouvee.id_categorie };
    // required force un INNER JOIN : sans lui, la condition sur la
    // catégorie n'exclurait pas les artisans des autres catégories.
    jointure.required = true;
  }

  const artisans = await Artisan.findAll({
    where: conditions,
    include: [jointure],
    // Les mieux notés d'abord, puis par ordre alphabétique.
    order: [
      ['note', 'DESC'],
      ['nom', 'ASC']
    ]
  });

  res.json({
    total: artisans.length,
    donnees: artisans.map((artisan) => presenterArtisan(artisan))
  });
}

/**
 * GET /api/artisans/:id
 * Fiche complète d'un artisan, avec sa présentation et son site web.
 * @type {import('express').RequestHandler}
 */
export async function obtenirArtisan(req, res) {
  const artisan = await Artisan.findByPk(req.params.id, {
    include: [INCLURE_SPECIALITE]
  });

  if (!artisan) {
    throw ApiError.notFound("Cet artisan n'existe pas ou n'est plus référencé.");
  }

  res.json({ donnees: presenterArtisan(artisan, { detaille: true }) });
}
