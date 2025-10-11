<style lang="less">
	.search-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.search-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.6rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid var(--weak-color);
		border-radius: 9999px;
		background-color: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.65;
		transition: border-color 0.2s ease-in-out, color 0.2s ease-in-out, opacity 0.2s ease-in-out;
	}

	.search-trigger:hover,
	.search-trigger:focus-visible {
		border-color: var(--primary-color);
		color: var(--primary-color);
		opacity: 1;
	}

	.search-trigger kbd {
		display: none;
		padding: 0.15rem 0.35rem;
		font-size: 0.75rem;
		border-radius: 0.4rem;
		background: var(--background-weak-color);
		border: 1px solid var(--weak-color);
		color: var(--remark-color);
	}

	@media (min-width: 640px) {
		.search-trigger kbd {
			display: inline-block;
		}
	}

	.search-dialog {
		display: grid;
		gap: 1rem;
		width: min(420px, 85vw);
	}

	.search-placeholder {
		display: grid;
		gap: 0.5rem;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--remark-color);
	}

	.search-placeholder strong {
		font-weight: 600;
		color: var(--primary-color);
	}

	.search-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.search-actions button {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.6rem;
		font-size: 0.85rem;
		border-radius: 9999px;
		border: 1px solid var(--weak-color);
		background: transparent;
		cursor: pointer;
		transition: border-color 0.2s ease-in-out, color 0.2s ease-in-out, background 0.2s ease-in-out;
	}

	.search-actions button:hover,
	.search-actions button:focus-visible {
		border-color: var(--primary-color);
		color: var(--primary-color);
	}
</style>

<div class="search-wrapper">
	<button
		class="search-trigger"
		type="button"
		aria-haspopup="dialog"
		aria-expanded={open ? "true" : "false"}
		aria-controls="search-placeholder-dialog"
		onclick={() => (open = true)}
		title={message}
	>
		<SearchIcon size={18} />
		<span class="hidden sm:inline">{t("search.label")}</span>
		<kbd>Ctrl K</kbd>
	</button>
</div>

<Modal bind:open>
	{#snippet children()}
		<div
			id="search-placeholder-dialog"
			class="search-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="search-placeholder-title"
		>
			<header class="search-placeholder">
				<strong id="search-placeholder-title">{lead}</strong>
				<p>{message}</p>
			</header>
			<div class="search-actions">
				<button type="button" onclick={() => (open = false)}>{t("search.close") ?? "Close"}</button>
			</div>
		</div>
	{/snippet}
</Modal>

<script lang="ts">
	import SearchIcon from "lucide-svelte/icons/search";
	import i18nit from "$i18n";
	import Modal from "$components/Modal.svelte";

	let { locale }: { locale: string } = $props();
	const t = i18nit(locale);
	let open = $state(false);

	const lead = t("search.disabled_lead") ?? "Search paused";
	const message =
		t("search.disabled_message") ?? "Vadim is figuring out how to deliver a serverless-friendly search experience.";
</script>
