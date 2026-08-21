export const standardThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<750', 'p(99)<1500'],
  checks: ['rate>0.99'],
  'http_req_duration{endpoint:products}': ['p(95)<600'],
  'http_req_duration{endpoint:checkout}': ['p(95)<1200']
};

export const commerceThresholds = {
  ...standardThresholds,
  checkout_success_rate: ['rate>0.99']
};

export const resilienceThresholds = {
  checks: ['rate>0.98'],
  recovery_time_ms: ['p(95)<30000']
};
