const environments = {
  LOCAL: { baseUrl: 'http://localhost:3000', paymentStubUrl: 'http://localhost:8080' },
  DEV: { baseUrl: __ENV.BASE_URL, paymentStubUrl: __ENV.PAYMENT_STUB_URL },
  QA: { baseUrl: __ENV.BASE_URL, paymentStubUrl: __ENV.PAYMENT_STUB_URL },
  UAT: { baseUrl: __ENV.BASE_URL, paymentStubUrl: __ENV.PAYMENT_STUB_URL }
};

export function environment() {
  const name = (__ENV.TEST_ENV || 'LOCAL').toUpperCase();
  const selected = environments[name];
  if (!selected) throw new Error(`Unsupported TEST_ENV '${name}'. Use LOCAL, DEV, QA or UAT.`);
  if (!selected.baseUrl) throw new Error(`BASE_URL is required for ${name}.`);
  return {
    name,
    baseUrl: selected.baseUrl.replace(/\/$/, ''),
    paymentStubUrl: selected.paymentStubUrl?.replace(/\/$/, ''),
    username: __ENV.TEST_USERNAME || 'perf-user-1@acme.test',
    password: __ENV.TEST_PASSWORD || 'performance-test',
    timeout: __ENV.REQUEST_TIMEOUT || '15s'
  };
}
