import { IOrganization } from '@ticket-registrator/shared';
import { Company } from '../schema/organization.schema';

export const mapCompanyToIOrganization = (company: Company): IOrganization => ({
  id: company.id,
  name: company.orgName,
  createdAt: company.createdAt.toISOString(),
  updatedAt: company.updatedAt.toISOString(),
});
