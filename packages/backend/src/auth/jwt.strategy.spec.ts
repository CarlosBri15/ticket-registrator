import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersServiceMock: any;

  beforeEach(async () => {
    usersServiceMock = {
      findUserRole: jest.fn(),
    };

    const configServiceMock = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload = {
      sub: 'user-1',
      username: 'john',
      roleName: 'Employee',
      roleHierarchy: 1,
      companyId: 'company-1',
      departmentIds: ['dept-1'],
    };

    it('should return user data when valid', async () => {
      usersServiceMock.findUserRole.mockResolvedValue({ roleId: 'role-id' });

      const result = await strategy.validate(payload);
      expect(result).toEqual({
        id: 'user-1',
        username: 'john',
        roleId: 'role-id',
        roleName: 'Employee',
        roleHierarchy: 1,
        companyId: 'company-1',
        departmentIds: ['dept-1'],
      });
    });

    it('should throw UnauthorizedException when user role not found', async () => {
      usersServiceMock.findUserRole.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when findUserRole returns undefined', async () => {
      usersServiceMock.findUserRole.mockResolvedValue(undefined);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
