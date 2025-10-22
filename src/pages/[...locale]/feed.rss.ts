import type { APIRoute } from "astro";
import { i18n } from "astro:config/client";
import { getCollection } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { Feed } from "feed";
import config from "$config";

export async function getStaticPaths() {
	return i18n!.locales.map(locale => ({ params: { locale: locale == i18n?.defaultLocale ? undefined : (locale as string) } }));
}

export const GET: APIRoute = async ({ site, params, url }) => {
	const language = (params.locale as string | undefined) ?? i18n?.defaultLocale ?? "ru";
	const preview = url.searchParams.get("preview") === "1" || import.meta.env.PUBLIC_PREVIEW === "true" || import.meta.env.DEV;
	const sectionParam = url.searchParams.get("section");
	const only = (sectionParam ?? (Array.isArray(config.feed?.section) ? (config.feed?.section as string[]).join(",") : (config.feed?.section ?? "*") as string)).split(",");
	const series = url.searchParams.get("series") ?? undefined;
	const tag = url.searchParams.get("tag") ?? undefined;

	const feed = new Feed({
		title: config.title,
		description: config.description,
		author: config.author as any,
		id: site!.toString(),
		link: site!.toString(),
		image: new URL("favicon-96x96.png", site).toString(),
		favicon: new URL("favicon.ico", site).toString(),
		copyright: (config as any).copyright?.type === "CC0 1.0"
			? "CC0 1.0 – No Rights Reserved"
			: `${(config as any).copyright?.type ?? ""} © ${(config as any).copyright?.year ?? ""} ${typeof (config as any).author == "string" ? (config as any).author : (config as any).author?.name ?? ""}`,
	});

	async function addNotes() {
		const notes = await getCollection("note", n => {
			const [locale] = n.id.split("/");
			const published = preview ? true : !n.data.draft;
			const localed = locale === language;
			const inSeries = series ? n.data.series === series : true;
			const hasTag = tag ? (n.data.tags ?? []).includes(tag) : true;
			return published && localed && inSeries && hasTag;
		});
		for (const n of notes) {
			const [, ...id] = n.id.split("/");
			feed.addItem({
				id: n.id,
				title: n.data.title,
				link: new URL(getRelativeLocaleUrl(language, `/note/${id.join("/")}`), site).toString(),
				date: n.data.timestamp,
				description: n.data.description,
				category: [ ...(n.data.series ? [{ name: n.data.series }] : []), ...((n.data.tags ?? []).map((t: string) => ({ name: t }))) ]
			});
		}
	}

	async function addJottings() {
		const jottings = await getCollection("jotting", j => {
			const [locale] = j.id.split("/");
			const published = preview ? true : !j.data.draft;
			const localed = locale === language;
			const hasTag = tag ? (j.data.tags ?? []).includes(tag) : true;
			return published && localed && hasTag;
		});
		for (const j of jottings) {
			const [, ...id] = j.id.split("/");
			feed.addItem({
				id: j.id,
				title: j.data.title,
				link: new URL(getRelativeLocaleUrl(language, `/jotting/${id.join("/")}`), site).toString(),
				date: j.data.timestamp,
				description: j.data.description,
				category: [ ...((j.data.tags ?? []).map((t: string) => ({ name: t }))) ]
			});
		}
	}

	if (only.includes("*") || only.includes("note")) await addNotes();
	if (only.includes("*") || only.includes("jotting")) await addJottings();

	return new Response(feed.rss2(), {
		headers: {
			"Content-Type": "application/rss+xml; charset=UTF-8",
			"Cache-Control": "public, max-age=900, must-revalidate"
		}
	});
};
