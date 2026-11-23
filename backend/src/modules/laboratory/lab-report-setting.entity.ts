import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export interface ReportSignature {
  name: string;
  designation?: string;
  imageUrl?: string;
}

/** How the printed lab report looks. One row per tenant. */
@Entity('lab_report_settings')
@Index(['tenantId'], { unique: true })
export class LabReportSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  // ── Letterhead ────────────────────────────────────────────────────────────
  /** URL or data: URL of the full-width header image. */
  @Column({ type: 'text', nullable: true })
  headerImage: string | null;

  @Column({ type: 'text', nullable: true })
  footerImage: string | null;

  /** Space reserved for the header / footer, also used when printing on pre-printed stationery. */
  @Column({ type: 'int', default: 38 })
  headerHeightMm: number;

  @Column({ type: 'int', default: 18 })
  footerHeightMm: number;

  @Column({ default: true })
  letterheadByDefault: boolean;

  /** Text header used when no header image is set. */
  @Column({ nullable: true })
  labName: string;

  @Column({ type: 'text', nullable: true })
  labAddress: string;

  @Column({ nullable: true })
  labContact: string;

  // ── Layout ────────────────────────────────────────────────────────────────
  @Column({ type: 'int', default: 12 })
  marginMm: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, default: 10 })
  fontSizePt: number;

  @Column({ default: 'Arial' })
  fontFamily: string;

  @Column({ default: true })
  showMethodColumn: boolean;

  @Column({ default: true })
  showUnitColumn: boolean;

  /** HL = "H"/"L" next to the value, ARROW = ↑/↓, BOLD = bold value only. */
  @Column({ default: 'HL' })
  flagStyle: string;

  @Column({ default: true })
  boldAbnormal: boolean;

  @Column({ default: true })
  showSampleType: boolean;

  @Column({ default: false })
  departmentOnNewPage: boolean;

  // ── Closing ───────────────────────────────────────────────────────────────
  @Column({ type: 'jsonb', default: () => "'[]'" })
  signatures: ReportSignature[];

  @Column({ default: '*** End of Report ***' })
  endOfReportText: string;

  @Column({ type: 'text', nullable: true })
  footerNotes: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
