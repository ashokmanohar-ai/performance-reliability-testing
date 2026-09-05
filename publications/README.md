# Technical White Papers

This directory is the publication index for technical white papers associated with the **Performance & Reliability Testing Framework** and authored by **Ashok Kumar Manohar**.

## 1. Performance and Reliability Engineering for AI Applications and AI Agents

**Performance and Reliability Engineering for AI Applications and AI Agents: Latency, Throughput, Cost, Resilience and SLOs for Production AI Systems**

- [Read the white paper](../WHITEPAPER.md)
- [Citation metadata](../CITATION.cff)
- Version: 1.0
- Published: September 2026

Focus: AI workload modeling, SLOs, percentile latency, TTFT, TPOT, end-to-end task latency, throughput, context growth, RAG and agent trajectories, token and cost efficiency, concurrency, queueing, fault injection, retries, idempotency, fallback, recovery, observability, baseline regression, safe capacity testing and CI/CD performance gates.

---

## Reference Implementations

The primary open-source [Performance & Reliability Testing Framework](https://github.com/ashokmanohar-ai/performance-reliability-testing) demonstrates k6 smoke, baseline, load, stress, spike, soak, scalability, capacity and resilience testing; p50/p90/p95/p99 analysis; absolute SLO gates; measured regression comparison; controlled dependency failure; bounded retries; idempotency; recovery timing; Prometheus/Grafana observability; safe target controls; and CI/CD release decisions.

The supporting [Enterprise AI Quality Engineering Platform](https://github.com/ashokmanohar-ai/enterprise-ai-quality-engineering-platform) extends the same evidence-and-gate philosophy to LLM, RAG, AI-agent, MCP, security, embedding and inference-performance evaluation.

> This is an independent technical white paper and is not a peer-reviewed academic publication, capacity certification, reliability guarantee, compliance certification, security certification, or statement of production readiness.