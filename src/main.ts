import { AppFactory } from './app.factory';

async function bootstrap() {
  const { appPromise } = AppFactory.create();
  const app = await appPromise;
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
