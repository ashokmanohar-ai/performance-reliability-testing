import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds, summaryTrendStats } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { browse } from '../../../framework/scenarios/commerce-journey.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('STRESS');
assertSafeExecution(config.baseUrl, 'STRESS', profile);
export const options = {
  summaryTrendStats,
  scenarios: { stress_steps: { ...profile } },
  thresholds: standardThresholds
};
export default function () {
  browse(config);
}
export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'progressive-api-stress',
    environment: config.name,
    profile: 'STRESS'
  });
}
