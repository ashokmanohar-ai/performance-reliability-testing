import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { checkout } from '../../../framework/scenarios/commerce-journey.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('NORMAL_LOAD');
assertSafeExecution(config.baseUrl, 'NORMAL_LOAD', profile);
export const options = {
  scenarios: { order_load: { ...profile } },
  thresholds: standardThresholds
};
export default function () {
  checkout(config, false);
}
export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'order-load',
    environment: config.name,
    profile: 'NORMAL_LOAD'
  });
}
