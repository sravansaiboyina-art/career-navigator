// pages/Onboarding.js
import { store } from '../store.js';
import { router } from '../router.js';
import { showToast } from '../main.js';
import { escapeHtml } from '../utils/safeHtml.js';

let currentStep = 1;
let formData = { name: '', class: '', stream: 'na', interests: [], selectedCareer: '' };

const INTERESTS = [
  { id: 'biology',     label: 'Biology',     icon: '🧬' },
  { id: 'chemistry',   label: 'Chemistry',   icon: '⚗️' },
  { id: 'math',        label: 'Mathematics', icon: '📐' },
  { id: 'physics',     label: 'Physics',     icon: '⚛️' },
  { id: 'coding',      label: 'Coding',      icon: '💻' },
  { id: 'history',     label: 'History',     icon: '📜' },
  { id: 'economics',   label: 'Economics',   icon: '📊' },
  { id: 'polity',      label: 'Politics',    icon: '🏛️' },
  { id: 'geography',   label: 'Geography',   icon: '🌏' },
  { id: 'english',     label: 'English',     icon: '📖' },
  { id: 'sports',      label: 'Sports',      icon: '🏃' },
  { id: 'arts',        label: 'Arts',        icon: '🎨' },
  { id: 'research',    label: 'Research',    icon: '🔬' },
  { id: 'technology',  label: 'Technology',  icon: '🚀' },
  { id: 'healthcare',  label: 'Healthcare',  icon: '🏥' },
];

export function renderOnboarding() {
  currentStep = 1;
  const existingProfile = store.getProfile() || {};
  formData = {
    name: existingProfile.name || '',
    class: existingProfile.class || '',
    stream: existingProfile.stream || 'na',
    interests: Array.isArray(existingProfile.interests) ? [...existingProfile.interests] : [],
    selectedCareer: existingProfile.selectedCareer || ''
  };
  return `<div class="onboarding-container page-enter" id="onboarding-root">${renderStep()}</div>`;
}

function renderStep() {
  const steps = [
    { label: 'Personal Info', icon: '👤' },
    { label: 'Your Interests', icon: '💡' },
    { label: 'Career Match', icon: '🎯' },
  ];

  return `
<div class="onboarding-card animate-scale-in">
  <!-- Header -->
  <div class="flex items-center gap-3 mb-6">
    <div class="navbar-logo" style="width:32px;height:32px;font-size:1rem;">🧭</div>
    <span class="fw-700 font-heading" style="font-size:1rem;">Career Navigator</span>
  </div>

  <!-- Step Indicators -->
  <div class="step-indicator mb-6">
    ${steps.map((s,i) => `<div class="step-dot ${i+1 < currentStep ? 'done' : i+1 === currentStep ? 'active' : 'pending'}"></div>`).join('')}
  </div>

  <div class="text-xs text-muted fw-600 mb-2" style="text-transform:uppercase;letter-spacing:0.05em;">Step ${currentStep} of 3</div>

  ${currentStep === 1 ? renderStep1() : currentStep === 2 ? renderStep2() : renderStep3()}
</div>`;
}

function renderStep1() {
  return `
<h2 style="margin-bottom:0.5rem;">Let's get to know you</h2>
<p class="text-sm mb-6">This helps us personalize your entire career journey.</p>

<div class="flex-col gap-4">
  <div class="form-group">
    <label class="form-label" for="ob-name">Your Name *</label>
    <input id="ob-name" class="input" type="text" placeholder="e.g. Priya Sharma" value="${escapeHtml(formData.name)}" maxlength="50" />
  </div>

  <div class="form-group">
    <label class="form-label" for="ob-class">Current Class / Stage *</label>
    <select id="ob-class" class="input select" onchange="window.handleClassChange(this.value)">
      <option value="">Select your class...</option>
      ${['6','7','8','9','10','11','12'].map(c => `<option value="${c}" ${formData.class===c?'selected':''}>Class ${c}</option>`).join('')}
      <option value="ug" ${formData.class==='ug'?'selected':''}>Undergraduate (UG)</option>
      <option value="grad" ${formData.class==='grad'?'selected':''}>Graduate (degree completed)</option>
    </select>
  </div>

  <div class="form-group" id="stream-group" style="${['11','12','ug','grad'].includes(formData.class)?'':'display:none'}">
    <label class="form-label">Stream / Specialization</label>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;margin-top:0.25rem;">
      ${[['science','🔬 Science'],['commerce','💼 Commerce'],['arts','🎭 Arts / Humanities'],['na','🔄 Not decided yet']].map(([v,l])=>`
        <div class="interest-chip ${formData.stream===v?'selected':''}" onclick="window.selectStream('${v}')" id="stream-${v}">
          <div style="font-size:1rem;">${l.split(' ')[0]}</div>
          <div>${l.split(' ').slice(1).join(' ')}</div>
        </div>`).join('')}
    </div>
  </div>
</div>

<button class="btn btn-primary w-full mt-6" id="ob-next-1" style="justify-content:center;" onclick="window.onboardingNext(1)">
  Continue <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
</button>`;
}

function renderStep2() {
  return `
<h2 style="margin-bottom:0.5rem;">What excites you?</h2>
<p class="text-sm mb-2">Pick at least 3 subjects or areas you enjoy. <span class="text-accent">(${formData.interests.length} selected)</span></p>

<div class="interest-grid" id="interest-grid">
  ${INTERESTS.map(i => `
    <div class="interest-chip ${formData.interests.includes(i.id)?'selected':''}"
         onclick="window.toggleInterest('${i.id}')" id="interest-${i.id}">
      <div class="chip-icon">${i.icon}</div>
      <div style="font-size:0.75rem;">${i.label}</div>
    </div>`).join('')}
</div>

<div class="flex gap-3 mt-6">
  <button class="btn btn-ghost" onclick="window.onboardingBack()" style="flex:1;justify-content:center;">← Back</button>
  <button class="btn btn-primary" style="flex:2;justify-content:center;" onclick="window.onboardingNext(2)">
    Find My Careers →
  </button>
</div>`;
}

function renderStep3() {
  const recommended = getCareerRecommendations();
  return `
<h2 style="margin-bottom:0.5rem;">Your Top Career Matches</h2>
<p class="text-sm mb-6">Based on your interests, here are the best paths for you. Pick one to start with.</p>

<div class="flex-col gap-3" id="career-select-list">
  ${recommended.map((c,i) => `
    <div class="career-card ${formData.selectedCareer===c.id?'selected':''}"
         style="padding:1rem 1.25rem;border-radius:0.875rem;cursor:pointer;animation:fadeInUp 0.4s ease ${i*0.1}s both;"
         onclick="window.selectCareer('${c.id}')">
      <div class="flex items-center gap-3">
        <div class="select-indicator">✓</div>
        <div style="font-size:1.5rem;">${c.emoji}</div>
        <div style="flex:1;">
          <div class="fw-700 font-heading" style="font-size:0.9rem;">${c.title}</div>
          <div class="text-xs text-muted mt-1">${c.tagline}</div>
        </div>
        <div class="badge badge-violet" style="font-size:0.65rem;">${getMatchScore(c)}% match</div>
      </div>
    </div>`).join('')}
</div>

<div class="flex gap-3 mt-6">
  <button class="btn btn-ghost" onclick="window.onboardingBack()" style="flex:1;justify-content:center;">← Back</button>
  <button class="btn btn-primary" style="flex:2;justify-content:center;" onclick="window.onboardingFinish()" id="finish-btn">
    🚀 Start My Journey
  </button>
</div>`;
}

function getCareerRecommendations() {
  // Import careers and score them
  const careers = window.__careers || [];
  const stageOrder = ['6','7','8','9','10','11','12','ug','grad'];
  const studentIdx = stageOrder.indexOf(formData.class);

  return careers
    .map(c => {
      let score = 0;
      const eligibleIdx = stageOrder.indexOf(String(c.eligibleFromClass));
      if (studentIdx < eligibleIdx) return { ...c, score: -999 };
      if (['11','12','ug','grad'].includes(formData.class) && formData.stream !== 'na') {
        if (c.eligibleStreams && !c.eligibleStreams.includes(formData.stream) && formData.stream !== 'na') {
          score -= 5;
        }
      }
      (c.tags || []).forEach(tag => { if (formData.interests.includes(tag)) score += 10; });
      score += (c.popularityScore || 5) * 0.3;
      return { ...c, score };
    })
    .filter(c => c.score > -999)
    .sort((a,b) => b.score - a.score)
    .slice(0, 5);
}

function getMatchScore(career) {
  const overlap = (career.tags || []).filter(t => formData.interests.includes(t)).length;
  const total = Math.max(career.tags?.length || 1, 1);
  return Math.min(Math.round((overlap / total) * 100 + 30), 99);
}

// Expose global handlers
window.handleClassChange = (val) => {
  formData.class = val;
  const streamGroup = document.getElementById('stream-group');
  if (streamGroup) {
    if (['11','12','ug','grad'].includes(val)) {
      streamGroup.style.display = 'block';
    } else {
      streamGroup.style.display = 'none';
      formData.stream = 'na';
    }
  }
};

window.selectStream = (val) => {
  formData.stream = val;
  document.querySelectorAll('[id^="stream-"]').forEach(el => el.classList.remove('selected'));
  document.getElementById(`stream-${val}`)?.classList.add('selected');
};

window.toggleInterest = (id) => {
  const idx = formData.interests.indexOf(id);
  if (idx === -1) { formData.interests.push(id); }
  else { formData.interests.splice(idx, 1); }
  const el = document.getElementById(`interest-${id}`);
  if (el) el.classList.toggle('selected', formData.interests.includes(id));
  const count = document.querySelector('#interest-grid')?.closest('.onboarding-card')?.querySelector('.text-accent');
  if (count) count.textContent = `(${formData.interests.length} selected)`;
};

window.selectCareer = (id) => {
  formData.selectedCareer = id;
  document.querySelectorAll('#career-select-list .career-card').forEach(el => {
    el.classList.remove('selected');
  });
  document.querySelector(`#career-select-list [onclick="window.selectCareer('${id}')"]`)?.classList.add('selected');
};

window.onboardingNext = (step) => {
  if (step === 1) {
    const name = document.getElementById('ob-name')?.value?.trim();
    const cls  = document.getElementById('ob-class')?.value;
    if (!name) { showToast('Please enter your name', 'error'); return; }
    if (!cls)  { showToast('Please select your class', 'error'); return; }
    formData.name = name;
    formData.class = cls;
    // Show stream for class 11+
    if (['11','12','ug','grad'].includes(cls)) {
      document.getElementById('stream-group')?.removeAttribute('style');
    }
    currentStep = 2;
  } else if (step === 2) {
    if (formData.interests.length < 3) { showToast('Please select at least 3 interests', 'error'); return; }
    currentStep = 3;
  }
  const root = document.getElementById('onboarding-root');
  if (root) root.innerHTML = renderStep();
};

window.onboardingBack = () => {
  if (currentStep > 1) currentStep--;
  const root = document.getElementById('onboarding-root');
  if (root) root.innerHTML = renderStep();
};

window.onboardingFinish = () => {
  if (!formData.selectedCareer) { showToast('Please select a career path', 'error'); return; }
  const user = store.getUser() || {
    id: 'user-' + crypto.randomUUID(),
    name: formData.name,
    email: formData.name.toLowerCase().replace(/\s+/g, '.') + '@student.in',
    role: 'student'
  };
  store.setUser(user);
  store.saveProfile({
    userId: user.id,
    name: formData.name,
    class: formData.class,
    stream: formData.stream,
    interests: formData.interests,
    selectedCareer: formData.selectedCareer,
    targetExam: formData.selectedCareer === 'medicine' ? 'NEET UG' : formData.selectedCareer === 'engineering' ? 'JEE Advanced' : formData.selectedCareer === 'upsc' ? 'UPSC CSE' : 'National Entrance Exam',
    targetYear: '2027',
    badges: ['New Explorer', 'Career Chosen']
  });
  showToast(`Welcome, ${formData.name}! Your journey begins. 🚀`, 'success');
  router.navigate('/dashboard');
};
