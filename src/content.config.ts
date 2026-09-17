import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  // NOTE: folder + collection key are still named "episodes" - a holdover
  // from the podcast template. Renaming both to "trips" is possible later,
  // but touches every file that calls getCollection('episodes'), so it's a
  // separate cleanup step, not bundled into this schema change.
  loader: glob({ pattern: '*.json', base: './src/content/episodes' }),
  schema: z.object({
    name: z.string(), // Trip title, e.g. "Atlas Mountains, Morocco"
    destination: z.string().optional(), // Country / region shown on the card
    dates: z.string().optional(), // Display string - "March 2027" or "Dates TBC"
    status: z.enum(['Open', 'Full', 'Upcoming']).default('Upcoming'),
    groupSize: z.string().optional(), // e.g. "Max 12 travelers"
    price: z.string().optional(), // Only rendered when showPrice is true
    showPrice: z.boolean().default(false), // Pricing-visibility decision still open - default hidden
    shortDescription: z.string().optional(), // Card + meta description
    thumbnail: z.string().optional(), // Card + detail hero image
    image: z.string().optional(), // Wide photo for the detail page
    description: z.string().optional(), // Rich text HTML body
    order: z.number().default(0),
  }),
});

const blogs = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/blogs' }),
  schema: z.object({
    name: z.string(),
    author: z.string().optional(),
    date: z.string().optional(),
    shortDescription: z.string().optional(),
    thumbnail: z.string().optional(),
    resumen: z.string().optional(), // rich text HTML
    order: z.number().default(0),
  }),
});

// One hero trip (South Africa) told through non-linking highlight moments -
// not a repeatable "many trips, each with its own page" model like
// `episodes` above. Each entry is a highlight card on the home page; none of
// them navigate anywhere (site rule: the only outward link is Apply).
const highlights = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/highlights' }),
  schema: z.object({
    name: z.string(), // Highlight title, e.g. "Dawn game drives in Kruger"
    description: z.string().optional(), // One short sentence or two - plain text, no rich HTML (no detail page to hold it)
    image: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { episodes, blogs, highlights };
