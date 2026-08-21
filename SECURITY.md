# Security Policy

Report vulnerabilities privately through GitHub's security advisory feature. Do not open public
issues containing credentials, exploitable details, customer endpoints, or production test data.

This repository is safe-by-default: remote high-load execution is blocked unless
`ALLOW_REMOTE_LOAD_TEST=true`, credentials are supplied only at runtime, and load/duration guards
limit accidental resource consumption. The sample `.env.example` values are local placeholders and
must be replaced for any non-local deployment.
