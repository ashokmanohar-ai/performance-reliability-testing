import { check } from 'k6';
import http from 'k6/http';
import { login } from '../../../framework/clients/auth-client.js';
import { listProducts } from '../../../framework/clients/product-client.js';
import { environment } from '../../../framework/config/environments.js';
import { assertSafeExecution } from '../../../framework/config/safety.js';
import { standardThresholds } from '../../../framework/config/thresholds.js';
import { workloadProfile } from '../../../framework/config/workload-models.js';
import { userForVu } from '../../../framework/data/generators.js';
import { summaryHandler } from '../../../framework/utils/summary.js';

const config = environment();
const profile = workloadProfile('SMOKE');
assertSafeExecution(config.baseUrl, 'SMOKE', profile);

export const options = {
  scenarios: {
    api_smoke: { ...profile, exec: 'apiSmoke' },
    authentication_smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: __ENV.TEST_DURATION || '30s',
      exec: 'authSmoke'
    }
  },
  thresholds: standardThresholds
};

export function apiSmoke() {
  const user = userForVu();
  const token = login(config.baseUrl, user.username, user.password);
  const response = listProducts(config.baseUrl, token);
  check(response, { 'product API remains responsive': (value) => value.status === 200 });
}

export function authSmoke() {
  const user = userForVu();
  login(config.baseUrl, user.username, user.password);
  const health = http.get(`${config.baseUrl}/health`, { tags: { endpoint: 'health' } });
  check(health, {
    'health endpoint is healthy': (value) => value.status === 200 && value.json('status') === 'ok'
  });
}

export function handleSummary(data) {
  return summaryHandler(data, {
    scenario: 'performance-smoke',
    environment: config.name,
    profile: 'SMOKE',
    vus: profile.vus,
    duration: profile.duration
  });
}
