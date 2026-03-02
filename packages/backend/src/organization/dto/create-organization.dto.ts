import { registerOrganizationSchema } from '@ticket-registrator/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateOrganizationDto extends createZodDto(registerOrganizationSchema) { }
