import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteConfig, SiteConfigSchema } from './site-config.schema';
import { ConfigService } from './config.service';
import { ConfigController, AdminConfigController } from './config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SiteConfig.name, schema: SiteConfigSchema }]),
  ],
  controllers: [ConfigController, AdminConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
