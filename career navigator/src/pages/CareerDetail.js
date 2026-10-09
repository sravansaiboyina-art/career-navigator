// pages/CareerDetail.js
import { store } from '../store.js';
import { showToast } from '../main.js';

export function renderCareerDetail(career, exams) {
  if (!career) {
    return `<div class="page-wrapper page-enter"><div class="container" style="padding-top:calc(var(--nav-height)+2rem);"><div class="empty-state"><div class="empty-icon">🔍</div><h3>Career not found</h3><button class="btn btn-primary mt-4" onclick="window.navigateTo('/explore')">Explore Careers</button></div></div></div>`;
  }

  const profile = store.getProfile();
  const stageOrder = ['6','7','8','9','10','11','12','ug','grad'];
  const currentIdx = stageOrder.indexOf(profile?.class || '11');
  const isSelected = profile?.selectedCareer === career.id;

  const careerExams = exams.filter(e => (e.career || []).includes(career.id));

  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;">

    <!-- Back -->
    <button class="btn btn-ghost btn-sm mb-6" onclick="window.navigateTo('/explore')">
      ← Back to Careers
    </button>

    <!-- Hero -->
    <div style="background:${career.gradient};border-radius:var(--radius-2xl);padding:2.5rem;margin-bottom:2rem;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.5);border-radius:inherit;"></div>
      <div style="position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;">
        <div>
          <div style="font-size:3.5rem;line-height:1;margin-bottom:1rem;">${career.emoji}</div>
          <h1 style="font-size:2rem;margin-bottom:0.5rem;">${career.title}</h1>
          <p style="font-size:1rem;color:rgba(255,255,255,0.8);max-width:560px;">${career.tagline}</p>
          <div class="flex gap-3 flex-wrap mt-4">
            ${(career.tags||[]).slice(0,5).map(t => `<span class="badge badge-violet">${t}</span>`).join('')}
          </div>
        </div>
        <div class="flex-col gap-3">
          <button class="btn ${isSelected ? 'btn-secondary' : 'btn-primary'}" onclick="window.setAsMyCareer('${career.id}')">
            ${isSelected ? '✅ My Career Path' : '🎯 Set as My Career'}
          </button>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;">

      <!-- Left: Details -->
      <div>
        <!-- About -->
        <div class="card mb-6 reveal">
          <h4 class="mb-3">About This Career</h4>
          <p class="text-sm" style="line-height:1.8;">${career.description}</p>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-top:1.5rem;">
            <div style="background:var(--bg-glass);border-radius:var(--radius-lg);padding:1rem;">
              <div class="text-xs text-muted mb-1">Average Salary</div>
              <div class="fw-700 text-green" style="font-size:0.875rem;">${career.avgSalary}</div>
            </div>
            <div style="background:var(--bg-glass);border-radius:var(--radius-lg);padding:1rem;">
              <div class="text-xs text-muted mb-1">Eligible From</div>
              <div class="fw-700" style="font-size:0.875rem;">Class ${career.eligibleFromClass}+</div>
            </div>
          </div>
        </div>

        <!-- Roadmap Preview -->
        <div class="card mb-6 reveal">
          <div class="flex items-center justify-between mb-4">
            <h4>🗺️ Stage-by-Stage Roadmap</h4>
            ${profile?.selectedCareer === career.id ? `<button class="btn btn-ghost btn-sm" onclick="window.navigateTo('/roadmap')">Full Roadmap →</button>` : ''}
          </div>
          <div class="roadmap-timeline">
            ${Object.entries(career.stages || {}).map(([stage, data], i) => {
              const stageIdx = stageOrder.indexOf(stage);
              const stageClass = stageIdx < currentIdx ? 'past' : stageIdx === currentIdx ? 'current' : 'future';
              return `
              <div class="timeline-stage ${stageClass}">
                <div class="timeline-stage-header">
                  <span class="badge ${stageClass==='current'?'badge-violet':stageClass==='past'?'badge-green':'badge-cyan'}">
                    ${stage === 'ug' ? 'Undergraduate' : stage === 'grad' ? 'Postgraduate' : 'Class '+stage}
                  </span>
                  ${stageClass==='current' ? '<span class="badge badge-amber animate-pulse">You are here</span>' : ''}
                </div>
                <div class="card" style="background:${stageClass==='current'?'rgba(124,58,237,0.08)':stageClass==='past'?'rgba(16,185,129,0.04)':'var(--bg-glass)'};border-color:${stageClass==='current'?'rgba(124,58,237,0.3)':'var(--border)'};">
                  <div class="fw-600 text-sm mb-2" style="color:${stageClass==='current'?'var(--violet-light)':stageClass==='past'?'var(--green-light)':'var(--text-secondary)'}">
                    ${stageClass==='past'?'✅ ':''}${data.focus}
                  </div>
                  <div class="text-xs text-muted">${data.milestones?.length || 0} milestones</div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Top Colleges -->
        <div class="card reveal">
          <h4 class="mb-4">🏫 Top Institutions</h4>
          <div class="flex flex-wrap gap-2">
            ${(career.topColleges||[]).map(c => `<span class="tag">${c}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Right: Key Exams -->
      <div>
        <div class="card mb-6 reveal">
          <h4 class="mb-4">📋 Key Exams</h4>
          ${careerExams.length === 0
            ? `<p class="text-sm text-muted">No specific exams listed.</p>`
            : careerExams.map(e => `
            <div class="mb-3 p-3" style="background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-lg);">
              <div class="flex items-center gap-2 mb-1">
                <span style="font-size:1rem;">${e.emoji}</span>
                <div class="fw-700 font-heading" style="font-size:0.85rem;">${e.title}</div>
              </div>
              <div class="text-xs text-muted">${e.examMonth}</div>
              <div class="flex gap-2 mt-2">
                <span class="badge badge-violet" style="font-size:0.6rem;">${e.difficulty}</span>
                <span class="badge badge-cyan" style="font-size:0.6rem;">${e.frequency}</span>
              </div>
              <a href="${e.officialLink}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm w-full mt-2" style="justify-content:center;font-size:0.75rem;">
                Official Site ↗
              </a>
            </div>`).join('')}
        </div>

        <!-- CTA -->
        ${!isSelected ? `
        <div class="card reveal" style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08));border-color:var(--border-accent);text-align:center;">
          <div style="font-size:2rem;margin-bottom:0.75rem;">🚀</div>
          <h5 class="mb-2">Ready to start?</h5>
          <p class="text-sm mb-4">Set this as your career and get a personalized roadmap.</p>
          <button class="btn btn-primary w-full" style="justify-content:center;" onclick="window.setAsMyCareer('${career.id}')">
            Set as My Career
          </button>
        </div>` : `
        <div class="card reveal" style="background:rgba(16,185,129,0.05);border-color:rgba(16,185,129,0.3);text-align:center;">
          <div style="font-size:2rem;margin-bottom:0.75rem;">✅</div>
          <h5 class="mb-2 text-green">This is your career!</h5>
          <button class="btn btn-primary w-full" style="justify-content:center;" onclick="window.navigateTo('/roadmap')">
            View My Roadmap →
          </button>
        </div>`}
      </div>
    </div>
  </div>
</div>`;
}

window.setAsMyCareer = (careerId) => {
  const profile = store.getProfile();
  if (!profile) { router.navigate('/onboarding'); return; }
  store.saveProfile({ selectedCareer: careerId });
  showToast('Career updated! Your roadmap is ready. 🎯', 'success');
  // Re-render the page
  setTimeout(() => window.navigateTo('/career/' + careerId), 300);
};
