import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PatientCategory {
  DIRECT = 'DIRECT',
  B2B_REFERRAL = 'B2B_REFERRAL',
  CORPORATE = 'CORPORATE',
  INSURANCE = 'INSURANCE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum BloodGroup {
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS = 'O+',
  O_NEG = 'O-',
}

@Entity('patients')
@Index(['tenantId', 'uhid'], { unique: true })
@Index(['tenantId', 'phone'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  // Unique Hospital ID — barcode/QR printed on wristband
  @Column()
  @Index()
  uhid: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'date' })
  dob: string;

  @Column({ nullable: true })
  bloodGroup: string;

  @Column()
  @Index()
  phone: string;

  @Column({ nullable: true })
  altPhone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ nullable: true })
  aadhaar: string; // stored encrypted in prod

  @Column({
    type: 'enum',
    enum: PatientCategory,
    default: PatientCategory.DIRECT,
  })
  category: PatientCategory;

  // B2B referral
  @Column({ nullable: true })
  referredByDoctorId: string;

  @Column({ nullable: true })
  referredByDoctorName: string;

  // Corporate
  @Column({ nullable: true })
  corporateId: string;

  @Column({ nullable: true })
  employeeId: string;

  // Insurance
  @Column({ nullable: true })
  insurerId: string;

  @Column({ nullable: true })
  policyNumber: string;

  // Government compliance flags
  @Column({ default: false })
  hasNotifiableCondition: boolean;

  @Column({ default: false })
  govtDataSharingConsent: boolean;

  // For OBG — voluntary pregnancy tracking
  @Column({ default: false })
  isPregnant: boolean;

  @Column({ nullable: true })
  expectedDeliveryDate: string;

  @Column({ nullable: true })
  currentLocation: string;

  @Column({ nullable: true })
  plannedDeliveryLocation: string;

  @Column({ default: false })
  locationSharingConsent: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
