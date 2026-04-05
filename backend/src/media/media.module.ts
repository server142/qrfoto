import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaController } from './media.controller';
import { UploadsService } from './uploads.service';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    EventsModule,
    UsersModule
  ],
  controllers: [MediaController],
  providers: [UploadsService],
})
export class MediaModule {}
