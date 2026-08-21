const REMOTE_PROFILES = new Set([
  'NORMAL_LOAD',
  'PEAK_LOAD',
  'STRESS',
  'SPIKE',
  'SOAK',
  'CAPACITY',
  'SCALABILITY'
]);

export function durationSeconds(value) {
  const match = /^(\d+(?:\.\d+)?)(s|m|h)$/.exec(value);
  if (!match) throw new Error(`Invalid duration '${value}'. Use s, m or h, for example 30s or 5m.`);
  const number = Number(match[1]);
  const multiplier = { s: 1, m: 60, h: 3600 }[match[2]];
  return number * multiplier;
}

export function classifyTarget(value) {
  const url = new URL(value);
  const localHosts = new Set(['localhost', '127.0.0.1', '::1', 'demo-app']);
  return localHosts.has(url.hostname) ? 'LOCAL' : 'REMOTE';
}

export function enforceSafety({
  baseUrl,
  profile,
  vus,
  duration,
  maxVus,
  maxDuration,
  allowRemote
}) {
  if (!Number.isFinite(vus) || vus < 1 || vus > maxVus) {
    throw new Error(`Requested VUs (${vus}) exceed MAX_VUS (${maxVus}) or are invalid.`);
  }
  if (durationSeconds(duration) > durationSeconds(maxDuration)) {
    throw new Error(`Requested duration (${duration}) exceeds MAX_DURATION (${maxDuration}).`);
  }
  if (classifyTarget(baseUrl) === 'REMOTE' && REMOTE_PROFILES.has(profile) && !allowRemote) {
    throw new Error(
      `Remote ${profile} execution is blocked. Set an explicitly authorised BASE_URL and ALLOW_REMOTE_LOAD_TEST=true.`
    );
  }
}
