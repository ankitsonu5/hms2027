import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationRate } from './entities/organization-rate.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(OrganizationRate)
    private rateRepo: Repository<OrganizationRate>,
  ) {}

  async findAll(tenantId: string) {
    return this.orgRepo.find({ where: { tenantId, isActive: true } });
  }

  async findOne(tenantId: string, id: string) {
    const org = await this.orgRepo.findOne({ where: { id, tenantId, isActive: true } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async create(tenantId: string, data: any) {
    const org = this.orgRepo.create({ ...data, tenantId });
    return this.orgRepo.save(org);
  }

  async getRates(tenantId: string, organizationId: string) {
    return this.rateRepo.find({ where: { tenantId, organizationId } });
  }

  async upsertRate(tenantId: string, organizationId: string, data: { testId: string; customPrice: number }) {
    let rate = await this.rateRepo.findOne({ where: { tenantId, organizationId, testId: data.testId } });
    if (rate) {
      rate.customPrice = data.customPrice;
    } else {
      rate = this.rateRepo.create({ tenantId, organizationId, testId: data.testId, customPrice: data.customPrice });
    }
    return this.rateRepo.save(rate);
  }
}
