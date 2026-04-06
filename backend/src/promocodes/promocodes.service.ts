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
  ) { }

  async create(createDto: CreatePromocodeDto): Promise<Promocode> {
    const existing = await this.promocodeRepo.findOne({ where: { code: createDto.code } });
    if (existing) {
      throw new BadRequestException('El código ya existe');
    }
    const promocode = this.promocodeRepo.create(createDto);
    return this.promocodeRepo.save(promocode);
  }

  async findAll(): Promise<Promocode[]> {
    const codes = await this.promocodeRepo.find({ order: { created_at: 'DESC' } });
    // Limpiamos los objetos para máxima compatibilidad con el JSON.stringify del servidor
    return codes.map(c => ({
      ...c,
      commissions: undefined
    } as any));
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

  async recordUsage(
    codeId: string,
    userId: string,
    planName: string,
    originalPrice: number,
    amountPaid: number
  ) {
    const promocode = await this.promocodeRepo.findOne({ where: { id: codeId } });
    if (!promocode) return;

    let commission = 0;
    if (promocode.commission_type === 'fixed') {
      commission = Number(promocode.commission_value);
    } else {
      commission = (Number(amountPaid) * Number(promocode.commission_value)) / 100;
    }

    const tracking = this.commissionRepo.create({
      promocode_id: promocode.id,
      user_id: userId,
      plan_name: planName,
      original_price: originalPrice,
      amount_paid: amountPaid,
      commission_earned: commission,
      status: 'pending'
    });

    await this.commissionRepo.save(tracking);
    promocode.used_count += 1;
    await this.promocodeRepo.save(promocode);
  }

  async getCommissions(): Promise<CommissionTracking[]> {
    const list = await this.commissionRepo.find({
      relations: ['promocode'],
      order: { created_at: 'DESC' }
    });

    return list.map(item => {
      const plain = { ...item };
      if (plain.promocode) {
        plain.promocode = {
          code: item.promocode.code,
          promoter_name: item.promocode.promoter_name
        } as any;
      }
      return plain;
    });
  }
}
