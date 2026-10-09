// src/db/seed.js — Demo seed data for users, profiles, and initial state

export const DEMO_USERS = [
  {
    id: 'user-neet-1',
    email: 'priya@student.in',
    password: 'password123',
    name: 'Priya Sharma',
    role: 'student',
    createdAt: '2026-01-15T10:00:00.000Z',
    profile: {
      id: 'profile-neet-1',
      userId: 'user-neet-1',
      name: 'Priya Sharma',
      class: '11',
      stream: 'science',
      selectedCareer: 'medicine',
      targetExam: 'NEET UG 2027',
      targetYear: '2027',
      studyHours: '6 hrs/day',
      bio: 'Aspiring doctor passionate about neurology and community healthcare.',
      school: 'Delhi Public School, R.K. Puram',
      city: 'New Delhi',
      interests: ['biology', 'chemistry', 'healthcare', 'research'],
      badges: ['Early Explorer', 'Biology Enthusiast', 'Streak 7 Days'],
      updatedAt: new Date().toISOString()
    },
    progress: {
      id: 'prog-neet-1',
      profileId: 'profile-neet-1',
      completedMilestones: ['m-med-11-1'],
      savedOpportunities: ['opp-inspire', 'opp-kvpy'],
      notes: {
        'm-med-11-1': 'Completed NCERT Human Physiology unit. Revision scheduled for Sunday.'
      },
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'user-jee-2',
    email: 'rohan@student.in',
    password: 'password123',
    name: 'Rohan Gupta',
    role: 'student',
    createdAt: '2026-01-20T10:00:00.000Z',
    profile: {
      id: 'profile-jee-2',
      userId: 'user-jee-2',
      name: 'Rohan Gupta',
      class: '12',
      stream: 'science',
      selectedCareer: 'engineering',
      targetExam: 'JEE Advanced 2027',
      targetYear: '2027',
      studyHours: '8 hrs/day',
      bio: 'Future computer engineer eager to build distributed systems and AI software.',
      school: 'Kendriya Vidyalaya IIT Powai',
      city: 'Mumbai',
      interests: ['math', 'physics', 'coding', 'technology'],
      badges: ['Math Wizard', 'Code Ninja', 'Mock Test Pro'],
      updatedAt: new Date().toISOString()
    },
    progress: {
      id: 'prog-jee-2',
      profileId: 'profile-jee-2',
      completedMilestones: ['m-eng-12-1', 'm-eng-12-3'],
      savedOpportunities: ['opp-google-stem'],
      notes: {},
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'user-upsc-3',
    email: 'ananya@student.in',
    password: 'password123',
    name: 'Ananya Verma',
    role: 'aspirant',
    createdAt: '2026-02-01T10:00:00.000Z',
    profile: {
      id: 'profile-upsc-3',
      userId: 'user-upsc-3',
      name: 'Ananya Verma',
      class: 'ug',
      stream: 'arts',
      selectedCareer: 'upsc',
      targetExam: 'UPSC CSE 2028',
      targetYear: '2028',
      studyHours: '7 hrs/day',
      bio: 'Undergraduate student preparing for Indian Administrative Service (IAS).',
      school: 'Lady Shri Ram College, DU',
      city: 'Delhi',
      interests: ['history', 'polity', 'geography', 'economics'],
      badges: ['Current Affairs Avid', 'Debate Champion'],
      updatedAt: new Date().toISOString()
    },
    progress: {
      id: 'prog-upsc-3',
      profileId: 'profile-upsc-3',
      completedMilestones: ['m-upsc-ug-1', 'm-upsc-ug-3'],
      savedOpportunities: ['opp-pm-fellowship'],
      notes: {},
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'user-foundation-4',
    email: 'kabir@student.in',
    password: 'password123',
    name: 'Kabir Mehta',
    role: 'student',
    createdAt: '2026-02-10T10:00:00.000Z',
    profile: {
      id: 'profile-foundation-4',
      userId: 'user-foundation-4',
      name: 'Kabir Mehta',
      class: '8',
      stream: 'na',
      selectedCareer: 'iit-jee',
      targetExam: 'NSEJS / NTSE Stage 1',
      targetYear: '2028',
      studyHours: '3 hrs/day',
      bio: 'Middle school explorer curious about robotics, space, and math olympiads.',
      school: 'St. Xavier\'s High School',
      city: 'Bengaluru',
      interests: ['math', 'physics', 'technology', 'research'],
      badges: ['Young Explorer', 'Curiosity Spark'],
      updatedAt: new Date().toISOString()
    },
    progress: {
      id: 'prog-foundation-4',
      profileId: 'profile-foundation-4',
      completedMilestones: ['m-iit-8-1'],
      savedOpportunities: ['opp-ntse'],
      notes: {},
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'user-bank-5',
    email: 'neha@student.in',
    password: 'password123',
    name: 'Neha Sen',
    role: 'student',
    createdAt: '2026-03-01T10:00:00.000Z',

    profile: {
      id: 'profile-bank-5',
      userId: 'user-bank-5',
      name: 'Neha Sen',
      class: 'grad',
      stream: 'commerce',
      selectedCareer: 'banking',
      targetExam: 'IBPS PO',
      targetYear: '2027',
      studyHours: '5 hrs/day',
      bio: 'Graduate preparing for banking and government examinations.',
      school: 'Demo University',
      city: 'Visakhapatnam',
      interests: ['economics', 'math', 'english', 'finance'],
      badges: ['Banking Explorer', 'Aptitude Builder'],
      updatedAt: new Date().toISOString()
    },

    progress: {
      id: 'prog-bank-5',
      profileId: 'profile-bank-5',
      completedMilestones: ['m-bank-grad-1'],
      savedOpportunities: [],
      notes: {},
      updatedAt: new Date().toISOString()
    }
  }

];
