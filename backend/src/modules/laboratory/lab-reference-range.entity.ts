import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LabTestParameter } from './lab-test-parameter.entity';

export const RANGE_GENDERS = ['ANY', 'MALE', 'FEMALE'] as const;
export const AGE_UNITS = ['DAYS', 'MONTHS', 'YEARS'] as const;
export const RANGE_TYPES = ['NUMERIC', 'TEXT'] as const;

/**
 * One normal-value band for a parameter. The band applies to patients of
 * `gender` whose age falls in [minAge, maxAge] (each with its own unit).
 * `minDays` / `maxDays` are the same bounds normalised to days so the band can
 * be chosen without string parsing.
 */
@Entity('lab_reference_ranges')
@Index(['tenantId', 'parameterId'])
export class LabReferenceRange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  parameterId: string;

  @ManyToOne(() => LabTestParameter, (p) => p.ranges, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'parameterId' })
  parameter: LabTestParameter;

  @Column({ type: 'int', default: 1 })
  sortOrder: number;

  @Column({ default: 'NUMERIC' })
  rangeType: string;

  @Column({ default: 'ANY' })
  gender: string;

  @Column({ type: 'int', default: 0 })
  minAge: number;

  @Column({ default: 'YEARS' })
  minAgeUnit: string;

  @Column({ type: 'int', default: 120 })
  maxAge: number;

  @Column({ default: 'YEARS' })
  maxAgeUnit: string;

  @Column({ type: 'int', default: 0 })
  minDays: number;

  @Column({ type: 'int', default: 43800 })
  maxDays: number;

  @Column({ type: 'double precision', nullable: true })
  lowerValue: number | null;

  @Column({ type: 'double precision', nullable: true })
  upperValue: number | null;

  /** Values below / above these are flagged CRITICAL. */
  @Column({ type: 'double precision', nullable: true })
  criticalLow: number | null;

  @Column({ type: 'double precision', nullable: true })
  criticalHigh: number | null;

  /** TEXT ranges: expected value, e.g. "Negative" / "Absent". */
  @Column({ nullable: true })
  textValue: string;

  /** Overrides what is printed in the reference column, e.g. "Upto 200". */
  @Column({ type: 'text', nullable: true })
  displayText: string;

  /** Printed as a note row under the parameter. */
  @Column({ type: 'text', nullable: true })
  remark: string;
}
