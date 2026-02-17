import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ContactModule } from './contact/contact.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { SendgridModule } from './sendgrid/sendgrid.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      dbName: 'StuntArgentinoCars',
    }),
    SendgridModule,
    AuthModule,
    VehiclesModule,
    ContactModule,
    AnalyticsModule,
    UploadModule,
    AdminModule,
  ],
})
export class AppModule {}
