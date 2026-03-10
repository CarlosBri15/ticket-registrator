import { Test, TestingModule } from '@nestjs/testing';
import { RolesRepository } from './roles.repository';
import { DB_CONNECTION } from '../db/db.module';

describe('RolesRepository', () => {
    let repository: RolesRepository;
    let dbMock: any;

    beforeEach(async () => {
        dbMock = {
            query: {
                roles: {
                    findMany: jest.fn(),
                    findFirst: jest.fn(),
                },
                permissions: {
                    findMany: jest.fn(),
                },
                rolePermissions: {
                    findMany: jest.fn(),
                },
            },
            insert: jest.fn().mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: '1' }]),
                }),
            }),
            update: jest.fn().mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ id: '1' }]),
                    }),
                }),
            }),
            transaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesRepository,
                { provide: DB_CONNECTION, useValue: dbMock },
            ],
        }).compile();

        repository = module.get<RolesRepository>(RolesRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    it('should call findAllSystemRoles', async () => {
        await repository.findAllSystemRoles();
        expect(dbMock.query.roles.findMany).toHaveBeenCalled();
    });

    it('should call findById', async () => {
        await repository.findById('1');
        expect(dbMock.query.roles.findFirst).toHaveBeenCalled();
    });

    it('should call create', async () => {
        await repository.create({ name: 'Role', hierarchy: 1 } as any);
        expect(dbMock.insert).toHaveBeenCalled();
    });
});
