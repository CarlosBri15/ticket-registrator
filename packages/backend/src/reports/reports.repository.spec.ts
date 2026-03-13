import { Test, TestingModule } from '@nestjs/testing';
import { ReportsRepository } from './reports.repository';
import { DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

describe('ReportsRepository', () => {
    let repository: ReportsRepository;
    let dbMock: any;

    beforeEach(async () => {
        dbMock = {
            query: {
                reports: {
                    findFirst: jest.fn(),
                    findMany: jest.fn(),
                },
            },
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            transaction: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsRepository,
                { provide: DB_CONNECTION, useValue: dbMock },
            ],
        }).compile();

        repository = module.get<ReportsRepository>(ReportsRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findById', () => {
        it('should call db.query.reports.findFirst', async () => {
            await repository.findById('report-1');
            expect(dbMock.query.reports.findFirst).toHaveBeenCalledWith({
                where: expect.anything(),
            });
        });
    });

    describe('create', () => {
        it('should insert a report and return it', async () => {
            const mockData = { name: 'New Report' } as any;
            dbMock.returning.mockResolvedValue([{ id: 'new-id', ...mockData }]);

            const result = await repository.create(mockData);
            expect(dbMock.insert).toHaveBeenCalledWith(schema.reports);
            expect(result.id).toBe('new-id');
        });
    });

    describe('updateWithCondition', () => {
        it('should update report with combined condition', async () => {
            const mockData = { name: 'Updated' } as any;
            dbMock.returning.mockResolvedValue([{ id: 'report-1', ...mockData }]);

            const condition = eq(schema.reports.status, 'CREATED');
            await repository.updateWithCondition('report-1', mockData, condition);

            expect(dbMock.update).toHaveBeenCalledWith(schema.reports);
            expect(dbMock.where).toHaveBeenCalled();
        });
    });

    describe('transaction', () => {
        it('should delegate to db.transaction', async () => {
            const callback = async () => 'result';
            await repository.transaction(callback);
            expect(dbMock.transaction).toHaveBeenCalledWith(callback);
        });
    });
});
