import {
    CATEGORY_ICON_NAMES,
    FALLBACK_CATEGORY_ICON_NAME,
    isKnownCategoryIcon,
} from './categoryIconNames';

describe('categoryIconNames', () => {
    describe('CATEGORY_ICON_NAMES', () => {
        it('contains 21 entries', () => {
            expect(CATEGORY_ICON_NAMES).toHaveLength(21);
        });

        it('contains Plane', () => {
            expect(CATEGORY_ICON_NAMES).toContain('Plane');
        });

        it('contains Receipt', () => {
            expect(CATEGORY_ICON_NAMES).toContain('Receipt');
        });

        it('does not contain Tag (Tag is the fallback, not a selectable icon)', () => {
            expect(CATEGORY_ICON_NAMES).not.toContain('Tag');
        });
    });

    describe('FALLBACK_CATEGORY_ICON_NAME', () => {
        it('equals Tag', () => {
            expect(FALLBACK_CATEGORY_ICON_NAME).toBe('Tag');
        });
    });

    describe('isKnownCategoryIcon', () => {
        it('returns true for a known icon name', () => {
            expect(isKnownCategoryIcon('Plane')).toBe(true);
        });

        it('returns true for every entry in CATEGORY_ICON_NAMES', () => {
            for (const name of CATEGORY_ICON_NAMES) {
                expect(isKnownCategoryIcon(name)).toBe(true);
            }
        });

        it('returns false for Tag (the fallback is not a selectable icon)', () => {
            expect(isKnownCategoryIcon('Tag')).toBe(false);
        });

        it('returns false for null', () => {
            expect(isKnownCategoryIcon(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            expect(isKnownCategoryIcon(undefined)).toBe(false);
        });

        it('returns false for an empty string', () => {
            expect(isKnownCategoryIcon('')).toBe(false);
        });

        it('returns false for a non-existent name', () => {
            expect(isKnownCategoryIcon('NonExistent')).toBe(false);
        });
    });
});
