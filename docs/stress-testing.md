# Stress and Capacity Testing

Stress testing deliberately increases demand until latency, errors, throughput efficiency, or a
resource objective degrades. It identifies the failure mode and recovery behaviour; it is not an
instruction to crash uncontrolled infrastructure.

The stress profile moves through 50, 100, 200, and 400 VUs. Capacity uses increasing arrival rate.
At each step record throughput, p95/p99, errors, CPU, memory, DB query time, pool wait, and whether
throughput continues to scale. The sustainable capacity is the last stable step that meets every
mandatory objective—not the largest request spike observed.

```bash
npm run perf:stress
npm run perf:capacity
```

Run only in an isolated, approved environment with explicit stop limits. After the peak, verify that
latency, errors, queues, connections, and resource use return to baseline.
