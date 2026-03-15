import { createZodDto } from 'nestjs-zod';
import { updateReportFieldsSchema } from '@ticket-registrator/shared';
import { updateReportStatusSchema } from '@ticket-registrator/shared';

export class UpdateReportFieldsDto extends createZodDto(
  updateReportFieldsSchema,
) {}
export class UpdateReportStatusDto extends createZodDto(
  updateReportStatusSchema,
) {}
