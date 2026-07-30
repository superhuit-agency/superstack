---
title: 'Ajouter une catégorie dans la documentation'
category: 'developpers'
subcategory: 'Astro'
summary: 'Créer une catégorie ou une sous-catégorie'
order: 1
---

Les catégories de la documentation sont définies dans un seul fichier :
`src/content/categories.ts`. C'est la source de vérité utilisée à la fois pour la validation du
frontmatter (`src/content.config.ts`) et pour l'affichage des pages de catégorie
(`src/pages/[category]/index.astro`).

## Ajouter une catégorie

### 1. Déclarer le slug

Ajouter le nouveau slug dans le tableau `categorySlugs` :

```ts
export const categorySlugs = [
	'getting-started',
	'pages',
	'blog',
	'navigation',
	'multilang',
	'section',
	'developpers',
	'ma-nouvelle-categorie', // 👈
] as const;
```

Ce tableau alimente directement le schéma zod (`category: z.enum(categorySlugs)`) dans
`src/content.config.ts` : aucune autre modification n'est nécessaire de ce côté-là.

### 2. Déclarer les métadonnées

Ajouter l'entrée correspondante dans le tableau `categories` :

```ts
{
  slug: 'ma-nouvelle-categorie',
  label: 'Ma nouvelle catégorie',
  description: 'Description affichée en haut de la page de catégorie.',
},
```

| Champ           | Obligatoire | Description                                                                     |
| --------------- | ----------- | -------------------------------------------------------------------------------- |
| `slug`           | Oui         | Doit correspondre exactement à une valeur de `categorySlugs`.                    |
| `label`          | Oui         | Nom affiché (titre de la page, cartes, breadcrumb).                              |
| `description`    | Oui         | Phrase affichée sous le titre de la page de catégorie.                          |
| `subcategories`  | Non         | Liste des sous-catégories disponibles (voir plus bas).                          |

### 3. Créer le dossier de contenu

Créer le dossier `src/content/docs/ma-nouvelle-categorie/` et y ajouter au moins une page markdown
avec `category: 'ma-nouvelle-categorie'` dans son frontmatter (voir [Ajouter une page de
documentation](./how-to-add-docs)).

## Ajouter une sous-catégorie

Les sous-catégories ne sont pas un type à part : ce sont de simples chaînes de caractères.

### 1. Déclarer la sous-catégorie

Ajouter la chaîne dans le tableau `subcategories` de la catégorie concernée :

```ts
{
  slug: 'developpers',
  label: 'Développeurs',
  description: '...',
  subcategories: ['Astro', 'Next', 'Wordpress', 'Block', 'Ma nouvelle sous-catégorie'], // 👈
},
```

### 2. Utiliser la sous-catégorie dans une page

Renseigner le champ `subcategory` dans le frontmatter d'une page de cette catégorie, avec la même
orthographe exacte que dans `categories.ts` (comparaison sensible à la casse) :

```yaml
---
title: '...'
category: 'developpers'
subcategory: 'Ma nouvelle sous-catégorie'
---
```

## À noter

- Le filtre par pastilles sur la page de catégorie n'affiche que les sous-catégories qui ont **au
  moins une page** avec ce `subcategory` exact — une sous-catégorie déclarée dans `categories.ts`
  mais sans page correspondante reste invisible.
- Le champ `subcategory` n'est pas validé par une énumération : une faute de frappe ne provoquera
  pas d'erreur au build, la page sera simplement rangée hors de toute pastille de filtre.
- Les 7 catégories sont volontairement fixes dans le design du site : ne pas les rendre
  dynamiques ou éditables depuis WordPress.
