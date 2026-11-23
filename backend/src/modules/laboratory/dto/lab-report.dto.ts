import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParameterResultDto {
  @IsString() @IsNotEmpty() testId: string;
  /** Omitted for a test that has no parameters defined (legacy single value). */
  @IsOptional() @IsString() parameterId?: string;
  @IsOptional() @IsString() value?: string;
  @IsOptional() @IsBoolean() hideInPrint?: boolean;
}

export class SaveOrderResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterResultDto)
  results: ParameterResultDto[];

  /** Approve (verify) the report in the same call. */
  @IsOptional() @IsBoolean() approve?: boolean;
}

export class ApproveReportDto {
  @IsBoolean() approve: boolean;
}

export class ReportSignatureDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() imageUrl?: string;
}

export class UpdateReportSettingsDto {
  @IsOptional() @IsString() headerImage?: string | null;
  @IsOptional() @IsString() footerImage?: string | null;
  @IsOptional() @IsInt() @Min(0) @Max(120) headerHeightMm?: number;
  @IsOptional() @IsInt() @Min(0) @Max(80) footerHeightMm?: number;
  @IsOptional() @IsBoolean() letterheadByDefault?: boolean;
  @IsOptional() @IsString() labName?: string;
  @IsOptional() @IsString() labAddress?: string;
  @IsOptional() @IsString() labContact?: string;
  @IsOptional() @IsInt() @Min(0) @Max(40) marginMm?: number;
  @IsOptional() @IsNumber() @Min(7) @Max(14) fontSizePt?: number;
  @IsOptional() @IsString() fontFamily?: string;
  @IsOptional() @IsBoolean() showMethodColumn?: boolean;
  @IsOptional() @IsBoolean() showUnitColumn?: boolean;
  @IsOptional() @IsIn(['HL', 'ARROW', 'BOLD']) flagStyle?: string;
  @IsOptional() @IsBoolean() boldAbnormal?: boolean;
  @IsOptional() @IsBoolean() showSampleType?: boolean;
  @IsOptional() @IsBoolean() departmentOnNewPage?: boolean;
  @IsOptional() @IsString() endOfReportText?: string;
  @IsOptional() @IsString() footerNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportSignatureDto)
  signatures?: ReportSignatureDto[];
}
