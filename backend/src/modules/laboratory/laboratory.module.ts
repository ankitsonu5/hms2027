import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabTest } from './lab-test.entity';
import { LabOrder } from './lab-order.entity';
import { LabResult } from './lab-result.entity';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabTest, LabOrder, LabResult])],
  controllers: [LaboratoryController],
  providers: [LaboratoryService],
  exports: [LaboratoryService],
})
export class LaboratoryModule {}
