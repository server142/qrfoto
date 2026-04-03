import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Get()
  findApproved() {
    return this.reviewsService.findAll(false);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAllAdmin() {
    return this.reviewsService.findAll(true);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/toggle')
  toggleApproval(@Param('id') id: string) {
    return this.reviewsService.toggleApproval(id);
  }
}
