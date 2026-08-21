const profiles = {
  SMOKE: { executor: 'constant-vus', vus: 5, duration: '30s' },
  BASELINE: { executor: 'constant-vus', vus: 10, duration: '2m' },
  NORMAL_LOAD: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 50 },
      { duration: '5m', target: 50 },
      { duration: '1m', target: 0 }
    ]
  },
  PEAK_LOAD: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 200 },
      { duration: '1m', target: 0 }
    ]
  },
  STRESS: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '1m', target: 200 },
      { duration: '1m', target: 400 },
      { duration: '1m', target: 0 }
    ]
  },
  SPIKE: {
    executor: 'ramping-vus',
    startVUs: 10,
    stages: [
      { duration: '30s', target: 10 },
      { duration: '10s', target: 200 },
      { duration: '1m', target: 200 },
      { duration: '20s', target: 10 },
      { duration: '30s', target: 10 }
    ]
  },
  SOAK: { executor: 'constant-vus', vus: 25, duration: '15m' },
  SCALABILITY: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 50 },
      { duration: '2m', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '2m', target: 100 },
      { duration: '1m', target: 200 },
      { duration: '2m', target: 200 },
      { duration: '1m', target: 0 }
    ]
  },
  CAPACITY: {
    executor: 'ramping-arrival-rate',
    startRate: 10,
    timeUnit: '1s',
    preAllocatedVUs: 50,
    maxVUs: 300,
    stages: [
      { duration: '1m', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '1m', target: 200 },
      { duration: '1m', target: 300 },
      { duration: '30s', target: 0 }
    ]
  }
};

export function workloadProfile(name) {
  const selected = profiles[name];
  if (!selected) throw new Error(`Unknown workload profile '${name}'.`);
  const profile = JSON.parse(JSON.stringify(selected));
  if (__ENV.TARGET_VUS && 'vus' in profile) profile.vus = Number(__ENV.TARGET_VUS);
  if (__ENV.TEST_DURATION && 'duration' in profile) profile.duration = __ENV.TEST_DURATION;
  if (__ENV.CI_SAFE === 'true' && profile.stages) {
    const target = Math.min(Number(__ENV.TARGET_VUS || 20), 50);
    if (profile.executor === 'ramping-arrival-rate') {
      profile.stages = [
        { duration: '30s', target: Math.min(target, 20) },
        { duration: __ENV.TEST_DURATION || '1m', target },
        { duration: '30s', target: 0 }
      ];
      profile.preAllocatedVUs = Math.min(profile.preAllocatedVUs, 20);
      profile.maxVUs = Math.min(profile.maxVUs, 50);
    } else {
      profile.stages = [
        { duration: '30s', target },
        { duration: __ENV.TEST_DURATION || '1m', target },
        { duration: '30s', target: 0 }
      ];
    }
  }
  return profile;
}

export const businessMix = Object.freeze({
  browseProducts: 45,
  searchProducts: 20,
  viewProduct: 15,
  createCart: 10,
  checkout: 7,
  viewOrders: 3
});
