import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaController } from './media.controller';
import { UploadsService } from './uploads.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    EventsModule
  ],
  controllers: [MediaController],
  providers: [UploadsService],
})
export class MediaModule {}
