import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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
}
