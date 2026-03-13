export interface IUserPermission {
    id: string;
    userId: string;
    permissions: string[];
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}
