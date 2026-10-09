// src/pages/CareerExplorer.js — Career Exploration Page
import { store } from '../store.js';

let activeFilter = 'all';
let searchQuery = '';

export function renderCareerExplorer(careers) {
  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 2rem);padding-bottom:4rem;">

    <div class="page-header">
      <div class="page-header-inner">
        <div>
          <div class="text-xs uppercase fw-700 mb-1" style="color:var(--violet-light);letter-spacing:0.06em;">Phase 1 Discovery</div>
          <h2>🌐 Explore Career Pathways</h2>
          <p class="mt-2 text-muted">Comprehensive, stage-mapped career guides tailored for Indian students from Class 6 through college graduation.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="window.navigateTo('/onboarding')">
            ✨ Take Career Quiz
          </button>
        </div>
      </div>
    </div>

    <!-- Search + Filter Strip -->
    <div class="card mb-8 p-4" style="background:var(--bg-glass);border-color:var(--border);">
      <div class="flex gap-4 flex-wrap items-center">
        <div class="search-bar" style="flex:1;min-width:260px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input id="career-search" class="input" type="text" placeholder="Search by career, exam (e.g. NEET, JEE, UPSC) or skills..." oninput="window.filterCareers()" />
        </div>
        <div class="filter-bar flex gap-2 flex-wrap">
          ${[
            ['all', '✨ All Streams'],
            ['science', '🔬 Science / STEM'],
            ['commerce', '💼 Commerce & Banking'],
            ['arts', '🏛️ Arts & Humanities'],
            ['any', '🌐 Any Stream Eligible']
          ].map(([f, l]) => `
            <div class="filter-chip ${activeFilter === f ? 'active' : ''}" 
                 onclick="window.setCareerFilter('${f}')">
              ${l}
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Career Cards Grid -->
    <div class="grid-auto" id="careers-grid">
      ${renderCareerCards(careers)}
    </div>

  </div>
</div>`;
}

function renderCareerCards(careers) {
  const profile = store.getProfile();
  const filtered = (careers || []).filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = q === '' ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.tagline || '').toLowerCase().includes(q) ||
      (c.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (c.keyExams || []).some(e => e.toLowerCase().includes(q));

    let matchFilter = true;
    if (activeFilter === 'science') {
      matchFilter = (c.eligibleStreams || []).includes('science');
    } else if (activeFilter === 'commerce') {
      matchFilter = (c.eligibleStreams || []).includes('commerce') || (c.eligibleStreams || []).includes('any');
    } else if (activeFilter === 'arts') {
      matchFilter = (c.eligibleStreams || []).includes('arts') || (c.eligibleStreams || []).includes('any');
    } else if (activeFilter === 'any') {
      matchFilter = (c.eligibleStreams || []).includes('any');
    }

    return matchSearch && matchFilter;
  });

  if (filtered.length === 0) {
    return `
      <div class="empty-state p-8 text-center" style="grid-column: 1 / -1;">
        <div class="empty-icon" style="font-size:3rem;margin-bottom:1rem;">🔍</div>
        <h3>No matching careers found</h3>
        <p class="text-muted mt-2 mb-4">Try searching for keywords like "doctor", "coding", "JEE", or "civil services".</p>
        <button class="btn btn-secondary btn-sm" onclick="window.clearCareerFilters()">Clear All Filters</button>
      </div>
    `;
  }

  return filtered.map((c, i) => {
    const isSelected = profile?.selectedCareer === c.id;
    return `
    <div class="career-card reveal delay-${Math.min(i + 1, 8)} ${isSelected ? 'selected' : ''}"
         onclick="window.navigateTo('/career/${c.id}')"
         style="cursor:pointer;position:relative;">
      
      ${isSelected ? `
        <div class="badge badge-amber" style="position:absolute;top:1rem;right:1rem;z-index:2;font-size:0.65rem;">
          ⭐ Selected Goal
        </div>
      ` : ''}

      <div class="career-card-header">
        <div class="career-card-emoji">${c.emoji || '🎯'}</div>
        <h3 class="font-heading" style="font-size:1.15rem;margin-top:0.5rem;">${c.title}</h3>
        <p class="text-muted text-sm mt-1" style="font-size:0.85rem;line-height:1.4;">${c.tagline}</p>
        
        <div class="flex flex-wrap gap-1 mt-3">
          ${(c.tags || []).slice(0, 3).map(t => `<span class="tag" style="font-size:0.7rem;">${t}</span>`).join('')}
        </div>
      </div>

      <div class="career-card-footer mt-4 pt-3 border-t border-border flex items-center justify-between">
        <div>
          <div class="text-xs text-muted">Est. Package</div>
          <div class="fw-700 text-xs" style="color:var(--text-primary);margin-top:2px;">💰 ${c.avgSalary ? c.avgSalary.split('/')[0] : 'Competitive'}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();window.navigateTo('/career/${c.id}')">
          View Roadmap →
        </button>
      </div>
    </div>`;
  }).join('');
}

// Global Handlers
if (typeof window !== 'undefined') {
  window.setCareerFilter = (f) => {
    activeFilter = f;
    document.querySelectorAll('.filter-chip').forEach(el => {
      el.classList.toggle('active', el.getAttribute('onclick')?.includes(`'${f}'`));
    });
    const grid = document.getElementById('careers-grid');
    if (grid) grid.innerHTML = renderCareerCards(window.__careers || []);
  };

  window.filterCareers = () => {
    searchQuery = document.getElementById('career-search')?.value || '';
    const grid = document.getElementById('careers-grid');
    if (grid) grid.innerHTML = renderCareerCards(window.__careers || []);
  };

  window.clearCareerFilters = () => {
    activeFilter = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('career-search');
    if (searchInput) searchInput.value = '';
    window.setCareerFilter('all');
  };
}
