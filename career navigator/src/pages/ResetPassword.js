import { api } from '../api/client.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';
import { escapeHtml } from '../utils/safeHtml.js';

export function renderResetPassword(token = '') {
  const validTokenShape = /^[A-Za-z0-9_-]{32,128}$/.test(String(token));
  return `
    <div class="auth-page-wrapper page-enter">
      <div class="auth-container">
        <button type="button" class="btn btn-ghost mb-4" onclick="window.navigateTo('/auth?mode=login')">← Back to sign in</button>
        <div class="card auth-card">
          <div class="auth-brand mb-6">
            <div class="navbar-logo" style="width:44px;height:44px;font-size:1.4rem;">🧭</div>
            <div class="auth-brand-text">
              <div class="fw-800 font-heading text-lg">Choose a new password</div>
              <div class="text-xs text-muted">Career Navigator</div>
            </div>
          </div>
          ${validTokenShape ? `
            <form id="reset-password-form" onsubmit="window.submitNewPassword(event)" class="flex-col gap-4">
              <input id="reset-password-token" type="hidden" value="${escapeHtml(token)}" />
              <div class="form-group">
                <label class="form-label" for="reset-password-new">New password</label>
                <input class="input" type="password" id="reset-password-new" required minlength="8" maxlength="128" autocomplete="new-password" />
              </div>
              <div class="form-group">
                <label class="form-label" for="reset-password-confirm">Confirm new password</label>
                <input class="input" type="password" id="reset-password-confirm" required minlength="8" maxlength="128" autocomplete="new-password" />
              </div>
              <button class="btn btn-primary w-full" id="reset-password-submit" type="submit">Update password</button>
            </form>
          ` : `
            <p class="text-sm text-muted">This reset link is missing or malformed. Request a new one before continuing.</p>
            <button class="btn btn-primary w-full mt-4" type="button" onclick="window.navigateTo('/forgot-password')">Request a new reset link</button>
          `}
          <p id="reset-password-result" class="text-sm mt-4" role="status" aria-live="polite"></p>
        </div>
      </div>
    </div>`;
}

window.submitNewPassword = async (event) => {
  event.preventDefault();
  const token = document.getElementById('reset-password-token')?.value || '';
  const password = document.getElementById('reset-password-new')?.value || '';
  const confirmation = document.getElementById('reset-password-confirm')?.value || '';
  const button = document.getElementById('reset-password-submit');
  const resultElement = document.getElementById('reset-password-result');

  if (password.length < 8 || password.length > 128) {
    if (resultElement) resultElement.textContent = 'Password must be between 8 and 128 characters.';
    return;
  }
  if (password !== confirmation) {
    if (resultElement) resultElement.textContent = 'The passwords do not match.';
    showToast('The passwords do not match.', 'error');
    return;
  }

  if (button) button.disabled = true;
  if (resultElement) resultElement.textContent = '';
  try {
    const result = await api.resetPassword(token, password);
    if (resultElement) resultElement.textContent = result.message || 'Password updated. Sign in with your new password.';
    showToast('Password updated. Please sign in.', 'success');
    setTimeout(() => router.navigate('/auth?mode=login'), 700);
  } catch (error) {
    if (resultElement) resultElement.textContent = error.message || 'This reset link is invalid or expired.';
    showToast(error.message || 'Could not reset password.', 'error');
  } finally {
    if (button) button.disabled = false;
  }
};
