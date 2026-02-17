import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().max(30).optional(),
  message: z.string().min(10, 'Mensaje mínimo 10 caracteres').max(2000),
  vehicleId: z.string().optional(),
  source: z.string().max(50).optional().default('web'),
});
