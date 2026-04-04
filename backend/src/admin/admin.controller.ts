import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Media } from '../media/entities/media.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
  ) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    // Real system metrics
    const totalUsers = await this.userRepo.count();
    const activeEvents = await this.eventRepo.count({ where: { status: 'Active' } });
    const totalEvents = await this.eventRepo.count();
    const totalMedia = await this.mediaRepo.count();
    
    // Pro users are those with an Active subscription on a non-free plan (simplified logic)
    const proSubs = await this.subRepo.count({
        where: { status: SubscriptionStatus.ACTIVE }
    });

    // Recent events
    const recentEvents = await this.eventRepo.find({
        order: { created_at: 'DESC' },
        take: 5,
        relations: ['user']
    });

    return {
      metrics: {
        activeUsers: totalUsers,
        proSubs: proSubs,
        totalEvents: totalEvents,
        activeEvents: activeEvents,
        filesUploaded: totalMedia,
      },
      recentEvents: recentEvents.map(ev => ({
        id: ev.id,
        name: ev.name,
        userEmail: ev.user?.email || 'N/A',
        createdAt: ev.created_at,
        status: ev.status
      }))
    };
  }
}
