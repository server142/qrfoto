import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocode } from './entities/promocode.entity';
import { CommissionTracking } from './entities/commission-tracking.entity';
import { PromocodesService } from './promocodes.service';
import { PromocodesController } from './promocodes.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promocode, CommissionTracking]),
    AuthModule,
    UsersModule
  ],
  controllers: [PromocodesController],
  providers: [PromocodesService],
  exports: [PromocodesService, TypeOrmModule],
})
export class PromocodesModule { }
