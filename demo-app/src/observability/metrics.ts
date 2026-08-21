import type { FastifyInstance } from 'fastify';
import type pg from 'pg';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export function registerMetrics(app: FastifyInstance, pool: pg.Pool): void {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry, prefix: 'acme_' });

  const requestDuration = new Histogram({
    name: 'acme_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [registry]
  });
  const errors = new Counter({
    name: 'acme_http_errors_total',
    help: 'HTTP responses with a status code of 500 or greater',
    labelNames: ['route', 'status_code'],
    registers: [registry]
  });
  const dbConnections = new Gauge({
    name: 'acme_db_connections',
    help: 'PostgreSQL connection pool state',
    labelNames: ['state'],
    registers: [registry]
  });
  const dbQueryDuration = new Histogram({
    name: 'acme_db_query_duration_seconds',
    help: 'Selected business query duration in seconds',
    labelNames: ['operation'],
    buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    registers: [registry]
  });
  app.decorate('observeDbQuery', (operation: string, seconds: number) => {
    dbQueryDuration.labels(operation).observe(seconds);
  });

  app.addHook('onRequest', async (request) => {
    request.performanceStart = process.hrtime.bigint();
  });
  app.addHook('onResponse', async (request, reply) => {
    const route = request.routeOptions.url ?? 'unmatched';
    const seconds = Number(process.hrtime.bigint() - request.performanceStart) / 1e9;
    requestDuration.labels(request.method, route, String(reply.statusCode)).observe(seconds);
    if (reply.statusCode >= 500) errors.labels(route, String(reply.statusCode)).inc();
  });

  app.get('/metrics', async (_request, reply) => {
    dbConnections.labels('total').set(pool.totalCount);
    dbConnections.labels('idle').set(pool.idleCount);
    dbConnections.labels('waiting').set(pool.waitingCount);
    reply.header('content-type', registry.contentType);
    return registry.metrics();
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    performanceStart: bigint;
    userId?: string;
  }
  interface FastifyInstance {
    observeDbQuery(operation: string, seconds: number): void;
  }
}
