import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

const FOLDER = 'sellercar/vehicles';

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

  async upload(buffer: Buffer): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: FOLDER, resource_type: 'image' },
        (err, result) => {
          if (err) return reject(err);
          if (!result?.secure_url) return reject(new Error('Upload sin URL'));
          resolve({ url: result.secure_url, publicId: result.public_id ?? '' });
        },
      );
      uploadStream.write(buffer);
      uploadStream.end();
    });
  }
}
