import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

/**
 * Small lookup lists used by the test master, one table for all of them.
 * CATEGORY sortOrder also decides the order departments print on a report.
 */
export const LAB_MASTER_KINDS = [
  'UNIT',
  'SAMPLE_TYPE',
  'CATEGORY',
  'METHOD',
  'INSTRUMENT',
  'OUTSOURCE_CENTER',
] as const;
export type LabMasterKind = (typeof LAB_MASTER_KINDS)[number];

@Entity('lab_masters')
@Index(['tenantId', 'kind', 'name'], { unique: true })
export class LabMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  kind: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 100 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
