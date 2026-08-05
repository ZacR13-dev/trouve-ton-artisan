/**
 * Page d'accueil.
 *
 * Elle présente le fonctionnement du site en quatre étapes, puis les
 * trois artisans du mois, conformément au cahier des charges.
 */

import { recupererArtisans } from '../services/api.js';
import { useRequeteApi } from '../hooks/useRequeteApi.js';
import { GrilleArtisans } from '../components/artisan/GrilleArtisans.jsx';
import { Chargement } from '../components/ui/Chargement.jsx';
import { MessageErreur } from '../components/ui/MessageErreur.jsx';
import { MetaPage } from '../components/ui/MetaPage.jsx';

/**
 * Les quatre étapes imposées par le cahier des charges. Le numéro et le
 * texte de chacune doivent obligatoirement apparaître.
 */
const ETAPES = [
  'Choisir la catégorie d’artisanat dans le menu.',
  'Choisir un artisan.',
  'Le contacter via le formulaire de contact.',
  'Une réponse sera apportée sous 48h.'
];

export function Accueil() {
  const {
    donnees: artisans,
    chargement,
    erreur
  } = useRequeteApi((signal) => recupererArtisans({ top: true }, signal), []);

  return (
    <>
      <MetaPage
        titre="Trouvez l'artisan qu'il vous faut en Auvergne-Rhône-Alpes"
        description="Trouvez facilement un artisan près de chez vous en Auvergne-Rhône-Alpes : bâtiment, services, fabrication, alimentation. Contactez-le directement, réponse sous 48h."
      />

      <section className="banniere">
        <div className="container">
          <h1>Trouvez l&apos;artisan qu&apos;il vous faut</h1>
          <p>
            La Région Auvergne-Rhône-Alpes compte plus de 221 000 entreprises artisanales. Trouvez
            celle qui répondra à votre besoin, et contactez-la en quelques clics.
          </p>
        </div>
      </section>

      <section className="section-espacee" aria-labelledby="titre-etapes">
        <div className="container">
          <h2 id="titre-etapes" className="text-center mb-4">
            Comment trouver mon artisan ?
          </h2>

          <ol className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 list-unstyled">
            {ETAPES.map((texte, index) => (
              <li className="col" key={texte}>
                <div className="etape">
                  {/* Le numéro est décoratif à l'écran : la liste
                      ordonnée le restitue déjà aux lecteurs d'écran. */}
                  <span className="etape__numero" aria-hidden="true">
                    {index + 1}
                  </span>
                  <p className="etape__texte">{texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-espacee section-claire" aria-labelledby="titre-artisans-du-mois">
        <div className="container">
          <h2 id="titre-artisans-du-mois" className="text-center mb-4">
            Les artisans du mois
          </h2>

          {chargement && <Chargement message="Chargement des artisans du mois..." />}
          {erreur && <MessageErreur erreur={erreur} />}
          {artisans && artisans.length > 0 && (
            <GrilleArtisans artisans={artisans} afficherBadge />
          )}
          {artisans && artisans.length === 0 && (
            <p className="text-center mb-0">Aucun artisan n&apos;est mis en avant ce mois-ci.</p>
          )}
        </div>
      </section>
    </>
  );
}
