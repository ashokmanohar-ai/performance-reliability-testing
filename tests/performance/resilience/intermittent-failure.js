import { check } from 'k6';
import { pay } from '../../../framework/clients/payment-client.js';
import { environment } from '../../../framework/config/environments.js';
import { checkout, ensureToken } from '../../../framework/scenarios/commerce-journey.js';
import { setPaymentFault } from '../../../reliability/fault-injection/fault-control.js';

const config = environment();
export const options = {
  scenarios: { intermittent: { executor: 'shared-iterations', vus: 1, iterations: 6 } }
};
export default function () {
  const expectedFailure = __ITER % 2 === 0;
  setPaymentFault(config.paymentStubUrl, expectedFailure ? '500' : 'success');
  const order = checkout(config, false);
  const response = pay(
    config.baseUrl,
    ensureToken(config),
    order.json('id'),
    order.json('totalCents'),
    `intermittent-${__ITER}`
  );
  check(response, {
    'intermittent outcome is controlled': (value) =>
      expectedFailure ? value.status === 502 : value.status === 201
  });
}
export function teardown() {
  setPaymentFault(config.paymentStubUrl, 'success');
}
