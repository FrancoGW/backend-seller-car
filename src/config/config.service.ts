import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteConfig } from './site-config.schema';

const DEFAULT_KEY = 'default';

export interface HeroSliderConfig {
  images: string[];
  /** si está vacío, usa la primera imagen a ancho completo */
}

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(SiteConfig.name) private configModel: Model<SiteConfig>,
  ) {}

  private async getConfig(): Promise<Record<string, unknown>> {
    const doc = await this.configModel.findOne({ key: DEFAULT_KEY }).lean();
    return (doc?.value as Record<string, unknown>) ?? {};
  }

  async getHeroSlider(): Promise<HeroSliderConfig> {
    const config = await this.getConfig();
    const hero = config.heroSlider as HeroSliderConfig | undefined;
    const images = Array.isArray(hero?.images) && hero.images.length > 0
      ? hero.images
      : ['/hero-slider.png'];
    return { images };
  }

  async setHeroSlider(data: Partial<HeroSliderConfig>): Promise<HeroSliderConfig> {
    const config = await this.getConfig();
    const current = (config.heroSlider as HeroSliderConfig) ?? { images: [] };
    const images = Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : current.images.length > 0 ? current.images : ['/hero-slider.png'];
    const updated = { ...current, ...data, images };
    await this.configModel.findOneAndUpdate(
      { key: DEFAULT_KEY },
      { $set: { value: { ...config, heroSlider: updated } } },
      { upsert: true },
    );
    return { images };
  }
}
