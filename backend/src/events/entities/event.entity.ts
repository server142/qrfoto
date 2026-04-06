import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lead } from '../../leads/entities/lead.entity';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'datetime', nullable: true })
    event_date: Date;

    @Column({ type: 'datetime', nullable: true })
    expiration_date: Date;

    @Column({ default: false })
    is_private: boolean;

    @Column({ default: 'Active' })
    status: string; // 'Active' or 'Finished'

    @Column({ unique: true })
    slug: string;

    @Column({ default: '#8b5cf6' })
    branding_color: string;

    @Column({ nullable: true })
    cover_image_url: string;

    @Column({ nullable: true })
    userId: string;

    @ManyToOne(() => User)
    user: User;

    @Column({ default: false })
    collect_leads: boolean;

    @Column({ default: false })
    leads_required: boolean;

    @OneToMany(() => Lead, (lead) => lead.event)
    leads: Lead[];

    @CreateDateColumn()
    created_at: Date;
}
