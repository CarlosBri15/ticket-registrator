import es from './locales/es';
import en from './locales/en';

export const resources = {
  es: { translation: es },
  en: { translation: en },
};

export type TranslationResource = typeof es;

export { es, en };
