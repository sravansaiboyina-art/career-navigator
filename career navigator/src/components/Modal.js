// src/components/Modal.js — Reusable Modal Component

export class Modal {
  static open({ title, content, actions = '', onClose = null, maxWidth = '520px' }) {
    this.close(); // Close any currently open modal

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal-overlay';

    overlay.innerHTML = `
      <div class="modal-box" style="max-width: ${maxWidth};">
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

    const closeHandler = () => {
      overlay.style.animation = 'fadeOut 0.2s forwards';
      setTimeout(() => {
        overlay.remove();
        if (onClose) onClose();
      }, 200);
    };

    overlay.querySelector('#modal-close-btn')?.addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeHandler();
    });

    // ESC key support
    const escListener = (e) => {
      if (e.key === 'Escape') {
        closeHandler();
        window.removeEventListener('keydown', escListener);
      }
    };
    window.addEventListener('keydown', escListener);

    return {
      close: closeHandler,
      element: overlay
    };
  }

  static close() {
    const existing = document.getElementById('active-modal-overlay');
    if (existing) existing.remove();
  }
}

if (typeof window !== 'undefined') {
  window.Modal = Modal;
}
