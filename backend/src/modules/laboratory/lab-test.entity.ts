import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('lab_tests')
@Index(['tenantId', 'code'])
export class LabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'int', generated: 'increment' })
  numericId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  normalRange: string;

  @Column({ nullable: true })
  method: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: false })
  isNotifiable: boolean;

  @Column({ default: 'TEST' })
  testType: string;

  @Column({ nullable: true })
  sampleType: string;

  @Column({ nullable: true })
  integrationCode: string;

  @Column({ nullable: true })
  procedureCode: string;

  @Column({ nullable: true })
  loincCode: string;

  @Column({ nullable: true })
  shortText: string;

  @Column({ nullable: true })
  testAlias: string;

  @Column({ nullable: true })
  icdToPin: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
