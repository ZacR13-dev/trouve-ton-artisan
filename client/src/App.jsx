import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { EnTete } from './components/layout/EnTete.jsx';
import { PiedDePage } from './components/layout/PiedDePage.jsx';
import { Accueil } from './pages/Accueil.jsx';
import { ListeArtisans } from './pages/ListeArtisans.jsx';
import { FicheArtisan } from './pages/FicheArtisan.jsx';
import { PageLegale } from './pages/PageLegale.jsx';
import { NonTrouvee } from './pages/NonTrouvee.jsx';

export function App() {
  const { pathname, search } = useLocation();
  const contenuPrincipal = useRef(null);
  const adressePrecedente = useRef(null);

  /**
   * Changer de route ne recharge pas le document : sans intervention,
   * l'utilisateur reste au milieu de la page précédente et le lecteur
   * d'écran ne signale aucun changement.
   *
   * Le déplacement est ignoré au tout premier affichage : si le focus
   * était placé sur le contenu dès l'arrivée, la première tabulation
   * atteindrait le contenu et non le lien d'évitement.
   */
  useEffect(() => {
    const adresse = pathname + search;

    if (adressePrecedente.current !== null && adressePrecedente.current !== adresse) {
      window.scrollTo(0, 0);
      contenuPrincipal.current?.focus();
    }

    adressePrecedente.current = adresse;
  }, [pathname, search]);

  return (
    <>
      <a className="lien-evitement" href="#contenu">
        Aller au contenu principal
      </a>

      <EnTete />

      {/* tabIndex -1 rend la zone focusable par programme sans l'ajouter
          à l'ordre de tabulation. */}
      <main id="contenu" className="contenu-principal" ref={contenuPrincipal} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/categorie/:slug" element={<ListeArtisans />} />
          <Route path="/recherche" element={<ListeArtisans />} />
          <Route path="/artisan/:id" element={<FicheArtisan />} />

          <Route
            path="/mentions-legales"
            element={
              <PageLegale
                titre="Mentions légales"
                description="Mentions légales du site Trouve ton artisan, service de la Région Auvergne-Rhône-Alpes."
              />
            }
          />
          <Route
            path="/donnees-personnelles"
            element={
              <PageLegale
                titre="Données personnelles"
                description="Politique de protection des données personnelles du site Trouve ton artisan."
              />
            }
          />
          <Route
            path="/accessibilite"
            element={
              <PageLegale
                titre="Accessibilité"
                description="Déclaration d'accessibilité du site Trouve ton artisan, conforme à la norme WCAG 2.1."
              />
            }
          />
          <Route
            path="/cookies"
            element={
              <PageLegale
                titre="Cookies"
                description="Politique de gestion des cookies du site Trouve ton artisan."
              />
            }
          />

          <Route path="*" element={<NonTrouvee />} />
        </Routes>
      </main>

      <PiedDePage />
    </>
  );
}
