import { resources, es, en } from './index';

describe('i18n resources', () => {
    it('should export Spanish and English resources', () => {
        expect(resources.es).toBeDefined();
        expect(resources.en).toBeDefined();
    });

    it('should wrap translations under translation key', () => {
        expect(resources.es.translation).toBe(es);
        expect(resources.en.translation).toBe(en);
    });

    it('Spanish should have common section', () => {
        expect(es.common).toBeDefined();
        expect(es.common.welcome).toBe('Bienvenido');
        expect(es.common.cancel).toBe('Cancelar');
    });

    it('English should have common section', () => {
        expect(en.common).toBeDefined();
        expect(en.common.welcome).toBe('Welcome');
        expect(en.common.cancel).toBe('Cancel');
    });

    it('Spanish should have auth section', () => {
        expect(es.auth).toBeDefined();
        expect(es.auth.loginButton).toBe('Iniciar Sesion');
    });

    it('English should have auth section', () => {
        expect(en.auth).toBeDefined();
        expect(en.auth.loginButton).toBe('Sign In');
    });

    it('Spanish and English should have the same top-level keys', () => {
        const esKeys = Object.keys(es).sort();
        const enKeys = Object.keys(en).sort();
        expect(esKeys).toEqual(enKeys);
    });
});
