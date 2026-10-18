import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SmartReportSetting } from './entities/smart-report-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmartReportSetting])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

