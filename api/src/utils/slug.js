/**
 * Transformation d'un libellé en identifiant d'URL lisible.
 *
 * « Bâtiment » devient « batiment ». Les slugs sont calculés côté API et
 * transmis au front : la logique n'existe donc qu'à un seul endroit, et
 * les URL du site restent lisibles et référençables.
 */

/**
 * @param {string} value Libellé à convertir.
 * @returns {string} Slug en minuscules, sans accent ni caractère spécial.
 */
export function slugify(value) {
  return String(value)
    // Décompose les caractères accentués (é devient e + accent aigu)...
    .normalize('NFD')
    // ...puis retire les diacritiques ainsi isolés (bloc Unicode
    // « Combining Diacritical Marks »).
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    // Tout ce qui n'est ni lettre ni chiffre devient un tiret.
    .replace(/[^a-z0-9]+/g, '-')
    // Pas de tiret en début ou en fin de slug.
    .replace(/^-+|-+$/g, '');
}
