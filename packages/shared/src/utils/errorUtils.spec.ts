import { DEFAULT_API_ERROR_MESSAGE, getApiErrorMessage } from './errorUtils';

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

    it('exposes the default message constant', () => {
      expect(DEFAULT_API_ERROR_MESSAGE).toBe('Unexpected error. Please try again.');
    });

    it('uses the provided fallback when API has no parseable message', () => {
      expect(getApiErrorMessage(null, 'Translated fallback')).toBe('Translated fallback');
      expect(getApiErrorMessage({ response: { data: {} } }, 'translated')).toBe('translated');
      expect(getApiErrorMessage({ response: {} }, 'translated')).toBe('translated');
    });

    it('still returns the API message when present, ignoring the fallback', () => {
      const error = { response: { data: { message: 'Real error from API' } } };
      expect(getApiErrorMessage(error, 'translated')).toBe('Real error from API');
    });
  });
});
