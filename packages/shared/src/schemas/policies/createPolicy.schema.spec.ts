import { ingestPolicySchema } from './createPolicy.schema';


describe('createPolicy.schema', () => {
  it('should validate a correct policy object', () => {
    const validData = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Valid Policy Name',
    };
    const result = ingestPolicySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if companyId is not a valid UUID', () => {
    const invalidData = {
      companyId: 'not-a-uuid',
      name: 'Valid Policy Name',
    };
    const result = ingestPolicySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid company ID format');
    }
  });

  it('should fail if name is empty', () => {
    const invalidData = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      name: '',
    };
    const result = ingestPolicySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Policy name is required');
    }
  });

  it('should fail if required fields are missing', () => {
    const invalidData = {};
    const result = ingestPolicySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBe(2);
    }
  });
});
