import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OpdEncounter } from './opd-encounter.entity';
import { Patient } from '../patient/patient.entity';
import { CreateOpdDto } from './dto/create-opd.dto';
import { UpdateOpdDto } from './dto/update-opd.dto';
import { QueryOpdDto } from './dto/query-opd.dto';

@Injectable()
export class OpdService {
  constructor(
    @InjectRepository(OpdEncounter)
    private readonly repo: Repository<OpdEncounter>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  /**
   * OPD rows only carry `patientId`, so a list of encounters is unreadable on
   * its own. Attach each patient's identity in one batched lookup.
   */
  private async withPatients(
    tenantId: string,
    encounters: OpdEncounter[],
  ): Promise<Array<OpdEncounter & { patient: Partial<Patient> | null }>> {
    const ids = [
      ...new Set(encounters.map((e) => e.patientId).filter(Boolean)),
    ];
    if (ids.length === 0) {
      return encounters.map((e) => ({ ...e, patient: null }));
    }

    const patients = await this.patientRepo.find({
      where: { id: In(ids), tenantId },
      select: {
        id: true,
        uhid: true,
        firstName: true,
        lastName: true,
        gender: true,
        dob: true,
        phone: true,
      },
    });
    const byId = new Map(patients.map((p) => [p.id, p]));

    return encounters.map((e) => ({
      ...e,
      patient: byId.get(e.patientId) ?? null,
    }));
  }

  async findAll(
    tenantId: string,
    query: QueryOpdDto,
  ): Promise<{
    data: Array<OpdEncounter & { patient: Partial<Patient> | null }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      patientId,
      doctorId,
      status,
      visitDate,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.repo
      .createQueryBuilder('opd')
      .where('opd.tenantId = :tenantId', { tenantId })
      .andWhere('opd.isActive = :isActive', { isActive: true });

    if (patientId) {
      qb.andWhere('opd.patientId = :patientId', { patientId });
    }
    if (doctorId) {
      qb.andWhere('opd.doctorId = :doctorId', { doctorId });
    }
    if (status) {
      qb.andWhere('opd.status = :status', { status });
    }
    if (visitDate) {
      qb.andWhere('opd.visitDate = :visitDate', { visitDate });
    }

    const skip = (page - 1) * limit;
    qb.orderBy('opd.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: await this.withPatients(tenantId, data),
      total,
      page,
      limit,
    };
  }

  async findOne(tenantId: string, id: string): Promise<OpdEncounter> {
    const encounter = await this.repo.findOne({
      where: { id: id, tenantId: tenantId, isActive: true },
    });

    if (!encounter) {
      throw new NotFoundException(`OPD encounter with id ${id} not found`);
    }

    return encounter;
  }

  async create(tenantId: string, dto: CreateOpdDto): Promise<OpdEncounter> {
    const today = new Date().toISOString().split('T')[0];
    const visitDate = dto.visitDate ?? today;

    let tokenNumber = dto.tokenNumber;
    if (!tokenNumber) {
      const countToday = await this.repo.count({
        where: { tenantId, visitDate, isActive: true },
      });
      tokenNumber = `T-${countToday + 1}`;
    }

    const encounter = this.repo.create({
      ...dto,
      tenantId,
      visitDate,
      tokenNumber,
    });

    return this.repo.save(encounter);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateOpdDto,
  ): Promise<OpdEncounter> {
    const encounter = await this.findOne(tenantId, id);
    Object.assign(encounter, dto);
    return this.repo.save(encounter);
  }

  async remove(tenantId: string, id: string): Promise<{ message: string }> {
    const encounter = await this.findOne(tenantId, id);
    encounter.isActive = false;
    await this.repo.save(encounter);
    return { message: `OPD encounter ${id} deactivated successfully` };
  }
}
