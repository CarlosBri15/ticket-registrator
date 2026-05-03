import { Test, TestingModule } from '@nestjs/testing';
import { PoliciesRepository } from './policies.repository';

describe('PoliciesRepository', () => {
  let repository: PoliciesRepository;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliciesRepository,
        {
          provide: 'DB_CONNECTION', 
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<PoliciesRepository>(PoliciesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('savePolicyAndChunks', () => {
    it('should save policy and chunks within a transaction', async () => {
      const companyId = 'company-123';
      const name = 'Test Policy';
      const chunksWithEmbeddings = [
        { content: 'chunk 1', embedding: [0.1], chunkIndex: 0 },
        { content: 'chunk 2', embedding: [0.2], chunkIndex: 1 },
      ];

      const insertedPolicy = { id: 'policy-1', companyId, name };

      const mockTx = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([insertedPolicy]),
      };

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTx);
      });

      const result = await repository.savePolicyAndChunks(companyId, name, chunksWithEmbeddings);

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalledTimes(2); 
      expect(mockTx.values).toHaveBeenCalledTimes(2);
      expect(mockTx.returning).toHaveBeenCalledTimes(1);

      expect(result).toEqual(insertedPolicy);
    });

    it('should save policy without chunks if chunks array is empty', async () => {
      const companyId = 'company-123';
      const name = 'Test Policy';
      const chunksWithEmbeddings: any[] = [];

      const insertedPolicy = { id: 'policy-1', companyId, name };

      const mockTx = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([insertedPolicy]),
      };

      mockDb.transaction.mockImplementation(async (callback: any) => {
        return await callback(mockTx);
      });

      const result = await repository.savePolicyAndChunks(companyId, name, chunksWithEmbeddings);

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(mockTx.insert).toHaveBeenCalledTimes(1);
      expect(mockTx.values).toHaveBeenCalledTimes(1);
      expect(mockTx.returning).toHaveBeenCalledTimes(1);

      expect(result).toEqual(insertedPolicy);
    });
  });
});
