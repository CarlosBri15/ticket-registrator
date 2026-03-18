import { createZodDto } from 'nestjs-zod';
import {
  updateReportFieldsSchema,
  updateReportStatusSchema,
} from '@ticket-registrator/shared';

export class UpdateReportFieldsDto extends createZodDto(
  updateReportFieldsSchema,
) {}
export class UpdateReportStatusDto extends createZodDto(
  updateReportStatusSchema,
) {}
