import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subscription])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async onModuleInit() {
    const adminEmail = 'admin@qrfoto.com';
    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('AdminQRFoto2026!', 10);
      const admin = this.userRepository.create({
        first_name: 'Super',
        last_name: 'Admin',
        email: adminEmail,
        password_hash: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      });
      await this.userRepository.save(admin);
      console.log('Seed: SuperAdmin account created.');
    }
  }
}
