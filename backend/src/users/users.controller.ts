import { Controller, Get, UseGuards, Request, Patch, Param, Body, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// @Roles('SuperAdmin')

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: any) {
    return this.usersService.getMe(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.update(id, { status });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User and all associated data deleted successfully' };
  }
}
