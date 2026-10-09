// src/db/config.js — Database connection parameters and status tracker
import { env } from '../config/env.js';

export const dbConfig = {
  driver: env.db.type, // 'indexeddb' | 'localstorage'
  name: env.db.name,
  version: env.db.version,
  autoSeed: env.demoSeed,
};

export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
};

class DBStatusTracker {
  constructor() {
    this.state = ConnectionState.DISCONNECTED;
    this.driver = dbConfig.driver;
    this.error = null;
    this.listeners = new Set();
  }

  setState(state, error = null) {
    this.state = state;
    this.error = error;
    if (env.debug) {
      console.log(`[Database] State changed: ${state} (driver: ${this.driver})`, error || '');
    }
    this.listeners.forEach(fn => fn(this.getStatus()));
  }

  getStatus() {
    return {
      state: this.state,
      driver: this.driver,
      isConnected: this.state === ConnectionState.CONNECTED,
      error: this.error,
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const dbStatus = new DBStatusTracker();
