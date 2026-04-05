import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Plan } from '../../plans/entities/plan.entity';

export enum PaymentRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum PaymentMethod {
    OXXO = 'oxxo',
    TRANSFER = 'transfer',
}

@Entity('payment_requests')
export class PaymentRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @Column()
    plan_id: string;

    @Column({ type: 'enum', enum: PaymentMethod })
    method: PaymentMethod;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ unique: true })
    reference: string; // e.g. QRF-2026-A1B2

    @Column({ type: 'enum', enum: PaymentRequestStatus, default: PaymentRequestStatus.PENDING })
    status: PaymentRequestStatus;

    @Column({ nullable: true })
    proof_file_key: string; // MinIO key for the uploaded proof

    @Column({ nullable: true })
    proof_url: string; // Public URL for displaying

    @Column({ nullable: true })
    admin_notes: string;

    @ManyToOne(() => User, { nullable: true, eager: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Plan, { nullable: true, eager: false })
    @JoinColumn({ name: 'plan_id' })
    plan: Plan;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
