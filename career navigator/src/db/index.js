// src/db/index.js — Unified Client Database Layer (IndexedDB with LocalStorage fallback)
import { dbConfig, dbStatus, ConnectionState } from './config.js';
import { COLLECTIONS, SCHEMA_DEFINITIONS } from './schema.js';
import { DEMO_USERS } from './seed.js';

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
        dbStatus.setState(ConnectionState.CONNECTED);
        
        // Auto seed demo data if needed
        if (dbConfig.autoSeed) {
          await this.ensureSeeded();
        }
        return this;
      } catch (err) {
        console.warn('[Database] IndexedDB initialization failed, falling back to LocalStorage:', err);
        this.activeDriver = 'localstorage';
        dbStatus.driver = 'localstorage';
        this._initLocalStorage();
        this.initialized = true;
        dbStatus.setState(ConnectionState.CONNECTED);
        if (dbConfig.autoSeed) {
          await this.ensureSeeded();
        }
        return this;
      }
    })();

    return this.initPromise;
  }

  _initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbConfig.name, dbConfig.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        Object.entries(SCHEMA_DEFINITIONS).forEach(([name, def]) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath: def.keyPath });
            (def.indexes || []).forEach(idx => {
              store.createIndex(idx.name, idx.keyPath, idx.options || {});
            });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  _initLocalStorage() {
    // Ensure all storage keys exist
    Object.values(COLLECTIONS).forEach(col => {
      const key = `cn_db_${col}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({}));
      }
    });
  }

  async ensureSeeded() {
    const existingUsers = await this.getAll(COLLECTIONS.USERS);
    if (!existingUsers || existingUsers.length === 0) {
      if (console) console.log('[Database] Seeding initial demo data...');
      for (const u of DEMO_USERS) {
        await this.put(COLLECTIONS.USERS, {
          id: u.id,
          email: u.email,
          password: u.password,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt
        });
        if (u.profile) {
          await this.put(COLLECTIONS.PROFILES, u.profile);
        }
        if (u.progress) {
          await this.put(COLLECTIONS.PROGRESS, u.progress);
        }
      }
    }
  }

  // Generic DB Operations
  async get(collection, key) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(collection, 'readonly');
        const store = tx.objectStore(collection);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } else {
      const data = JSON.parse(localStorage.getItem(`cn_db_${collection}`) || '{}');
      return data[key] || null;
    }
  }

  async getAll(collection) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(collection, 'readonly');
        const store = tx.objectStore(collection);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } else {
      const data = JSON.parse(localStorage.getItem(`cn_db_${collection}`) || '{}');
      return Object.values(data);
    }
  }

  async put(collection, item) {
    await this.connect();
    const keyProp = SCHEMA_DEFINITIONS[collection]?.keyPath || 'id';
    const key = item[keyProp];

    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
      });
    } else {
      const raw = localStorage.getItem(`cn_db_${collection}`);
      const data = raw ? JSON.parse(raw) : {};
      data[key] = item;
      localStorage.setItem(`cn_db_${collection}`, JSON.stringify(data));
      return item;
    }
  }

  async delete(collection, key) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } else {
      const data = JSON.parse(localStorage.getItem(`cn_db_${collection}`) || '{}');
      delete data[key];
      localStorage.setItem(`cn_db_${collection}`, JSON.stringify(data));
      return true;
    }
  }

  async query(collection, filterFn) {
    const all = await this.getAll(collection);
    return all.filter(filterFn);
  }

  async clear(collection) {
    await this.connect();
    if (this.activeDriver === 'indexeddb') {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(collection, 'readwrite');
        const store = tx.objectStore(collection);
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } else {
      localStorage.setItem(`cn_db_${collection}`, JSON.stringify({}));
      return true;
    }
  }

  // Authentication & Session helpers
  async authenticate(email, password) {
    await this.connect();
    const users = await this.getAll(COLLECTIONS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return null;

    const profile = await this.get(COLLECTIONS.PROFILES, `profile-${user.id}`) ||
      (await this.getAll(COLLECTIONS.PROFILES)).find(p => p.userId === user.id) ||
      null;

    const progress = profile ? (await this.get(COLLECTIONS.PROGRESS, `prog-${user.id}`) ||
      (await this.getAll(COLLECTIONS.PROGRESS)).find(pr => pr.profileId === profile.id) || null) : null;

    return { user, profile, progress };
  }

  async register(userData, profileData = {}) {
    await this.connect();
    const users = await this.getAll(COLLECTIONS.USERS);
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const userId = 'user-' + crypto.randomUUID();
    const user = {
      id: userId,
      email: userData.email.trim(),
      password: userData.password,
      name: userData.name.trim(),
      role: userData.role || 'student',
      createdAt: new Date().toISOString()
    };
    await this.put(COLLECTIONS.USERS, user);

    const profileId = 'profile-' + userId;
    const profile = {
      id: profileId,
      userId: userId,
      name: user.name,
      class: profileData.class || '11',
      stream: profileData.stream || 'science',
      selectedCareer: profileData.selectedCareer || 'medicine',
      targetExam: profileData.targetExam || '',
      targetYear: profileData.targetYear || '2027',
      studyHours: profileData.studyHours || '4-6 hrs/day',
      bio: profileData.bio || 'Eager learner navigating academic paths.',
      interests: profileData.interests || ['biology', 'chemistry'],
      badges: ['New Explorer'],
      updatedAt: new Date().toISOString()
    };
    await this.put(COLLECTIONS.PROFILES, profile);

    const progress = {
      id: 'prog-' + profileId,
      profileId: profileId,
      completedMilestones: [],
      savedOpportunities: [],
      notes: {},
      updatedAt: new Date().toISOString()
    };
    await this.put(COLLECTIONS.PROGRESS, progress);

    return { user, profile, progress };
  }
}

export const db = new DatabaseService();
export { COLLECTIONS };
