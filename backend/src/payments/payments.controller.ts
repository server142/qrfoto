import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../plans/entities/plan.entity';

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(Plan) private planRepo: Repository<Plan>
  ) {}

  @Post('checkout')
  // @UseGuards(JwtAuthGuard)
  async checkout(@Body() body: { planId: string, userId: string }) {
    const plan = await this.planRepo.findOne({ where: { id: body.planId } });
    if (!plan) throw new Error('Plan not found');

    const session = await this.stripeService.createCheckoutSession(
      plan.id,
      body.userId,
      plan.price * 100, // Price in cents
      plan.name
    );

    return { url: session.url };
  }
}
