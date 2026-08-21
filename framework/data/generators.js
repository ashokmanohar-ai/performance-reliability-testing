export function userForVu(vu = __VU) {
  const bounded = ((vu - 1) % 500) + 1;
  return {
    username: `perf-user-${bounded}@acme.test`,
    password: __ENV.TEST_PASSWORD || 'performance-test'
  };
}

export function productForIteration(iteration = __ITER) {
  const bounded = (iteration % 100) + 1;
  return `00000000-0000-4000-8000-${String(bounded).padStart(12, '0')}`;
}

export function idempotencyKey(prefix = 'payment') {
  return `${prefix}-${__VU}-${__ITER}-${Date.now()}`;
}
