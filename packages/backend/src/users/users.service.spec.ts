import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DB_CONNECTION } from '../db/db.module';
import { CryptoService } from '../crypto/crypto.service';

describe('UsersService', () => {
  let service: UsersService;
  let dbMock: any;
  let cryptoServiceMock: any;

  beforeEach(async () => {
    dbMock = {
      query: {
        users: { findFirst: jest.fn(), findMany: jest.fn() },
        roles: { findFirst: jest.fn() },
        companies: { findFirst: jest.fn() },
        departments: { findMany: jest.fn() },
      },
      transaction: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    cryptoServiceMock = {
      hashPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DB_CONNECTION, useValue: dbMock },
        { provide: CryptoService, useValue: cryptoServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
