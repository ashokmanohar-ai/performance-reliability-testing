const prometheusUrl = process.env.PROMETHEUS_URL ?? 'http://localhost:9090';
const grafanaUrl = process.env.GRAFANA_URL ?? 'http://localhost:3001';
const grafanaUser = process.env.GRAFANA_ADMIN_USER;
const grafanaPassword = process.env.GRAFANA_ADMIN_PASSWORD;

if (!grafanaUser || !grafanaPassword) {
  throw new Error('GRAFANA_ADMIN_USER and GRAFANA_ADMIN_PASSWORD are required.');
}

async function eventually(label, assertion, attempts = 20) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      if (await assertion()) {
        console.log(`Verified: ${label}`);
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`${label} was not ready: ${String(lastError ?? 'assertion returned false')}`);
}

await eventually('Prometheus scrapes the Acme API', async () => {
  const query = encodeURIComponent('up{job="acme-performance-api"}');
  const response = await fetch(`${prometheusUrl}/api/v1/query?query=${query}`);
  if (!response.ok) return false;
  const body = await response.json();
  return body.data?.result?.some((series) => series.value?.[1] === '1');
});

await eventually('Grafana provisioned the Acme dashboard', async () => {
  const credentials = Buffer.from(`${grafanaUser}:${grafanaPassword}`).toString('base64');
  const response = await fetch(`${grafanaUrl}/api/search?query=Acme%20Commerce`, {
    headers: { authorization: `Basic ${credentials}` }
  });
  if (!response.ok) return false;
  const dashboards = await response.json();
  return dashboards.some((dashboard) => dashboard.uid === 'acme-performance');
});
