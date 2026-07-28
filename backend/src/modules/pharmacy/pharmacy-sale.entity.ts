import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentMode {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
}

export interface SaleItem {
  drugId: string;
  drugName: string;
  batchId: string;
  qty: number;
  mrp: number;
  gst: number;
  discount: number;
  amount: number;
}

@Entity('pharmacy_sales')
export class PharmacySale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true })
  patientName: string;

  @Column({ type: 'jsonb', default: [] })
  items: SaleItem[];

  @Column({ type: 'decimal' })
  subtotal: number;

  @Column({ type: 'decimal', default: 0 })
  discountTotal: number;

  @Column({ type: 'decimal' })
  gstAmount: number;

  @Column({ type: 'decimal' })
  totalAmount: number;

  @Column({ type: 'enum', enum: PaymentMode, default: PaymentMode.CASH })
  paymentMode: PaymentMode;

  @Column({ default: true })
  isPaid: boolean;

  @Column({ nullable: true })
  prescriptionRef: string;

  @Column({ nullable: true })
  soldByUserId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
