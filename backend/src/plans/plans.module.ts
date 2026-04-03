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
    const count = await this.planRepo.count();
    if (count === 0) {
      await this.planRepo.save(
        this.planRepo.create({
          name: 'Free Plan',
          type: PlanType.FREE,
          price: 0,
          max_events: 1,
          storage_limit_mb: 100,
          event_duration_days: 15,
        })
      );
      console.log('Seed: Plan Free creado automáticamente');
    }
  }
}
