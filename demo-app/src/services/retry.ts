export interface RetryResult<T> {
  value: T;
  attempts: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean,
  maxRetries: number,
  delay: (milliseconds: number) => Promise<void> = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds))
): Promise<RetryResult<T>> {
  let attempts = 0;
  while (true) {
    attempts += 1;
    try {
      return { value: await operation(), attempts };
    } catch (error) {
      if (attempts > maxRetries || !shouldRetry(error))
        throw Object.assign(error as object, { attempts });
      await delay(100 * 2 ** (attempts - 1));
    }
  }
}
