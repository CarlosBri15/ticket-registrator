import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import {
  StorageFileNotFoundException,
  StorageUploadException,
  StorageRemoveException,
} from './exceptions/storage.exceptions';

describe('StorageService', () => {
  let service: StorageService;
  let mockFileBucket: any;
  let mockFile: any;

  const mockSignedUrl = 'https://storage.googleapis.com/bucket/file.jpg?signed=1';

  beforeEach(async () => {
    mockFile = {
      exists: jest.fn().mockResolvedValue([true]),
      getSignedUrl: jest.fn().mockResolvedValue([mockSignedUrl]),
      delete: jest.fn().mockResolvedValue(undefined),
      createWriteStream: jest.fn().mockReturnValue({
        on: jest.fn().mockImplementation(function (event: string, cb: Function) {
          if (event === 'finish') setTimeout(() => cb(), 0);
          return this;
        }),
        end: jest.fn(),
      }),
    };

    mockFileBucket = {
      file: jest.fn().mockReturnValue(mockFile),
    };

    const configServiceMock = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          GCP_PROJECT_ID: 'fake-project',
          GCP_BUCKET_NAME: 'fake-bucket',
          GCP_KEY_FILE_PATH: '',
        };
        return values[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    (service as any).storage = { bucket: jest.fn().mockReturnValue(mockFileBucket) };
    (service as any).bucketName = 'fake-bucket';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findFile ─────────────────────────────────────────────────────────────────

  describe('findFile', () => {
    it('should return signed URL for existing file', async () => {
      const url = await service.findFile('file.jpg');

      expect(mockFileBucket.file).toHaveBeenCalledWith('file.jpg');
      expect(mockFile.exists).toHaveBeenCalled();
      expect(mockFile.getSignedUrl).toHaveBeenCalled();
      expect(url).toBe(mockSignedUrl);
    });

    it('should throw StorageFileNotFoundException if file does not exist', async () => {
      mockFile.exists.mockResolvedValue([false]);

      await expect(service.findFile('missing.jpg')).rejects.toThrow(StorageFileNotFoundException);
    });
  });

  // ── removeFile ───────────────────────────────────────────────────────────────

  describe('removeFile', () => {
    it('should delete the file successfully', async () => {
      await expect(service.removeFile('file.jpg')).resolves.not.toThrow();
      expect(mockFile.delete).toHaveBeenCalled();
    });

    it('should throw StorageFileNotFoundException if file not found (404)', async () => {
      const error: any = new Error('Not Found');
      error.code = 404;
      mockFile.delete.mockRejectedValue(error);

      await expect(service.removeFile('missing.jpg')).rejects.toThrow(StorageFileNotFoundException);
    });

    it('should throw StorageRemoveException for other errors', async () => {
      mockFile.delete.mockRejectedValue(new Error('Unknown error'));

      await expect(service.removeFile('file.jpg')).rejects.toThrow(StorageRemoveException);
    });
  });

  // ── uploadFile ────────────────────────────────────────────────────────────────

  describe('uploadFile', () => {
    it('should upload file and return the generated filename', async () => {
      const file = {
        originalname: 'receipt.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-data'),
      } as Express.Multer.File;

      const result = await service.uploadFile(file);

      expect(result).toMatch(/^\d+-receipt\.jpg$/);
      expect(mockFile.createWriteStream).toHaveBeenCalled();
    });

    it('should throw StorageUploadException if stream errors', async () => {
      mockFile.createWriteStream.mockReturnValue({
        on: jest.fn().mockImplementation(function (event: string, cb: Function) {
          if (event === 'error') setTimeout(() => cb(new Error('Stream error')), 0);
          return this;
        }),
        end: jest.fn(),
      });

      const file = {
        originalname: 'bad.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('bad'),
      } as Express.Multer.File;

      await expect(service.uploadFile(file)).rejects.toThrow(StorageUploadException);
    });
  });
});
