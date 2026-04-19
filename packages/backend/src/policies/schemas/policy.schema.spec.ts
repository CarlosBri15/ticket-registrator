import { policies, policyChunks } from './policy.schema';

describe('Policy Schema', () => {
  it('should export policies table', () => {
    expect(policies).toBeDefined();
  });

  it('should export policyChunks table', () => {
    expect(policyChunks).toBeDefined();
  });

  it('should have correct column definitions for policies', () => {
    expect(policies.id).toBeDefined();
    expect(policies.companyId).toBeDefined();
    expect(policies.name).toBeDefined();
  });

  it('should have correct custom vector type for embedding', () => {
    const embedding = policyChunks.embedding as any;
    // Trigger the dataType function execution
    expect(embedding.dataType()).toBe('vector(768)');
  });

  it('should have indexes defined', () => {
    // Triggers the execution of the (table) => ({ ... }) block
    const extraConfig = (policyChunks as any).extraConfig;
    expect(extraConfig).toBeDefined();
    const indexes = extraConfig(policyChunks);
    expect(indexes.embeddingIndex).toBeDefined();
    expect(indexes.companyIndex).toBeDefined();
  });
});
