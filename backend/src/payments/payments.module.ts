import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { PaymentRequest } from './entities/payment-request.entity';
import { SystemSettings } from '../admin/entities/system-settings.entity';
import { UploadsService } from '../media/uploads.service';
import { PromocodesModule } from '../promocodes/promocodes.module';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Subscription, PaymentRequest, SystemSettings, User]),
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }), // 10MB limit
    PromocodesModule
  ],
  controllers: [PaymentsController],
  providers: [StripeService, UploadsService],
})
export class PaymentsModule { }
