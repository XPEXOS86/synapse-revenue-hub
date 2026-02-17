/**
 * Frontend request tracing — generates unique IDs per user action
 * and attaches them as headers for end-to-end observability.
 */

let lastRequestId: string | null = null;

export function generateRequestId(): string {
  const id = crypto.randomUUID();
  lastRequestId = id;
  return id;
}

export function getLastRequestId(): string | null {
  return lastRequestId;
}

export function traceHeaders(correlationId?: string): Record<string, string> {
  const requestId = generateRequestId();
  return {
    "x-request-id": requestId,
    "x-correlation-id": correlationId || requestId,
  };
}
