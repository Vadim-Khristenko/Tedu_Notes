<style lang="less">
	.jotting-layout {
		display: flex;
		flex-direction: column-reverse;
		gap: 2.5rem;

		@media (min-width: 640px) {
			flex-direction: row;
		}
	}

	.jotting-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		flex: 1 1 auto;
	}

	.jotting-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		justify-content: space-between;
	}

	.jotting-quicksearch {
		border: 1px solid var(--weak-color);
		border-radius: 10px;
		padding: 8px 12px;
		background: transparent;
		color: var(--text-color);
		min-width: 300px;
		max-width: 420px;
	}

	.jotting-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.25rem;
	}

	.jotting-card {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 1.1rem 1.25rem;
		border-radius: 0.9rem;
		background: color-mix(in srgb, var(--background-color) 94%, var(--primary-color) 6%);
		border: 1px solid color-mix(in srgb, var(--primary-color) 18%, transparent 82%);
		transition: transform 0.15s ease, border-color 0.15s ease;
	}

	.jotting-card:hover {
		transform: translateY(-4px);
		border-color: var(--primary-color);
	}

	.jotting-card__header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.title-line {
		display: block;
		line-height: 1.15;
		font-weight: 650;
	}

	.jotting-card__header a {
		color: inherit;
		text-decoration: none;
		font-size: 1rem;
	}

	.jotting-card__header a:hover {
		color: var(--primary-color);
	}

	.jotting-card__badges {
		display: inline-flex;
		gap: 0.35rem;
		font-size: 0.7rem;
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

	.jotting-card__meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--remark-color);
		font-family: var(--monospace);
	}

	.jotting-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: var(--remark-color);
	}

	.jotting-card__tags button {
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		padding: 0;
	}

	.jotting-card__tags button:hover {
		color: var(--primary-color);
	}

	.jotting-empty {
		padding: 2rem;
		text-align: center;
		border-radius: 1rem;
		background: var(--background-weak-color);
		color: var(--remark-color);
	}

	.jotting-pagination {
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

	.jotting-pagination button {
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

	.jotting-pagination button:hover,
	.jotting-pagination button.location {
		color: var(--primary-color);
		border-color: currentColor;
	}

	.jotting-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		flex: 0 0 220px;
	}

	.jotting-sidebar section {
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
		.jotting-pagination {
			position: static;
			border-top: none;
		}
	}
</style>

<main class="jotting-layout">
	<article class="jotting-content">
		<header class="jotting-toolbar">
			<h2 class="text-size-lg font-semibold">{t("navigation.jotting")}</h2>
			<div class="flex items-center gap-2">
				<input class="jotting-quicksearch" type="search" placeholder={t("search.placeholder") ?? "Поиск…"} bind:value={q} />
				<span class="text-3.5 c-remark">{filtered.length} / {jottings.length}</span>
				{#if hasFilters()}
					<button class="clear-filters" type="button" onclick={clearFilters}>{t("search.clear") ?? "Clear"}</button>
				{/if}
			</div>
		</header>

		{#if list.length === 0}
			<p class="jotting-empty">{t("jotting.empty")}</p>
		{:else}
			<section class="jotting-grid">
				{#each list as jotting (jotting.id)}
					<article class="jotting-card" animate:flip={{ duration: 150 }}>
						<header class="jotting-card__header">
							<div class="jotting-card__badges">
								{#if jotting.data.top > 0}<span class="badge">{@render top()}</span>{/if}
								{#if jotting.data.sensitive}<span class="badge badge--outline">{@render sensitive()}</span>{/if}
							</div>
							<a href={getRelativeLocaleUrl(locale, `/jotting/${jotting.id.split("/").slice(1).join("/")}`)}>
								{#each formatTitle(jotting.data.title) as line}
									<span class="title-line">{line}</span>
								{/each}
							</a>
						</header>
						<div class="jotting-card__meta">
							<time datetime={jotting.data.timestamp.toISOString()}>{Time.date.locale(jotting.data.timestamp, locale)}</time>
						</div>
						{#if jotting.data.description}
							<p class="text-3.75 c-weak">{jotting.data.description}</p>
						{/if}
						{#if jotting.data.tags?.length}
							<footer class="jotting-card__tags">
								{#each jotting.data.tags as tag}
									<button type="button" onclick={() => switch_tag(tag, true)}>#{tag}</button>
								{/each}
							</footer>
						{/if}
					</article>
				{/each}
			</section>
		{/if}

		{#if pages > 1}
			<footer class="jotting-pagination">
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
	<aside class="jotting-sidebar">
		<section>
			<h3>{t("jotting.tag")}</h3>
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

	/** Split title into lines when it contains \n or <br> */
	function formatTitle(raw: unknown): string[] {
		if (!raw && raw !== 0) return [""];
		const s = String(raw);
		const replaced = s.replace(/<br\s*\/?>(\s*)/gi, "\n");
		return replaced.split("\n").map(l => l.trim()).filter(Boolean);
	}

	let { locale, jottings, tags: tag_list, top, sensitive, left, right, dots }: { locale: string; jottings: any[]; tags: string[]; top: Snippet; sensitive: Snippet; left: Snippet; right: Snippet; dots: Snippet } = $props();

	const t = i18nit(locale);
	const size = 20;
	let initial = $state(false);
	let tags: string[] = $state([]);
	const hasFilters = $derived(() => tags.length > 0);
	let q: string = $state("");

	let filtered: any[] = $derived.by(() => {
		const lower = q.trim().toLowerCase();
		const filteredJottings = jottings
			.filter(jotting => {
				const matchQuery = !lower
					|| String(jotting.data.title ?? "").toLowerCase().includes(lower)
					|| String(jotting.data.description ?? "").toLowerCase().includes(lower);
				const matchTags = tags.every(tag => jotting.data.tags?.includes(tag));
				return matchQuery && matchTags;
			})
			.sort((a, b) => b.data.top - a.data.top || b.data.timestamp.getTime() - a.data.timestamp.getTime());

		if (initial) {
			const query = new URLSearchParams();
			if (page > 1) query.set("page", String(page));
			tags.forEach(tag => query.append("tag", tag));
			if (q.trim()) query.set("q", q.trim());
			const search = query.toString();
			const url = getRelativeLocaleUrl(locale, `/jotting${search ? `?${search}` : ""}`);
			window.history.replaceState({ url, random: Math.random(), source: "swup" }, "", url);
		}

		return filteredJottings;
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

	function clearFilters() {
		tags = [];
		page = 1;
	}

	onMount(() => {
		const params = new URLSearchParams(window.location.search);

		page = Number(params.get("page")) || 1;
		tags = params.getAll("tag");
		q = params.get("q") ?? "";

		initial = true;
	});
</script>
