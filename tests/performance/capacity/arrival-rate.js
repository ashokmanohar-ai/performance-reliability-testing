import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { search } from '../../../framework/scenarios/commerce-journey.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('CAPACITY');
assertSafeExecution(config.baseUrl, 'CAPACITY', profile);
export const options = {
  scenarios: { capacity_rps: { ...profile } },
  thresholds: standardThresholds
};
export default function () {
  search(config);
}
export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'arrival-rate-capacity',
    environment: config.name,
    profile: 'CAPACITY'
  });
}
