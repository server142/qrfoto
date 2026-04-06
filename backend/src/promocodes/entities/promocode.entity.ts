import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CommissionTracking } from './commission-tracking.entity';

@Entity('promocodes')
export class Promocode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  promoter_name: string;

  @Column({ nullable: true })
  promoter_email: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discount_percentage: number;

  @Column({ type: 'enum', enum: ['fixed', 'percentage'], default: 'fixed' })
  commission_type: 'fixed' | 'percentage';

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  commission_value: number;

  @Column({ type: 'int', default: 1 })
  max_uses: number;

  @Column({ type: 'int', default: 0 })
  used_count: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => CommissionTracking, (commission) => commission.promocode)
  commissions: CommissionTracking[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
