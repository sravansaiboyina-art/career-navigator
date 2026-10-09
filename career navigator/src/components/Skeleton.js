// src/components/Skeleton.js — Loading Skeleton Components

export function renderDashboardSkeleton() {
  return `
    <div class="dashboard-skeleton page-enter">
      <!-- Hero Banner Skeleton -->
      <div class="skeleton skeleton-banner mb-8" style="height: 180px; border-radius: var(--radius-2xl);"></div>
      
      <!-- Stats Row Skeleton -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
        ${[1, 2, 3, 4].map(() => `
          <div class="skeleton" style="height: 90px; border-radius: var(--radius-xl);"></div>
        `).join('')}
      </div>

      <!-- Quick Actions Skeleton -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
        ${[1, 2, 3, 4].map(() => `
          <div class="skeleton" style="height: 50px; border-radius: var(--radius-lg);"></div>
        `).join('')}
      </div>

      <!-- Two Column Content Skeleton -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="skeleton" style="height: 320px; border-radius: var(--radius-xl);"></div>
        <div class="skeleton" style="height: 320px; border-radius: var(--radius-xl);"></div>
      </div>
    </div>
  `;
}

export function renderCareerCardSkeleton(count = 6) {
  return Array.from({ length: count }).map(() => `
    <div class="skeleton-card" style="height: 240px; border-radius: var(--radius-xl); background: var(--bg-card); border: 1px solid var(--border); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div class="skeleton" style="width: 44px; height: 44px; border-radius: var(--radius-lg); margin-bottom: 1rem;"></div>
        <div class="skeleton" style="width: 65%; height: 20px; border-radius: 4px; margin-bottom: 0.75rem;"></div>
        <div class="skeleton" style="width: 90%; height: 14px; border-radius: 4px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton" style="width: 45%; height: 14px; border-radius: 4px;"></div>
      </div>
      <div class="flex justify-between items-center pt-4">
        <div class="skeleton" style="width: 30%; height: 16px; border-radius: 4px;"></div>
        <div class="skeleton" style="width: 25%; height: 32px; border-radius: var(--radius-md);"></div>
      </div>
    </div>
  `).join('');
}
