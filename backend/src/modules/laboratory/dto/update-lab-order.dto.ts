import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLabOrderDto } from './create-lab-order.dto';

export class UpdateLabOrderDto extends PartialType(CreateLabOrderDto) {
  @ApiPropertyOptional({
    enum: ['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'],
  })
  @IsString()
  @IsOptional()
  status?: 'ORDERED' | 'SAMPLE_COLLECTED' | 'IN_PROGRESS' | 'COMPLETED';

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  sampleCollected?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sampleBarcode?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
