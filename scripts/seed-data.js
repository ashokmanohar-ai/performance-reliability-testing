import 'dotenv/config';
import { createHash } from 'node:crypto';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required. Copy .env.example to .env.');

const client = new Client({ connectionString });
await client.connect();
try {
  await client.query('BEGIN');
  for (let index = 1; index <= 100; index += 1) {
    const id = `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
    const sku = `ACME-${String(index).padStart(4, '0')}`;
    await client.query(
      `INSERT INTO products (id, sku, name, price_cents, inventory)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price_cents = EXCLUDED.price_cents,
         inventory = GREATEST(products.inventory, EXCLUDED.inventory)`,
      [id, sku, `Performance Product ${index}`, 500 + index * 25, 10_000]
    );
  }
  const passwordHash = createHash('sha256')
    .update(process.env.TEST_PASSWORD ?? 'performance-test')
    .digest('hex');
  for (let index = 1; index <= 500; index += 1) {
    const id = `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
    const email = `perf-user-${index}@acme.test`;
    await client.query(
      `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash`,
      [id, email, passwordHash]
    );
  }
  await client.query('COMMIT');
  console.log('Seeded 100 products and 500 isolated performance-test users.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  await client.end();
}
