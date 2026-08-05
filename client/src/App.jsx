/**
 * Structure générale de l'application et table des routes.
 *
 * L'en-tête et le pied de page entourent la zone de contenu, ce qui
 * garantit qu'ils sont identiques sur toutes les pages, comme l'exige le
 * cahier des charges.
 */

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
   * Dans une application à page unique, changer de route ne recharge pas
   * le document : sans intervention, l'utilisateur reste au milieu de la
   * page précédente et le lecteur d'écran ne signale aucun changement.
   * On remonte donc en haut et on donne le focus à la zone de contenu.
   *
   * Ce déplacement est volontairement ignoré au tout premier affichage :
   * si le focus était placé sur le contenu dès l'arrivée sur le site, la
   * première tabulation atteindrait le contenu et non le lien
   * d'évitement, qui perdrait alors toute utilité.
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
      {/* Premier élément focusable de la page. */}
      <a className="lien-evitement" href="#contenu">
        Aller au contenu principal
      </a>

      <EnTete />

      <main
        id="contenu"
        className="contenu-principal"
        ref={contenuPrincipal}
        // tabIndex -1 rend l'élément focusable par programme sans
        // l'ajouter à l'ordre de tabulation.
        tabIndex={-1}
      >
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

          {/* Toute autre adresse affiche la page 404. */}
          <Route path="*" element={<NonTrouvee />} />
        </Routes>
      </main>

      <PiedDePage />
    </>
  );
}
