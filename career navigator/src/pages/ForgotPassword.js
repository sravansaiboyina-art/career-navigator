import { api } from '../api/client.js';
import { showToast } from '../components/Toast.js';
import { escapeHtml } from '../utils/safeHtml.js';

export function renderForgotPassword() {
  return `
    <div class="auth-page-wrapper page-enter">
      <div class="auth-container">
        <button type="button" class="btn btn-ghost mb-4" onclick="window.navigateTo('/auth?mode=login')">← Back to sign in</button>
        <div class="card auth-card">
          <div class="auth-brand mb-6">
            <div class="navbar-logo" style="width:44px;height:44px;font-size:1.4rem;">🧭</div>
            <div class="auth-brand-text">
              <div class="fw-800 font-heading text-lg">Reset your password</div>
              <div class="text-xs text-muted">Career Navigator</div>
            </div>
          </div>
          <p class="text-sm text-muted mb-5">Enter your account email. If it matches an account and email delivery is configured, we’ll send a secure reset link that expires in 30 minutes.</p>
          <form id="forgot-password-form" onsubmit="window.submitPasswordResetRequest(event)" class="flex-col gap-4">
            <div class="form-group">
              <label class="form-label" for="forgot-password-email">Email address</label>
              <input class="input" type="email" id="forgot-password-email" required maxlength="254" autocomplete="email" placeholder="you@example.com" />
            </div>
            <button class="btn btn-primary w-full" id="forgot-password-submit" type="submit">Send reset link</button>
          </form>
          <p id="forgot-password-result" class="text-sm mt-4" role="status" aria-live="polite"></p>
          <p class="text-xs text-muted mt-5">Password-reset email delivery requires SMTP settings in the backend environment. Never share a reset link with anyone.</p>
        </div>
      </div>
    </div>`;
}

window.submitPasswordResetRequest = async (event) => {
  event.preventDefault();
  const email = document.getElementById('forgot-password-email')?.value?.trim();
  const button = document.getElementById('forgot-password-submit');
  const resultElement = document.getElementById('forgot-password-result');
  if (!email) return;
  if (button) button.disabled = true;
  if (resultElement) resultElement.textContent = '';

  try {
    const result = await api.requestPasswordReset(email);
    if (resultElement) resultElement.textContent = result.message || 'If an account matches that email, reset instructions will be sent shortly.';
    showToast('Password reset request submitted.', 'success');
  } catch (error) {
    if (resultElement) resultElement.textContent = error.message || 'The password reset service is unavailable.';
    showToast(error.message || 'Could not request a password reset.', 'error');
  } finally {
    if (button) button.disabled = false;
  }
};
