import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WardType } from '../ward.entity';

export class CreateWardDto {
  @ApiProperty({ example: 'General Ward A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: WardType })
  @IsIn(Object.values(WardType))
  type: WardType;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalBeds?: number;
}
