import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Hematology' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  normalRange?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  method?: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isNotifiable?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sampleType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  integrationCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  procedureCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  loincCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shortText?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testAlias?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icdToPin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  parameters?: any;

  @ApiPropertyOptional()
  @IsOptional()
  reportSettings?: any;
}
