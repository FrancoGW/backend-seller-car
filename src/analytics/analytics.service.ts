import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsEvent } from './analytics.schema';
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(1).max(100),
  payload: z.record(z.unknown()).optional(),
  path: z.string().max(500).optional(),
});

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(AnalyticsEvent.name) private analyticsModel: Model<AnalyticsEvent>) {}

  async create(body: unknown, sessionId?: string) {
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Datos inválidos');
    await this.analyticsModel.create({
      name: parsed.data.name,
      payload: parsed.data.payload,
      path: parsed.data.path,
      sessionId,
    });
    return { success: true };
  }
}
