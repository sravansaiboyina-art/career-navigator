// pages/AIAssistant.js
import { store } from '../store.js';
import { gemini } from '../gemini.js';
import { showToast } from '../components/Toast.js';

let messages = [];
let isLoading = false;
let activeProfileId = null;

export function renderAIAssistant() {
  const profile = store.getProfile();
  if ((profile?.id || null) !== activeProfileId) {
    messages = [];
    isLoading = false;
    activeProfileId = profile?.id || null;
  }
  const serverManaged = store.isBackendSession();
  const hasKey = !!store.getApiKey() || serverManaged;

  return `
<div class="page-wrapper page-enter">
  <div class="container" style="padding-top:calc(var(--nav-height) + 1.5rem);padding-bottom:2rem;max-width:900px;">

    <div class="page-header" style="padding-bottom:1.5rem;margin-bottom:1.5rem;">
      <div class="page-header-inner">
        <div>
          <h2>🤖 AI Career Assistant</h2>
          <p class="mt-1">Career guidance · Personalized for ${escapeHtml(profile?.name || 'you')}</p>
        </div>
        <div class="flex gap-3 items-center">
          ${serverManaged
            ? `<span class="badge badge-green">● Server-managed AI</span>`
            : hasKey
              ? `<span class="badge badge-green">● Gemini Live</span>
                 <button class="btn btn-ghost btn-sm" onclick="window.showApiKeyModal()">Change Key</button>`
              : `<span class="badge badge-cyan">💡 Smart Counselor Mode</span>
                 <button class="btn btn-primary btn-sm" onclick="window.showApiKeyModal()">🔑 Add Live API Key</button>`}
          <button class="btn btn-ghost btn-sm" onclick="window.clearChat()">🗑 Clear Chat</button>
        </div>
      </div>
    </div>

    ${!hasKey ? renderApiKeyPrompt() : ''}

    <div class="card" style="padding:0;overflow:hidden;height:calc(100vh - 280px);min-height:500px;display:flex;flex-direction:column;" id="chat-card">

      <!-- Chat Messages -->
      <div class="chat-messages" id="chat-messages">
        ${messages.length === 0 ? renderWelcomeMessage(profile) : messages.map(renderMessage).join('')}
      </div>

      <!-- Suggested Questions -->
      <div class="suggested-questions" id="suggested-questions">
        ${renderSuggestedChips(profile)}
      </div>

      <!-- Input Row -->
      <div class="chat-input-row">
        <textarea
          class="chat-input"
          id="chat-input"
          placeholder="Ask anything about exams, strategies, cutoffs, syllabus..."
          rows="1"
          onkeydown="window.handleChatKey(event)"
          oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"
        ></textarea>
        <button class="send-btn" id="send-btn" onclick="window.sendMessage()" ${isLoading ? 'disabled' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- API Key Modal -->
  <div id="api-key-modal" class="modal-overlay hidden" onclick="window.closeApiModal(event)">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div style="font-size:2.5rem;text-align:center;margin-bottom:1rem;">🔑</div>
      <h4 class="text-center mb-2">Google Gemini API Key</h4>
      <p class="text-sm text-center mb-6">${serverManaged ? 'Your signed-in session sends AI requests to the Career Navigator backend. The server reads GEMINI_API_KEY from its environment, so the secret is never entered or stored in this browser.' : 'For standalone demo mode, your key is stored in this browser session and sent directly to Google. For a deployed app, use the backend environment configuration instead.'}</p>
      <div class="form-group mb-4">
        <label class="form-label">API Key</label>
        <input id="api-key-input" class="input" type="password" placeholder="AIza..." autocomplete="off" />
      </div>
      <p class="text-xs text-muted mb-4 text-center">
        Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-accent">aistudio.google.com ↗</a>
      </p>
      <div class="flex gap-3">
        <button class="btn btn-ghost" style="flex:1;justify-content:center;" onclick="window.closeApiModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:2;justify-content:center;" onclick="window.saveApiKey()">Save Key</button>
      </div>
    </div>
  </div>
</div>`;
}

function renderApiKeyPrompt() {
  return `
  <div style="background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.05));border:1px solid var(--border-accent);border-radius:var(--radius-xl);padding:1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:1rem;">
    <div style="font-size:2rem;">🔑</div>
    <div style="flex:1;">
      <div class="fw-700 font-heading">Add your Gemini API key to activate AI</div>
      <div class="text-sm text-muted mt-1">Get a free key from Google AI Studio — no credit card needed.</div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="window.showApiKeyModal()">Add Key</button>
  </div>`;
}

function renderWelcomeMessage(profile) {
  return `
  <div class="chat-bubble assistant animate-fade-up">
    <div style="font-size:1.5rem;margin-bottom:0.5rem;">👋</div>
    <p><strong>Hi ${escapeHtml(profile?.name || 'there')}!</strong> I'm your AI Career Assistant. I can use the configured server AI service or provide offline demo guidance.</p>
    <p>I'm personalized for your journey: <strong>${escapeHtml(store.getStageLabel(profile?.class || ''))}</strong> student interested in <strong>${escapeHtml(profile?.selectedCareer?.replace('-',' ') || 'various career paths')}</strong>.</p>
    <p>I can help you with:</p>
    <ul>
      <li>Exam preparation strategies</li>
      <li>Study schedules and resources</li>
      <li>Scholarship and internship guidance</li>
      <li>Career-specific advice for India</li>
      <li>Any questions about your roadmap</li>
    </ul>
    <p><em>Ask me anything below! 🚀</em></p>
  </div>`;
}

function renderMessage(msg) {
  if (msg.role === 'user') {
    return `<div class="chat-bubble user">${escapeHtml(msg.content)}</div>`;
  }
  return `<div class="chat-bubble assistant">${formatMarkdown(msg.content)}</div>`;
}

function renderSuggestedChips(profile) {
  const questions = {
    medicine: ['How to prepare for NEET in 6 months?','What score do I need for AIIMS Delhi?','Best books for NEET Biology?','Difference between MBBS and BDS?'],
    engineering: ['JEE Main preparation tips for Class 11?','How to improve in JEE Mathematics?','Best online resources for JEE prep?','How to get into IIT Bombay CS?'],
    'iit-jee': ['What rank is needed for IIT Delhi CS?','How to approach JEE Advanced?','HC Verma vs NCERT for JEE?','JEE coaching vs self-study?'],
    'gate-mtech': ['Best GATE preparation strategy?','Which GATE paper should I choose for CS?','GATE score for PSU recruitment?','IISc vs IIT for M.Tech?'],
    upsc: ['UPSC preparation roadmap for beginners?','Best optional subjects for UPSC?','How to read newspaper for UPSC?','UPSC vs state PCS — which to choose?'],
    'ssc-cgl': ['SSC CGL preparation in 3 months?','Best books for SSC CGL math?','SSC CGL vs IBPS PO salary comparison?','How to improve English for SSC?'],
    banking: ['IBPS PO preparation strategy?','RBI Grade B vs SBI PO — which is better?','How to prepare banking awareness?','Difference between IBPS PO and SBI PO?']
  };
  const qs = questions[profile?.selectedCareer] || ['What career is best for me?','How to plan my studies?','Which exams should I target?','How to get a scholarship?'];
  return qs.map(q => `<div class="suggested-chip" onclick="window.sendSuggested('${q.replace(/'/g,"\\'")}')">💬 ${q}</div>`).join('');
}

function formatMarkdown(text) {
  // Escape model output before adding the small subset of supported Markdown tags.
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h5 style="margin:0.75rem 0 0.25rem;color:var(--violet-light);">$1</h5>')
    .replace(/^## (.+)$/gm, '<h4 style="margin:0.75rem 0 0.25rem;">$1</h4>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>)/gs, m => `<ul>${m}</ul>`)
    .split('\n\n').map(p => p.startsWith('<') ? p : `<p>${p}</p>`).join('');
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function scrollToBottom() {
  const el = document.getElementById('chat-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

async function sendMessageCore(text) {
  if (!text.trim() || isLoading) return;

  messages.push({ role: 'user', content: text });
  isLoading = true;

  const messagesEl = document.getElementById('chat-messages');
  const sendBtn = document.getElementById('send-btn');
  const input = document.getElementById('chat-input');

  if (messagesEl) messagesEl.innerHTML = messages.map(renderMessage).join('');
  if (sendBtn) sendBtn.disabled = true;
  if (input) { input.value = ''; input.style.height = 'auto'; }

  // Add typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-bubble assistant';
  typingEl.id = 'typing-indicator';
  typingEl.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  if (messagesEl) messagesEl.appendChild(typingEl);
  scrollToBottom();

  try {
    const profile = store.getProfile();
    let responseText = '';
    const assistantBubble = document.createElement('div');
    assistantBubble.className = 'chat-bubble assistant';

    await gemini.chat(messages, profile, (token, full) => {
      typingEl.remove();
      if (!assistantBubble.parentNode && messagesEl) messagesEl.appendChild(assistantBubble);
      assistantBubble.innerHTML = formatMarkdown(full);
      scrollToBottom();
      responseText = full;
    });

    if (!responseText) {
      typingEl.remove();
      assistantBubble.innerHTML = '<p>Sorry, I could not generate a response. Please try again.</p>';
      if (!assistantBubble.parentNode && messagesEl) messagesEl.appendChild(assistantBubble);
    }

    messages.push({ role: 'assistant', content: responseText });
  } catch (err) {
    typingEl.remove();
    const errBubble = document.createElement('div');
    errBubble.className = 'chat-bubble assistant';
    if (err.message === 'NO_API_KEY') {
      errBubble.innerHTML = '<p>⚠️ Please add your Gemini API key to use the AI assistant.</p>';
      window.showApiKeyModal();
    } else {
      errBubble.innerHTML = `<p>❌ Error: ${escapeHtml(err.message)}. Please check your API key and try again.</p>`;
    }
    if (messagesEl) messagesEl.appendChild(errBubble);
    showToast('AI request failed: ' + err.message, 'error');
  } finally {
    isLoading = false;
    if (sendBtn) sendBtn.disabled = false;
    scrollToBottom();
  }
}

window.sendMessage = () => {
  const input = document.getElementById('chat-input');
  sendMessageCore(input?.value?.trim() || '');
};

window.sendSuggested = (q) => sendMessageCore(q);

window.handleChatKey = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    window.sendMessage();
  }
};

window.clearChat = () => {
  messages = [];
  const profile = store.getProfile();
  const messagesEl = document.getElementById('chat-messages');
  if (messagesEl) messagesEl.innerHTML = renderWelcomeMessage(profile);
  showToast('Chat cleared', 'info');
};

window.showApiKeyModal = () => {
  const modal = document.getElementById('api-key-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const input = document.getElementById('api-key-input');
    if (input) { input.value = store.getApiKey(); setTimeout(() => input.focus(), 100); }
  }
};

window.closeApiModal = (e) => {
  if (!e || e.target.id === 'api-key-modal') {
    document.getElementById('api-key-modal')?.classList.add('hidden');
  }
};

window.saveApiKey = () => {
  const key = document.getElementById('api-key-input')?.value?.trim();
  if (!key) { showToast('Please enter a valid API key', 'error'); return; }
  store.setApiKey(key);
  window.closeApiModal();
  showToast('✅ API key saved! AI assistant is ready.', 'success');
  // Reload the page to update the UI
  window.navigateTo('/assistant');
};
