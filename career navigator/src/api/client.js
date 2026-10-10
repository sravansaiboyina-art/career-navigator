const API_BASE = '/api';

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body === undefined ? { Accept: 'application/json' } : {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
  } catch (error) {
    throw new Error('Career Navigator backend is unavailable. Start the backend service and try again.', { cause: error });
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {};
  if (!response.ok) {
    throw new Error(payload.error || `Backend request failed (HTTP ${response.status}).`);
  }
  return payload;
}

export const api = {
  async isAvailable() {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) return false;
      const health = await response.json();
      return health.ok === true && health.service === 'career-navigator-api';
    } catch {
      return false;
    }
  },

  register(values) {
    return request('/auth/register', { method: 'POST', body: values });
  },
  login(values) {
    return request('/auth/login', { method: 'POST', body: values });
  },
  me() {
    return request('/auth/me');
  },
  logout() {
    return request('/auth/logout', { method: 'POST' });
  },
  updateProfile(profile) {
    return request('/profile', { method: 'PUT', body: profile });
  },
  updateProgress(progress) {
    return request('/progress', { method: 'PUT', body: progress });
  },
  chat(messages) {
    return request('/ai/chat', { method: 'POST', body: { messages } });
  }
};
