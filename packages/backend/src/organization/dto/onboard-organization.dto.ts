import { onboardOrganizationSchema } from '@ticket-registrator/shared';
import { createZodDto } from 'nestjs-zod';

export class OnboardOrganizationDto extends createZodDto(onboardOrganizationSchema) { }
