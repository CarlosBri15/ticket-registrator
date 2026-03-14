import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;
  let cryptoServiceMock: any;

  beforeEach(async () => {
    usersServiceMock = {
      findByEmail: jest.fn(),
    };
    jwtServiceMock = {
      sign: jest.fn(),
    };
    cryptoServiceMock = {
      comparePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: CryptoService, useValue: cryptoServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
