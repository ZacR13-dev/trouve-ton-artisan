'use strict';

/**
 * Export des maquettes SVG en images matricielles.
 *
 * Le dossier de projet est imprimé en PDF : il lui faut des images. Les
 * frames sont donc rendues par Chrome, piloté par le protocole DevTools,
 * comme le fait déjà docs/dossier/generer-pdf.js.
 *
 * Le facteur d'agrandissement dépend du support : une frame de téléphone
 * est étroite et doit rester nette une fois imprimée, une frame
 * d'ordinateur est déjà large.
 *
 * Utilisation, depuis la racine du projet :
 *   node docs/maquettes/exporter-png.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;

const SOURCE = path.join(__dirname, 'svg');
const SORTIE = path.join(__dirname, 'png');

/** Agrandissement au rendu, par suffixe de fichier. */
const AGRANDISSEMENT = [
  [/-mobile\.svg$/, 2],
  [/-tablette\.svg$/, 1.5],
  [/-bureau\.svg$/, 1],
  [/^planche-/, 1]
];

const facteur = (nom) => (AGRANDISSEMENT.find(([motif]) => motif.test(nom)) ?? [null, 1])[1];

/** Dimensions déclarées à la racine du SVG. */
function dimensions(fichier) {
  const source = fs.readFileSync(fichier, 'utf8').slice(0, 400);
  const largeur = source.match(/\swidth="([\d.]+)"/);
  const hauteur = source.match(/\sheight="([\d.]+)"/);

  if (!largeur || !hauteur) {
    throw new Error(`Dimensions illisibles dans ${path.basename(fichier)}`);
  }

  return { largeur: Number(largeur[1]), hauteur: Number(hauteur[1]) };
}

async function attendreChrome(essais = 60) {
  for (let i = 0; i < essais; i++) {
    try {
      const reponse = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (reponse.ok) return;
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Chrome n'a pas répondu sur le port de débogage.");
}

/** Client minimal du protocole DevTools. */
class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.attentes = new Map();
    this.evenements = new Map();

    ws.addEventListener('message', (evenement) => {
      const message = JSON.parse(evenement.data);

      if (message.id && this.attentes.has(message.id)) {
        const { resoudre, rejeter } = this.attentes.get(message.id);
        this.attentes.delete(message.id);
        message.error ? rejeter(new Error(message.error.message)) : resoudre(message.result);
      } else if (message.method && this.evenements.has(message.method)) {
        this.evenements.get(message.method).forEach((f) => f(message.params));
        this.evenements.delete(message.method);
      }
    });
  }

  envoyer(method, params = {}) {
    const id = ++this.id;
    return new Promise((resoudre, rejeter) => {
      this.attentes.set(id, { resoudre, rejeter });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  attendreEvenement(method, delai = 20000) {
    return new Promise((resoudre) => {
      const liste = this.evenements.get(method) ?? [];
      liste.push(resoudre);
      this.evenements.set(method, liste);
      setTimeout(resoudre, delai);
    });
  }
}

(async () => {
  const fichiers = fs
    .readdirSync(SOURCE)
    .filter((nom) => nom.endsWith('.svg'))
    .sort();

  if (fichiers.length === 0) {
    throw new Error('Aucun SVG à exporter : lancez d\'abord generer-maquettes.js.');
  }

  fs.mkdirSync(SORTIE, { recursive: true });

  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + path.join(os.tmpdir(), 'chr-maquettes'),
    // Nécessaire pour qu'une page locale charge les SVG voisins.
    '--allow-file-access-from-files',
    'about:blank'
  ]);

  const gabarit = path.join(SOURCE, '_rendu.html');

  try {
    await attendreChrome();

    const cible = await (
      await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
    ).json();

    const ws = new WebSocket(cible.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r, { once: true }));

    const session = new Session(ws);
    await session.envoyer('Page.enable');

    for (const nom of fichiers) {
      const { largeur, hauteur } = dimensions(path.join(SOURCE, nom));
      const echelle = facteur(nom);

      // Une page hôte plutôt que le SVG seul : la taille de rendu y est
      // imposée en pixels, sans dépendre de la façon dont le navigateur
      // ajuste un SVG autonome à sa fenêtre.
      fs.writeFileSync(
        gabarit,
        '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
          '<style>html,body{margin:0;padding:0;background:#fff}img{display:block}</style>' +
          `</head><body><img src="${nom}" width="${largeur}" height="${hauteur}" alt=""></body></html>`,
        'utf8'
      );

      await session.envoyer('Emulation.setDeviceMetricsOverride', {
        width: Math.ceil(largeur),
        height: Math.ceil(hauteur),
        deviceScaleFactor: echelle,
        mobile: false
      });

      await session.envoyer('Page.navigate', {
        url: 'file:///' + gabarit.replace(/\\/g, '/')
      });
      await session.attendreEvenement('Page.loadEventFired');
      // Laisse le temps au SVG et au logo embarqué d'être décodés.
      await new Promise((r) => setTimeout(r, 350));

      const capture = await session.envoyer('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: largeur, height: hauteur, scale: echelle }
      });

      const destination = path.join(SORTIE, nom.replace(/\.svg$/, '.png'));
      fs.writeFileSync(destination, Buffer.from(capture.data, 'base64'));

      const octets = Math.round(fs.statSync(destination).size / 1024);
      console.log(
        `${path.basename(destination).padEnd(30)} ` +
          `${Math.round(largeur * echelle)}x${Math.round(hauteur * echelle)} px, ${octets} Ko`
      );
    }

    ws.close();
  } finally {
    fs.rmSync(gabarit, { force: true });
    chrome.kill();
  }
})().catch((erreur) => {
  console.error("Échec de l'export :", erreur.message);
  process.exit(1);
});
