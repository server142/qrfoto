import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Plan } from '../plans/entities/plan.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { StripeService } from './stripe.service';
import { PaymentRequest, PaymentRequestStatus, PaymentMethod } from './entities/payment-request.entity';
import { UploadsService } from '../media/uploads.service';
import { SystemSettings } from '../admin/entities/system-settings.entity';

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly uploadsService: UploadsService,
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(PaymentRequest) private paymentRequestRepo: Repository<PaymentRequest>,
    @InjectRepository(SystemSettings) private settingsRepo: Repository<SystemSettings>,
  ) { }

  // ─────────────────────────────────────────────
  // STRIPE CHECKOUT (when configured)
  // ─────────────────────────────────────────────
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Body() body: { planId: string, currency?: string }, @Request() req: any) {
    const userId = req.user.userId;
    const plan = await this.planRepo.findOne({ where: { id: body.planId } });
    if (!plan) throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);

    // Si el plan es gratuito, activarlo directamente sin Stripe
    if (plan.price <= 0) {
      await this.subRepo.update({ user_id: userId }, { status: SubscriptionStatus.EXPIRED });
      const sub = this.subRepo.create({
        user_id: userId,
        plan_id: plan.id,
        status: SubscriptionStatus.ACTIVE,
        starts_at: new Date()
      });
      await this.subRepo.save(sub);
      return { url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard/events?success=true` };
    }

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeKey || stripeKey.startsWith('sk_test_51...') || stripeKey.length < 20) {
      // Return mode=manual so frontend can show manual payment modal
      return { mode: 'manual', plan: { id: plan.id, name: plan.name, price: plan.price, currency: plan.currency } };
    }

    try {
      const currency = plan.currency?.toLowerCase() || 'mxn';
      const session = await this.stripeService.createCheckoutSession(
        plan.id, userId, Math.round(plan.price * 100), plan.name, currency
      );
      return { url: session.url };
    } catch (err) {
      console.error("Stripe Error:", err.message);
      return { mode: 'manual', plan: { id: plan.id, name: plan.name, price: plan.price, currency: plan.currency } };
    }
  }

  // ─────────────────────────────────────────────
  // MANUAL PAYMENT REQUEST (OXXO / Transfer)
  // ─────────────────────────────────────────────
  @Post('manual-request')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('proof'))
  async createManualRequest(
    @Body() body: { planId: string; method: string },
    @Request() req: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const userId = req.user.userId;
    const plan = await this.planRepo.findOne({ where: { id: body.planId } });
    if (!plan) throw new HttpException('Plan not found', HttpStatus.NOT_FOUND);

    if (!['oxxo', 'transfer'].includes(body.method)) {
      throw new BadRequestException('Método de pago inválido');
    }

    // Generate unique reference: QRF-YEAR-RANDOM
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const reference = `QRF-${year}-${random}`;

    let proof_file_key: string | null = null;
    let proof_url: string | null = null;

    if (file) {
      proof_file_key = await this.uploadsService.uploadFile(file, 'payment-proofs');
      proof_url = this.uploadsService.getPublicUrl(proof_file_key);
    }

    const paymentRequest = this.paymentRequestRepo.create({
      user_id: userId,
      plan_id: plan.id,
      method: body.method as PaymentMethod,
      amount: plan.price,
      reference,
      status: PaymentRequestStatus.PENDING,
      proof_file_key,
      proof_url,
    });

    await this.paymentRequestRepo.save(paymentRequest);

    return {
      message: 'Solicitud de pago recibida. Te notificaremos cuando sea verificada.',
      reference,
      status: 'pending',
    };
  }

  // ─────────────────────────────────────────────
  // GET PAYMENT METHODS (for frontend modal)
  // ─────────────────────────────────────────────
  @Get('methods')
  @UseGuards(JwtAuthGuard)
  async getPaymentMethods() {
    const settings = await this.settingsRepo.findOne({ where: { id: 'main' } });
    return settings?.paymentMethods || {
      oxxo: { enabled: true, card_number: '1234-5678-9012-3456', account_holder: 'Veltrix Events', bank: 'Banamex' },
      ventanilla: { enabled: true, details: 'Cuenta: 1234567 CLABE: 012345678901234567' }
    };
  }

  // ─────────────────────────────────────────────
  // ADMIN: LIST ALL PAYMENT REQUESTS
  // ─────────────────────────────────────────────
  @Get('admin/requests')
  @UseGuards(JwtAuthGuard)
  async getAdminRequests() {
    return this.paymentRequestRepo.find({
      relations: ['user', 'plan'],
      order: { created_at: 'DESC' }
    });
  }

  // ─────────────────────────────────────────────
  // ADMIN: APPROVE PAYMENT REQUEST
  // ─────────────────────────────────────────────
  @Put('admin/requests/:id/approve')
  @UseGuards(JwtAuthGuard)
  async approveRequest(@Param('id') id: string, @Body() body: { notes?: string }) {
    const pr = await this.paymentRequestRepo.findOne({ where: { id } });
    if (!pr) throw new HttpException('Solicitud no encontrada', HttpStatus.NOT_FOUND);

    // Activate subscription
    await this.subRepo.update({ user_id: pr.user_id }, { status: SubscriptionStatus.EXPIRED });
    const sub = this.subRepo.create({
      user_id: pr.user_id,
      plan_id: pr.plan_id,
      status: SubscriptionStatus.ACTIVE,
      starts_at: new Date(),
    });
    await this.subRepo.save(sub);

    // Update request status
    pr.status = PaymentRequestStatus.APPROVED;
    pr.admin_notes = body.notes || 'Pago verificado y aprobado.';
    await this.paymentRequestRepo.save(pr);

    return { message: 'Suscripción activada correctamente.' };
  }

  // ─────────────────────────────────────────────
  // ADMIN: REJECT PAYMENT REQUEST
  // ─────────────────────────────────────────────
  @Put('admin/requests/:id/reject')
  @UseGuards(JwtAuthGuard)
  async rejectRequest(@Param('id') id: string, @Body() body: { notes?: string }) {
    const pr = await this.paymentRequestRepo.findOne({ where: { id } });
    if (!pr) throw new HttpException('Solicitud no encontrada', HttpStatus.NOT_FOUND);

    pr.status = PaymentRequestStatus.REJECTED;
    pr.admin_notes = body.notes || 'Pago no verificado.';
    await this.paymentRequestRepo.save(pr);

    return { message: 'Solicitud rechazada.' };
  }
}
