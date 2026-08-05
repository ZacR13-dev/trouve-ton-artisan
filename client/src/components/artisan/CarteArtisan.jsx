/**
 * Carte d'un artisan, utilisée sur la page d'accueil et sur les pages de
 * liste. Elle affiche les quatre informations demandées par le cahier
 * des charges : nom, note sur cinq, spécialité et localisation.
 *
 * La carte entière est cliquable, mais c'est bien un lien qui l'englobe
 * et non un gestionnaire de clic sur un bloc : la navigation au clavier
 * et l'ouverture dans un nouvel onglet fonctionnent normalement.
 */

import { Link } from 'react-router-dom';
import { NoteEtoiles } from './NoteEtoiles.jsx';

/**
 * @param {object} props
 * @param {object} props.artisan Artisan renvoyé par l'API.
 * @param {boolean} [props.afficherBadge] Affiche la mention « Artisan du
 *   mois », utilisée uniquement sur la page d'accueil.
 * @param {2|3} [props.niveauTitre] Niveau du titre portant le nom de
 *   l'artisan. La hiérarchie des titres ne doit jamais sauter de niveau :
 *   sur l'accueil les cartes suivent un h2 de section et sont donc en h3,
 *   tandis que sur une page de liste elles suivent directement le h1 et
 *   doivent être en h2 (WCAG 2.1, critère 1.3.1).
 */
export function CarteArtisan({ artisan, afficherBadge = false, niveauTitre = 3 }) {
  // Une variable dont le nom commence par une majuscule est interprétée
  // par JSX comme un composant : elle permet ici de choisir la balise.
  const TitreArtisan = `h${niveauTitre}`;

  return (
    <article className="carte-artisan">
      <Link
        to={`/artisan/${artisan.id}`}
        className="carte-artisan__lien"
        // Le libellé complet évite une liste de liens « en savoir plus »
        // indiscernables pour un utilisateur de lecteur d'écran.
        aria-label={`Voir la fiche de ${artisan.nom}, ${artisan.specialite?.nom ?? 'artisan'} à ${artisan.ville}`}
      >
        {afficherBadge && artisan.artisanDuMois && (
          <span className="artisan-du-mois__badge">Artisan du mois</span>
        )}

        <TitreArtisan className="carte-artisan__nom">{artisan.nom}</TitreArtisan>

        <NoteEtoiles note={artisan.note} />

        {artisan.specialite && (
          <span className="carte-artisan__specialite">{artisan.specialite.nom}</span>
        )}

        <p className="carte-artisan__ville">
          <span className="lecteur-ecran-uniquement">Localisation : </span>
          {artisan.ville}
        </p>
      </Link>
    </article>
  );
}
