import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEmergencyDto } from './create-emergency.dto';

export class UpdateEmergencyDto extends PartialType(CreateEmergencyDto) {
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
  disposition?: 'DISCHARGE' | 'ADMIT_ICU' | 'ADMIT_OBSERVATION' | 'ADMIT_WARD';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attendedByDoctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attendedByDoctorName?: string;
}
