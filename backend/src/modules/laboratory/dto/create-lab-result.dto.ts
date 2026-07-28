import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabResultDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  testId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  testName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  normalRange?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAbnormal?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  enteredById?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  validatedById?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reportUrl?: string;
}
