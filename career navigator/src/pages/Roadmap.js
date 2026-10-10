// pages/Roadmap.js — Full Career Roadmap Module with Visual Timeline
import { store } from '../store.js';
import { showToast } from '../components/Toast.js';
import { CAREER_ROADMAPS, ROADMAP_STAGES, mapClassToStage } from '../data/roadmapData.js';
import { escapeHtml } from '../utils/safeHtml.js';

// ── State ──────────────────────────────────────────────────────
let activeCareer = null;
let activeStageId = null;
let careerData = null;

// ── Main Render ────────────────────────────────────────────────
export function renderRoadmap(careers) {
  const profile = store.getProfile();
  const progress = store.getProgress();

  // Determine which career to show
  const selectedCareerId = profile?.selectedCareer || (careers[0]?.id ?? 'medicine');
  activeCareer = selectedCareerId;
  careerData = CAREER_ROADMAPS[selectedCareerId] || null;

  // Fallback to careers.json data if no rich roadmap data
  const careersJsonEntry = careers.find(c => c.id === selectedCareerId);

  // Determine student's current stage
  const currentStageId = mapClassToStage(profile?.class || '11');
  activeStageId = currentStageId;

  // Build overall progress across all milestones
  const allRoadmapMilestones = careerData
    ? Object.values(careerData.stages).flatMap(s => s.milestones || [])
    : Object.values(careersJsonEntry?.stages || {}).flatMap(s => s.milestones || []);

  const allCompleted = allRoadmapMilestones.filter(m => progress.completedMilestones.includes(m.id)).length;
  const totalPct = allRoadmapMilestones.length ? Math.round((allCompleted / allRoadmapMilestones.length) * 100) : 0;

  const displayData = careerData || {
    title: careersJsonEntry?.title || 'Career',
    emoji: careersJsonEntry?.emoji || '🎯',
    gradient: careersJsonEntry?.gradient || 'linear-gradient(135deg, #7C3AED, #06B6D4)',
    tagline: careersJsonEntry?.tagline || '',
    stages: Object.fromEntries(
      Object.entries(careersJsonEntry?.stages || {}).map(([k, v]) => [mapClassToStage(k), v])
    )
  };

  return `
<div class="roadmap-page page-enter">

  <!-- Hero Banner -->
  <div class="roadmap-hero" style="background: ${displayData.gradient};">
    <div class="roadmap-hero-inner">
      <div class="roadmap-hero-left">
        <div class="roadmap-hero-emoji">${displayData.emoji}</div>
        <div>
          <div class="text-xs uppercase fw-700 mb-1" style="opacity:0.75;letter-spacing:0.08em;">Career Roadmap</div>
          <h2 class="roadmap-hero-title">${displayData.title}</h2>
          <p class="roadmap-hero-sub">${displayData.tagline}</p>
        </div>
      </div>
      <div class="roadmap-hero-right">
        ${renderProgressRing(totalPct, allCompleted, allRoadmapMilestones.length)}
      </div>
    </div>

    <!-- Career Switcher Pills -->
    <div class="roadmap-career-switcher">
      ${Object.entries(CAREER_ROADMAPS).map(([id, rd]) => `
        <button class="career-switch-pill ${id === activeCareer ? 'active' : ''}"
                onclick="window.switchRoadmapCareer('${id}')"
                id="career-pill-${id}">
          ${rd.emoji} ${rd.title}
        </button>
      `).join('')}
    </div>
  </div>

  <div class="roadmap-content-wrapper">

    <!-- Left: Stage Navigation -->
    <div class="roadmap-stage-nav" id="roadmap-stage-nav">
      <div class="text-xs fw-700 uppercase mb-3" style="color:var(--text-muted);letter-spacing:.07em;padding:0 1.25rem;">Journey Stages</div>
      ${ROADMAP_STAGES.map(stage => {
        const stageData = displayData.stages[stage.id];
        const stageMilestones = stageData?.milestones || [];
        const stageCompleted = stageMilestones.filter(m => progress.completedMilestones.includes(m.id)).length;
        const stagePct = stageMilestones.length ? Math.round((stageCompleted / stageMilestones.length) * 100) : 0;
        const isActive = activeStageId === stage.id;
        const isCurrent = currentStageId === stage.id;
        const stageIdx = ROADMAP_STAGES.findIndex(s => s.id === stage.id);
        const currentIdx = ROADMAP_STAGES.findIndex(s => s.id === currentStageId);
        const stageStatus = stageIdx < currentIdx ? 'past' : stageIdx === currentIdx ? 'current' : 'future';

        return `
        <button class="stage-nav-item ${isActive ? 'active' : ''} ${stageStatus}"
                onclick="window.selectRoadmapStage('${stage.id}')"
                id="stage-nav-${stage.id}">
          <div class="stage-nav-icon ${stageStatus}">${stage.icon}</div>
          <div class="stage-nav-info">
            <div class="stage-nav-label">${stage.label}</div>
            <div class="stage-nav-sub">${stage.subtitle}</div>
            ${stageMilestones.length > 0 ? `
              <div class="stage-nav-progress">
                <div class="stage-nav-bar">
                  <div class="stage-nav-fill ${stageStatus}" style="width:${stagePct}%"></div>
                </div>
                <span class="stage-nav-count">${stageCompleted}/${stageMilestones.length}</span>
              </div>
            ` : ''}
          </div>
          ${isCurrent ? '<span class="current-dot"></span>' : ''}
          ${stageStatus === 'past' && stagePct === 100 ? '<span style="color:#10B981;font-size:0.9rem;">✓</span>' : ''}
        </button>
        `;
      }).join('')}
    </div>

    <!-- Right: Stage Detail Panel -->
    <div class="roadmap-stage-detail" id="roadmap-stage-detail">
      ${renderStageDetail(activeStageId, displayData, progress, currentStageId)}
    </div>

  </div>

  <!-- Full Timeline View (below the panel grid) -->
  <div class="roadmap-full-timeline-section">
    <div class="roadmap-timeline-header">
      <h3>📍 Complete Timeline View</h3>
      <p class="text-muted text-sm">Milestones across every stage of your journey</p>
    </div>
    <div class="roadmap-timeline" id="roadmap-full-timeline">
      ${renderFullTimeline(displayData, progress, currentStageId)}
    </div>
  </div>

</div>

<!-- Note Modal -->
<div id="note-modal" class="modal-overlay hidden" onclick="window.closeNoteModal(event)">
  <div class="modal-box" onclick="event.stopPropagation()">
    <div class="flex items-center justify-between mb-4">
      <h4>📝 Milestone Note</h4>
      <button class="btn btn-ghost btn-sm" onclick="window.closeNoteModal()" style="padding:4px 8px;border-radius:50%;font-size:1rem;">✕</button>
    </div>
    <div class="text-xs text-muted mb-3" id="note-modal-title">Add personal notes, targets, or reminders for this milestone.</div>
    <textarea id="note-input" class="input" rows="4"
      placeholder="E.g. 'Revise NCERT Chapter 12 before Sunday's mock test…'"
      style="resize:vertical;"></textarea>
    <div class="flex gap-3 mt-4">
      <button class="btn btn-ghost" style="flex:1;justify-content:center;" onclick="window.closeNoteModal()">Cancel</button>
      <button class="btn btn-primary" style="flex:2;justify-content:center;" onclick="window.saveNote()">💾 Save Note</button>
    </div>
  </div>
</div>
`;
}

// ── Progress Ring ─────────────────────────────────────────────
function renderProgressRing(pct, completed, total) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return `
  <div class="roadmap-ring-wrap">
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(255,255,255,0.9)"
              stroke-width="8" stroke-linecap="round"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
              transform="rotate(-90 60 60)"
              style="transition: stroke-dashoffset 1s ease;"/>
    </svg>
    <div class="roadmap-ring-text">
      <span class="roadmap-ring-pct">${pct}%</span>
      <span class="roadmap-ring-sub">${completed}/${total}</span>
    </div>
  </div>`;
}

// ── Stage Detail Panel ────────────────────────────────────────
function renderStageDetail(stageId, displayData, progress, currentStageId) {
  const stageMeta = ROADMAP_STAGES.find(s => s.id === stageId);
  if (!stageMeta) return '<div class="p-8 text-center text-muted">Select a stage to view details.</div>';

  const stageData = displayData.stages[stageId];
  const stageIdx = ROADMAP_STAGES.findIndex(s => s.id === stageId);
  const currentIdx = ROADMAP_STAGES.findIndex(s => s.id === currentStageId);
  const stageStatus = stageIdx < currentIdx ? 'past' : stageIdx === currentIdx ? 'current' : 'future';

  if (!stageData) {
    return `
    <div class="stage-detail-empty">
      <div style="font-size:3rem;margin-bottom:1rem;">${stageMeta.icon}</div>
      <h3>${stageMeta.label}</h3>
      <p class="text-muted mt-2">Detailed roadmap for ${stageMeta.label} is not defined for this career path yet.</p>
      <p class="text-muted text-sm mt-2">Check back or explore the timeline below.</p>
    </div>`;
  }

  const milestones = stageData.milestones || [];
  const completed = milestones.filter(m => progress.completedMilestones.includes(m.id)).length;
  const pct = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  const statusColor = stageStatus === 'current' ? 'var(--violet-light)' :
                      stageStatus === 'past' ? '#10B981' : 'var(--text-muted)';
  const statusLabel = stageStatus === 'current' ? '📍 Your Current Stage' :
                      stageStatus === 'past' ? '✅ Completed Stage' : '🔮 Future Stage';

  return `
  <div class="stage-detail-panel animate-scale-in">

    <!-- Stage Header -->
    <div class="stage-detail-header" style="border-color: ${statusColor}30;">
      <div class="flex items-center gap-4 flex-wrap justify-between">
        <div class="flex items-center gap-3">
          <div class="stage-detail-icon" style="background: ${statusColor}20; color: ${statusColor};">
            ${stageMeta.icon}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="stage-detail-title">${stageMeta.label}</h3>
              <span class="badge ${stageStatus === 'current' ? 'badge-violet' : stageStatus === 'past' ? 'badge-green' : 'badge-cyan'}"
                    style="font-size:0.65rem;">${statusLabel}</span>
            </div>
            <p class="text-muted text-xs mt-1">${stageMeta.subtitle}</p>
          </div>
        </div>
        ${milestones.length > 0 ? `
          <div class="text-center">
            <div class="fw-800 font-heading" style="font-size:1.75rem;color:${statusColor};">${pct}%</div>
            <div class="text-xs text-muted">Stage Progress</div>
          </div>
        ` : ''}
      </div>

      <!-- Stage Focus -->
      <div class="stage-focus-banner" style="background: ${statusColor}10; border-color: ${statusColor}30;">
        <span style="font-size:1rem;">🎯</span>
        <p class="text-sm fw-600" style="color:${statusColor};">${stageData.focus}</p>
      </div>

      ${milestones.length > 0 ? `
        <div class="progress-bar mt-3" style="height:6px;">
          <div class="progress-fill" style="width:${pct}%;background:${stageStatus === 'past' ? '#10B981' : 'var(--grad-hero)'};"></div>
        </div>
        <div class="text-xs text-muted mt-1">${completed} of ${milestones.length} milestones completed</div>
      ` : ''}
    </div>

    <!-- Tabs: Details / Milestones -->
    <div class="stage-tabs mt-4" id="stage-tabs">
      <button class="stage-tab active" onclick="window.switchStageTab('overview', this)">📖 Overview</button>
      <button class="stage-tab" onclick="window.switchStageTab('milestones', this)">✅ Milestones (${milestones.length})</button>
    </div>

    <!-- Overview Tab -->
    <div id="tab-overview" class="stage-tab-content">
      <div class="stage-info-grid">

        <!-- What to Learn -->
        ${stageData.whatToLearn?.length ? `
        <div class="stage-info-card">
          <div class="stage-info-card-header">
            <span>📚</span> What to Learn
          </div>
          <ul class="stage-info-list">
            ${stageData.whatToLearn.map(item => `
              <li class="stage-info-item">
                <span class="stage-info-bullet"></span>
                <span>${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>` : ''}

        <!-- Important Subjects -->
        ${stageData.importantSubjects?.length ? `
        <div class="stage-info-card">
          <div class="stage-info-card-header">
            <span>📐</span> Important Subjects
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            ${stageData.importantSubjects.map(s => `
              <span class="subject-pill">${s}</span>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Skills to Build -->
        ${stageData.skills?.length ? `
        <div class="stage-info-card">
          <div class="stage-info-card-header">
            <span>⚡</span> Skills to Build
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            ${stageData.skills.map(s => `
              <span class="skill-chip">${s}</span>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Key Exams -->
        ${stageData.exams?.length ? `
        <div class="stage-info-card">
          <div class="stage-info-card-header">
            <span>📅</span> Key Exams at This Stage
          </div>
          <ul class="stage-info-list">
            ${stageData.exams.map(e => `
              <li class="stage-info-item">
                <span class="stage-info-bullet exam-bullet"></span>
                <span>${e}</span>
              </li>
            `).join('')}
          </ul>
        </div>` : ''}

        <!-- Recommended Activities -->
        ${stageData.recommendedActivities?.length ? `
        <div class="stage-info-card stage-info-card-wide">
          <div class="stage-info-card-header">
            <span>🌟</span> Recommended Activities
          </div>
          <div class="activities-grid">
            ${stageData.recommendedActivities.map((act, i) => `
              <div class="activity-item">
                <div class="activity-num">${i + 1}</div>
                <p class="text-sm">${act}</p>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Possible Next Steps -->
        ${stageData.possibleNextSteps?.length ? `
        <div class="stage-info-card stage-info-card-wide" style="background:rgba(124,58,237,0.05);border-color:rgba(124,58,237,0.2);">
          <div class="stage-info-card-header" style="color:var(--violet-light);">
            <span>➡️</span> Possible Next Steps
          </div>
          <div class="next-steps-list">
            ${stageData.possibleNextSteps.map(step => `
              <div class="next-step-item">
                <span class="next-step-arrow">›</span>
                <span>${step}</span>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

      </div>
    </div>

    <!-- Milestones Tab -->
    <div id="tab-milestones" class="stage-tab-content hidden">
      ${milestones.length === 0
        ? `<div class="empty-state p-8 text-center">
             <div class="empty-icon">🎯</div>
             <p class="text-muted mt-2">No tracked milestones for this stage yet.</p>
           </div>`
        : `<div class="milestones-list mt-4">
            ${milestones.map(m => {
              const isComplete = progress.completedMilestones.includes(m.id);
              const note = store.getMilestoneNote(m.id);
              return `
              <div class="milestone-item-v2 ${isComplete ? 'completed' : ''}"
                   id="milestone-v2-${m.id}">
                <div class="milestone-check-area" onclick="window.toggleMilestone('${m.id}')">
                  <div class="milestone-checkbox-v2 ${isComplete ? 'done' : ''}">
                    ${isComplete ? '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>' : ''}
                  </div>
                </div>
                <div class="milestone-body" style="flex:1;" onclick="window.toggleMilestone('${m.id}')">
                  <div class="milestone-title-v2 ${isComplete ? 'strike' : ''}">${m.title}</div>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span class="badge ${m.priority === 'high' ? 'badge-red' : m.priority === 'medium' ? 'badge-amber' : 'badge-green'}" style="font-size:0.65rem;">${m.priority} priority</span>
                    <span class="text-xs text-muted">~${m.weeks} weeks</span>
                  </div>
                  ${note ? `<div class="milestone-note-chip">📝 ${escapeHtml(note)}</div>` : ''}
                </div>
                <button class="btn btn-ghost btn-sm milestone-note-btn"
                        onclick="event.stopPropagation(); window.addNote('${m.id}', '${m.title.replace(/'/g, '\\\'').replace(/"/g, '&quot;')}')"
                        title="Add / Edit Note">
                  📝
                </button>
              </div>`;
            }).join('')}
           </div>`
      }
    </div>

  </div>`;
}

// ── Full Timeline View ────────────────────────────────────────
function renderFullTimeline(displayData, progress, currentStageId) {
  const currentIdx = ROADMAP_STAGES.findIndex(s => s.id === currentStageId);

  return ROADMAP_STAGES.map((stageMeta, stageIdx) => {
    const stageData = displayData.stages[stageMeta.id];
    const milestones = stageData?.milestones || [];
    const completed = milestones.filter(m => progress.completedMilestones.includes(m.id)).length;
    const pct = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;
    const stageStatus = stageIdx < currentIdx ? 'past' : stageIdx === currentIdx ? 'current' : 'future';

    return `
    <div class="timeline-stage ${stageStatus} reveal" onclick="window.selectRoadmapStage('${stageMeta.id}')">
      <div class="timeline-stage-header">
        <span class="timeline-stage-icon ${stageStatus}">${stageMeta.icon}</span>
        <div class="flex-1">
          <div class="timeline-stage-label">${stageMeta.label}</div>
          <div class="text-xs text-muted">${stageMeta.subtitle}</div>
        </div>
        <div class="flex items-center gap-2">
          ${stageStatus === 'current' ? '<span class="badge badge-violet animate-pulse" style="font-size:0.6rem;">📍 You are here</span>' : ''}
          ${stageStatus === 'past' ? '<span class="badge badge-green" style="font-size:0.6rem;">✅ Past</span>' : ''}
          ${milestones.length > 0 ? `<span class="text-xs text-muted fw-600">${completed}/${milestones.length}</span>` : ''}
        </div>
      </div>

      ${stageData ? `
        <div class="timeline-stage-body card ${stageStatus === 'current' ? 'card-current' : ''}">
          <p class="text-sm fw-600 mb-3" style="color:${stageStatus === 'current' ? 'var(--violet-light)' : stageStatus === 'past' ? '#10B981' : 'var(--text-muted)'};">
            🎯 ${stageData.focus}
          </p>

          ${milestones.length > 0 ? `
            <div class="progress-bar mb-4" style="height:5px;">
              <div class="progress-fill" style="width:${pct}%;background:${stageStatus === 'past' ? '#10B981' : stageStatus === 'current' ? 'var(--grad-hero)' : 'var(--border)'};"></div>
            </div>
            <div class="timeline-milestones-grid">
              ${milestones.map(m => {
                const isComplete = progress.completedMilestones.includes(m.id);
                return `
                <div class="timeline-milestone-chip ${isComplete ? 'done' : stageStatus}"
                     onclick="event.stopPropagation(); window.toggleMilestone('${m.id}')"
                     id="tl-milestone-${m.id}">
                  <span class="tl-chip-check">${isComplete ? '✓' : (stageStatus === 'future' ? '○' : '·')}</span>
                  <span class="tl-chip-label">${m.title}</span>
                </div>`;
              }).join('')}
            </div>
          ` : '<p class="text-xs text-muted">No milestones defined for this stage.</p>'}

          <button class="btn btn-ghost btn-sm mt-3" onclick="event.stopPropagation(); window.selectRoadmapStage('${stageMeta.id}')">
            View Full Stage Details →
          </button>
        </div>
      ` : `
        <div class="timeline-stage-body card opacity-50">
          <p class="text-sm text-muted">Stage details not available for this career path.</p>
        </div>
      `}
    </div>`;
  }).join('');
}

// ── Global Handlers ───────────────────────────────────────────
let currentNoteId = null;

window.toggleMilestone = (id) => {
  store.toggleMilestone(id);
  const isComplete = store.isMilestoneComplete(id);

  // Update stage detail panel
  const detailEl = document.getElementById(`milestone-v2-${id}`);
  if (detailEl) {
    detailEl.classList.toggle('completed', isComplete);
    const cb = detailEl.querySelector('.milestone-checkbox-v2');
    if (cb) {
      cb.classList.toggle('done', isComplete);
      cb.innerHTML = isComplete
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>'
        : '';
    }
    const title = detailEl.querySelector('.milestone-title-v2');
    if (title) title.classList.toggle('strike', isComplete);
  }

  // Update full timeline chip
  const tlEl = document.getElementById(`tl-milestone-${id}`);
  if (tlEl) {
    tlEl.classList.toggle('done', isComplete);
    const chipCheck = tlEl.querySelector('.tl-chip-check');
    if (chipCheck) chipCheck.textContent = isComplete ? '✓' : '·';
  }

  // Update progress numbers in stage nav
  _refreshStageNavProgress();
  _refreshRoadmapProgressRing();
  const timeline = document.getElementById('roadmap-full-timeline');
  timeline?.querySelectorAll('.reveal').forEach((card) => card.classList.add('visible'));

  showToast(isComplete ? '✅ Milestone completed! Great work!' : '↩️ Milestone unmarked', isComplete ? 'success' : 'info');
};

window.selectRoadmapStage = (stageId) => {
  activeStageId = stageId;

  // Update stage nav active state
  document.querySelectorAll('.stage-nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`stage-nav-${stageId}`)?.classList.add('active');

  // Reload stage detail
  const profile = store.getProfile();
  const progress = store.getProgress();
  const currentStageId = mapClassToStage(profile?.class || '11');
  const displayData = _getCurrentDisplayData();

  const detailPanel = document.getElementById('roadmap-stage-detail');
  if (detailPanel) {
    detailPanel.innerHTML = renderStageDetail(stageId, displayData, progress, currentStageId);
  }
};

window.switchRoadmapCareer = (careerId) => {
  activeCareer = careerId;
  careerData = CAREER_ROADMAPS[careerId] || null;
  activeStageId = null;

  // Re-render the entire page
  const profile = store.getProfile();
  const careers = window.__careers || [];
  const currentStageId = mapClassToStage(profile?.class || '11');
  activeStageId = currentStageId;

  const progress = store.getProgress();
  const displayData = _getCurrentDisplayData(careers, careerId);

  // Update pill states
  document.querySelectorAll('.career-switch-pill').forEach(p => p.classList.remove('active'));
  document.getElementById(`career-pill-${careerId}`)?.classList.add('active');

  // Update hero gradient
  const hero = document.querySelector('.roadmap-hero');
  if (hero) hero.style.background = displayData.gradient || 'linear-gradient(135deg, #7C3AED, #06B6D4)';

  // Update title
  const heroTitle = document.querySelector('.roadmap-hero-title');
  if (heroTitle) heroTitle.textContent = displayData.title;

  const heroSub = document.querySelector('.roadmap-hero-sub');
  if (heroSub) heroSub.textContent = displayData.tagline || '';

  const heroEmoji = document.querySelector('.roadmap-hero-emoji');
  if (heroEmoji) heroEmoji.textContent = displayData.emoji || '🎯';

  // Refresh stage nav
  const nav = document.getElementById('roadmap-stage-nav');
  if (nav) {
    nav.innerHTML = `<div class="text-xs fw-700 uppercase mb-3" style="color:var(--text-muted);letter-spacing:.07em;padding:0 1.25rem;">Journey Stages</div>` +
      ROADMAP_STAGES.map(stage => {
        const sd = displayData.stages[stage.id];
        const mils = sd?.milestones || [];
        const done = mils.filter(m => progress.completedMilestones.includes(m.id)).length;
        const pct = mils.length ? Math.round((done / mils.length) * 100) : 0;
        const isActive = activeStageId === stage.id;
        const stageIdx = ROADMAP_STAGES.findIndex(s => s.id === stage.id);
        const currentIdxN = ROADMAP_STAGES.findIndex(s => s.id === currentStageId);
        const stageStatus = stageIdx < currentIdxN ? 'past' : stageIdx === currentIdxN ? 'current' : 'future';
        const isCurrent = currentStageId === stage.id;

        return `
          <button class="stage-nav-item ${isActive ? 'active' : ''} ${stageStatus}"
                  onclick="window.selectRoadmapStage('${stage.id}')"
                  id="stage-nav-${stage.id}">
            <div class="stage-nav-icon ${stageStatus}">${stage.icon}</div>
            <div class="stage-nav-info">
              <div class="stage-nav-label">${stage.label}</div>
              <div class="stage-nav-sub">${stage.subtitle}</div>
              ${mils.length > 0 ? `
                <div class="stage-nav-progress">
                  <div class="stage-nav-bar">
                    <div class="stage-nav-fill ${stageStatus}" style="width:${pct}%"></div>
                  </div>
                  <span class="stage-nav-count">${done}/${mils.length}</span>
                </div>
              ` : ''}
            </div>
            ${isCurrent ? '<span class="current-dot"></span>' : ''}
          </button>`;
      }).join('');
  }

  // Refresh detail panel
  const detailPanel = document.getElementById('roadmap-stage-detail');
  if (detailPanel) {
    detailPanel.innerHTML = renderStageDetail(activeStageId, displayData, progress, currentStageId);
  }

  // Refresh full timeline
  const fullTimeline = document.getElementById('roadmap-full-timeline');
  if (fullTimeline) {
    fullTimeline.innerHTML = renderFullTimeline(displayData, progress, currentStageId);
    fullTimeline.querySelectorAll('.reveal').forEach((card) => card.classList.add('visible'));
  }

  // Update progress ring
  const allMils = Object.values(displayData.stages).flatMap(s => s?.milestones || []);
  const allDone = allMils.filter(m => progress.completedMilestones.includes(m.id)).length;
  const pct = allMils.length ? Math.round((allDone / allMils.length) * 100) : 0;

  const ringWrap = document.querySelector('.roadmap-ring-wrap');
  if (ringWrap) ringWrap.outerHTML = renderProgressRing(pct, allDone, allMils.length);

  showToast(`Switched to ${displayData.emoji} ${displayData.title} roadmap`, 'info');
};

window.switchStageTab = (tab, btn) => {
  document.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  document.getElementById('tab-overview')?.classList.toggle('hidden', tab !== 'overview');
  document.getElementById('tab-milestones')?.classList.toggle('hidden', tab !== 'milestones');
};

window.addNote = (id, title = '') => {
  currentNoteId = id;
  const note = store.getMilestoneNote(id);
  const modal = document.getElementById('note-modal');
  const input = document.getElementById('note-input');
  const titleEl = document.getElementById('note-modal-title');
  if (modal) modal.classList.remove('hidden');
  if (input) input.value = note;
  if (titleEl && title) titleEl.textContent = `Note for: "${title}"`;
  setTimeout(() => input?.focus(), 100);
};

window.closeNoteModal = (e) => {
  if (e && e.target !== document.getElementById('note-modal')) return;
  document.getElementById('note-modal')?.classList.add('hidden');
  currentNoteId = null;
};

window.saveNote = () => {
  if (!currentNoteId) return;
  const note = document.getElementById('note-input')?.value?.trim() || '';
  store.saveMilestoneNote(currentNoteId, note);
  document.getElementById('note-modal')?.classList.add('hidden');

  // Update note chip in milestone item
  const el = document.getElementById(`milestone-v2-${currentNoteId}`);
  if (el) {
    let noteChip = el.querySelector('.milestone-note-chip');
    if (note) {
      if (noteChip) {
        noteChip.textContent = '📝 ' + note;
      } else {
        noteChip = document.createElement('div');
        noteChip.className = 'milestone-note-chip';
        noteChip.textContent = '📝 ' + note;
        el.querySelector('.milestone-body')?.appendChild(noteChip);
      }
    } else if (noteChip) {
      noteChip.remove();
    }
  }

  showToast(note ? '📝 Note saved!' : '🗑️ Note removed', 'success');
  currentNoteId = null;
};

// ── Helpers ────────────────────────────────────────────────────
function _getCurrentDisplayData(careers, careerId) {
  careerId = careerId || activeCareer;
  careerData = CAREER_ROADMAPS[careerId] || null;
  const careersArr = careers || window.__careers || [];
  const careersJsonEntry = careersArr.find(c => c.id === careerId);

  return careerData || {
    title: careersJsonEntry?.title || 'Career',
    emoji: careersJsonEntry?.emoji || '🎯',
    gradient: careersJsonEntry?.gradient || 'linear-gradient(135deg, #7C3AED, #06B6D4)',
    tagline: careersJsonEntry?.tagline || '',
    stages: Object.fromEntries(
      Object.entries(careersJsonEntry?.stages || {}).map(([k, v]) => [mapClassToStage(k), v])
    )
  };
}

function _refreshStageNavProgress() {
  const progress = store.getProgress();
  const displayData = _getCurrentDisplayData();

  ROADMAP_STAGES.forEach(stage => {
    const navItem = document.getElementById(`stage-nav-${stage.id}`);
    if (!navItem) return;
    const stageData = displayData.stages[stage.id];
    const mils = stageData?.milestones || [];
    const done = mils.filter(m => progress.completedMilestones.includes(m.id)).length;
    const pct = mils.length ? Math.round((done / mils.length) * 100) : 0;
    const fill = navItem.querySelector('.stage-nav-fill');
    const count = navItem.querySelector('.stage-nav-count');
    if (fill) fill.style.width = pct + '%';
    if (count) count.textContent = `${done}/${mils.length}`;
  });
}

function _refreshRoadmapProgressRing() {
  const displayData = _getCurrentDisplayData();
  const allMilestones = Object.values(displayData.stages || {}).flatMap((stage) => stage?.milestones || []);
  const completed = allMilestones.filter((milestone) => store.isMilestoneComplete(milestone.id)).length;
  const pct = allMilestones.length ? Math.round((completed / allMilestones.length) * 100) : 0;
  const ring = document.querySelector('.roadmap-ring-wrap');
  if (ring) ring.outerHTML = renderProgressRing(pct, completed, allMilestones.length);
}
