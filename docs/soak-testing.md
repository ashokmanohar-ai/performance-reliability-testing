# Soak / Endurance Testing

Soak testing applies moderate representative demand long enough to reveal progressive problems:
memory/connection leaks, cache growth, log/disk accumulation, fragmentation, latency drift, error
accumulation, expiring tokens, and scheduled jobs.

The portfolio default is 25 VUs for 15 minutes. A production programme may require 4, 8, or 24 hours
based on leak rate, batch cycles, and service criticality. Long tests need dedicated runners and
durable telemetry; do not use a shared GitHub-hosted runner.

```bash
npm run perf:soak
```

Compare early, middle, and late windows rather than one aggregate percentile. A flat average can hide
a late-run degradation. Continue monitoring after ramp-down to confirm connections and memory recover.
