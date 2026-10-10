import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const emptyProgress = () => ({
  completedMilestones: [],
  savedOpportunities: [],
  trackedExams: [],
  notes: {}
});

export function createDatabase(databasePath = process.env.DATABASE_PATH || './data/career-navigator.sqlite') {
  const resolvedPath = databasePath === ':memory:' ? databasePath : path.resolve(databasePath);
  if (resolvedPath !== ':memory:') fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

  const raw = new Database(resolvedPath);
  raw.pragma('foreign_keys = ON');
  raw.pragma('journal_mode = WAL');
  raw.pragma('busy_timeout = 5000');
  raw.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress (
      profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_password_reset_expiry ON password_reset_tokens(expires_at);
  `);

  const statements = {
    findUserByEmail: raw.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE'),
    insertUser: raw.prepare('INSERT INTO users (id,email,name,password_hash,password_salt,created_at) VALUES (@id,@email,@name,@passwordHash,@passwordSalt,@createdAt)'),
    insertProfile: raw.prepare('INSERT INTO profiles (id,user_id,data_json,updated_at) VALUES (@id,@userId,@dataJson,@updatedAt)'),
    insertProgress: raw.prepare('INSERT INTO progress (profile_id,data_json,updated_at) VALUES (@profileId,@dataJson,@updatedAt)'),
    getProfileByUser: raw.prepare('SELECT * FROM profiles WHERE user_id = ?'),
    getProgressByProfile: raw.prepare('SELECT * FROM progress WHERE profile_id = ?'),
    upsertProfile: raw.prepare(`UPDATE profiles SET data_json = @dataJson, updated_at = @updatedAt WHERE user_id = @userId`),
    upsertProgress: raw.prepare(`INSERT INTO progress (profile_id,data_json,updated_at) VALUES (@profileId,@dataJson,@updatedAt)
      ON CONFLICT(profile_id) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at`),
    insertSession: raw.prepare('INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (@tokenHash,@userId,@expiresAt,@createdAt)'),
    findSession: raw.prepare('SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?'),
    deleteSession: raw.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    deleteExpiredSessions: raw.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
    deleteSessionsForUser: raw.prepare('DELETE FROM sessions WHERE user_id = ?'),
    insertResetToken: raw.prepare('INSERT INTO password_reset_tokens (token_hash,user_id,expires_at,created_at) VALUES (@tokenHash,@userId,@expiresAt,@createdAt)'),
    deleteResetToken: raw.prepare('DELETE FROM password_reset_tokens WHERE token_hash = ?'),
    deleteResetTokensForUser: raw.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?'),
    deleteExpiredResetTokens: raw.prepare('DELETE FROM password_reset_tokens WHERE expires_at <= ?'),
  };

  const completePasswordResetTransaction = raw.transaction(({ tokenHash, passwordHash, passwordSalt, now }) => {
    const token = raw.prepare('SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ?').get(tokenHash, now);
    if (!token) return null;
    const result = raw.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(passwordHash, passwordSalt, token.user_id);
    if (result.changes !== 1) return null;
    statements.deleteSessionsForUser.run(token.user_id);
    statements.deleteResetTokensForUser.run(token.user_id);
    return token.user_id;
  });

  const createAccountTransaction = raw.transaction(({ user, profile, progress }) => {
    statements.insertUser.run({
      id: user.id, email: user.email, name: user.name,
      passwordHash: user.passwordHash, passwordSalt: user.passwordSalt,
      createdAt: user.createdAt
    });
    statements.insertProfile.run({
      id: profile.id, userId: profile.userId,
      dataJson: JSON.stringify(profile), updatedAt: profile.updatedAt
    });
    statements.insertProgress.run({
      profileId: profile.id, dataJson: JSON.stringify(progress), updatedAt: progress.updatedAt
    });
  });

  function accountForUser(userId) {
    const user = raw.prepare('SELECT id,email,name,created_at FROM users WHERE id = ?').get(userId);
    if (!user) return null;
    const profileRow = statements.getProfileByUser.get(userId);
    const profile = profileRow ? JSON.parse(profileRow.data_json) : null;
    const progressRow = profile ? statements.getProgressByProfile.get(profile.id) : null;
    const progress = progressRow ? JSON.parse(progressRow.data_json) : emptyProgress();
    return {
      user: { id: user.id, email: user.email, name: user.name, role: 'student', createdAt: user.created_at },
      profile,
      progress
    };
  }

  return {
    raw,
    createAccountTransaction,
    findUserByEmail(email) { return statements.findUserByEmail.get(String(email).trim().toLowerCase()) || null; },
    accountForUser,
    createSession(session) {
      statements.deleteExpiredSessions.run(Date.now());
      statements.insertSession.run(session);
    },
    accountForSession(tokenHash) {
      const row = statements.findSession.get(tokenHash, Date.now());
      return row ? accountForUser(row.user_id) : null;
    },
    deleteSession(tokenHash) { statements.deleteSession.run(tokenHash); },
    deleteSessionsForUser(userId) { statements.deleteSessionsForUser.run(userId); },
    createPasswordResetToken(token) {
      statements.deleteExpiredResetTokens.run(Date.now());
      statements.deleteResetTokensForUser.run(token.userId);
      statements.insertResetToken.run(token);
    },
    deletePasswordResetToken(tokenHash) { statements.deleteResetToken.run(tokenHash); },
    completePasswordReset(token) {
      return completePasswordResetTransaction({ ...token, now: Date.now() });
    },
    updateProfile(userId, profile) {
      const updatedAt = new Date().toISOString();
      const result = statements.upsertProfile.run({ userId, dataJson: JSON.stringify({ ...profile, updatedAt }), updatedAt });
      if (result.changes === 0) return null;
      return { ...profile, updatedAt };
    },
    updateProgress(profileId, progress) {
      const updatedAt = new Date().toISOString();
      const value = { ...progress, profileId, updatedAt };
      statements.upsertProgress.run({ profileId, dataJson: JSON.stringify(value), updatedAt });
      return value;
    },
    close() { raw.close(); }
  };
}
