import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DosageForm {
  TABLET = 'Tablet',
  SYRUP = 'Syrup',
  CAPSULE = 'Capsule',
  INJECTION = 'Injection',
  CREAM = 'Cream',
  DROP = 'Drop',
}

export enum DrugSchedule {
  GENERAL = 'GENERAL',
  SCHEDULE_H = 'SCHEDULE_H',
  SCHEDULE_H1 = 'SCHEDULE_H1',
  SCHEDULE_X = 'SCHEDULE_X',
  NARCOTIC = 'NARCOTIC',
}

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  genericName: string;

  @Column()
  brandName: string;

  @Column({ type: 'enum', enum: DosageForm })
  dosageForm: DosageForm;

  @Column({ nullable: true })
  strength: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  hsnCode: string;

  @Column({ type: 'decimal', default: 12 })
  gstPercent: number;

  @Column({ type: 'enum', enum: DrugSchedule, default: DrugSchedule.GENERAL })
  schedule: DrugSchedule;

  @Column({ type: 'decimal' })
  mrp: number;

  @Column({ type: 'decimal' })
  purchaseRate: number;

  @Column({ type: 'decimal' })
  saleRate: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
