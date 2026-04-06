import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaController } from './media.controller';
import { UploadsService } from './uploads.service';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    MulterModule.register({
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB para fotos de alta calidad de galería
    }),
    EventsModule,
    UsersModule
  ],
  controllers: [MediaController],
  providers: [UploadsService],
})
export class MediaModule { }
