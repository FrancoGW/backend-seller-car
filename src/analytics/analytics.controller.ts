import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post()
  async create(@Body() body: unknown, @Headers('x-session-id') sessionId?: string) {
    return this.analyticsService.create(body, sessionId);
  }
}
