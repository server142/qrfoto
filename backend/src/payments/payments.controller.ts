import { Controller, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>
  ) { }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Body() body: { planId: string, currency?: string }, @Request() req: any) {
    const userId = req.user.userId;
    const plan = await this.planRepo.findOne({ where: { id: body.planId } });
    if (!plan) throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);

    // Si el plan es gratuito, activarlo directamente sin Stripe
    if (plan.price <= 0) {
      // Desactivamos suscripciones anteriores (opcional, pero buena práctica)
      await this.subRepo.update({ user_id: userId }, { status: SubscriptionStatus.EXPIRED });

      const sub = this.subRepo.create({
        user_id: userId,
        plan_id: plan.id,
        status: SubscriptionStatus.ACTIVE,
        starts_at: new Date()
      });
      await this.subRepo.save(sub);

      // Devolver URL de exito
      return { url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/events?success=true` };
    }

    try {
      const currency = body.currency || 'mxn';
      let chargeAmount = plan.price;
      if (currency === 'usd') {
        chargeAmount = Math.round(plan.price / 20); // Exchange rate fallback
      }

      const session = await this.stripeService.createCheckoutSession(
        plan.id,
        userId,
        chargeAmount * 100, // Price in cents
        plan.name,
        currency
      );
      return { url: session.url };
    } catch (err) {
      console.error("Stripe Error:", err.message);
      throw new HttpException('Error contactando con el procesador de pagos. Configura una clave de Stripe válida.', HttpStatus.BAD_REQUEST);
    }
  }
}
