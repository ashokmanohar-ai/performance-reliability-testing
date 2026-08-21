import { check } from 'k6';
import { pay } from '../../../framework/clients/payment-client.js';
import { environment } from '../../../framework/config/environments.js';
import { checkout, ensureToken } from '../../../framework/scenarios/commerce-journey.js';
import { setPaymentFault } from '../../../reliability/fault-injection/fault-control.js';

const config = environment();
export const options = {
  scenarios: { timeout: { executor: 'per-vu-iterations', vus: 1, iterations: 1 } }
};
export default function () {
  setPaymentFault(config.paymentStubUrl, 'slow');
  const order = checkout(config, false);
  const started = Date.now();
  const response = pay(
    config.baseUrl,
    ensureToken(config),
    order.json('id'),
    order.json('totalCents'),
    `slow-${Date.now()}`
  );
  check(response, {
    'slow dependency is timed out safely': (value) => value.status === 504,
    'total retry latency remains bounded': () => Date.now() - started < 12_000
  });
}
export function teardown() {
  setPaymentFault(config.paymentStubUrl, 'success');
}
