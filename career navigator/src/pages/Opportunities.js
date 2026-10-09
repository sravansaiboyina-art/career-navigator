// pages/Opportunities.js
import { store } from '../store.js';
import { showToast } from '../main.js';
import { escapeHtml, safeHttpUrl } from '../utils/safeHtml.js';

let activeType = 'all';

export function renderOpportunities(opportunities) {
  const profile = store.getProfile();
  const progress = store.getProgress();
  const types = ['all', 'scholarship', 'internship', 'study-abroad', 'govt-job', 'saved'];
  const typeLabels = { all: 'All', scholarship: '🏆 Scholarships', internship: '💼 Internships', 'study-abroad': '🌍 Study Abroad', 'govt-job': '🏛️ Govt Jobs', saved: '⭐ Saved' };

  const relevant = getRelevantOpportunities(opportunities, profile);

  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;">

    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h2>💰 Opportunities</h2>
          <p class="mt-2">Scholarships, internships, study-abroad programs & government jobs — filtered for you.</p>
        </div>
        <span class="badge badge-amber" style="font-size:0.875rem;padding:0.5rem 1rem;">${relevant.length} relevant for you</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs mb-8">
      ${types.map(t => `
        <button class="tab-btn ${activeType === t ? 'active' : ''}" onclick="window.setOppType('${t}')">
          ${typeLabels[t]}
        </button>`).join('')}
    </div>

    <!-- Cards Grid -->
    <div class="grid-auto" id="opps-grid">
      ${renderOppCards(relevant, profile)}
    </div>

  </div>
</div>`;
}

function getRelevantOpportunities(opportunities, profile) {
  if (!profile) return [];
  return opportunities.filter(o => {
    const matchesCareer = (o.career || []).includes(profile.selectedCareer);
    const matchesStage = (o.targetClass || []).some(tc =>
      tc === profile.class || (tc === 'ug' && ['ug', 'grad'].includes(profile.class))
    );
    return matchesCareer || matchesStage;
  });
}

function renderOppCards(opportunities, profile) {
  const progress = store.getProgress();
  let list = activeType === 'all' ? opportunities : activeType === 'saved' ? opportunities.filter(o => progress.savedOpportunities.includes(o.id)) : opportunities.filter(o => o.type === activeType);

  if (list.length === 0) {
    return `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🔍</div><h3>No opportunities in this category</h3></div>`;
  }

  const typeBadge = {
    scholarship: 'badge-amber',
    internship: 'badge-cyan',
    'study-abroad': 'badge-violet',
    'govt-job': 'badge-green',
    placement: 'badge-blue'
  };

  return list.map((o, i) => {
    const isSaved = progress.savedOpportunities.includes(o.id);
    const isRelevant = (o.career || []).includes(profile?.selectedCareer) ||
      (o.targetClass || []).some((targetStage) => targetStage === profile?.class || (targetStage === 'ug' && ['ug', 'grad'].includes(profile?.class)));
    const officialUrl = safeHttpUrl(o.officialLink);\n    const statusLabel = o.status === 'legacy' ? 'Legacy programme — current cycle unverified' : '';
    return `
    <div class="opp-card reveal delay-${Math.min(i + 1, 8)}">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2">
          <span style="font-size:1.5rem;">${escapeHtml(o.emoji || '🎯')}</span>
          <div>
            <h4 style="font-size:0.925rem;line-height:1.3;">${escapeHtml(o.title)}</h4>
            <div class="text-xs text-muted mt-1">${escapeHtml(o.provider)}</div>
          </div>
        </div>
        <div class="flex gap-2 items-center">
          ${isRelevant ? `<span class="badge badge-green" style="font-size:0.6rem;">For You</span>` : ''}
          <span class="badge ${typeBadge[o.type] || 'badge-violet'}" style="font-size:0.6rem;white-space:nowrap;">${escapeHtml(o.type)}</span>\n          ${statusLabel ? `<span class="badge badge-amber" style="font-size:0.6rem;">${escapeHtml(statusLabel)}</span>` : ''}
        </div>
      </div>

      <div class="opp-amount" style="margin-top:0.75rem;">${escapeHtml(o.amount || 'See official details')}</div>

      <p class="text-xs" style="color:var(--text-secondary);line-height:1.6;margin-top:0.5rem;">${escapeHtml((o.description || '').slice(0, 120))}${(o.description || '').length > 120 ? '…' : ''}</p>

      <div style="background:var(--bg-glass);border-radius:var(--radius-md);padding:0.625rem 0.75rem;margin-top:0.75rem;">
        <div class="text-xs text-muted">Eligibility</div>
        <div class="text-xs fw-600 mt-1" style="color:var(--text-secondary);"> ${escapeHtml(o.eligibility || 'Check the official notification.')}</div>\n        ${o.statusNote ? `<div class="text-xs text-muted mt-2">${escapeHtml(o.statusNote)}</div>` : ''}
      </div>

      <div class="opp-card-footer mt-3">
        <div>
          <div class="deadline-chip deadline-open">
            📅 Typical window: ${escapeHtml(o.deadline?.month || 'Not announced')}
          </div>
          ${o.deadline?.note ? `<div class="text-xs text-muted mt-1" style="max-width:180px;">${escapeHtml(o.deadline.note)}</div>` : ''}
        </div>
        <div class="flex gap-2 items-center">
          <button class="save-btn ${isSaved ? 'saved' : ''}" onclick="window.toggleSaveOpp('${escapeHtml(o.id)}',this)" title="${isSaved ? 'Saved' : 'Save'}">
            ${isSaved
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`}
          </button>
          <div class="flex gap-2">

  <button
    class="btn btn-ghost btn-sm"
    onclick="window.navigateTo('/opportunity/${escapeHtml(o.id)}')">
    Details
  </button>

${officialUrl ? `<a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Official site ↗</a>` : ''}

</div>
        </div>
      </div>
      ${o.linkVerifiedDate ? `<div class="text-xs text-muted" style="margin-top:0.5rem;">Dataset reference date: ${escapeHtml(o.linkVerifiedDate)} · not a live availability check</div>` : ''}
    </div>`;
  }).join('');
}

window.setOppType = (type) => {
  if (!['all', 'scholarship', 'internship', 'study-abroad', 'govt-job', 'saved'].includes(type)) return;
  activeType = type;
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    const types = ['all', 'scholarship', 'internship', 'study-abroad', 'govt-job', 'saved'];
    b.classList.toggle('active', types[i] === type);
  });
  const profile = store.getProfile();
  const relevant = getRelevantOpportunities(window.__opportunities || [], profile);
  const grid = document.getElementById('opps-grid');
  if (grid) {
    grid.innerHTML = renderOppCards(relevant, profile);
    grid.querySelectorAll('.reveal').forEach((card) => card.classList.add('visible'));
  }
};

window.toggleSaveOpp = (id, btn) => {
  store.toggleSavedOpportunity(id);
  const isSaved = store.isOpportunitySaved(id);
  btn.classList.toggle('saved', isSaved);
  btn.innerHTML = isSaved
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  showToast(isSaved ? '⭐ Opportunity saved!' : 'Removed from saved', isSaved ? 'success' : 'info');
  if (activeType === 'saved') window.setOppType('saved');
};
