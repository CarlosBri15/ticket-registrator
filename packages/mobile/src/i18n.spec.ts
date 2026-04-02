import i18n from './i18n';

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
  it('exports a default i18n instance', () => {
    expect(i18n).toBeDefined();
    expect(typeof i18n.t).toBe('function');
  });

  it('is initialized with the correct language', () => {
    // Since i18n was already imported and initialized at the top level of i18n.ts
    // we just check its current state.
    expect(['es', 'en']).toContain(i18n.language);
  });
  
  it('can change language', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
    await i18n.changeLanguage('es');
    expect(i18n.language).toBe('es');
  });
});
