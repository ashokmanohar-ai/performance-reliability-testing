export function metricValue(summary, metricName, key) {
  const value = summary?.metrics?.[metricName]?.values?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function normalizedMetrics(summary) {
  return {
    p50Ms: metricValue(summary, 'http_req_duration', 'p(50)'),
    p90Ms: metricValue(summary, 'http_req_duration', 'p(90)'),
    p95Ms: metricValue(summary, 'http_req_duration', 'p(95)'),
    p99Ms: metricValue(summary, 'http_req_duration', 'p(99)'),
    errorRatePercent: multiply(metricValue(summary, 'http_req_failed', 'rate'), 100),
    throughputPerSecond: metricValue(summary, 'http_reqs', 'rate'),
    requests: metricValue(summary, 'http_reqs', 'count'),
    checksRatePercent: multiply(metricValue(summary, 'checks', 'rate'), 100),
    checkoutP95Ms: metricValue(summary, 'checkout_duration', 'p(95)'),
    checkoutSuccessPercent: multiply(metricValue(summary, 'checkout_success_rate', 'rate'), 100),
    duplicateTransactions: metricValue(summary, 'duplicate_transactions', 'count')
  };
}

function multiply(value, factor) {
  return value === null ? null : value * factor;
}
