// src/db/index.js — Browser database for the demo prototype.
// Important: client-side storage is not a production authentication backend.
import { dbConfig, dbStatus, ConnectionState } from './config.js';
import { COLLECTIONS, SCHEMA_DEFINITIONS } from './schema.js';
import { DEMO_USERS } from './seed.js';

const PASSWORD_ITERATIONS = 210000;

function toHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value) {
  if (typeof value !== 'string' || !/^(?:[0-9a-f]{2})+$/i.test(value)) return null;
  return new Uint8Array(value.match(/.{2}/g).map((pair) => parseInt(pair, 16)));
}

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Secure password hashing is unavailable in this browser. Open the app over HTTPS or localhost and try again.');
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return {
    passwordHash: toHex(new Uint8Array(bits)),
    passwordSalt: toHex(salt),
    passwordAlgorithm: 'PBKDF2-SHA-256',
    passwordIterations: PASSWORD_ITERATIONS
  };
}

async function verifyPassword(password, user) {
  // One-time compatibility migration for accounts created by older demo versions.
  if (typeof user.password === 'string' && !user.passwordHash) {
    if (user.password !== password) return false;
    const hashed = await hashPassword(password);
    const migrated = { ...user, ...hashed };
    delete migrated.password;
    await db.put(COLLECTIONS.USERS, migrated);
    delete user.password;
    Object.assign(user, migrated);
    return true;
  }

  const salt = fromHex(user.passwordSalt);
  const expected = fromHex(user.passwordHash);
  if (!salt || !expected || !globalThis.crypto?.subtle) return false;

  const iterations = Number.isInteger(user.passwordIterations)
    ? Math.min(Math.max(user.passwordIterations, 100000), 1000000)
    : PASSWORD_ITERATIONS;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    expected.length * 8
  ));
  if (bits.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < bits.length; i++) mismatch |= bits[i] ^ expected[i];
  return mismatch === 0;
}

function publicUser(user) {
  if (!user) return null;
  const { id, email, name, role, createdAt } = user;
  return { id, email, name, role: role || 'student', createdAt };
}

class DatabaseService {
  constructor() {
    this.db = null;
    this.isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
    this.activeDriver = this.isIndexedDBAvailable && dbConfig.driver === 'indexeddb' ? 'indexeddb' : 'localstorage';
    this.initialized = false;
    this.initPromise = null;
  }

  async connect() {
    if (this.initialized) return this;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      dbStatus.setState(ConnectionState.CONNECTING);
      try {
        if (this.activeDriver === 'indexeddb') {
          await this._initIndexedDB();
        } else {
          this._initLocalStorage();
        }
        this.initialized = true;
        dbStatus.driver = this.activeDriver;
        dbStatus.setState(ConnectionState.CONNECTED);
        if (dbConfig.autoSeed) await this.ensureSeeded();
        return this;
      } catch (err) {
        console.warn('[Database] IndexedDB initialization failed; falling back to LocalStorage:', err);
        this.activeDriver = 'localstorage';
        dbStatus.driver = 'localstorage';
        this._initLocalStorage();
        this.initialized = true;
        dbStatus.setState(ConnectionState.CONNECTED);
        if (dbConfig.autoSeed) await this.ensureSeeded();
        return this;
      }
    })().catch((err) => {
      this.initPromise = null;
      dbStatus.setState(ConnectionState.ERROR, err);
      throw err;
    });

    return this.initPromise;
  }

  _initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbConfig.name, dbConfig.version);
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        Object.entries(SCHEMA_DEFINITIONS).forEach(([name, definition]) => {
          let objectStore;
          if (!database.objectStoreNames.contains(name)) {
            objectStore = database.createObjectStore(name, { keyPath: definition.keyPath });
          } else {
            objectStore = event.target.transaction.objectStore(name);
          }
          (definition.indexes || []).forEach((index) => {
            if (!objectStore.indexNames.contains(index.name)) {
              objectStore.createIndex(index.name, index.keyPath, index.options || {});
            }
          });
        });
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.db.onversionchange = () => this.db?.close();
        resolve();
      };
      request.onerror = (event) => reject(event.target.error);
      request.onblocked = () => reject(new Error('Database upgrade is blocked by another open Career Navigator tab. Close other tabs and reload.'));
    });
  }

  _initLocalStorage() {
    Object.values(COLLECTIONS).forEach((collection) => {
      const key = `cn_db_${collection}`;
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({}));
    });
  }

  async ensureSeeded() {
    const existingUsers = await this.getAll(COLLECTIONS.USERS);
    if (existingUsers.length > 0) return;
    for (const demo of DEMO_USERS) {
      const hashed = await hashPassword(demo.password);
      const user = { ...publicUser(demo), ...hashed };
      await this.put(COLLECTIONS.USERS, user);
      if (demo.profile) await this.put(COLLECTIONS.PROFILES, demo.profile);
      if (demo.progress) await this.put(COLLECTIONS.PROGRESS, demo.progress);
    }
  }

  async get(collection, key) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(collection, 'readonly');
        const request = transaction.objectStore(collection).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    }
    const data = JSON.parse(localStorage.getItem(`cn_db_${collection}`) || '{}');
    return data[key] || null;
  }

  async getAll(collection) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(collection, 'readonly');
        const request = transaction.objectStore(collection).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
    const data = JSON.parse(localStorage.getItem(`cn_db_${collection}`) || '{}');
    return Object.values(data);
  }

  async put(collection, item) {
    await this.connect();
    const keyPath = SCHEMA_DEFINITIONS[collection]?.keyPath || 'id';
    if (!item || item[keyPath] == null) throw new Error(`A ${keyPath} is required for ${collection}.`);

    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(collection, 'readwrite');
        const request = transaction.objectStore(collection).put(item);
        request.onsuccess = () => resolve(item);
        request.onerror = () => reject(request.error);
        transaction.onabort = () => reject(transaction.error || new Error('Database write aborted.'));
      });
    }
    const raw = localStorage.getItem(`cn_db_${collection}`);
    const data = raw ? JSON.parse(raw) : {};
    data[item[keyPath]] = item;
    localStorage.setItem(`cn_db_${collection}`, JSON.stringify(data));
    return item;
  }

  async delete(collection, key) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(collection, 'readwrite');
        const request = transaction.objectStore(collection).delete(key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    }
    const data = JSON.parse(localStorage.getItem(`cn_db_${collection}`) || '{}');
    delete data[key];
    localStorage.setItem(`cn_db_${collection}`, JSON.stringify(data));
    return true;
  }

  async query(collection, filterFn) {
    return (await this.getAll(collection)).filter(filterFn);
  }

  async clear(collection) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(collection, 'readwrite');
        const request = transaction.objectStore(collection).clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    }
    localStorage.setItem(`cn_db_${collection}`, JSON.stringify({}));
    return true;
  }

  async authenticate(email, password) {
    await this.connect();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || typeof password !== 'string' || !password) return null;
    const users = await this.getAll(COLLECTIONS.USERS);
    const user = users.find((candidate) => String(candidate.email || '').toLowerCase() === normalizedEmail);
    if (!user || !(await verifyPassword(password, user))) return null;

    const profile = await this.get(COLLECTIONS.PROFILES, `profile-${user.id}`) ||
      (await this.getAll(COLLECTIONS.PROFILES)).find((item) => item.userId === user.id) || null;
    const progress = profile
      ? (await this.getAll(COLLECTIONS.PROGRESS)).find((item) => item.profileId === profile.id) || null
      : null;

    return { user: publicUser(user), profile, progress };
  }

  async register(userData, profileData = {}) {
    await this.connect();
    const name = String(userData?.name || '').trim();
    const email = String(userData?.email || '').trim().toLowerCase();
    const password = userData?.password;
    if (name.length < 2 || name.length > 100) throw new Error('Enter a name between 2 and 100 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      throw new Error('Password must be between 8 and 128 characters.');
    }

    const users = await this.getAll(COLLECTIONS.USERS);
    if (users.some((user) => String(user.email || '').toLowerCase() === email)) {
      throw new Error('An account with this email already exists.');
    }

    const userId = 'user-' + crypto.randomUUID();
    const user = {
      id: userId, email, name, role: userData.role || 'student',
      createdAt: new Date().toISOString(), ...(await hashPassword(password))
    };
    await this.put(COLLECTIONS.USERS, user);

    const profile = {
      id: `profile-${userId}`,
      userId,
      name,
      class: profileData.class || '11',
      stream: profileData.stream || 'science',
      selectedCareer: profileData.selectedCareer || 'medicine',
      targetExam: profileData.targetExam || '',
      targetYear: profileData.targetYear || '2027',
      studyHours: profileData.studyHours || '4-6 hrs/day',
      bio: profileData.bio || 'Eager learner navigating academic paths.',
      interests: Array.isArray(profileData.interests) ? profileData.interests : ['biology', 'chemistry'],
      badges: ['New Explorer'],
      updatedAt: new Date().toISOString()
    };
    const progress = {
      id: `prog-${profile.id}`,
      profileId: profile.id,
      completedMilestones: [],
      savedOpportunities: [],
      trackedExams: [],
      notes: {},
      updatedAt: new Date().toISOString()
    };

    try {
      await this.put(COLLECTIONS.PROFILES, profile);
      await this.put(COLLECTIONS.PROGRESS, progress);
    } catch (error) {
      await Promise.all([
        this.delete(COLLECTIONS.USERS, userId),
        this.delete(COLLECTIONS.PROFILES, profile.id),
        this.delete(COLLECTIONS.PROGRESS, progress.id)
      ].map((operation) => operation.catch(() => {})));
      throw error;
    }
    return { user: publicUser(user), profile, progress };
  }
}

export const db = new DatabaseService();
export { COLLECTIONS };
