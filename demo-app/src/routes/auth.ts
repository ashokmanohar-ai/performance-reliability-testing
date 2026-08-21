import type { FastifyInstance } from 'fastify';
import type pg from 'pg';
import { issueToken, passwordMatches, verifyToken } from '../services/auth.js';

export function authentication(secret: string) {
  return async function authenticate(
    request: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply
  ) {
    const header = request.headers.authorization;
    const payload = header?.startsWith('Bearer ') ? verifyToken(header.slice(7), secret) : null;
    if (!payload) return reply.code(401).send({ error: 'unauthorized' });
    request.userId = payload.sub;
  };
}

export async function registerAuthRoutes(app: FastifyInstance, pool: pg.Pool, secret: string) {
  app.post<{ Body: { username?: string; password?: string } }>(
    '/api/login',
    async (request, reply) => {
      const { username, password } = request.body ?? {};
      if (!username || !password)
        return reply.code(400).send({ error: 'username and password are required' });
      const result = await pool.query<{ id: string; password_hash: string }>(
        'SELECT id, password_hash FROM users WHERE email = $1',
        [username]
      );
      const user = result.rows[0];
      if (!user || !passwordMatches(password, user.password_hash)) {
        return reply.code(401).send({ error: 'invalid credentials' });
      }
      return { token: issueToken(user.id, secret), expiresInSeconds: 3600 };
    }
  );
}
