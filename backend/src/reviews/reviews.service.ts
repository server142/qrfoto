import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
  ) { }

  async create(userId: string, rating: number, comment?: string, eventId?: string) {
    const review = this.reviewsRepo.create({
      user_id: userId,
      rating,
      comment,
      event_id: eventId,
    });
    return this.reviewsRepo.save(review);
  }

  async findAll(includeUnapproved = false) {
    const whereClause = includeUnapproved ? {} : { is_approved: true };
    return this.reviewsRepo.find({
      where: whereClause,
      relations: ['user', 'event'],
      order: { created_at: 'DESC' },
    });
  }

  async toggleApproval(id: string) {
    const review = await this.reviewsRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    review.is_approved = !review.is_approved;
    return this.reviewsRepo.save(review);
  }
}
