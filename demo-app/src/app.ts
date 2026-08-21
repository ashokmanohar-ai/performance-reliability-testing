import { randomUUID } from 'node:crypto';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import type pg from 'pg';
import type { AppConfig } from './config.js';
import { registerMetrics } from './observability/metrics.js';
import { authentication, registerAuthRoutes } from './routes/auth.js';
import { registerCommerceRoutes } from './routes/commerce.js';
import { registerPaymentRoutes } from './routes/payments.js';
import { registerProductRoutes } from './routes/products.js';

export async function buildApp(config: AppConfig, pool: pg.Pool) {
  const app = Fastify({
    logger: { level: config.logLevel },
    genReqId: (request) => String(request.headers['x-correlation-id'] ?? randomUUID()),
    requestTimeout: 10_000,
    bodyLimit: 64 * 1024
  });
  await app.register(helmet);
  registerMetrics(app, pool);
  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-correlation-id', request.id);
  });

  app.get('/health', async (_request, reply) => {
    try {
      await pool.query('SELECT 1');
      return { status: 'ok', database: 'up', timestamp: new Date().toISOString() };
    } catch {
      return reply.code(503).send({ status: 'degraded', database: 'down' });
    }
  });

  const authenticate = authentication(config.authSecret);
  await registerAuthRoutes(app, pool, config.authSecret);
  await registerProductRoutes(app, pool, authenticate, config.simulateProductDelayMs);
  await registerCommerceRoutes(app, pool, authenticate);
  await registerPaymentRoutes(app, pool, authenticate, config);

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, correlationId: request.id }, 'request failed');
    reply.code(500).send({ error: 'internal server error', correlationId: request.id });
  });
  return app;
}
