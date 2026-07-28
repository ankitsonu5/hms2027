import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Drug } from './drug.entity';
import { DrugBatch } from './drug-batch.entity';
import { PharmacySale, PaymentMode } from './pharmacy-sale.entity';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { QueryDrugDto } from './dto/query-drug.dto';
import { AddBatchDto } from './dto/add-batch.dto';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Drug)
    private readonly drugRepo: Repository<Drug>,

    @InjectRepository(DrugBatch)
    private readonly batchRepo: Repository<DrugBatch>,

    @InjectRepository(PharmacySale)
    private readonly saleRepo: Repository<PharmacySale>,
  ) {}

  async findAllDrugs(
    tenantId: string,
    query: QueryDrugDto,
  ): Promise<{ data: Drug[]; total: number; page: number; limit: number }> {
    const { search, schedule, page = 1, limit = 20 } = query;

    const where: any = { tenantId, isActive: true };

    if (schedule) {
      where.schedule = schedule;
    }

    let data: Drug[];
    let total: number;

    if (search) {
      [data, total] = await this.drugRepo.findAndCount({
        where: [
          { ...where, genericName: Like(`%${search}%`) },
          { ...where, brandName: Like(`%${search}%`) },
        ],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
    } else {
      [data, total] = await this.drugRepo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
    }

    return { data, total, page, limit };
  }

  async createDrug(tenantId: string, dto: CreateDrugDto): Promise<Drug> {
    const drug = this.drugRepo.create({ ...dto, tenantId });
    return this.drugRepo.save(drug);
  }

  async findDrugById(tenantId: string, id: string): Promise<Drug> {
    const drug = await this.drugRepo.findOne({
      where: { id: id, tenantId: tenantId, isActive: true },
    });
    if (!drug) {
      throw new NotFoundException(`Drug with id ${id} not found`);
    }
    return drug;
  }

  async updateDrug(
    tenantId: string,
    id: string,
    dto: UpdateDrugDto,
  ): Promise<Drug> {
    const drug = await this.findDrugById(tenantId, id);
    Object.assign(drug, dto);
    return this.drugRepo.save(drug);
  }

  async findBatchesByDrug(
    tenantId: string,
    drugId: string,
  ): Promise<DrugBatch[]> {
    return this.batchRepo.find({
      where: { tenantId: tenantId, drugId: drugId, isActive: true },
      order: { expiryDate: 'ASC' },
    });
  }

  async addBatch(tenantId: string, dto: AddBatchDto): Promise<DrugBatch> {
    // Verify the drug exists
    await this.findDrugById(tenantId, dto.drugId);
    const batch = this.batchRepo.create({ ...dto, tenantId });
    return this.batchRepo.save(batch);
  }

  async findAllSales(
    tenantId: string,
    patientId: string | undefined,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: PharmacySale[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = { tenantId, isActive: true };
    if (patientId) {
      where.patientId = patientId;
    }

    const [data, total] = await this.saleRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async createSale(
    tenantId: string,
    dto: CreateSaleDto,
    soldByUserId?: string,
  ): Promise<PharmacySale> {
    const { items, patientId, patientName, paymentMode, prescriptionRef } = dto;

    // Calculate totals from items
    let subtotal = 0;
    let discountTotal = 0;
    let gstAmount = 0;

    for (const item of items) {
      const baseAmount = item.mrp * item.qty;
      const discountAmount = (baseAmount * item.discount) / 100;
      const afterDiscount = baseAmount - discountAmount;
      const gst = (afterDiscount * item.gst) / 100;

      subtotal += baseAmount;
      discountTotal += discountAmount;
      gstAmount += gst;
    }

    const totalAmount = subtotal - discountTotal + gstAmount;

    const sale = this.saleRepo.create({
      tenantId,
      patientId,
      patientName,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMode: paymentMode ?? PaymentMode.CASH,
      prescriptionRef,
      soldByUserId,
      isPaid: true,
    });

    return this.saleRepo.save(sale);
  }
}
