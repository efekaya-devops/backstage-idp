const { test, before, after } = require('node:test');
const assert = require('node:assert');
const server = require('../server');

let base;
before(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('/healthz returns 200', async () => {
  const res = await fetch(`${base}/healthz`);
  assert.strictEqual(res.status, 200);
});

test('/metrics exposes app_requests_total', async () => {
  const res = await fetch(`${base}/metrics`);
  assert.strictEqual(res.status, 200);
  assert.match(await res.text(), /app_requests_total/);
});
