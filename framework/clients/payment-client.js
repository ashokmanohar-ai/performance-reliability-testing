import { checkoutSuccessRate, paymentFailureRate } from '../metrics/custom-metrics.js';
import { tags } from '../metrics/tags.js';
import { request } from './base-client.js';

export function pay(baseUrl, token, orderId, amountCents, idempotencyKey) {
  const response = request(
    'POST',
    `${baseUrl}/api/payments`,
    { orderId, amountCents },
    token,
    tags.payment,
    { 'idempotency-key': idempotencyKey }
  );
  checkoutSuccessRate.add(response.status === 200 || response.status === 201);
  paymentFailureRate.add(response.status >= 400);
  return response;
}
