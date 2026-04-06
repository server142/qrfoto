import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promocode } from './entities/promocode.entity';
import { CommissionTracking } from './entities/commission-tracking.entity';
import { CreatePromocodeDto } from './dto/create-promocode.dto';

@Injectable()
export class PromocodesService {
  constructor(
    @InjectRepository(Promocode)
    private readonly promocodeRepo: Repository<Promocode>,
    @InjectRepository(CommissionTracking)
    private readonly commissionRepo: Repository<CommissionTracking>,
  ) {}

  async create(createDto: CreatePromocodeDto): Promise<Promocode> {
    const existing = await this.promocodeRepo.findOne({ where: { code: createDto.code } });
    if (existing) {
      throw new BadRequestException('El código ya existe');
    }
    const promocode = this.promocodeRepo.create(createDto);
    return this.promocodeRepo.save(promocode);
  }

  async findAll(): Promise<Promocode[]> {
    return this.promocodeRepo.find({ order: { created_at: 'DESC' } });
  }

  async validateCode(code: string): Promise<Promocode> {
    const promocode = await this.promocodeRepo.findOne({ where: { code } });
    
    if (!promocode) {
      throw new NotFoundException('Código no encontrado');
    }

    if (!promocode.is_active) {
      throw new BadRequestException('El código no está activo');
    }

    if (promocode.expires_at && new Date() > promocode.expires_at) {
      throw new BadRequestException('El código ha expirado');
    }

    if (promocode.max_uses > 0 && promocode.used_count >= promocode.max_uses) {
      throw new BadRequestException('El código ya alcanzó su límite de usos');
    }

    return promocode;
  }

  async remove(id: string): Promise<void> {
    await this.promocodeRepo.delete(id);
  }

  // Se llamará desde el sistema de pagos cuando se apruebe una transacción
  async recordUsage(
    codeId: string, 
    userId: string, 
    planName: string, 
    originalPrice: number, 
    amountPaid: number
  ) {
    const promocode = await this.promocodeRepo.findOne({ where: { id: codeId } });
    if (!promocode) return;

    // Calcular comisión
    let commission = 0;
    if (promocode.commission_type === 'fixed') {
      commission = promocode.commission_value;
    } else {
      commission = (amountPaid * promocode.commission_value) / 100;
    }

    const tracking = this.commissionRepo.create({
      promocode_id: promocode.id,
      user_id: userId,
      plan_name: planName,
      original_price: originalPrice,
      amount_paid: amountPaid,
      commission_earned: commission,
      status: 'pending' // Comienza como por pagar
    });

    await this.commissionRepo.save(tracking);

    // Incrementar uso
    promocode.used_count += 1;
    await this.promocodeRepo.save(promocode);
  }

  async getCommissions(): Promise<CommissionTracking[]> {
    return this.commissionRepo.find({ 
      relations: ['promocode'],
      order: { created_at: 'DESC' }
    });
  }
}
