import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phlebotomist } from './entities/phlebotomist.entity';

@Injectable()
export class PhlebotomistService {
  constructor(
    @InjectRepository(Phlebotomist)
    private phleboRepo: Repository<Phlebotomist>,
  ) {}

  async findAll(tenantId: string) {
    return this.phleboRepo.find({
      where: { tenantId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const phlebo = await this.phleboRepo.findOne({
      where: { id, tenantId, isActive: true },
    });
    if (!phlebo) throw new NotFoundException('Phlebotomist not found');
    return phlebo;
  }

  async create(tenantId: string, data: any) {
    const phlebo = this.phleboRepo.create({
      ...data,
      tenantId,
      todayCollections: Number(data.todayCollections || 0),
      maxDailyCapacity: Number(data.maxDailyCapacity || 15),
      rating: Number(data.rating || 5.0),
    });
    return this.phleboRepo.save(phlebo);
  }

  async update(tenantId: string, id: string, data: any) {
    const phlebo = await this.findOne(tenantId, id);
    Object.assign(phlebo, data);
    return this.phleboRepo.save(phlebo);
  }

  async remove(tenantId: string, id: string) {
    const phlebo = await this.findOne(tenantId, id);
    phlebo.isActive = false;
    await this.phleboRepo.save(phlebo);
    return { success: true, message: 'Phlebotomist deleted' };
  }
}
