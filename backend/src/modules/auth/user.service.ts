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
    const existing = await this.users.findOne({ where: { email: data.email, tenantId } });
    if (existing) throw new ConflictException('User with this email already exists');

    const passwordHash = await bcrypt.hash(data.password || 'doctor123', 12);
    
    const user = this.users.create({
      name: data.name,
      email: data.email,
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
    
    Object.assign(user, data);
    return this.users.save(user);
  }

  async deleteDoctor(tenantId: string, id: string): Promise<void> {
    const user = await this.users.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Doctor not found');
    try {
      await this.users.remove(user);
    } catch {
      user.isActive = false;
      await this.users.save(user);
    }
  }
}
