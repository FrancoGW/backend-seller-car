import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'siteconfig' })
export class SiteConfig {
  @Prop({ required: true, unique: true, default: 'default' })
  key: string;

  @Prop({ type: Object, default: {} })
  value: Record<string, unknown>;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);
