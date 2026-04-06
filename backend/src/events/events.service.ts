import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from './entities/event.entity';
import { Media } from '../media/entities/media.entity';
import { UsersService } from '../users/users.service';
import { UploadsService } from '../media/uploads.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly eventsRepository: Repository<Event>,
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => UploadsService))
        private readonly uploadsService: UploadsService,
    ) { }

    async create(createEventDto: any, userId?: string) {
        // Validación de límites si hay un usuario logueado
        if (userId) {
            const userData = await this.usersService.getMe(userId);
            if (userData && userData.activePlan) {
                const plan = userData.activePlan;

                // 1. Validar límite de eventos simultáneos
                if (plan.max_events !== 0) { // 0 significa ilimitado
                    const activeEvents = await this.eventsRepository.count({
                        where: { userId, status: 'Active' }
                    });

                    if (activeEvents >= plan.max_events) {
                        throw new BadRequestException(`Has alcanzado el límite de tu plan: Solo puedes tener ${plan.max_events} eventos activos simultáneamente.`);
                    }
                }
            }
        }

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

        // BORRADO FÍSICO: Limpiar carpeta de S3/MinIO
        await this.uploadsService.deleteFolder(`events/${event.id}`);

        await this.eventsRepository.remove(event);
        return { message: 'Event deleted successfully' };
    }

    async getDashboardStats(userId: string) {
        const events = await this.eventsRepository.find({ where: { userId } });
        const eventIds = events.map(e => e.id);

        let totalPhotos = 0;
        if (eventIds.length > 0) {
            totalPhotos = await this.eventsRepository.manager.count(Media, {
                where: { event_id: In(eventIds) }
            });
        }

        return {
            totalEvents: events.length,
            totalPhotos: totalPhotos,
            interactions: totalPhotos * 3, // Mock de interacciones (clicks + visualizaciones)
        };
    }
}
