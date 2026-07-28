import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DosageForm, DrugSchedule } from '../drug.entity';

export class CreateDrugDto {
  @ApiProperty()
  @IsString()
  genericName: string;

  @ApiProperty()
  @IsString()
  brandName: string;

  @ApiProperty({ enum: DosageForm })
  @IsEnum(DosageForm)
  dosageForm: DosageForm;

  @ApiProperty({ enum: DrugSchedule })
  @IsEnum(DrugSchedule)
  schedule: DrugSchedule;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  mrp: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  purchaseRate: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
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
