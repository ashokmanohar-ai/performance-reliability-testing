import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, issueToken, passwordMatches, verifyToken } from '../dist/services/auth.js';

const secret = 'a-secure-test-secret-that-is-long-enough';

test('password hashing compares without storing plaintext', () => {
  const hash = hashPassword('performance-test');
  assert.equal(passwordMatches('performance-test', hash), true);
  assert.equal(passwordMatches('wrong', hash), false);
});

test('token signature detects tampering', () => {
  const token = issueToken('user-1', secret);
  assert.equal(verifyToken(token, secret)?.sub, 'user-1');
  assert.equal(verifyToken(`${token}x`, secret), null);
});
