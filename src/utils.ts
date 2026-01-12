import { CHARACTER_LIMIT } from './constants';

/**
 * Format an error into an actionable, user-friendly message.
 */
export function formatError(error: unknown): string {
  if (!(error instanceof Error)) {
    return `Error: ${String(error)}`;
  }

  const message = error.message;

  // Check for HTTP status codes in the error message
  if (message.includes('401') || message.includes('Unauthorized')) {
    return 'Error: Authentication failed. Please check that your OURA_ACCESS_TOKEN is valid and not expired. You may need to generate a new token at https://cloud.ouraring.com/personal-access-tokens';
  }

  if (message.includes('403') || message.includes('Forbidden')) {
    return 'Error: Access denied. Your token may not have permission for this data. Check your token scopes at https://cloud.ouraring.com/personal-access-tokens';
  }

  if (message.includes('404') || message.includes('Not Found')) {
    return 'Error: Data not found. This could mean no data exists for the specified date range. Try a different date range or check if your Oura Ring has synced recently.';
  }

  if (
    message.includes('429') ||
    message.includes('Too Many Requests') ||
    message.includes('Rate')
  ) {
    return 'Error: Rate limit exceeded. The Oura API limits requests. Please wait 60 seconds before trying again.';
  }

  if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  ) {
    return "Error: Oura API server error. This is a temporary issue on Oura's side. Please try again in a few minutes.";
  }

  if (
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('ETIMEDOUT')
  ) {
    return 'Error: Could not connect to Oura API. Please check your internet connection and try again.';
  }

  if (message.includes('Invalid date') || message.includes('YYYY-MM-DD')) {
    return 'Error: Invalid date format. Please use YYYY-MM-DD format (e.g., 2024-01-15). Ensure start_date is before end_date.';
  }

  // Default: return the original message with "Error:" prefix if not present
  return message.startsWith('Error') ? message : `Error: ${message}`;
}

export const errorToToolResult = (error: unknown) => {
  return {
    content: [
      {
        type: 'text' as const,
        text: formatError(error),
      },
    ],
    isError: true,
  };
};

/**
 * Truncate response text if it exceeds CHARACTER_LIMIT.
 * Adds a truncation notice with guidance for the user.
 */
export function truncateResponse(text: string): string {
  if (text.length <= CHARACTER_LIMIT) {
    return text;
  }

  const truncated = text.slice(0, CHARACTER_LIMIT);
  const truncationNotice = `\n\n---\n[Response truncated: ${text.length.toLocaleString()} chars exceeded ${CHARACTER_LIMIT.toLocaleString()} limit. Use smaller date range or add 'limit' parameter to reduce results.]`;

  return truncated + truncationNotice;
}
