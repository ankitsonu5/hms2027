import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './ward.entity';
import { Bed, BedStatus } from './bed.entity';
import { IpdAdmission, AdmissionStatus } from './ipd-admission.entity';
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
    return this.wardRepo.save(ward);
  }

  // ─── Beds ─────────────────────────────────────────────────────────────────────

  async findAllBeds(
    tenantId: string,
    wardId?: string,
    status?: BedStatus,
  ): Promise<Bed[]> {
    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (wardId) where.wardId = wardId;
    if (status) where.status = status;

    return this.bedRepo.find({
      where,
      order: { wardId: 'ASC', bedNumber: 'ASC' },
    });
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
    data: IpdAdmission[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, wardId, doctorId, patientId, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (status) where.status = status;
    if (wardId) where.wardId = wardId;
    if (doctorId) where.admittingDoctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const [data, total] = await this.admissionRepo.findAndCount({
      where,
      order: { admissionDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOneAdmission(tenantId: string, id: string): Promise<IpdAdmission> {
    const admission = await this.admissionRepo.findOne({
      where: { id, tenantId, isActive: true },
    });
    if (!admission) throw new NotFoundException(`Admission ${id} not found`);
    return admission;
  }

  async createAdmission(
    tenantId: string,
    dto: CreateAdmissionDto,
  ): Promise<IpdAdmission> {
    // 1. Verify bed is available
    const bed = await this.bedRepo.findOne({
      where: { id: dto.bedId, tenantId, isActive: true },
    });
    if (!bed) throw new NotFoundException(`Bed ${dto.bedId} not found`);
    if (bed.status !== BedStatus.VACANT) {
      throw new BadRequestException(
        `Bed ${bed.bedNumber} is not vacant (current status: ${bed.status})`,
      );
    }

    // 2. Get ward for denormalization
    const ward = await this.wardRepo.findOne({
      where: { id: dto.wardId, tenantId, isActive: true },
    });
    if (!ward) throw new NotFoundException(`Ward ${dto.wardId} not found`);

    // 3. Generate admission number: ADM-YYYY-NNNNN
    const year = new Date().getFullYear();
    const count = await this.admissionRepo.count({ where: { tenantId } });
    const seq = String(count + 1).padStart(5, '0');
    const admissionNumber = `ADM-${year}-${seq}`;

    // 4. Save admission
    const admission = this.admissionRepo.create({
      ...dto,
      tenantId,
      admissionNumber,
      wardName: ward.name,
      bedNumber: bed.bedNumber,
      status: AdmissionStatus.ACTIVE,
    });
    const saved = await this.admissionRepo.save(admission);

    // 5. Mark bed as OCCUPIED
    bed.status = BedStatus.OCCUPIED;
    bed.currentAdmissionId = saved.id;
    await this.bedRepo.save(bed);

    return saved;
  }

  async updateAdmission(
    tenantId: string,
    id: string,
    dto: UpdateAdmissionDto,
  ): Promise<IpdAdmission> {
    const admission = await this.findOneAdmission(tenantId, id);
    Object.assign(admission, dto);
    return this.admissionRepo.save(admission);
  }

  async dischargePatient(tenantId: string, id: string): Promise<IpdAdmission> {
    const admission = await this.findOneAdmission(tenantId, id);

    if (admission.status === AdmissionStatus.DISCHARGED) {
      throw new BadRequestException('Patient is already discharged');
    }

    // 1. Set discharge details
    admission.actualDischargeDate = new Date();
    admission.status = AdmissionStatus.DISCHARGED;
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

    return discharged;
  }
}
