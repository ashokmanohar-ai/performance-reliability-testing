import { check } from 'k6';

export function successful(response, label, accepted = [200]) {
  return check(response, {
    [`${label}: accepted status`]: (value) => accepted.includes(value.status),
    [`${label}: correlation id returned`]: (value) =>
      Boolean(value.headers['X-Correlation-Id'] || value.request?.headers?.['X-Correlation-Id'])
  });
}

export function jsonField(response, field, label) {
  return check(response, {
    [`${label}: response contains ${field}`]: (value) => Boolean(value.json(field))
  });
}
