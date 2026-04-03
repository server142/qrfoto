import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('api/plans')
export class PlansController {
  constructor(@InjectRepository(Plan) private planRepo: Repository<Plan>) {}

  @Get()
  async findAll() { 
    return await this.planRepo.find({ order: { price: 'ASC' } }); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  async create(@Body() body: any) {
    const plan = this.planRepo.create(body);
    return await this.planRepo.save(plan);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    await this.planRepo.update(id, body);
    return await this.planRepo.findOneBy({ id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.planRepo.delete(id);
  }
}
