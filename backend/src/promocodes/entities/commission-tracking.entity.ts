import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Promocode } from './promocode.entity';
// import { User } from '../../users/entities/user.entity'; // Asumiendo estructura

@Entity('commission_tracking')
export class CommissionTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Promocode, (promocode) => promocode.commissions)
  @JoinColumn({ name: 'promocode_id' })
  promocode: Promocode;

  @Column()
  promocode_id: string;

  // Ideally this connects to the User entity, but keeping it simple as string UUID for now
  @Column({ nullable: true })
  user_id: string; 

  @Column({ nullable: true })
  plan_name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  original_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount_paid: number;

  @Column('decimal', { precision: 10, scale: 2 })
  commission_earned: number;

  @Column({ type: 'enum', enum: ['pending', 'paid'], default: 'pending' })
  status: 'pending' | 'paid';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
