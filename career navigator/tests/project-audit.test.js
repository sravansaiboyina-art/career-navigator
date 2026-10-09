import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const parseJson = (relativePath) => JSON.parse(read(relativePath));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

test('source data and public runtime data stay identical and parse cleanly', () => {
  for (const name of ['careers', 'exams', 'opportunities']) {
    const source = parseJson(`data/${name}.json`);
    const publicData = parseJson(`public/data/${name}.json`);
    assert.deepEqual(publicData, source, `${name}.json must match the copy served by Vite`);
  }
});

test('dataset identifiers and career references are valid', () => {
  const careers = parseJson('data/careers.json');
  const exams = parseJson('data/exams.json');
  const opportunities = parseJson('data/opportunities.json');
  const unique = (items, label) => {
    const ids = items.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length, `${label} IDs must be unique`);
    assert.ok(ids.every(Boolean), `${label} IDs must be present`);
  };
  unique(careers, 'Career');
  unique(exams, 'Exam');
  unique(opportunities, 'Opportunity');
  const careerIds = new Set(careers.map((career) => career.id));
  for (const item of [...exams, ...opportunities]) {
    for (const careerId of item.career || []) {
      assert.ok(careerIds.has(careerId), `${item.id} points to unknown career ${careerId}`);
    }
    assert.match(item.officialLink || '', /^https?:\/\//i, `${item.id} needs an official HTTP(S) URL`);
  }
});

test('legacy exam and opportunity records are clearly labelled instead of implying current availability', () => {
  const exams = parseJson('data/exams.json');
  for (const exam of exams.filter((item) => item.status === 'legacy')) {
    assert.ok(exam.statusNote, `${exam.id} must explain its legacy status`);
    assert.match(exam.applicationWindow?.approxMonth || '', /no current|not applicable|discontinued/i);
  }
  assert.equal(exams.find((exam) => exam.id === 'gate')?.officialLink, 'https://gate2027.iitm.ac.in');
  assert.equal(exams.find((exam) => exam.id === 'ssc-cgl')?.officialLink, 'https://ssc.gov.in');

  const opportunities = parseJson('data/opportunities.json');
  const legacyNtse = opportunities.find((item) => item.id === 'ntse-scholarship');
  assert.equal(legacyNtse?.status, 'legacy');
  assert.ok(legacyNtse?.statusNote);
  assert.match(legacyNtse?.deadline?.month || '', /no current window/i);
});

test('demo progress references milestones in the canonical roadmap dataset', async () => {
  const { DEMO_USERS } = await import('../src/db/seed.js');
  const { CAREER_ROADMAPS } = await import('../src/data/roadmapData.js');
  const available = new Set(
    Object.values(CAREER_ROADMAPS).flatMap((career) =>
      Object.values(career.stages || {}).flatMap((stage) => (stage.milestones || []).map((milestone) => milestone.id))
    )
  );
  for (const user of DEMO_USERS) {
    for (const milestoneId of user.progress?.completedMilestones || []) {
      assert.ok(available.has(milestoneId), `Demo user ${user.id} references unknown roadmap milestone ${milestoneId}`);
    }
  }
});

test('all relative JavaScript imports resolve to files', () => {
  const sourceRoot = path.join(root, 'src');
  const files = walk(sourceRoot).filter((file) => file.endsWith('.js'));
  const importPattern = /\bfrom\s*['"]([^'"]+)['"]/g;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier.startsWith('.')) continue;
      const resolved = path.resolve(path.dirname(file), specifier);
      assert.ok(fs.existsSync(resolved), `Broken import in ${path.relative(root, file)}: ${specifier}`);
    }
  }
});

test('inline window handler calls have an implementation or are a known browser API', () => {
  const files = walk(path.join(root, 'src')).filter((file) => file.endsWith('.js'));
  const contents = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  const defined = new Set([...contents.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)].map((match) => match[1]));
  const called = new Set([...contents.matchAll(/window\.([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]));
  const browserApis = new Set([
    'addEventListener', 'removeEventListener', 'scrollTo', 'confirm', 'alert',
    'open', 'setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'
  ]);
  const missing = [...called].filter((name) => !defined.has(name) && !browserApis.has(name));
  assert.deepEqual(missing, [], `Missing window handlers: ${missing.join(', ')}`);
});

test('sensitive rendering paths keep AI output escaped and toast messages textual', () => {
  const assistant = read('src/pages/AIAssistant.js');
  const toast = read('src/components/Toast.js');
  const roadmap = read('src/pages/Roadmap.js');
  assert.ok(assistant.includes('return escapeHtml(text)'), 'AI model output should be escaped before HTML formatting');
  assert.ok(toast.includes('messageEl.textContent = String(message ?? \'\')'), 'Toast content should be inserted as text');
  assert.ok(roadmap.includes('escapeHtml(note)'), 'Saved milestone notes should be escaped on rerender');
});

test('auth session storage strips passwords and normalizes progress safely', async () => {
  const data = new Map();
  globalThis.localStorage = {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    clear() { data.clear(); }
  };
  const { store } = await import('../src/store.js');
  store.setUser({ id: 'test-user', name: 'Test Student', email: 'student@example.test', password: 'do-not-store' });
  const user = store.getUser();
  assert.equal(user.id, 'test-user');
  assert.equal('password' in user, false);
  store.saveProgress({ completedMilestones: ['one', 'one'], savedOpportunities: 'bad-data', trackedExams: null, notes: [] });
  const progress = store.getProgress();
  assert.deepEqual(progress.completedMilestones, ['one']);
  assert.deepEqual(progress.savedOpportunities, []);
  assert.deepEqual(progress.trackedExams, []);
  assert.deepEqual(progress.notes, {});
});

test('public landing claims are derived from loaded data and avoid fabricated trust figures', () => {
  const landing = read('src/pages/Landing.js');
  const main = read('src/main.js');
  assert.match(landing, /renderLanding\(careers = \[\], exams = \[\], opportunities = \[\]\)/);
  assert.match(main, /renderLanding\(careers, exams, opportunities\)/);
  assert.ok(!landing.includes('Trusted by 10,000+ students'));
  assert.ok(!landing.includes('30+'));
  assert.ok(!landing.includes('20+'));
});

test('Gemini client uses a current model and never puts the API key in request URLs', () => {
  const gemini = read('src/gemini.js');
  assert.ok(gemini.includes('gemini-3.8-flash'));
  assert.ok(!gemini.includes('gemini-2.0-flash'));
  assert.ok(!gemini.includes('?key='));
  assert.ok(gemini.includes("'x-goog-api-key': apiKey"));
  assert.ok(!gemini.includes('topK:'));
  assert.ok(!gemini.includes('topP:'));
  assert.ok(!gemini.includes('temperature:'));
});

test('router registers all intended application routes and guards protected routes', () => {
  const main = read('src/main.js');
  for (const route of [
    "'/'", "'/auth'", "'/login'", "'/signup'", "'/onboarding'", "'/profile'",
    "'/dashboard'", "'/explore'", "'/career'", "'/roadmap'", "'/exams'",
    "'/opportunities'", "'/opportunity'", "'/progress'", "'/assistant'", "'*'"
  ]) {
    assert.ok(main.includes(`router.register(${route}`), `Missing route registration for ${route}`);
  }
  assert.ok(main.includes("path === routePath || path.startsWith(routePath + '/')"));
});

test('internal navigation targets resolve to explicitly registered route families', () => {
  const main = read('src/main.js');
  const files = walk(path.join(root, 'src')).filter((file) => file.endsWith('.js'));
  const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  const routes = [...main.matchAll(/router[.]register[(]['"]([^'"]+)['"]/g)].map((match) => match[1]);
  const targets = [...source.matchAll(/window[.]navigateTo[(]['"]([^'"]+)['"][)]/g)].map((match) => match[1]);
  const missing = [];

  for (const target of targets) {
    if (!target || target.includes('
    const rawPath = target.split('?')[0];
    let pathOnly = rawPath;
    const interpolationIndex = pathOnly.indexOf('$' + '{');
    if (interpolationIndex >= 0) {
      pathOnly = pathOnly.slice(0, interpolationIndex);
      if (pathOnly.endsWith('/')) pathOnly = pathOnly.slice(0, -1);
    }
    const matched = routes.some((route) =>
      route === pathOnly ||
      (route !== '/' && route !== '*' && pathOnly.startsWith(route + '/')) ||
      (route === '*' && pathOnly.length > 0)
    );
    if (!matched) missing.push(target);
  }

  assert.deepEqual([...new Set(missing)], [], 'Unregistered navigation targets: ' + missing.join(', '));
});

test('page modules do not import shared toast utilities back through the app entry point', () => {
  const files = walk(path.join(root, 'src')).filter((file) => file.endsWith('.js'));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(content.includes("from '../main.js'"), false, 'Circular main.js import in ' + path.relative(root, file));
  }
});

test('exam education-stage labels do not overstate eligibility', () => {
  const examsPage = read('src/pages/Exams.js');
  const dashboard = read('src/pages/Dashboard.js');
  assert.ok(examsPage.includes('Graduation degree completed'));
  assert.ok(examsPage.includes('Stage matching is not full eligibility'));
  assert.ok(dashboard.includes('Matched by career and education stage only'));
});

test('saved opportunities are not lost when the current career or stage filters change', () => {
  const opportunitiesPage = read('src/pages/Opportunities.js');
  assert.ok(opportunitiesPage.includes('const allOpportunities = Array.isArray(window.__opportunities)'));
  assert.ok(opportunitiesPage.includes("activeType === 'saved' ? allOpportunities.filter"));
});

test('startup data loading checks HTTP status and gives the user a retry path', () => {
  const main = read('src/main.js');
  assert.ok(main.includes('if (!response.ok)'));
  assert.ok(main.includes('renderStartupError()'));
  assert.ok(main.includes('startup-retry'));
});

test('demo database limitations and production security boundaries are documented', () => {
  const readme = read('NEXT_STEPS_README.md');
  assert.match(readme, /browser|IndexedDB|localStorage/i);
  assert.match(readme, /production|server-side|backend/i);
  assert.match(readme, /password|API key|credential/i);
});
 + '{')) continue;
    const rawPath = target.split('?')[0];
    let pathOnly = rawPath;
    const interpolationIndex = pathOnly.indexOf('$' + '{');
    if (interpolationIndex >= 0) {
      pathOnly = pathOnly.slice(0, interpolationIndex);
      if (pathOnly.endsWith('/')) pathOnly = pathOnly.slice(0, -1);
    }
    const matched = routes.some((route) =>
      route === pathOnly ||
      (route !== '/' && route !== '*' && pathOnly.startsWith(route + '/')) ||
      (route === '*' && pathOnly.length > 0)
    );
    if (!matched) missing.push(target);
  }

  assert.deepEqual([...new Set(missing)], [], 'Unregistered navigation targets: ' + missing.join(', '));
});

test('page modules do not import shared toast utilities back through the app entry point', () => {
  const files = walk(path.join(root, 'src')).filter((file) => file.endsWith('.js'));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(content.includes("from '../main.js'"), false, 'Circular main.js import in ' + path.relative(root, file));
  }
});

test('exam education-stage labels do not overstate eligibility', () => {
  const examsPage = read('src/pages/Exams.js');
  const dashboard = read('src/pages/Dashboard.js');
  assert.ok(examsPage.includes('Graduation degree completed'));
  assert.ok(examsPage.includes('Stage matching is not full eligibility'));
  assert.ok(dashboard.includes('Matched by career and education stage only'));
});

test('saved opportunities are not lost when the current career or stage filters change', () => {
  const opportunitiesPage = read('src/pages/Opportunities.js');
  assert.ok(opportunitiesPage.includes('const allOpportunities = Array.isArray(window.__opportunities)'));
  assert.ok(opportunitiesPage.includes("activeType === 'saved' ? allOpportunities.filter"));
});

test('startup data loading checks HTTP status and gives the user a retry path', () => {
  const main = read('src/main.js');
  assert.ok(main.includes('if (!response.ok)'));
  assert.ok(main.includes('renderStartupError()'));
  assert.ok(main.includes('startup-retry'));
});

test('demo database limitations and production security boundaries are documented', () => {
  const readme = read('NEXT_STEPS_README.md');
  assert.match(readme, /browser|IndexedDB|localStorage/i);
  assert.match(readme, /production|server-side|backend/i);
  assert.match(readme, /password|API key|credential/i);
});
