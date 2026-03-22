import { colors, mt } from './theme';

describe('colors', () => {
  it('exports brand color as valid hex', () => {
    expect(colors.brand).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('exports success, warning and danger colors', () => {
    expect(colors.success).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(colors.warning).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(colors.danger).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('brand color is #336b87', () => {
    expect(colors.brand).toBe('#336b87');
  });
});

describe('mt tokens', () => {
  const requiredTokens: (keyof typeof mt)[] = [
    'screen',
    'card',
    'cardPad',
    'heroCard',
    'pageHeader',
    'pageHeaderTitle',
    'sectionTitle',
    'sectionLabel',
    'statCard',
    'statCardPrimary',
    'statCardDanger',
    'input',
    'inputLabel',
    'btnPrimary',
    'btnSecondary',
    'btnGhost',
    'btnDanger',
    'btnTextPrimary',
    'btnTextSecondary',
    'listItem',
    'listSection',
    'iconBox',
    'iconBoxSm',
    'iconBoxRound',
    'emptyState',
    'emptyStateSm',
    'emptyStateIcon',
    'emptyStateTitle',
    'emptyStateText',
    'badgeBrand',
    'badgeSuccess',
    'badgeDanger',
    'searchBar',
    'searchInput',
    'avatarBtn',
    'avatarInner',
  ];

  it.each(requiredTokens)('exports token "%s" as a non-empty string', (token) => {
    expect(typeof mt[token]).toBe('string');
    expect(mt[token].length).toBeGreaterThan(0);
  });

  it('screen token includes flex-1', () => {
    expect(mt.screen).toContain('flex-1');
  });

  it('btnPrimary token includes bg-brand', () => {
    expect(mt.btnPrimary).toContain('bg-brand');
  });

  it('heroCard token includes bg-brand and rounded-3xl', () => {
    expect(mt.heroCard).toContain('bg-brand');
    expect(mt.heroCard).toContain('rounded-3xl');
  });

  it('card token includes bg-white and rounded-3xl', () => {
    expect(mt.card).toContain('bg-white');
    expect(mt.card).toContain('rounded-3xl');
  });

  it('statCardDanger token includes bg-red-50', () => {
    expect(mt.statCardDanger).toContain('bg-red-50');
  });

  it('all tokens are readonly strings (no undefined)', () => {
    Object.values(mt).forEach((value) => {
      expect(typeof value).toBe('string');
    });
  });
});
