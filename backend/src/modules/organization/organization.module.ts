import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import { OrganizationRate } from './entities/organization-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationRate])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
