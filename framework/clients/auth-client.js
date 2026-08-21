import { check } from 'k6';
import { loginDuration } from '../metrics/custom-metrics.js';
import { tags } from '../metrics/tags.js';
import { request } from './base-client.js';

export function login(baseUrl, username, password) {
  const started = Date.now();
  const response = request(
    'POST',
    `${baseUrl}/api/login`,
    { username, password },
    null,
    tags.login
  );
  loginDuration.add(Date.now() - started);
  check(response, {
    'login succeeds': (value) => value.status === 200,
    'login returns token': (value) => Boolean(value.json('token'))
  });
  return response.status === 200 ? response.json('token') : null;
}
