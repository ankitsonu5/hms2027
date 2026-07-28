import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddBatchDto {
  @ApiProperty()
  @IsString()
  drugId: string;

  @ApiProperty()
  @IsString()
  batchNumber: string;

  @ApiProperty()
  @IsString()
  expiryDate: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  purchaseRate: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  mrp: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  gstPercent: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  freeQuantity?: number = 0;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grnNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receivedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;
}
