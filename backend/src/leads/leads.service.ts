import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
    constructor(
        @InjectRepository(Lead)
        private leadsRepository: Repository<Lead>,
    ) { }

    async create(leadData: Partial<Lead>): Promise<Lead> {
        const lead = this.leadsRepository.create(leadData);
        return this.leadsRepository.save(lead);
    }

    async findByEvent(eventId: string): Promise<Lead[]> {
        return this.leadsRepository.find({
            where: { event_id: eventId },
            order: { created_at: 'DESC' },
        });
    }

    async findByEventSlug(slug: string): Promise<Lead[]> {
        return this.leadsRepository.find({
            where: { event: { slug } },
            relations: ['event'],
            order: { created_at: 'DESC' },
        });
    }
}
