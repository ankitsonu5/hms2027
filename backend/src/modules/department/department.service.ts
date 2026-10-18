import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department, DepartmentType } from './department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  async findAll(tenantId: string, query: QueryDepartmentDto): Promise<Department[]> {
    const qb = this.repo.createQueryBuilder('dept')
      .where('dept.tenantId = :tenantId', { tenantId });

    if (query.type && query.type !== 'ALL') {
      qb.andWhere('dept.type = :type', { type: query.type });
    }

    if (query.status === 'ACTIVE') {
      qb.andWhere('dept.isActive = true');
    } else if (query.status === 'INACTIVE') {
      qb.andWhere('dept.isActive = false');
    }

    if (query.search && query.search.trim()) {
      const s = `%${query.search.trim()}%`;
      qb.andWhere(
        '(dept.name ILIKE :s OR dept.code ILIKE :s OR dept.headOfDepartment ILIKE :s OR dept.location ILIKE :s)',
        { s },
      );
    }

    qb.orderBy('dept.createdAt', 'ASC');

    return qb.getMany();
  }

  async findOne(tenantId: string, id: string): Promise<Department> {
    const dept = await this.repo.findOne({ where: { id, tenantId } });
    if (!dept) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return dept;
  }

  async create(tenantId: string, dto: CreateDepartmentDto): Promise<Department> {
    const cleanPhone = dto.phone ? dto.phone.replace(/\D/g, '').slice(0, 10) : undefined;
    const dept = this.repo.create({
      ...dto,
      type: (dto.type || 'CLINICAL') as DepartmentType,
      code: dto.code.toUpperCase().trim(),
      name: dto.name.trim(),
      headOfDepartment: dto.headOfDepartment?.trim(),
      location: dto.location?.trim(),
      phone: cleanPhone,
      tenantId,
    });
    return this.repo.save(dept);
  }

  async update(tenantId: string, id: string, dto: UpdateDepartmentDto): Promise<Department> {
    const dept = await this.findOne(tenantId, id);

    if (dto.code) dept.code = dto.code.toUpperCase().trim();
    if (dto.name) dept.name = dto.name.trim();
    if (dto.type) dept.type = dto.type as DepartmentType;
    if (dto.headOfDepartment !== undefined) dept.headOfDepartment = dto.headOfDepartment?.trim();
    if (dto.location !== undefined) dept.location = dto.location?.trim();
    if (dto.floor !== undefined) dept.floor = dto.floor?.trim();
    if (dto.extension !== undefined) dept.extension = dto.extension?.trim();
    if (dto.phone !== undefined) dept.phone = dto.phone ? dto.phone.replace(/\D/g, '').slice(0, 10) : '';
    if (dto.email !== undefined) dept.email = dto.email?.trim();
    if (dto.totalDoctors !== undefined) dept.totalDoctors = dto.totalDoctors;
    if (dto.totalBeds !== undefined) dept.totalBeds = dto.totalBeds;
    if (dto.description !== undefined) dept.description = dto.description?.trim();
    if (dto.isActive !== undefined) dept.isActive = dto.isActive;

    return this.repo.save(dept);
  }

  async toggleStatus(tenantId: string, id: string): Promise<Department> {
    const dept = await this.findOne(tenantId, id);
    dept.isActive = !dept.isActive;
    return this.repo.save(dept);
  }

  async remove(tenantId: string, id: string): Promise<{ success: boolean; id: string }> {
    const dept = await this.findOne(tenantId, id);
    await this.repo.remove(dept);
    return { success: true, id };
  }
}
