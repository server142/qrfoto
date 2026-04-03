import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @Column({ nullable: true })
    event_id: string;

    @Column({ type: 'int', default: 5 })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ default: false })
    is_approved: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Event, { nullable: true })
    @JoinColumn({ name: 'event_id' })
    event: Event;
}
