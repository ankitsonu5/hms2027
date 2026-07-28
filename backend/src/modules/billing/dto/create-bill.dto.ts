import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsIn,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillItemCategory } from '../bill.entity';

export class BillItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: BillItemCategory })
  @IsString()
  @IsIn(Object.values(BillItemCategory))
  category: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  gst?: number;
}

export class CreateBillDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  patientName: string;

  @ApiProperty({ type: [BillItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  encounterId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string;
}
