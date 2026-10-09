// pages/Progress.js
import { store } from '../store.js';
import { Chart } from 'chart.js/auto';
import { CAREER_ROADMAPS, ROADMAP_STAGES, mapClassToStage } from '../data/roadmapData.js';

let chartInstance = null;

export function getProgressStageData(careers = []) {
  const profile = store.getProfile();
  const selectedId = profile?.selectedCareer || careers[0]?.id;
  const roadmap = CAREER_ROADMAPS[selectedId];
  const progress = store.getProgress();
  return ROADMAP_STAGES.map((stageMeta) => {
    const stage = roadmap?.stages?.[stageMeta.id];
    const milestones = stage?.milestones || [];
    const completed = milestones.filter(milestone => progress.completedMilestones.includes(milestone.id)).length;
    return {
      stage: stageMeta.id,
      label: stageMeta.label,
      total: milestones.length,
      completed,
      pct: milestones.length ? Math.round((completed / milestones.length) * 100) : 0
    };
  });
}

export function renderProgress(careers) {
  const profile = store.getProfile();
  const progress = store.getProgress();
  const selectedId = profile?.selectedCareer || careers[0]?.id;
  const roadmap = CAREER_ROADMAPS[selectedId];
  const stageData = getProgressStageData(careers);
  const allMilestones = stageData.flatMap((item) => roadmap?.stages?.[item.stage]?.milestones || []);
  const totalCompleted = allMilestones.filter(milestone => progress.completedMilestones.includes(milestone.id)).length;
  const overallPct = allMilestones.length ? Math.round((totalCompleted / allMilestones.length) * 100) : 0;
  const savedCount = progress.savedOpportunities.length;

  const highCompleted = allMilestones.filter(milestone =>
    milestone.priority === 'high' && progress.completedMilestones.includes(milestone.id)
  ).length;
  const highTotal = allMilestones.filter(milestone => milestone.priority === 'high').length;
  const currentStageIndex = ROADMAP_STAGES.findIndex(stage => stage.id === mapClassToStage(String(profile?.class || '11')));

  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;">
    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <h2>📊 My Progress</h2>
          <p class="mt-2">Track your journey across all stages and milestones.</p>
        </div>
        <button class="btn btn-secondary" onclick="window.navigateTo('/roadmap')">View Roadmap →</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-bottom:2rem;">
      ${[
        ['🎯', overallPct + '%', 'Overall Progress'],
        ['✅', totalCompleted, 'Milestones Done'],
        ['⚡', highCompleted + '/' + highTotal, 'High Priority'],
        ['⭐', savedCount, 'Saved Opportunities'],
      ].map(([icon, val, label]) => `
        <div class="stat-box reveal">
          <div style="font-size:1.75rem;margin-bottom:0.5rem;">${icon}</div>
          <div class="stat-value">${val}</div>
          <div class="stat-label">${label}</div>
        </div>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;">
      <div class="card reveal">
        <h4 class="mb-6">📈 Stage-by-Stage Progress</h4>
        <canvas id="progress-chart" height="280"></canvas>
      </div>

      <div class="flex-col gap-4">
        <div class="card reveal" style="text-align:center;">
          <h4 class="mb-4">Overall Completion</h4>
          <div class="progress-ring-container" style="margin:0 auto;">
            <svg width="160" height="160" class="progress-ring">
              <circle cx="80" cy="80" r="65" fill="none" stroke="var(--border)" stroke-width="12"/>
              <circle cx="80" cy="80" r="65" fill="none" stroke="url(#ring-grad)" stroke-width="12"
                stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 65}"
                stroke-dashoffset="${2 * Math.PI * 65 * (1 - overallPct/100)}"
                transform="rotate(-90 80 80)" style="transition:stroke-dashoffset 1s ease;"/>
              <defs><linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#7C3AED"/><stop offset="100%" style="stop-color:#06B6D4"/>
              </linearGradient></defs>
            </svg>
            <div class="progress-ring-text"><span class="ring-value">${overallPct}%</span><span class="ring-label">Complete</span></div>
          </div>
          <p class="text-sm text-muted mt-4">${totalCompleted} of ${allMilestones.length} milestones</p>
        </div>

        <div class="card reveal">
          <h4 class="mb-4">Priority Breakdown</h4>
          ${[['high','🔴 High Priority','badge-red'],['medium','🟡 Medium','badge-amber'],['low','🟢 Low','badge-green']].map(([priority, label, badge]) => {
            const milestones = allMilestones.filter(milestone => milestone.priority === priority);
            const completed = milestones.filter(milestone => progress.completedMilestones.includes(milestone.id)).length;
            const pct = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;
            return `<div class="mb-4">
              <div class="flex justify-between text-xs mb-2"><span class="badge ${badge}">${label}</span><span class="text-muted">${completed}/${milestones.length}</span></div>
              <div class="progress-bar" style="height:6px;"><div class="progress-fill" style="width:${pct}%;"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="card mt-6 reveal">
      <h4 class="mb-4">Stage Breakdown</h4>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left;padding:0.75rem 1rem;font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;">Stage</th>
            <th style="text-align:center;padding:0.75rem 1rem;font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;">Total</th>
            <th style="text-align:center;padding:0.75rem 1rem;font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;">Done</th>
            <th style="text-align:left;padding:0.75rem 1rem;font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;">Progress</th>
            <th style="text-align:center;padding:0.75rem 1rem;font-size:0.8rem;color:var(--text-muted);text-transform:uppercase;">Status</th>
          </tr></thead>
          <tbody>
            ${stageData.map(sd => {
              const stageIdx = ROADMAP_STAGES.findIndex(stage => stage.id === sd.stage);
              const status = stageIdx < currentStageIndex ? 'past' : stageIdx === currentStageIndex ? 'current' : 'future';
              return `<tr style="border-bottom:1px solid var(--border);" onmouseenter="this.style.background='var(--bg-glass)'" onmouseleave="this.style.background='transparent'">
                <td style="padding:0.875rem 1rem;"><div class="fw-600 font-heading">${sd.label}</div></td>
                <td style="text-align:center;padding:0.875rem 1rem;color:var(--text-muted);">${sd.total}</td>
                <td style="text-align:center;padding:0.875rem 1rem;font-weight:600;color:${sd.completed > 0 ? 'var(--green-light)' : 'var(--text-muted)'};">${sd.completed}</td>
                <td style="padding:0.875rem 1rem;min-width:120px;">
                  <div class="progress-bar" style="height:6px;"><div class="progress-fill" style="width:${sd.pct}%;"></div></div>
                  <div class="text-xs text-muted mt-1">${sd.pct}%</div>
                </td>
                <td style="text-align:center;padding:0.875rem 1rem;"><span class="badge ${status==='current'?'badge-violet':status==='past'?'badge-green':'badge-cyan'}">${status==='current'?'📍 Now':status==='past'?'✅ Earlier stage':'⏳ Later'}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${totalCompleted > 0 ? `<div class="card mt-6 reveal">
      <h4 class="mb-4">🏆 Completed Milestones</h4>
      <div class="flex-col gap-2">
        ${allMilestones.filter(milestone => progress.completedMilestones.includes(milestone.id)).map(milestone => `
          <div class="flex items-center gap-3 p-3" style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-lg);">
            <div style="width:22px;height:22px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <span class="text-sm fw-600">${milestone.title}</span>
            <span class="badge badge-green" style="margin-left:auto;font-size:0.6rem;">${milestone.priority}</span>
          </div>`).join('')}
      </div>
    </div>` : ''}
  </div>
</div>`;
}

export function initProgressChart(stageData) {
  const canvas = document.getElementById('progress-chart');
  if (!canvas) return;
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: stageData.map(s => s.label),
      datasets: [{
        label: 'Completed',
        data: stageData.map(s => s.completed),
        backgroundColor: 'rgba(124,58,237,0.7)',
        borderColor: '#7C3AED',
        borderWidth: 2,
        borderRadius: 6,
      }, {
        label: 'Remaining',
        data: stageData.map(s => s.total - s.completed),
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94A3B8', font: { family: 'Inter', size: 12 } } },
        tooltip: {
          backgroundColor: '#131929',
          titleColor: '#F1F5F9',
          bodyColor: '#94A3B8',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
        }
      },
      scales: {
        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94A3B8' } },
        y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94A3B8', stepSize: 1 }, beginAtZero: true }
      }
    }
  });
}
