import { Injectable, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { Tenant } from '../tenant/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Tenant) private tenants: Repository<Tenant>,
    private jwt: JwtService,
  ) {}

  async onModuleInit() {
    try {
      let defaultTenant = await this.tenants.findOne({ where: { code: 'HMS001' } });
      if (!defaultTenant) {
        defaultTenant = await this.tenants.save(
          this.tenants.create({
            code: 'HMS001',
            name: 'City Care Hospital & Medical Center',
            email: 'admin@hospital.org',
            phone: '+91 9876543210',
            isActive: true,
          }),
        );
        this.logger.log('Default Tenant created: HMS001');
      }

      const defaultAdmin = await this.users.findOne({ where: { email: 'admin@hospital.org' } });
      if (!defaultAdmin) {
        const passwordHash = await this.hashPassword('admin123');
        await this.users.save(
          this.users.create({
            name: 'Dr. Krishna P Padagala',
            email: 'admin@hospital.org',
            passwordHash,
            roles: [UserRole.ADMIN, UserRole.DOCTOR],
            tenantId: defaultTenant.id,
            isActive: true,
          }),
        );
        this.logger.log('Default Admin created: admin@hospital.org / admin123');
      }
    } catch (err: any) {
      this.logger.warn(`Could not seed default user: ${err?.message}`);
    }
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({
      where: { email: dto.email, isActive: true },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        roles: true,
        tenantId: true,
      },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.users.update(user.id, { lastLoginAt: new Date() });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles,
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        tenantId: user.tenantId,
      },
    };
  }

  async profile(userId: string) {
    return this.users.findOne({ where: { id: userId } });
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12);
  }
}
