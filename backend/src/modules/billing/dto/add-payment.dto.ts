import { IsString, IsNumber, IsIn, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '../payment.entity';

export class AddPaymentDto {
  @ApiProperty()
  @IsString()
  billId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentMode })
  @IsIn(Object.values(PaymentMode))
  paymentMode: PaymentMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionRef?: string;
}
