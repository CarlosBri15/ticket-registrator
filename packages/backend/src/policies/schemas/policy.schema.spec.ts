import { policies, policyChunks, vector } from './policy.schema';

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

  it('should have correct column definitions for policyChunks', () => {
    expect(policyChunks.id).toBeDefined();
    expect(policyChunks.policyId).toBeDefined();
    expect(policyChunks.embedding).toBeDefined();
  });
});
