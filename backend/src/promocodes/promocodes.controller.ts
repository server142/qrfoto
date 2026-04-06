import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PromocodesService } from './promocodes.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Asumiendo esto existe
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) {}

  // 1. Validar un código (Público o para usuarios autenticados)
  @Get('validate/:code')
  validateCode(@Param('code') code: string) {
    return this.promocodesService.validateCode(code);
  }

  // Rutas de Administración:
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Post()
  create(@Body() createDto: CreatePromocodeDto) {
    return this.promocodesService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Get()
  findAll() {
    return this.promocodesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Get('commissions')
  getCommissions() {
    return this.promocodesService.getCommissions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('superadmin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocodesService.remove(id);
  }
}
