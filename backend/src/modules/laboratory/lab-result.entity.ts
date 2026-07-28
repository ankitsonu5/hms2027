import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('lab_results')
@Index(['tenantId', 'orderId'])
@Index(['tenantId', 'orderId', 'testId'])
export class LabResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  orderId: string;

  @Column()
  testId: string;

  @Column()
  testName: string;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  normalRange: string;

  @Column({ default: false })
  isAbnormal: boolean;

  @Column({ nullable: true })
  enteredById: string;

  @Column({ nullable: true })
  validatedById: string;

  @Column({ nullable: true })
  reportUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
