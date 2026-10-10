import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CrossConsultationDto {
  @IsString()
  @IsNotEmpty()
  targetDoctorId: string;

  @IsString()
  @IsNotEmpty()
  targetDoctorName: string;

  @IsString()
  @IsNotEmpty()
  targetDepartment: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
