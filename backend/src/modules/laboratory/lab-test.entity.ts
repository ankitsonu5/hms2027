import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { LabTestParameter } from './lab-test-parameter.entity';

/**
 * How a test's report is structured (mirrors the reference pathology system):
 *  SINGLE    – one result value (Random Sugar, Hb). Stored as exactly one parameter.
 *  MULTIPLE  – a list of parameters (CBC, LFT, Lipid profile).
 *  NESTED    – parameters grouped under sub-headings via `groupBy` (Urine routine).
 *  DOCUMENT  – free-text / narrative report (FNAC, Histopathology, Culture).
 *  PANEL     – a bundle of other tests (`panelTestIds`); has no parameters of its own.
 *  BILL_ONLY – billable item with no report.
 */
export const LAB_TEST_TYPES = [
  'SINGLE',
  'MULTIPLE',
  'NESTED',
  'DOCUMENT',
  'PANEL',
  'BILL_ONLY',
] as const;
export type LabTestType = (typeof LAB_TEST_TYPES)[number];

@Entity('lab_tests')
@Index(['tenantId', 'code'])
@Index(['tenantId', 'category'])
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

  /** Department / section printed as the report heading (HAEMATOLOGY, BIOCHEMISTRY…). */
  @Column()
  category: string;

  /** Summary of the first parameter, kept for older screens and the order form. */
  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  normalRange: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  instrument: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: false })
  isNotifiable: boolean;

  @Column({ default: 'SINGLE' })
  testType: string;

  /** Comma separated when more than one sample type applies. */
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

  /** Outsourced tests get a PDF uploaded from the partner lab instead of typed values. */
  @Column({ default: false })
  isOutsourced: boolean;

  @Column({ nullable: true })
  outsourceCenter: string;

  /** Narrative printed below the test on the report (interpretation / notes). */
  @Column({ type: 'text', nullable: true })
  interpretation: string;

  /** PANEL only: ordered ids of the included tests. */
  @Column({ type: 'jsonb', nullable: true })
  panelTestIds: string[] | null;

  /** Print the test on a separate page. */
  @Column({ default: false })
  printOnNewPage: boolean;

  @Column({ default: true })
  isActive: boolean;

  /**
   * Untyped parameter blob written by the first version of the test builder.
   * Read once at startup and converted into `lab_test_parameters` rows.
   */
  @Column({ name: 'parameters', type: 'jsonb', nullable: true, select: false })
  legacyParameters: any;

  @Column({ type: 'jsonb', nullable: true })
  reportSettings: any;

  @OneToMany(() => LabTestParameter, (p) => p.test, { cascade: true })
  parameters: LabTestParameter[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
