import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type pg from 'pg';
import type { authentication } from './auth.js';

type Authenticate = ReturnType<typeof authentication>;

export async function registerCommerceRoutes(
  app: FastifyInstance,
  pool: pg.Pool,
  authenticate: Authenticate
) {
  app.post('/api/cart', { preHandler: authenticate }, async (request) => {
    const id = randomUUID();
    await pool.query('INSERT INTO carts (id, user_id) VALUES ($1, $2)', [id, request.userId]);
    return { id, userId: request.userId };
  });

  app.post<{ Body: { cartId?: string; productId?: string; quantity?: number } }>(
    '/api/cart/items',
    { preHandler: authenticate },
    async (request, reply) => {
      const { cartId, productId, quantity = 1 } = request.body ?? {};
      if (!cartId || !productId || !Number.isInteger(quantity) || quantity < 1) {
        return reply.code(400).send({ error: 'valid cartId, productId and quantity are required' });
      }
      const result = await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         SELECT $1, $2, $3 FROM carts c WHERE c.id = $1 AND c.user_id = $4
         ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
         RETURNING *`,
        [cartId, productId, quantity, request.userId]
      );
      return result.rows[0] ?? reply.code(404).send({ error: 'cart not found' });
    }
  );

  app.post<{ Body: { cartId?: string } }>(
    '/api/orders',
    { preHandler: authenticate },
    async (request, reply) => {
      const { cartId } = request.body ?? {};
      if (!cartId) return reply.code(400).send({ error: 'cartId is required' });
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const items = await client.query<{
          product_id: string;
          quantity: number;
          price_cents: number;
        }>(
          `SELECT ci.product_id, ci.quantity, p.price_cents
         FROM cart_items ci JOIN carts c ON c.id = ci.cart_id JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = $1 AND c.user_id = $2 FOR UPDATE OF p`,
          [cartId, request.userId]
        );
        if (items.rows.length === 0) {
          await client.query('ROLLBACK');
          return reply.code(409).send({ error: 'cart is empty or unavailable' });
        }
        for (const item of items.rows) {
          const inventory = await client.query(
            'UPDATE products SET inventory = inventory - $1 WHERE id = $2 AND inventory >= $1 RETURNING id',
            [item.quantity, item.product_id]
          );
          if (!inventory.rowCount) throw new Error('insufficient inventory');
        }
        const id = randomUUID();
        const total = items.rows.reduce((sum, item) => sum + item.quantity * item.price_cents, 0);
        await client.query(
          'INSERT INTO orders (id, user_id, total_cents, status) VALUES ($1, $2, $3, $4)',
          [id, request.userId, total, 'CREATED']
        );
        for (const item of items.rows) {
          await client.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price_cents) VALUES ($1, $2, $3, $4)',
            [id, item.product_id, item.quantity, item.price_cents]
          );
        }
        await client.query('COMMIT');
        return reply.code(201).send({ id, totalCents: total, status: 'CREATED' });
      } catch (error) {
        await client.query('ROLLBACK');
        if (error instanceof Error && error.message === 'insufficient inventory') {
          return reply.code(409).send({ error: error.message });
        }
        throw error;
      } finally {
        client.release();
      }
    }
  );

  app.get<{ Params: { id: string } }>(
    '/api/orders/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const result = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [
        request.params.id,
        request.userId
      ]);
      return result.rows[0] ?? reply.code(404).send({ error: 'order not found' });
    }
  );

  app.get<{ Params: { id: string } }>(
    '/api/customers/:id/orders',
    { preHandler: authenticate },
    async (request, reply) => {
      if (request.params.id !== request.userId) return reply.code(403).send({ error: 'forbidden' });
      const result = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
        [request.userId]
      );
      return { items: result.rows, count: result.rowCount };
    }
  );
}
