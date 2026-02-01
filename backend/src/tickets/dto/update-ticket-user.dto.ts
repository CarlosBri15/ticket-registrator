import {IsString, IsDateString,IsNumber,IsOptional,IsArray,ValidateNested, IsIn} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';
import { TicketStatus } from '../status/ticket-status';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  payment_type?: string;

  @IsOptional()
  @IsString()
  expense_type?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  location_name?: string;

  @IsOptional()
  @IsString()
  location_address?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  cgs_bucket_link_justification?: string;

  @IsOptional()
  @IsString()
  last_four_digits?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items?: CreateItemDto[];
}

export class UpdateTicketStatusDto {
  @IsIn([TicketStatus.PENDING, TicketStatus.APPROVED, TicketStatus.REJECTED])
  status: typeof TicketStatus[keyof typeof TicketStatus];
  
  @IsNumber()
  @Type(() => Number)
  approved_amount: number;
}

// This is an internal DTO to allow updating only the LLM fields
export class UpdateTicketLlmDto {
  @IsOptional()
  @IsNumber()
  llm_appproved_percentage?: number;

  @IsOptional()
  @IsString()
  llm_recomendation?: string;

  @IsOptional()
  @IsNumber()
  llm_suggested_amount?: number;

  @IsOptional()
  @IsString()
  llm_suggested_currency?: string;
}

// Unionn type for controller/service
export type UpdateTicketUnionDto = UpdateTicketDto | UpdateTicketStatusDto;

// Type guard to detect status updates (used like a filter)
export function isStatusDto(
  dto: UpdateTicketUnionDto,
): dto is UpdateTicketStatusDto {
  return 'status' in dto;
}


