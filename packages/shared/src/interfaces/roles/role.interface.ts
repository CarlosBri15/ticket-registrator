export interface IRole {
  id: string;
  name: string;
  hierarchy: number;
  description: string | null;
  companyId: string | null;
}
