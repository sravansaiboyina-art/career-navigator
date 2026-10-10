// src/components/Navbar.js — Reusable Navigation Bar
import { store } from '../store.js';
import { dbStatus } from '../db/config.js';
import { escapeHtml } from '../utils/safeHtml.js';

export function renderNavbar(activePath) {
  const profile = store.getProfile();
  const user = store.getUser();
  const initials = profile?.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'CN';
  const stageLabel = profile?.class ? store.getStageLabel(profile.class) : '';
  const status = dbStatus.getStatus();

  // Guest nav vs Authenticated nav
  const guestLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore Careers', icon: '🌐' },
  ];

  return `
  <nav class="navbar" id="navbar">
    <div class="navbar-inner">
      <div class="flex items-center gap-3">
        ${profile ? `
          <button class="sidebar-toggle-btn" id="sidebar-toggle" onclick="window.toggleSidebar()" title="Toggle Sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        ` : ''}

        <div class="navbar-brand" onclick="window.navigateTo(${profile ? "'/dashboard'" : "'/'"})" id="nav-brand">
          <div class="navbar-logo">🧭</div>
          <span class="font-heading">Career Navigator</span>
          <span class="badge badge-sm badge-violet" style="font-size: 0.65rem; padding: 2px 6px;">Phase 1</span>
        </div>
      </div>

      <!-- Public Nav Links (When on landing/public pages) -->
      ${!profile ? `
        <ul class="navbar-nav" id="navbar-nav">
          ${guestLinks.map(l => `
            <li>
              <a class="nav-link ${activePath === l.path ? 'active' : ''}"
                 onclick="window.navigateTo('${l.path}')" href="#${l.path}">
                ${l.label}
              </a>
            </li>
          `).join('')}
        </ul>
      ` : `
        <!-- Quick Search Bar for authenticated views -->
        <div class="navbar-search hidden-mobile" onclick="window.navigateTo('/explore')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Search careers, exams, scholarships...</span>
          <kbd style="font-size:0.65rem;padding:1px 5px;background:var(--bg-card);border:1px solid var(--border);border-radius:4px;color:var(--text-muted);">Ctrl K</kbd>
        </div>
      `}

      <!-- Right Actions -->
      <div class="navbar-actions flex items-center gap-3">
        <!-- DB State Indicator -->
        <div class="db-status-pill text-xs flex items-center gap-1.5" title="Storage Driver: ${status.driver} (${status.state})">
          <span class="status-dot ${status.isConnected ? 'online' : 'connecting'}"></span>
          <span class="text-muted hidden-mobile" style="font-size:0.7rem;">${status.driver.toUpperCase()}</span>
        </div>

        ${profile ? `
          <div class="nav-user-dropdown" style="position:relative;">
            <div class="navbar-avatar flex items-center justify-center cursor-pointer" 
                 onclick="window.toggleUserMenu()" 
                 id="navbar-avatar-btn"
                 title="${escapeHtml(profile.name)} (${escapeHtml(stageLabel)})">
              ${initials}
            </div>
            
            <div class="user-menu-dropdown hidden" id="user-menu-dropdown">
              <div class="p-3 border-b border-border">
                <div class="fw-700 text-sm">${escapeHtml(profile.name)}</div>
                <div class="text-xs text-muted">${escapeHtml(user?.email || 'student@career-navigator.in')}</div>
                <div class="mt-2 flex gap-1 flex-wrap">
                  <span class="badge badge-sm badge-violet">${stageLabel}</span>
                  ${profile.stream !== 'na' ? `<span class="badge badge-sm badge-cyan">${escapeHtml(profile.stream)}</span>` : ''}
                </div>
              </div>
              <div class="p-2 flex-col gap-1">
                <a class="dropdown-item" onclick="window.navigateTo('/profile');window.toggleUserMenu(false);">
                  <span>👤</span> Student Profile
                </a>
                <a class="dropdown-item" onclick="window.navigateTo('/dashboard');window.toggleUserMenu(false);">
                  <span>🏠</span> Dashboard
                </a>
                <a class="dropdown-item" onclick="window.navigateTo('/explore');window.toggleUserMenu(false);">
                  <span>🌐</span> Explore Careers
                </a>
                <div class="border-t border-border my-1"></div>
                <a class="dropdown-item text-red" onclick="window.handleLogout();window.toggleUserMenu(false);">
                  <span>🚪</span> Log Out
                </a>
              </div>
            </div>
          </div>
        ` : `
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-sm" onclick="window.navigateTo('/auth?mode=login')">Log In</button>
            <button class="btn btn-primary btn-sm" onclick="window.navigateTo('/onboarding')">Get Started</button>
          </div>
        `}
      </div>
    </div>
  </nav>
  `;
}

// User Menu toggle helper
if (typeof window !== 'undefined') {
  window.toggleUserMenu = (forceState) => {
    const menu = document.getElementById('user-menu-dropdown');
    if (!menu) return;
    if (typeof forceState === 'boolean') {
      menu.classList.toggle('hidden', !forceState);
    } else {
      menu.classList.toggle('hidden');
    }
  };

  // Close dropdown on outside click
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-user-dropdown')) {
      const menu = document.getElementById('user-menu-dropdown');
      if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
      }
    }
  });
}
