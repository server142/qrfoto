import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, PlanType } from './entities/plan.entity';
import { PlansController } from './plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController],
})
export class PlansModule implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) { }

  async onModuleInit() {
    const plansCount = await this.planRepo.count();
    if (plansCount < 3) {
      await this.planRepo.query('SET FOREIGN_KEY_CHECKS = 0;');
      await this.planRepo.query('TRUNCATE table plans;');
      await this.planRepo.query('TRUNCATE table subscriptions;');
      await this.planRepo.query('SET FOREIGN_KEY_CHECKS = 1;');
      await this.planRepo.save([
        this.planRepo.create({
          name: 'Free',
          type: PlanType.FREE,
          price: 0,
          max_events: 1,
          storage_limit_mb: 50, // approx 10 uploads
          event_duration_days: 15,
        }),
        this.planRepo.create({
          name: 'Plata',
          type: PlanType.MONTHLY,
          price: 800,
          max_events: 1,
          storage_limit_mb: 3000,
          event_duration_days: 30,
        }),
        this.planRepo.create({
          name: 'Oro',
          type: PlanType.ANNUAL,
          price: 1500,
          max_events: 3,
          storage_limit_mb: 10000,
          event_duration_days: 30,
        })
      ]);
      console.log('Seed: Planes Free, Plata y Oro creados automáticamente');
    }
  }
}
