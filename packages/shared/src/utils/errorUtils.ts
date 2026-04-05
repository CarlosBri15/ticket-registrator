/**
 * Extracts a human-readable message from an Axios/API error.
 *
 * Returns the message string from the response body when available,
 * or a generic fallback. The caller is responsible for translating
 * the fallback string (key: "common.unexpectedError").
 */
export const getApiErrorMessage = (error: unknown): string => {
  const data = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  if (!data) return 'Unexpected error. Please try again.';
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) return data.message.join('. ');
  return 'Unexpected error. Please try again.';
};
