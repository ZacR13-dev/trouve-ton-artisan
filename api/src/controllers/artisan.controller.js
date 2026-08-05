import { Op } from 'sequelize';
import { Artisan, Categorie, Specialite } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { presenterArtisan } from '../utils/presenters.js';
import { slugify } from '../utils/slug.js';

/**
 * Chaque artisan est toujours renvoyé avec sa spécialité et la catégorie
 * de celle-ci : ces deux informations figurent sur les cartes comme sur
 * la fiche.
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
 * slugs en mémoire évite de réécrire en SQL la suppression des accents,
 * qui vit déjà dans slugify().
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
 * Sequelize transmet la valeur en paramètre lié, ce qui écarte déjà
 * l'injection SQL. Restent les jokers de LIKE : sans échappement, une
 * recherche sur « % » remonterait toute la table.
 */
function motifRecherche(terme) {
  const echappe = terme.trim().replace(/[\\%_]/g, (caractere) => `\\${caractere}`);
  return `%${echappe}%`;
}

/**
 * GET /api/artisans
 *
 * Filtres facultatifs : `categorie` (slug ou identifiant), `recherche`
 * (sur le nom) et `top` pour ne garder que les artisans du mois.
 */
export async function listerArtisans(req, res) {
  const { categorie, recherche, top } = req.query;

  const conditions = {};
  // Copie avant modification : l'objet partagé ne doit pas être altéré
  // d'une requête à l'autre.
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
    // Sans required, la condition n'exclurait pas les artisans des
    // autres catégories.
    jointure.required = true;
  }

  const artisans = await Artisan.findAll({
    where: conditions,
    include: [jointure],
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

/** GET /api/artisans/:id */
export async function obtenirArtisan(req, res) {
  const artisan = await Artisan.findByPk(req.params.id, {
    include: [INCLURE_SPECIALITE]
  });

  if (!artisan) {
    throw ApiError.notFound("Cet artisan n'existe pas ou n'est plus référencé.");
  }

  res.json({ donnees: presenterArtisan(artisan, { detaille: true }) });
}
