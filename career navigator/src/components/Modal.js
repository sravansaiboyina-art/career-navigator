// src/components/Modal.js — Reusable Modal Component

let activeModalEscListener = null;

export class Modal {
  static open({ title, content, actions = '', onClose = null, maxWidth = '520px' }) {
    this.close(); // Close any currently open modal and release its listeners.

    const safeMaxWidth = /^\d+(px|rem|vw|%)$/.test(String(maxWidth)) ? maxWidth : '520px';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal-overlay';

    overlay.innerHTML = `
      <div class="modal-box" style="max-width: ${safeMaxWidth};">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-heading" style="font-size:1.25rem;">${title}</h3>
          <button class="btn btn-ghost btn-sm" id="modal-close-btn" style="padding:4px 8px;border-radius:50%;font-size:1.1rem;" aria-label="Close modal">✕</button>
        </div>
        <div class="modal-body mb-6" style="max-height:75vh;overflow-y:auto;padding-right:4px;">
          ${content}
        </div>
        ${actions ? `<div class="modal-actions flex justify-end gap-3 pt-4 border-t border-border">${actions}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    let closed = false;
    let escListener = null;
    const cleanup = () => {
      if (escListener) {
        window.removeEventListener('keydown', escListener);
        if (activeModalEscListener === escListener) activeModalEscListener = null;
        escListener = null;
      }
    };

    const closeHandler = () => {
      if (closed) return;
      closed = true;
      cleanup();
      overlay.style.animation = 'fadeOut 0.2s forwards';
      setTimeout(() => {
        if (overlay.isConnected) overlay.remove();
        if (onClose) onClose();
      }, 200);
    };

    overlay.__modalCleanup = () => {
      closed = true;
      cleanup();
    };

    overlay.querySelector('#modal-close-btn')?.addEventListener('click', closeHandler);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeHandler();
    });

    escListener = (event) => {
      if (event.key === 'Escape') closeHandler();
    };
    activeModalEscListener = escListener;
    window.addEventListener('keydown', escListener);

    return { close: closeHandler, element: overlay };
  }

  static close() {
    const existing = document.getElementById('active-modal-overlay');
    if (existing) {
      existing.__modalCleanup?.();
      existing.remove();
    } else if (activeModalEscListener) {
      window.removeEventListener('keydown', activeModalEscListener);
      activeModalEscListener = null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.Modal = Modal;
}
