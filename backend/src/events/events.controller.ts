import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ReviewsService } from '../reviews/reviews.service';

@Controller('api/events')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly authService: AuthService,
        private readonly reviewsService: ReviewsService
    ) { }

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
    async toggleStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const { password, rating, comment } = body;

        // Validar contraseña obligatoria
        if (!password) {
            throw new UnauthorizedException('Contraseña requerida');
        }

        const user = await this.authService.validateUser(req.user.email, password);
        if (!user) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        // Toggle el estado
        const event = await this.eventsService.toggleStatus(id);

        // Si se acaba de finalizar y dejó rating opcional, lo guardamos
        if (event.status === 'Finished' && rating) {
            await this.reviewsService.create(req.user.userId, rating, comment, event.id);
        }

        return event;
    }
}

