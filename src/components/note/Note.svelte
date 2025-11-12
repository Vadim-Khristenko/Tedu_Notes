<main class="note">
	<section class="note-header">
		<div class="note-header__titles">
			<h2 class="note-title">{t("navigation.note")}</h2>
			<p class="note-subtitle">
				{t("note.subtitle") ?? "Подборка конспектов, шпаргалок и материалов, которые помогают учиться быстрее и спокойнее."}
			</p>
		</div>
		<div class="note-legacy-banner">
			<span>{t("note.legacy_banner") ?? "Старый список конспектов доступен по прямой ссылке."}</span>
			<a href="/note-legacy" class="note-legacy-link">{t("note.legacy_button") ?? "→"}</a>
		</div>

		<div class="note-header__search">
			<input
				class="note-search"
				type="search"
				placeholder={t("search.placeholder") ?? "Найти заметку по названию или описанию"}
				bind:value={q}
			/>
			<span class="note-search__count">{filtered.length} / {notes.length}</span>
			{#if hasFilters()}
				<button type="button" class="note-search__clear" onclick={clearFilters}>
					{t("search.clear") ?? "Сбросить фильтры"}
				</button>
			{/if}
		</div>
		{#if hasFilters()}
			<div class="note-header__active">
				{#if series}
					<div class="chip chip--active">
						<span>{series}</span>
						<button type="button" aria-label="Сбросить серию" onclick={() => choose_series(series, false)}>×</button>
					</div>
				{/if}
				{#each tags as tag (tag)}
					<div class="chip chip--active">
						<span>#{tag}</span>
						<button type="button" aria-label="Убрать тег" onclick={() => switch_tag(tag, false)}>×</button>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="note-layout">
		<article class="note-list">
			{#if list.length === 0}
				<p class="note-empty">{t("note.empty")}</p>
			{:else}
				<div class="note-grid">
					{#each list as note (note.id)}
						<article class="note-card" animate:flip={{ duration: 160 }}>
							<header class="note-card__header">
								<div class="note-card__labels">
									{#if note.data.top > 0}
										<span class="badge badge--primary">{@render top()}</span>
									{/if}
									{#if note.data.sensitive}
										<span class="badge badge--ghost">{@render sensitive()}</span>
									{/if}
								</div>
								<a
									class="note-card__title"
									href={getRelativeLocaleUrl(
										locale,
										`/note/${note.id.split("/").slice(1).join("/")}`
									)}
								>
									{#each formatTitle(note.data.title) as line (line)}
										<span>{line}</span>
									{/each}
								</a>
							</header>

							<div class="note-card__meta">
								<time
									title={Time.full(note.data.timestamp)}
									datetime={note.data.timestamp.toISOString()}
								>
									{Time.date.locale(note.data.timestamp, locale)}
								</time>
								{#if note.data.last_updated_timestamp}
									<span class="note-card__updated">
										{t("note.last_updated")}
										<time
											title={Time.full(note.data.last_updated_timestamp)}
											datetime={note.data.last_updated_timestamp.toISOString()}
										>
											{Time.date.locale(note.data.last_updated_timestamp, locale)}
										</time>
									</span>
								{/if}
							</div>

							{#if note.data.image}
								<div class="note-card__image-wrap">
									<img
										src={note.data.image}
										alt={note.data.image_alt ?? note.data.title ?? "Note preview"}
										loading="lazy"
										decoding="async"
									/>
								</div>
							{/if}

							{#if note.data.description}
								<p class="note-card__description">{note.data.description}</p>
							{/if}

							<div class="note-card__footer">
								{#if note.data.series}
									<button
										type="button"
										class="link-chip"
										onclick={() => choose_series(note.data.series, true)}
									>
										{note.data.series}
									</button>
								{/if}
								{#if note.data.tags?.length}
									<div class="note-card__tags">
										{#each note.data.tags as tag}
											<button
												type="button"
												class="tag-chip"
												onclick={() => switch_tag(tag, true)}
											>
												#{tag}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{/if}

			{#if pages > 1}
				<footer class="note-pagination">
					<button
						type="button"
						class="note-pagination__arrow"
						onclick={() => (page = Math.max(1, page - 1))}
						disabled={page === 1}
					>
						{@render left()}
					</button>

					<button
						type="button"
						class:active={page === 1}
						onclick={() => (page = 1)}
					>
						1
					</button>

					{#if pages > 7 && page > 4}
						<span class="note-pagination__dots">{@render dots()}</span>
					{/if}

					{#each Array.from({ length: Math.min(5, pages - 2) }, (_, i) =>
							i + Math.max(2, Math.min(pages - 5, page - 2))
						) as P (P)}
						<button
							type="button"
							class:active={P === page}
							onclick={() => (page = P)}
							animate:flip={{ duration: 140 }}
						>
							{P}
						</button>
					{/each}

					{#if pages > 7 && page < pages - 3}
						<span class="note-pagination__dots">{@render dots()}</span>
					{/if}

					<button
						type="button"
						class:active={pages === page}
						onclick={() => (page = pages)}
					>
						{pages}
					</button>

					<button
						type="button"
						class="note-pagination__arrow"
						onclick={() => (page = Math.min(pages, page + 1))}
						disabled={page === pages}
					>
						{@render right()}
					</button>
				</footer>
			{/if}
		</article>

		<aside class="note-sidebar">
			<section class="note-sidebar__block">
				<h3 class="note-sidebar__title">{t("note.series")}</h3>
				<div class="note-sidebar__chips">
					{#each series_list as series_item (series_item)}
						<button
							type="button"
							class="chip"
							class:chip--selected={series_item === series}
							onclick={() => choose_series(series_item)}
						>
							{series_item}
						</button>
					{/each}
				</div>
			</section>

			<section class="note-sidebar__block">
				<h3 class="note-sidebar__title">{t("note.tag")}</h3>
				<div class="note-sidebar__chips">
					{#each tag_list as tag (tag)}
						<button
							type="button"
							class="chip"
							class:chip--selected={tags.includes(tag)}
							onclick={() => switch_tag(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
			</section>
		</aside>
	</section>
</main>

<script lang="ts">
	import { getRelativeLocaleUrl } from "astro:i18n";
	import { onMount, type Snippet } from "svelte";
	import { flip } from "svelte/animate";
	import Time from "$utils/time";
	import i18nit from "$i18n";

	let {
		locale,
		notes,
		series: series_list,
		tags: tag_list,
		top,
		sensitive,
		left,
		right,
		dots
	}: {
		locale: string;
		notes: any[];
		series: string[];
		tags: string[];
		top: Snippet;
		sensitive: Snippet;
		left: Snippet;
		right: Snippet;
		dots: Snippet;
	} = $props();

	const t = i18nit(locale);

	const PAGE_SIZE = 20;

	let initial = $state(false);
	let series: string | null = $state(null);
	let tags: string[] = $state([]);
	let q: string = $state("");
	let page: number = $state(1);

	const hasFilters = $derived(() => Boolean(series || tags.length || q.trim()));

	function formatTitle(raw: unknown): string[] {
		if (!raw && raw !== 0) return [""];
		const text = String(raw).replace(/<br\s*\/?>(\s*)/gi, "\n");
		return text
			.split(/\n+/)
			.map((line) => line.trim())
			.filter(Boolean);
	}

	let filtered = $derived.by(() => {
		const lower = q.trim().toLowerCase();

		const filteredNotes = notes
			.filter((note) => {
				const title = String(note.data.title ?? "").toLowerCase();
				const description = String(note.data.description ?? "").toLowerCase();
				const matchQuery =
					!lower ||
						title.includes(lower) ||
						description.includes(lower);

				const matchSeries = !series || note.data.series === series;
				const matchTags = tags.every((tag) => note.data.tags?.includes(tag));
				return matchQuery && matchSeries && matchTags;
			})
			.sort(
				(a, b) =>
					b.data.top - a.data.top ||
					b.data.timestamp.getTime() - a.data.timestamp.getTime()
			);

		if (initial) {
			const query = new URLSearchParams();
			if (page > 1) query.set("page", String(page));
			if (series) query.set("series", series);
			tags.forEach((tag) => query.append("tag", tag));
			if (q.trim()) query.set("q", q.trim());

			const search = query.toString();
			const url = getRelativeLocaleUrl(
				locale,
				`/note${search ? `?${search}` : ""}`
			);
			window.history.replaceState(
				{ url, random: Math.random(), source: "note-list" },
				"",
				url
			);
		}

		return filteredNotes;
	});

	let pages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	let list = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		page = Math.max(1, Math.min(Math.floor(page), pages));
	});

	function switch_tag(tag: string, turn?: boolean) {
		const included = tags.includes(tag);
		const shouldInclude = turn ?? !included;
		if (shouldInclude && !included) {
			tags = [...tags, tag];
		} else if (!shouldInclude && included) {
			tags = tags.filter((item) => item !== tag);
		}
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
		q = "";
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

<style lang="less">
	.note {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.note-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem 1.5rem 0.75rem;
		border-radius: 1.25rem;
		background: radial-gradient(circle at top left, rgba(130, 202, 255, 0.14), transparent),
			color-mix(in srgb, var(--background-color) 92%, var(--primary-color) 8%);
		border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent 80%);
	}

	.note-header__titles {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.note-title {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
	}

	.note-subtitle {
		margin: 0;
		font-size: 0.9rem;
		color: var(--remark-color);
	}

	.note-legacy-banner {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
		margin-bottom: 0.25rem;
		padding: 0.4rem 0.7rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--background-color) 96%, var(--primary-color) 4%);
		border: 1px dashed color-mix(in srgb, var(--primary-color) 32%, transparent 68%);
		font-size: 0.78rem;
		color: var(--remark-color);
	}

	.note-legacy-link {
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		background: var(--primary-color);
		color: var(--background-color);
		font-size: 0.78rem;
		font-weight: 600;
		text-decoration: none;
		transition: background-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
	}

	.note-legacy-link:hover {
		background: color-mix(in srgb, var(--primary-color) 85%, transparent 15%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
	}

	.note-header__search {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.note-search {
		flex: 1 1 260px;
		max-width: 520px;
		padding: 0.55rem 0.9rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--weak-color) 70%, transparent 30%);
		background:
			linear-gradient(
				90deg,
				color-mix(in srgb, var(--background-color) 100%, transparent) 0%,
				color-mix(in srgb, var(--background-color) 98%, var(--primary-color) 2%) 100%
			);
		color: var(--primary-color);
		font-size: 0.85rem;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
	}

	.note-search::placeholder {
		color: color-mix(in srgb, var(--remark-color) 80%, transparent 20%);
	}

	.note-search:focus-visible {
		outline: none;
		border-color: color-mix(in srgb, var(--primary-color) 75%, transparent 25%);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 14%, transparent 86%);
	}

	.note-search__count {
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--background-color) 96%, var(--primary-color) 4%);
		font-size: 0.76rem;
		color: var(--remark-color);
	}

	.note-search__clear {
		border: none;
		background: none;
		color: var(--primary-color);
		font-size: 0.78rem;
		cursor: pointer;
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
	}

	.note-search__clear:hover {
		background: color-mix(in srgb, var(--primary-color) 10%, transparent 90%);
	}

	.note-header__active {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.note-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.9fr) minmax(220px, 0.9fr);
		gap: 1.75rem;
	}

	.note-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.note-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.note-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.95rem 0.95rem 0.8rem;
		border-radius: 1rem;
		background: var(--background-color);
		border: 1px solid color-mix(in srgb, var(--weak-color) 80%, var(--primary-color) 20%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
		transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease,
			background-color 0.16s ease;
	}

	.note-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
		border-color: var(--primary-color);
		background: color-mix(in srgb, var(--background-color) 96%, var(--primary-color) 4%);
	}

	.note-card__header {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.note-card__labels {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.note-card__title {
		margin: 0;
		font-size: 1rem;
		font-weight: 650;
		line-height: 1.25;
		color: var(--text-color);
		text-decoration: none;
	}

	.note-card__title span {
		display: block;
	}

	.note-card__title:hover {
		color: var(--primary-color);
	}

	.note-card__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: baseline;
		font-size: 0.75rem;
		color: var(--remark-color);
	}

	.note-card__updated {
		display: inline-flex;
		gap: 0.25rem;
		align-items: baseline;
	}

	.note-card__image-wrap {
		margin: 0.15rem 0 0.35rem;
		border-radius: 0.7rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--weak-color) 70%, transparent 30%);
		background: var(--background-weak-color);
	}

	.note-card__image-wrap img {
		width: 100%;
		height: 140px;
		object-fit: cover;
		display: block;
	}

	.note-card__description {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--remark-color);
	}

	.note-card__footer {
		margin-top: 0.2rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		align-items: center;
		justify-content: space-between;
	}

	.note-card__tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.note-empty {
		padding: 1.5rem;
		border-radius: 1rem;
		text-align: center;
		font-size: 0.9rem;
		color: var(--remark-color);
		background: var(--background-weak-color);
	}

	.note-pagination {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px dashed color-mix(in srgb, var(--remark-color) 35%, transparent 65%);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.35rem;
		flex-wrap: wrap;
	}

	.note-pagination button {
		min-width: 30px;
		height: 30px;
		border-radius: 999px;
		border: none;
		background: transparent;
		color: var(--remark-color);
		font-family: var(--monospace);
		font-size: 0.78rem;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.16s ease;
	}

	.note-pagination button:hover {
		color: var(--primary-color);
		border-color: color-mix(in srgb, var(--primary-color) 40%, transparent 60%);
		background: color-mix(in srgb, var(--primary-color) 6%, transparent 94%);
	}

	.note-pagination button.active {
		color: var(--primary-color);
		background: color-mix(in srgb, var(--primary-color) 10%, transparent 90%);
		border-color: color-mix(in srgb, var(--primary-color) 70%, transparent 30%);
		font-weight: 600;
	}

	.note-pagination__arrow[disabled] {
		opacity: 0.4;
		cursor: default;
	}

	.note-pagination__dots {
		color: var(--remark-color);
		font-size: 0.8rem;
	}

	.note-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.note-sidebar__block {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.85rem 0.9rem;
		border-radius: 0.9rem;
		background: var(--background-weak-color);
	}

	.note-sidebar__title {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--remark-color);
	}

	.note-sidebar__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.chip {
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--primary-color) 40%, transparent 60%);
		background: transparent;
		font-size: 0.75rem;
		color: var(--remark-color);
		cursor: pointer;
		transition: all 0.16s ease;
	}

	.chip--selected,
	.chip:hover {
		color: var(--primary-color);
		background: color-mix(in srgb, var(--primary-color) 8%, transparent 92%);
		border-color: color-mix(in srgb, var(--primary-color) 70%, transparent 30%);
	}

	.chip--active {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.22rem 0.55rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--primary-color) 10%, transparent 90%);
		color: var(--primary-color);
		font-size: 0.72rem;
		font-weight: 600;
	}

	.chip--active button {
		border: none;
		background: none;
		color: inherit;
		cursor: pointer;
		font-size: 0.7rem;
	}

	.badge {
		padding: 0.18rem 0.5rem;
		border-radius: 999px;
		font-size: 0.65rem;
		font-weight: 650;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.badge--primary {
		background: var(--primary-color);
		color: var(--background-color);
	}

	.badge--ghost {
		border: 1px solid color-mix(in srgb, var(--primary-color) 65%, transparent 35%);
		color: var(--primary-color);
		background: transparent;
	}

	.link-chip {
		border: none;
		background: none;
		padding: 0;
		font-size: 0.72rem;
		color: var(--primary-color);
		cursor: pointer;
		text-decoration: underline;
		text-decoration-style: dotted;
	}

	.link-chip:hover {
		color: color-mix(in srgb, var(--primary-color) 80%, transparent 20%);
	}

	.tag-chip {
		padding: 0.16rem 0.4rem;
		border-radius: 999px;
		border: 1px solid transparent;
		background: color-mix(in srgb, var(--background-weak-color) 90%, transparent 10%);
		font-size: 0.7rem;
		color: var(--remark-color);
		cursor: pointer;
		transition: all 0.16s ease;
	}

	.tag-chip:hover {
		color: var(--primary-color);
		border-color: color-mix(in srgb, var(--primary-color) 45%, transparent 55%);
		background: color-mix(in srgb, var(--primary-color) 8%, transparent 92%);
	}

	@media (max-width: 800px) {
		.note-layout {
			grid-template-columns: minmax(0, 1fr);
		}

		.note-sidebar {
			order: -1;
		}
	}
</style>