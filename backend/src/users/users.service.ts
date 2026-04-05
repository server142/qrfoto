import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subRepository: Repository<Subscription>,
  ) { }

  async getMe(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    const sub = await this.subRepository.findOne({
      where: { user_id: userId, status: 'Active' as any },
      relations: ['plan'],
      order: { starts_at: 'DESC' }
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return { ...safeUser, activePlan: sub ? sub.plan : null };
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(newUser);
    
    // Asignar plan FREE por defecto
    try {
      const plans = await this.subRepository.manager.query('SELECT id FROM plans WHERE type = "Free" OR name = "Free" LIMIT 1');
      if (plans && plans.length > 0) {
        const freePlanId = plans[0].id;
        const sub = this.subRepository.create({
          user_id: savedUser.id,
          plan_id: freePlanId,
          status: 'Active' as any,
          starts_at: new Date(),
          ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        });
        await this.subRepository.save(sub);
        console.log(`Plan FREE asignado a ${savedUser.email}`);
      }
    } catch (err) {
      console.error('No se pudo asignar plan por defecto:', err.message);
    }

    return savedUser;
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, updateData);
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { reset_password_token: token }
    });
  }
}
