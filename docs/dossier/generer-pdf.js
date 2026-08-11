/**
 * Génération du dossier de projet au format PDF.
 *
 * Le document HTML est rendu par Chrome, piloté par le protocole
 * DevTools, puis imprimé au format A4 avec un en-tête et un pied de page
 * répétés sur chaque page.
 *
 * Utilisation, depuis la racine du projet :
 *   node docs/dossier/generer-pdf.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;

const SOURCE = path.join(__dirname, 'dossier.html');
const SORTIE = path.join(__dirname, 'Trouve-ton-artisan-dossier-de-projet.pdf');

/** Millimètres vers pouces, unité attendue par le moteur d'impression. */
const mm = (valeur) => valeur / 25.4;

/** Compte les pages d'un PDF à partir de ses objets /Type /Page. */
const compterPages = (donnees) =>
  (Buffer.from(donnees, 'base64').toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;

const EN_TETE = `
  <div style="font-size:7.5pt;font-family:'Segoe UI',sans-serif;color:#5a6472;
              width:100%;padding:0 15mm 2mm;display:flex;justify-content:space-between;
              border-bottom:0.5pt solid #d9e4ec;">
    <span>Trouve ton artisan, dossier de projet</span>
    <span>Région Auvergne-Rhône-Alpes</span>
  </div>`;

const PIED = `
  <div style="font-size:7.5pt;font-family:'Segoe UI',sans-serif;color:#5a6472;
              width:100%;padding:2mm 15mm 0;display:flex;justify-content:space-between;
              border-top:0.5pt solid #d9e4ec;">
    <span>Kévin Reis, titre professionnel Développeur Web et Web Mobile</span>
    <span>page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
  </div>`;

async function attendreChrome(essais = 60) {
  for (let i = 0; i < essais; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return;
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

    ws.addEventListener('message', (e) => {
      const message = JSON.parse(e.data);

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
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Document introuvable : ${SOURCE}`);
  }

  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + path.join(require('os').tmpdir(), 'chr-pdf'),
    // Nécessaire pour que le document lise les captures depuis le disque.
    '--allow-file-access-from-files',
    'about:blank'
  ]);

  try {
    await attendreChrome();

    const cible = await (
      await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
    ).json();

    const ws = new WebSocket(cible.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r, { once: true }));

    const session = new Session(ws);
    await session.envoyer('Page.enable');

    const url = 'file:///' + SOURCE.replace(/\\/g, '/');
    await session.envoyer('Page.navigate', { url });
    await session.attendreEvenement('Page.loadEventFired');
    // Laisse le temps aux captures d'écran d'être décodées et à la
    // numérotation du sommaire de s'exécuter.
    await new Promise((r) => setTimeout(r, 2500));

    const optionsImpression = {
      paperWidth: mm(210),
      paperHeight: mm(297),
      marginTop: mm(18),
      marginBottom: mm(16),
      marginLeft: mm(15),
      marginRight: mm(15),
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: EN_TETE,
      footerTemplate: PIED,
      preferCSSPageSize: false
    };

    /**
     * Mesure de la pagination réelle.
     *
     * Le nombre de pages d'une partie n'est pas déductible de sa hauteur :
     * un tableau ou une galerie qui ne tient pas dans la place restante
     * bascule entièrement sur la page suivante. Chaque partie est donc
     * imprimée seule, et ses pages comptées. C'est Chrome qui répond, pas
     * une estimation.
     */
    const { result: nombreSections } = await session.envoyer('Runtime.evaluate', {
      expression: "document.querySelectorAll('.garde, .page').length",
      returnByValue: true
    });

    const pagesParSection = [];

    for (let index = 0; index < nombreSections.value; index++) {
      await session.envoyer('Runtime.evaluate', {
        expression: `document.querySelectorAll('.garde, .page')
          .forEach((section, i) => { section.style.display = i === ${index} ? '' : 'none'; })`
      });

      const partie = await session.envoyer('Page.printToPDF', optionsImpression);
      pagesParSection.push(compterPages(partie.data));
    }

    // Tout réafficher, puis renseigner le sommaire avec les vraies mesures.
    await session.envoyer('Runtime.evaluate', {
      expression: `document.querySelectorAll('.garde, .page')
        .forEach((section) => { section.style.display = ''; });
        window.__appliquerPagination(${JSON.stringify(pagesParSection)});`
    });

    const { result: controle } = await session.envoyer('Runtime.evaluate', {
      expression: `JSON.stringify({
        total: window.__totalPagesCalcule,
        parties: [...document.querySelectorAll('.sommaire li:not(.sous)')]
          .map((li) => li.querySelector('a').textContent + ' p.' + li.querySelector('.num').textContent)
      })`,
      returnByValue: true
    });

    const { total, parties } = JSON.parse(controle.value);
    console.log(`Pages par partie : ${pagesParSection.join(' ')} (total ${total})`);
    parties.forEach((ligne) => console.log(`  ${ligne}`));

    const pdf = await session.envoyer('Page.printToPDF', optionsImpression);

    fs.writeFileSync(SORTIE, Buffer.from(pdf.data, 'base64'));

    const taille = Math.round(fs.statSync(SORTIE).size / 1024);
    console.log(`PDF généré : ${SORTIE} (${taille} Ko)`);

    ws.close();
  } finally {
    chrome.kill();
  }
})().catch((erreur) => {
  console.error('Échec de la génération :', erreur.message);
  process.exit(1);
});
