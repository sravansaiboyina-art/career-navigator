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
  await page.getByRole('button', { name: /Tracked/ }).click();
  assert.equal(await page.locator('.exam-card').count(), 1, 'Tracked tab should show the saved exam');

  // Tracking persists after a browser reload.
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Tracked/ }).click();
  assert.equal(await page.locator('.exam-card').count(), 1, 'Tracked exam should persist after reload');

  // Sidebar navigation opens the career explorer; unknown career IDs show a not-found view.
  await page.locator('.sidebar-nav-item').filter({ hasText: 'Explore Careers' }).click();
  await page.waitForFunction(() => window.location.hash === '#/explore');
  await page.getByRole('heading', { name: /Explore Career Pathways/ }).waitFor({ state: 'visible' });

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
  assert.deepEqual(pageErrors, [], `Unexpected browser exceptions: ${pageErrors.join('; ')}`);
  console.log('Browser smoke tests passed: login, dashboard, exam details/tracking persistence, career navigation, not-found route, and protected-route redirect.');
} finally {
  await context.close();
  await browser.close();
}
