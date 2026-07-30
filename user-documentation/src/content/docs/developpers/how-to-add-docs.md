---
title: 'Ajouter une page de documentation'
category: 'developpers'
subcategory: 'Astro'
summary: 'Créer une page dans la documentation'
order: 1
---

Les pages de documentation se trouve dans le répertoire : `src/content/docs`.
Le dossier est divisé par catégorie.
Dans chaque catégorie, il y a les fichiers de documentation.
Les documentations sont écrites **markdown**.

## Création du fichier

Chaque fichier de documentation est séparé en 2 partie : l'entête et le corps (markdown)

### En-tête du fichier

Le schéma de l'en-tête est défini dans `src/content.config.ts`. Voici le détail de chaque champ :

| Champ           | Obligatoire | Type     | Description                                                                                                                                                                              |
| --------------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`         | Oui         | `string` | Nom de la page, affiché comme titre de la documentation.                                                                                                                                 |
| `category`      | Oui         | `enum`   | Catégorie de la page. Doit correspondre à un slug défini dans `src/content/categories.ts` (ex. `getting-started`, `pages`, `blog`, `navigation`, `multilang`, `section`, `developpers`). |
| `subcategory`   | Non         | `string` | Sous-catégorie de la page, utilisée pour regrouper les pages au sein d'une catégorie.                                                                                                    |
| `summary`       | Oui         | `string` | Description courte apparaissant sur la carte de la documentation.                                                                                                                        |
| `wordpressName` | Non         | `string` | Nom de la section/du bloc tel qu'il apparaît dans WordPress, pour faire le lien avec l'éditeur.                                                                                          |
| `figmaLink`     | Non         | `url`    | Lien vers la maquette Figma correspondante.                                                                                                                                              |
| `image`         | Non         | `string` | Chemin de l'image affichée en haut de la page de documentation.                                                                                                                          |
| `imageAlt`      | Non         | `string` | Texte alternatif de l'image (`image` et/ou `previewImage`).                                                                                                                              |
| `previewImage`  | Non         | `string` | Chemin de l'image affichée sur la carte de la documentation.                                                                                                                             |
| `order`         | Non         | `number` | Ordre d'affichage de la page dans sa catégorie/sous-catégorie (par défaut `0`).                                                                                                          |

Par exemple :

```md
---
title: 'Section texte + média'
category: 'section'
subcategory: 'Media'
wordpressName: 'Section text + média'
summary: "Une image d'un côté, du texte et des boutons de l'autre, sur un fond de couleur."
image: '/docs/section/section-text-media/overview.png'
imageAlt: "Section texte + média affichée dans l'éditeur"
previewImage: '/docs/section/section-text-media/card-preview.png'
order: 1
---
```
