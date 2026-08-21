import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds, summaryTrendStats } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { browse } from '../../../framework/scenarios/commerce-journey.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('SPIKE');
assertSafeExecution(config.baseUrl, 'SPIKE', profile);
export const options = {
  summaryTrendStats,
  scenarios: { traffic_spike: { ...profile } },
  thresholds: standardThresholds
};
export default function () {
  browse(config);
}
export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'traffic-spike-and-recovery',
    environment: config.name,
    profile: 'SPIKE'
  });
}
