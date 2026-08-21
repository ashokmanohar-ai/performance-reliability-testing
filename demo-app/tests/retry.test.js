import assert from 'node:assert/strict';
import test from 'node:test';
import { withRetry } from '../dist/services/retry.js';

test('retry succeeds after transient failures and reports attempts', async () => {
  let calls = 0;
  const result = await withRetry(
    async () => {
      calls += 1;
      if (calls < 3) throw new Error('temporary');
      return 'ok';
    },
    () => true,
    2,
    async () => undefined
  );
  assert.deepEqual(result, { value: 'ok', attempts: 3 });
});

test('retry stops immediately for non-retryable failures', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls += 1;
        throw new Error('fatal');
      },
      () => false,
      3,
      async () => undefined
    )
  );
  assert.equal(calls, 1);
});
