import { IsString, IsDateString, IsNumber, IsOptional, IsArray, IsMongoId, IsNotEmpty, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';

export class CreateTicketDto {

  @IsString()
  @IsNotEmpty()
  cgs_bucket_link: string;

  @IsString()
  payment_type: string;

  @IsString()
  expense_type: string;

  @IsDateString()
  date: string;

  @IsString()
  location_name: string;

  @IsString()
  location_address: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsNumber()
  converted_amount: number;

  @IsString()
  converted_currency: string;

  @IsString()
  cgs_bucket_link_justification: string;

  @IsString()
  last_four_digits: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items?: CreateItemDto[];
}
