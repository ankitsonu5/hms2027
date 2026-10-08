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
import { BillingService } from '../billing/billing.service';
import { BillItemCategory } from '../billing/bill.entity';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Drug)
    private readonly drugRepo: Repository<Drug>,

    @InjectRepository(DrugBatch)
    private readonly batchRepo: Repository<DrugBatch>,

    @InjectRepository(PharmacySale)
    private readonly saleRepo: Repository<PharmacySale>,

    private readonly billingService: BillingService,
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
    const { items, patientId, patientName, paymentMode, prescriptionRef, discount = 0, isPaid = true } = dto;

    // Calculate totals from items
    let subtotal = 0;
    let gstAmount = 0;

    for (const item of items) {
      const baseAmount = item.saleRate * item.quantity;
      // We don't apply item-level discounts anymore, we apply the global discount
      const gst = (baseAmount * item.gstPercent) / 100;

      subtotal += baseAmount;
      gstAmount += gst;
    }

    const discountTotal = discount;
    const totalAmount = subtotal + gstAmount - discountTotal;

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
      isPaid,
    });

    const savedSale = await this.saleRepo.save(sale);

    // Integrate with central billing system if it's a registered patient
    if (patientId) {
      try {
        const billItems = items.map(i => ({
          description: i.drugName || 'Pharmacy Item',
          category: BillItemCategory.PHARMACY,
          quantity: i.quantity,
          unitPrice: i.saleRate,
          gst: i.gstPercent,
          discount: 0
        }));

        // Handle flat invoice discount by applying an overall concession percentage
        let concessionPercentage = 0;
        if (discount > 0 && subtotal > 0) {
          concessionPercentage = Number(((discount / (subtotal + gstAmount)) * 100).toFixed(2));
        }

        const bill = await this.billingService.create(tenantId, {
          patientId,
          patientName: patientName || 'Unknown Patient',
          items: billItems,
          concessionPercentage: concessionPercentage > 0 ? concessionPercentage : undefined,
          notes: 'Auto-generated from Pharmacy Sale'
        });

        if (isPaid) {
          await this.billingService.addPayment(tenantId, {
            billId: bill.id,
            amount: Number(totalAmount.toFixed(2)),
            paymentMode: (paymentMode ?? PaymentMode.CASH) as any,
            transactionRef: savedSale.id,
          });
        }
      } catch (err) {
        console.error('Failed to create central bill for pharmacy sale', err);
      }
    }

    return savedSale;
  }

  async deleteSale(tenantId: string, id: string): Promise<void> {
    const sale = await this.saleRepo.findOne({ where: { id, tenantId } });
    if (!sale) {
      throw new NotFoundException(`Sale with id ${id} not found`);
    }
    
    // We could either soft-delete or hard-delete. Let's hard-delete since it's a direct user request to remove an invalid one.
    await this.saleRepo.remove(sale);
  }
}
