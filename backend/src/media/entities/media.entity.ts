import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  event_id: string;

  @Column({ nullable: true })
  guest_name: string;

  @Column({ nullable: true })
  guest_email: string;

  @Column({ length: 1024, nullable: true })
  file_url: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  file_type: MediaType;

  @Column()
  size_bytes: number;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ default: 'Active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
