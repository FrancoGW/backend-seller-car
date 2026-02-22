import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from '../vehicles/vehicle.schema';
import { Contact } from '../contact/contact.schema';
import { AnalyticsEvent } from '../analytics/analytics.schema';
import { SendgridService } from '../sendgrid/sendgrid.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    @InjectModel(AnalyticsEvent.name) private analyticsModel: Model<AnalyticsEvent>,
    private sendgrid: SendgridService,
  ) {}

  async getStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalVehicles,
      publishedVehicles,
      featuredCount,
      totalContacts,
      viewsLast30,
      viewsByDay,
      vehiclesExpiringSoon,
      avgPriceResult,
      byBrand,
    ] = await Promise.all([
      this.vehicleModel.countDocuments(),
      this.vehicleModel.countDocuments({ published: true }),
      this.vehicleModel.countDocuments({ featured: true }),
      this.contactModel.countDocuments(),
      this.analyticsModel.countDocuments({
        name: 'page_view',
        path: /^\/vehiculos\//,
        createdAt: { $gte: thirtyDaysAgo },
      }),
      this.analyticsModel.aggregate([
        { $match: { name: 'page_view', path: /^\/vehiculos\//, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      this.vehicleModel
        .find({
          $or: [
            { patentExpiresAt: { $exists: true, $ne: null, $lte: sevenDaysLater } },
            { vtvExpiresAt: { $exists: true, $ne: null, $lte: sevenDaysLater } },
          ],
        })
        .sort({ patentExpiresAt: 1 })
        .limit(10)
        .lean(),
      this.vehicleModel.aggregate([{ $match: { published: true } }, { $group: { _id: null, avg: { $avg: '$price' } } }]),
      this.vehicleModel.aggregate([
        { $match: { published: true } },
        { $group: { _id: '$brand', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const viewsByDayMap = (viewsByDay as { _id: string; count: number }[]).map((d) => ({ date: d._id, vistas: d.count }));
    const expiringVehicles = (vehiclesExpiringSoon as { _id: unknown; title?: string; brand?: string; model?: string; images?: string[]; patentExpiresAt?: Date; vtvExpiresAt?: Date }[]).map((v) => {
      const expiresAt = v.patentExpiresAt ?? v.vtvExpiresAt ?? null;
      const days = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        id: String(v._id),
        title: v.title ?? `${v.brand} ${v.model}`,
        image: (v.images as string[])?.[0],
        daysRemaining: days,
      };
    });

    const avgPrice = avgPriceResult[0]?.avg ?? 0;
    const byBrandMap = (byBrand as { _id: string; count: number; avgPrice: number }[]).map((b) => ({
      marca: b._id,
      cantidad: b.count,
      precioPromedio: b.avgPrice ?? 0,
    }));

    return {
      totalVehicles,
      publishedVehicles,
      featuredCount,
      totalContacts,
      viewsLast30,
      avgPrice,
      viewsByDay: viewsByDayMap,
      expiringVehicles,
      byBrand: byBrandMap,
    };
  }

  async getContacts(limit = 100) {
    const items = await this.contactModel.find().sort({ createdAt: -1 }).limit(limit).lean();
    return { items };
  }

  async replyToContact(contactId: string, subject: string, body: string) {
    const contact = await this.contactModel.findById(contactId);
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    const result = await this.sendgrid.sendEmail({
      to: contact.email,
      subject,
      text: body,
    });
    if (result && 'error' in result && result.error) {
      throw new BadRequestException('No se pudo enviar el correo: ' + (result.error as string));
    }
    contact.status = 'contestado';
    contact.repliedAt = new Date();
    await contact.save();
    return { success: true };
  }

  async updateContactStatus(contactId: string, status: string) {
    if (status !== 'pendiente' && status !== 'contestado') {
      throw new BadRequestException('Estado debe ser pendiente o contestado');
    }
    const contact = await this.contactModel.findByIdAndUpdate(
      contactId,
      { status, ...(status === 'pendiente' ? { repliedAt: null } : { repliedAt: new Date() }) },
      { new: true },
    );
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    return { success: true, status: contact.status };
  }
}
