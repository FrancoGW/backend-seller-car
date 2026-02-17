import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'contacts' })
export class Contact {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop() phone?: string;
  @Prop({ required: true }) message: string;
  @Prop({ type: Types.ObjectId, ref: 'Vehicle' }) vehicleId?: Types.ObjectId;
  @Prop({ default: 'web' }) source: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
