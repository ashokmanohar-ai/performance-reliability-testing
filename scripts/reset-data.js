import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(
    'TRUNCATE payments, order_items, orders, cart_items, carts RESTART IDENTITY CASCADE'
  );
  console.log('Transactional test data reset. Users and product catalogue retained.');
} finally {
  await client.end();
}
