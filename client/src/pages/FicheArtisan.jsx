import { Link, useParams } from 'react-router-dom';
import { recupererArtisan } from '../services/api.js';
import { useRequeteApi } from '../hooks/useRequeteApi.js';
import { NoteEtoiles } from '../components/artisan/NoteEtoiles.jsx';
import { VisuelArtisan } from '../components/artisan/VisuelArtisan.jsx';
import { FormulaireContact } from '../components/artisan/FormulaireContact.jsx';
import { Chargement } from '../components/ui/Chargement.jsx';
import { MessageErreur } from '../components/ui/MessageErreur.jsx';
import { MetaPage } from '../components/ui/MetaPage.jsx';
import { NonTrouvee } from './NonTrouvee.jsx';

export function FicheArtisan() {
  const { id } = useParams();

  const {
    donnees: artisan,
    chargement,
    erreur
  } = useRequeteApi((signal) => recupererArtisan(id, signal), [id]);

  // Identifiant inexistant ou invalide : on affiche la page 404 du site
  // plutôt qu'un message d'erreur au milieu d'une page vide.
  if (erreur?.statut === 404 || erreur?.statut === 400) {
    return <NonTrouvee />;
  }

  if (chargement) {
    return (
      <div className="container section-espacee">
        <Chargement message="Chargement de la fiche artisan..." />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="container section-espacee">
        <MessageErreur erreur={erreur} />
      </div>
    );
  }

  return (
    <>
      <MetaPage
        titre={`${artisan.nom}, ${artisan.specialite?.nom ?? 'artisan'} à ${artisan.ville}`}
        description={`Contactez ${artisan.nom}, ${artisan.specialite?.nom ?? 'artisan'} à ${artisan.ville}. Note de ${artisan.note} sur 5. Demandez un renseignement ou un devis, réponse sous 48h.`}
      />

      <div className="container section-espacee">
        <nav aria-label="Fil d'ariane" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Accueil</Link>
            </li>
            {artisan.categorie && (
              <li className="breadcrumb-item">
                <Link to={`/categorie/${artisan.categorie.slug}`}>{artisan.categorie.nom}</Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {artisan.nom}
            </li>
          </ol>
        </nav>

        <div className="row g-4 g-lg-5">
          <div className="col-12 col-lg-5">
            <VisuelArtisan artisan={artisan} />
          </div>

          <div className="col-12 col-lg-7">
            <div className="fiche-artisan__entete">
              <h1 className="mb-2">{artisan.nom}</h1>
              <NoteEtoiles note={artisan.note} />

              <div className="fiche-artisan__meta">
                {artisan.specialite && (
                  <span className="carte-artisan__specialite mb-0">{artisan.specialite.nom}</span>
                )}
                <span>
                  <span className="lecteur-ecran-uniquement">Localisation : </span>
                  {artisan.ville}
                </span>
              </div>
            </div>

            <section aria-labelledby="titre-a-propos">
              <h2 id="titre-a-propos" className="h4">
                À propos
              </h2>
              <p>{artisan.aPropos ?? 'Cet artisan n’a pas encore renseigné sa présentation.'}</p>
            </section>

            {artisan.siteWeb && (
              <p className="fiche-artisan__site">
                {/* noopener et noreferrer empêchent la page ouverte de
                    manipuler celle d'origine via window.opener. */}
                <a href={artisan.siteWeb} target="_blank" rel="noopener noreferrer">
                  Visiter le site web de {artisan.nom}
                  <span className="lecteur-ecran-uniquement"> (nouvelle fenêtre)</span>
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12 col-lg-8">
            <FormulaireContact artisanId={artisan.id} artisanNom={artisan.nom} />
          </div>
        </div>
      </div>
    </>
  );
}
