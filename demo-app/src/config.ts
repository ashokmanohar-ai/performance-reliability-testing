import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function integer(name: string, fallback: number, minimum = 0): number {
  const raw = process.env[name];
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`${name} must be an integer greater than or equal to ${minimum}`);
  }
  return value;
}

export interface AppConfig {
  port: number;
  logLevel: string;
  databaseUrl: string;
  authSecret: string;
  paymentServiceUrl: string;
  paymentTimeoutMs: number;
  paymentMaxRetries: number;
  simulateProductDelayMs: number;
}

export function loadConfig(): AppConfig {
  const authSecret = required('AUTH_SECRET');
  if (authSecret.length < 32) throw new Error('AUTH_SECRET must contain at least 32 characters');

  return {
    port: integer('PORT', 3000, 1),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    databaseUrl: required('DATABASE_URL'),
    authSecret,
    paymentServiceUrl: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:8080',
    paymentTimeoutMs: integer('PAYMENT_TIMEOUT_MS', 3000, 100),
    paymentMaxRetries: integer('PAYMENT_MAX_RETRIES', 2, 0),
    simulateProductDelayMs: integer('SIMULATE_PRODUCT_DELAY_MS', 0, 0)
  };
}
