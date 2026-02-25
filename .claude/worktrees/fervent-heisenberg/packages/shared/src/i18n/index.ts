import es from './locales/es';
import en from './locales/en';

export const resources = {
  es: { translation: es },
  en: { translation: en },
};

// Exportar el tipo de traducción por defecto (español) para inferencia de tipos
export type TranslationResource = typeof es;

export { es, en };
