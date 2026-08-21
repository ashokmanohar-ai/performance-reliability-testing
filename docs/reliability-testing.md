# Reliability and Resilience Testing

Reliability is sustained correct service over time. Resilience is the ability to contain failure and
recover. Load tests alone do not prove either.

## Covered risks

- Downstream 500/503 responses and partial failure
- Slow dependency exceeding the application timeout
- Bounded retry count and exponential backoff
- Recovery after dependency restoration
- Concurrent idempotency-key reuse
- Transaction rollback on insufficient inventory
- DB connection-pool pressure observable through metrics

## Timeout and retry contract

The payment client uses a 3-second default timeout and two retries (three total attempts). Retrying only
server/transport failures prevents repeated deterministic client errors. Backoff reduces retry storms;
the total latency budget still needs checking because retries can amplify tail latency.

## Idempotency

The database claims the idempotency key before calling the dependency. Concurrent duplicates read the
same record instead of executing another charge. The k6 batch scenario asserts one payment ID from
five simultaneous requests.

## Recovery

The recovery scenario creates a controlled outage, asserts a safe gateway error, restores the mapping,
polls a fresh transaction, and records `recovery_time_ms`. Passing requires recovery inside the policy
window, no duplicate transaction, and no data corruption.

```bash
npm run perf:resilience
k6 run tests/performance/resilience/payment-unavailable.js
k6 run tests/performance/resilience/payment-slow.js
k6 run tests/performance/resilience/intermittent-failure.js
k6 run tests/performance/resilience/idempotency.js
```

These tests mutate only the local WireMock mapping. Do not adapt them to a shared dependency without
owner approval and isolation.
