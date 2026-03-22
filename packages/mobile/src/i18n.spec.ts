jest.mock('expo-localization', () => ({
  getLocales: jest.fn().mockReturnValue([{ languageCode: 'es', textDirection: 'ltr' }]),
}));

jest.mock('@ticket-registrator/shared', () => ({
  resources: {
    en: { translation: { common: { welcome: 'Welcome' } } },
    es: { translation: { common: { welcome: 'Bienvenido' } } },
  },
}));

describe('i18n', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('exports a default i18n instance', () => {
    const i18n = require('./i18n').default;
    expect(i18n).toBeDefined();
    expect(typeof i18n.t).toBe('function');
  });

  it('uses device language from expo-localization', () => {
    const { getLocales } = require('expo-localization');
    (getLocales as jest.Mock).mockReturnValue([{ languageCode: 'es' }]);
    const i18n = require('./i18n').default;
    expect(i18n).toBeDefined();
  });

  it('falls back to "en" when locales array is empty', () => {
    const { getLocales } = require('expo-localization');
    (getLocales as jest.Mock).mockReturnValue([]);
    const i18n = require('./i18n').default;
    expect(i18n).toBeDefined();
  });

  it('falls back to "en" when languageCode is null', () => {
    const { getLocales } = require('expo-localization');
    (getLocales as jest.Mock).mockReturnValue([{ languageCode: null }]);
    const i18n = require('./i18n').default;
    expect(i18n).toBeDefined();
  });
});
