import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabTest } from './lab-test.entity';
import { LabOrder } from './lab-order.entity';
import { LabResult } from './lab-result.entity';
import { LabTestParameter } from './lab-test-parameter.entity';
import { LabReferenceRange } from './lab-reference-range.entity';
import { LabMaster } from './lab-master.entity';
import { TestMasterService } from './test-master.service';
import { LabReportSetting } from './lab-report-setting.entity';
import { LabReportService } from './lab-report.service';
import { Patient } from '../patient/patient.entity';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabTest, LabOrder, LabResult, LabTestParameter, LabReferenceRange, LabMaster, LabReportSetting, Patient])],
  controllers: [LaboratoryController],
  providers: [LaboratoryService, TestMasterService, LabReportService],
  exports: [LaboratoryService, TestMasterService],
})
export class LaboratoryModule {}
