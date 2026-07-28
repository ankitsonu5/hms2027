import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OpdStatus } from '../opd-encounter.entity';

export class PrescriptionItemDto {
  @IsString()
  drugName: string;

  @IsString()
  dosage: string;

  @IsString()
  duration: string;

  @IsString()
  instructions: string;
}

export class LabOrderItemDto {
  @IsString()
  testName: string;

  @IsOptional()
  @IsString()
  notes: string;
}

export class CreateOpdDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tokenNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chiefComplaints?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  history?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  examination?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icdCode?: string;

  @ApiPropertyOptional({ type: [PrescriptionItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  prescription?: PrescriptionItemDto[];

  @ApiPropertyOptional({ type: [LabOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabOrderItemDto)
  labOrders?: LabOrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ enum: OpdStatus })
  @IsOptional()
  @IsEnum(OpdStatus)
  status?: OpdStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referredToDoctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referredToDoctorName?: string;
}
