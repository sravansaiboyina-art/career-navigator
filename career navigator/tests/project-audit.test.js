import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const jsFiles = () => walk(path.join(root, 'src')).filter((file) => file.endsWith('.js'));
const allSource = () => jsFiles().map((file) => fs.readFileSync(file, 'utf8')).join('\n');

test('source datasets and Vite public datasets are identical valid JSON', () => {
  for (const name of ['careers', 'exams', 'opportunities']) {
    assert.deepEqual(json(`public/data/${name}.json`), json(`data/${name}.json`), `${name}.json copies must match`);
  }
});

test('career, exam, and opportunity identifiers and relationships are valid', () => {
  const careers = json('data/careers.json');
  const exams = json('data/exams.json');
  const opportunities = json('data/opportunities.json');
  const careerIds = new Set(careers.map((item) => item.id));
  for (const [items, label] of [[careers, 'career'], [exams, 'exam'], [opportunities, 'opportunity']]) {
    const ids = items.map((item) => item.id);
    assert.ok(ids.every(Boolean), `${label} ids are required`);
    assert.equal(new Set(ids).size, ids.length, `${label} ids must be unique`);
    for (const item of items) {
      for (const careerId of item.career || []) {
        assert.ok(careerIds.has(careerId), `${item.id} references unknown career ${careerId}`);
      }
    }
  }
});

test('all externally linked exam and opportunity URLs use HTTP(S)', () => {
  const records = [...json('data/exams.json'), ...json('data/opportunities.json')];
  for (const record of records) {
    for (const field of ['officialLink', 'applicationLink', 'sourceUrl']) {
      if (!record[field]) continue;
      assert.match(record[field], /^https?:\/\//i, `${record.id}.${field} must be HTTP(S)`);
    }
    for (const link of [...(record.alternativeLinks || []), ...(record.links || [])]) {
      if (link.url) assert.match(link.url, /^https?:\/\//i, `${record.id} contains a non-HTTP(S) link`);
    }
  }
});

test('legacy exams and opportunities are not presented as currently open', () => {
  const exams = json('data/exams.json');
  for (const item of exams.filter((entry) => entry.status === 'legacy')) {
    assert.ok(item.statusNote, `${item.id} needs an explanation for legacy status`);
    assert.match(item.applicationWindow?.approxMonth || '', /no current|not applicable|discontinued/i);
  }
  const opportunities = json('data/opportunities.json');
  for (const item of opportunities.filter((entry) => entry.status === 'legacy')) {
    assert.ok(item.statusNote, `${item.id} needs an explanation for legacy status`);
  }
});

test('all relative JavaScript imports resolve to files', () => {
  for (const file of jsFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue;
      const resolved = path.resolve(path.dirname(file), match[1]);
      assert.ok(fs.existsSync(resolved), `Broken import in ${path.relative(root, file)}: ${match[1]}`);
    }
  }
});

test('inline window handlers referenced by pages are defined in app source', () => {
  const source = allSource();
  const defined = new Set([...source.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)].map((match) => match[1]));
  const browserApis = new Set([
    'addEventListener', 'removeEventListener', 'scrollTo', 'confirm', 'alert',
    'open', 'setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'
  ]);
  const missing = [...new Set([...source.matchAll(/window\.([A-Za-z_$][\w$]*)\s*\(/g)]
    .map((match) => match[1])
    .filter((name) => !defined.has(name) && !browserApis.has(name)))];
  assert.deepEqual(missing, [], `Missing window handler/function definitions: ${missing.join(', ')}`);
});

test('all internal literal navigation targets are handled by the route table', () => {
  const main = read('src/main.js');
  const source = allSource();
  const routes = [...main.matchAll(/router\.register\(\s*(['"])(.*?)\1/g)].map((match) => match[2]);
  const targets = [...source.matchAll(/window\.navigateTo\(\s*(['"])([^'"]+)\1\s*\)/g)]
    .map((match) => match[2])
    .filter((target) => !target.includes('$' + '{'));
  const missing = targets.filter((target) => {
    const targetPath = target.split('?')[0];
    return !routes.some((route) =>
      route === targetPath ||
      (route !== '/' && route !== '*' && targetPath.startsWith(route + '/'))
    );
  });
  assert.deepEqual([...new Set(missing)], [], `Unregistered internal navigation targets: ${missing.join(', ')}`);
  for (const route of ['/auth', '/login', '/signup', '/onboarding', '/dashboard', '/profile', '/explore', '/career', '/roadmap', '/exams', '/opportunities', '/opportunity', '/progress', '/assistant']) {
    assert.ok(routes.includes(route), `Missing route ${route}`);
  }
});

test('protected routes redirect when no student profile is present', () => {
  const main = read('src/main.js');
  assert.ok(main.includes('const protectedRoutes = ['));
  assert.ok(main.includes('!store.hasProfile()'));
  assert.ok(main.includes("router.navigate('/auth', true)"));
});

test('Exam Tracker provides details, persistent tracking, filters, and clear eligibility wording', () => {
  const exams = read('src/pages/Exams.js');
  const store = read('src/store.js');
  const modal = read('src/components/Modal.js');
  assert.match(exams, /import \{ Modal \} from ['"]\.\.\/components\/Modal\.js['"]/);
  assert.ok(exams.includes('window.showExamDetails'));
  assert.ok(exams.includes("activeTab === 'tracked'"));
  assert.ok(exams.includes('window.toggleTrackedExam'));
  assert.ok(exams.includes('Stage matching is not full eligibility'));
  assert.ok(exams.includes('Graduation degree completed'));
  assert.ok(store.includes('toggleTrackedExam(examId)'));
  assert.ok(store.includes('trackedExams'));
  assert.ok(modal.includes('export class Modal'));
});

test('roadmap, progress, and dashboard share the canonical milestone state', () => {
  const roadmap = read('src/pages/Roadmap.js');
  const progress = read('src/pages/Progress.js');
  const dashboard = read('src/pages/Dashboard.js');
  const store = read('src/store.js');
  assert.ok(roadmap.includes('store.toggleMilestone'));
  assert.ok(roadmap.includes('store.isMilestoneComplete'));
  assert.ok(progress.includes('store.getProgress()'));
  assert.ok(dashboard.includes('toggleMilestoneFromDash'));
  assert.ok(store.includes('toggleMilestone(milestoneId)'));
});

test('AI responses escape model content, and API keys are not put in request URLs', () => {
  const assistant = read('src/pages/AIAssistant.js');
  const gemini = read('src/gemini.js');
  assert.ok(assistant.includes('return escapeHtml(text)'));
  assert.ok(gemini.includes("'x-goog-api-key': apiKey"));
  assert.ok(!gemini.includes('?key='));
  assert.ok(!gemini.includes('gemini-2.0-flash'));
});

test('browser database schema declares expected collections and indexes', () => {
  const schema = read('src/db/schema.js');
  const db = read('src/db/index.js');
  for (const collection of ['USERS', 'PROFILES', 'PROGRESS', 'CAREERS', 'EXAMS', 'OPPORTUNITIES', 'SETTINGS']) {
    assert.ok(schema.includes(`${collection}:`), `Missing database collection ${collection}`);
  }
  assert.ok(schema.includes("name: 'email'"));
  assert.ok(schema.includes("name: 'userId'"));
  assert.ok(schema.includes("name: 'profileId'"));
  assert.ok(db.includes('indexedDB.open'));
  assert.ok(db.includes('_initLocalStorage'));
  assert.ok(db.includes('authenticate(email, password)'));
  assert.ok(db.includes('register(userData'));
});

test('client session and progress normalization drop passwords and malformed fields', async () => {
  const data = new Map();
  globalThis.localStorage = {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    clear() { data.clear(); }
  };
  globalThis.sessionStorage = { removeItem() {}, getItem() { return null; }, setItem() {} };
  const { store } = await import('../src/store.js');
  store.setUser({ id: 'audit-user', name: 'Audit Student', email: 'audit@example.test', password: 'not-for-storage' });
  assert.equal('password' in store.getUser(), false);
  store.saveProgress({ completedMilestones: ['m1', 'm1'], savedOpportunities: 'bad', trackedExams: null, notes: [] });
  const normalized = store.getProgress();
  assert.deepEqual(normalized.completedMilestones, ['m1']);
  assert.deepEqual(normalized.savedOpportunities, []);
  assert.deepEqual(normalized.trackedExams, []);
  assert.deepEqual(normalized.notes, {});
});

test('the prototype clearly documents local-only persistence and production limitations', () => {
  const readme = read('NEXT_STEPS_README.md');
  const auth = read('src/pages/Auth.js');
  assert.match(readme, /browser|IndexedDB|localStorage/i);
  assert.match(readme, /production|server-side|backend/i);
  assert.match(auth, /Password recovery and production account security are not available yet/);
});

test('startup handles required data fetch failures with a retry screen', () => {
  const main = read('src/main.js');
  assert.ok(main.includes('if (!response.ok)'));
  assert.ok(main.includes('renderStartupError()'));
  assert.ok(main.includes('startup-retry'));
});

test('demo database stores password hashes rather than plaintext and validates registrations', () => {
  const database = read('src/db/index.js');
  assert.ok(database.includes('PBKDF2-SHA-256'));
  assert.ok(database.includes('passwordHash'));
  assert.ok(database.includes('passwordSalt'));
  assert.ok(database.includes('deriveBits'));
  assert.ok(database.includes('delete migrated.password'));
  assert.ok(!database.includes('password: userData.password'));
  assert.ok(database.includes('Password must be between 8 and 128 characters.'));
  assert.ok(database.includes('An account with this email already exists.'));
});

test('new accounts initialize independent progress records and login returns no password material', () => {
  const database = read('src/db/index.js');
  assert.ok(database.includes('return { user: publicUser(user), profile, progress }'));
  assert.ok(database.includes('profileId: profile.id'));
  assert.ok(database.includes('trackedExams: []'));
  assert.ok(database.includes('this.delete(COLLECTIONS.USERS, userId)'));
  assert.ok(database.includes('this.delete(COLLECTIONS.PROFILES, profile.id)'));
  assert.ok(database.includes('this.delete(COLLECTIONS.PROGRESS, progress.id)'));
  assert.ok(database.includes('Object.assign(user, migrated)'));
});

test('profile export and session APIs avoid retaining the submitted password', () => {
  const store = read('src/store.js');
  const auth = read('src/pages/Auth.js');
  assert.ok(store.includes('function safeSessionUser(user)'));
  assert.ok(store.includes('const { id, name, email, role, createdAt } = user'));
  assert.ok(auth.includes('autocomplete="new-password"'));
  assert.ok(auth.includes('minlength="8"'));
});

test('database registration stores a salted PBKDF2 hash and login upgrades/returns safe account data', async () => {
  const data = new Map();
  globalThis.localStorage = {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    clear() { data.clear(); }
  };
  globalThis.window = {};
  const { db, COLLECTIONS } = await import('../src/db/index.js');
  await db.connect();
  const created = await db.register(
    { name: 'Integration Student', email: ' INTEGRATION@example.test ', password: 'strong-demo-password' },
    { class: '12', stream: 'science', selectedCareer: 'engineering' }
  );

  assert.equal(created.user.email, 'integration@example.test');
  assert.equal('password' in created.user, false);
  assert.equal('passwordHash' in created.user, false);
  assert.equal(created.profile.userId, created.user.id);
  assert.equal(created.progress.profileId, created.profile.id);
  assert.deepEqual(created.progress.trackedExams, []);

  const storedUser = await db.get(COLLECTIONS.USERS, created.user.id);
  assert.equal('password' in storedUser, false);
  assert.match(storedUser.passwordHash, /^[0-9a-f]{64}$/);
  assert.match(storedUser.passwordSalt, /^[0-9a-f]{32}$/);
  assert.notEqual(storedUser.passwordHash, 'strong-demo-password');

  const authenticated = await db.authenticate('INTEGRATION@example.test', 'strong-demo-password');
  assert.equal(authenticated.user.id, created.user.id);
  assert.equal(authenticated.profile.id, created.profile.id);
  assert.equal(authenticated.progress.profileId, created.profile.id);
  assert.equal(await db.authenticate('integration@example.test', 'incorrect-password'), null);

  await assert.rejects(
    db.register({ name: 'X', email: 'not-an-email', password: 'strong-demo-password' }),
    /name between 2 and 100/
  );
  await assert.rejects(
    db.register({ name: 'Duplicate', email: 'integration@example.test', password: 'strong-demo-password' }),
    /already exists/
  );
});

test('unknown and malformed career/opportunity detail routes render safe not-found states', () => {
  const main = read('src/main.js');
  assert.ok(main.includes("careerId = decodeURIComponent(path.slice('/career/'.length))"));
  assert.ok(main.includes("opportunityId = decodeURIComponent(path.slice('/opportunity/'.length))"));
  assert.ok(main.includes('renderCareerDetail(null, exams)'));
  assert.ok(main.includes('renderOpportunityDetail(null)'));
  assert.ok(main.includes("catch {\n        careerId = '';"));
  assert.ok(main.includes("catch {\n        opportunityId = '';"));
});
