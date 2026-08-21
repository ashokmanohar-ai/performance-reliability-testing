import { check, sleep } from 'k6';
import { environment } from '../../../framework/config/environments.js';
import { resilienceThresholds, summaryTrendStats } from '../../../framework/config/thresholds.js';
import { recoveryTime } from '../../../framework/metrics/custom-metrics.js';
import { pay } from '../../../framework/clients/payment-client.js';
import { checkout, ensureToken } from '../../../framework/scenarios/commerce-journey.js';
import { setPaymentFault } from '../../../reliability/fault-injection/fault-control.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
export const options = {
  summaryTrendStats,
  scenarios: { recovery: { executor: 'per-vu-iterations', vus: 1, iterations: 1 } },
  thresholds: resilienceThresholds
};

export default function () {
  setPaymentFault(config.paymentStubUrl, 'success');
  const failedOrder = checkout(config, false);
  setPaymentFault(config.paymentStubUrl, '503');
  const failure = pay(
    config.baseUrl,
    ensureToken(config),
    failedOrder.json('id'),
    failedOrder.json('totalCents'),
    `failure-${Date.now()}`
  );
  check(failure, {
    'dependency outage produces controlled error': (response) => response.status === 502
  });

  setPaymentFault(config.paymentStubUrl, 'success');
  const restoredAt = Date.now();
  const recoveryOrder = checkout(config, false);
  let recovered = false;
  for (let attempt = 0; attempt < 10 && !recovered; attempt += 1) {
    const response = pay(
      config.baseUrl,
      ensureToken(config),
      recoveryOrder.json('id'),
      recoveryOrder.json('totalCents'),
      `recovery-${Date.now()}-${attempt}`
    );
    recovered = response.status === 201;
    if (!recovered) sleep(1);
  }
  recoveryTime.add(Date.now() - restoredAt);
  check(recovered, {
    'application recovers after dependency restoration': (value) => value === true
  });
}

export function teardown() {
  setPaymentFault(config.paymentStubUrl, 'success');
}

export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'payment-dependency-recovery',
    environment: config.name,
    profile: 'RELIABILITY'
  });
}
