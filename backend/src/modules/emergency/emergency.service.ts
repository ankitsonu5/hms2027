import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emergency } from './emergency.entity';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { QueryEmergencyDto } from './dto/query-emergency.dto';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectRepository(Emergency)
    private readonly repo: Repository<Emergency>,
  ) {}

  async findAll(
    tenantId: string,
    query: QueryEmergencyDto,
  ): Promise<{
    data: Emergency[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { triageTag, disposition, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (triageTag) where['triageTag'] = triageTag;
    if (disposition) where['disposition'] = disposition;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string): Promise<Emergency> {
    const record = await this.repo.findOne({
      where: { id: id, tenantId: tenantId, isActive: true },
    });
    if (!record) {
      throw new NotFoundException(`Emergency record ${id} not found`);
    }
    return record;
  }

  async create(tenantId: string, dto: CreateEmergencyDto): Promise<Emergency> {
    const entity = this.repo.create({
      ...(dto as unknown as Partial<Emergency>),
      tenantId,
    });
    return this.repo.save(entity);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateEmergencyDto,
  ): Promise<Emergency> {
    const record = await this.findOne(tenantId, id);
    Object.assign(record, dto);
    return this.repo.save(record);
  }

  async remove(tenantId: string, id: string): Promise<{ success: boolean }> {
    const record = await this.findOne(tenantId, id);
    record.isActive = false;
    await this.repo.save(record);
    return { success: true };
  }
}
