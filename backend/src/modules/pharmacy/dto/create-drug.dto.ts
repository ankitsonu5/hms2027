import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DosageForm, DrugSchedule } from '../drug.entity';

export class CreateDrugDto {
  @ApiProperty()
  @IsString()
  genericName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiProperty({ enum: DosageForm })
  @IsEnum(DosageForm)
  dosageForm: DosageForm;

  @ApiProperty({ enum: DrugSchedule })
  @IsEnum(DrugSchedule)
  schedule: DrugSchedule;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  mrp: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  purchaseRate?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  saleRate: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strength?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gstPercent?: number;
}
