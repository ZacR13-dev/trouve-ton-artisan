import { Link } from 'react-router-dom';

/** Pages légales, à remplir plus tard par un cabinet spécialisé. */
const PAGES_LEGALES = [
  { chemin: '/mentions-legales', libelle: 'Mentions légales' },
  { chemin: '/donnees-personnelles', libelle: 'Données personnelles' },
  { chemin: '/accessibilite', libelle: 'Accessibilité' },
  { chemin: '/cookies', libelle: 'Cookies' }
];

export function PiedDePage() {
  return (
    <footer className="pied-de-page">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h2>Informations légales</h2>
            <ul className="pied-de-page__liens">
              {PAGES_LEGALES.map((page) => (
                <li key={page.chemin}>
                  <Link to={page.chemin}>{page.libelle}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-6">
            <h2>Région Auvergne-Rhône-Alpes</h2>
            <address>
              101 cours Charlemagne
              <br />
              CS 20033
              <br />
              69269 LYON CEDEX 02
              <br />
              France
              <br />
              <a href="tel:+33426734000">+33 (0)4 26 73 40 00</a>
            </address>
          </div>
        </div>

        <p className="pied-de-page__mention">
          Trouve ton artisan est un service de la Région Auvergne-Rhône-Alpes.
        </p>
      </div>
    </footer>
  );
}
