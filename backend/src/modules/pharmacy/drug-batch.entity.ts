import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('drug_batches')
export class DrugBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  drugId: string;

  @Column()
  batchNumber: string;

  @Column()
  expiryDate: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  freeQuantity: number;

  @Column({ type: 'decimal' })
  purchaseRate: number;

  @Column({ type: 'decimal' })
  mrp: number;

  @Column({ type: 'decimal' })
  gstPercent: number;

  @Column({ nullable: true })
  grnNumber: string;

  @Column({ nullable: true })
  receivedDate: string;

  @Column({ nullable: true })
  supplierId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
