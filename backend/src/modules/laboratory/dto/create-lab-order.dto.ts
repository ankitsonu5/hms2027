import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LabOrderTestDto {
  @IsString()
  @IsNotEmpty()
  testId: string;

  @IsString()
  @IsNotEmpty()
  testName: string;

  @IsNumber()
  price: number;
}

export class CreateLabOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  encounterId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderedByDoctorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderedByDoctorName: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        testId: { type: 'string' },
        testName: { type: 'string' },
        price: { type: 'number' },
      },
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabOrderTestDto)
  tests: LabOrderTestDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  concessionPercentage?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  concessionReason?: string;
}
