// src/db/schema.js — Schema definitions and collection keys

export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  PROGRESS: 'progress',
  CAREERS: 'careers',
  EXAMS: 'exams',
  OPPORTUNITIES: 'opportunities',
  SETTINGS: 'settings',
};

export const SCHEMA_DEFINITIONS = {
  [COLLECTIONS.USERS]: {
    keyPath: 'id',
    indexes: [
      { name: 'email', keyPath: 'email', options: { unique: true } }
    ]
  },
  [COLLECTIONS.PROFILES]: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'selectedCareer', keyPath: 'selectedCareer', options: { unique: false } }
    ]
  },
  [COLLECTIONS.PROGRESS]: {
    keyPath: 'id',
    indexes: [
      { name: 'profileId', keyPath: 'profileId', options: { unique: false } }
    ]
  },
  [COLLECTIONS.CAREERS]: {
    keyPath: 'id',
    indexes: []
  },
  [COLLECTIONS.EXAMS]: {
    keyPath: 'id',
    indexes: []
  },
  [COLLECTIONS.OPPORTUNITIES]: {
    keyPath: 'id',
    indexes: []
  },
  [COLLECTIONS.SETTINGS]: {
    keyPath: 'key',
    indexes: []
  }
};
