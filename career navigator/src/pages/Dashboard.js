// pages/Dashboard.js
import { getCurrentStageAdvice } from '../utils/careerEngine.js';
import { CAREER_ROADMAPS, mapClassToStage } from '../data/roadmapData.js';

import { store } from '../store.js';

export function renderDashboard(careers, exams, opportunities) {
  const profile = store.getProfile();
  const progress = store.getProgress();
  const career = careers.find(c => c.id === profile.selectedCareer) || careers[0];
  const currentAdvice = getCurrentStageAdvice(profile, career);
  const roadmap = CAREER_ROADMAPS[profile?.selectedCareer];
  const currentStageId = mapClassToStage(String(profile?.class || '11'));
  const stageData = roadmap?.stages?.[currentStageId];
  const milestones = stageData?.milestones || [];
  const completed = milestones.filter(m => progress.completedMilestones.includes(m.id)).length;
  const pct = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;



  // Upcoming exams (relevant + eligible)
  const myExams = exams.filter(e =>
    (e.career || []).includes(profile.selectedCareer) &&
    store.isStageEligible(profile.class, e.eligibility?.minClass || '6')
  ).slice(0, 3);

  // Upcoming opportunities
  const myOpps = opportunities.filter(o =>
    (o.career || []).includes(profile.selectedCareer) &&
    (o.targetClass || []).some(tc => tc === profile.class || tc === 'ug' && ['ug', 'grad'].includes(profile.class))
  ).slice(0, 3);

  const savedCount = progress.savedOpportunities.length;
  const stageLabel = store.getStageLabel(profile.class);
  const initials = profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;">

    <!-- Hero Welcome Banner -->
    <div class="dashboard-hero reveal mb-8">
      <div style="position:relative;z-index:1;">
        <div class="flex items-center gap-4 flex-wrap justify-between">
          <div>
            <div class="text-sm text-muted mb-1">${greeting} 👋</div>
            <h2 style="font-size:1.75rem;margin-bottom:0.25rem;">${profile.name}</h2>
            <div class="flex gap-3 flex-wrap mt-2">
              <span class="badge badge-violet">📚 ${stageLabel}</span>
              ${profile.stream !== 'na' ? `<span class="badge badge-cyan">${profile.stream.charAt(0).toUpperCase() + profile.stream.slice(1)} Stream</span>` : ''}
              <span class="badge badge-amber">${career?.emoji} ${career?.title}</span>
            </div>
          </div>
          <div class="text-center">
            <div style="font-family:var(--font-heading);font-size:3rem;font-weight:800;background:var(--grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;">${pct}%</div>
            <div class="text-xs text-muted uppercase" style="letter-spacing:0.05em;margin-top:0.25rem;">Stage Progress</div>
          </div>
        </div>

        <!-- Stage Progress Bar -->
        <div style="margin-top:1.5rem;">
          <div class="flex justify-between text-xs text-muted mb-2">
            <span>Current Stage Milestones: <span id="dash-milestone-text">${completed}/${milestones.length} complete</span></span>
            <span>${stageData?.focus || 'Focus on your stage goals'}</span>
          </div>
          <div class="progress-bar" style="height:10px;">
            <div class="progress-fill" id="dash-progress-fill" style="width:${pct}%;"></div>
          </div>
        </div>

        <!-- Stat Row -->
        <div class="dashboard-stat-grid mt-6">
          ${[
      ['🎯', milestones.length, 'Milestones', 'dash-stat-total'],
      ['✅', completed, 'Completed', 'dash-stat-completed'],
      ['📅', myExams.length, 'Key Exams', 'dash-stat-exams'],
      ['⭐', savedCount, 'Saved Opps', 'dash-stat-saved'],
    ].map(([e, v, l, id]) => `
            <div class="stat-box">
              <div style="font-size:1.5rem;margin-bottom:0.25rem;">${e}</div>
              <div class="stat-value" id="${id}" style="font-size:1.75rem;">${v}</div>
              <div class="stat-label">${l}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Quick Demo Personas Switcher -->
    <div class="card mb-8 reveal" style="background:linear-gradient(135deg,rgba(124,58,237,0.08),rgba(6,182,212,0.04));border-color:var(--border-accent);">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div class="fw-700 font-heading text-sm">✨ Quick Demo Personas (One-Click Stage Switcher)</div>
          <div class="text-xs text-muted">Instantly see how the platform adapts across school, high school, and college stages</div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button class="btn btn-ghost btn-sm" onclick="window.switchDemoPersona('neet')">🩺 Cl.11 NEET</button>
          <button class="btn btn-ghost btn-sm" onclick="window.switchDemoPersona('jee')">💻 Cl.12 JEE</button>
          <button class="btn btn-ghost btn-sm" onclick="window.switchDemoPersona('upsc')">🏛️ UG UPSC</button>
          <button class="btn btn-ghost btn-sm" onclick="window.switchDemoPersona('cl8')">🎒 Cl.8 Foundation</button>
          <button class="btn btn-ghost btn-sm" onclick="window.switchDemoPersona('bank')">🏦 Grad Banking</button>
          <button class="btn btn-secondary btn-sm" onclick="window.resetProfile()">🔄 New Profile</button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mb-8 reveal">
      <h3 class="mb-4">Quick Actions</h3>
      <div class="quick-action-grid">
        ${[
      ['/roadmap', '🗺️', 'rgba(124,58,237,0.15)', 'My Roadmap'],
      ['/exams', '📅', 'rgba(6,182,212,0.15)', 'Exam Tracker'],
      ['/opportunities', '💰', 'rgba(245,158,11,0.15)', 'Opportunities'],
      ['/assistant', '🤖', 'rgba(16,185,129,0.15)', 'AI Assistant'],
    ].map(([path, icon, bg, label]) => `
          <div class="quick-action" onclick="window.navigateTo('${path}')">
            <div class="quick-action-icon" style="background:${bg};">${icon}</div>
            <span>${label}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="dashboard-panels-grid">

      <!-- What Should I Do Now? -->
      <div class="card reveal">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4>🎯 What Should I Do Now?</h4>
            <p class="text-xs text-muted mt-1">Your next steps for ${stageLabel}, based on your chosen career.</p>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="window.navigateTo('/roadmap')">Full roadmap →</button>
        </div>
        <div class="next-step-focus mb-4" style="padding:0.9rem 1rem;border-radius:var(--radius-lg);background:var(--grad-card);border:1px solid var(--border);">
          <div class="text-xs text-muted mb-1">CURRENT STAGE FOCUS</div>
          <div class="fw-600" style="color:var(--text-primary);">${currentAdvice.title || stageData?.focus || 'Build your foundations and explore your interests.'}</div>
        </div>
        ${currentAdvice.actions.length === 0
          ? `<div class="empty-state" style="padding:1.5rem;"><div class="empty-icon">${milestones.length && completed === milestones.length ? '🎉' : '🌱'}</div><p>${milestones.length && completed === milestones.length ? 'You have completed all milestones for this stage. Explore the next stage in your roadmap!' : 'No specific next steps are available for this stage yet. Open your roadmap to explore future stages.'}</p></div>`
          : currentAdvice.actions.map((action, index) => {
              const actionTitle = typeof action === 'string' ? action : action.title;
              const actionId = typeof action === 'string' ? '' : action.id;
              const isDone = actionId && progress.completedMilestones.includes(actionId);
              const priority = typeof action === 'string' ? 'recommended' : (action.priority || 'recommended');
              const weeks = typeof action === 'string' ? null : action.weeks;
              return `
                <div class="milestone-item ${isDone ? 'completed' : ''} mb-3"
                     ${actionId ? `onclick="window.toggleMilestoneFromDash('${actionId}',this)"` : `onclick="window.navigateTo('/roadmap')"`}
                     style="cursor:pointer;">
                  <div class="milestone-checkbox">${isDone ? '✓' : `<span style="font-size:0.8rem;">${index + 1}</span>`}</div>
                  <div class="milestone-content">
                    <div class="milestone-title">${actionTitle}</div>
                    <div class="milestone-meta">
                      <span class="badge ${priority === 'high' ? 'badge-red' : priority === 'medium' ? 'badge-amber' : 'badge-violet'}">${priority}</span>
                      ${weeks ? `<span>About ${weeks} weeks</span>` : '<span>Suggested next step</span>'}
                    </div>
                  </div>
                </div>`;
            }).join('')}
        <div class="text-xs text-muted mt-3">Tip: click a milestone to mark it complete. Your progress is saved on this device.</div>
      </div>

      <!-- Upcoming Exams -->
      <div class="card reveal delay-1">
        <div class="flex items-center justify-between mb-4">
          <h4>📅 Upcoming Exams</h4>
          <button class="btn btn-ghost btn-sm" onclick="window.navigateTo('/exams')">View all →</button>
        </div>
        ${myExams.length === 0
      ? `<div class="empty-state" style="padding:1.5rem;"><div class="empty-icon">📚</div><p>No exams for your current stage yet.</p></div>`
      : myExams.map(e => `
          <div class="flex items-center gap-3 mb-3 p-3" style="background:var(--bg-glass);border-radius:var(--radius-lg);border:1px solid var(--border);">
            <div style="font-size:1.5rem;">${e.emoji}</div>
            <div style="flex:1;">
              <div class="fw-600 font-heading" style="font-size:0.875rem;">${e.title}</div>
              <div class="text-xs text-muted">${e.examMonth}</div>
            </div>
            <span class="badge badge-violet">${e.difficulty}</span>
          </div>`).join('')}
      </div>

    </div>

    <!-- Opportunities Strip -->
    <div class="card mt-6 reveal">
      <div class="flex items-center justify-between mb-4">
        <h4>💰 Opportunities For You</h4>
        <button class="btn btn-ghost btn-sm" onclick="window.navigateTo('/opportunities')">See all →</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
        ${myOpps.length === 0
      ? `<div class="empty-state" style="padding:1.5rem;grid-column:1/-1;"><p>No specific opportunities yet. Explore all →</p></div>`
      : myOpps.map(o => `
          <div class="opp-card" style="cursor:pointer;" onclick="window.navigateTo('/opportunities')">
            <div class="flex justify-between items-start">
              <span style="font-size:1.25rem;">${o.emoji}</span>
              <span class="badge ${o.type === 'scholarship' ? 'badge-amber' : o.type === 'internship' ? 'badge-cyan' : o.type === 'study-abroad' ? 'badge-violet' : 'badge-green'}">${o.type}</span>
            </div>
            <h5 style="font-size:0.85rem;margin-top:0.5rem;">${o.title}</h5>
            <div class="opp-amount" style="font-size:0.85rem;">${o.amount}</div>
            <div class="text-xs text-muted">Deadline: ${o.deadline.month}</div>
          </div>`).join('')}
      </div>
    </div>

  </div>
</div>`;
}

// Global handler for milestone toggle from dashboard
window.toggleMilestoneFromDash = (id, el) => {
  store.toggleMilestone(id);
  const isComplete = store.isMilestoneComplete(id);
  el.classList.toggle('completed', isComplete);
  const checkbox = el.querySelector('.milestone-checkbox');
  if (checkbox) {
    checkbox.innerHTML = isComplete
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>`
      : '';
  }

  // Update reactive numbers in DOM
  const profile = store.getProfile();
  const progress = store.getProgress();
  const careers = window.__careers || [];
  const career = careers.find(c => c.id === profile?.selectedCareer) || careers[0];
  const roadmap = CAREER_ROADMAPS[profile?.selectedCareer];
  const stageId = mapClassToStage(String(profile?.class || '11'));
  const stageData = roadmap?.stages?.[stageId];
  const milestones = stageData?.milestones || [];
  const completed = milestones.filter(m => progress.completedMilestones.includes(m.id)).length;
  const pct = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  const pctText = document.querySelector('.dashboard-hero [style*="-webkit-background-clip:text"]');
  if (pctText) pctText.textContent = pct + '%';
  const fill = document.getElementById('dash-progress-fill');
  if (fill) fill.style.width = pct + '%';
  const mText = document.getElementById('dash-milestone-text');
  if (mText) mText.textContent = `${completed}/${milestones.length} complete`;
  const statComp = document.getElementById('dash-stat-completed');
  if (statComp) statComp.textContent = completed;
};

// Switch Demo Persona
window.switchDemoPersona = (personaKey) => {
  const personas = {
    neet: {
      name: 'Priya Sharma',
      class: '11',
      stream: 'science',
      selectedCareer: 'medicine',
      interests: ['biology', 'chemistry', 'healthcare'],
      completedMilestones: ['m-med-11-1']
    },
    jee: {
      name: 'Rohan Gupta',
      class: '12',
      stream: 'science',
      selectedCareer: 'engineering',
      interests: ['math', 'physics', 'coding', 'technology'],
      completedMilestones: ['m-eng-12-1', 'm-eng-12-3']
    },
    upsc: {
      name: 'Ananya Verma',
      class: 'ug',
      stream: 'arts',
      selectedCareer: 'upsc',
      interests: ['history', 'polity', 'geography', 'economics'],
      completedMilestones: ['m-upsc-ug-1', 'm-upsc-ug-3']
    },
    cl8: {
      name: 'Kabir Mehta',
      class: '8',
      stream: 'na',
      selectedCareer: 'iit-jee',
      interests: ['math', 'physics', 'technology'],
      completedMilestones: ['m-iit-8-1']
    },
    bank: {
      name: 'Neha Sen',
      class: 'grad',
      stream: 'commerce',
      selectedCareer: 'banking',
      interests: ['economics', 'math', 'english'],
      completedMilestones: ['m-bank-grad-1']
    }
  };

  const persona = personas[personaKey];
  if (!persona) return;

  store.applyDemoPersona(personaKey);

  if (window.showToast) window.showToast(`Switched to demo persona: ${persona.name} (${store.getStageLabel(persona.class)}) 🚀`, 'success');
  window.navigateTo('/dashboard');
};

// Reset Profile
window.resetProfile = () => {
  if (confirm('Start fresh with a new student profile?')) {
    store.clearProfile();
    window.navigateTo('/onboarding');
  }
};

// Global Logout
window.handleLogout = () => {
  store.logout();
  if (window.showToast) window.showToast('Logged out successfully.', 'info');
  window.navigateTo('/');
};
