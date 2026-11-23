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
@Index(['tenantId', 'orderId', 'testId', 'parameterId'])
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

  /** Null for rows saved before results were stored per parameter. */
  @Column({ nullable: true })
  parameterId: string;

  @Column({ nullable: true })
  parameterName: string;

  @Column({ nullable: true })
  groupBy: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  method: string;

  /** NORMAL / LOW / HIGH / CRITICAL_LOW / CRITICAL_HIGH / ABNORMAL, blank when not flaggable. */
  @Column({ nullable: true })
  flag: string;

  /** Remark of the reference band used, printed under the result. */
  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ default: false })
  hideInPrint: boolean;

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
