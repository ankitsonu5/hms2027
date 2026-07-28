import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OpdStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REFERRED = 'REFERRED',
  ADMITTED = 'ADMITTED',
}

export interface PrescriptionItem {
  drugName: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface LabOrderItem {
  testName: string;
  notes: string;
}

@Entity('opd_encounters')
@Index(['tenantId', 'patientId'])
@Index(['tenantId', 'doctorId'])
@Index(['tenantId', 'visitDate'])
export class OpdEncounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  patientId: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true })
  doctorName: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  visitDate: string;

  @Column({ nullable: true })
  tokenNumber: string;

  @Column({ type: 'text', nullable: true })
  chiefComplaints: string;

  @Column({ type: 'text', nullable: true })
  history: string;

  @Column({ type: 'text', nullable: true })
  examination: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ nullable: true })
  icdCode: string;

  @Column({ type: 'jsonb', default: [] })
  prescription: PrescriptionItem[];

  @Column({ type: 'jsonb', default: [] })
  labOrders: LabOrderItem[];

  @Column({ type: 'text', nullable: true })
  advice: string;

  @Column({ type: 'date', nullable: true })
  followUpDate: string;

  @Column({
    type: 'enum',
    enum: OpdStatus,
    default: OpdStatus.PENDING,
  })
  status: OpdStatus;

  @Column({ nullable: true })
  referredToDoctorId: string;

  @Column({ nullable: true })
  referredToDoctorName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
