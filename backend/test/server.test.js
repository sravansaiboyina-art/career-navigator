import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createDatabase } from '../database.js';
import { createApp } from '../server.js';

async function makeTestServer(t, options = {}) {
  const database = createDatabase(':memory:');
  const app = createApp({ database, nodeEnv: 'test', geminiApiKey: '', frontendOrigins: [], ...options });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    database.close();
  });
  return { database, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function register(baseUrl, values = {}) {
  return fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student',
      email: 'student@example.test',
      password: 'Strong-Password-123',
      class: '10',
      stream: 'science',
      ...values
    })
  });
}

function cookieFrom(response) {
  const raw = response.headers.get('set-cookie') || '';
  return raw.split(';')[0];
}

test('health endpoint reports API/database status without secrets', async (t) => {
  const { baseUrl } = await makeTestServer(t);
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    service: 'career-navigator-api',
    database: 'sqlite',
    aiConfigured: false
  });
});

test('registration creates a hashed account, profile, progress, and HttpOnly session', async (t) => {
  const { baseUrl, database } = await makeTestServer(t);
  const response = await register(baseUrl);
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.user.email, 'student@example.test');
  assert.equal(data.profile.class, '10');
  assert.equal(data.profile.userId, data.user.id);
  assert.equal(data.progress.profileId, data.profile.id);
  assert.deepEqual(data.progress.trackedExams, []);
  assert.equal('passwordHash' in data.user, false);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(response.headers.get('set-cookie'), /SameSite=Lax/);
  const stored = database.findUserByEmail('STUDENT@example.test');
  assert.ok(stored.password_hash);
  assert.notEqual(stored.password_hash, 'Strong-Password-123');

  const session = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookieFrom(response) } });
  assert.equal(session.status, 200);
  const sessionData = await session.json();
  assert.equal(sessionData.user.id, data.user.id);
});

test('registration validates class, password, and duplicate emails', async (t) => {
  const { baseUrl } = await makeTestServer(t);
  assert.equal((await register(baseUrl, { class: 'class-99' })).status, 400);
  assert.equal((await register(baseUrl, { email: 'not-an-email' })).status, 400);
  assert.equal((await register(baseUrl, { password: 'tiny' })).status, 400);
  assert.equal((await register(baseUrl)).status, 201);
  const duplicate = await register(baseUrl, { email: 'STUDENT@example.test' });
  assert.equal(duplicate.status, 409);
});

test('login rejects bad credentials and returns the correct student account', async (t) => {
  const { baseUrl } = await makeTestServer(t);
  await register(baseUrl);
  const bad = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@example.test', password: 'Wrong-Password-1' })
  });
  assert.equal(bad.status, 401);
  const good = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'STUDENT@example.test', password: 'Strong-Password-123' })
  });
  assert.equal(good.status, 200);
  assert.equal((await good.json()).user.email, 'student@example.test');
  assert.match(good.headers.get('set-cookie'), /HttpOnly/);
});

test('profile and progress persist per authenticated account and are not public', async (t) => {
  const { baseUrl } = await makeTestServer(t);
  const created = await register(baseUrl);
  const cookie = cookieFrom(created);

  const unauthorized = await fetch(`${baseUrl}/api/progress`);
  assert.equal(unauthorized.status, 401);

  const profileResponse = await fetch(`${baseUrl}/api/profile`, { headers: { Cookie: cookie } });
  const { profile } = await profileResponse.json();
  const updatedProfile = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...profile, selectedCareer: 'engineering', name: 'Updated Student' })
  });
  assert.equal(updatedProfile.status, 200);
  assert.equal((await updatedProfile.json()).profile.selectedCareer, 'engineering');

  const progress = {
    completedMilestones: ['milestone-1','milestone-1'],
    savedOpportunities: ['scholarship-1'],
    trackedExams: ['exam-1'],
    notes: { 'milestone-1': 'Review algebra' }
  };
  const updatedProgress = await fetch(`${baseUrl}/api/progress`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(progress)
  });
  assert.equal(updatedProgress.status, 200);
  const saved = (await updatedProgress.json()).progress;
  assert.deepEqual(saved.completedMilestones, ['milestone-1']);
  assert.deepEqual(saved.trackedExams, ['exam-1']);

  const reloaded = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  const account = await reloaded.json();
  assert.equal(account.profile.name, 'Updated Student');
  assert.equal(account.profile.selectedCareer, 'engineering');
  assert.deepEqual(account.progress.savedOpportunities, ['scholarship-1']);
  assert.deepEqual(account.progress.completedMilestones, ['milestone-1']);
  assert.equal(account.progress.notes['milestone-1'], 'Review algebra');
});

test('logout revokes the session and AI works without a browser-side API key', async (t) => {
  const { baseUrl } = await makeTestServer(t);
  const created = await register(baseUrl);
  const cookie = cookieFrom(created);

  const ai = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'How can I plan my studies?' }] })
  });
  assert.equal(ai.status, 200);
  assert.deepEqual(await ai.json(), { configured: false, text: '' });

  const logout = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie } });
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  const session = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal(session.status, 401);
});
