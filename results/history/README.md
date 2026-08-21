# Historical Results

`demo-baseline.json` is explicitly labelled illustrative sample data. It exists to demonstrate the
regression contract and must never be presented as execution evidence. Replace it with a measured
baseline from the same application version, environment, data volume, workload model, and load
generator topology before making a release decision.

Real historical summaries should normally live in a durable CI artifact store or time-series system;
only small, reviewed reference baselines belong in Git.
