import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drug } from './drug.entity';
import { DrugBatch } from './drug-batch.entity';
import { PharmacySale } from './pharmacy-sale.entity';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Drug, DrugBatch, PharmacySale])],
  controllers: [PharmacyController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
