import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import express, { Request, Response } from 'express';
import type { Express } from 'express';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

export class AppFactory {
  static create(): {
    appPromise: Promise<INestApplication>;
    expressApp: Express;
  } {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const appPromise = NestFactory.create(AppModule, adapter);

    appPromise
      .then((app) => {
        const origin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*';
        app.enableCors({
          origin: origin === '*' ? true : origin.split(',').map((o) => o.trim()),
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
        });
        app.setGlobalPrefix('api');
        return app.init();
      })
      .catch((err) => {
        throw err;
      });

    // Middleware que espera a que Nest esté inicializado (necesario para serverless/cold start)
    expressApp.use((req: Request, res: Response, next) => {
      appPromise
        .then(async (app) => {
          await app.init();
          next();
        })
        .catch((err) => next(err));
    });

    return { appPromise, expressApp };
  }
}
