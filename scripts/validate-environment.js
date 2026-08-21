import { classifyTarget, enforceSafety } from '../quality/safety-guard.js';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
const classification = classifyTarget(baseUrl);
enforceSafety({
  baseUrl,
  profile: process.env.PERF_PROFILE ?? 'SMOKE',
  vus: Number(process.env.TARGET_VUS ?? 5),
  duration: process.env.TEST_DURATION ?? '30s',
  maxVus: Number(process.env.MAX_VUS ?? 500),
  maxDuration: process.env.MAX_DURATION ?? '30m',
  allowRemote: process.env.ALLOW_REMOTE_LOAD_TEST === 'true'
});
console.log(`Environment validation passed: ${classification} target ${baseUrl}`);
