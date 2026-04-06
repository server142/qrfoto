import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocode } from './entities/promocode.entity';
import { CommissionTracking } from './entities/commission-tracking.entity';
import { PromocodesService } from './promocodes.service';
import { PromocodesController } from './promocodes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Promocode, CommissionTracking])],
  controllers: [PromocodesController],
  providers: [PromocodesService],
  exports: [PromocodesService, TypeOrmModule],
})
export class PromocodesModule {}
