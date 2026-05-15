/**
 * Default English fallback used when the API response carries no parseable
 * message. Exported so callers can detect the fallback path explicitly when
 * needed (e.g. to swap in a translated string).
 */
export const DEFAULT_API_ERROR_MESSAGE = 'Unexpected error. Please try again.';

/**
 * Extracts a human-readable message from an Axios/API error.
 *
 * Returns the message string from the response body when available, or
 * `fallback` (defaults to {@link DEFAULT_API_ERROR_MESSAGE}). Pass an i18n key
 * via `t(...)` to keep error UIs localized when the API has nothing to say.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_API_ERROR_MESSAGE,
): string => {
  const data = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  if (!data) return fallback;
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) return data.message.join('. ');
  return fallback;
};
