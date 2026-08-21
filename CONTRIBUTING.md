# Contributing

Use Node.js 22 and make focused changes on a feature branch. Before opening a pull request, run
`npm ci`, `npm run validate`, and the CI-safe performance smoke test against the local Docker
environment. Never point load, stress, spike, or soak profiles at shared or public systems without
written authorisation.

Changes to performance thresholds must include the business or SLO rationale. Changes to workload
mixes must identify the production evidence or explicit assumption behind the new distribution.
Generated result files should be attached as CI artifacts, not committed as claimed evidence.
