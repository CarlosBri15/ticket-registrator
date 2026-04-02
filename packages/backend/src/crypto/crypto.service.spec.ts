import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { ConfigService } from '@nestjs/config';

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
    resize: jest.fn().mockReturnThis(),
    grayscale: jest.fn().mockReturnThis(),
    raw: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue({
      data: Buffer.from('dummy-rgb-data'),
      info: { width: 24, height: 24 },
    }),
  }));
});

jest.mock('blockhash-core', () => ({
  bmvbhash: jest.fn().mockReturnValue('1234567890abcdef'),
}));

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

  describe('generateSha256Hash', () => {
    it('should consistently generate correct hash for a given buffer', () => {
      const buffer = Buffer.from('test string');
      const hash1 = service.generateSha256Hash(buffer);
      const hash2 = service.generateSha256Hash(buffer);
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1).toHaveLength(64); // sha256 hex string length
    });
  });

  describe('calculateHammingDistance', () => {
    it('should calculate distance between two valid hex strings of same length', () => {
      const hash1 = '0f'; // 0000 1111
      const hash2 = '03'; // 0000 0011 (dist = 2)
      expect(service.calculateHammingDistance(hash1, hash2)).toBe(2);

      const hash3 = 'ff'; // 1111 1111
      const hash4 = '00'; // 0000 0000 (dist = 8)
      expect(service.calculateHammingDistance(hash3, hash4)).toBe(8);
    });

    it('should return Infinity if hashes have different lengths', () => {
      expect(service.calculateHammingDistance('0f', '0fff')).toBe(Infinity);
    });
  });

  describe('generatePerceptualHash', () => {
    it('should generate a perceptual hash with aspect ratio', async () => {
      const { bmvbhash } = require('blockhash-core');
      const hash = await service.generatePerceptualHash(Buffer.from('dummy'));
      expect(hash).toBe('1234567890abcdef|1.000');
      expect(bmvbhash).toHaveBeenCalledWith(
        { data: expect.any(Buffer), width: 24, height: 24 },
        24,
      );
    });
  });
});
