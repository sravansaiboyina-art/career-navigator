// pages/Landing.js
import { escapeHtml } from '../utils/safeHtml.js';

export function renderLanding(careers = [], exams = [], opportunities = []) {
  const scholarshipCount = opportunities.filter((item) => item.type === 'scholarship').length;
  const featuredExams = ['neet-ug', 'jee-main', 'gate'].map((id) => exams.find((exam) => exam.id === id)).filter(Boolean);
  const featuredOpportunities = ['inspire-scholarship', 'google-step-internship', 'pm-yasasvi'].map((id) => opportunities.find((opportunity) => opportunity.id === id)).filter(Boolean);
  return `
<div class="hero-section hero-bg page-enter">
  <!-- Background Orbs -->
  <div class="orb orb-violet orb-animated" style="width:500px;height:500px;top:-100px;left:-200px;"></div>
  <div class="orb orb-cyan orb-animated-2" style="width:400px;height:400px;bottom:-50px;right:-150px;opacity:0.1;"></div>
  <div class="orb orb-pink" style="width:300px;height:300px;top:40%;right:20%;opacity:0.06;"></div>

  <div class="container" style="padding-top: 100px; padding-bottom: 80px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;">
      <div class="hero-content">
        <div class="hero-eyebrow animate-fade-up">
          <span>✨</span> AI-Powered Career Navigation
        </div>
        <h1 class="hero-headline animate-fade-up delay-1">
          Your Career,<br>
          <span class="gradient-text-animated">Mapped & Mastered</span>
        </h1>
        <p class="hero-sub animate-fade-up delay-2">
          Personalized career roadmaps for Indian students from Class 6 through graduation. Explore paths, track exams, discover scholarships, and get AI-guided advice — all in one place.
        </p>
        <div class="hero-actions animate-fade-up delay-3 flex items-center gap-3 flex-wrap">
          <button class="btn btn-primary btn-lg" id="hero-start-btn" onclick="window.navigateTo('/onboarding')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            Start Your Journey
          </button>
          <button class="btn btn-secondary btn-lg" onclick="window.navigateTo('/auth')">
            🔑 Sign In / Demo
          </button>
          <button class="btn btn-ghost btn-lg" onclick="window.navigateTo('/explore')">
            Explore Careers
          </button>
        </div>
        <div class="animate-fade-up delay-4 text-sm text-muted" style="margin-top:2rem;max-width:36rem;">
          Demo preview: save roadmaps, exam plans, and opportunities in this browser. Verify all current deadlines on official websites.
        </div>
      </div>

      <div class="animate-fade-up delay-2" style="position:relative;">
        <div class="card card-glow" style="padding:1.5rem;background:rgba(19,25,41,0.8);backdrop-filter:blur(20px);">
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
            <div style="width:10px;height:10px;border-radius:50%;background:#EF4444;"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#F59E0B;"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#10B981;"></div>
            <span class="text-xs text-muted" style="margin-left:auto;font-family:var(--font-mono);">career-navigator.ai</span>
          </div>
          <!-- Dashboard Preview -->
          <div style="background:var(--bg-primary);border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;">
            <div class="flex items-center gap-3 mb-4">
              <div style="width:40px;height:40px;background:var(--grad-hero);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;">👤</div>
              <div>
                <div class="fw-700 font-heading" style="font-size:0.875rem;">Sample Student</div>
                <div class="text-xs text-muted">Illustrative profile · personalize after sign-in</div>
              </div>
              <span class="badge badge-cyan" style="margin-left:auto;">Demo preview</span>
            </div>
            <div style="margin-bottom:0.75rem;">
              <div class="flex justify-between text-xs text-muted mb-2"><span>Sample roadmap progress</span><span>Illustrative only</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:42%;"></div></div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-top:1rem;">
              ${featuredExams.length ? featuredExams.map((exam)=>`
                <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:0.5rem;padding:0.5rem;text-align:center;">
                  <div style="font-size:1rem;">${escapeHtml(exam.emoji || '📅')}</div>
                  <div class="fw-600" style="font-size:0.65rem;margin-top:2px;">${escapeHtml(exam.title)}</div>
                  <div class="text-muted" style="font-size:0.6rem;">Expected: ${escapeHtml(exam.examMonth || 'TBA')}</div>
                </div>`).join('') : '<p class="text-xs text-muted">Exam data will appear here.</p>'}
            </div>
          </div>
          <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);border-radius:0.75rem;padding:1rem;">
            <div class="text-xs fw-600" style="color:var(--violet-light);margin-bottom:0.5rem;">🤖 AI Career Assistant</div>
            <div class="text-sm text-secondary">Try asking about planning a weekly study schedule, comparing career pathways, or preparing for an exam. Advice is informational; check official notices for rules and dates.</div>
          </div>
        </div>
        <!-- Floating badges -->
        <div class="animate-float" style="position:absolute;top:-20px;right:-20px;background:var(--bg-card);border:1px solid var(--border-accent);border-radius:0.75rem;padding:0.75rem 1rem;font-size:0.75rem;display:flex;align-items:center;gap:0.5rem;box-shadow:var(--shadow-glow);">
          <span style="font-size:1rem;">🎯</span>
          <div><div class="fw-700">${careers.length} Career Paths</div><div class="text-muted" style="font-size:0.65rem;">Available in this demo</div></div>
        </div>
        <div class="animate-float delay-3" style="position:absolute;bottom:-20px;left:-20px;background:var(--bg-card);border:1px solid rgba(16,185,129,0.3);border-radius:0.75rem;padding:0.75rem 1rem;font-size:0.75rem;display:flex;align-items:center;gap:0.5rem;">
          <span style="font-size:1rem;">✅</span>
          <div><div class="fw-700 text-green">Milestones</div><div class="text-muted" style="font-size:0.65rem;">Track your own progress after setup</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Stats Strip -->
<div style="background:var(--bg-secondary);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:2rem 0;">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center;">
      ${[
        [String(careers.length), 'Career Paths'],
        [String(exams.length), 'Exam Records'],
        [String(scholarshipCount), 'Scholarship Records'],
        ['Class 6–Graduate', 'Student Stages']
      ].map(([value, label])=>`
        <div class="reveal">
          <div class="stat-value">${escapeHtml(value)}</div>
          <div class="stat-label">${escapeHtml(label)}</div>
        </div>`).join('')}
    </div>
  </div>
</div>

<!-- Careers Section -->
<div class="section">
  <div class="container">
    <div class="text-center mb-8 reveal">
      <div class="hero-eyebrow" style="margin:0 auto var(--space-4);">Career Paths</div>
      <h2>Every Dream. One Platform.</h2>
      <p class="mt-4" style="max-width:500px;margin:1rem auto 0;">From NEET to UPSC, we cover all major Indian career paths with stage-by-stage guidance.</p>
    </div>
    <div class="career-pill-row reveal">
      ${careers.map((career)=>`
        <div class="career-pill">${escapeHtml(career.emoji || '🎯')} ${escapeHtml(career.title || 'Career')}</div>`).join('')}
    </div>
  </div>
</div>

<!-- Features Section -->
<div class="section" style="background:var(--bg-secondary);">
  <div class="container">
    <div class="text-center mb-8 reveal">
      <div class="hero-eyebrow" style="margin:0 auto var(--space-4);">Everything You Need</div>
      <h2>Built for the Indian Student</h2>
    </div>
    <div class="feature-grid">
      ${[
        ['🗺️','Personal Roadmap','Stage-by-stage milestones tailored to your class, stream, and career goal.','rgba(124,58,237,0.15)'],
        ['📅','Exam Calendar','Review exam information and expected application windows. Verify live dates on official portals.','rgba(6,182,212,0.15)'],
        ['💡','Smart Eligibility','Know exactly which exams and scholarships you qualify for right now.','rgba(245,158,11,0.15)'],
        ['🤖','AI Career Assistant','Ask anything — get personalized, India-specific guidance powered by Gemini AI.','rgba(236,72,153,0.15)'],
        ['🎓','Scholarships & More','Explore scholarship and funding records; confirm each programme's current status with its official source.','rgba(16,185,129,0.15)'],
        ['📊','Progress Tracker','Visualize your growth with milestone completions and interactive charts.','rgba(239,68,68,0.15)'],
      ].map(([icon,title,desc,bg],i)=>`
        <div class="feature-card reveal delay-${i+1}">
          <div class="feature-icon" style="background:${bg};">${icon}</div>
          <h4 style="margin-bottom:0.5rem;">${title}</h4>
          <p class="text-sm">${desc}</p>
        </div>`).join('')}
    </div>
  </div>
</div>

<!-- CTA Section -->
<div class="section">
  <div class="container">
    <div class="reveal" style="background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.1));border:1px solid var(--border-accent);border-radius:var(--radius-2xl);padding:4rem;text-align:center;position:relative;overflow:hidden;">
      <div class="orb orb-violet" style="width:300px;height:300px;top:-100px;left:-100px;opacity:0.2;"></div>
      <div class="orb orb-cyan" style="width:200px;height:200px;bottom:-50px;right:-50px;opacity:0.15;"></div>
      <div style="position:relative;z-index:1;">
        <h2 style="margin-bottom:1rem;">Ready to navigate your future?</h2>
        <p style="max-width:450px;margin:0 auto 2rem;">Create a profile to start a personal roadmap. Demo profile and progress data are stored in this browser.</p>
        <button class="btn btn-primary btn-lg" onclick="window.navigateTo('/onboarding')">
          Get Started — It's Free
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Footer -->
<footer style="background:var(--bg-secondary);border-top:1px solid var(--border);padding:2rem 0;">
  <div class="container flex items-center justify-between flex-wrap gap-4">
    <div class="flex items-center gap-3">
      <div class="navbar-logo" style="width:28px;height:28px;font-size:0.875rem;">🧭</div>
      <span class="fw-700 font-heading">Career Navigator</span>
    </div>
    <p class="text-xs text-muted">Built as a college project · Data for Indian students · 2026</p>
    <div class="flex gap-4">
      <span class="text-xs text-muted">Made with ❤️ for India's future leaders</span>
    </div>
  </div>
</footer>
`;
}
