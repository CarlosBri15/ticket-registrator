# API Documentation

> **Auth**: All endpoints require `Authorization: Bearer <jwt_token>` in the header.
> **Permissions**: Endpoints marked with 🔒 additionally require the stated permission (enforced via `PermissionsGuard`).
> **Errors common to all endpoints**:
> - `401 Unauthorized` — JWT token missing or invalid
> - `403 Forbidden` — Valid token but missing required permission

---

## Reports — `/reports`

### Return types

```ts
IReport {
  id: string
  user_id: string
  name: string
  start_date: string        // ISO date
  end_date: string          // ISO date
  currency: string
  type: string
  requested_amount: number
  approved_amount: number
  status: 'Created' | 'Submitted' | 'Approved' | 'Declined'
  createdAt: string
  updatedAt: string
  isVisible: boolean
}

PaginatedList<IReport> {
  data: IReport[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

---

### `POST /reports`
🔒 `create_own_reports`

Creates a new report for the authenticated user.

**Body**
```json
{
  "name": "string (required)",
  "start_date": "date (required)",
  "end_date": "date (required)",
  "currency": "string (required)",
  "type": "string (optional)",
  "isVisible": "boolean (optional, default: true)"
}
```

**Response** `201` → `IReport`

**Errors**
| Status | Message |
|--------|---------|
| `400` | Invalid body (Zod validation) |
| `404` | User not found or not visible |
| `409` | A report already exists for this trip date range |

---

### `GET /reports`
🔒 `view_own_reports` or `view_team_reports` or `view_all_reports`

Returns all reports accessible to the user based on their role:
- `view_own_reports` → only their own reports
- `view_team_reports` → reports from their department
- `view_all_reports` → all reports within the company (Admin / SuperAdmin)

**Response** `200` → `IReport[]`

**Errors**
| Status | Message |
|--------|---------|
| `404` | User not found or not visible |

---

### `GET /reports/paginated`
🔒 `view_own_reports` or `view_team_reports` or `view_all_reports`

Same as `GET /reports` but paginated with optional filters.

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Items per page (default: 10) |
| `userId` | `string` | Filter by specific user ID |
| `name` | `string` | Partial case-insensitive search by name |
| `startDate` | `date string` | Reports starting from this date |
| `endDate` | `date string` | Reports ending up to this date |
| `status` | `'Created' \| 'Submitted' \| 'Approved' \| 'Declined'` | Filter by status |

**Response** `200` → `PaginatedList<IReport>`

**Errors**
| Status | Message |
|--------|---------|
| `404` | User not found or not visible |

---

### `GET /reports/user/:userId`
🔒 `view_own_reports` or `view_team_reports` or `view_all_reports`

Returns all reports belonging to a specific user.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `userId` | `string` | Target user ID |

**Response** `200` → `IReport[]`

**Errors**
| Status | Message |
|--------|---------|
| `404` | User not found or not visible (requester or target) |
| `403` | You do not have permission to view this user's reports |

**Access logic**
- A user can always view their own reports
- `MANAGER` with `view_team_reports`: can only view users in the same department and company
- `ADMIN` / `SUPERADMIN` with `view_all_reports`: can view users in the same company with lower hierarchy

---

### `GET /reports/:id`
🔒 `view_own_reports` or `view_team_reports` or `view_all_reports`

Returns a single report by ID.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Report ID |

**Response** `200` → `IReport`

**Errors**
| Status | Message |
|--------|---------|
| `404` | User not found or not visible / Report not found |
| `403` | You do not have permission to view this report |

---

### `PATCH /reports/:id`
🔒 `edit_own_reports` or `approve_reports`

Dual-purpose endpoint: updates report fields **or** changes the report status, depending on the body.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Report ID |

#### Case 1 — Update status (`approve_reports`)
If the body contains `"status"`:
```json
{
  "status": "Approved" | "Declined" | "Submitted"
}
```
The report must be in `Submitted` state. Used by Controller / Admin to approve or decline.

**Response** `200` → `IReport`

**Errors**
| Status | Message |
|--------|---------|
| `400` | Invalid body (Zod validation) |
| `404` | User not found or not visible |
| `409` | Report not found or cannot be reviewed (status must be SUBMITTED) |

#### Case 2 — Update fields (`edit_own_reports`)
If the body does NOT contain `"status"`:
```json
{
  "name": "string (optional)",
  "start_date": "date (optional)",
  "end_date": "date (optional)",
  "type": "string (optional)",
  "isVisible": "boolean (optional)"
}
```
The report must belong to the user and be in `Created` state.

**Response** `200` → `IReport`

**Errors**
| Status | Message |
|--------|---------|
| `400` | Invalid body / No valid fields provided for update |
| `404` | User not found or not visible / Report not found or cannot be updated (status must be CREATED) |

---

### `PATCH /reports/:id/submit`
🔒 `submit_own_reports`

Submits the report for review. Changes status from `Created` → `Submitted`.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Report ID |

**Response** `200` → `IReport`

**Errors**
| Status | Message |
|--------|---------|
| `404` | User not found or not visible |
| `409` | Report not found or cannot be submitted (status must be CREATED) |

---

### `DELETE /reports/:id`
🔒 `delete_own_reports`

Soft-deletes the report (sets `isVisible: false`). Cascades to hide all its tickets as well.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Report ID |

**Response** `200`
```json
{ "deleted": true }
```

**Errors**
| Status | Message |
|--------|---------|
| `404` | User not found or not visible / Report not found |
| `409` | Cannot remove a report after submission |

---

## Tickets — `/reports/:reportId/tickets`

### Return types

```ts
ITicket {
  id: string
  report_id: string
  lifecycle: 'Draft' | 'Submitted'
  version: number
  status: 'Pending' | 'Approved' | 'Rejected'
  cgs_bucket_link: string | null
  payment_type: string | null
  expense_type: string | null
  date: string | null
  location_name: string | null
  location_address: string | null
  amount: number | null
  currency: string | null
  converted_amount: number | null
  converted_currency: string | null
  cgs_bucket_link_justification: string | null
  last_four_digits: string | null
  items?: IItem[]
  createdAt: string
  updatedAt: string
  isVisible: boolean
}

IItem {
  id: string
  name: string | null
  amount: number | null
  currency: string | null
  status: 'Pending' | 'Approved' | 'Rejected'
}
```

---

### `POST /reports/:reportId/tickets`
🔒 `create_own_tickets`

Creates a ticket from a receipt image. Uploads the image to GCS and extracts data using Gemini AI.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `reportId` | `string` | ID of the parent report |

**Body** — `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `image` | `File` | Receipt image (jpg, png, etc.) |

**Response** `201` → `ITicket` (with `items` included)

**Errors**
| Status | Message |
|--------|---------|
| `404` | Report not found |
| `409` | Cannot add ticket to non-created report |

> Ticket is created with `status: Pending` and `lifecycle: Draft`. Items are automatically extracted by Gemini.

---

### `GET /reports/:reportId/tickets`
🔒 `view_own_tickets` or `view_team_tickets` or `view_all_tickets`

Returns all visible tickets for a report (only if the report belongs to the user).

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `reportId` | `string` | Report ID |

**Response** `200` → `ITicket[]` (each ticket includes `items`)

**Errors**
| Status | Message |
|--------|---------|
| `404` | Report not found |

---

### `GET /reports/:reportId/tickets/:ticketId`
🔒 `view_own_tickets` or `view_team_tickets` or `view_all_tickets`

Returns a single ticket by ID.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `reportId` | `string` | Report ID |
| `ticketId` | `string` | Ticket ID |

**Response** `200` → `ITicket` (includes `items`)

**Errors**
| Status | Message |
|--------|---------|
| `404` | Report not found / Ticket not found |

---

### `PATCH /reports/:reportId/tickets/:ticketId`
🔒 `edit_own_tickets` or `approve_tickets`

Dual-purpose endpoint: updates ticket fields **or** changes ticket status, depending on the body.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `reportId` | `string` | Report ID |
| `ticketId` | `string` | Ticket ID |

#### Case 1 — Update status (`approve_tickets`)
If the body contains `"status"`:
```json
{
  "status": "Pending" | "Approved" | "Rejected",
  "approved_amount": number
}
```
The report must be in `Submitted` state. Records a history entry.

**Response** `200` → `ITicket`

**Errors**
| Status | Message |
|--------|---------|
| `400` | Invalid body (Zod validation) |
| `404` | Ticket not found |
| `409` | Tickets can only be reviewed after report submission |

#### Case 2 — Update fields (`edit_own_tickets`)
If the body does NOT contain `"status"`:
```json
{
  "payment_type": "string (optional)",
  "expense_type": "string (optional)",
  "date": "date (optional)",
  "location_name": "string (optional)",
  "location_address": "string (optional)",
  "amount": "number (optional)",
  "currency": "string (optional)",
  "cgs_bucket_link_justification": "string (optional)",
  "last_four_digits": "string (optional)",
  "items": "IItem[] (optional)"
}
```
The report must be in `Created` state. When meaningful fields are updated, the ticket transitions to `lifecycle: Submitted`, `status: Pending`, and `approvedAmount: 0`. Records a history entry.

**Response** `200` → `ITicket` (includes `items`)

**Errors**
| Status | Message |
|--------|---------|
| `400` | Invalid body / No valid fields provided for update |
| `404` | Report not found / Ticket not found |
| `409` | Cannot edit tickets after submission |

---

### `DELETE /reports/:reportId/tickets/:ticketId`
🔒 `delete_own_tickets`

Soft-deletes the ticket. Only allowed when the report is in `Created` state. Records a history entry.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `reportId` | `string` | Report ID |
| `ticketId` | `string` | Ticket ID |

**Response** `200`
```json
{ "deleted": true }
```

**Errors**
| Status | Message |
|--------|---------|
| `404` | Report not found / Ticket not found |
| `409` | Cannot hide tickets after submission |

---

### `GET /reports/:reportId/tickets/:ticketId/image`
🔒 `view_own_tickets` or `view_team_tickets` or `view_all_tickets`

Returns a signed (temporary) URL to access the receipt image stored in GCS.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `reportId` | `string` | Report ID |
| `ticketId` | `string` | Ticket ID |

**Response** `200`
```json
{ "url": "https://storage.googleapis.com/..." }
```

**Errors**
| Status | Message |
|--------|---------|
| `404` | Report not found / Ticket not found / No image found for this ticket |

---

## Roles — System `/roles`

> Only accessible by SuperAdmin (`manage_permissions`).
> Manages global system roles and permissions.

### Return types

```ts
Role {
  id: string
  name: string
  description: string | null
  companyId: string | null   // null = system role (global)
  isVisible: boolean
  isSystem: boolean
  hierarchy: number          // 1=Employee, 2=Manager, 3=Controller, 4=Admin, 5=SuperAdmin
  createdAt: string
  updatedAt: string
}
```

---

### `POST /roles/system/seed-permissions`
🔒 `manage_permissions`

Inserts all permissions defined in the shared package that do not yet exist in the DB.

**Response** `201`
```json
{ "message": "Seeded N permissions" }
// or
{ "message": "All permissions already seeded" }
```

---

### `POST /roles/system/seed-roles`
🔒 `manage_permissions`

Inserts all system roles (Employee, Manager, Controller, Admin, SuperAdmin) that do not yet exist in the DB.

**Response** `201`
```json
{ "message": "Seeded N system roles" }
// or
{ "message": "All default roles already seeded" }
```

---

### `POST /roles/system/seed-role-permissions`
🔒 `manage_permissions`

Associates the default permissions to each system role based on `ROLE_DEFAULT_PERMISSIONS`.

**Response** `201`
```json
{ "message": "Seeded N role-permissions mappings" }
// or
{ "message": "All default role-permissions already seeded" }
```

---

### `POST /roles/system/seed-all`
🔒 `manage_permissions`

Runs the three seed operations above in sequence. Initial system setup endpoint.

**Response** `201`
```json
{
  "permissions": { "message": "..." },
  "roles": { "message": "..." },
  "rolePermissions": { "message": "..." }
}
```

---

### `GET /roles`
🔒 `view_roles` or `manage_permissions`

Returns all system roles (global and company-specific).

**Response** `200` → `Role[]` (ordered by `hierarchy` desc)

---

## Roles — Company `/organizations/:companyId/roles`

> Manages custom roles for a specific company.

---

### `POST /organizations/:companyId/roles`
🔒 `create_roles`

Creates a custom role for the company. The new role's hierarchy must be **lower** than the requester's own hierarchy.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `companyId` | `string` | Company ID |

**Body**
```json
{
  "name": "string (required, min 2, max 255)",
  "hierarchy": "number (required, integer, 1-4)",
  "description": "string (optional)"
}
```

**Response** `201` → `Role`

**Errors**
| Status | Message |
|--------|---------|
| `400` | Invalid body (Zod validation) |
| `403` | Cannot create a role with a hierarchy equal or higher than your own |
| `409` | Role "name" already exists in your company |

---

### `GET /organizations/:companyId/roles`
🔒 `view_roles`

Returns all visible roles for the company, including global system roles (companyId = null).

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `companyId` | `string` | Company ID |

**Response** `200` → `Role[]` (ordered by `hierarchy` desc)

---

### `GET /organizations/:companyId/roles/:id`
🔒 `view_roles`

Returns a single role by ID. Validates that the role belongs to the company or is a global system role.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `companyId` | `string` | Company ID |
| `id` | `string` | Role ID |

**Response** `200` → `Role`

**Errors**
| Status | Message |
|--------|---------|
| `404` | Role not found |
| `403` | You cannot access roles outside your company |

---

### `DELETE /organizations/:companyId/roles/:id`
🔒 `delete_roles`

Soft-deletes a company role. System roles cannot be deleted. Cannot delete roles with equal or higher hierarchy than the requester.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `companyId` | `string` | Company ID |
| `id` | `string` | Role ID |

**Response** `200`
```json
{ "deleted": true }
```

**Errors**
| Status | Message |
|--------|---------|
| `404` | Role not found or you have no permission to delete it |
| `403` | System roles cannot be deleted |
| `403` | Cannot delete a role with equal or higher hierarchy than your own |
| `409` | Role already deleted |

---

## Categories — `/categories`

### Return types

```ts
ICategory {
  id: string
  name: string
  description: string
  organizationId: string | null   // null = system category (global)
  isSystem: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}
```

---

### `POST /categories`
🔒 `create_categories`

Creates a new category.

**Body**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "organizationId": "string (optional)",
  "isSystem": "boolean (optional, default: false)"
}
```

**Response** `201` → `ICategory`

---

### `GET /categories/organization/:orgId`
🔒 `view_categories`

Returns all categories for a specific organization.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `orgId` | `string` | Organization ID |

**Response** `200` → `ICategory[]`

---

### `GET /categories/system`
🔒 `view_categories`

Returns all global system categories.

**Response** `200` → `ICategory[]`

---

### `GET /categories/:id`
🔒 `view_categories`

Returns a single category by ID.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Category ID |

**Response** `200` → `ICategory`

---

### `PATCH /categories/:id`
🔒 `edit_categories`

Updates an existing category.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Category ID |

**Body**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Response** `200` → `ICategory`

---

### `DELETE /categories/:id`
🔒 `delete_categories`

Soft-deletes a category.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Category ID |

**Response** `200`
```json
{ "deleted": true }
```

---

### `POST /categories/organization/:orgId/defaults`
🔒 `create_categories`

Clones specified system categories (or all if none specified) into an organization.

**Params**
| Param | Type | Description |
|-------|------|-------------|
| `orgId` | `string` | Organization ID |

**Body**
```json
{
  "categoryNames": "string[] (optional)"
}
```

**Response** `201` → `ICategory[]`

---

## Permission matrix by role

| Permission | Employee | Manager | Controller | Admin | SuperAdmin |
|------------|----------|---------|------------|-------|------------|
| `create_own_reports` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `edit_own_reports` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `delete_own_reports` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `view_own_reports` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `submit_own_reports` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `create_own_tickets` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `edit_own_tickets` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `delete_own_tickets` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `view_own_tickets` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `view_team_reports` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `view_team_tickets` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `view_all_reports` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `view_all_tickets` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `approve_reports` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `approve_tickets` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `create_roles` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `view_roles` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `delete_roles` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `create_categories` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `view_categories` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `edit_categories` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `delete_categories` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `manage_permissions` | ❌ | ❌ | ❌ | ❌ | ✅ |
