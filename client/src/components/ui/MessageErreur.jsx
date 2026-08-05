/**
 * Affiché à la place d'un contenu qui n'a pas pu être chargé. Le détail
 * technique reste dans les journaux du serveur : l'utilisateur reçoit
 * une explication compréhensible et une action possible.
 */
export function MessageErreur({ erreur, onReessayer }) {
  const message =
    erreur?.message ?? "Le contenu n'a pas pu être chargé. Merci de réessayer dans un instant.";

  return (
    <div className="alert alert-danger" role="alert">
      <h2 className="h5 alert-heading">Une erreur est survenue</h2>
      <p className="mb-0">{message}</p>

      {onReessayer && (
        <button type="button" className="btn btn-outline-danger mt-3" onClick={onReessayer}>
          Réessayer
        </button>
      )}
    </div>
  );
}
