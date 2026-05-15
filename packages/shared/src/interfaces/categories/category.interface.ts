export interface ICategory {
    id: string;
    name: string;
    description: string;
    color: string | null;
    icon: string | null;
    organizationId: string | null;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
