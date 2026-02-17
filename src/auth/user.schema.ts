import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name?: string;

  @Prop()
  passwordHash?: string;

  @Prop({ enum: ['admin', 'user'], default: 'user' })
  role: 'admin' | 'user';

  @Prop()
  image?: string;

  @Prop()
  emailVerified?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
