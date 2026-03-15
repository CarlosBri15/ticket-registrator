import { createZodDto } from 'nestjs-zod';
import { createReportSchema } from '@ticket-registrator/shared';

export class CreateReportDto extends createZodDto(createReportSchema) {}
