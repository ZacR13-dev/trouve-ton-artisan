/**
 * Formulaire de contact d'un artisan.
 *
 * Les champs sont validés côté navigateur pour un retour immédiat, puis
 * de nouveau côté serveur : la validation du navigateur est un confort
 * d'usage, jamais une sécurité, puisqu'elle peut être contournée.
 *
 * Les messages d'erreur renvoyés par l'API sont réaffichés sous le champ
 * concerné (WCAG 2.1, critère 3.3.1 « Identification des erreurs »).
 */

import { useState } from 'react';
import { envoyerMessageContact } from '../../services/api.js';

/** État initial, réutilisé pour vider le formulaire après l'envoi. */
const CHAMPS_VIDES = { nom: '', email: '', objet: '', message: '', siteWeb: '' };

/**
 * @param {object} props
 * @param {number} props.artisanId Identifiant du destinataire.
 * @param {string} props.artisanNom Nom affiché dans le message de succès.
 */
export function FormulaireContact({ artisanId, artisanNom }) {
  const [champs, setChamps] = useState(CHAMPS_VIDES);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [succes, setSucces] = useState(null);
  const [erreurGenerale, setErreurGenerale] = useState(null);
  const [erreursChamps, setErreursChamps] = useState({});

  /** @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} evenement */
  const modifierChamp = (evenement) => {
    const { name, value } = evenement.target;
    setChamps((precedents) => ({ ...precedents, [name]: value }));
  };

  /** @param {React.FormEvent} evenement */
  const soumettre = async (evenement) => {
    evenement.preventDefault();

    setEnvoiEnCours(true);
    setErreurGenerale(null);
    setErreursChamps({});
    setSucces(null);

    try {
      const reponse = await envoyerMessageContact({ artisanId, ...champs });
      setSucces(reponse.message);
      setChamps(CHAMPS_VIDES);
    } catch (erreur) {
      // 400 : l'API détaille le ou les champs fautifs.
      if (erreur.details) {
        setErreursChamps(erreur.details);
        setErreurGenerale('Certains champs doivent être corrigés.');
      } else {
        setErreurGenerale(erreur.message);
      }
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <form className="formulaire-contact" onSubmit={soumettre} noValidate>
      <h2 className="h4">Contacter {artisanNom}</h2>
      <p className="formulaire-contact__aide">
        Les champs marqués d'un astérisque sont obligatoires. Une réponse vous sera apportée sous
        48 heures.
      </p>

      {/* Les messages de résultat sont dans une région « live » : ils
          sont annoncés dès leur apparition, sans déplacer le focus. */}
      <div aria-live="polite">
        {succes && (
          <div className="alert alert-success" role="status">
            {succes}
          </div>
        )}
        {erreurGenerale && (
          <div className="alert alert-danger" role="alert">
            {erreurGenerale}
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="contact-nom">
          Votre nom <span className="champ-obligatoire" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-nom"
          name="nom"
          type="text"
          className={`form-control ${erreursChamps.nom ? 'is-invalid' : ''}`}
          value={champs.nom}
          onChange={modifierChamp}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          aria-describedby={erreursChamps.nom ? 'erreur-nom' : undefined}
        />
        {erreursChamps.nom && (
          <p className="formulaire-contact__erreur" id="erreur-nom">
            {erreursChamps.nom}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="contact-email">
          Votre adresse e-mail <span className="champ-obligatoire" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className={`form-control ${erreursChamps.email ? 'is-invalid' : ''}`}
          value={champs.email}
          onChange={modifierChamp}
          required
          maxLength={255}
          autoComplete="email"
          aria-describedby={erreursChamps.email ? 'erreur-email' : undefined}
        />
        {erreursChamps.email && (
          <p className="formulaire-contact__erreur" id="erreur-email">
            {erreursChamps.email}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="contact-objet">
          Objet <span className="champ-obligatoire" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-objet"
          name="objet"
          type="text"
          className={`form-control ${erreursChamps.objet ? 'is-invalid' : ''}`}
          value={champs.objet}
          onChange={modifierChamp}
          required
          minLength={3}
          maxLength={150}
          aria-describedby={erreursChamps.objet ? 'erreur-objet' : undefined}
        />
        {erreursChamps.objet && (
          <p className="formulaire-contact__erreur" id="erreur-objet">
            {erreursChamps.objet}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="contact-message">
          Votre message <span className="champ-obligatoire" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          className={`form-control ${erreursChamps.message ? 'is-invalid' : ''}`}
          value={champs.message}
          onChange={modifierChamp}
          required
          minLength={10}
          maxLength={2000}
          aria-describedby={`aide-message ${erreursChamps.message ? 'erreur-message' : ''}`}
        />
        <p className="formulaire-contact__aide" id="aide-message">
          De 10 à 2000 caractères.
        </p>
        {erreursChamps.message && (
          <p className="formulaire-contact__erreur" id="erreur-message">
            {erreursChamps.message}
          </p>
        )}
      </div>

      {/* Piège à robots : invisible à l'écran, retiré du parcours clavier
          et de l'arbre d'accessibilité. Seul un automate le remplira. */}
      <div className="champ-piege" aria-hidden="true">
        <label htmlFor="contact-site-web">Ne pas remplir ce champ</label>
        <input
          id="contact-site-web"
          name="siteWeb"
          type="text"
          value={champs.siteWeb}
          onChange={modifierChamp}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={envoiEnCours}>
        {envoiEnCours ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  );
}
