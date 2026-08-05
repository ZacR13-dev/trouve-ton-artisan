/**
 * Note d'un artisan, affichée en étoiles.
 *
 * Les étoiles sont dessinées en SVG plutôt qu'avec des caractères, ce
 * qui garantit un rendu identique sur tous les systèmes. Elles portent
 * `aria-hidden` : l'information est fournie en toutes lettres juste à
 * côté, sans quoi un lecteur d'écran annoncerait cinq images sans sens.
 */

import { useId } from 'react';

/** Tracé d'une étoile à cinq branches, sur une grille de 24 pixels. */
const TRACE_ETOILE =
  'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z';

/**
 * @param {object} props
 * @param {number} props.note Note sur 5, avec une décimale.
 */
export function NoteEtoiles({ note }) {
  // Identifiant unique par instance : plusieurs notes coexistent sur une
  // même page et chaque dégradé de demi-étoile doit être distinct.
  const identifiant = useId();
  const valeur = Number(note) || 0;

  // Affichage à la française : 4,5 et non 4.5.
  const noteAffichee = valeur.toLocaleString('fr-FR', { minimumFractionDigits: 1 });

  return (
    <p className="note">
      <span className="note__etoiles" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((rang) => {
          // Proportion remplie de cette étoile : 1 pleine, 0.5 à moitié,
          // 0 vide. Une note de 4,3 donne donc 4 étoiles pleines.
          const remplissage = Math.max(0, Math.min(1, valeur - rang + 1));
          const idDegrade = `${identifiant}-etoile-${rang}`;

          return (
            <svg
              key={rang}
              className="note__etoile"
              viewBox="0 0 24 24"
              focusable="false"
              role="presentation"
            >
              <defs>
                <linearGradient id={idDegrade}>
                  <stop offset={`${remplissage * 100}%`} stopColor="#0074c7" />
                  <stop offset={`${remplissage * 100}%`} stopColor="#d9e4ec" />
                </linearGradient>
              </defs>
              <path d={TRACE_ETOILE} fill={`url(#${idDegrade})`} />
            </svg>
          );
        })}
      </span>

      <span className="note__valeur">{noteAffichee}</span>
      <span className="lecteur-ecran-uniquement">sur 5</span>
    </p>
  );
}
