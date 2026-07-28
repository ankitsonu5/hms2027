import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BillStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
}

export enum BillItemCategory {
  CONSULTATION = 'CONSULTATION',
  LAB = 'LAB',
  PHARMACY = 'PHARMACY',
  PROCEDURE = 'PROCEDURE',
  BED = 'BED',
  OTHER = 'OTHER',
}

export interface BillItem {
  description: string;
  category: BillItemCategory;
  quantity: number;
  unitPrice: number;
  discount?: number;
  gst?: number;
  amount: number;
}

@Entity('bills')
@Index(['tenantId', 'billNumber'], { unique: true })
@Index(['tenantId', 'patientId'])
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column()
  billNumber: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  billDate: string;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @Column({ type: 'jsonb', default: [] })
  items: BillItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  gstTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grandTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({ nullable: true })
  paymentMode: string;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.DRAFT,
  })
  status: BillStatus;

  @Column({ nullable: true })
  encounterId: string;

  @Column({ nullable: true })
  admissionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
