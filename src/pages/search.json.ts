import type { APIRoute } from "astro";
import { i18n } from "astro:config/client";
import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { buildExcerpt, markdownToPlain } from "$utils/text";

interface SearchRecord {
	id: string;
	slug: string;
	locale: string;
	type: "note" | "jotting";
	title: string;
	description?: string;
	series?: string | null;
	tags: string[];
	sensitive: boolean;
	timestamp: string;
	url: string;
	excerpt: string;
	searchText: string;
	priority: number;
}

const sortByImportance = (a: SearchRecord, b: SearchRecord) =>
	b.priority - a.priority || Date.parse(b.timestamp) - Date.parse(a.timestamp);

async function collectNotes(language: string): Promise<SearchRecord[]> {
	const entries = await getCollection("note", note => {
		const [locale] = note.id.split("/");
		const hidden = note.data.remove_from_search ?? false;
		const published = !note.data.draft;
		return published && !hidden && locale === language;
	});

	return Promise.all(
		entries.map(async note => {
			const [, ...slugParts] = note.id.split("/");
			const slug = slugParts.join("/");
			const body = "body" in note ? note.body ?? "" : "";
			let plain = markdownToPlain(body);
			if (!plain && "render" in note) {
				const rendered = await note.render();
				plain = markdownToPlain(rendered?.content ?? "");
			}

			return {
				id: note.id,
				slug,
				locale: language,
				type: "note" as const,
				title: note.data.title,
				description: note.data.description,
				series: note.data.series,
				tags: note.data.tags ?? [],
				sensitive: note.data.sensitive ?? false,
				timestamp: note.data.timestamp.toISOString(),
				url: getRelativeLocaleUrl(language, `/note/${slug}`),
				excerpt: note.data.description ?? buildExcerpt(body),
				searchText: plain,
				priority: Number(note.data.top ?? 0)
			};
		})
	);
}

async function collectJottings(language: string): Promise<SearchRecord[]> {
	const entries = await getCollection("jotting", jotting => {
		const [locale] = jotting.id.split("/");
		const published = !jotting.data.draft;
		return published && locale === language;
	});

	return entries.map(jotting => {
		const [, ...slugParts] = jotting.id.split("/");
		const slug = slugParts.join("/");
		const body = "body" in jotting ? jotting.body ?? "" : "";

		return {
			id: jotting.id,
			slug,
			locale: language,
			type: "jotting" as const,
			title: jotting.data.title,
			description: jotting.data.description,
			series: null,
			tags: jotting.data.tags ?? [],
			sensitive: jotting.data.sensitive ?? false,
			timestamp: jotting.data.timestamp.toISOString(),
			url: getRelativeLocaleUrl(language, `/jotting/${slug}`),
			excerpt: jotting.data.description ?? buildExcerpt(body, 120),
			searchText: markdownToPlain(body),
			priority: Number(jotting.data.top ?? 0)
		};
	});
}

export const GET: APIRoute = async ({ url }) => {
	const requested = url.searchParams.get("locale");
	const defaultLocale = i18n?.defaultLocale ?? "en";
	const language = requested && requested.length ? requested : defaultLocale;

	const [notes, jottings] = await Promise.all([collectNotes(language), collectJottings(language)]);
	const items = [...notes, ...jottings].sort(sortByImportance);

	return new Response(
		JSON.stringify({
			locale: language,
			generatedAt: new Date().toISOString(),
			items
		}),
		{
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=900, must-revalidate"
			}
		}
	);
};
