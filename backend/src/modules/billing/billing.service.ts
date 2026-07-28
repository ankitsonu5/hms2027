import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill, BillItem, BillStatus } from './bill.entity';
import { Payment } from './payment.entity';
import { CreateBillDto, BillItemDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { QueryBillDto } from './dto/query-bill.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill) private bills: Repository<Bill>,
    @InjectRepository(Payment) private payments: Repository<Payment>,
  ) {}

  async generateBillNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.bills.count({ where: { tenantId } });
    const sequence = String(count + 1).padStart(5, '0');
    return `BILL-${year}-${sequence}`;
  }

  calculateTotals(items: BillItemDto[]): {
    subtotal: number;
    discountTotal: number;
    gstTotal: number;
    grandTotal: number;
  } {
    let subtotal = 0;
    let discountTotal = 0;
    let gstTotal = 0;

    for (const item of items) {
      const lineBase = item.quantity * item.unitPrice;
      const lineDiscount = item.discount ?? 0;
      const lineGst = item.gst ?? 0;

      subtotal += lineBase;
      discountTotal += lineDiscount;
      gstTotal += lineGst;
    }

    const grandTotal = subtotal - discountTotal + gstTotal;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountTotal: parseFloat(discountTotal.toFixed(2)),
      gstTotal: parseFloat(gstTotal.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }

  private mapItemsWithAmount(items: BillItemDto[]): BillItem[] {
    return items.map((item) => {
      const lineBase = item.quantity * item.unitPrice;
      const lineDiscount = item.discount ?? 0;
      const lineGst = item.gst ?? 0;
      const amount = parseFloat((lineBase - lineDiscount + lineGst).toFixed(2));
      return {
        description: item.description,
        category: item.category as any,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        gst: item.gst,
        amount,
      };
    });
  }

  async findAll(
    tenantId: string,
    query: QueryBillDto,
  ): Promise<{ data: Bill[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.bills
      .createQueryBuilder('bill')
      .where('bill.tenantId = :tenantId', { tenantId })
      .andWhere('bill.isActive = true');

    if (query.status) {
      qb.andWhere('bill.status = :status', { status: query.status });
    }

    if (query.patientId) {
      qb.andWhere('bill.patientId = :patientId', {
        patientId: query.patientId,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('bill.billDate >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('bill.billDate <= :dateTo', { dateTo: query.dateTo });
    }

    const [data, total] = await qb
      .orderBy('bill.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string): Promise<Bill> {
    const bill = await this.bills.findOne({
      where: { id, tenantId, isActive: true },
    });
    if (!bill) {
      throw new NotFoundException(`Bill with id ${id} not found`);
    }
    return bill;
  }

  async create(tenantId: string, dto: CreateBillDto): Promise<Bill> {
    const billNumber = await this.generateBillNumber(tenantId);
    const { subtotal, discountTotal, gstTotal, grandTotal } =
      this.calculateTotals(dto.items);
    const mappedItems = this.mapItemsWithAmount(dto.items);

    const bill = this.bills.create({
      tenantId,
      patientId: dto.patientId,
      patientName: dto.patientName,
      billNumber,
      items: mappedItems,
      subtotal,
      discountTotal,
      gstTotal,
      grandTotal,
      balanceAmount: grandTotal,
      paidAmount: 0,
      notes: dto.notes,
      encounterId: dto.encounterId,
      admissionId: dto.admissionId,
      dueDate: dto.dueDate,
      status: BillStatus.DRAFT,
    });

    return this.bills.save(bill);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateBillDto,
  ): Promise<Bill> {
    const bill = await this.findOne(tenantId, id);

    if (dto.items) {
      const { subtotal, discountTotal, gstTotal, grandTotal } =
        this.calculateTotals(dto.items);
      const mappedItems = this.mapItemsWithAmount(dto.items);
      bill.items = mappedItems;
      bill.subtotal = subtotal;
      bill.discountTotal = discountTotal;
      bill.gstTotal = gstTotal;
      bill.grandTotal = grandTotal;
      bill.balanceAmount = parseFloat(
        (grandTotal - Number(bill.paidAmount)).toFixed(2),
      );
    }

    const { items: _items, ...rest } = dto;
    Object.assign(bill, rest);

    return this.bills.save(bill);
  }

  async addPayment(tenantId: string, dto: AddPaymentDto): Promise<Payment> {
    const bill = await this.findOne(tenantId, dto.billId);

    if (bill.status === BillStatus.CANCELLED) {
      throw new BadRequestException('Cannot add payment to a cancelled bill');
    }

    const payment = this.payments.create({
      tenantId,
      billId: dto.billId,
      amount: dto.amount,
      paymentMode: dto.paymentMode,
      transactionRef: dto.transactionRef,
    });

    await this.payments.save(payment);

    const newPaidAmount = parseFloat(
      (Number(bill.paidAmount) + dto.amount).toFixed(2),
    );
    const newBalanceAmount = parseFloat(
      (Number(bill.grandTotal) - newPaidAmount).toFixed(2),
    );

    bill.paidAmount = newPaidAmount;
    bill.balanceAmount = newBalanceAmount;
    bill.paymentMode = dto.paymentMode;
    bill.status = newBalanceAmount <= 0 ? BillStatus.PAID : BillStatus.PARTIAL;

    await this.bills.save(bill);

    return payment;
  }

  async cancel(tenantId: string, id: string): Promise<Bill> {
    const bill = await this.findOne(tenantId, id);
    bill.status = BillStatus.CANCELLED;
    return this.bills.save(bill);
  }
}
