import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalizedMetrics } from './result-parser.js';

function percentChange(current, baseline) {
  return baseline === 0
    ? current === 0
      ? 0
      : Number.POSITIVE_INFINITY
    : ((current - baseline) / baseline) * 100;
}

export function compareResults(currentSummary, baselineSummary, policy = {}) {
  const current = normalizedMetrics(currentSummary);
  const baseline = normalizedMetrics(baselineSummary);
  const p95RegressionPercent = percentChange(current.p95Ms, baseline.p95Ms);
  const errorRateIncreasePercentagePoints = current.errorRatePercent - baseline.errorRatePercent;
  const throughputRatio =
    baseline.throughputPerSecond === 0
      ? 0
      : current.throughputPerSecond / baseline.throughputPerSecond;
  const limits = {
    maxP95RegressionPercent: policy.maxP95RegressionPercent ?? 10,
    maxErrorRateIncreasePercentagePoints: policy.maxErrorRateIncreasePercentagePoints ?? 0.5,
    minThroughputRatio: policy.minThroughputRatio ?? 0.9
  };
  const metrics = {
    p95RegressionPercent,
    errorRateIncreasePercentagePoints,
    throughputRatio
  };
  const failures = [];
  if (p95RegressionPercent > limits.maxP95RegressionPercent) {
    failures.push(
      `p95 regression ${p95RegressionPercent.toFixed(1)}% > ${limits.maxP95RegressionPercent}%`
    );
  }
  if (errorRateIncreasePercentagePoints > limits.maxErrorRateIncreasePercentagePoints) {
    failures.push(
      `error-rate increase ${errorRateIncreasePercentagePoints.toFixed(2)}pp > ${limits.maxErrorRateIncreasePercentagePoints}pp`
    );
  }
  if (throughputRatio < limits.minThroughputRatio) {
    failures.push(`throughput ratio ${throughputRatio.toFixed(2)} < ${limits.minThroughputRatio}`);
  }
  return { pass: failures.length === 0, failures, metrics, current, baseline, limits };
}

async function main() {
  const currentPath = process.argv[2] ?? 'results/current/summary.json';
  const baselinePath = process.argv[3] ?? 'results/history/demo-baseline.json';
  const policy = JSON.parse(await readFile('quality/performance-policy.json', 'utf8'));
  const [current, baseline] = await Promise.all([
    readFile(currentPath, 'utf8').then(JSON.parse),
    readFile(baselinePath, 'utf8').then(JSON.parse)
  ]);
  const result = compareResults(current, baseline, policy.regression);
  console.log(JSON.stringify(result, null, 2));
  if (!result.pass) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
