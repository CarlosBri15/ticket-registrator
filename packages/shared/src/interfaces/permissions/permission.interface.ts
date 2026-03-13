export interface IPermission {
    id: string;
    name: string;
    description: string | null;
    isVisible: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}
