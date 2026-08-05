/**
 * Visuel de la fiche artisan.
 *
 * Le cahier des charges impose une image sur la fiche, mais le jeu
 * d'essai fourni n'en contient aucune : la colonne `image` de la base
 * reste vide en attendant l'application d'alimentation prévue par le
 * client. Ce composant affiche donc la photo si elle existe, et à défaut
 * une illustration générée aux couleurs de la charte, qui reprend
 * l'initiale de l'artisan et le nom de sa spécialité.
 */

/** Couleur de fond selon la catégorie, dans la palette de la Région. */
const COULEURS_CATEGORIE = {
  batiment: '#00497c',
  services: '#0074c7',
  fabrication: '#384050',
  alimentation: '#cd2c2e'
};

/**
 * @param {object} props
 * @param {object} props.artisan Artisan à illustrer.
 */
export function VisuelArtisan({ artisan }) {
  if (artisan.image) {
    return (
      <img
        src={artisan.image}
        alt={`Visuel de ${artisan.nom}`}
        className="fiche-artisan__visuel"
        loading="lazy"
      />
    );
  }

  const couleur = COULEURS_CATEGORIE[artisan.categorie?.slug] ?? '#0074c7';
  const initiale = artisan.nom.trim().charAt(0).toUpperCase();
  const specialite = artisan.specialite?.nom ?? 'Artisan';

  return (
    <svg
      className="fiche-artisan__visuel"
      viewBox="0 0 400 300"
      role="img"
      aria-label={`Illustration générique pour ${artisan.nom}, ${specialite}`}
    >
      <rect width="400" height="300" fill="#f1f8fc" />
      <circle cx="200" cy="122" r="62" fill={couleur} />
      <text
        x="200"
        y="122"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize="56"
        fontWeight="700"
        fontFamily="Segoe UI, system-ui, sans-serif"
      >
        {initiale}
      </text>
      <text
        x="200"
        y="222"
        textAnchor="middle"
        fill="#384050"
        fontSize="22"
        fontWeight="600"
        fontFamily="Segoe UI, system-ui, sans-serif"
      >
        {specialite}
      </text>
    </svg>
  );
}
