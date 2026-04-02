import { IOrganization } from './organization.interface';
import { IOnboardAdminResult } from './onboardAdminResult.interface';

export interface IOnboardResponse {
  company: IOrganization;
  admins: IOnboardAdminResult[];
  message: string;
}
