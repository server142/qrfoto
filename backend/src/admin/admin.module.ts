import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Media } from '../media/entities/media.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { SystemSettings } from './entities/system-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event, Media, Subscription, SystemSettings]),
  ],
  controllers: [AdminController],
})
export class AdminModule { }
