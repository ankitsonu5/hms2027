import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LAB_TEST_TYPES } from '../lab-test.entity';
import {
  PARAM_INPUT_TYPES,
  PARAM_RESULT_TYPES,
} from '../lab-test-parameter.entity';
import {
  AGE_UNITS,
  RANGE_GENDERS,
  RANGE_TYPES,
} from '../lab-reference-range.entity';
import { LAB_MASTER_KINDS } from '../lab-master.entity';

export class ReferenceRangeDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsIn(RANGE_TYPES as unknown as string[]) rangeType?: string;
  @IsOptional() @IsIn(RANGE_GENDERS as unknown as string[]) gender?: string;
  @IsOptional() @IsInt() @Min(0) minAge?: number;
  @IsOptional() @IsIn(AGE_UNITS as unknown as string[]) minAgeUnit?: string;
  @IsOptional() @IsInt() @Min(0) maxAge?: number;
  @IsOptional() @IsIn(AGE_UNITS as unknown as string[]) maxAgeUnit?: string;
  @IsOptional() @IsNumber() lowerValue?: number | null;
  @IsOptional() @IsNumber() upperValue?: number | null;
  @IsOptional() @IsNumber() criticalLow?: number | null;
  @IsOptional() @IsNumber() criticalHigh?: number | null;
  @IsOptional() @IsString() textValue?: string;
  @IsOptional() @IsString() displayText?: string;
  @IsOptional() @IsString() remark?: string;
}

export class TestParameterDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() method?: string;
  @IsOptional()
  @IsIn(PARAM_INPUT_TYPES as unknown as string[])
  inputType?: string;
  @IsOptional()
  @IsIn(PARAM_RESULT_TYPES as unknown as string[])
  resultType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) options?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) normalOptions?: string[];
  @IsOptional() @IsString() defaultResult?: string;
  @IsOptional() @IsString() formula?: string;
  @IsOptional() @IsInt() @Min(0) decimals?: number | null;
  @IsOptional() @IsString() groupBy?: string;
  @IsOptional() @IsBoolean() isOptional?: boolean;
  @IsOptional() @IsBoolean() isBold?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceRangeDto)
  ranges?: ReferenceRangeDto[];
}

/** Full test definition: the test plus all of its parameters and normal values. */
export class SaveTestDefinitionDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiProperty() @IsString() @IsNotEmpty() category: string;
  @ApiProperty({ enum: LAB_TEST_TYPES })
  @IsIn(LAB_TEST_TYPES as unknown as string[])
  testType: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sampleType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() method?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instrument?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() testAlias?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() loincCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() integrationCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isOutsourced?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() outsourceCenter?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() interpretation?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() printOnNewPage?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  panelTestIds?: string[];

  @ApiPropertyOptional({ type: [TestParameterDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestParameterDto)
  parameters?: TestParameterDto[];
}

export class SaveRangesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferenceRangeDto)
  ranges: ReferenceRangeDto[];
}

export class CreateLabMasterDto {
  @IsIn(LAB_MASTER_KINDS as unknown as string[]) kind: string;
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateLabMasterDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
