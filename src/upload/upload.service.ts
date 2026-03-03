import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import heicConvert = require('heic-convert');

const FOLDER = 'sellercar/vehicles';
const IMAGE_QUALITY = 80;
const MAX_IMAGE_WIDTH = 2000;

@Injectable()
export class UploadService {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
  }

  async upload(buffer: Buffer, mimetype?: string): Promise<{ url: string; publicId: string }> {
    const processedBuffer = await this.processBuffer(buffer, mimetype);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: FOLDER, resource_type: 'auto' },
        (err, result) => {
          if (err) return reject(err);
          if (!result?.secure_url) return reject(new Error('Upload sin URL'));
          resolve({ url: result.secure_url, publicId: result.public_id ?? '' });
        },
      );
      uploadStream.write(processedBuffer);
      uploadStream.end();
    });
  }

  private async processBuffer(buffer: Buffer, mimetype?: string): Promise<Buffer> {
    const isHeic = mimetype === 'image/heic' || mimetype === 'image/heif';
    const isImage = mimetype?.startsWith('image/');

    if (!isImage) return buffer;

    let imageBuffer = buffer;

    if (isHeic) {
      const converted = await heicConvert({ buffer, format: 'JPEG', quality: 1 });
      imageBuffer = Buffer.from(converted);
    }

    return sharp(imageBuffer)
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: IMAGE_QUALITY, mozjpeg: true })
      .toBuffer();
  }
}
