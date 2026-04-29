import { getApiErrorMessage } from './errorUtils';

describe('errorUtils', () => {
  describe('getApiErrorMessage', () => {
    it('should return a default message for null/undefined', () => {
      expect(getApiErrorMessage(null)).toBe('Unexpected error. Please try again.');
    });

    it('should return string message from nested structure', () => {
      const error = { response: { data: { message: 'Api error' } } };
      expect(getApiErrorMessage(error)).toBe('Api error');
    });

    it('should join array message from nested structure', () => {
      const error = { response: { data: { message: ['Error 1', 'Error 2'] } } };
      expect(getApiErrorMessage(error)).toBe('Error 1. Error 2');
    });

    it('should return default message if no message in data', () => {
      const error = { response: { data: {} } };
      expect(getApiErrorMessage(error)).toBe('Unexpected error. Please try again.');
    });

    it('should return default message if no response data', () => {
      const error = { response: {} };
      expect(getApiErrorMessage(error)).toBe('Unexpected error. Please try again.');
    });
  });
});
