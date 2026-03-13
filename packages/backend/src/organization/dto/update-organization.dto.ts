import { createZodDto } from 'nestjs-zod';
import { updateOrganizationSchema } from '@ticket-registrator/shared';

export class UpdateOrganizationDto extends createZodDto(updateOrganizationSchema) { }
