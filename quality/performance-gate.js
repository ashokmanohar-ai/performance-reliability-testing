import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { compareResults } from './regression-detector.js';
import { normalizedMetrics } from './result-parser.js';

const currentPath = process.env.RESULT_FILE ?? process.argv[2] ?? 'results/current/summary.json';
const baselinePath =
  process.env.BASELINE_FILE ?? process.argv[3] ?? 'results/history/demo-baseline.json';
const policy = JSON.parse(await readFile('quality/performance-policy.json', 'utf8'));
const [currentSummary, baselineSummary] = await Promise.all([
  readFile(currentPath, 'utf8').then(JSON.parse),
  readFile(baselinePath, 'utf8').then(JSON.parse)
]);
const current = normalizedMetrics(currentSummary);
const regression = compareResults(currentSummary, baselineSummary, policy.regression);
const skipRegression = process.env.SKIP_REGRESSION === 'true';

const evaluations = [
  ['API p95', current.p95Ms, '<=', policy.api.p95Ms, current.p95Ms <= policy.api.p95Ms, 'ms'],
  ['API p99', current.p99Ms, '<=', policy.api.p99Ms, current.p99Ms <= policy.api.p99Ms, 'ms'],
  [
    'Error rate',
    current.errorRatePercent,
    '<=',
    policy.api.errorRatePercent,
    current.errorRatePercent <= policy.api.errorRatePercent,
    '%'
  ],
  [
    'Throughput',
    current.throughputPerSecond,
    '>=',
    policy.api.minimumThroughputPerSecond,
    current.throughputPerSecond >= policy.api.minimumThroughputPerSecond,
    '/s'
  ],
  ['Checks', current.checksRatePercent, '>=', 99, current.checksRatePercent >= 99, '%'],
  [
    'Checkout success',
    current.checkoutSuccessPercent,
    '>=',
    policy.checkout.successRatePercent,
    current.checkoutSuccessPercent === null ||
      current.checkoutSuccessPercent >= policy.checkout.successRatePercent,
    '%'
  ],
  [
    'p95 regression',
    regression.metrics.p95RegressionPercent,
    '<=',
    policy.regression.maxP95RegressionPercent,
    skipRegression ||
      regression.metrics.p95RegressionPercent <= policy.regression.maxP95RegressionPercent,
    '%'
  ]
];

const missing = evaluations.filter((entry) => entry[1] === null && entry[0] !== 'Checkout success');
const failures = evaluations.filter((entry) => entry[4] === false);
const pass = failures.length === 0 && missing.length === 0;

console.log('\nPERFORMANCE QUALITY GATE');
for (const [name, value, operator, threshold, passed, unit] of evaluations) {
  const formatted = value === null ? 'not captured' : `${Number(value).toFixed(2)}${unit}`;
  console.log(
    `${String(name).padEnd(22)} ${formatted.padStart(14)}  ${operator} ${threshold}${unit}  ${passed ? 'PASS' : 'FAIL'}`
  );
}
console.log(`\nFINAL DECISION: ${pass ? 'PASS' : 'FAIL'}`);
if (skipRegression)
  console.log('Regression comparison: SKIPPED (absolute smoke/reliability gate only).');
if (baselineSummary.metadata?.classification === 'DEMO_SAMPLE') {
  console.log(
    'Note: comparison baseline is labelled DEMO_SAMPLE; replace it with an environment-matched measured baseline.'
  );
}

await mkdir('results/reports', { recursive: true });
await writeFile(
  'results/reports/gate-result.json',
  JSON.stringify({ pass, generatedAt: new Date().toISOString(), evaluations, regression }, null, 2)
);
if (!pass) process.exitCode = 1;
