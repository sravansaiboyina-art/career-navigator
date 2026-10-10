// src/config/env.js — Environment variable loader & typed config

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

export const env = {
  appName: metaEnv.VITE_APP_NAME || 'Career Navigator',
  appTagline: metaEnv.VITE_APP_TAGLINE || 'AI-Powered Career Guidance for Indian Students',
  appVersion: metaEnv.VITE_APP_VERSION || '1.0.0-phase1',
  appEnv: metaEnv.VITE_APP_ENV || 'development',

  db: {
    type: metaEnv.VITE_DB_TYPE || 'indexeddb',
    name: metaEnv.VITE_DB_NAME || 'career_navigator_db',
    version: parseInt(metaEnv.VITE_DB_VERSION || '2', 10),
  },

  demoSeed: metaEnv.VITE_DEMO_SEED === 'true',
  defaultPersona: metaEnv.VITE_DEMO_DEFAULT_PERSONA || 'neet',
  enableAI: metaEnv.VITE_ENABLE_AI === 'true', // False for Phase 1
  debug: metaEnv.VITE_DEBUG === 'true',

  isDev: metaEnv.DEV || false,
  isProd: metaEnv.PROD || false,
};
