import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  USER = 'User',
  GUEST = 'Guest',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  preferred_language: string;

  @Column({ type: 'varchar', nullable: true })
  reset_password_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_password_expires: Date | null;

  @Column({
    type: 'enum',
    enum: ['Active', 'Blocked', 'Pending'],
    default: 'Active',
  })
  status: string;

  @Column({ nullable: true })
  registration_ip: string;

  @Column({ nullable: true })
  registration_country: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
