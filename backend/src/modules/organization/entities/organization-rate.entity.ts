import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('organization_rates')
@Index(['tenantId', 'organizationId', 'testId'], { unique: true })
export class OrganizationRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  organizationId: string;

  @Column()
  testId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  customPrice: number;

  @ManyToOne(() => Organization, (org) => org.rates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Optional: We can link this to the LabTest entity directly if needed, but often just the testId is enough
  // @ManyToOne(() => LabTest)
  // @JoinColumn({ name: 'testId' })
  // test: LabTest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
