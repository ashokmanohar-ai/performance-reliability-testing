# Scalability Testing

Scalability asks whether additional demand produces proportional useful throughput and whether adding
resources improves that relationship. This differs from capacity, which seeks the last sustainable
point for a fixed configuration.

The local scenario holds 50, 100, and 200 VUs. For each plateau capture VUs, throughput, p95/p99,
errors, CPU, memory, query latency, and connections. Calculate throughput per VU and resource cost per
successful transaction. Falling efficiency can expose serial work, pool/lock contention, a downstream
limit, or load-generator saturation.

```bash
npm run perf:scalability
```

To assess horizontal scaling, repeat the same workload and data with one, two, and more application
instances while keeping other variables stable. Record autoscaling reaction time and load balancing.
