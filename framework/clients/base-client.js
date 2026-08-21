import http from 'k6/http';
import { correlationId } from '../utils/correlation.js';

export function request(method, url, body, token, tags = {}, extraHeaders = {}) {
  const headers = {
    'content-type': 'application/json',
    'x-correlation-id': correlationId(tags.transaction || 'perf'),
    ...extraHeaders
  };
  if (token) headers.authorization = `Bearer ${token}`;
  return http.request(method, url, body === undefined ? null : JSON.stringify(body), {
    headers,
    tags,
    timeout: __ENV.REQUEST_TIMEOUT || '15s'
  });
}
