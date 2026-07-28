import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ward } from './ward.entity';
import { Bed } from './bed.entity';
import { IpdAdmission } from './ipd-admission.entity';
import { IpdService } from './ipd.service';
import { IpdController } from './ipd.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ward, Bed, IpdAdmission])],
  controllers: [IpdController],
  providers: [IpdService],
  exports: [IpdService],
})
export class IpdModule {}
