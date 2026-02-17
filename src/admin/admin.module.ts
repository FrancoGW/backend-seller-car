import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Vehicle, VehicleSchema } from '../vehicles/vehicle.schema';
import { Contact, ContactSchema } from '../contact/contact.schema';
import { AnalyticsEvent, AnalyticsEventSchema } from '../analytics/analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
