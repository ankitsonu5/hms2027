import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdmissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wardId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bedId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  admittingDoctorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  admittingDoctorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedDischargeDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attendantName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attendantPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attendantRelation?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  depositAmount?: number;
}
