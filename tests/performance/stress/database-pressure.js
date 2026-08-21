import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds, summaryTrendStats } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { search } from '../../../framework/scenarios/commerce-journey.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('STRESS');
assertSafeExecution(config.baseUrl, 'STRESS', profile);
export const options = {
  summaryTrendStats,
  scenarios: { query_pressure: { ...profile } },
  thresholds: standardThresholds
};
export default function () {
  search(config);
}
export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'database-query-pressure',
    environment: config.name,
    profile: 'STRESS'
  });
}
