import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private repo: Repository<Patient>,
  ) {}

  async findAll(
    tenantId: string,
    query: QueryPatientDto,
  ): Promise<{ data: Patient[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('patient')
      .where('patient.tenantId = :tenantId', { tenantId })
      .andWhere('patient.isActive = true');

    if (query.category) {
      qb.andWhere('patient.category = :category', { category: query.category });
    }

    if (query.search) {
      const search = `%${query.search}%`;
      qb.andWhere(
        '(patient.firstName ILIKE :search OR patient.lastName ILIKE :search OR patient.phone ILIKE :search OR patient.uhid ILIKE :search)',
        { search },
      );
    }

    const [data, total] = await qb
      .orderBy('patient.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(tenantId: string, id: string): Promise<Patient> {
    const patient = await this.repo.findOne({
      where: { id, tenantId, isActive: true },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }
    return patient;
  }

  async findByUhid(tenantId: string, uhid: string): Promise<Patient> {
    const patient = await this.repo.findOne({
      where: { uhid, tenantId, isActive: true },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with UHID ${uhid} not found`);
    }
    return patient;
  }

  async create(tenantId: string, dto: CreatePatientDto): Promise<Patient> {
    const year = new Date().getFullYear();

    // Derive the next UHID from the highest existing one this year — NOT the row
    // count, which collides whenever a patient has been removed (leaving a gap)
    // or two registrations run concurrently. Retry on the unique-constraint race.
    for (let attempt = 0; attempt < 5; attempt++) {
      const uhid = await this.nextUhid(tenantId, year);
      const patient = this.repo.create({ ...dto, tenantId, uhid });
      try {
        return await this.repo.save(patient);
      } catch (err: any) {
        // 23505 = Postgres unique_violation. Someone took this UHID first; retry.
        if (err?.code === '23505' && attempt < 4) continue;
        throw err;
      }
    }
    // Unreachable: the loop either returns or throws.
    throw new Error('Failed to allocate a unique UHID');
  }

  private async nextUhid(tenantId: string, year: number): Promise<string> {
    const prefix = `UHID-${year}-`;
    const latest = await this.repo
      .createQueryBuilder('patient')
      .select('patient.uhid', 'uhid')
      .where('patient.tenantId = :tenantId', { tenantId })
      .andWhere('patient.uhid LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('LENGTH(patient.uhid)', 'DESC')
      .addOrderBy('patient.uhid', 'DESC')
      .limit(1)
      .getRawOne<{ uhid: string }>();

    const lastSeq = latest ? parseInt(latest.uhid.slice(prefix.length), 10) : 0;
    const next = (Number.isNaN(lastSeq) ? 0 : lastSeq) + 1;
    return `${prefix}${String(next).padStart(5, '0')}`;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(tenantId, id);
    Object.assign(patient, dto);
    return this.repo.save(patient);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const patient = await this.findOne(tenantId, id);
    patient.isActive = false;
    await this.repo.save(patient);
  }
}
