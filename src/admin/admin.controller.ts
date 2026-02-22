import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  async stats() {
    return this.adminService.getStats();
  }

  @Get('contactos')
  async contactos(@Query('limit') limit?: string) {
    return this.adminService.getContacts(limit ? Number(limit) : 100);
  }

  @Post('contactos/:id/reply')
  async replyContact(
    @Param('id') id: string,
    @Body() body: { subject?: string; body?: string },
  ) {
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
    const text = typeof body?.body === 'string' ? body.body.trim() : '';
    if (!subject) throw new BadRequestException('El asunto es obligatorio');
    if (!text) throw new BadRequestException('El mensaje es obligatorio');
    return this.adminService.replyToContact(id, subject, text);
  }
}
