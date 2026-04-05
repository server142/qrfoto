import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';
import { MailService } from '../common/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;

    // Check if the password matches
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (isMatch) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }

  async register(registerDto: any) {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(registerDto.password, saltRounds);

    const newUser = await this.usersService.create({
      email: registerDto.email,
      password_hash,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      role: registerDto.role || UserRole.USER
    });

    const { password_hash: _pw, ...result } = newUser;
    // Log in automatically after registration
    return this.login(result);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Por seguridad, no decimos si el usuario existe o no, pero retornamos éxito simulado
      return { message: 'Si el correo existe, se enviará un enlace de recuperación.' };
    }

    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Expira en 1 hora

    await this.usersService.update(user.id, {
      reset_password_token: token,
      reset_password_expires: expires,
    });

    await this.mailService.sendResetPasswordEmail(user.email, token);

    return { message: 'Si el correo existe, se enviará un enlace de recuperación.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByToken(token);

    if (!user || !user.reset_password_expires || new Date() > user.reset_password_expires) {
      throw new BadRequestException('Token inválido o expirado.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.usersService.update(user.id, {
      password_hash: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    });

    return { message: 'Contraseña actualizada con éxito.' };
  }
}
