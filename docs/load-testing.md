# Load and Baseline Testing

Baseline testing measures stable behaviour at a small, representative load. Run it repeatedly after
warm-up to understand natural variance before declaring a 5–10% change meaningful.

Load testing applies the expected normal or peak business mix for a sustained period. Observe client
p50/p90/p95/p99, throughput, functional errors, business success, process CPU/memory, DB query
latency, connections, and waiting requests. A passing average with a failing p95 is not a pass.

```bash
npm run perf:baseline
npm run perf:load
```

The standard load ramps to avoid confusing startup/cache effects with steady-state behaviour. Before
using the result for release, verify that the target and generator did not scale or throttle in an
unrecorded way, that test data remained valid, and that the hold period was long enough to stabilise.
