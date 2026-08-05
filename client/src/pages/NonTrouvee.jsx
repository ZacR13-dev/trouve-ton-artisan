import { Link } from 'react-router-dom';
import { MetaPage } from '../components/ui/MetaPage.jsx';

/**
 * Affichée pour toute adresse inconnue, ainsi que pour une catégorie ou
 * un artisan qui n'existe pas.
 */
export function NonTrouvee() {
  return (
    <>
      <MetaPage
        titre="Page non trouvée"
        description="La page demandée n'existe pas ou n'est plus disponible sur Trouve ton artisan."
      />

      <div className="container page-simple">
        <svg
          className="page-simple__illustration"
          viewBox="0 0 240 160"
          role="img"
          aria-label="Un panneau de chantier signalant une page introuvable"
        >
          <rect width="240" height="160" fill="#f1f8fc" rx="8" />
          <path d="M120 34l52 90H68l52-90z" fill="#cd2c2e" />
          <path d="M120 52l38 66H82l38-66z" fill="#ffffff" />
          <rect x="116" y="70" width="8" height="26" rx="4" fill="#cd2c2e" />
          <circle cx="120" cy="106" r="5" fill="#cd2c2e" />
          <rect x="52" y="128" width="136" height="9" rx="4" fill="#384050" />
        </svg>

        <p className="page-simple__code">404</p>
        <h1>Page non trouvée</h1>
        <p>
          La page que vous avez demandée n&apos;existe pas, ou n&apos;est plus disponible à cette
          adresse.
        </p>

        <Link to="/" className="btn btn-primary btn-lg mt-3">
          Retour à l&apos;accueil
        </Link>
      </div>
    </>
  );
}
