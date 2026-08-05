/**
 * Transforme un libellé en identifiant d'URL : « Bâtiment » donne
 * « batiment ». Les slugs sont calculés ici puis transmis au front, pour
 * que la règle n'existe qu'à un seul endroit.
 */
export function slugify(valeur) {
  return String(valeur)
    .normalize('NFD')
    // Retire les diacritiques isolés par la décomposition.
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
