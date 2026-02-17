import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'vehicles' })
export class Vehicle {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) price: number;
  @Prop({ default: 'ARS' }) currency: string;
  @Prop({ required: true }) brand: string;
  @Prop({ required: true }) model: string;
  @Prop({ required: true }) year: number;
  @Prop() mileage?: number;
  @Prop() fuel?: string;
  @Prop() transmission?: string;
  @Prop() color?: string;
  @Prop() bodyType?: string;
  @Prop() doors?: number;
  @Prop([String]) details?: string[];
  @Prop() location?: string;
  @Prop({ type: [String], default: [] }) images: string[];
  @Prop({ default: false }) featured: boolean;
  @Prop({ default: false }) published: boolean;
  @Prop() vtvExpiresAt?: Date;
  @Prop() patentExpiresAt?: Date;
  @Prop() clientFirstName?: string;
  @Prop() clientLastName?: string;
  @Prop() clientDni?: string;
  @Prop() sellerPhone?: string;
  @Prop() sellerEmail?: string;
  @Prop() plan?: string;
  @Prop() planExpiresAt?: Date;
  @Prop() addonDestacado24hUntil?: Date;
  @Prop() addonPrioritario7dUntil?: Date;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
VehicleSchema.index({ published: 1, createdAt: -1 });
VehicleSchema.index({ brand: 1, model: 1 });
VehicleSchema.index({ price: 1 });
