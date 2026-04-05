import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from '../common/mail.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
       imports: [ConfigModule],
       inject: [ConfigService],
       useFactory: async (configService: ConfigService) => ({
         secret: configService.get<string>('JWT_SECRET') || 'super_secret_jwt_key_qrfoto',
         signOptions: { 
           expiresIn: (configService.get<string>('JWT_EXPIRATION') || '24h') as any 
         },
       }),
    }),
  ],
  providers: [AuthService, JwtStrategy, MailService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
