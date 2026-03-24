export interface ICategory {
    id: string;
    name: string;
    description: string;
    organizationId: string | null;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
