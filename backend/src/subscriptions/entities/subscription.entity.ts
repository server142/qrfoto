import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Plan } from '../../plans/entities/plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  PENDING = 'Pending',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  plan_id: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Column({ type: 'timestamp', nullable: true })
  starts_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ends_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;
}
