// src/main.js — App Bootstrap, Router, Layout, DB Connection & Toast System

import './styles/index.css';
import './styles/animations.css';
import './styles/components.css';

import { router } from './router.js';
import { store } from './store.js';
import { db } from './db/index.js';
import { env } from './config/env.js';
import { showToast } from './components/Toast.js';
export { showToast };

import { renderNavbar } from './components/Navbar.js';
import { renderSidebar } from './components/Sidebar.js';

import { renderLanding } from './pages/Landing.js';
import { renderAuth } from './pages/Auth.js';
import { renderOnboarding } from './pages/Onboarding.js';
import { renderProfile } from './pages/Profile.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderCareerExplorer } from './pages/CareerExplorer.js';
import { renderCareerDetail } from './pages/CareerDetail.js';
import { renderRoadmap } from './pages/Roadmap.js';
import { renderExams } from './pages/Exams.js';
import { renderOpportunities } from './pages/Opportunities.js';
import { renderProgress, initProgressChart, getProgressStageData } from './pages/Progress.js';
import { renderAIAssistant } from './pages/AIAssistant.js';
import { renderOpportunityDetail } from './pages/OpportunityDetail.js';

// ── State / Datasets ──────────────────────────────────────────
let careers = [];
let exams = [];
let opportunities = [];

async function loadData() {
  const [c, e, o] = await Promise.all([
    fetch('/data/careers.json').then(r => r.json()),
    fetch('/data/exams.json').then(r => r.json()),
    fetch('/data/opportunities.json').then(r => r.json()),
  ]);
  careers = c;
  exams = e;
  opportunities = o;
  window.__careers = careers;
  window.__exams = exams;
  window.__opportunities = opportunities;
}

// ── Render Page with Layout ────────────────────────────────────
function setPage(html, path) {
  const app = document.getElementById('app');
  const profile = store.getProfile();

  // List of paths that should display the App Sidebar when logged in
  const sidebarRoutes = [
    '/dashboard',
    '/profile',
    '/explore',
    '/career',
    '/roadmap',
    '/exams',
    '/opportunities',
    '/progress',
    '/assistant',
    '/opportunity'
  ];
  const showSidebar = profile && sidebarRoutes.some(r => path === r || path.startsWith(r + '/'));

  if (showSidebar) {
    const isCollapsed = localStorage.getItem('cn_sidebar_collapsed') === 'true';
    app.innerHTML = `
      ${renderNavbar(path)}
      <div class="app-layout-root ${isCollapsed ? 'sidebar-collapsed' : ''}" id="app-layout-root">
        ${renderSidebar(path)}
        <main class="app-main-content" id="page-content">
          ${html}
        </main>
      </div>
    `;
  } else {
    app.innerHTML = `
      ${renderNavbar(path)}
      <main id="page-content">
        ${html}
      </main>
    `;
  }

  // Scroll reveal
  initScrollReveal();
  // Navbar scroll effect
  initNavbarScroll();
  // Lucide icons
  if (window.lucide) lucide.createIcons();
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ── Routing ───────────────────────────────────────────────────
function setupRoutes() {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/roadmap',
    '/exams',
    '/opportunities',
    '/progress',
    '/assistant',
    '/opportunity'
  ];
  router.register('/opportunity', (path) => {
    const opportunityId = path.startsWith('/opportunity/')
      ? decodeURIComponent(path.slice('/opportunity/'.length))
      : '';
    const opportunity = opportunities.find((item) => item.id === opportunityId);

    if (!opportunityId || !opportunity) {
      setPage(renderOpportunityDetail(null), '/opportunity');
      return;
    }

    setPage(renderOpportunityDetail(opportunity), '/opportunity/' + encodeURIComponent(opportunityId));
  });

  router.before((path) => {
    // If accessing protected routes without a student profile, redirect to auth or onboarding
    const isProtected = protectedRoutes.some((routePath) => path === routePath || path.startsWith(routePath + '/'));
    if (isProtected && !store.hasProfile()) {
      showToast('Please log in or create a profile to access this section.', 'info');
      router.navigate('/auth', true);
      return false;
    }
    return true;
  });

  router.register('/', () => {
    if (store.hasProfile()) {
      router.navigate('/dashboard', true);
      return;
    }
    setPage(renderLanding(careers, exams, opportunities), '/');
  });

  // Auth routes (Login & Signup)
  router.register('/auth', (path, params) => {
    setPage(renderAuth(params), '/auth');
  });

  router.register('/login', () => {
    setPage(renderAuth({ mode: 'login' }), '/login');
  });

  router.register('/signup', () => {
    setPage(renderAuth({ mode: 'signup' }), '/signup');
  });

  // Student Onboarding
  router.register('/onboarding', () => {
    setPage(renderOnboarding(), '/onboarding');
  });

  // Student Profile
  router.register('/profile', () => {
    setPage(renderProfile(careers), '/profile');
  });

  // Student Dashboard
  router.register('/dashboard', () => {
    setPage(renderDashboard(careers, exams, opportunities), '/dashboard');
  });

  // Career Explorer
  router.register('/explore', () => {
    setPage(renderCareerExplorer(careers), '/explore');
  });

  // Career Detail
  router.register('/career', (path) => {
    const careerId = path.replace('/career/', '');
    const career = careers.find(c => c.id === careerId) || careers[0];
    setPage(renderCareerDetail(career, exams), '/career/' + (career?.id || ''));
  });

  // Roadmap
  router.register('/roadmap', () => {
    setPage(renderRoadmap(careers), '/roadmap');
  });

  // Exam Tracker
  router.register('/exams', () => {
    setPage(renderExams(exams), '/exams');
  });

  // Opportunities & Scholarships
  router.register('/opportunities', () => {
    setPage(renderOpportunities(opportunities), '/opportunities');
  });

  // Progress Tracker
  router.register('/progress', () => {
    const stageData = getProgressStageData(careers);
    setPage(renderProgress(careers), '/progress');
    setTimeout(() => initProgressChart(stageData), 100);
  });
  // AI Career Assistant
  router.register('/assistant', () => {
    setPage(renderAIAssistant(), '/assistant');
  });

  // Wildcard fallback
  router.register('*', () => {
    if (store.hasProfile()) {
      router.navigate('/dashboard', true);
    } else {
      router.navigate('/', true);
    }
  });
}

// ── Scroll Reveal ─────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Navbar Scroll Effect ───────────────────────────────────────
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Global Navigation ──────────────────────────────────────────
window.navigateTo = (path) => {
  document.getElementById('navbar-nav')?.classList.remove('open');
  router.navigate(path);
};

// ── Keyboard shortcut (Ctrl/Cmd + K for Quick Search) ──────────
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    router.navigate('/explore');
  }
});

// ── Boot ───────────────────────────────────────────────────────
async function boot() {
  // Show loader
  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1.5rem;">
      <div class="navbar-logo" style="width:64px;height:64px;font-size:2rem;animation:float 2s ease-in-out infinite;">🧭</div>
      <div class="spinner spinner-lg"></div>
      <div class="text-sm text-muted font-heading">Initializing ${env.appName} (${env.appVersion})...</div>
    </div>`;

  try {
    // 1. Initialize Database connection & verify demo data
    await db.connect();
    if (env.debug) console.log(`[App] Database connected via ${env.db.type}`);

    // 2. Load Static datasets
    await loadData();
  } catch (err) {
    console.error('Failed to initialize app:', err);
    showToast('Failed to load application data. Please refresh.', 'error');
  }

  // 3. Register routes and start router
  setupRoutes();
  router.init();
}

boot();
