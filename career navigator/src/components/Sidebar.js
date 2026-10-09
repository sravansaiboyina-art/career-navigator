// src/components/Sidebar.js — Responsive Navigation Sidebar for App Views
import { store } from '../store.js';
import { escapeHtml } from '../utils/safeHtml.js';

export function renderSidebar(activePath) {
  const profile = store.getProfile();
  if (!profile) return '';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', badge: '' },
    { path: '/profile', label: 'Student Profile', icon: '👤', badge: 'New' },
    { path: '/explore', label: 'Explore Careers', icon: '🌐', badge: '' },
    { path: '/roadmap', label: 'Roadmap', icon: '🗺️', badge: '' },
    { path: '/exams', label: 'Exam Tracker', icon: '📅', badge: '' },
    { path: '/opportunities', label: 'Opportunities', icon: '💰', badge: '' },
    { path: '/progress', label: 'Progress & Stats', icon: '📊', badge: '' },
    { path: '/assistant', label: 'AI Assistant', icon: '🤖', badge: 'New' },
  ];

  const stageLabel = store.getStageLabel(profile.class);
  const isCollapsed = localStorage.getItem('cn_sidebar_collapsed') === 'true';

  return `
  <aside class="app-sidebar ${isCollapsed ? 'collapsed' : ''}" id="app-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-student-summary">
        <div class="student-avatar-badge">${escapeHtml(profile.name?.[0] || 'S')}</div>
        <div class="student-info-text">
          <div class="student-name truncate">${escapeHtml(profile.name || 'Student')}</div>
          <div class="student-stage-badge">${stageLabel}</div>
        </div>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="sidebar-nav">
      <div class="sidebar-section-title">Navigation</div>
      ${navItems.map(item => {
    const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path + '/'));
    return `
          <a class="sidebar-link ${isActive ? 'active' : ''}"
             onclick="window.navigateTo('${item.path}')"
             href="#${item.path}"
             title="${item.label}">
            <span class="sidebar-icon">${item.icon}</span>
            <span class="sidebar-label">${item.label}</span>
            ${item.badge ? `<span class="sidebar-badge">${item.badge}</span>` : ''}
          </a>
        `;
  }).join('')}
    </nav>

    <!-- Sidebar Footer / Quick Switcher -->
    <div class="sidebar-footer">
      <div class="sidebar-persona-card">
        <div class="text-xs text-muted mb-1">Switch Stage / Persona</div>
        <select class="input select select-sm" onchange="window.switchDemoPersona(this.value)" id="sidebar-persona-select" style="font-size:0.75rem;padding:4px 8px;">
          <option value="neet" ${profile.selectedCareer === 'medicine' ? 'selected' : ''}>🩺 Cl.11 NEET (Priya)</option>
          <option value="jee" ${profile.selectedCareer === 'engineering' ? 'selected' : ''}>💻 Cl.12 JEE (Rohan)</option>
          <option value="upsc" ${profile.selectedCareer === 'upsc' ? 'selected' : ''}>🏛️ UG UPSC (Ananya)</option>
          <option value="cl8" ${profile.class === '8' ? 'selected' : ''}>🎒 Cl.8 Foundation (Kabir)</option>
          <option value="bank" ${profile.selectedCareer === 'banking' ? 'selected' : ''}>🏦 Graduate Banking (Neha)</option>
        </select>
      </div>

      <button class="btn btn-ghost btn-sm w-full mt-2" onclick="window.navigateTo('/profile')" style="font-size:0.75rem;justify-content:center;">
        ⚙️ Manage Account
      </button>
    </div>
  </aside>
  `;
}

if (typeof window !== 'undefined') {
  window.toggleSidebar = () => {
    const sidebar = document.getElementById('app-sidebar');
    const layout = document.getElementById('app-layout-root');
    if (!sidebar) return;

    const isCollapsed = sidebar.classList.toggle('collapsed');
    if (layout) layout.classList.toggle('sidebar-collapsed', isCollapsed);
    localStorage.setItem('cn_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  };
}
