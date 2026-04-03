import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PaymentsController],
  providers: [StripeService],
})
export class PaymentsModule {}
