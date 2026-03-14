import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../crypto/crypto.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;
  let cryptoServiceMock: any;

  const mockUser = {
    id: 'user-1',
    email: 'john@acme.com',
    username: 'john',
    password: 'hashed-password',
    companyId: 'company-1',
    role: { id: 'role-1', name: 'Employee', hierarchy: 1 },
    usersToDepartments: [{ departmentId: 'dept-1' }],
  };

  beforeEach(async () => {
    usersServiceMock = {
      findByEmail: jest.fn(),
    };
    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
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

  describe('login', () => {
    const loginDto = { email: 'john@acme.com', password: 'secret' };

    it('should return access_token on successful login', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUser);
      cryptoServiceMock.comparePassword.mockResolvedValue(true);

      const result = await service.login(loginDto as any);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1', username: 'john' }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      await expect(service.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUser);
      cryptoServiceMock.comparePassword.mockResolvedValue(false);
      await expect(service.login(loginDto as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should include all payload fields in the JWT', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUser);
      cryptoServiceMock.comparePassword.mockResolvedValue(true);

      await service.login(loginDto as any);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        username: 'john',
        roleName: 'Employee',
        roleHierarchy: 1,
        companyId: 'company-1',
        departmentIds: ['dept-1'],
      });
    });

    it('should handle user with no role', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({ ...mockUser, role: null });
      cryptoServiceMock.comparePassword.mockResolvedValue(true);

      const result = await service.login(loginDto as any);
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('should handle user with no departments', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({ ...mockUser, usersToDepartments: [] });
      cryptoServiceMock.comparePassword.mockResolvedValue(true);

      const result = await service.login(loginDto as any);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({ departmentIds: [] }),
      );
    });
  });
});
