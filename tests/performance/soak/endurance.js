import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds, summaryTrendStats } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { executeBusinessMix } from '../../../framework/scenarios/business-mix.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('SOAK');
assertSafeExecution(config.baseUrl, 'SOAK', profile);
export const options = {
  summaryTrendStats,
  scenarios: { endurance: { ...profile } },
  thresholds: standardThresholds
};
export default function () {
  executeBusinessMix(config);
}
export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'portfolio-endurance',
    environment: config.name,
    profile: 'SOAK'
  });
}
