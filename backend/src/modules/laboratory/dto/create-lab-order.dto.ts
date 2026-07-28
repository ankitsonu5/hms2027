import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  tests: { testId: string; testName: string; price: number }[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalAmount?: number;
}
