import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PromocodesService } from './promocodes.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) { }

  @Get('validate/:code')
  validateCode(@Param('code') code: string) {
    return this.promocodesService.validateCode(code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @Post()
  create(@Body() createDto: CreatePromocodeDto) {
    return this.promocodesService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @Get()
  findAll() {
    return this.promocodesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @Get('commissions')
  getCommissions() {
    return this.promocodesService.getCommissions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocodesService.remove(id);
  }
}
