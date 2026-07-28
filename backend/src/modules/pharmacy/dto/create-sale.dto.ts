import {
  IsArray,
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '../pharmacy-sale.entity';

export class CreateSaleDto {
  @ApiProperty({
    description: 'Array of sale items',
    example: [
      {
        drugId: 'uuid',
        drugName: 'Paracetamol 500mg',
        batchId: 'uuid',
        qty: 10,
        mrp: 2.5,
        gst: 12,
        discount: 5,
        amount: 23.75,
      },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  items: Array<{
    drugId: string;
    drugName: string;
    batchId: string;
    qty: number;
    mrp: number;
    gst: number;
    discount: number;
    amount: number;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional({ enum: PaymentMode, default: PaymentMode.CASH })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prescriptionRef?: string;
}
