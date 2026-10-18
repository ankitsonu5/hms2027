import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('smart_report_settings')
@Index(['tenantId'])
export class SmartReportSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  // Feature Toggles
  @Column({ default: false })
  enableSmartReportsV2: boolean;

  @Column({ default: false })
  tier2AiInsights: boolean;

  @Column({ default: false })
  autoGenerateOnSubmission: boolean;

  @Column({ default: false })
  sendOnCommunication: boolean;

  @Column({ default: 'Classic — data cover (default)' })
  selectedTemplate: string;

  // Lab Details
  @Column({ default: '1587' })
  labId: string;

  @Column({ default: 'Access Path Lab India Pvt Ltd' })
  name: string;

  @Column({ default: '14-37-41/2, Beside Sri Sathya IVF, Krishna Nagar,' })
  address: string;

  @Column({ default: '9618135999' })
  contactPhone: string;

  @Column({ default: 'accesspathlabs@gmail.com' })
  contactEmail: string;

  @Column({ default: 'India' })
  region: string;

  @Column({ default: 'Asia/Kolkata' })
  timezone: string;

  @Column({ default: 'MC-1234' })
  nabl: string;

  @Column({ default: 'en' })
  reportLanguage: string;

  @Column({ default: 'https://api.crelio.internal/report-callback' })
  callbackUrl: string;

  // Report Pages
  @Column({ default: 'Classic — data cover (default)' })
  coverPageStyle: string;

  @Column({ default: 'Simple — closing graphic only (default)' })
  closingPage: string;

  @Column({ default: 'Your Health, Decoded with Precision.' })
  tagline: string;

  @Column({ default: 'https://www.placeholderlabs.com' })
  website: string;

  @Column({ default: '#1e3a8a' })
  brandColor: string;

  // Assets
  @Column({ type: 'text', default: '/access-pathlab-header.jpeg' })
  logoUrl: string;

  @Column({ default: 'access-pathlab-header.jpeg' })
  logoFileName: string;

  @Column({ type: 'text', default: '' })
  coverGraphicUrl: string;

  @Column({ default: '' })
  coverGraphicFileName: string;

  @Column({ type: 'text', default: '' })
  closingGraphicUrl: string;

  @Column({ default: '' })
  closingGraphicFileName: string;

  // Preferences mapping (Accounts & Tests toggle states)
  @Column({ type: 'jsonb', default: {} })
  accountPreferences: Record<string, boolean>;

  @Column({ type: 'jsonb', default: {} })
  testPreferences: Record<string, boolean>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
