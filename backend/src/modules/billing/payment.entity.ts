import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentMode {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  INSURANCE = 'INSURANCE',
  CGHS = 'CGHS',
}

@Entity('payments')
@Index(['tenantId', 'billId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  billId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMode })
  paymentMode: PaymentMode;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  paymentDate: Date;

  @Column({ nullable: true })
  transactionRef: string;

  @Column({ nullable: true })
  receivedByUserId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
