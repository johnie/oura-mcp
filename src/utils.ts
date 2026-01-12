import { CHARACTER_LIMIT } from './constants';

export const errorToToolResult = (error: unknown) => {
  return {
    content: [
      {
        type: 'text' as const,
        text: error instanceof Error ? error.message : String(error),
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
