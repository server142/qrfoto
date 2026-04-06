export class CreatePromocodeDto {
  code: string;
  promoter_name: string;
  promoter_email?: string;
  discount_percentage: number;
  commission_type: 'fixed' | 'percentage';
  commission_value: number;
  max_uses?: number;
  expires_at?: Date;
  is_active?: boolean;
}
