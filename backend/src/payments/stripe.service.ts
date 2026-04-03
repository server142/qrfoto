import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY', 'sk_test_51...'), {
      apiVersion: '2024-06-20' as any,
    });
  }

  async createCheckoutSession(planId: string, userId: string, priceInCents: number, planName: string) {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
            },
            unit_amount: Math.round(priceInCents),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL', 'http://localhost:3001')}/dashboard/events?success=true`,
      cancel_url: `${this.configService.get('FRONTEND_URL', 'http://localhost:3001')}/pricing?canceled=true`,
      metadata: {
        planId,
        userId,
      },
    });
  }
}
