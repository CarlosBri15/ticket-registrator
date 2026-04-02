import { createZodDto } from 'nestjs-zod';
import {
  createPermissionSchema,
  updatePermissionSchema,
  assignPermissionSchema,
  userPermissionOverrideSchema,
} from '@ticket-registrator/shared';

export class CreatePermissionDto extends createZodDto(createPermissionSchema) {}
export class UpdatePermissionDto extends createZodDto(updatePermissionSchema) {}
export class AssignPermissionDto extends createZodDto(assignPermissionSchema) {}
export class UserPermissionOverrideDto extends createZodDto(
  userPermissionOverrideSchema,
) {}
