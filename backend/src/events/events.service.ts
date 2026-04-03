import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly eventsRepository: Repository<Event>,
    ) { }

    async create(createEventDto: any, userId?: string) {
        const slug = Math.random().toString(36).substring(2, 10);
        const event = this.eventsRepository.create({ ...createEventDto, slug, userId });
        await this.eventsRepository.save(event);
        return { message: 'Event created successfully', event };
    }

    findAll(userId?: string) {
        if (userId) {
            return this.eventsRepository.find({ where: { userId } });
        }
        return this.eventsRepository.find();
    }

    async findOne(id: string) {
        const event = await this.eventsRepository.findOne({ where: { id } });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    async findOneBySlug(slug: string) {
        const event = await this.eventsRepository.findOne({ where: { slug } });
        if (!event) throw new NotFoundException('Event not found by slug');
        if (event.status === 'Finished') throw new NotFoundException('This event has already ended.');
        return event;
    }

    async toggleStatus(id: string) {
        const event = await this.findOne(id);
        event.status = event.status === 'Active' ? 'Finished' : 'Active';
        return this.eventsRepository.save(event);
    }

    async update(id: string, updateEventDto: any) {
        const event = await this.findOne(id);
        const updatedEvent = this.eventsRepository.merge(event, updateEventDto);
        await this.eventsRepository.save(updatedEvent);
        return { message: 'Event updated successfully', event: updatedEvent };
    }

    async remove(id: string) {
        const event = await this.findOne(id);
        await this.eventsRepository.remove(event);
        return { message: 'Event deleted successfully' };
    }
}
