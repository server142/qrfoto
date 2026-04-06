import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { MediaModule } from './media/media.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { PromocodesModule } from './promocodes/promocodes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    EventsModule,
    AuthModule,
    UsersModule,
    PlansModule,
    MediaModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    PromocodesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
