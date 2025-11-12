import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

/**
 * Note collection configuration
 * Represents main blog articles with comprehensive metadata
 */
const note = defineCollection({
	// Load all markdown files except those starting with underscore (private/draft files)
	loader: glob({ pattern: ["**/*.md", "!**/_*.md", "!**/_*/*.md"], base: "./src/content/note" }),
	schema: z.object({
		// Identification
		title: z.string(), // Post title (required)
		slug: z.string().optional(), // Custom slug if needed

		// Time and relevance
		timestamp: z.date(), // Publication date
		last_updated_timestamp: z.date().optional(), // Last update (for feeds and UI)

		// Structure and navigation
		series: z.string().optional(), // Series name
		tags: z.array(z.string()).default([]), // Array of tags; always an array for convenience
		groups: z.array(z.string()).default([]).optional(), // Additional groupings (courses, streams, etc.)
		remove_from_search: z.boolean().default(false), // Exclude from search and auto-suggestions

		// Display and UX
		description: z.string().optional(), // Brief description/excerpt
		contents: z.boolean().default(false), // Show table of contents
		title_split: z.boolean().default(true), // Allow splitting title into multiple lines

		// Flags
		sensitive: z.boolean().default(false), // Marks content as sensitive
		top: z.number().int().nonnegative().default(0), // Priority for anchoring/sorting
		draft: z.boolean().default(false), // Draft status (excludes from public listing)

		// Media
		image: z.string().optional(), // Path or URL to the cover image (supports relative)
		image_alt: z.string().optional(), // Alt text for the cover image
	})
});

/**
 * Jotting collection configuration
 * Represents shorter posts, quick thoughts, or micro-blog entries
 */
const jotting = defineCollection({
	// Load all markdown files except those starting with underscore
	loader: glob({ pattern: ["**/*.md", "!**/_*.md", "!**/_*/*.md"], base: "./src/content/jotting" }),
	schema: z.object({
		title: z.string(),								// Jotting title (required)
		timestamp: z.date(),							// Publication date (required)
		last_updated_timestamp: z.date().optional(),	// Last updated date
		groups: z.array(z.string()).optional(),			// Array of group names
		tags: z.array(z.string()).optional(),			// Array of topic tags
		description: z.string().optional(),				// Brief description
		sensitive: z.boolean().default(false),			// Marks content as sensitive
		top: z.number().int().nonnegative().default(0),	// Top priority for sorting (higher is more important)
		draft: z.boolean().default(false),				// Draft status (excludes from public listing)
		title_split: z.boolean().default(true)			// Whether to split title into multiple lines
	})
});

/**
 * Preface collection configuration
 * Represents introductory content, site announcements, or special pages
 */
const preface = defineCollection({
	// Load all markdown files
	loader: glob({ pattern: "**/*.md", base: "./src/content/preface" }),
	schema: z.object({
		timestamp: z.date()		// Creation timestamp
	})
});

/**
 * Information collection configuration
 * Represents static content like about pages, policies, or site information
 */
const information = defineCollection({
	// Load both markdown and YAML files for mixed content types
	loader: glob({ pattern: "**/*.(md|yaml)", base: "./src/content/information" })
});

export const collections = { note, jotting, preface, information };
