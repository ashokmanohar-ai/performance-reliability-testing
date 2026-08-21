# Observability

## Metrics

k6 measures customer-visible performance. Prometheus scrapes server request histogram/counter data,
Node.js CPU/memory/runtime metrics, selected PostgreSQL query histograms, and connection-pool state.
Grafana aligns these signals to distinguish target saturation from load-generator or network effects.

Useful investigation sequence:

1. Identify the exact time and affected endpoint/business transaction.
2. Confirm whether errors, p95, p99, or throughput changed first.
3. Compare CPU, memory, DB query p95, total/idle/waiting connections, and dependency behaviour.
4. Use `x-correlation-id` to locate a representative slow request in structured logs.
5. Form one bottleneck hypothesis, change one factor, and repeat the same workload.

## Logs

Fastify emits JSON logs. Incoming correlation IDs become request IDs and are returned on the response.
Avoid debug logging during benchmark measurement unless log overhead is itself being tested.

## Traces

OpenTelemetry can connect HTTP and PostgreSQL spans, but it is deliberately optional. If enabled,
measure sampling/export overhead, propagate the correlation ID as an attribute, and keep an OTLP
collector outage from failing the application. See `observability/otel/README.md`.

## Root-cause example

If p95 rises from 320 ms to 850 ms while CPU/memory remain stable and DB query p95 rises sharply, the
evidence points toward query plan, lock, I/O, data-volume, or pool behaviour. It is a hypothesis to
verify, not automated AI diagnosis.
