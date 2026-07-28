import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  LAB_TECH = 'LAB_TECH',
  ACCOUNTANT = 'ACCOUNTANT',
  OWNER = 'OWNER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  // A user can hold multiple roles (e.g. Receptionist + Pharmacist in small clinic)
  @Column({ type: 'enum', enum: UserRole, array: true, default: [] })
  roles: UserRole[];

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  specialisation: string; // for doctors

  @Column({ nullable: true })
  registrationNo: string; // medical registration number

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
