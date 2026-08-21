const targets = process.argv.slice(2);
if (targets.length === 0) {
  targets.push(
    'http://localhost:3000/health',
    'http://localhost:8080/__admin/health',
    'http://localhost:9090/-/ready',
    'http://localhost:3001/api/health'
  );
}

const deadline = Date.now() + Number(process.env.HEALTH_TIMEOUT_MS ?? 120_000);
const pending = new Set(targets);
while (pending.size > 0 && Date.now() < deadline) {
  for (const target of pending) {
    try {
      const response = await fetch(target, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) {
        console.log(`Ready: ${target}`);
        pending.delete(target);
      }
    } catch {
      // Service is still starting; polling is deliberate and bounded.
    }
  }
  if (pending.size > 0) await new Promise((resolve) => setTimeout(resolve, 1_000));
}
if (pending.size > 0) {
  console.error(`Health timeout. Not ready: ${[...pending].join(', ')}`);
  process.exit(1);
}
