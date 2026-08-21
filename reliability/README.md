# Reliability Harness

WireMock is a controlled local payment dependency. Reliability tests replace one mapping by its
stable ID, exercise timeouts, bounded retries, intermittent 5xx responses, recovery, and concurrent
idempotency, then restore the success mapping. Fault injection is restricted to the configured stub;
the framework does not introduce uncontrolled infrastructure chaos.
