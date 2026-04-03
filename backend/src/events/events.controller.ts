import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createEventDto: any, @Request() req: any) {
        return this.eventsService.create(createEventDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req: any) {
        return this.eventsService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Get('slug/:slug')
    findOneBySlug(@Param('slug') slug: string) {
        return this.eventsService.findOneBySlug(slug);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() updateEventDto: any) {
        return this.eventsService.update(id, updateEventDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/status')
    toggleStatus(@Param('id') id: string) {
        return this.eventsService.toggleStatus(id);
    }
}
