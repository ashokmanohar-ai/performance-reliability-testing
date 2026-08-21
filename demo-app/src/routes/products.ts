import type { FastifyInstance } from 'fastify';
import type pg from 'pg';

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function registerProductRoutes(
  app: FastifyInstance,
  pool: pg.Pool,
  authenticate: ReturnType<typeof import('./auth.js').authentication>,
  simulatedDelayMs: number
) {
  app.get<{ Querystring: { search?: string; limit?: string } }>(
    '/api/products',
    { preHandler: authenticate },
    async (request) => {
      if (simulatedDelayMs) await delay(simulatedDelayMs);
      const limit = Math.min(Math.max(Number(request.query.limit ?? 50), 1), 100);
      const search = request.query.search?.trim();
      const query = search
        ? {
            text: 'SELECT * FROM products WHERE name ILIKE $1 ORDER BY name LIMIT $2',
            values: [`%${search}%`, limit]
          }
        : { text: 'SELECT * FROM products ORDER BY name LIMIT $1', values: [limit] };
      const started = process.hrtime.bigint();
      const result = await pool.query(query);
      app.observeDbQuery(
        search ? 'search_products' : 'list_products',
        Number(process.hrtime.bigint() - started) / 1e9
      );
      return { items: result.rows, count: result.rowCount };
    }
  );

  app.get<{ Params: { id: string } }>(
    '/api/products/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      if (simulatedDelayMs) await delay(simulatedDelayMs);
      const started = process.hrtime.bigint();
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [request.params.id]);
      app.observeDbQuery('get_product', Number(process.hrtime.bigint() - started) / 1e9);
      return result.rows[0] ?? reply.code(404).send({ error: 'product not found' });
    }
  );
}
