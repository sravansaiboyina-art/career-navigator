// src/store.js — Reactive Client State Manager with Database Sync
import { db, COLLECTIONS } from './db/index.js';
import { DEMO_USERS } from './db/seed.js';

const PROFILE_KEY = 'cn_profile';
const PROGRESS_KEY = 'cn_progress';
const USER_KEY = 'cn_user';

export const store = {
  // ── Authentication / User Session ────────────────────
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated() {
    return !!this.getUser() || !!this.getProfile();
  },

  logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
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
      console.warn('[Store] Could not persist profile to DB:', err);
    });

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
    return raw
      ? JSON.parse(raw)
      : {
          completedMilestones: [],
          savedOpportunities: [],
          trackedExams: [],
          notes: {}
        };
  } catch {
    return {
      completedMilestones: [],
      savedOpportunities: [],
      trackedExams: [],
      notes: {}
    };
  }
},

  saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    const profile = this.getProfile();
    if (profile?.id) {
      const record = {
        ...progress,
        id: progress.id || ('prog-' + profile.id),
        profileId: profile.id
      };
      db.put(COLLECTIONS.PROGRESS, record)
        .catch(err => console.warn('[Store] Failed to sync progress to DB:', err));
    }
    return progress;
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
    this.setUser({
      id: demo.id,
      name: demo.name,
      email: demo.email,
      role: demo.role,
    });
    this.saveProfile(demo.profile);
    this.saveProgress(demo.progress);
    return demo;
  },

  // ── Stage Helpers ─────────────────────────────────────
  getStageLabel(cls) {
    const map = {
      '6': 'Class 6', '7': 'Class 7', '8': 'Class 8',
      '9': 'Class 9', '10': 'Class 10', '11': 'Class 11',
      '12': 'Class 12', 'ug': 'Undergraduate', 'grad': 'Postgraduate'
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
