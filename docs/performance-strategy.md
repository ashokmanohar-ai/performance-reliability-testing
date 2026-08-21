# Performance Engineering Strategy

## Objectives

- Protect user-facing p95/p99 latency and business success objectives.
- Establish sustainable throughput and approximate capacity before release.
- Detect build-to-build regressions under equivalent conditions.
- expose bottlenecks with client, application, process, query, and pool evidence.
- Validate graceful degradation, recovery, idempotency, and data consistency.

## Entry criteria

- Functional/API contract tests pass.
- Target version, topology, autoscaling policy, data volume, and dependencies are recorded.
- Test accounts/data and written load-test approval exist.
- Monitoring, log access, stop conditions, owners, and rollback path are agreed.
- The load generator has adequate CPU, memory, network, and file descriptors.

## Service objectives

The sample policy uses API p95 ≤ 750 ms, p99 ≤ 1500 ms, error rate ≤ 1%, checkout success ≥ 99%,
and p95 regression ≤ 10%. These are examples of governed criteria, not universal targets. Real SLAs
come from contracts; SLOs should be tighter internal objectives that leave an error-budget margin.

## Baseline discipline

A baseline is measured evidence, not a hand-written number. Record commit, environment, topology,
dataset, profile, test generator, warm-up, time window, and dependencies. Discard comparisons when
these dimensions differ materially. Retain raw summaries and diagnostic dashboards with the release.

## Environment and data

Use production-like instance sizes, scaling settings, network paths, DB indexes/statistics, and data
shape. Seed unique user data and enough inventory to prevent contention unless contention is the test
objective. Reset mutable data between runs and warm caches consistently.

## Execution sequence

1. Smoke the environment and telemetry.
2. Run a low-noise baseline multiple times and quantify variance.
3. Execute representative sustained load.
4. Increase stress or arrival rate until an objective or resource limit is reached.
5. Apply spike, soak, and reliability profiles appropriate to risk.
6. Correlate symptoms with server/resource metrics; change one factor at a time.
7. Re-test the fix and compare equivalent evidence.

## Exit criteria

- All mandatory SLO and business thresholds pass.
- No uncontrolled 5xx, data corruption, duplicate payment, or unrecovered dependency failure occurs.
- Capacity headroom covers forecast peak plus agreed safety margin.
- Significant p95, p99, error, or throughput regression has an accepted explanation/remediation.
- Raw evidence, report, constraints, limitations, and owner approval are retained.

Stop immediately if the wrong target is detected, monitoring is unavailable, generator saturation
invalidates results, a dependency owner asks to stop, or data integrity is at risk.
