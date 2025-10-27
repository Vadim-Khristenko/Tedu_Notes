import { i18n } from "astro:config/client";

// Import translation files for different locales
import en from "./en.yaml";
import ru from "./ru.yaml";

// Translation object mapping locale codes to their respective translation data
const translations = { ru, en };

// Simple plural selector for supported locales
function selectPluralFormInteger(locale: string, n: number) {
	if (locale.startsWith("ru")) {
		const mod10 = n % 10;
		const mod100 = n % 100;
		if (mod10 === 1 && mod100 !== 11) return "one";
		if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "few";
		return "many";
	}
	// fallback English-like
	return n === 1 ? "one" : "many";
}

function selectPluralFormString(locale: string, n: number) {
	if (locale.startsWith("ru")) {
		return n === 1 ? "one" : "many";
	}
	return n === 1 ? "one" : "many";
}

/**
 * Create an internationalization function for a specific language
 * @param language - The target language/locale code (e.g., "en")
 * @returns Translation function that can translate keys with parameter substitution, arrays, or return raw values
 */
function i18nit(language: string): (key: string, params?: Record<string, string | number | Array<string>>) => string | string[] | any {
	/**
	 * Navigate through nested translation object using dot notation
	 * @param language - Language code to look up translations in
	 * @param key - Dot-separated key path (e.g., "notification.reply.title")
	 * @returns Translation value or undefined if not found
	 */
	const nested = (language: string, key: string) => key.split('.').reduce((translation, key) => (translation && typeof translation === 'object') ? translation[key] : undefined, (translations as any)[language]);

	/**
	 * Get translation with fallback to default locale
	 * @param key - Translation key to look up
	 * @returns Translation value from target language or default locale, undefined if not found
	 */
	const fallback = (key: string) => nested(language, key) || nested(i18n!.defaultLocale, key);

	/**
	 * Main translation function with parameter interpolation
	 * @param key - Translation key to look up
	 * @param params - Optional parameters for string interpolation (replaces {paramName} placeholders)
	 * @returns Translated and interpolated string, or the original key if translation not found. Can also return arrays or other types directly.
	 */
	const t = (key: string, params?: Record<string, string | number | Array<string>>): string | string[] | any => {
			const value = fallback(key);

			// If the value is an array, return it directly
			if (Array.isArray(value)) {
				return value;
			}

			// If translation is an object, try to resolve plural templates inside it.
			if (value && typeof value === "object") {
				// Determine if should be plural form
				let replaceble_param: number | string | undefined;
				let str_rpr_N: number | undefined;
				if (params) {
					const countValue = params.integer !== undefined ? params.integer : params.count;
					const textValue = params.text !== undefined ? params.text : params.words;
					if (countValue !== undefined) {
						const num = Number(countValue);
						if (!Number.isNaN(num) && Number.isFinite(num)) replaceble_param = num;
					}
					else if (textValue !== undefined) {
						if (typeof textValue === "number") {
							const txt = String(textValue);
							str_rpr_N = 1;
							replaceble_param = txt;
						} else if (typeof textValue === "string") {
							const txt = String(textValue);
							str_rpr_N = 1;
							replaceble_param = txt;
						} else if (Array.isArray(textValue)) {
							const txt = textValue.join(", ");
							str_rpr_N = textValue.length;
							replaceble_param = txt;
						}
					}
				}

				// Helper: check if an object looks like plural forms
				const isPluralObj = (obj: any) => obj && typeof obj === "object" && ("one" in obj || "few" in obj || "many" in obj || "other" in obj);

				let pluralSource: any = undefined;
				if (isPluralObj(value)) {
					pluralSource = value;
				} else if (value && typeof value === "object") {
					// common pattern: { words: { one:..., few:..., many:... } }
					for (const k of Object.keys(value)) {
						if (isPluralObj(value[k])) {
							pluralSource = value[k];
							break;
						}
					}
				}

				if (pluralSource && replaceble_param !== undefined) {
					let form: string;
					if (typeof replaceble_param === "number") {
						form = selectPluralFormInteger(language, replaceble_param);
					} else if (typeof replaceble_param === "string") {
						form = selectPluralFormString(language, str_rpr_N ?? 1);
					} else {
						form = selectPluralFormInteger(language, 1);
					}
					const template = pluralSource[form] ?? pluralSource.many ?? JSON.stringify(pluralSource);
					return String(template).replace(/\{(\w+)\}/g, (_, param) => String(params?.[param] ?? `{${param}}`));
				}
			}

			// If translation is a plain string, interpolate and return
			if (typeof value === 'string') {
				return value.replace(/\{(\w+)\}/g, (_, param) => String(params?.[param] ?? `{${param}}`));
			}

			// Fallback: return the key if nothing matched
			return key;

			};
			return t;
}

export default i18nit;
