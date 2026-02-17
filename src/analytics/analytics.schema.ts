import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'analytics_events' })
export class AnalyticsEvent {
  @Prop({ required: true }) name: string;
  @Prop({ type: MongooseSchema.Types.Mixed }) payload?: Record<string, unknown>;
  @Prop() sessionId?: string;
  @Prop() path?: string;
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);
AnalyticsEventSchema.index({ name: 1, createdAt: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });
