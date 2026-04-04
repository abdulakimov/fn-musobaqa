export function getRequestIdFromHeaders(headers: Headers) {
  return headers.get("x-request-id") ?? crypto.randomUUID();
}

export function logApiError(context: string, requestId: string, error: unknown) {
  console.error(`[${context}] requestId=${requestId}`, error);
}
