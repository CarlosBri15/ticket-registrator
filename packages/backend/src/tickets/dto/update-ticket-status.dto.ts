import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from '../status/ticket-status';

export class UpdateTicketStatusDto {
  @IsIn([TicketStatus.PENDING, TicketStatus.APPROVED, TicketStatus.REJECTED])
  status: typeof TicketStatus[keyof typeof TicketStatus];
  
  @IsNumber()
  @Type(() => Number)
  approved_amount: number;

  // -----------------------------
  // LLM advisory fields (persisted)
  // -----------------------------
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  llm_appproved_percentage?: number;

  @IsOptional()
  @IsString()
  llm_recomendation?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  llm_suggested_amount?: number;

  @IsOptional()
  @IsString()
  llm_suggested_currency?: string;
}
