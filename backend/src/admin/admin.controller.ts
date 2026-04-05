import { Controller, Get, Post, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Media } from '../media/entities/media.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { SystemSettings } from './entities/system-settings.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(SystemSettings) private settingsRepo: Repository<SystemSettings>,
  ) { }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    // ... existing stats logic ...
    const totalUsers = await this.userRepo.count();
    const activeEvents = await this.eventRepo.count({ where: { status: 'Active' } });
    const totalEvents = await this.eventRepo.count();
    const totalMedia = await this.mediaRepo.count();

    const proSubs = await this.subRepo.count({
      where: { status: SubscriptionStatus.ACTIVE }
    });

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

  // Public endpoint — only exposes safe settings (no API keys)
  @Get('public-settings')
  async getPublicSettings() {
    const settings = await this.settingsRepo.findOne({ where: { id: 'main' } });
    return {
      isSlideshowEnabled: settings?.isSlideshowEnabled ?? true,
    };
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getSettings() {
    let settings = await this.settingsRepo.findOne({ where: { id: 'main' } });
    if (!settings) {
      settings = this.settingsRepo.create({
        id: 'main',
        isSlideshowEnabled: true,
        defaultCurrency: 'MXN',
        paymentMethods: {
          stripe: { enabled: true, config: {} },
          paypal: { enabled: true, config: {} },
          oxxo: { enabled: true, card_number: '1234-5678-9012-3456', account_holder: 'Veltrix Events S.A. de C.V.', bank: 'Banamex', enabled_vouchers: true },
          ventanilla: { enabled: true, details: 'Depósito a Banamex Cuenta: 1234567 CLABE: 012345678901234567' }
        }
      });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Body() body: Partial<SystemSettings>) {
    let settings = await this.settingsRepo.findOne({ where: { id: 'main' } });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 'main', ...body });
    } else {
      Object.assign(settings, body);
    }
    return this.settingsRepo.save(settings);
  }
}
