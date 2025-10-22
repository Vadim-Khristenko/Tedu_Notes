import type { APIRoute } from "astro";
import { i18n } from "astro:config/client";
import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { buildExcerpt, buildSearchTokens } from "$utils/text";

export async function getStaticPaths() {
	return i18n!.locales.map(locale => ({ params: { locale: locale == i18n?.defaultLocale ? undefined : (locale as string) } }));
}

type SearchRecord = {
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
};

const sortByImportance = (a: SearchRecord, b: SearchRecord) =>
	b.priority - a.priority || Date.parse(b.timestamp) - Date.parse(a.timestamp);

export const GET: APIRoute = async ({ params, url }) => {
	const language = (params.locale as string | undefined) ?? i18n?.defaultLocale ?? "en";
	const preview = url.searchParams.get("preview") === "1" || import.meta.env.PUBLIC_PREVIEW === "true" || import.meta.env.DEV;

	const notes = await getCollection("note", note => {
		const [locale] = note.id.split("/");
		const hidden = note.data.remove_from_search ?? false;
		const published = preview ? true : !note.data.draft;
		return published && !hidden && locale === language;
	});

	const jottings = await getCollection("jotting", jotting => {
		const [locale] = jotting.id.split("/");
		const published = preview ? true : !jotting.data.draft;
		return published && locale === language;
	});

	const noteRecords: SearchRecord[] = notes.map(note => {
		const [, ...slugParts] = note.id.split("/");
		const slug = slugParts.join("/");
		const body = "body" in note ? note.body : "";

		return {
			id: note.id,
			slug,
			locale: language,
			type: "note",
			title: note.data.title,
			description: note.data.description,
			series: note.data.series,
			tags: note.data.tags ?? [],
			sensitive: note.data.sensitive ?? false,
			timestamp: note.data.timestamp.toISOString(),
			url: getRelativeLocaleUrl(language, `/note/${slug}`),
			excerpt: note.data.description ?? buildExcerpt(body),
			searchText: buildSearchTokens({
				title: note.data.title,
				description: note.data.description,
				body,
				tags: note.data.tags
			}),
			priority: Number(note.data.top ?? 0)
		};
	});

	const jottingRecords: SearchRecord[] = jottings.map(jotting => {
		const [, ...slugParts] = jotting.id.split("/");
		const slug = slugParts.join("/");
		const body = "body" in jotting ? jotting.body : "";

		return {
			id: jotting.id,
			slug,
			locale: language,
			type: "jotting",
			title: jotting.data.title,
			description: jotting.data.description,
			series: null,
			tags: jotting.data.tags ?? [],
			sensitive: jotting.data.sensitive ?? false,
			timestamp: jotting.data.timestamp.toISOString(),
			url: getRelativeLocaleUrl(language, `/jotting/${slug}`),
			excerpt: jotting.data.description ?? buildExcerpt(body, 120),
			searchText: buildSearchTokens({
				title: jotting.data.title,
				description: jotting.data.description,
				body,
				tags: jotting.data.tags
			}),
			priority: Number(jotting.data.top ?? 0)
		};
	});

	const items = [...noteRecords, ...jottingRecords].sort(sortByImportance);

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
