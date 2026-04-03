import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Subscription])],
  controllers: [PaymentsController],
  providers: [StripeService],
})
export class PaymentsModule { }
