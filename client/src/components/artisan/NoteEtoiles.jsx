import { useId } from 'react';

/** Étoile à cinq branches, sur une grille de 24 pixels. */
const TRACE_ETOILE =
  'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z';

/**
 * Note d'un artisan en étoiles.
 *
 * Les étoiles sont masquées aux lecteurs d'écran, qui annonceraient cinq
 * images sans signification : l'information est donnée en toutes lettres
 * juste à côté.
 */
export function NoteEtoiles({ note }) {
  // Plusieurs notes coexistent sur une page : chaque dégradé de
  // demi-étoile doit avoir un identifiant distinct.
  const identifiant = useId();
  const valeur = Number(note) || 0;

  const noteAffichee = valeur.toLocaleString('fr-FR', { minimumFractionDigits: 1 });

  return (
    <p className="note">
      <span className="note__etoiles" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((rang) => {
          // 1 pleine, 0.5 à moitié, 0 vide : une note de 4,3 donne donc
          // quatre étoiles pleines et une entamée.
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
