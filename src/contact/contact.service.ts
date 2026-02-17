import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Contact } from './contact.schema';
import { contactSchema } from './validation';
import { sanitizeString } from './sanitize';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async create(body: unknown) {
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ error: 'Datos inválidos', details: parsed.error.flatten() });
    const { name, email, phone, message, vehicleId, source } = parsed.data;
    const validVehicleId = vehicleId && Types.ObjectId.isValid(vehicleId) ? new Types.ObjectId(vehicleId) : undefined;
    const contact = await this.contactModel.create({
      name: sanitizeString(name),
      email: sanitizeString(email),
      phone: phone ? sanitizeString(phone) : undefined,
      message: sanitizeString(message, 2000),
      vehicleId: validVehicleId,
      source: sanitizeString(source ?? 'web'),
    });
    return contact;
  }
}
