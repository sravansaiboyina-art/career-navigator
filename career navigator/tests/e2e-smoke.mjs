import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.CAREER_NAVIGATOR_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext();
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  // Sign in using a demo persona, then navigate through the real rendered UI.
  await page.goto(`${baseUrl}/#/auth`, { waitUntil: 'networkidle' });
  await page.locator('button.demo-quick-btn').first().click();
  await page.waitForFunction(() => window.location.hash === '#/dashboard');
  await page.locator('.dashboard-hero').waitFor({ state: 'visible' });

  await page.locator('.quick-action').filter({ hasText: 'Exam Tracker' }).click();
  await page.waitForFunction(() => window.location.hash === '#/exams');
  await page.locator('#exams-content').waitFor({ state: 'visible' });

  // Open an exam detail modal and track an exam.
  await page.getByRole('button', { name: /All Exams/ }).click();
  await page.getByRole('button', { name: 'Details' }).first().click();
  await page.locator('#active-modal-overlay').waitFor({ state: 'visible' });
  const detailsText = await page.locator('#active-modal-overlay .modal-body').innerText();
  assert.match(detailsText, /Eligibility/i);
  assert.match(detailsText, /official/i);

  await page.locator('#exam-modal-track').click();
  await page.locator('.tab-btn').filter({ hasText: 'Tracked' }).click();
  assert.equal(await page.locator('.exam-card').count(), 1, 'Tracked tab should show the saved exam');

  // Tracking persists after a browser reload.
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.tab-btn').filter({ hasText: 'Tracked' }).click();
  assert.equal(await page.locator('.exam-card').count(), 1, 'Tracked exam should persist after reload');

  // Sidebar navigation opens the career explorer; unknown career IDs show a not-found view.
  await page.locator('.sidebar-link').filter({ hasText: 'Explore Careers' }).click();
  await page.waitForFunction(() => window.location.hash === '#/explore');
  await page.getByRole('heading', { name: /Explore Career Pathways/ }).waitFor({ state: 'visible' });

  // Roadmap milestones update the same persistent state used by Progress.
  await page.locator('.sidebar-link').filter({ hasText: 'Roadmap' }).click();
  await page.waitForFunction(() => window.location.hash === '#/roadmap');
  await page.locator('.stage-tab').filter({ hasText: 'Milestones' }).click();
  const milestoneCard = page.locator('[id^="milestone-v2-"]').first();
  await milestoneCard.waitFor({ state: 'visible' });
  const milestoneId = (await milestoneCard.getAttribute('id')).replace(/^milestone-v2-/, '');
  const beforeMilestone = await page.evaluate((id) => {
    const progress = JSON.parse(localStorage.getItem('cn_progress') || '{}');
    return (progress.completedMilestones || []).includes(id);
  }, milestoneId);
  await milestoneCard.locator('.milestone-check-area').click();
  const afterMilestone = await page.evaluate((id) => {
    const progress = JSON.parse(localStorage.getItem('cn_progress') || '{}');
    return (progress.completedMilestones || []).includes(id);
  }, milestoneId);
  assert.equal(afterMilestone, !beforeMilestone, 'Roadmap milestone click should persist the completion toggle');

  await page.locator('.sidebar-link').filter({ hasText: 'Progress & Stats' }).click();
  await page.waitForFunction(() => window.location.hash === '#/progress');
  await page.getByRole('heading', { name: /My Progress/ }).waitFor({ state: 'visible' });
  await page.locator('#progress-chart').waitFor({ state: 'attached' });

  // Opportunity save state works on both the list and detail page.
  await page.locator('.sidebar-link').filter({ hasText: 'Opportunities' }).click();
  await page.waitForFunction(() => window.location.hash === '#/opportunities');
  const opportunityCard = page.locator('.opp-card').first();
  const listSaveButton = opportunityCard.locator('.save-btn');
  const savedBefore = await listSaveButton.getAttribute('aria-pressed');
  await listSaveButton.click();
  assert.notEqual(await listSaveButton.getAttribute('aria-pressed'), savedBefore,
    'Save button should toggle the saved state');

  await opportunityCard.getByRole('button', { name: 'Details' }).click();
  await page.waitForFunction(() => window.location.hash.startsWith('#/opportunity/'));
  const detailSaveButton = page.locator('#opportunity-detail-save');
  const detailSavedBefore = await detailSaveButton.innerText();
  await detailSaveButton.click();
  assert.notEqual(await detailSaveButton.innerText(), detailSavedBefore,
    'Opportunity detail save button should toggle saved state');
  await page.getByRole('button', { name: /Back to Opportunities/ }).click();
  await page.waitForFunction(() => window.location.hash === '#/opportunities');
  await page.locator('.tab-btn').filter({ hasText: 'Saved' }).click();
  assert.ok(await page.locator('.opp-card').count() > 0, 'Saved opportunities should be visible in the Saved tab');

  // The assistant remains usable in offline demo mode without a user-supplied key.
  await page.locator('.sidebar-link').filter({ hasText: 'AI Assistant' }).click();
  await page.waitForFunction(() => window.location.hash === '#/assistant');
  await page.locator('#chat-input').fill('How should I plan my studies?');
  await page.locator('#send-btn').click();
  await page.waitForFunction(() => document.querySelector('#chat-messages')?.innerText.includes('Action Strategy'),
    { timeout: 15000 });

  // Profile editing saves to the active student record.
  await page.locator('.sidebar-link').filter({ hasText: 'Student Profile' }).click();
  await page.waitForFunction(() => window.location.hash === '#/profile');
  await page.getByRole('button', { name: /Edit Profile/ }).click();
  await page.locator('#edit-name').fill('Priya E2E');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('heading', { name: 'Priya E2E' }).waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('cn_profile') || '{}').name), 'Priya E2E');

  await page.goto(`${baseUrl}/#/career/not-a-real-career`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Career not found' }).waitFor({ state: 'visible' });

  // Protected routes redirect to authentication when the profile/session is removed.
  await page.evaluate(() => {
    localStorage.removeItem('cn_profile');
    localStorage.removeItem('cn_user');
    localStorage.removeItem('cn_progress');
  });
  await page.goto(`${baseUrl}/#/exams`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.location.hash === '#/auth');

  // Exercise a fresh student's full onboarding flow in an isolated browser context.
  const onboardingContext = await browser.newContext();
  const onboardingPage = await onboardingContext.newPage();
  const onboardingErrors = [];
  onboardingPage.on('pageerror', (error) => onboardingErrors.push(error.message));
  try {
    // Register a new account using the browser UI, then complete onboarding.
    await onboardingPage.goto(`${baseUrl}/#/auth?mode=signup`, { waitUntil: 'networkidle' });
    await onboardingPage.locator('#signup-name').fill('E2E Student');
    await onboardingPage.locator('#signup-email').fill(`e2e-${Date.now()}@example.test`);
    await onboardingPage.locator('#signup-class').selectOption('8');
    await onboardingPage.locator('#signup-password').fill('Strong-Demo-Password-2026');
    await onboardingPage.getByRole('button', { name: /Create Student Account/ }).click();
    await onboardingPage.waitForFunction(() => window.location.hash === '#/onboarding');
    await onboardingPage.locator('#ob-name').waitFor({ state: 'visible' });
    await onboardingPage.locator('#ob-name').fill('E2E Student');
    await onboardingPage.locator('#ob-class').selectOption('8');
    await onboardingPage.locator('#ob-next-1').click();

    await onboardingPage.locator('#interest-math').waitFor({ state: 'visible' });
    await onboardingPage.locator('#interest-math').click();
    await onboardingPage.locator('#interest-coding').click();
    await onboardingPage.locator('#interest-technology').click();
    await onboardingPage.getByRole('button', { name: /Find My Careers/ }).click();

    await onboardingPage.locator('#career-select-list').waitFor({ state: 'visible' });
    assert.equal(await onboardingPage.locator('#career-select-list .career-card').count(), 7,
      'All supported careers should be available to a Class 8 student for long-term planning');
    await onboardingPage.locator('#career-select-list .career-card')
      .filter({ hasText: 'UPSC Civil Services' }).click();
    await onboardingPage.locator('#finish-btn').click();
    await onboardingPage.waitForFunction(() => window.location.hash === '#/dashboard');
    await onboardingPage.locator('.dashboard-hero').waitFor({ state: 'visible' });

    const newProfile = await onboardingPage.evaluate(() => JSON.parse(localStorage.getItem('cn_profile') || '{}'));
    assert.equal(newProfile.name, 'E2E Student');
    assert.equal(newProfile.class, '8');
    assert.equal(newProfile.selectedCareer, 'upsc',
      'Younger students must be able to choose a later-stage career goal');

    // Verify that onboarding changes reach SQLite through the authenticated API,
    // then confirm a fresh page load restores the same student from the backend.
    await onboardingPage.waitForFunction(async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) return false;
      const account = await response.json();
      return account.profile?.selectedCareer === 'upsc' && account.profile?.name === 'E2E Student';
    }, null, { timeout: 15000 });
    await onboardingPage.reload({ waitUntil: 'networkidle' });
    await onboardingPage.locator('.dashboard-hero').waitFor({ state: 'visible' });
    const restoredProfile = await onboardingPage.evaluate(() => JSON.parse(localStorage.getItem('cn_profile') || '{}'));
    assert.equal(restoredProfile.selectedCareer, 'upsc', 'A reload must restore the profile from the server session');
    assert.deepEqual(onboardingErrors, [], `Unexpected onboarding browser exceptions: ${onboardingErrors.join('; ')}`);
  } finally {
    await onboardingContext.close();
  }

  assert.deepEqual(pageErrors, [], `Unexpected browser exceptions: ${pageErrors.join('; ')}`);
  console.log('Full-stack browser tests passed: demo login, server-backed account registration/onboarding, future-stage career selection, SQLite profile persistence across reloads, dashboard, roadmap/progress, exam tracking persistence, opportunity saving/details, profile editing, offline AI, not-found route, and protected-route redirect.');
} finally {
  await context.close();
  await browser.close();
}
