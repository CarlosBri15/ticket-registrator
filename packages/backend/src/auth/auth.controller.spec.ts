import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let serviceMock: jest.Mocked<Partial<AuthService>>;

  beforeEach(async () => {
    serviceMock = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'password123',
    } as any;

    it('should call authService.login, set cookie, and return access_token', async () => {
      const token = 'jwt-token';
      (serviceMock.login as jest.Mock).mockResolvedValue({
        access_token: token,
      });

      const resMock = { cookie: jest.fn() } as any;

      const result = await controller.login(loginDto, resMock);

      expect(serviceMock.login).toHaveBeenCalledWith(loginDto);
      expect(resMock.cookie).toHaveBeenCalledWith(
        'access_token',
        token,
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ access_token: token });
    });

    it('should propagate UnauthorizedException from service', async () => {
      (serviceMock.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );
      const resMock = { cookie: jest.fn() } as any;

      await expect(controller.login(loginDto, resMock)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear the cookie and return success', () => {
      const resMock = { clearCookie: jest.fn() } as any;

      const result = controller.logout(resMock);

      expect(resMock.clearCookie).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ success: true });
    });
  });
});
