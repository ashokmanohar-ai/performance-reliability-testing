# Performance Quality Gates

The release decision combines absolute objectives with relative regression checks.

## Absolute policy

- API p95 ≤ 750 ms
- API p99 ≤ 1500 ms
- HTTP error rate ≤ 1%
- k6 check success ≥ 99%
- checkout success ≥ 99% when captured
- minimum non-zero throughput

## Regression policy

- p95 degradation ≤ 10%
- error-rate increase ≤ 0.5 percentage points
- throughput ≥ 90% of baseline

The detector exits non-zero when any criterion fails. `SKIP_REGRESSION=true` is reserved for PR smoke
or a first run where only absolute objectives are defensible; it must not be used to hide an available
equivalent baseline.

```bash
RESULT_FILE=results/current/summary.json npm run perf:gate
npm run perf:regression -- results/current/summary.json results/baseline/equivalent.json
```

The parser treats missing required metrics as a failure. The bundled demo baseline is labelled sample
data. Nightly CI caches its measured summary and compares the next equivalent run before replacing it.

Functional and performance failures remain distinct: a 500 contributes to the functional error rate;
a correct response that breaches p95 contributes to the latency failure. Either can block release.
