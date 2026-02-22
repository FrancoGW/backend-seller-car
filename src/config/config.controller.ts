import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { ConfigService, HeroSliderConfig } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('config')
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get('hero')
  async getHero() {
    return this.configService.getHeroSlider();
  }
}

@Controller('admin/config')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminConfigController {
  constructor(private configService: ConfigService) {}

  @Get('hero')
  async getHero() {
    return this.configService.getHeroSlider();
  }

  @Put('hero')
  async setHero(@Body() body: Partial<HeroSliderConfig>) {
    return this.configService.setHeroSlider(body);
  }
}
