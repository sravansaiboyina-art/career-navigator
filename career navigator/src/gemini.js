// gemini.js — Google Gemini API client

import { store } from './store.js';

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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const token = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (token) {
                fullText += token;
                onToken(token, fullText);
              }
            } catch { /* skip malformed SSE */ }
          }
        }
      }
      return fullText;
    } else {
      // Non-streaming mode
      const url = GEMINI_API_URL;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      const url = `${GEMINI_API_URL}?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    response = `### 🎯 Cutoff & Score Targets for ${name} (${stageName})

For **${career === 'medicine' ? 'NEET UG & AIIMS Delhi' : career === 'engineering' || career === 'iit-jee' ? 'IITs & JEE Advanced' : 'Target Entrances'}**:

- **AIIMS Delhi / Top Medical Colleges**: Target **705+ / 720** in NEET UG. General cutoff usually sits around All India Rank (AIR) 50-60.
- **Top IITs (Bombay/Delhi CS)**: Target a score in the top 100 AIR in JEE Advanced (typically 80%+ marks in JEE Advanced).
- **NITs Top Branches**: 99.2+ percentile in JEE Main (210+ marks out of 300).
- **UPSC Prelims**: Aim for 105+ in GS Paper 1 and 33% qualifying in CSAT.

**Actionable Advice for your current stage (${stageName}):**
1. Track your error percentage per test paper rather than raw marks.
2. Aim for 85%+ accuracy in mock tests before working on speed.
3. Dedicate 2 hours after every test solely to analyze questions you got wrong!`;
  } else if (lastUserMsg.includes('book') || lastUserMsg.includes('resource') || lastUserMsg.includes('material')) {
    response = `### 📚 Recommended Books & Resources for ${name}

Here are the highest-yield books tailored for **${career.toUpperCase()}** at the **${stageName}** level:

- **Biology / Medical**:
  - *NCERT Biology (Class 11 & 12)* — The definitive bible (90% of NEET is directly from NCERT).
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

*You can also connect a live Gemini API key in the top right for infinite conversational questions!*`;
  } else if (lastUserMsg.includes('scholarship') || lastUserMsg.includes('internship') || lastUserMsg.includes('financial')) {
    response = `### 💰 Opportunities & Financial Aid for ${name}

Based on your stage (**${stageName}**):

- **INSPIRE Scholarship (DST)**: ₹80,000/year for students in top 1% of Class 10/12 board exams pursuing natural sciences or medicine.
- **PM YASASVI Scholarship**: For Class 9-12 students up to ₹1,25,000/year.
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

