import { IsString, IsDateString, IsNumber, IsOptional, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  type?: string;
}
