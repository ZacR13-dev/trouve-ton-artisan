/**
 * Métadonnées de référencement d'une page.
 *
 * React 19 remonte automatiquement les balises <title> et <meta> vers
 * l'en-tête du document, quel que soit l'endroit où elles sont rendues.
 * Chaque page peut donc déclarer son titre et sa description à
 * destination des moteurs de recherche, sans bibliothèque tierce.
 *
 * @param {object} props
 * @param {string} props.titre Titre de la page, sans le nom du site.
 * @param {string} props.description Résumé affiché dans les résultats
 *   de recherche, à garder sous 160 caractères.
 */
export function MetaPage({ titre, description }) {
  const titreComplet = `${titre} | Trouve ton artisan`;

  return (
    <>
      <title>{titreComplet}</title>
      <meta name="description" content={description} />
      {/* Partage sur les réseaux sociaux et messageries. */}
      <meta property="og:title" content={titreComplet} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </>
  );
}
