import { Test, TestingModule } from '@nestjs/testing';
import { TicketsRepository } from './tickets.repository';
import { DB_CONNECTION } from '../db/db.module';
import * as schema from '../db/schema';

describe('TicketsRepository', () => {
    let repository: TicketsRepository;
    let dbMock: any;

    beforeEach(async () => {
        dbMock = {
            query: {
                tickets: {
                    findFirst: jest.fn(),
                    findMany: jest.fn(),
                },
            },
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            transaction: jest.fn().mockImplementation((cb) => cb(dbMock)),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketsRepository,
                { provide: DB_CONNECTION, useValue: dbMock },
            ],
        }).compile();

        repository = module.get<TicketsRepository>(TicketsRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findById', () => {
        it('should call db.query.tickets.findFirst', async () => {
            await repository.findById('ticket-1');
            expect(dbMock.query.tickets.findFirst).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should insert ticket and items in a transaction', async () => {
            dbMock.returning.mockResolvedValue([{ id: 'ticket-1' }]);
            const data = { reportId: 'report-1' } as any;
            const items = [{ name: 'item-1' }] as any;

            const result = await repository.create(data, items);

            expect(dbMock.insert).toHaveBeenCalledWith(schema.tickets);
            expect(dbMock.insert).toHaveBeenCalledWith(schema.items);
            expect(result.id).toBe('ticket-1');
        });
    });

    describe('softDelete', () => {
        it('should insert history and update isVisible', async () => {
            await repository.softDelete('ticket-1', { ticketId: 'ticket-1', reportId: 'report-1' } as any);
            expect(dbMock.insert).toHaveBeenCalledWith(schema.ticketHistories);
            expect(dbMock.update).toHaveBeenCalledWith(schema.tickets);
        });
    });
});
