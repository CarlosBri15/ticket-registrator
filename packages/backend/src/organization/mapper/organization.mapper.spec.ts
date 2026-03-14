import { mapCompanyToIOrganization } from './organization.mapper';

describe('mapCompanyToIOrganization', () => {
  const now = new Date('2024-01-15T10:00:00.000Z');

  const baseCompany = {
    id: 'company-1',
    orgName: 'ACME Corp',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  it('should map all fields correctly', () => {
    const result = mapCompanyToIOrganization(baseCompany as any);

    expect(result).toEqual({
      id: 'company-1',
      name: 'ACME Corp',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('should use orgName as name (not orgName)', () => {
    const company = { ...baseCompany, orgName: 'My Company' };
    const result = mapCompanyToIOrganization(company as any);
    expect(result.name).toBe('My Company');
  });

  it('should convert createdAt Date to ISO string', () => {
    const date = new Date('2023-06-01T00:00:00.000Z');
    const company = { ...baseCompany, createdAt: date };
    const result = mapCompanyToIOrganization(company as any);
    expect(result.createdAt).toBe('2023-06-01T00:00:00.000Z');
  });

  it('should convert updatedAt Date to ISO string', () => {
    const date = new Date('2023-12-31T23:59:59.000Z');
    const company = { ...baseCompany, updatedAt: date };
    const result = mapCompanyToIOrganization(company as any);
    expect(result.updatedAt).toBe('2023-12-31T23:59:59.000Z');
  });

  it('should preserve the id from the company', () => {
    const company = { ...baseCompany, id: 'specific-uuid-123' };
    const result = mapCompanyToIOrganization(company as any);
    expect(result.id).toBe('specific-uuid-123');
  });

  it('should not include deletedAt or orgName in the output', () => {
    const result = mapCompanyToIOrganization(baseCompany as any);
    expect(result).not.toHaveProperty('deletedAt');
    expect(result).not.toHaveProperty('orgName');
  });
});
