import { z } from 'zod';

export const vehicleSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  description: z.string().min(10).max(5000),
  price: z.number().min(0),
  currency: z.string().length(3).optional().default('ARS'),
  brand: z.string().min(1, 'Marca requerida').max(100),
  model: z.string().min(1, 'Modelo requerido').max(100),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0).optional().nullable(),
  fuel: z.string().max(50).optional().nullable(),
  transmission: z.string().max(50).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  bodyType: z
    .string()
    .max(80)
    .optional()
    .nullable()
    .transform((v) => (v === '' || v === 'ninguno' ? null : v)),
  doors: z.number().min(2).max(6).optional().nullable(),
  details: z.array(z.string().min(1).max(300)).default([]),
  location: z.string().max(200).optional().nullable(),
  images: z.array(z.string().url()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  vtvExpiresAt: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : null)),
  patentExpiresAt: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : null)),
  clientFirstName: z.string().max(100).optional().nullable(),
  clientLastName: z.string().max(100).optional().nullable(),
  clientDni: z.string().max(20).optional().nullable(),
  sellerPhone: z.string().max(30).optional().nullable(),
  sellerEmail: z
    .string()
    .max(120)
    .optional()
    .nullable()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email inválido'),
  plan: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v === '' || !v || v === 'ninguno' ? null : v)),
  planExpiresAt: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : null)),
  addonDestacado24hUntil: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : null)),
  addonPrioritario7dUntil: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : null)),
}).refine(
  (data) => {
    const phone = (data.sellerPhone ?? '').replace(/\D/g, '');
    const email = (data.sellerEmail ?? '').trim();
    return phone.length >= 8 || email.length > 0;
  },
  { message: 'Ingresá al menos un contacto: teléfono (WhatsApp) o email del vendedor.', path: ['sellerPhone'] }
);

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  brand: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minYear: z.coerce.number().optional(),
  maxYear: z.coerce.number().optional(),
  featured: z.coerce.boolean().optional(),
});
