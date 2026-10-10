// src/store.js — Reactive Client State Manager with Database Sync
import { db, COLLECTIONS } from './db/index.js';
import { DEMO_USERS } from './db/seed.js';
import { api } from './api/client.js';

const PROFILE_KEY = 'cn_profile';
const PROGRESS_KEY = 'cn_progress';
const USER_KEY = 'cn_user';
const SESSION_MODE_KEY = 'cn_session_mode';
let backendSession = (() => {
  try { return localStorage.getItem(SESSION_MODE_KEY) === 'backend'; } catch { return false; }
})();

const EMPTY_PROGRESS = {
  completedMilestones: [],
  savedOpportunities: [],
  trackedExams: [],
  notes: {}
};

function normalizeProgress(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    ...EMPTY_PROGRESS,
    ...source,
    completedMilestones: Array.isArray(source.completedMilestones) ? [...new Set(source.completedMilestones)] : [],
    savedOpportunities: Array.isArray(source.savedOpportunities) ? [...new Set(source.savedOpportunities)] : [],
    trackedExams: Array.isArray(source.trackedExams) ? [...new Set(source.trackedExams)] : [],
    notes: source.notes && typeof source.notes === 'object' && !Array.isArray(source.notes) ? source.notes : {}
  };
}

function safeSessionUser(user) {
  if (!user || typeof user !== 'object') return null;
  const { id, name, email, role, createdAt } = user;
  return { id, name, email, role: role || 'student', ...(createdAt ? { createdAt } : {}) };
}

export const store = {
  setBackendSession(enabled) {
    backendSession = Boolean(enabled);
    try {
      if (backendSession) localStorage.setItem(SESSION_MODE_KEY, 'backend');
      else localStorage.removeItem(SESSION_MODE_KEY);
    } catch { /* browser storage can be disabled */ }
  },

  isBackendSession() {
    return backendSession;
  },

  // ── Authentication / User Session ────────────────────
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const safeUser = safeSessionUser(parsed);
      if (parsed?.password) localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
      return safeUser;
    } catch { return null; }
  },

  setUser(user) {
    const safeUser = safeSessionUser(user);
    if (safeUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    return safeUser;
  },

  // Replace the active browser session on login/signup/persona changes.
  // This prevents fields from a previous student profile leaking into a new account.
  replaceSession(user, profile, progress = {}) {
    const safeUser = this.setUser(user);
    const now = new Date().toISOString();
    let safeProfile = null;

    if (profile) {
      safeProfile = {
        ...profile,
        id: profile.id || 'profile-' + (profile.userId || safeUser?.id || crypto.randomUUID()),
        userId: profile.userId || safeUser?.id || null,
        createdAt: profile.createdAt || now,
        updatedAt: now
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(safeProfile));
      db.put(COLLECTIONS.PROFILES, safeProfile).catch(err => {
        console.warn('[Store] Could not persist profile to DB:', err);
      });
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }

    const safeProgress = normalizeProgress(progress);
    if (safeProfile?.id) {
      safeProgress.id = safeProgress.id || ('prog-' + safeProfile.id);
      safeProgress.profileId = safeProfile.id;
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(safeProgress));
    if (safeProfile?.id) {
      db.put(COLLECTIONS.PROGRESS, safeProgress).catch(err => {
        console.warn('[Store] Could not persist progress to DB:', err);
      });
    }

    return { user: safeUser, profile: safeProfile, progress: safeProgress };
  },

  isAuthenticated() {
    return !!this.getUser() || !!this.getProfile();
  },

  logout() {
    if (backendSession) api.logout().catch((error) => console.warn('[Store] Server logout could not be reached:', error));
    this.setBackendSession(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    // API credentials are per-browser-session and must not carry into another student's session.
    try { sessionStorage.removeItem('cn_gemini_key'); } catch { /* sessionStorage can be unavailable in hardened browsers */ }
  },

  // ── Profile ──────────────────────────────────────────
  getProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  saveProfile(profile) {
    const existing = this.getProfile() || {};
    const updated = {
      ...existing,
      ...profile,
      updatedAt: new Date().toISOString()
    };
    if (!updated.id) updated.id = 'profile-' + (updated.userId || crypto.randomUUID());
    if (!updated.createdAt) updated.createdAt = new Date().toISOString();

    // Save locally
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));

    // Also persist asynchronously to DB
    db.put(COLLECTIONS.PROFILES, updated).catch(err => {
      console.warn('[Store] Could not persist profile to local DB:', err);
    });
    if (backendSession) {
      api.updateProfile(updated).catch(err => {
        console.warn('[Store] Profile could not sync to the server; the local copy was kept:', err);
      });
    }

    return updated;
  },

  clearProfile() {
    this.logout();
  },

  hasProfile() {
    return !!this.getProfile();
  },

  // ── Progress ─────────────────────────────────────────
  getProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      return normalizeProgress(raw ? JSON.parse(raw) : {});
    } catch {
      return normalizeProgress();
    }
  },

  saveProgress(progress) {
    const safeProgress = normalizeProgress(progress);
    const profile = this.getProfile();
    if (profile?.id) {
      safeProgress.id = safeProgress.id || ('prog-' + profile.id);
      safeProgress.profileId = profile.id;
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(safeProgress));
    if (profile?.id) {
      db.put(COLLECTIONS.PROGRESS, safeProgress)
        .catch(err => console.warn('[Store] Failed to persist progress to local DB:', err));
      if (backendSession) {
        api.updateProgress(safeProgress).catch(err => {
          console.warn('[Store] Progress could not sync to the server; the local copy was kept:', err);
        });
      }
    }
    return safeProgress;
  },

  toggleMilestone(milestoneId) {
    const progress = this.getProgress();
    const idx = progress.completedMilestones.indexOf(milestoneId);
    if (idx === -1) {
      progress.completedMilestones.push(milestoneId);
    } else {
      progress.completedMilestones.splice(idx, 1);
    }
    this.saveProgress(progress);
    return progress;
  },

  isMilestoneComplete(milestoneId) {
    return this.getProgress().completedMilestones.includes(milestoneId);
  },

  toggleSavedOpportunity(opportunityId) {
    const progress = this.getProgress();
    const idx = progress.savedOpportunities.indexOf(opportunityId);
    if (idx === -1) {
      progress.savedOpportunities.push(opportunityId);
    } else {
      progress.savedOpportunities.splice(idx, 1);
    }
    this.saveProgress(progress);
    return progress;
  },

  isOpportunitySaved(opportunityId) {
    return this.getProgress().savedOpportunities.includes(opportunityId);
  },
  // Exam tracker
isExamTracked(examId) {
  return (this.getProgress().trackedExams || [])
    .includes(examId);
},

toggleTrackedExam(examId) {
  const progress = this.getProgress();

  if (!Array.isArray(progress.trackedExams)) {
    progress.trackedExams = [];
  }

  const index = progress.trackedExams.indexOf(examId);

  if (index === -1) {
    progress.trackedExams.push(examId);
  } else {
    progress.trackedExams.splice(index, 1);
  }

  this.saveProgress(progress);
  return progress.trackedExams;
},

  saveMilestoneNote(milestoneId, note) {
    const progress = this.getProgress();
    if (!progress.notes) progress.notes = {};
    progress.notes[milestoneId] = note;
    this.saveProgress(progress);
  },

  getMilestoneNote(milestoneId) {
    return this.getProgress().notes?.[milestoneId] || '';
  },

  // ── Demo Persona Switcher ─────────────────────────────
  applyDemoPersona(personaKey) {
    const map = {
      neet: DEMO_USERS[0],
      jee: DEMO_USERS[1],
      upsc: DEMO_USERS[2],
      cl8: DEMO_USERS[3],
      bank: DEMO_USERS[4],
    };

    const demo = map[personaKey] || DEMO_USERS[0];
    this.replaceSession({
      id: demo.id,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      createdAt: demo.createdAt
    }, demo.profile, demo.progress);
    return demo;
  },

  // ── Stage Helpers ─────────────────────────────────────
  getStageLabel(cls) {
    const map = {
      '6': 'Class 6', '7': 'Class 7', '8': 'Class 8',
      '9': 'Class 9', '10': 'Class 10', '11': 'Class 11',
      '12': 'Class 12', 'ug': 'Undergraduate', 'grad': 'Graduate'
    };
    return map[cls] || cls;
  },

  getStageOrder() {
    return ['6', '7', '8', '9', '10', '11', '12', 'ug', 'grad'];
  },

  compareStages(a, b) {
    const order = this.getStageOrder();
    return order.indexOf(a) - order.indexOf(b);
  },

  isStageEligible(studentClass, minClass) {
    return this.compareStages(studentClass, minClass) >= 0;
  },

  // ── Gemini API key (Preserved for compatibility) ───────
  getApiKey() {
    return sessionStorage.getItem('cn_gemini_key') || '';
  },

  setApiKey(key) {
    sessionStorage.setItem('cn_gemini_key', key);
  }
};
