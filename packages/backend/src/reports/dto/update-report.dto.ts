import { IsOptional, IsString, IsDateString, IsIn, IsMongoId } from 'class-validator';
import { ReportStatus } from '../report-status/report-status';


// Editable fields DTO
export class UpdateReportFieldsDto {
  // @IsMongoId()
  // reportId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

// Status update DTO
export class UpdateReportStatusDto{
  @IsMongoId()
  reportId: string;

  @IsIn([ReportStatus.APPROVED, ReportStatus.DECLINED, ReportStatus.SUBMITTED])
  status: typeof ReportStatus[keyof typeof ReportStatus];
}

// Union type for controller/service
export type UpdateReportUnionDto = UpdateReportFieldsDto | UpdateReportStatusDto;

// Type guard to detect status updates (used like a filter)
export function isStatusDto(
  dto: UpdateReportUnionDto,
): dto is UpdateReportStatusDto {
  return 'status' in dto;
}
