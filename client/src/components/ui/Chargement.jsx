/**
 * role="status" et aria-live font annoncer le message par les lecteurs
 * d'écran sans interrompre la lecture en cours.
 */
export function Chargement({ message = 'Chargement en cours...' }) {
  return (
    <div className="zone-chargement" role="status" aria-live="polite">
      <div className="spinner-border text-primary" aria-hidden="true"></div>
      <p className="mb-0">{message}</p>
    </div>
  );
}
