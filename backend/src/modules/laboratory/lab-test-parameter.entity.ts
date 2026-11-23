import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LabTest } from './lab-test.entity';
import { LabReferenceRange } from './lab-reference-range.entity';

/** NUMERIC values are flagged against ranges; TEXT is one line; PARAGRAPH is a narrative. */
export const PARAM_INPUT_TYPES = ['NUMERIC', 'TEXT', 'PARAGRAPH'] as const;

/**
 * MANUAL     – technician types the value.
 * DROPDOWN   – pick one of `options`.
 * MULTI_SELECT – pick several of `options`.
 * FIXED      – pre-filled with `defaultResult`, still editable.
 * FORMULA    – computed from other parameters, e.g. `{TOTAL BILIRUBIN} - {DIRECT BILIRUBIN}`.
 */
export const PARAM_RESULT_TYPES = [
  'MANUAL',
  'DROPDOWN',
  'MULTI_SELECT',
  'FIXED',
  'FORMULA',
] as const;

@Entity('lab_test_parameters')
@Index(['tenantId', 'testId'])
export class LabTestParameter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  testId: string;

  @ManyToOne(() => LabTest, (t) => t.parameters, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'testId' })
  test: LabTest;

  @Column({ type: 'int', default: 1 })
  sortOrder: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  method: string;

  @Column({ default: 'NUMERIC' })
  inputType: string;

  @Column({ default: 'MANUAL' })
  resultType: string;

  /** Choices for DROPDOWN / MULTI_SELECT. */
  @Column({ type: 'jsonb', nullable: true })
  options: string[] | null;

  /** Dropdown values considered normal (anything else is flagged abnormal). */
  @Column({ type: 'jsonb', nullable: true })
  normalOptions: string[] | null;

  @Column({ nullable: true })
  defaultResult: string;

  @Column({ type: 'text', nullable: true })
  formula: string;

  /** Decimal places to round a numeric / formula result to. */
  @Column({ type: 'int', nullable: true })
  decimals: number | null;

  /** NESTED tests: sub-heading this parameter is printed under. */
  @Column({ nullable: true })
  groupBy: string;

  @Column({ default: false })
  isOptional: boolean;

  /** Print the parameter name in bold (sub-totals, key values). */
  @Column({ default: false })
  isBold: boolean;

  @OneToMany(() => LabReferenceRange, (r) => r.parameter, {
    cascade: true,
    eager: true,
  })
  ranges: LabReferenceRange[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
