import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBillDto } from './create-bill.dto';
import { BillStatus } from '../bill.entity';

export class UpdateBillDto extends PartialType(CreateBillDto) {
  @ApiPropertyOptional({ enum: BillStatus })
  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;
}
