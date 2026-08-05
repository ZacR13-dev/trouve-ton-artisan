/**
 * Indicateur de chargement.
 *
 * `role="status"` et `aria-live="polite"` font annoncer le message par
 * les lecteurs d'écran dès qu'il apparaît, sans interrompre la lecture
 * en cours : l'utilisateur non voyant sait que la page travaille.
 *
 * @param {{message?: string}} props
 */
export function Chargement({ message = 'Chargement en cours...' }) {
  return (
    <div className="zone-chargement" role="status" aria-live="polite">
      <div className="spinner-border text-primary" aria-hidden="true"></div>
      <p className="mb-0">{message}</p>
    </div>
  );
}
