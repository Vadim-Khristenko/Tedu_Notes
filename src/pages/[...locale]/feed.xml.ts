import type { APIRoute } from "astro";
import { i18n } from "astro:config/client";
import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { Feed } from "feed";
import config from "$config";
import i18nit from "$i18n";

export async function getStaticPaths() {
	return i18n!.locales.map(locale => ({ params: { locale: locale == i18n?.defaultLocale ? undefined : (locale as string) } }));
}

/**
 * GET endpoint for generating feeds
 * Supports filtering by language, series, and tags
 */
export const GET: APIRoute = async ({ site, params, url }) => {
	const { locale: language = i18n?.defaultLocale! } = params;
	const t = i18nit(language);

	const preview = url.searchParams.get("preview") === "1" || import.meta.env.PUBLIC_PREVIEW === "true" || import.meta.env.DEV;
	const sectionParam = url.searchParams.get("section");
	const only = (sectionParam ?? (Array.isArray(config.feed?.section) ? (config.feed?.section as string[]).join(",") : (config.feed?.section ?? "*") as string)).split(",");
	const series = url.searchParams.get("series") ?? undefined;
	const tag = url.searchParams.get("tag") ?? undefined;

	// Initialize feed with site metadata and configuration
	const feed = new Feed({
		title: config.title,
		description: config.description,
		author: config.author,
		// Handle copyright based on license type - CC0 has special formatting
		copyright: config.copyright.type == "CC0 1.0"
			? "CC0 1.0 – No Rights Reserved"
			: `${config.copyright.type} © ${config.copyright.year} ${typeof config.author == "string" ? config.author : config.author.name}`,
		image: new URL("favicon-96x96.png", site).toString(),		// Feed image/logo
		favicon: new URL("favicon.ico", site).toString(),			// Feed favicon
		id: site!.toString(),										// Unique feed identifier
		link: site!.toString(),										// Feed's associated website
	});

	// Aggregate items from specified sections
	let items = [];

	if (only.includes("note") || only.includes("*") || config.feed?.section === undefined) {
		let notes = (await getCollection("note", note => {
			// Extract language from the file path structure
			const [locale, ...id] = note.id.split("/");

			// Attach locale and link
			(<any>note).link = new URL(getRelativeLocaleUrl(locale, `/note/${id.join("/")}`), site).toString();

			// Apply filtering criteria
			let published = preview ? true : !note.data.draft;        // Include drafts if preview
			let localed = language == locale;        // Language filter
			let inSeries = series ? note.data.series === series : true;
			let hasTag = tag ? (note.data.tags ?? []).includes(tag) : true;

			// Include note only if it passes all filters
			return published && localed && inSeries && hasTag;
		}));

		items.push(...notes);
	}

	if (only.includes("jotting") || only.includes("*") || config.feed?.section === undefined) {
		let jottings = (await getCollection("jotting", jotting => {
			// Extract language from the file path structure
			const [locale, ...id] = jotting.id.split("/");

			// Attach locale and link
			(<any>jotting).link = new URL(getRelativeLocaleUrl(locale, `/jotting/${id.join("/")}`), site).toString();

			// Apply filtering criteria
			let published = preview ? true : !jotting.data.draft;    // Include drafts if preview
			let localed = language == locale;       // Language filter
			let hasTag = tag ? (jotting.data.tags ?? []).includes(tag) : true;

			// Include note only if it passes all filters
			return published && localed && hasTag;
		}));

		items.push(...jottings);
	}

	// Sort all items by timestamp and limit to configured number
	items = items
		.sort((a, b) => b.data.timestamp.getTime() - a.data.timestamp.getTime())		// Sort by newest first
		.slice(0, config.feed?.limit || items.length);									// Limit to number of items

	// Add each filtered note as a feed item
	items.forEach((item) => feed.addItem({
		id: item.id,																								// Unique item identifier
		title: item.data.title,																						// Post title
		link: (<any>item).link,																						// URL to the post
		date: item.data.timestamp,																					// Publication date
		content: item.data.sensitive ? t("sensitive.feed", { link: (<any>item).link }) : item.rendered?.html,		// Rendered content
		description: item.data.description,																			// Summary of the post
		category: item.data.tags?.map((tag: any) => ({ term: tag }))												// Tags as categories
	}));

	// Append stylesheet declaration to the feed
	const XML = feed.atom1().replace(
		/(<\?xml version="1\.0" encoding="utf-8".*\?>)/,
		'$1\n<?xml-stylesheet type="text/xsl" href="feed.xsl"?>'
	);

	return new Response(XML, { headers: { "Content-Type": "application/xml" } });
}
