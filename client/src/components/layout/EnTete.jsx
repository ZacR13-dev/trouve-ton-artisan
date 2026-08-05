/**
 * En-tête du site, identique sur toutes les pages.
 *
 * Il contient les trois éléments imposés par le cahier des charges :
 * le logo qui ramène à l'accueil, le menu des catégories dont les
 * libellés proviennent de la base de données, et la barre de recherche
 * portant sur les noms d'artisans.
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useCategories } from '../../contexts/CategoriesContext.jsx';
import logo from '../../assets/logo-trouve-ton-artisan.png';

export function EnTete() {
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [parametresUrl] = useSearchParams();

  // Le menu déroulant mobile est piloté par React plutôt que par le
  // JavaScript de Bootstrap : une seule source de vérité pour l'état
  // ouvert/fermé, et pas de manipulation directe du DOM.
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Le champ reste synchronisé avec l'URL : un partage de lien ou un
  // retour arrière réaffiche bien le terme recherché.
  const [terme, setTerme] = useState(parametresUrl.get('q') ?? '');

  /**
   * Lance la recherche. La navigation passe par l'URL afin que le
   * résultat soit partageable et que le bouton « précédent » fonctionne.
   * @param {React.FormEvent} evenement
   */
  const rechercher = (evenement) => {
    evenement.preventDefault();
    const termeNettoye = terme.trim();

    if (termeNettoye.length === 0) {
      return;
    }

    setMenuOuvert(false);
    navigate(`/recherche?q=${encodeURIComponent(termeNettoye)}`);
  };

  return (
    <header className="en-tete">
      <div className="container">
        <nav className="navbar navbar-expand-lg p-0" aria-label="Navigation principale">
          <Link to="/" className="en-tete__logo" onClick={() => setMenuOuvert(false)}>
            <img
              src={logo}
              alt="Trouve ton artisan, avec la région Auvergne-Rhône-Alpes. Retour à l'accueil"
              width="1735"
              height="492"
            />
          </Link>

          <button
            type="button"
            className="navbar-toggler"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
            aria-expanded={menuOuvert}
            aria-controls="menu-principal"
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse ${menuOuvert ? 'show' : ''}`}
            id="menu-principal"
          >
            <ul className="navbar-nav me-auto en-tete__navigation mb-3 mb-lg-0">
              {categories.map((categorie) => (
                <li className="nav-item" key={categorie.id}>
                  <NavLink
                    to={`/categorie/${categorie.slug}`}
                    className={({ isActive }) => `nav-link ${isActive ? 'actif' : ''}`}
                    onClick={() => setMenuOuvert(false)}
                  >
                    {categorie.nom}
                  </NavLink>
                </li>
              ))}
            </ul>

            <form
              className="d-flex en-tete__recherche mb-3 mb-lg-0"
              role="search"
              onSubmit={rechercher}
            >
              {/* Le libellé est masqué visuellement mais bien présent :
                  un champ sans étiquette n'est pas identifiable par un
                  lecteur d'écran (WCAG 2.1, critère 3.3.2). */}
              <label htmlFor="recherche-artisan" className="lecteur-ecran-uniquement">
                Rechercher un artisan par son nom
              </label>
              <input
                id="recherche-artisan"
                type="search"
                className="form-control me-2"
                placeholder="Rechercher un artisan"
                value={terme}
                onChange={(evenement) => setTerme(evenement.target.value)}
                maxLength={100}
              />
              <button type="submit" className="btn btn-primary">
                Rechercher
              </button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
