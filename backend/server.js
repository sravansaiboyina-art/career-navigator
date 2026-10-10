import 'dotenv/config';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createDatabase } from './database.js';
import { createPasswordResetMailer } from './email.js';

const scryptAsync = promisify(crypto.scrypt);
const SESSION_COOKIE = 'cn_session';
const MAX_PASSWORD_LENGTH = 128;
const MAX_NOTE_LENGTH = 5000;

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function createPasswordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = await scryptAsync(password, salt, 64);
  return { passwordHash: Buffer.from(hash).toString('hex'), passwordSalt: salt };
}

async function verifyPassword(password, user) {
  const expected = Buffer.from(user.password_hash, 'hex');
  const actual = Buffer.from(await scryptAsync(password, user.password_salt, expected.length));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function safeAccount(account) {
  return { user: account.user, profile: account.profile, progress: account.progress };
}

function parseJsonObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function normalizeProgress(value, profileId) {
  const input = parseJsonObject(value);
  if (!input) throw Object.assign(new Error('Progress must be a JSON object.'), { status: 400 });
  const normalizeIds = (key) => {
    const list = input[key] ?? [];
    if (!Array.isArray(list) || list.length > 5000 || list.some((item) => typeof item !== 'string' || item.length > 180)) {
      throw Object.assign(new Error(`${key} must be an array of valid IDs.`), { status: 400 });
    }
    return [...new Set(list)];
  };
  const inputNotes = input.notes ?? {};
  if (!parseJsonObject(inputNotes)) throw Object.assign(new Error('Notes must be an object.'), { status: 400 });
  const notes = {};
  for (const [key, note] of Object.entries(inputNotes)) {
    if (key.length > 180 || typeof note !== 'string' || note.length > MAX_NOTE_LENGTH) {
      throw Object.assign(new Error('Each note must be a string of at most 5,000 characters.'), { status: 400 });
    }
    notes[key] = note;
  }
  return {
    profileId,
    completedMilestones: normalizeIds('completedMilestones'),
    savedOpportunities: normalizeIds('savedOpportunities'),
    trackedExams: normalizeIds('trackedExams'),
    notes,
    updatedAt: new Date().toISOString()
  };
}

function readCookie(header, name) {
  const prefix = `${name}=`;
  for (const part of String(header || '').split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return '';
}

function cookieHeader(token, { secure, maxAgeSeconds }) {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/api',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    secure ? 'Secure' : ''
  ].filter(Boolean).join('; ');
}

export function createApp({
  database = createDatabase(),
  geminiApiKey = process.env.GEMINI_API_KEY || '',
  geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  sessionMaxAgeDays = Number(process.env.SESSION_MAX_AGE_DAYS || 7),
  nodeEnv = process.env.NODE_ENV || 'development',
  frontendOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  sendPasswordResetEmail = createPasswordResetMailer(process.env)
} = {}) {
  const app = express();
  const production = nodeEnv === 'production';
  const sessionMaxAgeSeconds = Math.min(Math.max(Number(sessionMaxAgeDays) || 7, 1), 30) * 24 * 60 * 60;

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && frontendOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(origin && !frontendOrigins.includes(origin) ? 403 : 204);
    next();
  });
  app.use(express.json({ limit: '64kb', strict: true }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please wait a few minutes and try again.' }
  });

  function currentAccount(req) {
    const token = readCookie(req.headers.cookie, SESSION_COOKIE);
    if (!token || token.length > 200) return null;
    return database.accountForSession(sha256(token));
  }

  function requireAuth(req, res, next) {
    const account = currentAccount(req);
    if (!account?.user || !account?.profile) return res.status(401).json({ error: 'Sign in to continue.' });
    req.account = account;
    next();
  }

  function startSession(res, userId) {
    const token = crypto.randomBytes(32).toString('base64url');
    database.createSession({
      tokenHash: sha256(token),
      userId,
      expiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
      createdAt: new Date().toISOString()
    });
    res.setHeader('Set-Cookie', cookieHeader(token, { secure: production, maxAgeSeconds: sessionMaxAgeSeconds }));
  }

  function clearSession(req, res) {
    const token = readCookie(req.headers.cookie, SESSION_COOKIE);
    if (token && token.length <= 200) database.deleteSession(sha256(token));
    res.setHeader('Set-Cookie', cookieHeader('', { secure: production, maxAgeSeconds: 0 }));
  }

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'career-navigator-api', database: 'sqlite', aiConfigured: Boolean(geminiApiKey) });
  });

  app.post('/api/auth/register', authLimiter, async (req, res, next) => {
    try {
      const body = parseJsonObject(req.body) || {};
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = body.password;
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (name.length < 2 || name.length > 100) return res.status(400).json({ error: 'Name must be between 2 and 100 characters.' });
      if (!emailValid || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' });
      if (typeof password !== 'string' || password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      }
      if (database.findUserByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists.' });

      const userId = crypto.randomUUID();
      const profileId = `profile-${userId}`;
      const now = new Date().toISOString();
      const passwordFields = await createPasswordHash(password);
      const user = { id: userId, email, name, role: 'student', createdAt: now, ...passwordFields };
      const requestedClass = String(body.class || '11');
      const validClasses = new Set(['6','7','8','9','10','11','12','ug','grad']);
      if (!validClasses.has(requestedClass)) return res.status(400).json({ error: 'Choose a valid class or education stage.' });
      const validStreams = new Set(['science','commerce','arts','na']);
      const stream = validStreams.has(body.stream) ? body.stream : 'na';
      const profile = {
        id: profileId, userId, name, class: requestedClass, stream,
        selectedCareer: '',
        targetExam: '', targetYear: String(new Date().getFullYear() + 1),
        studyHours: '4-6 hrs/day',
        bio: 'Eager learner navigating academic paths.',
        interests: [], badges: ['New Explorer'],
        createdAt: now, updatedAt: now
      };
      const progress = {
        id: `prog-${profileId}`, profileId,
        completedMilestones: [], savedOpportunities: [], trackedExams: [], notes: {},
        updatedAt: now
      };
      try {
        database.createAccountTransaction({ user, profile, progress });
      } catch (error) {
        if (String(error?.code || '').includes('SQLITE_CONSTRAINT')) {
          return res.status(409).json({ error: 'An account with this email already exists.' });
        }
        throw error;
      }
      startSession(res, userId);
      return res.status(201).json(safeAccount({ user: { id:userId,email,name,role:'student',createdAt:now }, profile, progress }));
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res, next) => {
    try {
      const body = parseJsonObject(req.body) || {};
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = body.password;
      if (!email || typeof password !== 'string' || !password || password.length > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({ error: 'Enter your email and password.' });
      }
      const user = database.findUserByEmail(email);
      if (!user || !(await verifyPassword(password, user))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      startSession(res, user.id);
      const account = database.accountForUser(user.id);
      return res.json(safeAccount(account));
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/me', requireAuth, (req, res) => res.json(safeAccount(req.account)));

  app.post('/api/auth/logout', (req, res) => {
    clearSession(req, res);
    res.status(204).end();
  });

  const genericResetMessage = 'If an account matches that email and password reset email is configured, reset instructions will be sent shortly.';

  app.post('/api/auth/password-reset/request', authLimiter, async (req, res, next) => {
    try {
      const body = parseJsonObject(req.body) || {};
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 && sendPasswordResetEmail) {
        const user = database.findUserByEmail(email);
        if (user) {
          const token = crypto.randomBytes(32).toString('base64url');
          const tokenHash = sha256(token);
          database.createPasswordResetToken({
            tokenHash,
            userId: user.id,
            expiresAt: Date.now() + 30 * 60 * 1000,
            createdAt: new Date().toISOString()
          });
          try {
            const delivery = sendPasswordResetEmail({ email: user.email, name: user.name, token });
            // Do not wait for SMTP: response time must not disclose whether an email exists.
            Promise.resolve(delivery).catch((error) => {
              database.deletePasswordResetToken(tokenHash);
              console.error('[API] Password reset email delivery failed:', error?.message || 'unknown mail error');
            });
          } catch (error) {
            database.deletePasswordResetToken(tokenHash);
            console.error('[API] Password reset email delivery failed:', error?.message || 'unknown mail error');
          }
        }
      }
      return res.status(202).json({ message: genericResetMessage });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/password-reset/confirm', authLimiter, async (req, res, next) => {
    try {
      const body = parseJsonObject(req.body) || {};
      const token = typeof body.token === 'string' ? body.token.trim() : '';
      const password = body.password;
      if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) return res.status(400).json({ error: 'This reset link is invalid or expired. Request a new one.' });
      if (typeof password !== 'string' || password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      }
      const passwordFields = await createPasswordHash(password);
      const userId = database.completePasswordReset({
        tokenHash: sha256(token),
        passwordHash: passwordFields.passwordHash,
        passwordSalt: passwordFields.passwordSalt
      });
      if (!userId) return res.status(400).json({ error: 'This reset link is invalid or expired. Request a new one.' });
      res.setHeader('Set-Cookie', cookieHeader('', { secure: production, maxAgeSeconds: 0 }));
      return res.json({ message: 'Password updated. Sign in using your new password.' });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/profile', requireAuth, (req, res) => res.json({ profile: req.account.profile }));

  app.put('/api/profile', requireAuth, (req, res, next) => {
    try {
      const body = parseJsonObject(req.body);
      if (!body) return res.status(400).json({ error: 'Profile must be a JSON object.' });
      const current = req.account.profile;
      const allowed = ['name','class','stream','selectedCareer','targetExam','targetYear','studyHours','bio','interests','school','city','avatar','badges'];
      const profile = { ...current };
      for (const key of allowed) {
        if (body[key] !== undefined) profile[key] = body[key];
      }
      if (typeof profile.name !== 'string' || profile.name.trim().length < 2 || profile.name.length > 100) {
        return res.status(400).json({ error: 'Profile name must be between 2 and 100 characters.' });
      }
      if (!Array.isArray(profile.interests) || profile.interests.length > 100 || profile.interests.some((item) => typeof item !== 'string' || item.length > 80)) {
        return res.status(400).json({ error: 'Interests must be a list of valid strings.' });
      }
      const updated = database.updateProfile(req.account.user.id, { ...profile, name: profile.name.trim() });
      if (!updated) return res.status(404).json({ error: 'Student profile was not found.' });
      return res.json({ profile: updated });
    } catch (error) { next(error); }
  });

  app.get('/api/progress', requireAuth, (req, res) => res.json({ progress: req.account.progress }));

  app.put('/api/progress', requireAuth, (req, res, next) => {
    try {
      const progress = normalizeProgress(req.body, req.account.profile.id);
      const updated = database.updateProgress(req.account.profile.id, progress);
      return res.json({ progress: updated });
    } catch (error) { next(error); }
  });

  app.post('/api/ai/chat', requireAuth, async (req, res, next) => {
    try {
      if (!geminiApiKey) return res.json({ configured: false, text: '' });
      const body = parseJsonObject(req.body) || {};
      const messages = body.messages;
      if (!Array.isArray(messages) || messages.length < 1 || messages.length > 20) {
        return res.status(400).json({ error: 'Send between 1 and 20 messages.' });
      }
      const contents = [];
      for (const item of messages) {
        if (!item || !['user','assistant','model'].includes(item.role) || typeof item.content !== 'string' || item.content.length > 10000) {
          return res.status(400).json({ error: 'A chat message is invalid or too long.' });
        }
        contents.push({ role: item.role === 'user' ? 'user' : 'model', parts: [{ text: item.content }] });
      }
      const profile = req.account.profile;
      const systemPrompt = `You are Career Navigator AI, a concise and age-appropriate career guidance assistant for Indian students. The student's preferred name is ${profile.name || 'Student'}; current education stage is ${profile.class}; stream is ${profile.stream || 'not set'}; career goal is ${profile.selectedCareer || 'exploring options'}; interests are ${(profile.interests || []).join(', ')}. Give practical advice and clearly distinguish estimates from official eligibility/deadline information. Never invent current exam dates or guarantee ranks/cutoffs. Direct users to official exam or scholarship notifications when current information is required.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiApiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 1200 }
        }),
        signal: AbortSignal.timeout(30000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return res.status(502).json({ error: 'The AI service could not complete this request. Check the server AI configuration and try again.' });
      const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
      return res.json({ configured: true, text });
    } catch (error) {
      next(error);
    }
  });

  app.use((req, res) => res.status(404).json({ error: 'API route not found.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large.' });
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Request body must be valid JSON.' });
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error('[API]', error);
    res.status(status).json({ error: status >= 500 ? 'The server could not complete the request.' : error.message });
  });

  app.locals.database = database;
  return app;
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  const databasePath = process.env.DATABASE_PATH || './data/career-navigator.sqlite';
  const database = createDatabase(databasePath);
  const app = createApp({ database });
  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || '127.0.0.1';
  const server = app.listen(port, host, () => {
    console.log(`Career Navigator API listening on http://${host}:${port}`);
    console.log(`SQLite database: ${path.resolve(databasePath)}`);
    console.log(`AI service: ${process.env.GEMINI_API_KEY ? 'configured' : 'offline fallback (no GEMINI_API_KEY set)'}`);
  });
  const close = () => server.close(() => {
    database.close();
    process.exit(0);
  });
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}
