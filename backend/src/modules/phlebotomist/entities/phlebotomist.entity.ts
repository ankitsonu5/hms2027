import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('phlebotomists')
@Index(['tenantId'])
export class Phlebotomist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  vehicleType: string;

  @Column({ nullable: true })
  vehicleNumber: string;

  @Column({ default: 'AVAILABLE' })
  status: string; // 'AVAILABLE', 'ON_FIELD', 'OFF_DUTY', 'ON_LEAVE'

  @Column({ nullable: true })
  specialization: string;

  @Column({ type: 'int', default: 15 })
  maxDailyCapacity: number;

  @Column({ type: 'int', default: 0 })
  todayCollections: number;

  @Column({ type: 'float', default: 4.8 })
  rating: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
