# Troubleshooting

## Compose variable error

Copy `.env.example` to `.env` and replace all placeholder passwords/secrets. Compose intentionally
fails early when required values are missing.

## Service does not become healthy

Run `docker compose ps` and `docker compose logs <service>`. Verify ports 3000, 3001, 5432, 8080, and
9090 are free. Use `node scripts/wait-for-health.js` rather than adding a fixed sleep.

## Data seed fails

Confirm `DATABASE_URL` points to the host-published PostgreSQL port and the schema migration completed
in demo-app logs. Recreate only the local lab with `docker compose down -v`, start it, and seed again.

## k6 cannot connect

Run `curl http://localhost:3000/health`, check `BASE_URL`, and ensure k6 runs on the host. If k6 runs in
a container, use a reachable Compose network hostname rather than host localhost.

## Remote load blocked

This is expected. Confirm written authorisation and target ownership, then explicitly set
`ALLOW_REMOTE_LOAD_TEST=true`, `BASE_URL`, `MAX_VUS`, and `MAX_DURATION`. Never bypass the guard for a
public service.

## Threshold or regression failure

Retain the result; do not simply relax policy. Confirm comparable environment/workload, functional
errors, generator saturation, Prometheus/Grafana evidence, DB metrics, dependency state, warm-up, and
test-data validity. Repeat enough equivalent runs to distinguish variance from regression.

## Grafana dashboard missing

Check Grafana logs, datasource provisioning, and that the dashboard JSON is mounted. Query
`up{job="acme-performance-api"}` in Prometheus; it should be 1.

## Result file missing

Create `results/current` (present in Git through `.gitkeep`) and ensure `RESULT_FILE` is a writable
relative path. k6 creates the file from `handleSummary`; an interrupted run may not call it.
