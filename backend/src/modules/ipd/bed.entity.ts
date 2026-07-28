import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BedStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
}

@Entity('beds')
@Index(['tenantId', 'wardId'])
@Index(['tenantId', 'status'])
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  wardId: string;

  @Column({ type: 'varchar', nullable: true })
  wardName: string | null;

  @Column()
  bedNumber: string;

  @Column({
    type: 'enum',
    enum: BedStatus,
    default: BedStatus.VACANT,
  })
  status: BedStatus;

  @Column({ type: 'varchar', nullable: true })
  currentAdmissionId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
