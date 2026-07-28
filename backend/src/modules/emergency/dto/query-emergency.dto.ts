import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryEmergencyDto {
  @ApiPropertyOptional({ enum: ['RED', 'YELLOW', 'GREEN'] })
  @IsOptional()
  @IsIn(['RED', 'YELLOW', 'GREEN'])
  triageTag?: 'RED' | 'YELLOW' | 'GREEN';

  @ApiPropertyOptional({
    enum: ['DISCHARGE', 'ADMIT_ICU', 'ADMIT_OBSERVATION', 'ADMIT_WARD'],
  })
  @IsOptional()
  @IsIn(['DISCHARGE', 'ADMIT_ICU', 'ADMIT_OBSERVATION', 'ADMIT_WARD'])
  disposition?: 'DISCHARGE' | 'ADMIT_ICU' | 'ADMIT_OBSERVATION' | 'ADMIT_WARD';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;
}
