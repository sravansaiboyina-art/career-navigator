// src/main.js — App Bootstrap, Router, Layout, DB Connection & Toast System

import './styles/index.css';
import './styles/animations.css';
import './styles/components.css';

import { router } from './router.js';
import { store } from './store.js';
import { api } from './api/client.js';
import { db } from './db/index.js';
import { dbStatus } from './db/config.js';
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

async function loadJsonDataset(file) {
  const configuredBase = import.meta.env.BASE_URL || '/';
  const base = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
  const response = await fetch(`${base}${file}`);
  if (!response.ok) {
    throw new Error(`Could not load ${file} (HTTP ${response.status}).`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`${file} must contain a non-empty JSON array.`);
  }
  return data;
}

async function loadData() {
  const [loadedCareers, loadedExams, loadedOpportunities] = await Promise.all([
    loadJsonDataset('data/careers.json'),
    loadJsonDataset('data/exams.json'),
    loadJsonDataset('data/opportunities.json')
  ]);

  careers = loadedCareers;
  exams = loadedExams;
  opportunities = loadedOpportunities;
  window.__careers = careers;
  window.__exams = exams;
  window.__opportunities = opportunities;
}

function renderStartupError() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <main class="container" style="min-height:100vh;display:grid;place-items:center;padding:2rem;">
      <section class="card" style="max-width:620px;width:100%;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:1rem;">🧭</div>
        <h1 class="font-heading" style="font-size:1.6rem;margin-bottom:0.75rem;">Career Navigator could not start</h1>
        <p class="text-sm text-muted" style="line-height:1.7;">Some required application data or browser storage could not be initialized. Check your connection and browser storage settings, then try again.</p>
        <button type="button" id="startup-retry" class="btn btn-primary mt-6">Try again</button>
      </section>
    </main>`;

  document.getElementById('startup-retry')?.addEventListener('click', () => window.location.reload());
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
    let opportunityId = '';
    if (path.startsWith('/opportunity/')) {
      try {
        opportunityId = decodeURIComponent(path.slice('/opportunity/'.length));
      } catch {
        opportunityId = '';
      }
    }
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
    let careerId = '';
    if (path.startsWith('/career/')) {
      try {
        careerId = decodeURIComponent(path.slice('/career/'.length));
      } catch {
        careerId = '';
      }
    }
    const career = careers.find((item) => item.id === careerId) || null;
    if (!career) {
      setPage(renderCareerDetail(null, exams), '/career');
      return;
    }
    setPage(renderCareerDetail(career, exams), '/career/' + encodeURIComponent(career.id));
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
let revealObserver = null;
let navbarScrollHandler = null;

function initScrollReveal() {
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver?.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ── Navbar Scroll Effect ───────────────────────────────────────
function initNavbarScroll() {
  if (navbarScrollHandler) {
    window.removeEventListener('scroll', navbarScrollHandler);
    navbarScrollHandler = null;
  }

  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Query the active navbar on each scroll so route changes never leave stale DOM
  // references behind, and replace the listener rather than accumulating handlers.
  navbarScrollHandler = () => {
    const activeNavbar = document.getElementById('navbar');
    activeNavbar?.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', navbarScrollHandler, { passive: true });
  navbarScrollHandler();
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
    // Initialize browser storage and load the data required by the app.
    await db.connect();
    if (env.debug) console.log(`[App] Browser cache connected via ${dbStatus.driver}`);
    await loadData();

    // When the API is configured, restore the authoritative server session.
    // Static/demo hosting remains usable through the local browser-only fallback.
    if (await api.isAvailable()) {
      try {
        const account = await api.me();
        store.setBackendSession(true);
        store.replaceSession(account.user, account.profile, account.progress);
      } catch (error) {
        if (store.isBackendSession()) store.logout();
        else store.setBackendSession(false);
        if (env.debug && error) console.info('[App] No active server session; continuing to the sign-in screen or local demo.');
      }
    } else {
      store.setBackendSession(false);
    }
  } catch (err) {
    console.error('Failed to initialize Career Navigator:', err);
    renderStartupError();
    return;
  }

  // Register routes only after their required datasets have loaded.
  setupRoutes();
  router.init();
}

boot();
