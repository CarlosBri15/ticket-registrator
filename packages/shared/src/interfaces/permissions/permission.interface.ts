export interface IPermission {
    id: string;
    name: string;
    description: string | null;
    deletedAt: string | Date | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}
