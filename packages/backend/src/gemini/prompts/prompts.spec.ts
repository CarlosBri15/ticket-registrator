import { RECEIPT_SYSTEM_INSTRUCTION, getReceiptUserContext, receiptSchema } from './index';

describe('Gemini Prompts', () => {
  describe('RECEIPT_SYSTEM_INSTRUCTION', () => {
    it('should be defined', () => {
      expect(RECEIPT_SYSTEM_INSTRUCTION).toBeDefined();
      expect(typeof RECEIPT_SYSTEM_INSTRUCTION).toBe('string');
    });
  });

  describe('getReceiptUserContext', () => {
    it('should return context without categories (explicit empty array)', () => {
      const result = getReceiptUserContext('en', []);
      expect(result).toContain('Output language: en');
      expect(result).not.toContain('CLASSIFICATION RULE');
    });

    it('should return context without categories (default value branch)', () => {
      const result = getReceiptUserContext('en'); // Trigger the default []
      expect(result).toContain('Output language: en');
      expect(result).not.toContain('CLASSIFICATION RULE');
    });

    it('should return context without categories (explicit undefined)', () => {
      const result = getReceiptUserContext('en', undefined); // Also triggers the default
      expect(result).toContain('Output language: en');
      expect(result).not.toContain('CLASSIFICATION RULE');
    });

    it('should return context with categories', () => {
      const categories = [
        { name: 'Food', description: 'Office meals' },
      ];
      const result = getReceiptUserContext('es', categories);
      expect(result).toContain('Output language: es');
      expect(result).toContain('CLASSIFICATION RULE');
      expect(result).toContain('Food: Office meals');
    });
  });

  describe('receiptSchema', () => {
    it('should be defined', () => {
      expect(receiptSchema).toBeDefined();
      expect(receiptSchema.type).toBeDefined();
    });
  });
});
