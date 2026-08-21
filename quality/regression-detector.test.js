import assert from 'node:assert/strict';
import test from 'node:test';
import { compareResults } from './regression-detector.js';
import { classifyTarget, durationSeconds, enforceSafety } from './safety-guard.js';

function summary({ p95 = 400, errorRate = 0.001, throughput = 100 } = {}) {
  return {
    metrics: {
      http_req_duration: { values: { 'p(50)': 100, 'p(90)': 300, 'p(95)': p95, 'p(99)': 800 } },
      http_req_failed: { values: { rate: errorRate } },
      http_reqs: { values: { rate: throughput, count: 1000 } },
      checks: { values: { rate: 1 } }
    }
  };
}

test('regression detector passes changes within policy', () => {
  assert.equal(compareResults(summary({ p95: 420 }), summary()).pass, true);
});

test('controlled latency regression fails the quality decision', () => {
  const result = compareResults(summary({ p95: 520 }), summary(), { maxP95RegressionPercent: 10 });
  assert.equal(result.pass, false);
  assert.match(result.failures[0], /p95 regression/);
});

test('safety guard blocks unapproved remote load and runaway duration', () => {
  assert.equal(classifyTarget('http://localhost:3000'), 'LOCAL');
  assert.equal(classifyTarget('https://qa.example.com'), 'REMOTE');
  assert.equal(durationSeconds('2m'), 120);
  assert.throws(() =>
    enforceSafety({
      baseUrl: 'https://qa.example.com',
      profile: 'STRESS',
      vus: 100,
      duration: '5m',
      maxVus: 500,
      maxDuration: '30m',
      allowRemote: false
    })
  );
  assert.throws(() =>
    enforceSafety({
      baseUrl: 'http://localhost:3000',
      profile: 'SOAK',
      vus: 20,
      duration: '31m',
      maxVus: 500,
      maxDuration: '30m',
      allowRemote: true
    })
  );
});
