import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Envoi des messages du formulaire de contact.
 *
 * Sans configuration SMTP, le message est journalisé au lieu d'être
 * envoyé : le parcours reste testable de bout en bout en développement.
 */
let transporteur = null;

if (config.mail.host && config.mail.user) {
  transporteur = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    // Le port 587 démarre en clair puis chiffre via STARTTLS.
    // secure: true est réservé au port 465.
    secure: config.mail.port === 465,
    auth: {
      user: config.mail.user,
      pass: config.mail.password
    }
  });
}

function echapperHtml(valeur) {
  return String(valeur)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Retire les retours à la ligne d'une valeur destinée à un en-tête.
 * Sans cela, un objet contenant « \nBcc: victime@exemple.fr » ajouterait
 * un en-tête au message : c'est l'injection d'en-tête SMTP, qui
 * transforme le formulaire en relais de spam.
 */
function nettoyerEnTete(valeur) {
  return String(valeur).replace(/[\r\n]+/g, ' ').trim();
}

export async function envoyerMessageArtisan({ artisan, nom, email, objet, message }) {
  const destinataireReel = artisan.email;
  const redirige = Boolean(config.mail.redirectTo);
  const destinataire = redirige ? config.mail.redirectTo : destinataireReel;

  const objetNettoye = nettoyerEnTete(objet);

  const avertissementRedirection = redirige
    ? `<p style="background:#f1f8fc;border-left:4px solid #0074c7;padding:12px;">
         <strong>Mode démonstration.</strong> Ce message aurait été envoyé à
         ${echapperHtml(destinataireReel)}.
       </p>`
    : '';

  // Le contenu saisi est échappé : sans cela, un visiteur pourrait
  // injecter du HTML ou un lien piégé dans le message reçu par l'artisan.
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
    'Nouveau message depuis Trouve ton artisan',
    '',
    `Destinataire : ${artisan.nom} (${destinataireReel})`,
    `Nom          : ${nom}`,
    `E-mail       : ${email}`,
    `Objet        : ${objetNettoye}`,
    '',
    message
  ].join('\n');

  if (!transporteur) {
    console.info('[mailer] SMTP non configuré, message non envoyé :\n' + corpsTexte);
    return { redirige };
  }

  try {
    await transporteur.sendMail({
      from: config.mail.from,
      to: destinataire,
      // L'artisan répond directement à l'internaute.
      replyTo: `${nettoyerEnTete(nom)} <${email}>`,
      subject: `[Trouve ton artisan] ${objetNettoye}`,
      text: corpsTexte,
      html: corpsHtml
    });
  } catch (erreur) {
    console.error("[mailer] Échec de l'envoi :", erreur.message);
    throw ApiError.serviceUnavailable(
      "Le message n'a pas pu être envoyé pour le moment. Merci de réessayer plus tard."
    );
  }

  return { redirige };
}
