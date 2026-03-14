export interface IOrganization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOnboardAdminResult {
  id: string;
  name: string | null;
  email: string | null;
  username: string;
  temporaryPassword: string;
}

export interface IOnboardResponse {
  company: IOrganization;
  admins: IOnboardAdminResult[];
  message: string;
}
