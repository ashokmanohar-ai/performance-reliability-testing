import { check } from 'k6';
import { pay } from '../../../framework/clients/payment-client.js';
import { environment } from '../../../framework/config/environments.js';
import { checkout, ensureToken } from '../../../framework/scenarios/commerce-journey.js';
import { setPaymentFault } from '../../../reliability/fault-injection/fault-control.js';

const config = environment();
export const options = {
  scenarios: { unavailable: { executor: 'per-vu-iterations', vus: 3, iterations: 1 } }
};
export default function () {
  setPaymentFault(config.paymentStubUrl, '503');
  const order = checkout(config, false);
  const response = pay(
    config.baseUrl,
    ensureToken(config),
    order.json('id'),
    order.json('totalCents'),
    `unavailable-${__VU}`
  );
  check(response, {
    '503 is translated to controlled gateway error': (value) => value.status === 502,
    'retry count is bounded': (value) => value.json('attempts') === 3
  });
}
export function teardown() {
  setPaymentFault(config.paymentStubUrl, 'success');
}
