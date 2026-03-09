import { createZodDto } from 'nestjs-zod';
import { updateDepartmentSchema } from '@ticket-registrator/shared';

export class UpdateDepartmentDto extends createZodDto(updateDepartmentSchema) { }
