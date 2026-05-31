import { DEFAULT_CATEGORIES } from './default-categories';

describe('DEFAULT_CATEGORIES', () => {
    it('should have 24 categories', () => {
        expect(DEFAULT_CATEGORIES).toHaveLength(24);
    });

    it('should have legal names and descriptions', () => {
        DEFAULT_CATEGORIES.forEach(cat => {
            expect(cat.name).toBeDefined();
            expect(cat.description).toBeDefined();
            expect(cat.description.split(/\s+/).length).toBeLessThanOrEqual(10);
        });
    });

    it('should include specific required categories', () => {
        const names = DEFAULT_CATEGORIES.map(c => c.name);
        expect(names).toContain('Meals');
        expect(names).toContain('Airfare');
        expect(names).toContain('Miscellaneous');
        expect(names).toContain('Office Supplies');
    });
});
