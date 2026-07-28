import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum ClientTier {
  SOLO_CLINIC = 'SOLO_CLINIC',
  DIAGNOSTIC_LAB = 'DIAGNOSTIC_LAB',
  PHARMACY_ONLY = 'PHARMACY_ONLY',
  CLINIC_LAB = 'CLINIC_LAB',
  FULL_HOSPITAL = 'FULL_HOSPITAL',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // e.g. "HMSHYDERABAD01"

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'enum', enum: ClientTier, default: ClientTier.FULL_HOSPITAL })
  tier: ClientTier;

  // Module activation flags — mirrors blueprint Section 3A
  @Column({ type: 'jsonb', default: {} })
  activeModules: Record<string, boolean>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
