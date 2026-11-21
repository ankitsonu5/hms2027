import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ward } from './ward.entity';
import { Bed, BedStatus } from './bed.entity';
import { IpdAdmission, AdmissionStatus } from './ipd-admission.entity';
import { Bill, BillItem, BillStatus, BillItemCategory } from '../billing/bill.entity';
import { Payment, PaymentMode } from '../billing/payment.entity';
import { CreateWardDto } from './dto/create-ward.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { QueryAdmissionDto } from './dto/query-admission.dto';

@Injectable()
export class IpdService {
  constructor(
    @InjectRepository(Ward) private wardRepo: Repository<Ward>,
    @InjectRepository(Bed) private bedRepo: Repository<Bed>,
    @InjectRepository(IpdAdmission)
    private admissionRepo: Repository<IpdAdmission>,
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ─── Wards ───────────────────────────────────────────────────────────────────

  async findAllWards(tenantId: string): Promise<Ward[]> {
    return this.wardRepo.find({
      where: { tenantId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createWard(tenantId: string, dto: CreateWardDto): Promise<Ward> {
    const ward = this.wardRepo.create({ ...dto, tenantId });
    const saved = await this.wardRepo.save(ward);

    if (dto.totalBeds && dto.totalBeds > 0) {
      const words = saved.name.split(' ').filter(Boolean);
      const prefix =
        words.length > 1
          ? (words[0][0] + words[1][0]).toUpperCase()
          : saved.name.slice(0, 3).toUpperCase();

      for (let i = 1; i <= dto.totalBeds; i++) {
        const bedNumber = `${prefix}-${String(i).padStart(2, '0')}`;
        const bed = this.bedRepo.create({
          tenantId,
          wardId: saved.id,
          wardName: saved.name,
          bedNumber,
          status: BedStatus.VACANT,
        });
        await this.bedRepo.save(bed);
      }
    }
    return saved;
  }

  async deleteWard(tenantId: string, id: string): Promise<void> {
    const ward = await this.wardRepo.findOne({ where: { id, tenantId } });
    if (ward) {
      ward.isActive = false;
      await this.wardRepo.save(ward);
      await this.bedRepo.update({ wardId: id, tenantId }, { isActive: false });
    }
  }

  // ─── Beds ─────────────────────────────────────────────────────────────────────

  async findAllBeds(
    tenantId: string,
    wardId?: string,
    status?: BedStatus,
  ): Promise<any[]> {
    try {
      let sql = `
        SELECT
          b.id AS id,
          b."tenantId" AS "tenantId",
          b."wardId" AS "wardId",
          b."wardName" AS "wardName",
          b."bedNumber" AS "bedNumber",
          b.status AS status,
          b."currentAdmissionId" AS "currentAdmissionId",
          b."isActive" AS "isActive",
          b."createdAt" AS "createdAt",
          b."updatedAt" AS "updatedAt",
          a.id AS "admissionId",
          a."admissionNumber" AS "admissionNumber",
          a."admittingDoctorName" AS "admittingDoctorName",
          a."admissionDate" AS "admissionDate",
          a.diagnosis AS "diagnosis",
          TRIM(CONCAT(p."firstName", ' ', COALESCE(p."lastName", ''))) AS "patientName",
          p.uhid AS "patientUhid",
          p.phone AS "patientPhone"
        FROM beds b
        LEFT JOIN ipd_admissions a ON a.id::text = b."currentAdmissionId"::text
        LEFT JOIN patients p ON (p.id::text = a."patientId"::text OR p.uhid = a."patientId")
        WHERE b."tenantId" = $1 AND b."isActive" = true
      `;
      const params: any[] = [tenantId];

      if (wardId) {
        params.push(wardId);
        sql += ` AND b."wardId"::text = $${params.length}::text`;
      }
      if (status) {
        params.push(status);
        sql += ` AND b.status::text = $${params.length}::text`;
      }

      sql += ` ORDER BY b."wardId" ASC, b."bedNumber" ASC`;

      return await this.dataSource.query(sql, params);
    } catch (err: any) {
      throw err;
    }
  }

  async createBed(
    tenantId: string,
    dto: { wardId: string; bedNumber: string; status?: BedStatus },
  ): Promise<Bed> {
    const ward = await this.wardRepo.findOne({
      where: { id: dto.wardId, tenantId, isActive: true },
    });
    if (!ward) throw new NotFoundException(`Ward ${dto.wardId} not found`);

    const bed = this.bedRepo.create({
      tenantId,
      wardId: ward.id,
      wardName: ward.name,
      bedNumber: dto.bedNumber,
      status: dto.status || BedStatus.VACANT,
    });
    return this.bedRepo.save(bed);
  }

  async deleteBed(tenantId: string, id: string): Promise<void> {
    const bed = await this.bedRepo.findOne({ where: { id, tenantId } });
    if (bed) {
      bed.isActive = false;
      await this.bedRepo.save(bed);
    }
  }

  async updateBedStatus(
    tenantId: string,
    bedId: string,
    status: BedStatus,
    admissionId?: string | null,
  ): Promise<Bed> {
    const bed = await this.bedRepo.findOne({
      where: { id: bedId, tenantId, isActive: true },
    });
    if (!bed) throw new NotFoundException(`Bed ${bedId} not found`);

    bed.status = status;
    bed.currentAdmissionId = admissionId ?? null;
    return this.bedRepo.save(bed);
  }

  // ─── Admissions ───────────────────────────────────────────────────────────────

  async findAllAdmissions(
    tenantId: string,
    query: QueryAdmissionDto,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, wardId, doctorId, patientId, page = 1, limit = 50 } = query;

    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'a.id AS id',
        'a."tenantId" AS "tenantId"',
        'a."patientId" AS "patientId"',
        'a."admissionNumber" AS "admissionNumber"',
        'a."wardId" AS "wardId"',
        'a."wardName" AS "wardName"',
        'a."bedId" AS "bedId"',
        'a."bedNumber" AS "bedNumber"',
        'a."admittingDoctorId" AS "admittingDoctorId"',
        'a."admittingDoctorName" AS "admittingDoctorName"',
        'a."admissionDate" AS "admissionDate"',
        'a."expectedDischargeDate" AS "expectedDischargeDate"',
        'a."actualDischargeDate" AS "actualDischargeDate"',
        'a."diagnosis" AS "diagnosis"',
        'a."admissionReason" AS "admissionReason"',
        'a."diet" AS "diet"',
        'a."allergies" AS "allergies"',
        'a."attendantName" AS "attendantName"',
        'a."attendantPhone" AS "attendantPhone"',
        'a."attendantRelation" AS "attendantRelation"',
        'a."depositAmount" AS "depositAmount"',
        'a.status AS status',
        'a."dischargeSummary" AS "dischargeSummary"',
        'a."dischargeCondition" AS "dischargeCondition"',
        'a.vitals AS vitals',
        'a."clinicalNotes" AS "clinicalNotes"',
        'a."createdAt" AS "createdAt"',
        `TRIM(CONCAT(p."firstName", ' ', COALESCE(p."lastName", ''))) AS "patientName"`,
        'p.uhid AS "patientUhid"',
        'p.phone AS "patientPhone"',
        'p.gender AS "patientGender"',
        'p.dob AS "patientDob"',
        'p.city AS "patientCity"',
        'p."bloodGroup" AS "patientBloodGroup"',
        'w."dailyRate" AS "wardDailyRate"',
        'b.id AS "billId"',
        'b."billNumber" AS "billNumber"',
        'b."grandTotal" AS "billGrandTotal"',
        'b."paidAmount" AS "billPaidAmount"',
        'b."balanceAmount" AS "billBalanceAmount"',
        'b.status AS "billStatus"',
      ])
      .from('ipd_admissions', 'a')
      .leftJoin(
        'patients',
        'p',
        'p.id::text = a."patientId"::text OR p.uhid = a."patientId"',
      )
      .leftJoin('wards', 'w', 'w.id::text = a."wardId"::text')
      .leftJoin('bills', 'b', 'b."admissionId"::text = a.id::text AND b."isActive" = true')
      .where('a."tenantId" = :tenantId AND a."isActive" = true', { tenantId });

    if (status) qb.andWhere('a.status = :status', { status });
    if (wardId) qb.andWhere('a."wardId" = :wardId', { wardId });
    if (doctorId) qb.andWhere('a."admittingDoctorId" = :doctorId', { doctorId });
    if (patientId)
      qb.andWhere('(a."patientId" = :patientId OR p.uhid = :patientId)', {
        patientId,
      });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('a."admissionDate"', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return { data, total, page, limit };
  }

  async findOneAdmission(tenantId: string, id: string): Promise<any> {
    const raw = await this.dataSource
      .createQueryBuilder()
      .select([
        'a.*',
        `TRIM(CONCAT(p."firstName", ' ', COALESCE(p."lastName", ''))) AS "patientName"`,
        'p.uhid AS "patientUhid"',
        'p.phone AS "patientPhone"',
        'p.gender AS "patientGender"',
        'p.dob AS "patientDob"',
        'p.city AS "patientCity"',
        'p.address AS "patientAddress"',
        'p."bloodGroup" AS "patientBloodGroup"',
        'w."dailyRate" AS "wardDailyRate"',
        'b.id AS "billId"',
        'b."billNumber" AS "billNumber"',
        'b."grandTotal" AS "billGrandTotal"',
        'b."paidAmount" AS "billPaidAmount"',
        'b."balanceAmount" AS "billBalanceAmount"',
        'b.status AS "billStatus"',
      ])
      .from('ipd_admissions', 'a')
      .leftJoin(
        'patients',
        'p',
        'p.id::text = a."patientId"::text OR p.uhid = a."patientId"',
      )
      .leftJoin('wards', 'w', 'w.id::text = a."wardId"::text')
      .leftJoin('bills', 'b', 'b."admissionId"::text = a.id::text AND b."isActive" = true')
      .where('a.id::text = :id AND a."tenantId" = :tenantId AND a."isActive" = true', {
        id,
        tenantId,
      })
      .getRawOne();

    if (!raw) throw new NotFoundException(`Admission ${id} not found`);
    return raw;
  }

  async createAdmission(
    tenantId: string,
    dto: CreateAdmissionDto,
  ): Promise<IpdAdmission> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify bed is available using pessimistic write lock
      const bed = await queryRunner.manager.findOne(Bed, {
        where: { id: dto.bedId, tenantId, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!bed) throw new NotFoundException(`Bed ${dto.bedId} not found`);
      if (bed.status !== BedStatus.VACANT) {
        throw new BadRequestException(
          `Bed ${bed.bedNumber} is not vacant (current status: ${bed.status})`,
        );
      }

      // 2. Get ward for denormalization & daily tariff
      const ward = await queryRunner.manager.findOne(Ward, {
        where: { id: dto.wardId, tenantId, isActive: true },
      });
      if (!ward) throw new NotFoundException(`Ward ${dto.wardId} not found`);

      // 3. Generate admission number: ADM-YYYY-NNNNN
      const year = new Date().getFullYear();
      const count = await queryRunner.manager.count(IpdAdmission, {
        where: { tenantId },
      });
      const seq = String(count + 1).padStart(5, '0');
      const admissionNumber = `ADM-${year}-${seq}`;

      // 4. Save admission
      const admission = queryRunner.manager.create(IpdAdmission, {
        ...dto,
        tenantId,
        admissionNumber,
        wardName: ward.name,
        bedNumber: bed.bedNumber,
        status: AdmissionStatus.ACTIVE,
        vitals: [],
        clinicalNotes: [
          {
            timestamp: new Date().toISOString(),
            doctorName: dto.admittingDoctorName || 'Admitting Consultant',
            note: `Initial admission to ${ward.name} (${bed.bedNumber}). Diagnosis: ${dto.diagnosis || 'Provisional assessment pending'}.`,
            type: 'ADMISSION',
          },
        ],
      });
      const saved = await queryRunner.manager.save(IpdAdmission, admission);

      // 5. Mark bed as OCCUPIED
      bed.status = BedStatus.OCCUPIED;
      bed.currentAdmissionId = saved.id;
      await queryRunner.manager.save(Bed, bed);

      // 6. Generate official IPD bill in bills table so it appears in Billing History!
      let patientName = 'Inpatient';
      try {
        const patientRow = await queryRunner.manager.query(
          `SELECT "firstName", "lastName" FROM patients WHERE (id::text = $1 OR uhid = $1) AND "tenantId" = $2 LIMIT 1`,
          [dto.patientId, tenantId],
        );
        if (patientRow && patientRow.length > 0) {
          patientName =
            `${patientRow[0].firstName || ''} ${patientRow[0].lastName || ''}`.trim() ||
            'Inpatient';
        }
      } catch (err) {
        console.error('Error fetching patient name for IPD bill:', err);
      }

      const billCount = await queryRunner.manager.count(Bill, {
        where: { tenantId },
      });
      const billSeq = String(billCount + 1).padStart(5, '0');
      const billNumber = `BILL-${year}-${billSeq}`;

      const dailyRate = Number(ward.dailyRate) || 500;
      const deposit = Number(dto.depositAmount) || 0;

      const items: BillItem[] = [
        {
          description: `Bed & Room Tariff - ${ward.name} (${bed.bedNumber})`,
          category: BillItemCategory.BED,
          quantity: 1,
          unitPrice: dailyRate,
          discount: 0,
          gst: 0,
          amount: dailyRate,
        },
        {
          description: `IPD Admission & File Maintenance Charge`,
          category: BillItemCategory.OTHER,
          quantity: 1,
          unitPrice: 500,
          discount: 0,
          gst: 0,
          amount: 500,
        },
      ];

      if (dto.admittingDoctorName) {
        items.push({
          description: `Initial Consultant Evaluation - ${dto.admittingDoctorName}`,
          category: BillItemCategory.CONSULTATION,
          quantity: 1,
          unitPrice: 1000,
          discount: 0,
          gst: 0,
          amount: 1000,
        });
      }

      const initialChargesSum = items.reduce((s, it) => s + it.amount, 0);
      const grandTotal =
        deposit > initialChargesSum ? deposit : initialChargesSum;
      const paidAmount = deposit;
      const balanceAmount = Math.max(
        0,
        parseFloat((grandTotal - paidAmount).toFixed(2)),
      );
      const billStatus =
        balanceAmount <= 0
          ? BillStatus.PAID
          : paidAmount > 0
            ? BillStatus.PARTIAL
            : BillStatus.PENDING;

      const bill = queryRunner.manager.create(Bill, {
        tenantId,
        patientId: dto.patientId,
        patientName,
        billNumber,
        billDate: new Date().toISOString().slice(0, 10),
        items,
        subtotal: grandTotal,
        discountTotal: 0,
        gstTotal: 0,
        grandTotal,
        paidAmount,
        balanceAmount,
        status: billStatus,
        admissionId: saved.id,
        notes: `IPD Inpatient Bill - Admission: ${admissionNumber}, Ward: ${ward.name}, Bed: ${bed.bedNumber}`,
      });
      const savedBill = await queryRunner.manager.save(Bill, bill);

      if (deposit > 0) {
        const payment = queryRunner.manager.create(Payment, {
          tenantId,
          billId: savedBill.id,
          amount: deposit,
          paymentMode: PaymentMode.CASH,
          transactionRef: `DEP-${admissionNumber}`,
        });
        await queryRunner.manager.save(Payment, payment);
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateAdmission(
    tenantId: string,
    id: string,
    dto: UpdateAdmissionDto,
  ): Promise<IpdAdmission> {
    const admission = await this.admissionRepo.findOne({
      where: { id, tenantId, isActive: true },
    });
    if (!admission) throw new NotFoundException(`Admission ${id} not found`);
    Object.assign(admission, dto);
    return this.admissionRepo.save(admission);
  }

  async transferBed(
    tenantId: string,
    admissionId: string,
    dto: { targetWardId: string; targetBedId: string; reason?: string },
  ): Promise<IpdAdmission> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const admission = await queryRunner.manager.findOne(IpdAdmission, {
        where: { id: admissionId, tenantId, isActive: true },
      });
      if (!admission)
        throw new NotFoundException(`Admission ${admissionId} not found`);
      if (admission.status !== AdmissionStatus.ACTIVE) {
        throw new BadRequestException(
          'Only active admissions can be transferred',
        );
      }

      const targetBed = await queryRunner.manager.findOne(Bed, {
        where: { id: dto.targetBedId, tenantId, isActive: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!targetBed)
        throw new NotFoundException(`Target Bed ${dto.targetBedId} not found`);
      if (targetBed.status !== BedStatus.VACANT) {
        throw new BadRequestException(
          `Target Bed ${targetBed.bedNumber} is not vacant (${targetBed.status})`,
        );
      }

      const targetWard = await queryRunner.manager.findOne(Ward, {
        where: { id: dto.targetWardId, tenantId, isActive: true },
      });
      if (!targetWard)
        throw new NotFoundException(
          `Target Ward ${dto.targetWardId} not found`,
        );

      // 1. Release previous bed to CLEANING
      if (admission.bedId) {
        const oldBed = await queryRunner.manager.findOne(Bed, {
          where: { id: admission.bedId, tenantId },
        });
        if (oldBed) {
          oldBed.status = BedStatus.CLEANING;
          oldBed.currentAdmissionId = null;
          await queryRunner.manager.save(Bed, oldBed);
        }
      }

      const prevWardName = admission.wardName;
      const prevBedNumber = admission.bedNumber;

      // 2. Assign target bed
      targetBed.status = BedStatus.OCCUPIED;
      targetBed.currentAdmissionId = admission.id;
      await queryRunner.manager.save(Bed, targetBed);

      // 3. Update admission details
      admission.wardId = targetWard.id;
      admission.wardName = targetWard.name;
      admission.bedId = targetBed.id;
      admission.bedNumber = targetBed.bedNumber;

      const notes = Array.isArray(admission.clinicalNotes)
        ? admission.clinicalNotes
        : [];
      notes.push({
        timestamp: new Date().toISOString(),
        doctorName: admission.admittingDoctorName || 'Attending Staff',
        note: `Bed transferred from ${prevWardName} (${prevBedNumber}) to ${targetWard.name} (${targetBed.bedNumber}). ${dto.reason ? 'Reason: ' + dto.reason : ''}`,
        type: 'BED_TRANSFER',
      });
      admission.clinicalNotes = notes;

      const saved = await queryRunner.manager.save(IpdAdmission, admission);

      // 4. Update bill notes or append transfer item
      const bill = await queryRunner.manager.findOne(Bill, {
        where: { admissionId, tenantId, isActive: true },
      });
      if (bill) {
        bill.notes = `${bill.notes || ''} | Transferred to ${targetWard.name} (${targetBed.bedNumber})`;
        await queryRunner.manager.save(Bill, bill);
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addVitals(
    tenantId: string,
    admissionId: string,
    vitalsData: any,
  ): Promise<IpdAdmission> {
    const admission = await this.admissionRepo.findOne({
      where: { id: admissionId, tenantId, isActive: true },
    });
    if (!admission)
      throw new NotFoundException(`Admission ${admissionId} not found`);

    const currentVitals = Array.isArray(admission.vitals)
      ? admission.vitals
      : [];
    currentVitals.push({
      timestamp: new Date().toISOString(),
      ...vitalsData,
    });
    admission.vitals = currentVitals;
    return this.admissionRepo.save(admission);
  }

  async addClinicalNote(
    tenantId: string,
    admissionId: string,
    noteData: any,
  ): Promise<IpdAdmission> {
    const admission = await this.admissionRepo.findOne({
      where: { id: admissionId, tenantId, isActive: true },
    });
    if (!admission)
      throw new NotFoundException(`Admission ${admissionId} not found`);

    const currentNotes = Array.isArray(admission.clinicalNotes)
      ? admission.clinicalNotes
      : [];
    currentNotes.push({
      timestamp: new Date().toISOString(),
      ...noteData,
    });
    admission.clinicalNotes = currentNotes;
    return this.admissionRepo.save(admission);
  }

  // ─── IPD Bill Management ──────────────────────────────────────────────────────

  async getAdmissionBill(tenantId: string, admissionId: string): Promise<Bill> {
    let bill = await this.billRepo.findOne({
      where: { tenantId, admissionId, isActive: true },
    });

    if (!bill) {
      const admission = await this.findOneAdmission(tenantId, admissionId);
      const billCount = await this.billRepo.count({ where: { tenantId } });
      const year = new Date().getFullYear();
      const billSeq = String(billCount + 1).padStart(5, '0');
      const billNumber = `BILL-${year}-${billSeq}`;
      const dailyRate = Number(admission.wardDailyRate) || 500;
      const deposit = Number(admission.depositAmount) || 0;

      const items: BillItem[] = [
        {
          description: `Bed & Room Tariff - ${admission.wardName} (${admission.bedNumber})`,
          category: BillItemCategory.BED,
          quantity: 1,
          unitPrice: dailyRate,
          discount: 0,
          gst: 0,
          amount: dailyRate,
        },
      ];
      const grandTotal = deposit > dailyRate ? deposit : dailyRate;
      const paidAmount = deposit;
      const balanceAmount = Math.max(0, grandTotal - paidAmount);

      bill = this.billRepo.create({
        tenantId,
        patientId: admission.patientId,
        patientName: admission.patientName || 'Inpatient',
        billNumber,
        billDate: new Date().toISOString().slice(0, 10),
        items,
        subtotal: grandTotal,
        discountTotal: 0,
        gstTotal: 0,
        grandTotal,
        paidAmount,
        balanceAmount,
        status:
          balanceAmount <= 0
            ? BillStatus.PAID
            : paidAmount > 0
              ? BillStatus.PARTIAL
              : BillStatus.PENDING,
        admissionId: admission.id,
        notes: `IPD Inpatient Bill - ${admission.admissionNumber}`,
      });
      bill = await this.billRepo.save(bill);
    }
    return bill;
  }

  async updateAdmissionBill(
    tenantId: string,
    admissionId: string,
    dto: any,
  ): Promise<Bill> {
    const bill = await this.getAdmissionBill(tenantId, admissionId);

    if (dto.items && Array.isArray(dto.items)) {
      bill.items = dto.items.map((it: any) => ({
        description: it.description || 'Service',
        category: it.category || BillItemCategory.OTHER,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        discount: Number(it.discount) || 0,
        gst: Number(it.gst) || 0,
        amount: parseFloat(
          (
            (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0) -
            (Number(it.discount) || 0) +
            (Number(it.gst) || 0)
          ).toFixed(2),
        ),
      }));

      const sum = bill.items.reduce((s: number, it: any) => s + it.amount, 0);
      bill.subtotal = sum;
      bill.grandTotal = sum;
    }

    if (dto.grandTotal !== undefined && !dto.items) {
      bill.grandTotal = parseFloat(Number(dto.grandTotal).toFixed(2));
      bill.subtotal = bill.grandTotal;
    }

    if (dto.paidAmount !== undefined) {
      bill.paidAmount = parseFloat(Number(dto.paidAmount).toFixed(2));
    }

    if (dto.notes !== undefined) {
      bill.notes = dto.notes;
    }

    const grand = Number(bill.grandTotal) || 0;
    const paid = Number(bill.paidAmount) || 0;
    bill.balanceAmount = Math.max(0, parseFloat((grand - paid).toFixed(2)));
    bill.status =
      bill.balanceAmount <= 0
        ? BillStatus.PAID
        : paid > 0
          ? BillStatus.PARTIAL
          : BillStatus.PENDING;

    return this.billRepo.save(bill);
  }

  // ─── Discharge ────────────────────────────────────────────────────────────────

  async dischargePatient(
    tenantId: string,
    id: string,
    dto?: { dischargeSummary?: string; dischargeCondition?: string },
  ): Promise<IpdAdmission> {
    const admission = await this.admissionRepo.findOne({
      where: { id, tenantId, isActive: true },
    });
    if (!admission) throw new NotFoundException(`Admission ${id} not found`);

    if (admission.status === AdmissionStatus.DISCHARGED) {
      throw new BadRequestException('Patient is already discharged');
    }

    // 1. Set discharge details
    admission.actualDischargeDate = new Date();
    admission.status = AdmissionStatus.DISCHARGED;
    if (dto?.dischargeSummary) admission.dischargeSummary = dto.dischargeSummary;
    if (dto?.dischargeCondition)
      admission.dischargeCondition = dto.dischargeCondition;

    const notes = Array.isArray(admission.clinicalNotes)
      ? admission.clinicalNotes
      : [];
    notes.push({
      timestamp: new Date().toISOString(),
      doctorName: admission.admittingDoctorName || 'Discharging Doctor',
      note: `Patient discharged. Condition: ${dto?.dischargeCondition || 'Stable'}. ${dto?.dischargeSummary || ''}`,
      type: 'DISCHARGE',
    });
    admission.clinicalNotes = notes;

    const discharged = await this.admissionRepo.save(admission);

    // 2. Release the bed — set to CLEANING
    if (admission.bedId) {
      const bed = await this.bedRepo.findOne({
        where: { id: admission.bedId, tenantId },
      });
      if (bed) {
        bed.status = BedStatus.CLEANING;
        bed.currentAdmissionId = null;
        await this.bedRepo.save(bed);
      }
    }

    // 3. Synchronize IPD Bill days of stay
    try {
      const bill = await this.billRepo.findOne({
        where: { tenantId, admissionId: id, isActive: true },
      });
      if (bill && Array.isArray(bill.items)) {
        const days = Math.max(
          1,
          Math.ceil(
            (new Date().getTime() -
              new Date(admission.admissionDate).getTime()) /
              (1000 * 3600 * 24),
          ),
        );
        let updatedItems = false;
        bill.items = bill.items.map((it) => {
          if (it.category === BillItemCategory.BED) {
            it.quantity = days;
            it.amount = parseFloat((days * Number(it.unitPrice)).toFixed(2));
            updatedItems = true;
          }
          return it;
        });
        if (updatedItems) {
          const sum = bill.items.reduce((s, it) => s + it.amount, 0);
          bill.subtotal = sum;
          bill.grandTotal = sum;
          bill.balanceAmount = Math.max(
            0,
            parseFloat((sum - Number(bill.paidAmount)).toFixed(2)),
          );
          bill.status =
            bill.balanceAmount <= 0 ? BillStatus.PAID : BillStatus.PARTIAL;
          await this.billRepo.save(bill);
        }
      }
    } catch (err) {
      console.error('Error synchronizing discharge bill stay days:', err);
    }

    return discharged;
  }
}
