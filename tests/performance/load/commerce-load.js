import { login } from '../../../framework/clients/auth-client.js';
import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { commerceThresholds, summaryTrendStats } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { userForVu } from '../../../framework/data/generators.js';
import { executeBusinessMix } from '../../../framework/scenarios/business-mix.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile(__ENV.PERF_PROFILE || 'NORMAL_LOAD');
assertSafeExecution(config.baseUrl, __ENV.PERF_PROFILE || 'NORMAL_LOAD', profile);

export const options = {
  summaryTrendStats,
  scenarios: {
    commerce_mix: { ...profile, exec: 'commerceMix' },
    authentication_load: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.AUTH_RATE || 2),
      timeUnit: '1s',
      duration: __ENV.TEST_DURATION || '5m',
      preAllocatedVUs: 5,
      maxVUs: 20,
      exec: 'authenticationLoad'
    }
  },
  thresholds: commerceThresholds
};

export function commerceMix() {
  executeBusinessMix(config);
}

export function authenticationLoad() {
  const user = userForVu();
  login(config.baseUrl, user.username, user.password);
}

export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'realistic-commerce-load',
    environment: config.name,
    profile: __ENV.PERF_PROFILE || 'NORMAL_LOAD'
  });
}
