import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AdmissionStatus {
  ACTIVE = 'ACTIVE',
  DISCHARGED = 'DISCHARGED',
  TRANSFERRED = 'TRANSFERRED',
}

@Entity('ipd_admissions')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'patientId'])
@Index(['tenantId', 'wardId'])
@Index(['tenantId', 'admissionNumber'], { unique: true })
export class IpdAdmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  patientId: string;

  @Column()
  admissionNumber: string;

  @Column()
  wardId: string;

  @Column({ nullable: true })
  wardName: string;

  @Column()
  bedId: string;

  @Column({ nullable: true })
  bedNumber: string;

  @Column()
  admittingDoctorId: string;

  @Column()
  admittingDoctorName: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  admissionDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDischargeDate: string;

  @Column({ type: 'timestamptz', nullable: true })
  actualDischargeDate: Date;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  admissionReason: string;

  @Column({ nullable: true })
  diet: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ nullable: true })
  attendantName: string;

  @Column({ nullable: true })
  attendantPhone: string;

  @Column({ nullable: true })
  attendantRelation: string;

  @Column({ type: 'decimal', default: 0 })
  depositAmount: number;

  @Column({
    type: 'enum',
    enum: AdmissionStatus,
    default: AdmissionStatus.ACTIVE,
  })
  status: AdmissionStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
