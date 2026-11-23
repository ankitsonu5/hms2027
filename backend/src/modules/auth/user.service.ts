import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async findAllDoctors(tenantId: string): Promise<User[]> {
    return this.users.createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere(':role = ANY(user.roles)', { role: UserRole.DOCTOR })
      .andWhere('(user.isActive = true OR user.isActive IS NULL)')
      .orderBy('user.name', 'ASC')
      .getMany();
  }

  async createDoctor(tenantId: string, data: any): Promise<User> {
    // Doctors who never log in (e.g. referring doctors) don't need a real email.
    const email = (data.email || '').trim().toLowerCase() ||
      `doctor.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@doctors.local`;
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new ConflictException('User with this email already exists');

    const passwordHash = await bcrypt.hash(data.password || 'doctor123', 12);
    
    const user = this.users.create({
      name: data.name,
      email,
      phone: data.phone,
      specialisation: data.specialisation,
      registrationNo: data.registrationNo,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      passwordHash,
      roles: [UserRole.DOCTOR],
      tenantId,
    });
    
    return this.users.save(user);
  }

  async updateDoctor(tenantId: string, id: string, data: any): Promise<User> {
    const user = await this.users.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Doctor not found');
    
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    
    const { id: _id, tenantId: _t, roles: _r, email, ...rest } = data ?? {};
    Object.assign(user, rest);
    if (typeof email === 'string' && email.trim()) user.email = email.trim().toLowerCase();
    return this.users.save(user);
  }

  async deleteDoctor(tenantId: string, id: string): Promise<void> {
    const user = await this.users.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Doctor not found');
    // A user with other roles (e.g. the admin who is also a doctor) keeps the
    // account; only the doctor role is removed.
    if ((user.roles ?? []).some((r) => r !== UserRole.DOCTOR)) {
      user.roles = user.roles.filter((r) => r !== UserRole.DOCTOR);
      await this.users.save(user);
      return;
    }
    try {
      await this.users.remove(user);
    } catch {
      user.isActive = false;
      await this.users.save(user);
    }
  }
}
