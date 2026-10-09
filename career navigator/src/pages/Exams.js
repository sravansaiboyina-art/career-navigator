// pages/Exams.js
import { store } from '../store.js';
import { modal } from '../components/Modal.js';
let activeTab = 'my';
let activeFilter = 'all';

export function renderExams(exams) {
  const profile = store.getProfile();

  const myExams = exams.filter(e =>
    (e.career||[]).includes(profile?.selectedCareer) &&
    store.isStageEligible(profile?.class||'ug', e.eligibility?.minClass||'6')
  );

  const upcomingExams = exams.filter(e =>
    (e.career||[]).includes(profile?.selectedCareer) &&
    !store.isStageEligible(profile?.class||'ug', e.eligibility?.minClass||'6')
  );

  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;">

    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h2>📅 Exam Tracker</h2>
          <p class="mt-2">Track all exams relevant to your career path and eligibility.</p>
        </div>
        <div class="flex gap-3 items-center">
          <span class="badge badge-violet">${myExams.length} eligible now</span>
          <span class="badge badge-cyan">${upcomingExams.length} upcoming</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-6 mb-8 flex-wrap items-center justify-between">
      <div class="tabs">
        <button class="tab-btn ${activeTab==='my'?'active':''}" onclick="window.setExamTab('my')">My Exams (${myExams.length})</button>
        <button class="tab-btn ${activeTab==='upcoming'?'active':''}" onclick="window.setExamTab('upcoming')">Upcoming (${upcomingExams.length})</button>
        <button class="tab-btn ${activeTab==='all'?'active':''}" onclick="window.setExamTab('all')">All Exams (${exams.length})</button>
      </div>
      <div class="filter-bar">
        ${[['all','All'],['entrance','Entrance'],['civil-services','Civil Services'],['govt-exam','Govt Exams'],['banking','Banking'],['scholarship-exam','Scholarships']].map(([f,l]) =>
          `<div class="filter-chip ${activeFilter===f?'active':''}" onclick="window.setExamFilter('${f}')">${l}</div>`
        ).join('')}
      </div>
    </div>

    <div id="exams-content">
      ${renderExamList(exams, myExams, upcomingExams)}
    </div>

  </div>
</div>`;
}

function renderExamList(exams, myExams, upcomingExams) {
  let list = activeTab === 'my' ? myExams : activeTab === 'upcoming' ? upcomingExams : exams;
  if (activeFilter !== 'all') list = list.filter(e => e.category === activeFilter);

  if (list.length === 0) {
    return `<div class="empty-state"><div class="empty-icon">📚</div><h3>No exams in this category</h3><p>Try a different filter or tab.</p></div>`;
  }

  return `<div class="grid-auto">${list.map((e,i) => renderExamCard(e, i)).join('')}</div>`;
}

function renderExamCard(e, i) {
  return `
<div class="exam-card reveal delay-${Math.min(i+1,8)}">
  <div class="exam-card-header">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span style="font-size:1.25rem;">${e.emoji}</span>
        <div class="exam-card-title">${e.title}</div>
      </div>
      <div class="text-xs text-muted">${e.fullName}</div>
    </div>
    <span class="badge ${e.difficulty==='Extremely High'?'badge-red':e.difficulty==='Very High'?'badge-red':e.difficulty==='High'?'badge-amber':'badge-green'}" style="white-space:nowrap;">
      ${e.difficulty}
    </span>
  </div>

  <div class="exam-card-body">
    <div class="grid-2 gap-3 mb-3">
      <div style="background:var(--bg-glass);border-radius:var(--radius-md);padding:0.625rem;">
        <div class="text-xs text-muted">Exam Month</div>
        <div class="fw-600 text-sm mt-1">📅 ${e.examMonth}</div>
      </div>
      <div style="background:var(--bg-glass);border-radius:var(--radius-md);padding:0.625rem;">
        <div class="text-xs text-muted">Conducted By</div>
        <div class="fw-600 text-sm mt-1">🏢 ${e.conductedBy}</div>
      </div>
    </div>

    <div style="margin-bottom:0.75rem;">
      <div class="text-xs text-muted mb-1">Eligibility</div>
      <div class="text-sm">
        ${e.eligibility?.minClass ? `Min: ${e.eligibility.minClass === 'ug' ? 'Graduation' : e.eligibility.minClass === 'grad' ? 'Post-Graduation' : 'Class ' + e.eligibility.minClass}` : 'Open to all'}
        ${e.eligibility?.minAge ? ` · Age: ${e.eligibility.minAge}+` : ''}
        ${e.eligibility?.minPercent ? ` · ${e.eligibility.minPercent}% min` : ''}
        ${e.eligibility?.additionalCriteria ? `<div class="text-xs text-muted mt-1">${e.eligibility.additionalCriteria}</div>` : ''}
      </div>
    </div>

    <div class="text-xs text-muted mb-2">📝 Key Topics:</div>
    <div class="flex flex-wrap gap-1 mb-3">
      ${(e.importantTopics||[]).slice(0,4).map(t => `<span class="tag" style="font-size:0.65rem;">${t}</span>`).join('')}
    </div>
  </div>

  <div class="exam-card-footer">
    <div class="deadline-chip ${e.applicationWindow?.approxMonth === 'February' || e.applicationWindow?.approxMonth === 'January' ? 'deadline-open' : 'deadline-soon'}">
      📋 Apply: ${e.applicationWindow?.approxMonth || 'TBA'}
    </div>
    <div class="flex gap-2">
      <a href="${e.officialLink}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
        Apply Now ↗
      </a>
    </div>
  </div>

  ${(e.alternativeLinks||[]).length > 0 ? `
  <div style="padding:0.5rem 0.75rem;border-top:1px solid var(--border);display:flex;gap:0.5rem;flex-wrap:wrap;">
    ${e.alternativeLinks.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="text-xs text-accent">${l.label} ↗</a>`).join('')}
  </div>` : ''}
</div>`;
}

window.setExamTab = (tab) => {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().startsWith(tab === 'my' ? 'my' : tab === 'upcoming' ? 'up' : 'all'));
  });
  refreshExams();
};

window.setExamFilter = (f) => {
  activeFilter = f;
  const filterMap = {
    'all': 'All', 'entrance': 'Entrance', 'civil-services': 'Civil Services',
    'govt-exam': 'Govt Exams', 'banking': 'Banking', 'scholarship-exam': 'Scholarships'
  };
  document.querySelectorAll('.filter-chip').forEach(el => {
    el.classList.toggle('active', el.textContent.trim() === (filterMap[f] || f));
  });
  refreshExams();
};

function refreshExams() {
  const exams = window.__exams || [];
  const profile = store.getProfile();
  const myExams = exams.filter(e =>
    (e.career||[]).includes(profile?.selectedCareer) &&
    store.isStageEligible(profile?.class||'ug', e.eligibility?.minClass||'6')
  );
  const upcomingExams = exams.filter(e =>
    (e.career||[]).includes(profile?.selectedCareer) &&
    !store.isStageEligible(profile?.class||'ug', e.eligibility?.minClass||'6')
  );
  const content = document.getElementById('exams-content');
  if (content) content.innerHTML = renderExamList(exams, myExams, upcomingExams);
}
