# Optional OpenTelemetry Extension

Prometheus metrics and correlation-aware structured logs are enabled by default. OpenTelemetry is an
optional extension point so that missing collectors never destabilise the runnable baseline. In an
enterprise deployment, add the Node.js OpenTelemetry SDK and auto-instrumentations, export OTLP to a
collector, and propagate `x-correlation-id` as a span attribute. Capture HTTP and PostgreSQL spans,
but sample deliberately during heavy tests to control observer overhead and telemetry cost.
