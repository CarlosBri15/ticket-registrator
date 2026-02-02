import { Injectable } from '@nestjs/common';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName;

  constructor(private configService: ConfigService){
    this.storage = new Storage({
      projectId: configService.get<string>('GCP_PROJECT_ID'),
      keyFilename: join(process.cwd(), this.configService.get<string>('GCP_KEY_FILE_PATH')!)
    });
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

  findAll() {
    return `This action returns all storage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storage`;
  }

  update(id: number, updateStorageDto: UpdateStorageDto) {
    return `This action updates a #${id} storage`;
  }

  remove(id: number) {
    return `This action removes a #${id} storage`;
  }
}
