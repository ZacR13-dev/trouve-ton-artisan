import { Categorie } from '../models/index.js';
import { presenterCategorie } from '../utils/presenters.js';

/**
 * GET /api/categories
 *
 * Alimente le menu principal. Le cahier des charges impose que les
 * libellés des liens viennent de la base et ne soient pas codés en dur
 * dans le front.
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
