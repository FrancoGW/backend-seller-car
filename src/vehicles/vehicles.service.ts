import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Vehicle } from './vehicle.schema';
import { vehicleSchema, vehicleQuerySchema } from './validation';
import { sanitizeObject } from './sanitize';

const PER_PAGE = 12;

@Injectable()
export class VehiclesService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>) {}

  async findPublic(query: Record<string, unknown>) {
    const parsed = vehicleQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException('Parámetros inválidos');
    const { page, limit, brand, minPrice, maxPrice, minYear, maxYear, featured } = parsed.data;
    const filter: Record<string, unknown> = { published: true };
    if (brand) filter['brand'] = new RegExp(brand, 'i');
    if (minPrice != null) filter['price'] = { ...((filter['price'] as object) || {}), $gte: minPrice };
    if (maxPrice != null) filter['price'] = { ...((filter['price'] as object) || {}), $lte: maxPrice };
    if (minYear != null) filter['year'] = { ...((filter['year'] as object) || {}), $gte: minYear };
    if (maxYear != null) filter['year'] = { ...((filter['year'] as object) || {}), $lte: maxYear };
    if (featured === true) filter['featured'] = true;

    const skip = ((page || 1) - 1) * (limit || PER_PAGE);
    const [items, total] = await Promise.all([
      this.vehicleModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit || PER_PAGE).lean(),
      this.vehicleModel.countDocuments(filter),
    ]);
    return { items, total, page: page || 1, limit: limit || PER_PAGE, totalPages: Math.ceil(total / (limit || PER_PAGE)) };
  }

  async findOnePublic(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('ID inválido');
    const vehicle = await this.vehicleModel.findOne({ _id: id, published: true }).lean();
    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    return vehicle;
  }

  async findAdmin(query: Record<string, unknown>) {
    const parsed = vehicleQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException('Parámetros inválidos');
    const { page, limit, brand, search, minPrice, maxPrice, featured } = parsed.data;
    const filter: Record<string, unknown> = {};
    if (brand) filter['brand'] = new RegExp(brand, 'i');
    if (search?.trim()) {
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(term, 'i');
      filter['$or'] = [
        { brand: re },
        { model: re },
        { clientFirstName: re },
        { clientLastName: re },
        { sellerPhone: re },
        { sellerEmail: re },
        { clientDni: re },
      ];
    }
    if (minPrice != null) filter['price'] = { ...((filter['price'] as object) || {}), $gte: minPrice };
    if (maxPrice != null) filter['price'] = { ...((filter['price'] as object) || {}), $lte: maxPrice };
    if (featured === true) filter['featured'] = true;

    const skip = ((page || 1) - 1) * (limit || 12);
    const [items, total] = await Promise.all([
      this.vehicleModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit || 12).lean(),
      this.vehicleModel.countDocuments(filter),
    ]);
    return { items, total, page: page || 1, limit: limit || 12, totalPages: Math.ceil(total / (limit || 12)) };
  }

  async findOneAdmin(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('ID inválido');
    const vehicle = await this.vehicleModel.findById(id).lean();
    if (!vehicle) throw new NotFoundException('No encontrado');
    return vehicle;
  }

  async create(body: unknown) {
    const parsed = vehicleSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ error: 'Datos inválidos', details: parsed.error.flatten() });
    const data = parsed.data;
    const now = new Date();
    const isPublishing = !!data.published && !!data.plan && data.plan !== 'ninguno';
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    const toSave = {
      ...data,
      ...(data.published ? { publishedAt: now } : {}),
      vtvExpiresAt: data.vtvExpiresAt ? new Date(data.vtvExpiresAt) : undefined,
      patentExpiresAt: data.patentExpiresAt ? new Date(data.patentExpiresAt) : undefined,
      ...(data.plan && data.plan !== 'ninguno'
        ? { planExpiresAt: data.planExpiresAt ? new Date(data.planExpiresAt) : (isPublishing ? oneMonthLater : undefined) }
        : {}),
      addonDestacado24hUntil: data.addonDestacado24hUntil ? new Date(data.addonDestacado24hUntil) : undefined,
      addonPrioritario7dUntil: data.addonPrioritario7dUntil ? new Date(data.addonPrioritario7dUntil) : undefined,
    };
    const vehicle = await this.vehicleModel.create(sanitizeObject(toSave as Record<string, unknown>));
    return vehicle;
  }

  async update(id: string, body: unknown) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('ID inválido');
    const parsed = vehicleSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ error: 'Datos inválidos', details: parsed.error.flatten() });
    const data = parsed.data;
    const current = await this.vehicleModel.findById(id).lean();
    if (!current) throw new NotFoundException('No encontrado');

    const now = new Date();
    const wasPublished = !!current.published;
    const isPublishing = !!data.published && !wasPublished;
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    let planExpiresAt: Date | undefined = data.planExpiresAt ? new Date(data.planExpiresAt) : undefined;
    if (isPublishing && data.plan && data.plan !== 'ninguno') {
      planExpiresAt = oneMonthFromNow;
    }
    const existingPublishedAt = (current as { publishedAt?: Date }).publishedAt;
    let publishedAt = existingPublishedAt != null ? new Date(existingPublishedAt) : undefined;
    if (data.published && !wasPublished) {
      publishedAt = now;
    }

    if (data.featured === true) {
      const featuredCount = await this.vehicleModel.countDocuments({ featured: true, _id: { $ne: id } });
      if (featuredCount >= 6) {
        throw new BadRequestException('Ya hay 6 publicaciones destacadas. Desmarcá otra para destacar esta.');
      }
    }

    const toSave = {
      ...data,
      ...(publishedAt ? { publishedAt } : {}),
      vtvExpiresAt: data.vtvExpiresAt ? new Date(data.vtvExpiresAt) : undefined,
      patentExpiresAt: data.patentExpiresAt ? new Date(data.patentExpiresAt) : undefined,
      ...(planExpiresAt ? { planExpiresAt } : {}),
      addonDestacado24hUntil: data.addonDestacado24hUntil ? new Date(data.addonDestacado24hUntil) : undefined,
      addonPrioritario7dUntil: data.addonPrioritario7dUntil ? new Date(data.addonPrioritario7dUntil) : undefined,
    };
    const vehicle = await this.vehicleModel
      .findByIdAndUpdate(id, { $set: sanitizeObject(toSave as Record<string, unknown>) }, { new: true })
      .lean();
    if (!vehicle) throw new NotFoundException('No encontrado');
    return vehicle;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('ID inválido');
    const vehicle = await this.vehicleModel.findByIdAndDelete(id);
    if (!vehicle) throw new NotFoundException('No encontrado');
    return { success: true };
  }
}
