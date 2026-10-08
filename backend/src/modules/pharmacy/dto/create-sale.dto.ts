import {
  IsArray,
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '../pharmacy-sale.entity';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

class SaleItemDto {
  @IsOptional()
  @IsString()
  drugId?: string;

  @IsOptional()
  @IsString()
  drugName?: string;

  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  mrp: number;

  @IsNotEmpty()
  saleRate: number;

  @IsOptional()
  gstPercent: number;
}

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
    type: [SaleItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

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

  @IsOptional()
  isPaid?: boolean;

  @IsOptional()
  discount?: number;

  @IsOptional()
  subtotal?: number;

  @IsOptional()
  gstTotal?: number;

  @IsOptional()
  totalAmount?: number;
}
