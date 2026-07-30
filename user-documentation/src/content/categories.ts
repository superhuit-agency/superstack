export const categorySlugs = [
	'getting-started',
	'pages',
	'blog',
	'navigation',
	'multilang',
	'section',
	'developpers',
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export interface CategoryMeta {
	slug: CategorySlug;
	label: string;
	description: string;
	subcategories?: string[];
}

export const categories: CategoryMeta[] = [
	{
		slug: 'getting-started',
		label: 'Démarrage',
		description:
			"Les gestes de base pour éditer une page dans l'admin WordPress.",
	},
	{
		slug: 'pages',
		label: 'Pages',
		description: 'Créer, organiser et structurer les pages du site.',
	},
	{
		slug: 'blog',
		label: 'Blog',
		description: 'Rédiger et publier des articles de blog.',
	},
	{
		slug: 'navigation',
		label: 'Navigation',
		description: 'Gérer les menus et la navigation du site.',
	},
	{
		slug: 'multilang',
		label: 'Multilangue',
		description: 'Gérer les contenus en français et en allemand.',
	},
	{
		slug: 'section',
		label: 'Sections',
		description:
			'Le catalogue des sections (compositions) à insérer dans une page.',
		subcategories: ['Heroes', 'Cartes', 'CTA', 'Media', 'Autres'],
	},
	{
		slug: 'developpers',
		label: 'Développeurs',
		description:
			'Fonctionnement de la superstack - Documentations pour les développeurs',
		subcategories: [
			'Astro',
			'Next',
			'Wordpress',
			'Block',
			'Architecture',
			'Setup',
			'Déploiement',
		],
	},
];

export function getCategory(slug: string): CategoryMeta | undefined {
	return categories.find((category) => category.slug === slug);
}
