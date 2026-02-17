# SellerCar – Backend

API NestJS para el proyecto SellerCar (vehículos, contacto, admin, analytics).

## Desarrollo local

```bash
npm install
cp .env.example .env   # completar variables
npm run start:dev
```

La API queda en `http://localhost:3001` con prefijo global `/api`.

## Despliegue en Vercel

1. Conectar este repositorio a un proyecto en [Vercel](https://vercel.com).
2. En **Settings → Environment Variables** configurar las mismas variables que en `.env.example` (sobre todo `MONGODB_URI`, `JWT_SECRET`, y las que uses para SendGrid y Cloudinary).
3. Deploy: cada push a la rama principal despliega automáticamente.

La raíz de la API en producción será `https://tu-proyecto.vercel.app/api` (p. ej. `GET /api/vehicles`).

## Scripts

- `npm run build` – compilar
- `npm run start` – ejecutar compilado
- `npm run start:dev` – desarrollo con watch
- `npm run start:prod` – producción con `node dist/main`
