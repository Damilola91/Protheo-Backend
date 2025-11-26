export const createError = (
  statusCode: number,
  message: string,
  details?: unknown
) => ({
  statusCode,
  message,
  details,
});
