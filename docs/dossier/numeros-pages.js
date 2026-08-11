/**
 * Numéros de page du sommaire.
 *
 * Le nombre de pages qu'occupe chaque partie n'est pas calculable de
 * façon fiable depuis le navigateur : un tableau ou une galerie qui ne
 * tient pas dans la place restante bascule entièrement sur la page
 * suivante, et le blanc laissé derrière lui compte quand même. Les
 * hauteurs réelles sont donc mesurées par le script de génération, qui
 * imprime chaque partie isolément et compte ses pages, puis les transmet
 * ici.
 *
 * Sans ces mesures, le script se rabat sur une estimation, ce qui permet
 * d'ouvrir le document directement dans un navigateur.
 */

(function preparerNumerotation() {
  /** Hauteur utile d'une page A4, mesurée à partir de la variable CSS. */
  function hauteurUtileEnPixels() {
    const temoin = document.createElement('div');
    temoin.style.cssText = 'position:absolute;visibility:hidden;height:var(--hauteur-utile);';
    document.body.appendChild(temoin);
    const hauteur = temoin.getBoundingClientRect().height;
    temoin.remove();
    return hauteur;
  }

  /**
   * Renseigne le sommaire.
   *
   * @param {number[]} [pagesParSection] Nombre de pages réellement
   *   occupé par chaque partie, dans l'ordre du document.
   */
  function appliquerPagination(pagesParSection) {
    const hauteurPage = hauteurUtileEnPixels();
    if (!hauteurPage) return;

    const sections = document.querySelectorAll('.garde, .page');
    const pageParSection = new Map();
    let pageCourante = 1;

    sections.forEach((section, index) => {
      pageParSection.set(section, pageCourante);

      const mesure = pagesParSection?.[index];
      const estimation = Math.ceil(section.getBoundingClientRect().height / hauteurPage);

      pageCourante += Math.max(1, mesure ?? estimation);
    });

    document.querySelectorAll('.sommaire .num').forEach((marqueur) => {
      const cible = document.getElementById(marqueur.dataset.cible);
      if (!cible) return;

      const section = cible.closest('.page, .garde');
      if (!section) return;

      // Position du titre à l'intérieur de sa partie, convertie en pages.
      const decalage = cible.getBoundingClientRect().top - section.getBoundingClientRect().top;
      const pagesInternes = Math.floor(decalage / hauteurPage);

      marqueur.textContent = String(pageParSection.get(section) + pagesInternes);
    });

    window.__totalPagesCalcule = pageCourante - 1;
  }

  // Appelé par le script de génération une fois les mesures faites.
  window.__appliquerPagination = appliquerPagination;

  // Estimation immédiate, pour une consultation directe dans un
  // navigateur.
  appliquerPagination();
})();
