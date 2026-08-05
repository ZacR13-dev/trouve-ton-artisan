/**
 * Contrôleur des catégories.
 *
 * Il alimente le menu principal du site : le cahier des charges impose
 * que les libellés des liens « Bâtiment », « Services », « Fabrication »
 * et « Alimentation » proviennent de la base de données et ne soient pas
 * codés en dur dans le front.
 */

import { Categorie } from '../models/index.js';
import { presenterCategorie } from '../utils/presenters.js';

/**
 * GET /api/categories
 * Renvoie les catégories triées par identifiant, avec leur slug d'URL.
 * @type {import('express').RequestHandler}
 */
export async function listerCategories(req, res) {
  const categories = await Categorie.findAll({
    order: [['id_categorie', 'ASC']]
  });

  res.json({
    total: categories.length,
    donnees: categories.map(presenterCategorie)
  });
}
