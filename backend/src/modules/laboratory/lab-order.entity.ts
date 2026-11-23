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

  /** Running lab number printed on the report and receipt. */
  @Column({ type: 'int', generated: 'increment' })
  labNo: number;

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

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  concessionPercentage: number;

  @Column({ nullable: true })
  concessionReason: string;

  @Column({ nullable: true })
  organizationId: string;

  @Column({ nullable: true })
  sponsorName: string;

  @Column({ nullable: true })
  patientCategory: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ default: 'CASH' })
  paymentMethod: string;

  @Column({ type: 'timestamp', nullable: true })
  resultEnteredAt: Date;

  @Column({ nullable: true })
  resultEnteredByName: string;

  /** Set when the pathologist approves the report; the printout shows it as verified. */
  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  approvedByName: string | null;

  @Column({ type: 'int', default: 0 })
  printCount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
