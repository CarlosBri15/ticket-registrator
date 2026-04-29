/** Supported application languages. */
export const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
