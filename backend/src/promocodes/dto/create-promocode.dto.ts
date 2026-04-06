import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class CreatePromocodeDto {
  @IsString()
  code: string;

  @IsString()
  promoter_name: string;

  @IsOptional()
  @IsString()
  promoter_email?: string;

  @IsNumber()
  discount_percentage: number;

  @IsEnum(['fixed', 'percentage'])
  commission_type: 'fixed' | 'percentage';

  @IsNumber()
  commission_value: number;

  @IsOptional()
  @IsNumber()
  max_uses?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
