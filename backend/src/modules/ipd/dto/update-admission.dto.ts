import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsIn, IsDateString } from 'class-validator';
import { CreateAdmissionDto } from './create-admission.dto';
import { AdmissionStatus } from '../ipd-admission.entity';

export class UpdateAdmissionDto extends PartialType(CreateAdmissionDto) {
  @ApiPropertyOptional({ enum: AdmissionStatus })
  @IsOptional()
  @IsIn(Object.values(AdmissionStatus))
  status?: AdmissionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actualDischargeDate?: string;
}
