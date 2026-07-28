import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type LabOrderStatus =
  'ORDERED' | 'SAMPLE_COLLECTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LabOrderTest {
  testId: string;
  testName: string;
  price: number;
}

@Entity('lab_orders')
@Index(['tenantId', 'patientId'])
@Index(['tenantId', 'status'])
export class LabOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  patientId: string;

  @Column({ nullable: true })
  encounterId: string;

  @Column()
  orderedByDoctorId: string;

  @Column()
  orderedByDoctorName: string;

  @Column({ type: 'jsonb', default: [] })
  tests: LabOrderTest[];

  @Column({ default: false })
  sampleCollected: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sampleCollectedAt: Date;

  @Column({ nullable: true })
  sampleBarcode: string;

  @Column({ default: 'ORDERED' })
  status: LabOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
