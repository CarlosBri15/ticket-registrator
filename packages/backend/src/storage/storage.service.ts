import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { GetSignedUrlConfig } from '@google-cloud/storage';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName;

  constructor(private configService: ConfigService){
    const storageOptions: any = {
      projectId: configService.get<string>('GCP_PROJECT_ID'),
    };

    const keyPath = this.configService.get<string>('GCP_KEY_FILE_PATH');
    // Solo intentamos cargar el archivo si la variable existe y no es el string 'undefined' o el contenido de un JSON
    if (keyPath && keyPath.length < 100 && keyPath !== 'undefined') {
      storageOptions.keyFilename = join(process.cwd(), keyPath);
    }

    this.storage = new Storage(storageOptions);
    this.bucketName = configService.get<string>('GCP_BUCKET_NAME');
  }

  uploadFile(file: Express.Multer.File) : Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => reject(error));

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.end(file.buffer);
    })
  }

  async findFile(fileName: string) {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    const [exists] = await file.exists();

    if(!exists){
      throw new Error("The file does not exists");
    }

    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000
    }

    const [url] = await file.getSignedUrl(options);
    return url;
  }

  async removeFile(fileName: string) {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);

    try{
      await file.delete();
    } catch (error) {
      if (error.code === 404){
        throw new Error('Not found');
      }

      throw error;
    }
  }
}
