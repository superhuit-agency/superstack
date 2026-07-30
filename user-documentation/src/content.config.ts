import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { categorySlugs } from './content/categories';

const docs = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
	schema: z.object({
		title: z.string(),
		category: z.enum(categorySlugs),
		subcategory: z.string().optional(),
		summary: z.string(),
		wordpressName: z.string().optional(),
		figmaLink: z.string().url().optional(),
		image: z.string().optional(),
		imageAlt: z.string().optional(),
		previewImage: z.string().optional(),
		order: z.number().default(0),
	}),
});

export const collections = { docs };
