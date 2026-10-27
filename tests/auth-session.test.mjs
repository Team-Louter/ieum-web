import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => server.close());
const memory = new Map();
const events = new EventTarget();
globalThis.window = {
  localStorage: {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  },
  atob: (value) => Buffer.from(value, 'base64').toString('binary'),
  dispatchEvent: (event) => events.dispatchEvent(event),
};
const client = await server.ssrLoadModule('/src/api/client.js');
function token(seconds) {
  const payload = Buffer.from(JSON.stringify({ sub: 'session-test', id: 1, exp: Math.floor(Date.now() / 1000) + seconds })).toString('base64url');
  return `test.${payload}.test`;
}
function response(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status });
}

test('logged-out session never requests a token or invents a profile', async () => {
  memory.clear();
  globalThis.fetch = () => { throw new Error('Unexpected request'); };
  assert.equal(await client.getValidAccessToken(), null);
});

test('saved login survives a fresh module instance and restores without a network request', async () => {
  const valid = token(300);
  client.saveTokens({ accessToken: valid, refreshToken: 'refresh-test' });
  globalThis.fetch = () => { throw new Error('Unexpected request'); };
  const reloaded = await server.ssrLoadModule('/src/api/client.js?session-reload');
  assert.equal(reloaded.getAccessToken(), valid);
  assert.equal(await reloaded.getValidAccessToken(), valid);
  assert.equal(reloaded.getCurrentUser().loginId, 'session-test');
});

test('expired token is refreshed and new token is persisted', async () => {
  client.saveTokens({ accessToken: token(-60), refreshToken: 'refresh-test' });
  const valid = token(300);
  globalThis.fetch = async () => response({ accessToken: valid });
  assert.equal(await client.getValidAccessToken(), valid);
  assert.equal(client.getAccessToken(), valid);
  assert.equal(memory.get('ieum.refreshToken'), 'refresh-test');
});

test('refresh-only session can restore login', async () => {
  memory.delete('ieum.accessToken');
  const valid = token(500);
  globalThis.fetch = async () => response({ accessToken: valid });
  assert.equal(await client.getValidAccessToken(), valid);
});

test('rejected refresh clears both tokens and notifies the route guard', async () => {
  client.saveTokens({ accessToken: token(-60), refreshToken: 'rejected' });
  let notified = false;
  events.addEventListener(client.AUTH_SESSION_EVENT, () => { notified = true; }, { once: true });
  globalThis.fetch = async () => response({ message: 'expired' }, 401);
  assert.equal(await client.getValidAccessToken(), null);
  assert.equal(client.getAccessToken(), null);
  assert.equal(memory.get('ieum.refreshToken'), undefined);
  assert.equal(notified, true);
});

test('server failure does not erase a recoverable login', async () => {
  client.saveTokens({ accessToken: token(-60), refreshToken: 'retry-me' });
  globalThis.fetch = async () => response({}, 503);
  await assert.rejects(() => client.getValidAccessToken());
  assert.equal(memory.get('ieum.refreshToken'), 'retry-me');
});

test('a late refresh response cannot log the user back in after logout', async () => {
  client.saveTokens({ accessToken: token(-60), refreshToken: 'in-flight' });
  let finish;
  globalThis.fetch = () => new Promise((resolve) => { finish = resolve; });
  const pending = client.getValidAccessToken();
  client.clearTokens();
  finish(response({ accessToken: token(300), refreshToken: 'must-not-save' }));
  assert.equal(await pending, null);
  assert.equal(client.getAccessToken(), null);
  assert.equal(memory.get('ieum.refreshToken'), undefined);
});

test('malformed access-only tokens are removed instead of rendering a blank protected page', async () => {
  memory.clear();
  memory.set('ieum.accessToken', 'malformed');
  assert.equal(await client.getValidAccessToken(), null);
  assert.equal(client.getAccessToken(), null);
});
