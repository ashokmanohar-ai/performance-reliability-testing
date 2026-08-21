# Interview Walkthrough

## Two-minute explanation

This framework demonstrates performance and reliability engineering across workload modelling, k6
execution, observability, regression analysis, and automated release gates. A realistic Fastify and
PostgreSQL commerce API gives the tests genuine transactions, inventory contention, authentication,
and dependency behaviour. k6 executes smoke through capacity profiles with a documented business mix,
per-VU data, think time, custom business metrics, and safe remote-load limits. Prometheus and Grafana
provide server and database context. WireMock drives controlled timeout, retry, recovery, and
idempotency scenarios. Finally, a policy-driven gate compares absolute SLOs and an equivalent measured
baseline, fails CI on regression, and produces reviewable evidence rather than decorative graphs.

## Five-minute walkthrough

1. Start with `framework/config/workload-models.js`: the business mix and executors explain why load is
   generated, not only how many VUs exist.
2. Show reusable clients and `commerce-journey.js`: per-VU login, variable think time, correlation, and
   business metrics.
3. Show the Fastify routes: PostgreSQL transaction rollback, inventory guard, dependency timeout/retry,
   and unique idempotency claim.
4. Open Grafana provisioning: client latency can be correlated with CPU, memory, DB query latency, and
   pool wait.
5. Run a WireMock outage/recovery and the concurrent duplicate-payment test.
6. Show `performance-policy.json`, the parser, controlled regression unit test, and non-zero exit.
7. Finish with PR/nightly/release workflows and explain why heavy load uses dedicated infrastructure.

## Common questions

| Question                  | Concise answer                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Load vs stress?           | Load validates expected demand; stress increases demand to expose limits and failure mode.                         |
| Stress vs spike?          | Stress rises progressively; spike changes abruptly and emphasises surge recovery.                                  |
| Soak?                     | Sustained moderate load finds leaks, accumulation, and time-dependent degradation.                                 |
| Why p95?                  | It protects most users while revealing slow cohorts that an average hides; retain p99 for tail risk.               |
| Throughput?               | Successful work completed per time unit, interpreted with latency/errors and business outcome.                     |
| Concurrency?              | Work overlapping in time; it is not identical to requests per second.                                              |
| VUs vs arrival rate?      | VUs are a closed session model; arrival rate starts work independently of response time.                           |
| Model production traffic? | Use analytics/forecasts for journeys, rates, peaks, think time, data, sessions, and regions.                       |
| SLA vs SLO?               | SLA is an external commitment/remedy; SLO is an internal measured objective, usually tighter.                      |
| Detect regression?        | Compare equivalent measured runs and gate p95, errors, throughput, and business success.                           |
| High p99 causes?          | Queueing, GC, locks, slow queries, retries, cache misses, network tails, or noisy neighbours.                      |
| Identify bottlenecks?     | Correlate symptom timing with CPU, memory, DB, pool, dependency, logs/traces; vary one factor.                     |
| Test microservices?       | Model end-to-end journeys plus component tests; control dependencies and preserve trace context.                   |
| Test resilience?          | Inject bounded delay/failure, assert containment/data safety, restore, and measure recovery.                       |
| Test retries?             | Verify retryable statuses, attempts, backoff, total latency, amplification, and idempotency.                       |
| Validate idempotency?     | Send concurrent duplicates with one key and assert one durable side effect/consistent responses.                   |
| Performance in CI?        | Short PR smoke, nightly load/regression, release validation on dedicated runners.                                  |
| Why not heavy PR load?    | It is slow, expensive, noisy, and poorly isolated; PR gates should give fast deterministic signal.                 |
| Scale k6?                 | k6 Operator or Cloud, partition a global workload, centralise metrics, verify generators.                          |
| Kubernetes value?         | Repeatable workers, scheduling, resource limits, regional topology, and controlled horizontal scale.               |
| Grafana/Prometheus value? | They correlate customer symptoms with server/resource causes and preserve time-aligned evidence.                   |
| What blocks production?   | Mandatory latency/error/business SLO failure, regression, unsafe capacity, corruption, duplicates, or no recovery. |

## Trade-offs to state openly

The demo is intentionally single-instance and does not claim production capacity. The included
baseline is labelled sample data. OpenTelemetry and distributed k6 are optional extensions. These
boundaries make the local path reproducible while showing exactly how an enterprise implementation
would scale.
