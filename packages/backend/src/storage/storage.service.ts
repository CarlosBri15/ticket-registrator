import { Injectable, Logger } from '@nestjs/common';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import {
  StorageFileNotFoundException,
  StorageUploadException,
  StorageRemoveException,
} from './exceptions/storage.exceptions';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const storageOptions: any = {
      projectId: configService.get<string>('GCP_PROJECT_ID'),
    };

    const keyPath = this.configService.get<string>('GCP_KEY_FILE_PATH');
    if (keyPath && keyPath.length < 100 && keyPath !== 'undefined') {
      storageOptions.keyFilename = join(process.cwd(), keyPath);
    }

    this.storage = new Storage(storageOptions);
    this.bucketName = configService.get<string>('GCP_BUCKET_NAME') ?? '';
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype },
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        this.logger.error(`Upload failed for file ${fileName}`, error);
        reject(new StorageUploadException());
      });
      stream.on('finish', () => {
        this.logger.log(`File uploaded: ${fileName}`);
        resolve(fileName);
      });
      stream.end(file.buffer);
    });
  }

  async findFile(fileName: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      throw new StorageFileNotFoundException(fileName);
    }

    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,
    };

    const [url] = await file.getSignedUrl(options);
    return url;
  }

  async removeFile(fileName: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    try {
      await file.delete();
      this.logger.log(`File removed: ${fileName}`);
    } catch (error: any) {
      if (error.code === 404) {
        throw new StorageFileNotFoundException(fileName);
      }
      this.logger.error(`Remove failed for file ${fileName}`, error);
      throw new StorageRemoveException();
    }
  }
}
