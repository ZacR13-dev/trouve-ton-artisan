/**
 * Service d'envoi d'e-mail (formulaire de contact).
 *
 * Le transport est configuré pour un relais SMTP authentifié (Brevo par
 * défaut). Deux garde-fous importants :
 *
 *   1. Redirection : les adresses du jeu d'essai appartiennent à des
 *      artisans fictifs. Tant que MAIL_REDIRECT_TO est renseignée, les
 *      messages y sont envoyés au lieu de partir vers ces adresses.
 *   2. Échappement : le contenu saisi par l'internaute est échappé avant
 *      d'être inséré dans le corps HTML du message, sinon un visiteur
 *      pourrait injecter du HTML ou un lien piégé dans le mail reçu.
 */

import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Transporteur SMTP, créé une seule fois et réutilisé.
 * Vaut null tant que la configuration SMTP est absente : l'API bascule
 * alors en mode journalisation, pratique en développement.
 * @type {import('nodemailer').Transporter|null}
 */
let transporteur = null;

if (config.mail.host && config.mail.user) {
  transporteur = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    // Le port 587 utilise STARTTLS : la connexion démarre en clair puis
    // est chiffrée. `secure: true` est réservé au port 465.
    secure: config.mail.port === 465,
    auth: {
      user: config.mail.user,
      pass: config.mail.password
    }
  });
}

/**
 * Échappe les caractères qui ont une signification en HTML.
 * @param {string} valeur
 * @returns {string}
 */
function echapperHtml(valeur) {
  return String(valeur)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Supprime les retours à la ligne d'une valeur destinée à un en-tête.
 *
 * Sans cela, un objet contenant « \nBcc: victime@exemple.fr » ajouterait
 * un en-tête au message : c'est l'injection d'en-tête SMTP, qui permet
 * de transformer le formulaire en relais de spam.
 *
 * @param {string} valeur
 * @returns {string}
 */
function nettoyerEnTete(valeur) {
  return String(valeur).replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Envoie le message d'un internaute à un artisan.
 *
 * @param {object} params
 * @param {object} params.artisan Artisan destinataire (nom, email).
 * @param {string} params.nom Nom de l'expéditeur.
 * @param {string} params.email Adresse de l'expéditeur.
 * @param {string} params.objet Objet du message.
 * @param {string} params.message Corps du message.
 * @returns {Promise<{redirige: boolean}>}
 * @throws {ApiError} 503 si le relais SMTP est injoignable.
 */
export async function envoyerMessageArtisan({ artisan, nom, email, objet, message }) {
  const destinataireReel = artisan.email;
  const redirige = Boolean(config.mail.redirectTo);
  const destinataire = redirige ? config.mail.redirectTo : destinataireReel;

  const objetNettoye = nettoyerEnTete(objet);
  const sujet = `[Trouve ton artisan] ${objetNettoye}`;

  const avertissementRedirection = redirige
    ? `<p style="background:#f1f8fc;border-left:4px solid #0074c7;padding:12px;">
         <strong>Mode démonstration.</strong> Ce message aurait été envoyé à
         ${echapperHtml(destinataireReel)}.
       </p>`
    : '';

  const corpsHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#384050;line-height:1.5;">
      ${avertissementRedirection}
      <h1 style="color:#00497c;font-size:18px;">Nouveau message depuis Trouve ton artisan</h1>
      <p>Bonjour ${echapperHtml(artisan.nom)},</p>
      <p>Vous avez reçu une demande via la plateforme de la Région Auvergne-Rhône-Alpes.</p>
      <table cellpadding="6" style="border-collapse:collapse;">
        <tr><td><strong>Nom</strong></td><td>${echapperHtml(nom)}</td></tr>
        <tr><td><strong>E-mail</strong></td><td>${echapperHtml(email)}</td></tr>
        <tr><td><strong>Objet</strong></td><td>${echapperHtml(objetNettoye)}</td></tr>
      </table>
      <p><strong>Message :</strong></p>
      <p style="white-space:pre-wrap;">${echapperHtml(message)}</p>
      <hr style="border:none;border-top:1px solid #d9e4ec;">
      <p style="font-size:12px;color:#6b7280;">
        Une réponse est attendue sous 48 heures. Répondez directement à ce
        message pour joindre l'internaute.
      </p>
    </div>
  `;

  const corpsTexte = [
    `Nouveau message depuis Trouve ton artisan`,
    ``,
    `Destinataire : ${artisan.nom} (${destinataireReel})`,
    `Nom          : ${nom}`,
    `E-mail       : ${email}`,
    `Objet        : ${objetNettoye}`,
    ``,
    message
  ].join('\n');

  // Sans configuration SMTP (développement), le message est journalisé
  // plutôt qu'envoyé : le parcours reste testable de bout en bout.
  if (!transporteur) {
    console.info('[mailer] SMTP non configuré, message non envoyé :\n' + corpsTexte);
    return { redirige };
  }

  try {
    await transporteur.sendMail({
      from: config.mail.from,
      to: destinataire,
      // L'artisan répond directement à l'internaute. L'adresse est
      // validée en amont par express-validator.
      replyTo: `${nettoyerEnTete(nom)} <${email}>`,
      subject: sujet,
      text: corpsTexte,
      html: corpsHtml
    });
  } catch (erreur) {
    // Le détail technique reste dans les journaux du serveur.
    console.error('[mailer] Échec de l\'envoi :', erreur.message);
    throw ApiError.serviceUnavailable(
      "Le message n'a pas pu être envoyé pour le moment. Merci de réessayer plus tard."
    );
  }

  return { redirige };
}
