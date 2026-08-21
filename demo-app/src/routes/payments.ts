import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type pg from 'pg';
import type { AppConfig } from '../config.js';
import { chargeDependency, DependencyError } from '../services/payment-dependency.js';
import type { authentication } from './auth.js';

export async function registerPaymentRoutes(
  app: FastifyInstance,
  pool: pg.Pool,
  authenticate: ReturnType<typeof authentication>,
  config: AppConfig
) {
  app.post<{
    Body: { orderId?: string; amountCents?: number };
    Headers: { 'idempotency-key'?: string };
  }>('/api/payments', { preHandler: authenticate }, async (request, reply) => {
    const idempotencyKey = request.headers['idempotency-key'];
    const { orderId, amountCents } = request.body ?? {};
    if (!idempotencyKey || !orderId || !Number.isInteger(amountCents) || Number(amountCents) < 1) {
      return reply
        .code(400)
        .send({ error: 'idempotency-key, orderId and positive amountCents are required' });
    }

    const paymentId = randomUUID();
    const claimed = await pool.query(
      `INSERT INTO payments (id, order_id, idempotency_key, amount_cents, status)
       SELECT $1, o.id, $2, $3, 'PROCESSING' FROM orders o
       WHERE o.id = $4 AND o.user_id = $5
       ON CONFLICT (idempotency_key) DO NOTHING RETURNING *`,
      [paymentId, idempotencyKey, amountCents, orderId, request.userId]
    );
    if (!claimed.rowCount) {
      const existing = await pool.query('SELECT * FROM payments WHERE idempotency_key = $1', [
        idempotencyKey
      ]);
      return existing.rows[0]
        ? reply.code(200).send({ ...existing.rows[0], idempotentReplay: true })
        : reply.code(404).send({ error: 'order not found' });
    }

    try {
      const dependency = await chargeDependency(
        config.paymentServiceUrl,
        config.paymentTimeoutMs,
        config.paymentMaxRetries,
        { paymentId, orderId, amountCents }
      );
      const updated = await pool.query(
        `UPDATE payments SET status = 'COMPLETED', dependency_attempts = $2, updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [paymentId, dependency.attempts]
      );
      await pool.query("UPDATE orders SET status = 'PAID' WHERE id = $1", [orderId]);
      return reply.code(201).send({ ...updated.rows[0], transactionId: dependency.transactionId });
    } catch (error) {
      const attempts =
        typeof (error as { attempts?: unknown }).attempts === 'number'
          ? (error as { attempts: number }).attempts
          : 1;
      await pool.query(
        `UPDATE payments SET status = 'FAILED', dependency_attempts = $2, updated_at = NOW() WHERE id = $1`,
        [paymentId, attempts]
      );
      if (error instanceof DependencyError) {
        return reply
          .code(error.statusCode === 504 ? 504 : 502)
          .send({ error: 'payment dependency unavailable', attempts });
      }
      throw error;
    }
  });
}
