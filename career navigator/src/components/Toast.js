// src/components/Toast.js — Toast notification manager

export function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: '💡',
    warning: '⚠️',
  };

  const allowedTypes = new Set(['success', 'error', 'info', 'warning']);
  const toast = document.createElement('div');
  toast.className = `toast ${allowedTypes.has(type) ? type : 'info'}`;

  const iconEl = document.createElement('span');
  iconEl.textContent = icons[type] || '💬';
  const messageEl = document.createElement('span');
  messageEl.textContent = String(message ?? '');
  toast.append(iconEl, messageEl);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
