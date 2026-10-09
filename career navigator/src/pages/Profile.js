// src/pages/Profile.js — Student Profile Page
import { store } from '../store.js';
import { db, COLLECTIONS } from '../db/index.js';
import { Modal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { router } from '../router.js';

export function renderProfile(careers = []) {
  const profile = store.getProfile();
  if (!profile) {
    return `
      <div class="empty-state page-enter p-8 text-center">
        <div class="empty-icon">👤</div>
        <h2>No Profile Found</h2>
        <p class="text-muted mt-2 mb-6">Complete onboarding or log in to view and manage your profile.</p>
        <button class="btn btn-primary" onclick="window.navigateTo('/onboarding')">Start Onboarding</button>
      </div>
    `;
  }

  const user = store.getUser();
  const progress = store.getProgress();
  const career = careers.find(c => c.id === profile.selectedCareer) || {
    title: profile.selectedCareer || 'Career Planning',
    emoji: '🧭',
    tagline: 'Custom Pathway'
  };

  const stageLabel = store.getStageLabel(profile.class);
  const initials = profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const completedCount = (progress.completedMilestones || []).length;
  const savedCount = (progress.savedOpportunities || []).length;
  const badges = profile.badges || ['Curious Explorer', 'Stage Navigator'];

  return `
  <div class="profile-page-wrapper page-enter">
    <div class="container" style="padding-top: calc(var(--nav-height) + 1.5rem); padding-bottom: 4rem;">
      
      <!-- Profile Header Banner -->
      <div class="card profile-header-card mb-8">
        <div class="flex items-center gap-6 flex-wrap">
          <div class="profile-avatar-large">
            ${initials}
            <div class="avatar-status-badge" title="Active Student">✓</div>
          </div>
          
          <div style="flex: 1; min-width: 250px;">
            <div class="flex items-center gap-3 flex-wrap">
              <h2 style="margin: 0; font-size: 1.85rem;">${profile.name}</h2>
              <span class="badge badge-violet">📚 ${stageLabel}</span>
              ${profile.stream && profile.stream !== 'na' ? `<span class="badge badge-cyan">${profile.stream.toUpperCase()} Stream</span>` : ''}
              <span class="badge badge-amber">${career.emoji} ${career.title}</span>
            </div>

            <p class="text-muted text-sm mt-2 mb-3" style="max-width: 600px;">
              ${profile.bio || 'Navigating academic milestones and career preparation with personalized roadmaps.'}
            </p>

            <div class="flex items-center gap-4 text-xs text-muted flex-wrap">
              <span>📧 ${user?.email || 'student@career-navigator.in'}</span>
              <span>🏫 ${profile.school || 'Secondary Education'}</span>
              <span>📍 ${profile.city || 'India'}</span>
            </div>
          </div>

          <div class="profile-header-actions flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="window.openEditProfileModal()">
              ✏️ Edit Profile
            </button>
            <button class="btn btn-ghost btn-sm" onclick="window.exportProfileData()" title="Export JSON">
              📥 Export
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="grid-4 gap-4 mb-8">
        <div class="stat-box">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">${completedCount}</div>
          <div class="stat-label">Milestones Cleared</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">${savedCount}</div>
          <div class="stat-label">Saved Opportunities</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">${profile.studyHours || '4-6h'}</div>
          <div class="stat-label">Daily Study Target</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">🏅</div>
          <div class="stat-value">${badges.length}</div>
          <div class="stat-label">Badges Earned</div>
        </div>
      </div>

      <!-- Main Two Column Grid -->
      <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem;">
        
        <!-- Left: Academic Roadmap & Target Details -->
        <div class="flex-col gap-6">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-heading">🎯 Academic Focus & Exam Goal</h4>
              <button class="btn btn-ghost btn-sm" onclick="window.openEditProfileModal()">Change</button>
            </div>

            <div class="grid-2 gap-4">
              <div class="p-3 border border-border rounded-xl" style="background:var(--bg-glass);">
                <div class="text-xs text-muted">Primary Target Exam</div>
                <div class="fw-700 text-sm mt-1">${profile.targetExam || 'NEET / JEE / Civil Services'}</div>
              </div>

              <div class="p-3 border border-border rounded-xl" style="background:var(--bg-glass);">
                <div class="text-xs text-muted">Target Exam Year</div>
                <div class="fw-700 text-sm mt-1">${profile.targetYear || '2027'}</div>
              </div>

              <div class="p-3 border border-border rounded-xl" style="background:var(--bg-glass);">
                <div class="text-xs text-muted">Current Academic Stage</div>
                <div class="fw-700 text-sm mt-1">${stageLabel}</div>
              </div>

              <div class="p-3 border border-border rounded-xl" style="background:var(--bg-glass);">
                <div class="text-xs text-muted">Selected Career Goal</div>
                <div class="fw-700 text-sm mt-1">${career.emoji} ${career.title}</div>
              </div>
            </div>

            <div class="mt-6 flex justify-between items-center p-3 rounded-xl" style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);">
              <div>
                <div class="fw-600 text-xs" style="color:var(--violet-light);">Want to explore a different career?</div>
                <div class="text-xs text-muted">You can switch paths anytime without losing your historical progress.</div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.navigateTo('/explore')">
                Explore Paths
              </button>
            </div>
          </div>

          <!-- Interests & Strengths -->
          <div class="card">
            <h4 class="font-heading mb-4">💡 Subject Interests & Strengths</h4>
            <div class="flex flex-wrap gap-2">
              ${(profile.interests || ['science', 'problem-solving', 'technology']).map(interest => `
                <span class="interest-pill">
                  ✨ ${interest.charAt(0).toUpperCase() + interest.slice(1)}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Badges, Persona Switcher & Danger Zone -->
        <div class="flex-col gap-6">
          <!-- Badges Card -->
          <div class="card">
            <h4 class="font-heading mb-4">🏆 Badges & Achievements</h4>
            <div class="profile-badge-grid">
              ${badges.map(b => `
                <div class="badge-item">
                  <div class="badge-item-icon">🎖️</div>
                  <div class="badge-item-name">${b}</div>
                  <div class="badge-item-desc">Phase 1 Milestone</div>
                </div>
              `).join('')}
              <div class="badge-item opacity-50" title="Complete 5 milestones to unlock">
                <div class="badge-item-icon">🔒</div>
                <div class="badge-item-name">Scholar Ace</div>
                <div class="badge-item-desc">Locked</div>
              </div>
            </div>
          </div>

          <!-- Quick Persona Switcher for Evaluation -->
          <div class="card" style="border-color:var(--border-accent);">
            <h4 class="font-heading text-sm mb-2">⚡ Evaluator Quick Persona Switcher</h4>
            <p class="text-xs text-muted mb-4">Instantly preview student profiles across school, secondary, and college stages:</p>
            <div class="flex-col gap-2">
              <button class="btn btn-ghost btn-sm text-left" onclick="window.switchDemoPersona('neet')">🩺 Class 11 NEET (Priya)</button>
              <button class="btn btn-ghost btn-sm text-left" onclick="window.switchDemoPersona('jee')">💻 Class 12 JEE (Rohan)</button>
              <button class="btn btn-ghost btn-sm text-left" onclick="window.switchDemoPersona('upsc')">🏛️ UG UPSC (Ananya)</button>
              <button class="btn btn-ghost btn-sm text-left" onclick="window.switchDemoPersona('cl8')">🎒 Class 8 Foundation (Kabir)</button>
            </div>
          </div>

          <!-- Account Management -->
          <div class="card border border-red" style="border-color:rgba(239,68,68,0.3);">
            <h4 class="font-heading text-sm text-red mb-2">⚙️ Account Settings</h4>
            <div class="flex gap-2 flex-wrap mt-3">
              <button class="btn btn-ghost btn-sm" onclick="window.handleLogout()">Log Out</button>
              <button class="btn btn-ghost btn-sm text-red" onclick="window.resetProfile()">Reset Data</button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
  `;
}

// Global Handlers for Profile
if (typeof window !== 'undefined') {
  window.openEditProfileModal = () => {
    const profile = store.getProfile() || {};
    const careers = window.__careers || [];

    const content = `
      <form id="edit-profile-form" class="flex-col gap-3">
        <div class="form-group">
          <label class="form-label" for="edit-name">Student Name</label>
          <input id="edit-name" class="input" type="text" value="${profile.name || ''}" required />
        </div>

        <div class="grid-2 gap-3">
          <div class="form-group">
            <label class="form-label" for="edit-class">Class / Stage</label>
            <select id="edit-class" class="input select">
              ${['6','7','8','9','10','11','12'].map(c => `
                <option value="${c}" ${profile.class === c ? 'selected' : ''}>Class ${c}</option>
              `).join('')}
              <option value="ug" ${profile.class === 'ug' ? 'selected' : ''}>Undergraduate (UG)</option>
              <option value="grad" ${profile.class === 'grad' ? 'selected' : ''}>Postgraduate (PG)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-stream">Stream</label>
            <select id="edit-stream" class="input select">
              <option value="science" ${profile.stream === 'science' ? 'selected' : ''}>Science</option>
              <option value="commerce" ${profile.stream === 'commerce' ? 'selected' : ''}>Commerce</option>
              <option value="arts" ${profile.stream === 'arts' ? 'selected' : ''}>Arts / Humanities</option>
              <option value="na" ${profile.stream === 'na' ? 'selected' : ''}>Not Decided</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-career">Target Career Path</label>
          <select id="edit-career" class="input select">
            ${careers.map(c => `
              <option value="${c.id}" ${profile.selectedCareer === c.id ? 'selected' : ''}>${c.emoji} ${c.title}</option>
            `).join('')}
          </select>
        </div>

        <div class="grid-2 gap-3">
          <div class="form-group">
            <label class="form-label" for="edit-exam">Target Exam</label>
            <input id="edit-exam" class="input" type="text" value="${profile.targetExam || ''}" placeholder="e.g. NEET UG 2027" />
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-year">Target Year</label>
            <input id="edit-year" class="input" type="text" value="${profile.targetYear || '2027'}" />
          </div>
        </div>

        <div class="grid-2 gap-3">
          <div class="form-group">
            <label class="form-label" for="edit-school">School / College</label>
            <input id="edit-school" class="input" type="text" value="${profile.school || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-city">City</label>
            <input id="edit-city" class="input" type="text" value="${profile.city || ''}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-bio">Bio / Study Goals</label>
          <textarea id="edit-bio" class="input" rows="2">${profile.bio || ''}</textarea>
        </div>
      </form>
    `;

    const modal = Modal.open({
      title: '✏️ Edit Student Profile',
      content: content,
      actions: `
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" onclick="window.saveEditedProfile()">Save Changes</button>
      `,
      maxWidth: '560px'
    });
  };

  window.saveEditedProfile = () => {
    const name = document.getElementById('edit-name')?.value.trim();
    const cls = document.getElementById('edit-class')?.value;
    const stream = document.getElementById('edit-stream')?.value;
    const selectedCareer = document.getElementById('edit-career')?.value;
    const targetExam = document.getElementById('edit-exam')?.value.trim();
    const targetYear = document.getElementById('edit-year')?.value.trim();
    const school = document.getElementById('edit-school')?.value.trim();
    const city = document.getElementById('edit-city')?.value.trim();
    const bio = document.getElementById('edit-bio')?.value.trim();

    if (!name) {
      showToast('Name is required', 'error');
      return;
    }

    store.saveProfile({
      name,
      class: cls,
      stream,
      selectedCareer,
      targetExam,
      targetYear,
      school,
      city,
      bio
    });

    Modal.close();
    showToast('Profile updated successfully! ✨', 'success');
    router.navigate('/profile', false, true);
  };

  window.exportProfileData = () => {
    const profile = store.getProfile();
    const progress = store.getProgress();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, progress }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${profile.name.toLowerCase().replace(/\s+/g, '_')}_career_profile.json`);
    dlAnchorElem.click();
    showToast('Profile data exported to JSON 📥', 'success');
  };
}
