import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { normalizedMetrics } from './result-parser.js';

const source = process.env.RESULT_FILE ?? process.argv[2] ?? 'results/current/summary.json';
const summary = JSON.parse(await readFile(source, 'utf8'));
const metrics = normalizedMetrics(summary);
const metadata = summary.metadata ?? {};
const value = (number, suffix = '') =>
  number === null ? 'not captured' : `${Number(number).toFixed(2)}${suffix}`;
const markdown = `# Performance Test Report

- Generated: ${new Date().toISOString()}
- Scenario: ${metadata.scenario ?? 'unspecified'}
- Environment: ${metadata.environment ?? process.env.TEST_ENV ?? 'LOCAL'}
- Profile: ${metadata.profile ?? 'unspecified'}
- Virtual users: ${metadata.vus ?? 'see raw summary'}
- Duration: ${metadata.duration ?? 'see raw summary'}

| Measure | Result |
|---|---:|
| Total requests | ${value(metrics.requests)} |
| Throughput | ${value(metrics.throughputPerSecond, ' req/s')} |
| p50 latency | ${value(metrics.p50Ms, ' ms')} |
| p90 latency | ${value(metrics.p90Ms, ' ms')} |
| p95 latency | ${value(metrics.p95Ms, ' ms')} |
| p99 latency | ${value(metrics.p99Ms, ' ms')} |
| Error rate | ${value(metrics.errorRatePercent, '%')} |
| Check success | ${value(metrics.checksRatePercent, '%')} |

This report is generated from the supplied k6 summary. It does not invent values for metrics that
were not captured. Review Grafana and application logs with the correlation IDs when diagnosing a
regression.
`;
await mkdir('results/reports', { recursive: true });
await writeFile('results/reports/performance-report.md', markdown);
console.log(markdown);
