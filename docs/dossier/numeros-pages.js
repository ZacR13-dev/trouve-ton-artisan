/**
 * Calcul des numéros de page du sommaire.
 *
 * Chaque grande partie du dossier commence sur une nouvelle page (règle
 * CSS « break-before: page »). À l'intérieur d'une partie, la pagination
 * est simulée bloc par bloc : un tableau, une galerie de captures ou un
 * encadré porte « break-inside: avoid » et bascule donc entièrement sur
 * la page suivante s'il ne tient pas dans la place restante. Ignorer ce
 * comportement fausserait le compte, puisque le blanc laissé en bas de
 * page occupe malgré tout de la hauteur.
 *
 * Le script s'exécute au chargement, avant l'impression : les numéros
 * sont déjà en place dans le PDF produit.
 */

(function remplirNumerosDePage() {
  /**
   * Hauteur utile d'une page A4, marges déduites. Elle est mesurée par
   * le navigateur à partir de la variable CSS plutôt que calculée à
   * partir d'une constante de conversion approximative.
   * @returns {number} Hauteur en pixels.
   */
  function hauteurUtileEnPixels() {
    const temoin = document.createElement('div');
    temoin.style.cssText = 'position:absolute;visibility:hidden;height:var(--hauteur-utile);';
    document.body.appendChild(temoin);
    const hauteur = temoin.getBoundingClientRect().height;
    temoin.remove();
    return hauteur;
  }

  const hauteurPage = hauteurUtileEnPixels();
  if (!hauteurPage) return;

  /** Page de début, indexée par élément rencontré. */
  const pageParElement = new Map();
  let pageCourante = 1;

  document.querySelectorAll('.garde, .page').forEach((section) => {
    const hautSection = section.getBoundingClientRect().top;
    const hauteurSection = section.getBoundingClientRect().height;
    const enfants = Array.from(section.children);

    // Position verticale occupée sur la page en cours.
    let curseur = 0;
    let pageLocale = 0;

    pageParElement.set(section, pageCourante);

    enfants.forEach((enfant, index) => {
      const debut = enfant.getBoundingClientRect().top - hautSection;
      // La hauteur retenue va du haut de ce bloc au haut du suivant :
      // elle intègre ainsi les marges qui les séparent.
      const suivant = enfants[index + 1];
      const fin = suivant ? suivant.getBoundingClientRect().top - hautSection : hauteurSection;
      const hauteur = Math.max(0, fin - debut);

      const insecable = getComputedStyle(enfant).breakInside === 'avoid';

      // Un bloc insécable qui ne tient pas dans la place restante est
      // reporté en haut de la page suivante.
      if (insecable && hauteur <= hauteurPage && curseur + hauteur > hauteurPage) {
        pageLocale += 1;
        curseur = 0;
      }

      pageParElement.set(enfant, pageCourante + pageLocale);

      curseur += hauteur;

      // Un bloc plus haut qu'une page se répartit sur plusieurs pages.
      while (curseur > hauteurPage) {
        curseur -= hauteurPage;
        pageLocale += 1;
      }
    });

    pageCourante += pageLocale + 1;
  });

  document.querySelectorAll('.sommaire .num').forEach((marqueur) => {
    const cible = document.getElementById(marqueur.dataset.cible);
    if (!cible) return;

    // Le titre visé est soit un enfant direct de la section, soit
    // imbriqué : on remonte jusqu'au bloc dont la page est connue.
    let element = cible;
    while (element && !pageParElement.has(element)) {
      element = element.parentElement;
    }

    if (element) {
      marqueur.textContent = String(pageParElement.get(element));
    }
  });

  // Expose le total pour le contrôle automatisé de la pagination.
  window.__totalPagesCalcule = pageCourante - 1;
})();
