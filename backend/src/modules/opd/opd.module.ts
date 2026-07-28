import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpdEncounter } from './opd-encounter.entity';
import { Patient } from '../patient/patient.entity';
import { OpdService } from './opd.service';
import { OpdController } from './opd.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OpdEncounter, Patient])],
  controllers: [OpdController],
  providers: [OpdService],
  exports: [OpdService],
})
export class OpdModule {}
