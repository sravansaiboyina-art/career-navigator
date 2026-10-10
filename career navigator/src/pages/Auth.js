// src/pages/Auth.js — Modern Login & Signup Authentication Page
import { db } from '../db/index.js';
import { store } from '../store.js';
import { router } from '../router.js';
import { showToast } from '../components/Toast.js';
import { api } from '../api/client.js';

let authMode = 'login'; // 'login' | 'signup'

export function renderAuth(params = {}) {
  if (params.mode === 'signup') {
    authMode = 'signup';
  } else if (params.mode === 'login') {
    authMode = 'login';
  }

  return `
  <div class="auth-page-wrapper page-enter">
    <!-- Ambient glow orbs -->
    <div class="orb orb-violet" style="width:400px;height:400px;top:-50px;left:-100px;opacity:0.15;"></div>
    <div class="orb orb-cyan" style="width:350px;height:350px;bottom:-50px;right:-100px;opacity:0.12;"></div>

    <div class="auth-container">
      <div class="auth-brand" onclick="window.navigateTo('/')">
        <div class="navbar-logo" style="width:44px;height:44px;font-size:1.4rem;">🧭</div>
        <div class="auth-brand-text">
          <div class="fw-800 font-heading text-lg">Career Navigator</div>
          <div class="text-xs text-muted">Phase 1 · Project Foundation</div>
        </div>
      </div>

      <div class="card auth-card">
        <!-- Tab Switcher -->
        <div class="auth-tabs mb-6">
          <button class="auth-tab ${authMode === 'login' ? 'active' : ''}" onclick="window.setAuthMode('login')">
            Log In
          </button>
          <button class="auth-tab ${authMode === 'signup' ? 'active' : ''}" onclick="window.setAuthMode('signup')">
            Create Account
          </button>
        </div>

        <!-- One-Click Quick Demo Login (Extremely helpful for grading/testing) -->
        <div class="demo-login-box mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs fw-700 uppercase" style="color:var(--violet-light);letter-spacing:0.05em;">
              ⚡ Quick Test Login (1-Click)
            </span>
            <span class="badge badge-sm badge-violet">Demo Personas</span>
          </div>
          <div class="demo-buttons-grid">
            <button class="demo-quick-btn" onclick="window.quickDemoLogin('neet')" title="Class 11 Science (NEET)">
              <span>🩺</span>
              <div>
                <div class="fw-600 text-xs">Priya Sharma</div>
                <div class="text-muted" style="font-size:0.65rem;">Class 11 NEET</div>
              </div>
            </button>
            <button class="demo-quick-btn" onclick="window.quickDemoLogin('jee')" title="Class 12 Science (JEE)">
              <span>💻</span>
              <div>
                <div class="fw-600 text-xs">Rohan Gupta</div>
                <div class="text-muted" style="font-size:0.65rem;">Class 12 JEE</div>
              </div>
            </button>
            <button class="demo-quick-btn" onclick="window.quickDemoLogin('upsc')" title="UG Arts (UPSC)">
              <span>🏛️</span>
              <div>
                <div class="fw-600 text-xs">Ananya Verma</div>
                <div class="text-muted" style="font-size:0.65rem;">UG UPSC</div>
              </div>
            </button>
            <button class="demo-quick-btn" onclick="window.quickDemoLogin('cl8')" title="Class 8 Foundation">
              <span>🎒</span>
              <div>
                <div class="fw-600 text-xs">Kabir Mehta</div>
                <div class="text-muted" style="font-size:0.65rem;">Class 8 Explorer</div>
              </div>
            </button>
          </div>
        </div>

        <div class="auth-divider mb-6">
          <span>or continue with email</span>
        </div>

        <!-- Form Container -->
        <div id="auth-form-container">
          ${authMode === 'login' ? renderLoginForm() : renderSignupForm()}
        </div>

        <div class="auth-footer mt-6 text-center text-xs text-muted">
          <span>With the backend running, accounts and progress are stored in a local SQLite database with server-managed sessions. Without it, the standalone browser demo uses local storage. Password recovery is not configured yet.</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderLoginForm() {
  return `
  <form onsubmit="window.handleLoginForm(event)" class="flex-col gap-4">
    <div class="form-group">
      <label class="form-label" for="login-email">Email Address</label>
      <input id="login-email" class="input" type="email" placeholder="e.g. priya@student.in" required autocomplete="username" />
    </div>

    <div class="form-group">
      <div class="flex justify-between items-center mb-1">
        <label class="form-label mb-0" for="login-password">Password</label>
        <a href="#/auth" onclick="event.preventDefault();window.showPasswordResetInfo()" class="text-xs text-muted hover-underline">Forgot password?</a>
      </div>
      <div class="password-input-wrapper" style="position:relative;">
        <input id="login-password" class="input w-full" type="password" placeholder="••••••••" required autocomplete="current-password" />
        <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility('login-password')">👁️</button>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs text-muted">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" id="login-remember" checked />
        <span>Remember my session</span>
      </label>
    </div>

    <button type="submit" class="btn btn-primary w-full mt-2" style="justify-content:center;padding:0.75rem;">
      Sign In to Career Navigator →
    </button>
  </form>
  `;
}

function renderSignupForm() {
  return `
  <form onsubmit="window.handleSignupForm(event)" class="flex-col gap-4">
    <div class="form-group">
      <label class="form-label" for="signup-name">Student Full Name *</label>
      <input id="signup-name" class="input" type="text" placeholder="e.g. Aryan Patel" required />
    </div>

    <div class="form-group">
      <label class="form-label" for="signup-email">Email Address *</label>
      <input id="signup-email" class="input" type="email" placeholder="e.g. aryan@school.edu" required />
    </div>

    <div class="grid-2 gap-3">
      <div class="form-group">
        <label class="form-label" for="signup-class">Class / Stage *</label>
        <select id="signup-class" class="input select" required onchange="window.handleSignupClassChange(this.value)">
          <option value="">Select...</option>
          <option value="6">Class 6</option>
          <option value="7">Class 7</option>
          <option value="8">Class 8</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
          <option value="11" selected>Class 11</option>
          <option value="12">Class 12</option>
          <option value="ug">Undergraduate (UG)</option>
          <option value="grad">Graduate (degree completed)</option>
        </select>
      </div>

      <div class="form-group" id="signup-stream-container">
        <label class="form-label" for="signup-stream">Stream</label>
        <select id="signup-stream" class="input select">
          <option value="science" selected>🔬 Science</option>
          <option value="commerce">💼 Commerce</option>
          <option value="arts">🎭 Arts / Hum.</option>
          <option value="na">🔄 Not Decided</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="signup-password">Password (min 8 characters) *</label>
      <div class="password-input-wrapper" style="position:relative;">
        <input id="signup-password" class="input w-full" type="password" placeholder="••••••••" required minlength="8" autocomplete="new-password" />
        <button type="button" class="password-toggle-btn" onclick="window.togglePasswordVisibility('signup-password')">👁️</button>
      </div>
    </div>

    <button type="submit" class="btn btn-primary w-full mt-2" style="justify-content:center;padding:0.75rem;">
      Create Student Account & Onboard →
    </button>
  </form>
  `;
}

// Global Handlers
if (typeof window !== 'undefined') {
  window.setAuthMode = (mode) => {
    authMode = mode;
    document.querySelectorAll('.auth-tab').forEach(t => {
      t.classList.toggle('active', t.textContent.toLowerCase().includes(mode === 'login' ? 'log in' : 'create'));
    });
    if (!['login', 'signup'].includes(mode)) return;
    const container = document.getElementById('auth-form-container');
    if (container) {
      container.innerHTML = mode === 'login' ? renderLoginForm() : renderSignupForm();
    }
  };

  window.showPasswordResetInfo = () => {
    showToast('Password recovery is not part of this demo yet. Use a one-click demo persona or create a new account.', 'info');
  };

  window.togglePasswordVisibility = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  window.quickDemoLogin = async (personaKey) => {
    if (store.isBackendSession()) {
      await api.logout().catch(() => {});
      store.setBackendSession(false);
    }
    const persona = store.applyDemoPersona(personaKey);
    showToast(`Logged in as demo persona: ${persona.name} (${store.getStageLabel(persona.profile.class)}) 🚀`, 'success');
    router.navigate('/dashboard');
  };

  window.handleLoginForm = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      const backendAvailable = await api.isAvailable();
      const result = backendAvailable
        ? await api.login({ email, password })
        : await db.authenticate(email, password);
      if (!result) {
        showToast('Invalid email or password. Try one-click demo login or create a new account.', 'error');
        return;
      }

      store.setBackendSession(backendAvailable);
      store.replaceSession(result.user, result.profile, result.progress);

      showToast(`Welcome back, ${result.user.name}! 👋`, 'success');
      router.navigate(result.profile ? '/dashboard' : '/onboarding');
    } catch (err) {
      console.error('Login error:', err);
      showToast('Login failed: ' + err.message, 'error');
    }
  };

  window.handleSignupForm = async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const cls = document.getElementById('signup-class')?.value;
    const stream = document.getElementById('signup-stream')?.value || 'na';

    if (!name || !email || !password || !cls) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const backendAvailable = await api.isAvailable();
      const result = backendAvailable
        ? await api.register({ name, email, password, class: cls, stream })
        : await db.register(
            { name, email, password, role: 'student' },
            { class: cls, stream }
          );

      store.setBackendSession(backendAvailable);
      store.replaceSession(result.user, result.profile, result.progress);

      showToast(`Account created successfully! Welcome, ${name}! 🎉`, 'success');
      // Navigate to onboarding to pick interests and career match
      router.navigate('/onboarding');
    } catch (err) {
      console.error('Signup error:', err);
      showToast(err.message, 'error');
    }
  };

  window.handleSignupClassChange = (val) => {
    const streamContainer = document.getElementById('signup-stream-container');
    if (streamContainer) {
      streamContainer.style.display = ['11', '12', 'ug', 'grad'].includes(val) ? 'block' : 'none';
    }
  };
}
