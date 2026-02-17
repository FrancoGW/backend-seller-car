import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from '../vehicles/vehicle.schema';

@Controller('contact')
export class ContactController {
  constructor(
    private contactService: ContactService,
    private sendgrid: SendgridService,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
  ) {}

  @Post()
  async create(@Body() body: unknown) {
    const contact = await this.contactService.create(body);
    let vehicleTitle: string | undefined;
    if (contact.vehicleId) {
      const v = await this.vehicleModel.findById(contact.vehicleId).select('title').lean();
      vehicleTitle = v?.title;
    }
    await this.sendgrid.notifyNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      vehicleTitle,
    });
    return { success: true, id: contact._id };
  }
}
