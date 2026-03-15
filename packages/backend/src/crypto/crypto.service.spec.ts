import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { ConfigService } from '@nestjs/config';

describe('CryptoService', () => {
  let service: CryptoService;
  let configServiceMock: jest.Mocked<Partial<ConfigService>>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn().mockReturnValue('test-pepper'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should return a hashed string', async () => {
      const hash = await service.hashPassword('mypassword');
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe('mypassword');
    });

    it('should return different hashes for the same password (salted)', async () => {
      const hash1 = await service.hashPassword('samepassword');
      const hash2 = await service.hashPassword('samepassword');
      expect(hash1).not.toBe(hash2);
    });

    it('should throw if PASSWORD_PEPPER is not configured', async () => {
      (configServiceMock.get as jest.Mock).mockReturnValue(undefined);
      await expect(service.hashPassword('pass')).rejects.toThrow(
        'PASSWORD_PEPPER is not defined',
      );
    });
  });

  describe('comparePassword', () => {
    it('should return true when plain password matches hash', async () => {
      const password = 'correctPassword';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false when plain password does not match hash', async () => {
      const hash = await service.hashPassword('correctPassword');
      const result = await service.comparePassword('wrongPassword', hash);
      expect(result).toBe(false);
    });
  });
});
