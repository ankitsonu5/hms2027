import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTest } from './lab-test.entity';
import { LabOrder } from './lab-order.entity';
import { LabResult } from './lab-result.entity';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { CreateLabResultDto } from './dto/create-lab-result.dto';

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(LabTest)
    private readonly labTestRepo: Repository<LabTest>,
    @InjectRepository(LabOrder)
    private readonly labOrderRepo: Repository<LabOrder>,
    @InjectRepository(LabResult)
    private readonly labResultRepo: Repository<LabResult>,
  ) {}

  // ── Lab Tests ──────────────────────────────────────────────────────────────

  async findAllTests(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    category?: string,
  ): Promise<{ data: LabTest[]; total: number; page: number; limit: number }> {
    const qb = this.labTestRepo
      .createQueryBuilder('t')
      .where('t.tenantId = :tenantId', { tenantId })
      .andWhere('t.isActive = true');

    if (search) {
      qb.andWhere('(t.name ILIKE :search OR t.code ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (category) {
      qb.andWhere('t.category = :category', { category });
    }

    qb.orderBy('t.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async createTest(tenantId: string, dto: CreateLabTestDto): Promise<LabTest> {
    const test = this.labTestRepo.create({ ...dto, tenantId });
    return this.labTestRepo.save(test);
  }

  async updateTest(
    tenantId: string,
    id: string,
    dto: UpdateLabTestDto,
  ): Promise<LabTest> {
    const test = await this.labTestRepo.findOne({
      where: { id: id, tenantId: tenantId, isActive: true },
    });
    if (!test) throw new NotFoundException(`Lab test ${id} not found`);
    Object.assign(test, dto);
    return this.labTestRepo.save(test);
  }

  async removeTest(tenantId: string, id: string): Promise<void> {
    const test = await this.labTestRepo.findOne({
      where: { id: id, tenantId: tenantId, isActive: true },
    });
    if (!test) throw new NotFoundException(`Lab test ${id} not found`);
    test.isActive = false;
    await this.labTestRepo.save(test);
  }

  // ── Lab Orders ─────────────────────────────────────────────────────────────

  async findAllOrders(
    tenantId: string,
    page = 1,
    limit = 20,
    patientId?: string,
    status?: string,
  ): Promise<{
    data: LabOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    const qb = this.labOrderRepo
      .createQueryBuilder('o')
      .where('o.tenantId = :tenantId', { tenantId })
      .andWhere('o.isActive = true');

    if (patientId) {
      qb.andWhere('o.patientId = :patientId', { patientId });
    }

    if (status) {
      qb.andWhere('o.status = :status', { status });
    }

    qb.orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOneOrder(tenantId: string, id: string): Promise<LabOrder> {
    const order = await this.labOrderRepo.findOne({
      where: { id: id, tenantId: tenantId, isActive: true },
    });
    if (!order) throw new NotFoundException(`Lab order ${id} not found`);
    return order;
  }

  async createOrder(
    tenantId: string,
    dto: CreateLabOrderDto,
  ): Promise<LabOrder> {
    const order = this.labOrderRepo.create({ ...dto, tenantId });
    return this.labOrderRepo.save(order);
  }

  async updateOrder(
    tenantId: string,
    id: string,
    dto: UpdateLabOrderDto,
  ): Promise<LabOrder> {
    const order = await this.findOneOrder(tenantId, id);

    if (dto.sampleCollected && !order.sampleCollected) {
      order.sampleCollectedAt = new Date();
    }

    Object.assign(order, dto);
    return this.labOrderRepo.save(order);
  }

  // ── Lab Results ────────────────────────────────────────────────────────────

  async findResultsByOrder(
    tenantId: string,
    orderId: string,
  ): Promise<LabResult[]> {
    return this.labResultRepo.find({
      where: { tenantId: tenantId, orderId: orderId, isActive: true },
      order: { testName: 'ASC' },
    });
  }

  async upsertResult(
    tenantId: string,
    dto: CreateLabResultDto,
  ): Promise<LabResult> {
    const existing = await this.labResultRepo.findOne({
      where: {
        tenantId: tenantId,
        orderId: dto.orderId,
        testId: dto.testId,
      },
    });

    if (existing) {
      Object.assign(existing, dto);
      return this.labResultRepo.save(existing);
    }

    const result = this.labResultRepo.create({ ...dto, tenantId });
    return this.labResultRepo.save(result);
  }
}
