import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import {
  StorageFileNotFoundException,
  StorageRemoveException,
} from './exceptions/storage.exceptions';

describe('StorageController', () => {
  let controller: StorageController;
  let storageServiceMock: jest.Mocked<Partial<StorageService>>;

  beforeEach(async () => {
    storageServiceMock = {
      findFile: jest.fn(),
      removeFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [{ provide: StorageService, useValue: storageServiceMock }],
    })
      .overrideGuard(require('@nestjs/passport').AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('../auth/guards/permissions.guard').PermissionsGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StorageController>(StorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── findFile ─────────────────────────────────────────────────────────────────

  describe('findFile', () => {
    it('should return signed URL and expiration info', async () => {
      const mockUrl = 'https://signed-url.com/file.jpg';
      (storageServiceMock.findFile as jest.Mock).mockResolvedValue(mockUrl);

      const result = await controller.findFile('file.jpg');

      expect(storageServiceMock.findFile).toHaveBeenCalledWith('file.jpg');
      expect(result).toEqual({ url: mockUrl, expiresIn: '15 minutes' });
    });

    it('should propagate StorageFileNotFoundException', async () => {
      (storageServiceMock.findFile as jest.Mock).mockRejectedValue(
        new StorageFileNotFoundException('missing.jpg'),
      );

      await expect(controller.findFile('missing.jpg')).rejects.toThrow(
        StorageFileNotFoundException,
      );
    });
  });

  // ── removeFile ───────────────────────────────────────────────────────────────

  describe('removeFile', () => {
    it('should return success message after removing file', async () => {
      (storageServiceMock.removeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.removeFile('file.jpg');

      expect(storageServiceMock.removeFile).toHaveBeenCalledWith('file.jpg');
      expect(result).toEqual({ message: 'File removed', fileName: 'file.jpg' });
    });

    it('should propagate StorageFileNotFoundException', async () => {
      (storageServiceMock.removeFile as jest.Mock).mockRejectedValue(
        new StorageFileNotFoundException('missing.jpg'),
      );

      await expect(controller.removeFile('missing.jpg')).rejects.toThrow(
        StorageFileNotFoundException,
      );
    });

    it('should propagate StorageRemoveException', async () => {
      (storageServiceMock.removeFile as jest.Mock).mockRejectedValue(
        new StorageRemoveException(),
      );

      await expect(controller.removeFile('file.jpg')).rejects.toThrow(
        StorageRemoveException,
      );
    });
  });
});
