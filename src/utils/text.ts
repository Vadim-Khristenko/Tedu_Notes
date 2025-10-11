/**
 * Convert markdown content into plain text by stripping the most common syntactic tokens.
 * This keeps link text while removing formatting characters.
 */
export function markdownToPlain(markdown: string | undefined | null): string {
	if (!markdown) return "";

	return markdown
		// Remove code fences first to avoid leaking a lot of noise
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		// Keep link text and alt text
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1 ")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		// Remove emphasis and other inline markers
		.replace(/[>#*_~\[\]{}()=+\-]/g, " ")
		.replace(/\n+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Build a short excerpt from markdown text.
 * @param markdown Markdown source
 * @param limit Maximum number of characters (default: 160)
 */
export function buildExcerpt(markdown: string | undefined | null, limit = 160): string {
	const plain = markdownToPlain(markdown);
	if (plain.length <= limit) return plain;

	const truncated = plain.slice(0, limit);
	const edge = truncated.lastIndexOf(" ");
	return `${truncated.slice(0, edge > 40 ? edge : truncated.length).trim()}…`;
}

const STOPWORDS = new Set(
	[
		"a",
		"an",
		"and",
		"are",
		"as",
		"at",
		"be",
		"but",
		"by",
		"for",
		"if",
		"in",
		"into",
		"is",
		"it",
		"no",
		"not",
		"of",
		"on",
		"or",
		"such",
		"that",
		"the",
		"their",
		"then",
		"there",
		"these",
		"they",
		"this",
		"to",
		"was",
		"will",
		"with",
		"you",
		"your",
		"я",
		"мы",
		"вы",
		"они",
		"он",
		"она",
		"оно",
		"это",
		"в",
		"во",
		"на",
		"не",
		"но",
		"для",
		"что",
		"как",
		"из",
		"за",
		"от",
		"по",
		"при",
		"к",
		"ко",
		"у",
		"же",
		"ли",
		"а",
		"и",
		"с",
		"со",
		"ещё",
		"ещё",
		"бы",
		"есть",
		"был",
		"была",
		"были"
	].map(token => token.toLowerCase())
);

type SearchTokensInput = {
	title?: string | null;
	description?: string | null;
	body?: string | null;
	tags?: string[] | null;
	maxTokens?: number;
	maxBodyLength?: number;
};

/**
 * Build a compact search field composed of deduplicated tokens from the supplied strings.
 * The goal is to keep payloads small while still covering relevant vocabulary for Fuse.js.
 */
export function buildSearchTokens({
	title,
	description,
	body,
	tags,
	maxTokens = 512,
	maxBodyLength = 6000
}: SearchTokensInput): string {
	const segments: string[] = [];
	if (title) segments.push(title);
	if (description) segments.push(description);
	if (tags?.length) segments.push(tags.join(" "));

	const plainBody = markdownToPlain(body);
	if (plainBody) {
		segments.push(plainBody.length > maxBodyLength ? plainBody.slice(0, maxBodyLength) : plainBody);
	}

	if (!segments.length) return "";

	const normalised = segments
		.join(" ")
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "");

	const candidates = normalised
		.split(/[^0-9a-zа-яё]+/iu)
		.filter(token => token.length > 1 && token.length <= 40 && !STOPWORDS.has(token));

	const seen = new Set<string>();
	const tokens: string[] = [];
	for (const token of candidates) {
		if (seen.has(token)) continue;
		seen.add(token);
		tokens.push(token);
		if (tokens.length >= maxTokens) break;
	}

	return tokens.join(" ");
}
