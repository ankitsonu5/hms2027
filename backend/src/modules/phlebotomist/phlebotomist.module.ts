import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phlebotomist } from './entities/phlebotomist.entity';
import { PhlebotomistService } from './phlebotomist.service';
import { PhlebotomistController } from './phlebotomist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Phlebotomist])],
  controllers: [PhlebotomistController],
  providers: [PhlebotomistService],
  exports: [PhlebotomistService],
})
export class PhlebotomistModule {}
