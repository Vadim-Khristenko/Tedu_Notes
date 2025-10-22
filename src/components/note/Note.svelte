<style lang="less">
	.note-layout {
		display: flex;
		flex-direction: column-reverse;
		gap: 2.5rem;

		@media (min-width: 640px) {
			flex-direction: row;
		}
	}

	.note-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		flex: 1 1 auto;
	}

	.note-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		justify-content: space-between;
	}

	.note-toolbar__filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.note-quicksearch {
		border: 1px solid var(--weak-color);
		border-radius: 10px;
		padding: 8px 12px;
		background: transparent;
		color: var(--text-color);
		min-width: 300px;
		max-width: 420px;
	}

	.active-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		background-color: var(--background-weak-color);
		color: var(--primary-color);
		font-size: 0.8rem;
		font-weight: 600;
	}

	.active-chip button {
		border: none;
		background: none;
		color: inherit;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.note-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.25rem;
	}

	.note-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.25rem;
		border-radius: 1rem;
		background: color-mix(in srgb, var(--background-color) 92%, var(--primary-color) 8%);
		border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent 80%);
		transition: transform 0.15s ease, border-color 0.15s ease;
	}

	.note-card:hover {
		transform: translateY(-4px);
		border-color: var(--primary-color);
	}

	.note-card__title {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.note-card__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
		font-size: 0.8rem;
		color: var(--remark-color);
	}

	.note-card__description {
		font-size: 0.85rem;
		line-height: 1.45;
		color: var(--remark-color);
	}

	.note-card__meta time {
		font-family: var(--monospace);
	}

	.note-card__title a {
		font-size: 1.05rem;
		font-weight: 650;
		color: inherit;
		text-decoration: none;
	}

	.note-card__title a:hover {
		color: var(--primary-color);
	}

	.title-line {
		display: block;
		line-height: 1.15;
	}

	.note-card__badges {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		font-size: 0.7rem;
		line-height: 1;
		font-weight: 650;
		text-transform: uppercase;
		background: var(--primary-color);
		color: var(--background-color);
	}

	.badge--outline {
		background: transparent;
		color: var(--primary-color);
		border: 1px solid color-mix(in srgb, var(--primary-color) 60%, transparent 40%);
	}

	.note-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: var(--remark-color);
	}

	.note-card__tags button {
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
	}

	.note-card__tags button:hover {
		color: var(--primary-color);
	}

	.note-card__series button {
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		font-weight: 600;
	}

	.note-card__series button:hover {
		color: var(--primary-color);
	}

	.note-empty {
		padding: 2rem;
		text-align: center;
		border-radius: 1rem;
		background: var(--background-weak-color);
		color: var(--remark-color);
	}

	.note-pagination {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		align-items: center;
		padding-top: 0.75rem;
		border-top: 1px dashed color-mix(in srgb, var(--remark-color) 40%, transparent 60%);
		position: sticky;
		bottom: 0;
		background: var(--background-color);
	}

	.note-pagination button {
		width: 34px;
		height: 34px;
		display: grid;
		place-items: center;
		border: none;
		background: none;
		font-family: var(--monospace);
		font-size: 0.85rem;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		transition: color 0.2s ease, border-color 0.2s ease;
	}

	.note-pagination button:hover,
	.note-pagination button.location {
		color: var(--primary-color);
		border-color: currentColor;
	}

	.note-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		flex: 0 0 220px;
	}

	.note-sidebar section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.55rem;
		border: 1px solid color-mix(in srgb, var(--primary-color) 50%, transparent 50%);
		border-radius: 999px;
		background: transparent;
		font-size: 0.8rem;
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.filter-chip.selected {
		background: var(--primary-color);
		color: var(--background-color);
	}

	.filter-chip:hover {
		background: color-mix(in srgb, var(--primary-color) 15%, transparent 85%);
	}

	.clear-filters {
		border: none;
		background: none;
		color: var(--remark-color);
		cursor: pointer;
		font-size: 0.8rem;
	}

	.clear-filters:hover {
		color: var(--primary-color);
	}

	@media (max-width: 639px) {
		.note-pagination {
			position: static;
			border-top: none;
		}
	}
</style>

<main class="note-layout">
	<article class="note-content">
		<header class="note-toolbar">
			<div class="note-toolbar__filters">
				<h2 class="text-size-lg font-semibold">{t("navigation.note")}</h2>
						{#if hasFilters()}
							<div class="note-toolbar__filters">
								{#if series}
									<span class="active-chip">
										{series}
										<button type="button" aria-label="Remove series" onclick={() => choose_series(series, false)}>×</button>
									</span>
						{/if}
						{#each tags as tag (tag)}
							<span class="active-chip">
								#{tag}
								<button type="button" aria-label="Remove tag" onclick={() => switch_tag(tag, false)}>×</button>
							</span>
						{/each}
					</div>
				{/if}
			</div>
			<div class="note-toolbar__filters">
				<input class="note-quicksearch" type="search" placeholder={t("search.placeholder") ?? "Поиск…"} bind:value={q} />
				<span class="text-3.5 c-remark">{filtered.length} / {notes.length}</span>
				{#if hasFilters()}
					<button class="clear-filters" type="button" onclick={clearFilters}>{t("search.clear") ?? "Clear"}</button>
				{/if}
			</div>
		</header>

		{#if list.length === 0}
			<p class="note-empty">{t("note.empty")}</p>
		{:else}
			<section class="note-grid">
				{#each list as note (note.id)}
					<article class="note-card" animate:flip={{ duration: 150 }}>
						<header class="note-card__title">
							<div class="note-card__badges">
								{#if note.data.top > 0}<span class="badge">{@render top()}</span>{/if}
								{#if note.data.sensitive}<span class="badge badge--outline">{@render sensitive()}</span>{/if}
							</div>
							<a href={getRelativeLocaleUrl(locale, `/note/${note.id.split("/").slice(1).join("/")}`)}>
								{#each formatTitle(note.data.title) as line (line)}
									<span class="title-line">{line}</span>
								{/each}
							</a>
						</header>
						{#if note.data.series}
							<div class="note-card__series">
								<button type="button" onclick={() => choose_series(note.data.series, true)}>{note.data.series}</button>
							</div>
						{/if}
						<div class="note-card__meta">
							<time title={Time.full(note.data.timestamp)} datetime={note.data.timestamp.toISOString()}>{Time.date.locale(note.data.timestamp, locale)}</time>
						</div>
						{#if note.data.last_updated_timestamp}
							<div class="note-card__meta">
								<time title={Time.full(note.data.last_updated_timestamp)} datetime={note.data.last_updated_timestamp.toISOString()}>{t("note.last_updated")} {Time.date.locale(note.data.last_updated_timestamp, locale)}</time>
							</div>
						{/if}
						{#if note.data.description}
							<p class="note-card__description">{note.data.description}</p>
						{/if}
						{#if note.data.tags?.length}
							<div class="note-card__tags">
								{#each note.data.tags as tag}
									<button type="button" onclick={() => switch_tag(tag, true)}>#{tag}</button>
								{/each}
							</div>
						{/if}
					</article>
				{/each}
			</section>
		{/if}

		{#if pages > 1}
			<footer class="note-pagination">
				<button type="button" onclick={() => (page = Math.max(1, page - 1))}>{@render left()}</button>
				<button type="button" class:location={1 == page} onclick={() => (page = 1)}>{1}</button>

				{#if pages > 7 && page > 4}{@render dots()}{/if}

				{#each Array.from({ length: Math.min(5, pages - 2) }, (_, i) => i + Math.max(2, Math.min(pages - 5, page - 2))) as P (P)}
					<button type="button" class:location={P == page} onclick={() => (page = P)} animate:flip={{ duration: 150 }} transition:fade={{ duration: 150 }}>{P}</button>
				{/each}

				{#if pages > 7 && page < pages - 3}{@render dots()}{/if}

				<button type="button" class:location={pages == page} onclick={() => (page = pages)}>{pages}</button>
				<button type="button" onclick={() => (page = Math.min(pages, page + 1))}>{@render right()}</button>
			</footer>
		{/if}
	</article>

	<aside class="note-sidebar">
		<section>
			<h3>{t("note.series")}</h3>
			<div class="filter-list">
				{#each series_list as series_item (series_item)}
					<button type="button" class="filter-chip" class:selected={series_item == series} onclick={() => choose_series(series_item)}>{series_item}</button>
				{/each}
			</div>
		</section>

		<section>
			<h3>{t("note.tag")}</h3>
			<div class="filter-list">
				{#each tag_list as tag (tag)}
					<button type="button" class="filter-chip" class:selected={tags.includes(tag)} onclick={() => switch_tag(tag)}>{tag}</button>
				{/each}
			</div>
		</section>
	</aside>
</main>

<script lang="ts">
import { getRelativeLocaleUrl } from "astro:i18n";
import { onMount, type Snippet } from "svelte";
import { flip } from "svelte/animate";
import { fade } from "svelte/transition";
import Time from "$utils/time";
import i18nit from "$i18n";

let { locale, notes, series: series_list, tags: tag_list, top, sensitive, left, right, dots }: { locale: string; notes: any[]; series: string[]; tags: string[]; top: Snippet; sensitive: Snippet; left: Snippet; right: Snippet; dots: Snippet } = $props();

const t = i18nit(locale);

const size = 20;
let initial = $state(false);
let series: string | null = $state(null);
let tags: string[] = $state([]);
const hasFilters = $derived(() => Boolean(series || tags.length));

function formatTitle(raw: unknown): string[] {
	if (!raw && raw !== 0) return [""];
	const text = String(raw).replace(/<br\s*\/?>(\s*)/gi, "\n");
	return text.split(/\n+/).map(line => line.trim()).filter(Boolean);
}

let q: string = $state("");
let filtered: any[] = $derived.by(() => {
	const lower = q.trim().toLowerCase();
	const filteredNotes = notes
		.filter(note => {
			const matchQuery = !lower
				|| String(note.data.title ?? "").toLowerCase().includes(lower)
				|| String(note.data.description ?? "").toLowerCase().includes(lower);
			const matchSeries = !series || note.data.series === series;
			const matchTags = tags.every(tag => note.data.tags?.includes(tag));
			return matchQuery && matchSeries && matchTags;
		})
		.sort((a, b) => b.data.top - a.data.top || b.data.timestamp.getTime() - a.data.timestamp.getTime());

	if (initial) {
		const query = new URLSearchParams();
		if (page > 1) query.set("page", String(page));
		if (series) query.set("series", series);
		tags.forEach(tag => query.append("tag", tag));
		if (q.trim()) query.set("q", q.trim());

		const search = query.toString();
		const url = getRelativeLocaleUrl(locale, `/note${search ? `?${search}` : ""}`);
		window.history.replaceState({ url, random: Math.random(), source: "swup" }, "", url);
	}

	return filteredNotes;
});

let page: number = $state(1);
let pages: number = $derived(Math.max(1, Math.ceil(filtered.length / size)));

$effect(() => {
	page = Math.max(1, Math.min(Math.floor(page), pages));
});

let list: any[] = $derived(filtered.slice((page - 1) * size, page * size));

function switch_tag(tag: string, turn?: boolean) {
	const included = tags.includes(tag);
	const shouldInclude = turn ?? !included;
	tags = shouldInclude ? (included ? tags : [...tags, tag]) : tags.filter(item => item !== tag);
	page = 1;
}

function choose_series(series_choice: string | null, turn?: boolean) {
	if (!series_choice && turn !== false) return;
	const shouldSelect = turn ?? series !== series_choice;
	series = shouldSelect ? series_choice : null;
	page = 1;
}

function clearFilters() {
	series = null;
	tags = [];
	page = 1;
}

onMount(() => {
	const params = new URLSearchParams(window.location.search);

	page = Number(params.get("page")) || 1;
	series = params.get("series");
	tags = params.getAll("tag");
	q = params.get("q") ?? "";

	initial = true;
});
</script>
