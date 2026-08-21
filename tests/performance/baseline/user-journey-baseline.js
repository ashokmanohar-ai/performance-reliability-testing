import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { commerceThresholds, summaryTrendStats } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { browse, checkout } from '../../../framework/scenarios/commerce-journey.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('BASELINE');
assertSafeExecution(config.baseUrl, 'BASELINE', profile);

export const options = {
  summaryTrendStats,
  scenarios: {
    baseline_browse: {
      ...profile,
      vus: Math.max(1, Math.floor(profile.vus * 0.7)),
      exec: 'baselineBrowse'
    },
    baseline_checkout: {
      ...profile,
      vus: Math.max(1, Math.ceil(profile.vus * 0.3)),
      exec: 'baselineCheckout'
    }
  },
  thresholds: commerceThresholds
};

export function baselineBrowse() {
  browse(config);
}

export function baselineCheckout() {
  checkout(config);
}

export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'user-journey-baseline',
    environment: config.name,
    profile: 'BASELINE',
    vus: profile.vus,
    duration: profile.duration
  });
}
