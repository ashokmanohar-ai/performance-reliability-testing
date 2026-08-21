function seconds(value) {
  const match = /^(\d+(?:\.\d+)?)(s|m|h)$/.exec(value);
  if (!match) throw new Error(`Invalid duration '${value}'.`);
  return Number(match[1]) * { s: 1, m: 60, h: 3600 }[match[2]];
}

function isLocal(baseUrl) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|demo-app)(:\d+)?(\/|$)/.test(baseUrl);
}

function maximumVus(profile) {
  if (profile.vus) return profile.vus;
  if (profile.maxVUs) return profile.maxVUs;
  if (profile.stages) return Math.max(...profile.stages.map((stage) => stage.target));
  return 1;
}

function totalDuration(profile) {
  if (profile.duration) return seconds(profile.duration);
  return profile.stages?.reduce((total, stage) => total + seconds(stage.duration), 0) ?? 0;
}

export function assertSafeExecution(baseUrl, profileName, profile) {
  const vus = maximumVus(profile);
  const duration = totalDuration(profile);
  const maxVus = Number(__ENV.MAX_VUS || 500);
  const maxDuration = seconds(__ENV.MAX_DURATION || '30m');
  if (vus > maxVus) throw new Error(`Profile requires ${vus} VUs, above MAX_VUS=${maxVus}.`);
  if (duration > maxDuration)
    throw new Error(`Profile duration exceeds MAX_DURATION=${__ENV.MAX_DURATION || '30m'}.`);
  if (
    !isLocal(baseUrl) &&
    !['SMOKE', 'BASELINE'].includes(profileName) &&
    __ENV.ALLOW_REMOTE_LOAD_TEST !== 'true'
  ) {
    throw new Error(
      `Remote ${profileName} is blocked. Set ALLOW_REMOTE_LOAD_TEST=true only after authorisation.`
    );
  }
}
