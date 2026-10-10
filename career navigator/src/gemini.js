// gemini.js — Google Gemini API client

import { store } from './store.js';
import { api } from './api/client.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';
const GEMINI_STREAM_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:streamGenerateContent';

function buildSystemPrompt(profile) {
  if (!profile) {
    return `You are Career Navigator AI, a friendly and expert career counselor for Indian students from Class 6 through graduation. Give concise, actionable, India-focused career advice. Reference the Indian education system (CBSE/State boards, NEET, JEE, UPSC, SSC CGL, Banking). Keep responses under 250 words unless asked for detail. Use bullet points for step-by-step guidance.`;
  }
  return `You are Career Navigator AI, a friendly and expert career counselor for Indian students.

Student Profile:
- Name: ${profile.name || 'Student'}
- Current Stage: ${store.getStageLabel(profile.class)}
- Stream: ${profile.stream || 'Not selected yet'}
- Selected Career Path: ${profile.selectedCareer || 'Exploring options'}
- Interests: ${(profile.interests || []).join(', ') || 'Not specified'}

Your role:
1. Give age-appropriate, stage-specific advice for this student
2. Reference Indian education system (CBSE/State boards, NEET, JEE, UPSC, SSC, Banking, GATE)
3. Be encouraging, specific, and actionable
4. When mentioning exams, include eligibility requirements and official websites
5. Keep responses concise (under 250 words) unless asked for detail
6. Use bullet points for step-by-step guidance
7. Address the student by name when appropriate
8. Tailor advice to their specific career path and current stage`;
}

export const gemini = {
  async chat(messages, profile = null, onToken = null) {
    // Authenticated full-stack sessions use the server proxy so the Gemini key never reaches the browser.
    if (store.isBackendSession()) {
      const result = await api.chat(messages);
      if (result.configured && result.text) {
        if (onToken) onToken(result.text, result.text);
        return result.text;
      }
      return generateOfflineAdvice(messages, profile, onToken);
    }

    const apiKey = store.getApiKey();
    if (!apiKey) {
      return generateOfflineAdvice(messages, profile, onToken);
    }

    const systemPrompt = buildSystemPrompt(profile);

    // Build contents array from messages
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        maxOutputTokens: 1024
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    };

    if (onToken) {
      // Streaming mode
      const url = `${GEMINI_STREAM_URL}?alt=sse`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      if (!res.body) throw new Error('Streaming is unavailable in this browser. Try again or disable streaming.');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      const consumeEvent = (eventText) => {
        const dataLines = eventText.split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart());
        if (!dataLines.length) return;
        const payload = dataLines.join('\n').trim();
        if (!payload || payload === '[DONE]') return;
        try {
          const data = JSON.parse(payload);
          const token = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (token) {
            fullText += token;
            onToken(token, fullText);
          }
          const blockReason = data.promptFeedback?.blockReason;
          if (blockReason) throw new Error(`Gemini blocked this request (${blockReason}). Rephrase the question and try again.`);
        } catch (error) {
          if (error instanceof SyntaxError) return; // Ignore a malformed/keep-alive event.
          throw error;
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() || '';
          events.forEach(consumeEvent);
          if (done) break;
        }
        if (buffer.trim()) consumeEvent(buffer);
      } finally {
        reader.releaseLock();
      }
      return fullText;
    } else {
      // Non-streaming mode
      const url = GEMINI_API_URL;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  },

  async getSuggestedQuestions(profile) {
    const apiKey = store.getApiKey();
    if (!apiKey) return defaultQuestions(profile);

    try {
      const prompt = `Generate 4 short, specific career guidance questions for a ${store.getStageLabel(profile?.class || 'ug')} student interested in ${profile?.selectedCareer || 'career options'} in India. Each question should be under 12 words. Return ONLY a JSON array of 4 strings. No explanation.`;

      const url = GEMINI_API_URL;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200 }
        })
      });

      if (!res.ok) return defaultQuestions(profile);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch { /* fall through */ }

    return defaultQuestions(profile);
  }
};

function defaultQuestions(profile) {
  const career = profile?.selectedCareer || 'engineering';
  const cls = profile?.class || 'ug';
  const questions = {
    medicine: ['How should I prepare for NEET UG?', 'What score do I need for AIIMS Delhi?', 'Which coaching is best for NEET?', 'What after MBBS in India?'],
    engineering: ['How do I crack JEE Main in first attempt?', 'What are the best IIT branches?', 'How to get a software job after B.Tech?', 'Should I go for GATE or placements?'],
    'iit-jee': ['What rank do I need for IIT Bombay CS?', 'How many hours should I study for JEE?', 'How is JEE Advanced different from Main?', 'Best books for JEE preparation?'],
    'gate-mtech': ['When should I start GATE preparation?', 'Is GATE score valid for PSU recruitment?', 'Which GATE paper should I choose?', 'IISc vs IIT for M.Tech — which is better?'],
    upsc: ['How many attempts does UPSC CSE allow?', 'Which optional subject is best for UPSC?', 'How to read newspaper effectively for UPSC?', 'UPSC strategy for working professionals?'],
    'ssc-cgl': ['What is the best book for SSC CGL math?', 'How many months for SSC CGL preparation?', 'SSC CGL vs IBPS PO — which is better?', 'How to improve English for SSC exams?'],
    banking: ['IBPS PO vs SBI PO — which to prefer?', 'How to prepare for banking awareness?', 'What is the RBI Grade B salary?', 'How many attempts for IBPS PO?']
  };
  return questions[career] || ['What career suits me best?', 'How to plan my studies?', 'Which exams should I take?', 'How to get a scholarship?'];
}

async function generateOfflineAdvice(messages, profile, onToken) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content?.toLowerCase() || '';
  const career = profile?.selectedCareer || 'engineering';
  const stage = profile?.class || '11';
  const name = profile?.name || 'Student';
  const stageName = store.getStageLabel(stage);

  let response = '';

  if (lastUserMsg.includes('score') || lastUserMsg.includes('aiims') || lastUserMsg.includes('rank')) {
    response = `### 🎯 Score & Rank Planning for ${name} (${stageName})

Cutoffs and target ranks change by exam year, course, category, state quota, institute, and available seats. Offline demo mode does not have live cutoff data, so I should not promise one universal score or rank.

**A practical approach for your current stage (${stageName}):**
1. Open the current official notification and official previous-year opening/closing ranks or cutoff marks for your exact course and category.
2. Compare the same quota, category, course, and exam year rather than comparing an overall rank with a category-specific cutoff.
3. Create reach, target, and safer options using at least two or three years of published results.
4. Track mock-test accuracy, subject-wise errors, and score trends; review missed questions after each test.
5. Use the Exam Tracker's official-site links and verify current rules before making an application decision.`;
  } else if (lastUserMsg.includes('book') || lastUserMsg.includes('resource') || lastUserMsg.includes('material')) {
    response = `### 📚 Recommended Books & Resources for ${name}

Here are the highest-yield books tailored for **${career.toUpperCase()}** at the **${stageName}** level:

- **Biology / Medical**:
  - *NCERT Biology (Class 11 & 12)* — A core source for concepts and textbook-aligned biology preparation; confirm the current syllabus and question pattern.
  - *Dr. Ali Objective Biology* or *MTG NCERT at your Fingertips*.
- **Physics**:
  - *Concepts of Physics by H.C. Verma (Vol 1 & 2)* for conceptual clarity.
  - *D.C. Pandey (Arihant)* for extensive numerical practice.
- **Chemistry**:
  - *NCERT Inorganics & Organics* line-by-line.
  - *M.S. Chouhan* for Organic Chemistry & *N. Awasthi* for Physical Chemistry.
- **General Studies & Civil Services**:
  - *Indian Polity by M. Laxmikanth*.
  - *A Brief History of Modern India by Spectrum*.

💡 **Pro Tip**: Limit your resources to 1-2 standard books per subject and revise them 3 times instead of reading 5 different books once.`;
  } else if (lastUserMsg.includes('prepare') || lastUserMsg.includes('strategy') || lastUserMsg.includes('how to') || lastUserMsg.includes('plan')) {
    response = `### 🚀 Action Strategy for ${name} (${stageName})

Here is your customized roadmap for **${career.replace('-', ' ').toUpperCase()}**:

1. **Daily Study Block (4-6 Hours)**:
   - **Morning (2 hrs)**: High-concentration theory & concept learning (e.g. Physics / Math formulas).
   - **Afternoon (2 hrs)**: Active problem solving / NCERT line-by-line reading.
   - **Evening (1.5 hrs)**: 50 timed MCQs and error journal logging.
2. **Weekly Milestone Tracker**:
   - Complete 1 chapter per major subject per week.
   - Give 1 sectional mock test every Sunday.
3. **Current Stage Focus (${stageName})**:
   - Check the **My Roadmap** tab in Career Navigator to see the stage milestones specifically mapped to your class.
   - Mark items as done to keep your progress score advancing!

*Live Gemini responses use the API quota and terms of the Google account associated with your key.*`;
  } else if (lastUserMsg.includes('scholarship') || lastUserMsg.includes('internship') || lastUserMsg.includes('financial')) {
    response = `### 💰 Opportunities & Financial Aid for ${name}

Based on your stage (**${stageName}**):

- **INSPIRE Scholarship (DST)**: review the current official eligibility, selection route, eligible course, and award amount.
- **PM YASASVI Scholarship**: check the current scheme notice for eligible classes, categories, income limits, and award amount.
- **Google STEP & Microsoft Explore Internships**: For 1st & 2nd year college students.
- **National Overseas Scholarship**: Full financial support for students pursuing Master's and PhD abroad.

👉 Check the **Opportunities** tab on the navigation bar to see full eligibility rules and direct application links!`;
  } else {
    response = `### 🧭 Career Guidance for ${name}

Thank you for your question regarding **${career.replace('-', ' ')}** at the **${stageName}** stage!

Here are the key takeaways for your current stage:
- **Foundations First**: In ${stageName}, mastering core fundamentals sets the benchmark for all competitive entrance exams.
- **Track Deadlines**: Indian national entrance windows (like NTA NEET & JEE, UPSC, and SSC) have strict application windows. Visit our **Exams** tab to monitor countdowns and official portals.
- **Milestone Progress**: Your personalized dashboard has milestones ready. Complete at least one high-priority milestone this week.

*Ask me about:*
- Specific book recommendations
- Score & cutoff targets
- Daily study timetable
- Coaching vs self-study strategies`;
  }

  // Simulate token streaming
  if (onToken) {
    const words = response.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onToken(words[i] + ' ', current);
      // Small pause for realistic AI streaming feel
      await new Promise(r => setTimeout(r, 20));
    }
    return current;
  }
  return response;
}

