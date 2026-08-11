# Maquettes

Les quinze maquettes du projet : cinq écrans déclinés sur téléphone (390 px),
tablette (768 px) et ordinateur (1440 px), comme l'impose le cahier des charges.

Le plan de construction, avec la justification de chaque élément par une citation
du cahier des charges, est dans [`../maquettes-specification.md`](../maquettes-specification.md).

## Contenu

| Dossier | Rôle |
|---|---|
| `svg/` | Les frames, au format modifiable. Source de vérité. |
| `png/` | Leurs exports, insérés dans le dossier de projet (partie 2.3). |

Deux planches complètent les quinze frames et reprennent l'organisation prévue
pour le fichier Figma :

- `planche-styles` : le nuancier des huit couleurs, l'échelle typographique et le logo ;
- `planche-composants` : l'en-tête dans ses trois états, le pied de page, la carte
  d'artisan, les étoiles, les boutons et le champ de formulaire.

## Régénérer

Depuis la racine du projet :

```bash
node docs/maquettes/generer-maquettes.js && node docs/maquettes/exporter-png.js
```

Le premier script écrit les SVG, le second les rend en PNG avec Chrome. La charte
et les données du jeu d'essai sont déclarées en tête de `generer-maquettes.js` :
les modifier suffit à reconstruire l'ensemble de façon cohérente.

L'export attend Chrome à son emplacement habituel ; sinon, renseigner la variable
`CHROME_PATH`.

## Reprendre dans Figma

Le SVG s'importe nativement : chaque fichier devient une frame dont les textes,
les formes et les groupes restent modifiables.

1. Créer un fichier de design nommé « Trouve ton artisan ».
2. Y créer cinq pages : `Styles`, `Composants`, `Mobile`, `Tablette`, `Ordinateur`.
3. Glisser les fichiers de `svg/` depuis l'explorateur vers la page correspondante :
   les cinq `*-mobile.svg` sur `Mobile`, et ainsi de suite.
4. Renommer les frames, puis convertir en composants l'en-tête, le pied de page
   et la carte d'artisan, repris de la page `Composants`.
5. Relier les écrans en mode prototype, selon l'enchaînement décrit en fin de
   spécification.
6. Partager le fichier en lecture, puis coller le lien dans la partie 2.4 du
   dossier (`docs/dossier/dossier.html`, paragraphe `#lien-figma`) et régénérer
   le PDF.

## Choix de rendu

Le menu se replie derrière un bouton en dessous de 992 px, ce que fait Bootstrap
avec `navbar-expand-lg` : les maquettes téléphone **et** tablette le montrent donc
replié. Sur l'écran de liste, où le cahier des charges demande que la catégorie
consultée soit marquée dans le menu, la maquette le montre déplié : c'est le seul
état où ce marquage est visible.

La police Graphik étant sous licence commerciale, les maquettes utilisent Arial,
substitut prévu par la charte de la Région, comme le site.
