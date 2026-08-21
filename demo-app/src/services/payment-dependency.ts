import { withRetry } from './retry.js';

export class DependencyError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly retryable: boolean
  ) {
    super(message);
  }
}

export interface PaymentDependencyResult {
  transactionId: string;
  attempts: number;
}

export async function chargeDependency(
  serviceUrl: string,
  timeoutMs: number,
  maxRetries: number,
  body: Record<string, unknown>
): Promise<PaymentDependencyResult> {
  const result = await withRetry(
    async () => {
      let response: Response;
      try {
        response = await fetch(`${serviceUrl}/payments`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs)
        });
      } catch (error) {
        throw new DependencyError(`Payment dependency request failed: ${String(error)}`, 504, true);
      }
      if (!response.ok) {
        throw new DependencyError(
          `Payment dependency returned ${response.status}`,
          response.status,
          response.status >= 500
        );
      }
      return (await response.json()) as { transactionId: string };
    },
    (error) => error instanceof DependencyError && error.retryable,
    maxRetries
  );
  return { transactionId: result.value.transactionId, attempts: result.attempts };
}
