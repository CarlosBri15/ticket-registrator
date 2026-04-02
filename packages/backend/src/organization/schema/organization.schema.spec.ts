import { companies, companyRelations } from './organization.schema';

describe('Organization Schema', () => {
  it('should export companies table', () => {
    expect(companies).toBeDefined();
  });

  it('should export companyRelations', () => {
    expect(companyRelations).toBeDefined();
  });
});
