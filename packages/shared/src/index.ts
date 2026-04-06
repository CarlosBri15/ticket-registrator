// Users
export * from './interfaces/users/user.interface';
export * from './interfaces/users/createUser.interface';

// Auth
export * from './interfaces/auth/loginResponse.interface';
export * from './interfaces/auth/currentUser.interface';
export * from './schemas/auth/login.schema'
export * from './schemas/auth/register.schema';

// Users
export * from './schemas/users/updateUser.schema';
export * from './schemas/users/createUser.schema';

// Reports
export * from './interfaces/reports/report.interface';
export * from './interfaces/reports/reportPagination.interface';
export * from './schemas/reports/createReport.schema';
export * from './schemas/reports/updateReport.schema';


// Tickets
export * from './interfaces/tickets/ticket.interface';
export * from './interfaces/categories/category.interface';
export * from './schemas/categories/createCategory.schema';
export * from './schemas/categories/updateCategory.schema';
export * from './interfaces/tickets/item.interface';
export * from './interfaces/tickets/receipt-extraction.interface';
export * from './schemas/tickets/createTicket.schema';
export * from './schemas/tickets/createItem.schema';
export * from './schemas/tickets/updateTicket.schema';

// Statuses
export * from './statuses/ticket-status';
export * from './statuses/item-status';
export * from './statuses/report-status';
export * from './statuses/ticket-lifecycle';

// API & Hooks
export * from './api/baseClient';
export * from './api/clientContainer';
export * from './hooks/useAuth';
export * from './hooks/useReports';
export * from './hooks/useTickets';
export * from './hooks/useUsers';
export * from './hooks/useDepartments';
export * from './hooks/useRoles';
export * from './hooks/useOrganizations';
export * from './hooks/usePermissions';
export * from './hooks/usePermissionsManagement';
export * from './hooks/useScope';
export * from './hooks/useModalState';
export * from './hooks/createCrudMutationHook';
export * from './hooks/useListState';
export * from './hooks/useCompanyScope';
export * from './hooks/useReportFilterState';

// Shared components (React.Fragment only — compatible with web and mobile)
export * from './components/PermissionGuard';
export * from './components/ScopeProvider';

// I18n
export * from './i18n';

// Design tokens (platform-agnostic: colors, radius, text, spacing)
export * from './styles/theme';

//Roles and Permissions
export * from './defaults/roles'
export * from './defaults/permissions'
export * from './defaults/role-default-permissions'

// Organization
export * from './interfaces/organization/organization.interface';
export * from './interfaces/organization/onboardAdminResult.interface';
export * from './interfaces/organization/onboardResponse.interface';
export * from './schemas/organization/onboardOrganization.schema';
export * from './schemas/organization/updateOrganization.schema';

// Department
export * from './interfaces/department/department.interface';
export * from './schemas/department/createDepartment.schema';
export * from './schemas/department/updateDepartment.schema';

// Pagination
export * from './interfaces/pagination/pagination.interface';

// Scope
export * from './interfaces/scope/scope.interface';

// Component interfaces
export * from './interfaces/permissions/permissionGuard.interface';

// Roles
export * from './interfaces/roles/role.interface';
export * from './schemas/roles/createRole.schema';

// Permissions
export * from './interfaces/permissions/permission.interface';
export * from './interfaces/permissions/rolePermission.interface';
export * from './interfaces/permissions/userPermission.interface';
export * from './schemas/permissions/createPermission.schema';
export * from './schemas/permissions/updatePermission.schema';
export * from './schemas/permissions/assignPermission.schema';
export * from './schemas/permissions/userPermissionOverride.schema';

// Categories
export * from './defaults/default-categories';

// Utilities
export * from './utils/hierarchy';
export * from './utils/errorUtils';
export * from './utils/avatarColor';

// Constants
export * from './constants/hierarchy';
export * from './constants/cache';
export * from './constants/pagination';
export * from './constants/i18n';
export * from './constants/statuses';