import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEmergencyDto {
  @ApiProperty({ description: 'Full name of the patient' })
  @IsString()
  patientName: string;

  @ApiProperty({
    enum: ['RED', 'YELLOW', 'GREEN'],
    description: 'Triage tag color',
  })
  @IsIn(['RED', 'YELLOW', 'GREEN'])
  triageTag: 'RED' | 'YELLOW' | 'GREEN';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mlcCase?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mlcNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'Vitals: bp, pulse, temp, spo2, rr, weight',
  })
  @IsOptional()
  @IsObject()
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
    rr?: number;
    weight?: number;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  treatmentNotes?: string;

  @ApiPropertyOptional({ description: 'List of drugs administered' })
  @IsOptional()
  @IsArray()
  drugsAdministered?: object[];

  @ApiPropertyOptional({
    enum: ['DISCHARGE', 'ADMIT_ICU', 'ADMIT_OBSERVATION', 'ADMIT_WARD'],
  })
  @IsOptional()
  @IsIn(['DISCHARGE', 'ADMIT_ICU', 'ADMIT_OBSERVATION', 'ADMIT_WARD'])
  disposition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attendedByDoctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attendedByDoctorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionId?: string;
}
