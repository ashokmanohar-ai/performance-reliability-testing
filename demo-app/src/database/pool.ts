import pg from 'pg';

const { Pool } = pg;

export function createPool(connectionString: string): pg.Pool {
  return new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX ?? 20),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 3_000,
    application_name: 'acme-performance-api'
  });
}

export async function migrate(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL CHECK (price_cents > 0),
      inventory INTEGER NOT NULL CHECK (inventory >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS carts (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      PRIMARY KEY (cart_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      PRIMARY KEY (order_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY,
      order_id UUID NOT NULL REFERENCES orders(id),
      idempotency_key TEXT UNIQUE NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      dependency_attempts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
    CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at DESC);
  `);
}
