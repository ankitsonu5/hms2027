import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TriageTag {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
}

export enum Disposition {
  DISCHARGE = 'DISCHARGE',
  ADMIT_ICU = 'ADMIT_ICU',
  ADMIT_OBSERVATION = 'ADMIT_OBSERVATION',
  ADMIT_WARD = 'ADMIT_WARD',
}

export interface Vitals {
  bp?: string;
  pulse?: number;
  temp?: number;
  spo2?: number;
  rr?: number;
  weight?: number;
}

@Entity('emergencies')
export class Emergency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  patientId: string;

  @Column()
  patientName: string;

  @Column({ nullable: true, type: 'int' })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  mlcCase: boolean;

  @Column({ nullable: true })
  mlcNumber: string;

  @Column({ type: 'enum', enum: TriageTag, default: TriageTag.GREEN })
  triageTag: TriageTag;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ type: 'jsonb', nullable: true })
  vitals: Vitals;

  @Column({ type: 'text', nullable: true })
  treatmentNotes: string;

  @Column({ type: 'jsonb', default: [] })
  drugsAdministered: object[];

  @Column({ type: 'enum', enum: Disposition, nullable: true })
  disposition: Disposition;

  @Column({ nullable: true })
  admissionId: string;

  @Column({ nullable: true })
  attendedByDoctorId: string;

  @Column({ nullable: true })
  attendedByDoctorName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
