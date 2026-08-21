export function summaryHandler(data, metadata) {
  const output = { ...data, metadata: { ...metadata, generatedAt: new Date().toISOString() } };
  const p95 = data.metrics.http_req_duration?.values['p(95)'];
  const errors = data.metrics.http_req_failed?.values.rate;
  const rate = data.metrics.http_reqs?.values.rate;
  const consoleSummary = [
    '',
    'ACME PERFORMANCE SUMMARY',
    `Scenario: ${metadata.scenario}`,
    `Environment: ${metadata.environment}`,
    `p95: ${p95 === undefined ? 'n/a' : `${p95.toFixed(2)} ms`}`,
    `Error rate: ${errors === undefined ? 'n/a' : `${(errors * 100).toFixed(2)}%`}`,
    `Throughput: ${rate === undefined ? 'n/a' : `${rate.toFixed(2)} req/s`}`,
    ''
  ].join('\n');
  return {
    stdout: consoleSummary,
    [__ENV.RESULT_FILE || 'results/current/summary.json']: JSON.stringify(output, null, 2)
  };
}
