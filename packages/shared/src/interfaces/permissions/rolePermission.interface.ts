export interface IRolePermission {
    id: string;
    roleId: string;
    permissionId: string;
    companyId: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}
