import { store } from '../store.js';
import { showToast } from '../components/Toast.js';
import { escapeHtml, safeHttpUrl } from '../utils/safeHtml.js';

export function renderOpportunityDetail(opportunity) {
  if (!opportunity) {
    return `
      <div class="page-wrapper">
        <div class="container" style="padding-top:8rem;">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Opportunity not found</h3>
            <button class="btn btn-primary mt-4" onclick="window.navigateTo('/opportunities')">Back to Opportunities</button>
          </div>
        </div>
      </div>`;
  }

  const officialUrl = safeHttpUrl(opportunity.officialLink);
  const isSaved = store.isOpportunitySaved(opportunity.id);
  const resourceLinks = (opportunity.alternativeLinks || []).map((link) => {
    const url = safeHttpUrl(link.url);
    if (!url) return '';
    return `<a class="btn btn-ghost btn-sm" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label || 'Official resource')} ↗</a>`;
  }).filter(Boolean);

  return `
  <div class="page-wrapper page-enter">
    <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;max-width:900px;">
      <button class="btn btn-ghost mb-6" onclick="window.navigateTo('/opportunities')">← Back to Opportunities</button>
      <div class="card">
        <div class="flex items-start gap-4">
          <div style="font-size:3rem;">${escapeHtml(opportunity.emoji || '🎯')}</div>
          <div style="flex:1;">
            <h2>${escapeHtml(opportunity.title || 'Opportunity')}</h2>
            <div class="text-sm text-muted mt-2">${escapeHtml(opportunity.provider || '')}</div>
            <div class="flex gap-2 flex-wrap mt-4">
              <span class="badge badge-violet">${escapeHtml(opportunity.type || 'Opportunity')}</span>
              <span class="badge badge-cyan">Typical window: ${escapeHtml(opportunity.deadline?.month || 'Not announced')}</span>
            </div>
          </div>
        </div>

        <hr style="border-color:var(--border);margin:1.5rem 0;">
        <h4>About this opportunity</h4>
        <p class="text-sm mt-2" style="line-height:1.8;">${escapeHtml(opportunity.description || 'Information will be updated soon.')}</p>

        <div class="card mt-6" style="background:var(--bg-glass);">
          <h4>Eligibility</h4>
          <p class="text-sm mt-2">${escapeHtml(opportunity.eligibility || 'Check the official notification.')}</p>
        </div>

        <div class="card mt-4" style="background:var(--bg-glass);">
          <h4>Application timeline</h4>
          <p class="text-sm mt-2">${escapeHtml(opportunity.deadline?.month || 'Not announced')}</p>
          ${opportunity.deadline?.note ? `<p class="text-xs text-muted mt-1">${escapeHtml(opportunity.deadline.note)}</p>` : ''}
          <p class="text-xs text-muted mt-2">This is an indicative window, not confirmation that applications are currently open. Verify the current notification before applying.</p>
        </div>

        <div class="flex gap-3 flex-wrap mt-6">
          <button id="opportunity-detail-save" class="btn btn-secondary" onclick="window.toggleSaveOpportunityDetail('${escapeHtml(opportunity.id)}')">${isSaved ? '★ Saved' : '☆ Save opportunity'}</button>
          ${officialUrl ? `<a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Official website ↗</a>` : ''}
          ${resourceLinks.join(' ')}
        </div>
        ${opportunity.linkVerifiedDate ? `<p class="text-xs text-muted mt-3">Link last checked in dataset: ${escapeHtml(opportunity.linkVerifiedDate)}. Availability is not implied.</p>` : ''}
      </div>
    </div>
  </div>`;
}

window.toggleSaveOpportunityDetail = (opportunityId) => {
  const opportunity = (window.__opportunities || []).find((item) => item.id === opportunityId);
  if (!opportunity) return;

  store.toggleSavedOpportunity(opportunityId);
  const saved = store.isOpportunitySaved(opportunityId);
  const button = document.getElementById('opportunity-detail-save');
  if (button) {
    button.textContent = saved ? '★ Saved' : '☆ Save opportunity';
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', String(saved));
  }
  showToast(saved ? '⭐ Opportunity saved!' : 'Removed from saved', saved ? 'success' : 'info');
};
