import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    async create(@Body() leadData: any) {
        return this.leadsService.create(leadData);
    }

    @UseGuards(JwtAuthGuard)
    @Get('event/:slug')
    async findByEvent(@Param('slug') slug: string) {
        return this.leadsService.findByEventSlug(slug);
    }
}
