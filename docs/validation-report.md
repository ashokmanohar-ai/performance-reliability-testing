# Validation Report

Validation date: 2026-08-21  
GitHub Actions run: [Performance smoke #6](https://github.com/ashokmanohar-ai/performance-reliability-testing/actions/runs/32462398729)

## Validation summary

| Check                            | Status | Evidence                                                                       |
| -------------------------------- | ------ | ------------------------------------------------------------------------------ |
| `npm ci` / lock file             | PASS   | Clean GitHub runner installation; 0 audit vulnerabilities                      |
| ESLint                           | PASS   | Entire repository scanned with zero findings                                   |
| TypeScript strict typecheck      | PASS   | Node.js 22 / `tsc --noEmit` completed                                          |
| Application build and unit tests | PASS   | Production build; 7/7 auth, retry, regression, and safety tests                |
| Formatting/config syntax         | PASS   | Prettier plus JSON/YAML/shell validation                                       |
| Docker image build               | PASS   | Multi-stage Node.js 22 image built on GitHub runner                            |
| Docker Compose startup           | PASS   | PostgreSQL, WireMock, API, Prometheus, and Grafana started from a clean runner |
| Health validation                | PASS   | All four HTTP readiness endpoints verified without fixed sleep                 |
| PostgreSQL schema and seed       | PASS   | 100 products and 500 isolated test users seeded                                |
| Performance smoke                | PASS   | p95 4.88 ms; error rate 0%; 27,066 iterations                                  |
| Baseline profile                 | PASS   | Shortened CI-safe run; p95 9.17 ms; error rate 0%                              |
| Load profile                     | PASS   | Shortened CI-safe run; p95 8.28 ms; error rate 0%                              |
| Stress profile                   | PASS   | Shortened CI-safe run; p95 1.78 ms; error rate 0%                              |
| Spike/recovery profile           | PASS   | Shortened CI-safe run; p95 24.55 ms; error rate 0%                             |
| Soak configuration               | PASS   | Shortened CI-safe endurance run; p95 4.15 ms; error rate 0%                    |
| Scalability profile              | PASS   | Shortened CI-safe stepped run; p95 1.57 ms; error rate 0%                      |
| Capacity profile                 | PASS   | Shortened CI-safe arrival-rate run; p95 2.39 ms; error rate 0%                 |
| Dependency recovery              | PASS   | Controlled 503, bounded retries, restoration, and successful recovery          |
| Concurrent idempotency           | PASS   | 5 concurrent requests; one payment ID; `duplicate_transactions = 0`            |
| Prometheus integration           | PASS   | `up{job="acme-performance-api"} = 1` verified through API                      |
| Grafana provisioning             | PASS   | Dashboard UID `acme-performance` verified through API                          |
| Absolute quality gate            | PASS   | p95 5.09 ms; p99 7.28 ms; errors 0%; checks 100%                               |
| Controlled regression gate       | PASS   | Deliberate +30% p95 fixture produces exit code 1                               |
| Report/artifact generation       | PASS   | JSON summaries, gate JSON, and Markdown report uploaded                        |
| Teardown                         | PASS   | Containers, network, and PostgreSQL volume removed                             |

Critical issues: 0 open.

## Known limitations

- CI validates shortened safe profiles; it does not claim enterprise capacity or replace a 4–24 hour
  endurance test on dedicated infrastructure.
- The recorded numbers describe one ephemeral local GitHub runner and are execution evidence only,
  not a production performance baseline.
- Distributed k6, OpenTelemetry, and container/host exporters are documented opt-in extensions.
- Nightly historical comparison becomes meaningful after two equivalent scheduled runs have produced
  environment-matched evidence.

Overall status: **READY FOR USE / REVIEW**.
