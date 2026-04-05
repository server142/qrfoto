import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PlanType {
  FREE = 'Free',
  MONTHLY = 'Monthly',
  ANNUAL = 'Annual',
  PAY_PER_EVENT = 'Pay-per-event',
}

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: PlanType, default: PlanType.FREE })
  type: PlanType;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 1 })
  max_events: number;

  @Column({ default: 100 })
  storage_limit_mb: number;

  @Column({ default: 30 })
  event_duration_days: number;

  @Column({ default: true })
  has_custom_qr: boolean;

  @Column({ default: true })
  has_bulk_download: boolean;

  @Column({ default: true })
  has_custom_branding: boolean;

  @CreateDateColumn()
  created_at: Date;
}
