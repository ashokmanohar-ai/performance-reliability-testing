import { check } from 'k6';
import http from 'k6/http';
import { environment } from '../../../framework/config/environments.js';
import { duplicateTransactions } from '../../../framework/metrics/custom-metrics.js';
import { checkout, ensureToken } from '../../../framework/scenarios/commerce-journey.js';
import { setPaymentFault } from '../../../reliability/fault-injection/fault-control.js';
import { correlationId } from '../../../framework/utils/correlation.js';

const config = environment();
export const options = {
  scenarios: { idempotency: { executor: 'per-vu-iterations', vus: 1, iterations: 1 } },
  thresholds: { duplicate_transactions: ['count==0'] }
};
export default function () {
  setPaymentFault(config.paymentStubUrl, 'success');
  const token = ensureToken(config);
  const order = checkout(config, false);
  const key = `concurrent-duplicate-${Date.now()}`;
  const request = {
    method: 'POST',
    url: `${config.baseUrl}/api/payments`,
    body: JSON.stringify({ orderId: order.json('id'), amountCents: order.json('totalCents') }),
    params: {
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'idempotency-key': key,
        'x-correlation-id': correlationId('idempotency')
      },
      tags: { endpoint: 'payment', transaction: 'idempotency' }
    }
  };
  const responses = http.batch([request, request, request, request, request]);
  const paymentIds = new Set(responses.map((response) => response.json('id')).filter(Boolean));
  const duplicates = Math.max(0, paymentIds.size - 1);
  if (duplicates) duplicateTransactions.add(duplicates);
  check(responses, {
    'all concurrent responses are controlled': (values) =>
      values.every((value) => [200, 201].includes(value.status)),
    'only one payment record is returned': () => paymentIds.size === 1
  });
}
