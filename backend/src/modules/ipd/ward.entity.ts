import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum WardType {
  GENERAL = 'GENERAL',
  ICU = 'ICU',
  MATERNITY = 'MATERNITY',
  SURGICAL = 'SURGICAL',
  PAEDIATRICS = 'PAEDIATRICS',
  PRIVATE = 'PRIVATE',
}

@Entity('wards')
@Index(['tenantId'])
export class Ward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: WardType })
  type: WardType;

  @Column({ type: 'int', default: 0 })
  totalBeds: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
