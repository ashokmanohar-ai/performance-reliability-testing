import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { browse } from '../../../framework/scenarios/commerce-journey.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('SCALABILITY');
assertSafeExecution(config.baseUrl, 'SCALABILITY', profile);
export const options = {
  scenarios: { scale_steps: { ...profile } },
  thresholds: standardThresholds
};
export default function () {
  browse(config);
}
export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: '50-100-200-vu-scalability',
    environment: config.name,
    profile: 'SCALABILITY'
  });
}
