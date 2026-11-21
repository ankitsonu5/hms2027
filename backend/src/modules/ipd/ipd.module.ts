import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ward } from './ward.entity';
import { Bed } from './bed.entity';
import { IpdAdmission } from './ipd-admission.entity';
import { IpdService } from './ipd.service';
import { IpdController } from './ipd.controller';

import { Bill } from '../billing/bill.entity';
import { Payment } from '../billing/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ward, Bed, IpdAdmission, Bill, Payment])],
  controllers: [IpdController],
  providers: [IpdService],
  exports: [IpdService],
})
export class IpdModule {}
