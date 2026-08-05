/**
 * Grille responsive de cartes d'artisans.
 *
 * Conception mobile first : une colonne sur téléphone, deux sur
 * tablette, trois sur ordinateur. La liste est balisée en <ul>/<li> pour
 * que les lecteurs d'écran annoncent le nombre d'éléments.
 */

import { CarteArtisan } from './CarteArtisan.jsx';

/**
 * @param {object} props
 * @param {Array<object>} props.artisans
 * @param {boolean} [props.afficherBadge]
 */
export function GrilleArtisans({ artisans, afficherBadge = false }) {
  return (
    <ul className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 list-unstyled">
      {artisans.map((artisan) => (
        <li key={artisan.id} className="col">
          <CarteArtisan artisan={artisan} afficherBadge={afficherBadge} />
        </li>
      ))}
    </ul>
  );
}
