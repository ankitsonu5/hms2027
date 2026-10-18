import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type DepartmentType =
  | 'CLINICAL'
  | 'SURGICAL'
  | 'CRITICAL_CARE'
  | 'EMERGENCY'
  | 'DIAGNOSTIC'
  | 'SUPPORT';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '0b2fb3ce-2065-4246-81b8-e6f5791dc4b7' })
  tenantId: string;

  @Column({ length: 30 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'varchar', default: 'CLINICAL' })
  type: DepartmentType;

  @Column({ length: 150, nullable: true })
  headOfDepartment: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 100, nullable: true })
  floor: string;

  @Column({ length: 50, nullable: true })
  extension: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'int', default: 1 })
  totalDoctors: number;

  @Column({ type: 'int', nullable: true })
  totalBeds: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
