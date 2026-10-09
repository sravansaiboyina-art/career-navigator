// pages/Exams.js
import { store } from '../store.js';
import { Modal } from '../components/Modal.js';

let activeTab = 'my';
let activeFilter = 'all';

const FILTERS = [
  ['all', 'All'],
  ['entrance', 'Entrance'],
  ['postgrad-entrance', 'Postgraduate Entrance'],
  ['civil-services', 'Civil Services'],
  ['govt-exam', 'Govt Exams'],
  ['banking', 'Banking'],
  ['scholarship-exam', 'Scholarships']
];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function examIsEligible(exam, profile) {
  return store.isStageEligible(
    profile?.class || 'ug',
    exam.eligibility?.minClass || '6'
  );
}

function getExamLists(exams) {
  const profile = store.getProfile();
  const careerExams = exams.filter((exam) =>
    (exam.career || []).includes(profile?.selectedCareer)
  );
  return {
    myExams: careerExams.filter((exam) => examIsEligible(exam, profile)),
    upcomingExams: careerExams.filter((exam) => !examIsEligible(exam, profile)),
    trackedExams: exams.filter((exam) => store.isExamTracked(exam.id))
  };
}

export function renderExams(exams) {
  const { myExams, upcomingExams, trackedExams } = getExamLists(exams);
  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;">
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h2>📅 Exam Tracker</h2>
          <p class="mt-2">Explore exams, review eligibility, and save exams you plan to take.</p>
          <p class="text-xs text-muted mt-1">Application months are estimates. Always confirm dates on the official exam website.</p>
        </div>
        <div class="flex gap-3 items-center">
          <span class="badge badge-violet">${myExams.length} eligible for your stage</span>
          <span class="badge badge-cyan">${upcomingExams.length} future-stage</span>
        </div>
      </div>
    </div>

    <div class="flex gap-6 mb-8 flex-wrap items-center justify-between">
      <div class="tabs">
        <button class="tab-btn ${activeTab === 'my' ? 'active' : ''}" onclick="window.setExamTab('my')">My Exams (${myExams.length})</button>
        <button class="tab-btn ${activeTab === 'upcoming' ? 'active' : ''}" onclick="window.setExamTab('upcoming')">Future-stage (${upcomingExams.length})</button>
        <button class="tab-btn ${activeTab === 'tracked' ? 'active' : ''}" onclick="window.setExamTab('tracked')">Tracked (${trackedExams.length})</button>
        <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="window.setExamTab('all')">All Exams (${exams.length})</button>
      </div>
      <div class="filter-bar">
        ${FILTERS.map(([filter, label]) =>
          `<button type="button" class="filter-chip ${activeFilter === filter ? 'active' : ''}" onclick="window.setExamFilter('${filter}')">${label}</button>`
        ).join('')}
      </div>
    </div>

    <div id="exams-content">${renderExamList(exams, myExams, upcomingExams, trackedExams)}</div>
  </div>
</div>`;
}

function renderExamList(exams, myExams, upcomingExams, trackedExams) {
  let list = activeTab === 'my' ? myExams
    : activeTab === 'upcoming' ? upcomingExams
    : activeTab === 'tracked' ? trackedExams
    : exams;
  if (activeFilter !== 'all') list = list.filter((exam) => exam.category === activeFilter);

  if (!list.length) {
    return `<div class="empty-state"><div class="empty-icon">📚</div><h3>${activeTab === 'tracked' ? 'No tracked exams yet' : 'No exams in this category'}</h3><p>${activeTab === 'tracked' ? 'Open an exam’s details and select “Track this exam” to save it here.' : 'Try a different filter or tab.'}</p></div>`;
  }
  return `<div class="grid-auto">${list.map((exam, index) => renderExamCard(exam, index)).join('')}</div>`;
}

function renderExamCard(exam, index) {
  const officialUrl = safeUrl(exam.officialLink);
  const tracked = store.isExamTracked(exam.id);
  const difficulty = exam.difficulty || 'Not specified';
  const difficultyClass = /extremely high|very high/i.test(difficulty) ? 'badge-red'
    : /high/i.test(difficulty) ? 'badge-amber' : 'badge-green';
  const topics = (exam.importantTopics || []).slice(0, 4);
  const applicationMonth = exam.applicationWindow?.approxMonth || 'Not announced';

  return `
<article class="exam-card reveal delay-${Math.min(index + 1, 8)}">
  <div class="exam-card-header">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span style="font-size:1.25rem;">${escapeHtml(exam.emoji || '📝')}</span>
        <div class="exam-card-title">${escapeHtml(exam.title || 'Exam')}</div>
      </div>
      <div class="text-xs text-muted">${escapeHtml(exam.fullName || '')}</div>
    </div>
    <span class="badge ${difficultyClass}" style="white-space:nowrap;">${escapeHtml(difficulty)}</span>
  </div>
  <div class="exam-card-body">
    <div class="grid-2 gap-3 mb-3">
      <div style="background:var(--bg-glass);border-radius:var(--radius-md);padding:0.625rem;">
        <div class="text-xs text-muted">Expected exam period</div>
        <div class="fw-600 text-sm mt-1">📅 ${escapeHtml(exam.examMonth || 'Not announced')}</div>
      </div>
      <div style="background:var(--bg-glass);border-radius:var(--radius-md);padding:0.625rem;">
        <div class="text-xs text-muted">Conducted by</div>
        <div class="fw-600 text-sm mt-1">🏢 ${escapeHtml(exam.conductedBy || 'Not specified')}</div>
      </div>
    </div>
    <div style="margin-bottom:0.75rem;">
      <div class="text-xs text-muted mb-1">Eligibility summary</div>
      <div class="text-sm">${escapeHtml(formatEligibility(exam.eligibility))}</div>
    </div>
    <div class="text-xs text-muted mb-2">📝 Key topics</div>
    <div class="flex flex-wrap gap-1 mb-3">
      ${topics.map((topic) => `<span class="tag" style="font-size:0.65rem;">${escapeHtml(topic)}</span>`).join('')}
    </div>
  </div>
  <div class="exam-card-footer">
    <div>
      <div class="deadline-chip deadline-soon">📋 Expected application: ${escapeHtml(applicationMonth)}</div>
      <div class="text-xs text-muted mt-1">Estimated only — verify official notice</div>
    </div>
    <div class="flex gap-2 flex-wrap">
      <button type="button" class="btn btn-secondary btn-sm" onclick="window.showExamDetails('${escapeHtml(exam.id)}')">Details</button>
      <button type="button" class="btn btn-primary btn-sm" onclick="window.toggleTrackedExam('${escapeHtml(exam.id)}')">${tracked ? '✓ Tracked' : '+ Track'}</button>
      ${officialUrl ? `<a href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Official site ↗</a>` : ''}
    </div>
  </div>
</article>`;
}

function formatEligibility(eligibility = {}) {
  const minClass = eligibility.minClass;
  const stage = minClass === 'ug' ? 'Graduation' : minClass === 'grad' ? 'Post-graduation'
    : minClass ? `Class ${minClass}` : 'Check official notification';
  const parts = [`Minimum stage: ${stage}`];
  if (eligibility.minAge) parts.push(`Minimum age: ${eligibility.minAge}`);
  if (eligibility.maxAge) parts.push(`Maximum age: ${eligibility.maxAge}`);
  if (eligibility.minPercent) parts.push(`Minimum marks: ${eligibility.minPercent}%`);
  if (eligibility.subjects?.length) parts.push(`Subjects: ${eligibility.subjects.join(', ')}`);
  if (eligibility.additionalCriteria) parts.push(eligibility.additionalCriteria);
  return parts.join(' · ');
}

function getCurrentExams() {
  return Array.isArray(window.__exams) ? window.__exams : [];
}

function refreshExams() {
  const exams = getCurrentExams();
  const { myExams, upcomingExams, trackedExams } = getExamLists(exams);
  const content = document.getElementById('exams-content');
  if (content) {
    content.innerHTML = renderExamList(exams, myExams, upcomingExams, trackedExams);
    // Newly rendered cards were added after the initial scroll-reveal observer ran.
    content.querySelectorAll('.reveal').forEach((card) => card.classList.add('visible'));
  }

  document.querySelectorAll('.tab-btn').forEach((button) => {
    const isActive = button.getAttribute('onclick')?.includes(`setExamTab('${activeTab}')`);
    button.classList.toggle('active', Boolean(isActive));
  });
  document.querySelectorAll('.filter-chip').forEach((button) => {
    button.classList.toggle('active', button.getAttribute('onclick')?.includes(`setExamFilter('${activeFilter}')`) || false);
  });
}

window.setExamTab = (tab) => {
  if (!['my', 'upcoming', 'tracked', 'all'].includes(tab)) return;
  activeTab = tab;
  refreshExams();
};

window.setExamFilter = (filter) => {
  if (!FILTERS.some(([key]) => key === filter)) return;
  activeFilter = filter;
  refreshExams();
};

window.toggleTrackedExam = (examId) => {
  const exam = getCurrentExams().find((item) => item.id === examId);
  if (!exam) return;
  const modalWasOpen = Boolean(document.getElementById('active-modal-overlay'));
  store.toggleTrackedExam(examId);
  if (modalWasOpen) Modal.close();
  refreshExams();
  if (modalWasOpen) window.showExamDetails(examId);
};

window.showExamDetails = (examId) => {
  const exam = getCurrentExams().find((item) => item.id === examId);
  if (!exam) return;

  const officialUrl = safeUrl(exam.officialLink);
  const alternativeLinks = (exam.alternativeLinks || []).map((link) => {
    const url = safeUrl(link.url);
    return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label || 'Resource')} ↗</a>` : '';
  }).filter(Boolean);
  const topics = (exam.importantTopics || []).map((topic) => `<li>${escapeHtml(topic)}</li>`).join('');
  const tracked = store.isExamTracked(exam.id);

  Modal.open({
    title: `${escapeHtml(exam.emoji || '📝')} ${escapeHtml(exam.title || 'Exam details')}`,
    maxWidth: '680px',
    content: `
      <div class="space-y-4">
        <p class="text-sm text-muted">${escapeHtml(exam.fullName || '')}</p>
        <h4>Eligibility</h4>
        <p>${escapeHtml(formatEligibility(exam.eligibility))}</p>
        <h4>Exam pattern and syllabus</h4>
        <p>${escapeHtml(exam.syllabus || 'Check the official notification for the current syllabus and exam pattern.')}</p>
        <h4>Important topics</h4>
        <ul>${topics || '<li>Check the official syllabus.</li>'}</ul>
        <h4>Timeline (estimate only)</h4>
        <p>Application window: ${escapeHtml(exam.applicationWindow?.approxMonth || 'Not announced')}${exam.applicationWindow?.approxEnd ? ` to ${escapeHtml(exam.applicationWindow.approxEnd)}` : ''}. Expected exam period: ${escapeHtml(exam.examMonth || 'Not announced')}.</p>
        <p class="text-xs text-muted">These months may be outdated or change each year. Confirm current dates, eligibility, fees, and application status with the official notification.</p>
        <div class="flex gap-3 flex-wrap">
          ${officialUrl ? `<a class="btn btn-primary btn-sm" href="${escapeHtml(officialUrl)}" target="_blank" rel="noopener noreferrer">Official website ↗</a>` : ''}
          ${alternativeLinks.join(' ')}
        </div>
      </div>`,
    actions: `<button type="button" class="btn btn-secondary" id="exam-modal-track">${tracked ? 'Remove from tracked' : 'Track this exam'}</button>`
  });

  document.getElementById('exam-modal-track')?.addEventListener('click', () => {
    store.toggleTrackedExam(exam.id);
    Modal.close();
    refreshExams();
  });
};
