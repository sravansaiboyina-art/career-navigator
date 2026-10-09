// src/data/roadmapData.js — Stage-based Roadmap Data for 7 Target Careers
// Stages: 'class-6-8', 'class-9-10', 'class-11-12', 'ug', 'grad-career'

export const ROADMAP_STAGES = [
  { id: 'class-6-8', label: 'Class 6–8', subtitle: 'Middle School · Foundation & Curiosity', icon: '🎒' },
  { id: 'class-9-10', label: 'Class 9–10', subtitle: 'Secondary · Core Boards & Aptitude', icon: '📚' },
  { id: 'class-11-12', label: 'Class 11–12', subtitle: 'Higher Secondary · Entrance Specialization', icon: '🎯' },
  { id: 'ug', label: 'Undergraduate', subtitle: 'College / Degree · Technical & Practical Mastery', icon: '🎓' },
  { id: 'grad-career', label: 'Graduation / Career', subtitle: 'Professional Launch · Advanced Exams & Roles', icon: '🚀' }
];

export function mapClassToStage(cls) {
  if (['6', '7', '8'].includes(cls)) return 'class-6-8';
  if (['9', '10'].includes(cls)) return 'class-9-10';
  if (['11', '12'].includes(cls)) return 'class-11-12';
  if (cls === 'ug') return 'ug';
  if (cls === 'grad') return 'grad-career';
  return 'class-11-12';
}

export const CAREER_ROADMAPS = {
  'medicine': {
    id: 'medicine',
    title: 'Medicine / NEET',
    emoji: '🩺',
    tagline: 'Heal the world through medical science & clinical excellence.',
    description: 'A prestigious journey in healthcare. From building strong biological curiosity in middle school, conquering NEET UG in Class 12, excelling in 5.5 years of MBBS, to clearing NEET PG / NEXT for super-specialty medicine.',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #F97316)',
    stages: {
      'class-6-8': {
        focus: 'Spark curiosity in human biology, nature, and scientific experimentation.',
        whatToLearn: [
          'Human body organ systems (digestive, circulatory, respiratory)',
          'Plant & animal cell structure and basic microscopy',
          'Basics of nutrition, hygiene, disease prevention, and microbes',
          'Scientific method: hypothesis, observation, and deduction'
        ],
        importantSubjects: ['General Science', 'Biology Basics', 'Environmental Studies', 'Introductory Chemistry'],
        skills: ['Curiosity & Observation', 'Scientific Note-taking', 'Diagram Sketching', 'Critical Thinking'],
        exams: ['National Science Olympiad (NSO)', 'Unified International Science Olympiad (UISO)', 'School Science Exhibitions'],
        recommendedActivities: [
          'Set up a home biology journal recording local flora & fauna',
          'Visit a science museum or hospital laboratory exhibition',
          'Read youth science magazines (e.g. Science Reporter, National Geographic Kids)',
          'Participate in school science fairs with human physiology models'
        ],
        possibleNextSteps: [
          'Choose Science & Math focused track in Class 9',
          'Start reading foundational NCERT Science books',
          'Take preliminary diagnostic talent search tests'
        ],
        milestones: [
          { id: 'm-med-f-1', title: 'Complete NCERT Science (Classes 6-8) with personal summaries', priority: 'high', weeks: 12 },
          { id: 'm-med-f-2', title: 'Participate in at least 1 Science Olympiad (NSO)', priority: 'medium', weeks: 8 },
          { id: 'm-med-f-3', title: 'Master 20 fundamental human body system diagrams', priority: 'medium', weeks: 6 }
        ]
      },
      'class-9-10': {
        focus: 'Master NCERT Science fundamentals & build problem-solving stamina.',
        whatToLearn: [
          'Cell biology, tissue classification, genetics & heredity fundamentals',
          'Carbon compounds, chemical equations, acids, bases & salts',
          'Human physiology: life processes, reproduction, control & coordination',
          'Scientific aptitude & quantitative data interpretation'
        ],
        importantSubjects: ['Biology (Life Processes & Genetics)', 'Chemistry (Organic & Inorganic)', 'Physics', 'Mathematics'],
        skills: ['MCQ Speed & Accuracy', 'Analytical Reasoning', 'Concept Mapping', 'Time Management'],
        exams: ['Class 10 CBSE/ICSE/State Boards (Target 90%+ in Science)', 'NTSE (National Talent Search Exam)', 'NSEJS (Junior Science Olympiad)'],
        recommendedActivities: [
          'Solve NCERT Exemplar problems for Class 9 and 10 Science',
          'Conduct basic chemistry and biology practicals in school lab',
          'Attend career counseling seminars on medical pathways and MBBS reality',
          'Read introductory human anatomy references (Dr. A.P.J. Abdul Kalam memoirs)'
        ],
        possibleNextSteps: [
          'Opt for Science Stream with PCB (Physics, Chemistry, Biology) in Class 11',
          'Select coaching/self-study resources for NEET entrance preparation',
          'Set baseline score with a NEET diagnostic diagnostic test'
        ],
        milestones: [
          { id: 'm-med-s-1', title: 'Score 90%+ in Class 10 Board Science', priority: 'high', weeks: 16 },
          { id: 'm-med-s-2', title: 'Finish NCERT Class 9 & 10 Biology line-by-line', priority: 'high', weeks: 10 },
          { id: 'm-med-s-3', title: 'Select PCB stream and finalize NEET 2-year prep plan', priority: 'high', weeks: 2 }
        ]
      },
      'class-11-12': {
        focus: 'Intensive NEET UG preparation — NCERT mastery & high-frequency mock tests.',
        whatToLearn: [
          'Complete NEET Syllabus: Diversity of Living World, Genetics & Evolution, Biotechnology',
          'Organic Chemistry mechanisms, Physical Chemistry formulas, Inorganic NCERT line-by-line',
          'Physics Mechanics, Electrodynamics, Optics, Thermodynamics, Modern Physics',
          'Test strategy: negative marking management & 180 questions in 200 minutes'
        ],
        importantSubjects: ['Biology (Botany + Zoology, 360/720 marks)', 'Chemistry (180/720 marks)', 'Physics (180/720 marks)'],
        skills: ['High-Speed MCQ Solving', 'Exam Pressure Handling', 'Error Log Analysis', 'Memorization via Active Recall'],
        exams: ['NEET UG (National Eligibility cum Entrance Test)', 'Class 12 Board Examinations', 'State CETs (for allied health / BVSc)'],
        recommendedActivities: [
          'Complete NCERT Biology 11th & 12th at least 5 times each',
          'Solve last 15 years NEET & AIPMT previous year question papers (PYQs)',
          'Attempt weekly full-length mock tests under real exam conditions',
          'Maintain an error logbook for every incorrect question solved'
        ],
        possibleNextSteps: [
          'Appear for NEET UG and register for MCC / State Medical Counseling',
          'Secure admission in MBBS, BDS, BAMS, BHMS, or BVSc programs',
          'Explore backup pathways (Biotechnology, B.Pharm, Clinical Psychology)'
        ],
        milestones: [
          { id: 'm-med-11-1', title: 'Read NCERT Biology XI twice & solve 2000 MCQs', priority: 'high', weeks: 16 },
          { id: 'm-med-12-1', title: 'Complete 25 full-length NEET timed mock tests (Target 620+)', priority: 'high', weeks: 20 },
          { id: 'm-med-12-2', title: 'Submit NEET UG application & clear 12th Boards with 80%+', priority: 'high', weeks: 4 }
        ]
      },
      'ug': {
        focus: 'Excel in MBBS coursework, clinical postings, and NEXT / NEET PG foundation.',
        whatToLearn: [
          'Pre-Clinical: Anatomy, Physiology, Biochemistry',
          'Para-Clinical: Pathology, Pharmacology, Microbiology, Forensic Medicine',
          'Clinical: General Medicine, Surgery, Obstetrics & Gynecology, Pediatrics, ENT, Ophthalmology',
          'Clinical bedside examination & diagnostic interpretation'
        ],
        importantSubjects: ['Human Anatomy', 'Pathology & Pharmacology', 'Internal Medicine', 'Surgery & Diagnostics'],
        skills: ['Patient Communication', 'Clinical History Taking', 'Diagnostic Reasoning', 'Surgical Dexterity'],
        exams: ['MBBS Professional University Exams (Prof 1 to Prof 4)', 'NExT (National Exit Test) / NEET PG Prep', 'USMLE Step 1 (if planning abroad)'],
        recommendedActivities: [
          'Daily attendance in hospital outpatient & inpatient clinical postings',
          'Present clinical cases in grand rounds and department symposiums',
          'Publish or participate in an ICMR STS (Short Term Studentship) research project',
          'Use medical question banks (Marrow, Prepladder) for continuous revision'
        ],
        possibleNextSteps: [
          'Complete 1-year compulsory rotatory medical internship (CRMI)',
          'Appear for NExT / NEET PG entrance examination',
          'Choose specialization branch (Radiology, Dermatology, General Medicine, Pediatrics)'
        ],
        milestones: [
          { id: 'm-med-ug-1', title: 'Clear 1st & 2nd Professional MBBS examinations with distinction', priority: 'high', weeks: 52 },
          { id: 'm-med-ug-2', title: 'Complete ICMR student research paper or hospital case presentation', priority: 'medium', weeks: 24 },
          { id: 'm-med-ug-3', title: 'Finish 12-month rotatory medical internship', priority: 'high', weeks: 52 }
        ]
      },
      'grad-career': {
        focus: 'Super-specialty residency (MD/MS/DNB), clinical practice, or fellowship.',
        whatToLearn: [
          'Advanced specialty protocols (Cardiology, Neurology, Surgical Oncology, etc.)',
          'Hospital administration, medical ethics, patient healthcare laws',
          'Evidence-based clinical trials & biomedical research methodologies'
        ],
        importantSubjects: ['MD/MS Specialization', 'Clinical Research', 'Super-Specialty (DM/MCh)'],
        skills: ['Specialist Diagnosis', 'Independent Clinical Decision Making', 'Team Leadership in OT/ICU', 'Medical Ethics'],
        exams: ['NEET SS (Super Specialty) / INI SS', 'FRCS / MRCP (UK exams optional)', 'State Medical Council Registration'],
        recommendedActivities: [
          'Complete 3-year MD/MS junior residency in top tertiary hospital',
          'Publish papers in indexed medical journals (PubMed, Lancet)',
          'Join clinical rotations in emergency medicine & trauma care',
          'Start private clinical practice or join senior hospital consultancy'
        ],
        possibleNextSteps: [
          'Super-specialization (DM in Cardiology / MCh in Neurosurgery)',
          'Consultant Physician / Surgeon in AIIMS / Apollo / Fortis / Govt Hospital',
          'Global clinical practice or international healthcare leadership'
        ],
        milestones: [
          { id: 'm-med-gc-1', title: 'Complete MD/MS residency thesis & final university viva', priority: 'high', weeks: 40 },
          { id: 'm-med-gc-2', title: 'Obtain Permanent Medical Council Registration as Specialist', priority: 'high', weeks: 4 }
        ]
      }
    }
  },

  'engineering': {
    id: 'engineering',
    title: 'Software Engineering',
    emoji: '💻',
    tagline: 'Architect world-class software, systems, and AI technologies.',
    description: 'A transformative pathway in computing. Starting with logic puzzles and basic coding in school, clearing competitive engineering entrances, building production applications during college, to securing SDE roles at top product tech companies.',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    stages: {
      'class-6-8': {
        focus: 'Develop computational thinking, algorithmic logic, and passion for building.',
        whatToLearn: [
          'Visual block programming (Scratch, Blockly)',
          'Fundamentals of computers, operating systems, and internet basics',
          'Introductory Python syntax (variables, loops, conditionals, functions)',
          'Logic puzzles, number theory, and mathematical patterns'
        ],
        importantSubjects: ['Mathematics', 'Computer Science Basics', 'Physics Principles', 'English Comprehension'],
        skills: ['Algorithmic Thinking', 'Logic Building', 'Problem Breakdown', 'Curiosity for Technology'],
        exams: ['Bebras India Computational Thinking Challenge', 'National Cyber Olympiad (NCO)', 'School Hackathons'],
        recommendedActivities: [
          'Build 3 interactive games or animations on Scratch (e.g. maze, pong)',
          'Complete the CS First or Code.org computer science foundations track',
          'Write simple command-line Python scripts (calculator, quiz game)',
          'Participate in robotics or STEM maker workshops'
        ],
        possibleNextSteps: [
          'Upgrade to text-based coding in Python / C++ in Class 9',
          'Study Class 9-10 Math vigorously for future algorithmic problem solving',
          'Explore open source coding communities'
        ],
        milestones: [
          { id: 'm-eng-f-1', title: 'Build and publish 3 Scratch games / interactive stories', priority: 'medium', weeks: 8 },
          { id: 'm-eng-f-2', title: 'Learn Python basics: data types, loops, and functions', priority: 'high', weeks: 10 },
          { id: 'm-eng-f-3', title: 'Participate in the National Cyber Olympiad (NCO)', priority: 'medium', weeks: 4 }
        ]
      },
      'class-9-10': {
        focus: 'Master Object-Oriented Programming, web basics, and advanced mathematics.',
        whatToLearn: [
          'Object-Oriented Programming in Python or Java/C++',
          'Web development fundamentals (HTML5, modern CSS3, basic JavaScript)',
          'Math: Quadratic equations, Coordinate Geometry, Trigonometry, Permutations',
          'Basic data structures: arrays, strings, stacks, and hash tables'
        ],
        importantSubjects: ['Mathematics (Algebra & Geometry)', 'Computer Applications / CS', 'Physics (Mechanics & Circuits)'],
        skills: ['Web Development', 'OOP Principles', 'Debugging Code', 'Competitive Math'],
        exams: ['CBSE/ICSE Class 10 Board Examinations (95%+ in Math & Science)', 'ZCO (Zonal Computing Olympiad)', 'IOI preliminary selection'],
        recommendedActivities: [
          'Build a personal responsive portfolio website and host on GitHub Pages',
          'Create beginner profile on Codeforces, LeetCode, or HackerRank',
          'Participate in school coding competitions and tech symposiums',
          'Explore basic Git commands and version control on GitHub'
        ],
        possibleNextSteps: [
          'Choose Science PCM (Physics, Chemistry, Math) stream in Class 11',
          'Prepare for JEE / BITSAT / State CETs for premier computer science colleges',
          'Build full-stack side projects'
        ],
        milestones: [
          { id: 'm-eng-s-1', title: 'Build and deploy a personal portfolio website on GitHub Pages', priority: 'high', weeks: 6 },
          { id: 'm-eng-s-2', title: 'Solve 50 beginner algorithmic problems on HackerRank / LeetCode', priority: 'high', weeks: 12 },
          { id: 'm-eng-s-3', title: 'Score 90%+ in Class 10 Board Mathematics', priority: 'high', weeks: 16 }
        ]
      },
      'class-11-12': {
        focus: 'Crack JEE Main/Advanced & BITSAT to secure premier CS admissions.',
        whatToLearn: [
          'Advanced Mathematics: Calculus, Vectors, 3D Geometry, Probability',
          'Physics: Mechanics, Electromagnetism, Modern Physics',
          'Chemistry: Physical, Organic, and Inorganic basics',
          'Computer Science elective (C++ / Python, SQL, Networking basics)'
        ],
        importantSubjects: ['Mathematics (Key for Algorithms)', 'Physics', 'Chemistry', 'Computer Science'],
        skills: ['Speed Math', 'High Pressure Test Taking', 'Time Allocation', 'Analytical Rigor'],
        exams: ['JEE Main & JEE Advanced', 'BITSAT (BITS Pilani)', 'VITEEE / MET / MHT-CET / KCET'],
        recommendedActivities: [
          'Solve 2000+ JEE-level problems in Math and Physics',
          'Keep coding recreationally on weekends to preserve developer enthusiasm',
          'Give 30+ full mock tests for JEE Main and BITSAT speed testing',
          'Research top CS programs: IITs, NITs, IIIT Hyderabad, BITS Pilani'
        ],
        possibleNextSteps: [
          'Secure B.Tech / B.E. admission in Computer Science / IT / AI-DS',
          'Join active developer clubs and open-source communities upon college entry',
          'Set up developer workstation (Linux / WSL, VS Code, Git)'
        ],
        milestones: [
          { id: 'm-eng-11-1', title: 'Complete Class 11 JEE Math syllabus (Calculus & Coordinate)', priority: 'high', weeks: 20 },
          { id: 'm-eng-12-1', title: 'Score 98+ percentile in JEE Main or BITSAT 300+', priority: 'high', weeks: 20 },
          { id: 'm-eng-12-2', title: 'Build a full-stack JavaScript / React application', priority: 'medium', weeks: 6 }
        ]
      },
      'ug': {
        focus: 'Data Structures, Algorithms (DSA), System Design, and Summer Internships.',
        whatToLearn: [
          'Core CS: Data Structures & Algorithms, OS, DBMS, Computer Networks',
          'Modern Stack: React/Next.js, Node.js/Go, PostgreSQL, Redis, Docker, AWS',
          'System Design: Caching, Load Balancing, Microservices, Message Queues',
          'Competitive Programming: Trees, Graphs, Dynamic Programming, Greedy'
        ],
        importantSubjects: ['Data Structures & Algorithms', 'Operating Systems', 'DBMS & SQL', 'Computer Networks'],
        skills: ['DSA Problem Solving', 'Full-Stack Development', 'System Architecture', 'Git Collaboration'],
        exams: ['Campus Placement Coding Rounds', 'Google Summer of Code (GSoC)', 'Meta Hacker Cup / ICPC'],
        recommendedActivities: [
          'Solve 350+ LeetCode problems (Blind 75 & Striver SDE Sheet)',
          'Build 2 production-grade full-stack projects with authentication and database',
          'Contribute to open source projects during Google Summer of Code (GSoC)',
          'Secure a 2-month summer internship at a product firm in 3rd year'
        ],
        possibleNextSteps: [
          'Convert summer internship to Full-Time PPO (Pre-Placement Offer)',
          'Apply for off-campus SDE-1 roles at FAANG / Tier-1 tech firms',
          'Consider MS in Computer Science abroad or Startup Founder route'
        ],
        milestones: [
          { id: 'm-eng-ug-1', title: 'Complete Striver SDE Sheet (180 Core DSA Problems)', priority: 'high', weeks: 16 },
          { id: 'm-eng-ug-2', title: 'Crack summer internship at tech company in 3rd year', priority: 'high', weeks: 12 },
          { id: 'm-eng-ug-3', title: 'Deploy a live full-stack web application with 100+ active users', priority: 'medium', weeks: 8 }
        ]
      },
      'grad-career': {
        focus: 'Senior Software Engineer, Tech Lead, Distributed Systems, or AI Engineering.',
        whatToLearn: [
          'High Level & Low Level System Design (HLD/LLD) at scale',
          'Cloud infrastructure: Kubernetes, Terraform, Serverless, CI/CD pipelines',
          'AI / ML engineering: LLM fine-tuning, RAG pipelines, distributed inference',
          'Engineering management, sprint leadership, and code review mentoring'
        ],
        importantSubjects: ['Large-Scale Distributed Systems', 'Cloud Architecture', 'Machine Learning / AI Systems'],
        skills: ['System Scalability (10M+ users)', 'Mentoring Engineers', 'Cloud Cost Optimization', 'Technical Leadership'],
        exams: ['AWS Certified Solutions Architect', 'Google Cloud Professional Architect', 'CKA (Kubernetes)'],
        recommendedActivities: [
          'Lead end-to-end architecture of a high-throughput microservice',
          'Write technical engineering blogs or speak at developer conferences',
          'Participate in architecture reviews and cross-functional product roadmaps',
          'Mentor junior SDEs and contribute to engineering hiring'
        ],
        possibleNextSteps: [
          'Promote to Senior SDE (SDE-2 / SDE-3) or Staff Engineer',
          'Transition to Engineering Manager or VP of Engineering',
          'Found a venture-backed tech startup or become Principal Architect'
        ],
        milestones: [
          { id: 'm-eng-gc-1', title: 'Architect and ship a system handling 100,000+ daily requests', priority: 'high', weeks: 24 },
          { id: 'm-eng-gc-2', title: 'Obtain AWS Solutions Architect or Cloud Certification', priority: 'medium', weeks: 8 }
        ]
      }
    }
  },

  'iit-jee': {
    id: 'iit-jee',
    title: 'IIT / NIT / JEE',
    emoji: '🎓',
    tagline: 'Crack India’s toughest engineering entrance and enter premier institutes.',
    description: 'The golden gateway to IIT Bombay, IIT Delhi, IIT Madras, and top NITs. Requires supreme conceptual mastery in Physics, Chemistry, and Mathematics, exceptional discipline, and psychological resilience.',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    stages: {
      'class-6-8': {
        focus: 'Build deep mathematical problem-solving roots & scientific aptitude.',
        whatToLearn: [
          'Number theory, primes, divisibility, modular arithmetic, algebra',
          'Euclidean geometry, mensuration, angle chaser problems',
          'Physics laws of motion, simple machines, light, electricity experiments',
          'Puzzles from Ramanujan Math Olympiad and Kangaroo Math'
        ],
        importantSubjects: ['Higher Mathematics', 'Analytical Physics', 'General Chemistry'],
        skills: ['Mental Math Agility', 'Spatial Reasoning', 'Tenacity in Problem Solving'],
        exams: ['PRMO / IOQM Preliminary Stage', 'NMTC (National Mathematics Talent Contest)', 'Unified Cyber Olympiad'],
        recommendedActivities: [
          'Solve challenging non-routine math problems for 45 minutes daily',
          'Read books like "The Man Who Knew Infinity" and "Feynman Lectures on Physics (Easy Pieces)"',
          'Join school Olympiad preparation cohort or online problem-solving circles',
          'Participate in district-level science exhibitions'
        ],
        possibleNextSteps: [
          'Enroll in Class 9-10 JEE Foundation program',
          'Attempt IOQM (Indian Olympiad Qualifier in Mathematics)',
          'Strengthen algebra and coordinate geometry'
        ],
        milestones: [
          { id: 'm-iit-f-1', title: 'Solve 500 Olympiad-level math questions from NMTC / IOQM resources', priority: 'high', weeks: 14 },
          { id: 'm-iit-f-2', title: 'Master Class 8 NCERT Mathematics and Science with 95% test score', priority: 'high', weeks: 8 }
        ]
      },
      'class-9-10': {
        focus: 'Advanced PCM foundation & early start on Class 11 concepts.',
        whatToLearn: [
          'Advanced Algebra: Logarithms, Quadratic Equations, Sequences & Series',
          'Physics: Kinematics, Vectors, Newton’s Laws of Motion, Work Energy Power',
          'Chemistry: Mole Concept, Atomic Structure, Periodic Table, Chemical Bonding',
          'Trigonometric identities and coordinate geometry proofs'
        ],
        importantSubjects: ['IIT Foundation Mathematics', 'Classical Mechanics', 'General Chemistry'],
        skills: ['Multi-Step Calculation', 'Vector Analysis', 'Concept Synthesis', 'Speed Reading of Problems'],
        exams: ['IOQM (Indian Olympiad Qualifier in Math)', 'NSEJS (National Standard Exam in Junior Science)', 'Class 10 Board Exams (Target 95%+)'],
        recommendedActivities: [
          'Solve HC Verma Concepts of Physics (Vol 1) introductory chapters',
          'Work through RD Sharma / Hall & Knight Higher Algebra problems',
          'Establish 4-5 hours of dedicated self-study routine outside school',
          'Finalize coaching institute (Allen, FIITJEE, Resonance, Unacademy, or self-prep)'
        ],
        possibleNextSteps: [
          'Pick Science PCM stream with full commitment for Class 11-12',
          'Target Top 500 rank in JEE Advanced',
          'Begin intensive 2-year JEE coaching syllabus'
        ],
        milestones: [
          { id: 'm-iit-s-1', title: 'Clear IOQM or NSEJS Stage 1 benchmark', priority: 'high', weeks: 16 },
          { id: 'm-iit-s-2', title: 'Complete Mole Concept and Kinematics at Class 11 introductory level', priority: 'high', weeks: 10 },
          { id: 'm-iit-s-3', title: 'Score 95%+ in Class 10 Board Examinations', priority: 'high', weeks: 16 }
        ]
      },
      'class-11-12': {
        focus: 'Peak JEE Advanced preparation: 12-hour discipline, deep theory, and mocks.',
        whatToLearn: [
          'Physics: Rotational Dynamics, Fluid Mechanics, SHM, Electromagnetism, Modern Physics (Irodov / HC Verma level)',
          'Math: Integral & Differential Calculus, Coordinate Geometry, Complex Numbers, Vectors & 3D (Cengage level)',
          'Chemistry: Reaction mechanisms, Inorganic NCERT memorization, Thermodynamics, Electrochemistry (MS Chouhan / RC Mukherjee)',
          'Exam mindset: negative mark elimination and selecting right questions in JEE Advanced'
        ],
        importantSubjects: ['JEE Advanced Physics', 'JEE Advanced Mathematics', 'JEE Advanced Chemistry'],
        skills: ['Extreme Analytical Depth', 'Endurance for 6-Hour Exam (Paper 1 + Paper 2)', 'Error Diagnostics', 'Mental Toughness'],
        exams: ['JEE Main (January & April Sessions)', 'JEE Advanced (May/June for IITs)', 'KVPY / Olympiads'],
        recommendedActivities: [
          'Solve previous 20 years of JEE Advanced papers twice',
          'Give full 6-hour Sunday mock tests (Paper 1: 9-12, Paper 2: 2:30-5:30)',
          'Analyze every mock test paper for 3 hours to identify conceptual weak spots',
          'Balance CBSE Class 12 board preparation (75% aggregate requirement for IIT/NIT)'
        ],
        possibleNextSteps: [
          'Participate in JoSAA counseling and lock IIT/NIT dream branch',
          'Enter IIT Bombay / Delhi / Madras / Kanpur / Kharagpur / Roorkee / Guwahati',
          'Prepare for campus orientation and scholarship applications'
        ],
        milestones: [
          { id: 'm-iit-11-1', title: 'Complete HC Verma (Vol 1 & 2) end-to-end', priority: 'high', weeks: 24 },
          { id: 'm-iit-12-1', title: 'Achieve All India Rank < 5,000 in JEE Advanced', priority: 'high', weeks: 24 },
          { id: 'm-iit-12-2', title: 'Clear Class 12 Boards with 85%+ aggregate', priority: 'high', weeks: 8 }
        ]
      },
      'ug': {
        focus: 'Leverage IIT/NIT brand: Research, Global Hackathons, High-Impact Placements.',
        whatToLearn: [
          'Branch core engineering (Computer Science, Electrical, Mechanical, Aerospace)',
          'Interdisciplinary minors (Data Science, Economics, Financial Engineering)',
          'Industry tools: Linux, Git, Cloud, Hardware simulation (MATLAB/Simulink)',
          'Leadership: Managing cultural & tech fests (Mood Indigo, Techfest, Rendezvous)'
        ],
        importantSubjects: ['Core Engineering Discipline', 'Algorithms & Data Science', 'Industrial Economics'],
        skills: ['Engineering Innovation', 'International Collaboration', 'Public Speaking', 'Peer Networking'],
        exams: ['GATE (for PSU / M.Tech)', 'CAT (for IIMs)', 'GRE (for Stanford/MIT MS/PhD)'],
        recommendedActivities: [
          'Maintain CGPA > 8.5 for international exchange & top placement shortlists',
          'Publish research paper with IIT professors in IEEE/ACM conferences',
          'Secure an international summer internship (DAAD Germany, Mitacs Canada)',
          'Lead a student club (Robotics, Web and Coding, Entrepreneurship Cell)'
        ],
        possibleNextSteps: [
          'Top campus placement (₹25LPA–₹1Cr+ international roles)',
          'Admit to elite MS/PhD program abroad (Stanford, CMU, Berkeley)',
          'Found a venture-backed Y-Combinator startup'
        ],
        milestones: [
          { id: 'm-iit-ug-1', title: 'Maintain 8.5+ CGPA across first 4 semesters', priority: 'high', weeks: 52 },
          { id: 'm-iit-ug-2', title: 'Secure summer internship at top global firm or research institute', priority: 'high', weeks: 12 },
          { id: 'm-iit-ug-3', title: 'Complete Final Year B.Tech Capstone Project', priority: 'high', weeks: 30 }
        ]
      },
      'grad-career': {
        focus: 'Global tech impact, leadership in multinational firms, or high-growth entrepreneurship.',
        whatToLearn: [
          'Executive leadership, engineering management, organizational scaling',
          'Global intellectual property, patent filing, deep-tech commercialization',
          'Venture capital, angel investing, board room governance'
        ],
        importantSubjects: ['Deep Tech Engineering', 'Enterprise Leadership', 'Strategic Management'],
        skills: ['Visionary Leadership', 'Global Team Management', 'Product Innovation', 'Venture Creation'],
        exams: ['Executive MBA Admissions', 'Chartered Engineering Credentials'],
        recommendedActivities: [
          'Deliver keynote lectures at engineering summits',
          'File commercial patents for proprietary engineering breakthroughs',
          'Angel invest in fellow alumni startups and mentor student founders',
          'Lead cross-border technology acquisitions and innovations'
        ],
        possibleNextSteps: [
          'Chief Technology Officer (CTO) or Chief Executive Officer (CEO)',
          'Managing Partner at Technology Venture Fund',
          'Founder of a Unicorn Enterprise'
        ],
        milestones: [
          { id: 'm-iit-gc-1', title: 'Lead major product / engineering milestone with global footprint', priority: 'high', weeks: 48 }
        ]
      }
    }
  },

  'gate-mtech': {
    id: 'gate-mtech',
    title: 'GATE / M.Tech',
    emoji: '⚙️',
    tagline: 'Master your technical discipline & secure prestigious PSU / M.Tech positions.',
    description: 'The premier national postgraduate engineering benchmark. Unlocks M.Tech/MS at IITs/IISc Bangalore, ₹18–25 LPA PSU jobs (IOCL, ONGC, NTPC, BHEL), and elite defense/space research (DRDO, ISRO).',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #3B82F6)',
    stages: {
      'class-6-8': {
        focus: 'Spark interest in applied mechanics, machines, and physical sciences.',
        whatToLearn: [
          'Basic machines: levers, pulleys, gears, wheels, and hydraulics',
          'Electricity, magnetism, circuits, and energy transformations',
          'Foundational algebra, geometry, and unit conversions',
          'How everyday things work: automobiles, aircraft, rockets, computers'
        ],
        importantSubjects: ['General Science', 'Introductory Physics', 'Mathematics'],
        skills: ['Practical Curiosity', 'Disassembling & Assembling', 'Observation of Machines'],
        exams: ['National Science Olympiad (NSO)', 'School Tech and Science Fairs'],
        recommendedActivities: [
          'Build DIY science models (hydraulic crane, electromagnets, solar cars)',
          'Watch documentaries on mega-engineering (Megastructures, How It’s Made)',
          'Solve physics logic puzzles and spatial reasoning riddles',
          'Visit an industrial plant or engineering workshop'
        ],
        possibleNextSteps: [
          'Focus on Class 9-10 Physics and Mathematics',
          'Participate in robotics clubs',
          'Prepare for future technical stream choice'
        ],
        milestones: [
          { id: 'm-gate-f-1', title: 'Complete DIY engineering project (e.g. electric motor or hydraulic arm)', priority: 'medium', weeks: 6 },
          { id: 'm-gate-f-2', title: 'Score 85%+ in middle school science and mathematics', priority: 'high', weeks: 12 }
        ]
      },
      'class-9-10': {
        focus: 'Deepen physics formulas, coordinate geometry, and numerical rigor.',
        whatToLearn: [
          'Newton’s Laws of Motion, Gravitation, Work, Energy & Power formulas',
          'Current electricity, Ohm’s Law, magnetic effects of electric current',
          'Algebra, coordinate geometry, trigonometry, and statistics',
          'Introduction to computer programming and algorithmic thinking'
        ],
        importantSubjects: ['Physics (Mechanics & Electricity)', 'Mathematics (Algebra & Trig)', 'Chemistry'],
        skills: ['Formula Application', 'Numerical Problem Solving', 'Diagram Interpretation'],
        exams: ['Class 10 Board Examinations', 'State Science Talent Search', 'NTSE'],
        recommendedActivities: [
          'Solve challenging numerical problems from Lakhmir Singh & Manjit Kaur',
          'Build simple electronics with Arduino or Raspberry Pi',
          'Understand differences between core engineering branches (Mechanical, Electrical, Civil, CS)',
          'Attend seminars on public sector undertakings (PSUs) and research careers'
        ],
        possibleNextSteps: [
          'Enroll in Science PCM stream in Class 11',
          'Aim for engineering colleges through state or national entrances',
          'Set foundation for undergraduate technical courses'
        ],
        milestones: [
          { id: 'm-gate-s-1', title: 'Score 90%+ in Class 10 Board Physics and Mathematics', priority: 'high', weeks: 16 },
          { id: 'm-gate-s-2', title: 'Build a working electronics circuit project using breadboard & multimeter', priority: 'medium', weeks: 6 }
        ]
      },
      'class-11-12': {
        focus: 'Master engineering math and physics fundamentals during higher secondary.',
        whatToLearn: [
          'Calculus, Differential Equations, Matrices & Determinants',
          'Rotational mechanics, Thermodynamics, Electrostatics, Magnetism',
          'Basic chemistry and material properties',
          'Engineering entrance exam techniques (JEE Main, State CETs)'
        ],
        importantSubjects: ['Applied Mathematics', 'Physics', 'Chemistry'],
        skills: ['Calculus Rigor', 'Analytical Modeling', 'Exam Speed'],
        exams: ['JEE Main', 'State CETs (MHT CET, KCET, WBJEE, UPSEE)', 'Class 12 Boards'],
        recommendedActivities: [
          'Master calculus as it forms the backbone of all engineering disciplines',
          'Identify specific engineering branch of interest for B.Tech admission',
          'Solve previous year state entrance engineering papers',
          'Explore engineering curricula from top universities like IITs and NITs'
        ],
        possibleNextSteps: [
          'Secure admission in an AICTE/UGC approved B.Tech / B.E. college',
          'Plan GATE preparation timeline starting in college 2nd/3rd year',
          'Gather core engineering textbooks (e.g., Kreyzig for Engineering Math)'
        ],
        milestones: [
          { id: 'm-gate-11-1', title: 'Master differential and integral calculus formulas', priority: 'high', weeks: 16 },
          { id: 'm-gate-12-1', title: 'Clear 12th Boards with 80%+ and secure B.Tech admission', priority: 'high', weeks: 12 }
        ]
      },
      'ug': {
        focus: 'Rigorous GATE syllabus coverage: Core Engineering subjects & Engineering Math.',
        whatToLearn: [
          'Engineering Mathematics (Linear Algebra, Calculus, Diff Equations, Complex Variables, Probability - 13 marks)',
          'General Aptitude (Verbal & Numerical Ability - 15 marks)',
          'Core Branch Discipline (72 marks, e.g. CS, ME, EE, EC, CE subjects)',
          'GATE pattern: MCQs, MSQs (Multiple Select Questions), and NATs (Numerical Answer Type)'
        ],
        importantSubjects: ['Core Engineering Branch Subjects', 'Engineering Mathematics', 'General Aptitude'],
        skills: ['High Numerical Precision', 'Virtual Calculator Speed', 'Concept Cross-Linking', 'NAT Problem Solving'],
        exams: ['GATE Exam (3rd year attempt for trial & 4th year for final rank)', 'BARC OCES/DGFS Exam', 'ISRO Scientist Entrance (ICRB)'],
        recommendedActivities: [
          'Study standard reference textbooks (not just local university guides)',
          'Solve 30 years of GATE previous year questions (PYQs) topic-by-topic',
          'Join a premier GATE test series (Made Easy, ACE Academy, Gate Academy)',
          'Attempt 20+ full-length computer-based GATE mock tests with virtual calculator'
        ],
        possibleNextSteps: [
          'M.Tech / MS admission in IIT Bombay, IISc Bangalore, IIT Delhi via COAP',
          'Direct PSU Job recruitment (IOCL, ONGC, NTPC, PowerGrid, BPCL)',
          'Direct PhD / PMRF (Prime Minister Research Fellowship) at premier IITs'
        ],
        milestones: [
          { id: 'm-gate-ug-1', title: 'Complete GATE Engineering Mathematics & General Aptitude syllabus', priority: 'high', weeks: 12 },
          { id: 'm-gate-ug-2', title: 'Solve 20 years of GATE PYQs with >85% accuracy', priority: 'high', weeks: 24 },
          { id: 'm-gate-ug-3', title: 'Score All India Rank (AIR) < 500 in GATE exam', priority: 'high', weeks: 16 }
        ]
      },
      'grad-career': {
        focus: 'M.Tech specialization thesis, PSU Executive Officer, or Senior Scientist.',
        whatToLearn: [
          'Advanced specialized engineering (VLSI, Thermal, Structural, Artificial Intelligence)',
          'Industrial standards, plant safety protocols, project management (PMP basics)',
          'Research methodologies, technical paper publication, patents'
        ],
        importantSubjects: ['Advanced Postgraduate Electives', 'Industrial Automation', 'Safety Standards'],
        skills: ['Industrial Plant Management', 'Advanced Simulations (ANSYS/COMSOL/Cadence)', 'Budget Allocation'],
        exams: ['PSU Interview Rounds', 'PMRF (Prime Minister Research Fellowship)', 'CSIR/UGC JRF'],
        recommendedActivities: [
          'Complete 2-year M.Tech thesis with industrial collaboration',
          'Undergo executive trainee induction in central public sector enterprise',
          'Participate in national defense or energy grid maintenance programs',
          'Publish research papers in high-impact international journals'
        ],
        possibleNextSteps: [
          'Executive Engineer / Assistant Manager in Maharatna / Navratna PSU',
          'Scientist / Engineer ‘SC’ in ISRO / DRDO / BARC',
          'Lead R&D Specialist at top MNCs (Intel, Qualcomm, GE, Siemens, Boeing)'
        ],
        milestones: [
          { id: 'm-gate-gc-1', title: 'Complete M.Tech dissertation defense or PSU probationary training', priority: 'high', weeks: 36 },
          { id: 'm-gate-gc-2', title: 'Publish peer-reviewed international engineering conference paper', priority: 'medium', weeks: 20 }
        ]
      }
    }
  },

  'upsc': {
    id: 'upsc',
    title: 'UPSC Civil Services',
    emoji: '🏛️',
    tagline: 'Serve the nation, shape public policy, and lead the administrative framework.',
    description: 'India’s most respected competitive examination for Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), and Central Group A services. Requires comprehensive knowledge, analytical writing, and ethical integrity.',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    stages: {
      'class-6-8': {
        focus: 'Develop reading habits, curiosity about history, geography, and Indian governance.',
        whatToLearn: [
          'History of ancient & medieval India, freedom movement pioneers',
          'Physical geography: rivers, mountains, climates, maps of India & World',
          'Civics basics: Constitution, democracy, rights and duties of citizens',
          'Daily habit of reading newspapers and understanding current news'
        ],
        importantSubjects: ['Social Studies', 'History & Civics', 'Geography', 'English / Regional Language'],
        skills: ['Reading Stamina', 'Map Drawing & Reading', 'Curiosity about Society', 'Clear Expression'],
        exams: ['School Debate Competitions', 'General Knowledge Olympiads (IGKO)', 'Essay Competitions'],
        recommendedActivities: [
          'Read "The Hindu" or "The Indian Express" children’s/young adults edition daily',
          'Participate in Model United Nations (MUN) or school parliamentary debates',
          'Create a handwritten diary summarizing 3 major news events each week',
          'Memorize states, capitals, rivers, and national parks of India on blank maps'
        ],
        possibleNextSteps: [
          'Study NCERT Social Sciences in Class 9-10 with extra diligence',
          'Participate in inter-school elocution and debates',
          'Broaden reading to biographies of great leaders (Gandhi, Nehru, Ambedkar, Patel)'
        ],
        milestones: [
          { id: 'm-upsc-f-1', title: 'Read NCERT History & Geography (Class 6-8) with chapter notes', priority: 'high', weeks: 14 },
          { id: 'm-upsc-f-2', title: 'Draw and label all 28 states, 8 UTs, and major rivers of India from memory', priority: 'medium', weeks: 4 },
          { id: 'm-upsc-f-3', title: 'Participate in at least 1 speech / debate competition', priority: 'medium', weeks: 6 }
        ]
      },
      'class-9-10': {
        focus: 'Master NCERT foundation (Class 6–10) across History, Polity, Geography, & Economics.',
        whatToLearn: [
          'Indian Democratic Politics: Constitutional design, electoral system, institutions',
          'Economic development: poverty, food security, sectors of Indian economy',
          'World History: French Revolution, Nazism, Industrialization, Nationalism in India',
          'Basic essay structuring and objective argumentation'
        ],
        importantSubjects: ['Polity & Constitution', 'Modern Indian History', 'Economics Basics', 'Physical Geography'],
        skills: ['Essay Writing', 'Objective Evaluation of Public Issues', 'Current Affairs Synthesis', 'Vocabulary'],
        exams: ['Class 10 Board Examinations (Aim for 90%+)', 'NTSE (Social Science section)'],
        recommendedActivities: [
          'Read editorials of "The Hindu" or "The Indian Express" regularly',
          'Watch Rajya Sabha TV / Sansad TV debates (Perspective, Big Picture)',
          'Write a 500-word essay on a national socio-economic issue every Sunday',
          'Maintain separate notebooks for: Polity, History, Economy, Environment'
        ],
        possibleNextSteps: [
          'Choose any stream for Class 11 (Arts/Humanities, Science, or Commerce)',
          'Begin foundational reading of standard UPSC references (Bipin Chandra, NCERTs)',
          'Develop balanced, unbiased perspective on government policies'
        ],
        milestones: [
          { id: 'm-upsc-s-1', title: 'Complete NCERT Social Sciences 9th & 10th with flashcards', priority: 'high', weeks: 12 },
          { id: 'm-upsc-s-2', title: 'Write 10 analytical essays on contemporary Indian issues', priority: 'medium', weeks: 10 },
          { id: 'm-upsc-s-3', title: 'Score 90%+ in Class 10 Board Social Studies', priority: 'high', weeks: 16 }
        ]
      },
      'class-11-12': {
        focus: 'Complete Class 11–12 NCERTs & choose graduation degree supporting UPSC prep.',
        whatToLearn: [
          'Advanced NCERTs: Indian Constitution at Work, Political Theory, Human Geography',
          'Macroeconomics: National Income, Monetary Policy, Fiscal Deficit, Budget basics',
          'Art and Culture (NCERT Class 11 An Introduction to Indian Art)',
          'Ethics, human values, and moral reasoning basics'
        ],
        importantSubjects: ['Indian Polity', 'Modern History & Art/Culture', 'Macroeconomics', 'Geography'],
        skills: ['Analytical Answer Writing', 'Time-Bound Reading', 'Synthesizing Multiple Opinions'],
        exams: ['Class 12 Board Examinations (Crucial for college admission)', 'CUET UG (for Delhi University, JNU, etc.)'],
        recommendedActivities: [
          'Complete reading of M. Laxmikanth’s "Indian Polity" (first thorough pass)',
          'Follow Union Budget & Economic Survey summaries each year',
          'Target top universities for graduation (St. Stephen’s, Hindu, LSR, IIT, NLSIU)',
          'Keep notes of Supreme Court landmark judgments and constitutional amendments'
        ],
        possibleNextSteps: [
          'Enter preferred undergraduate degree (BA History/Pol Science, B.Com, B.Tech, or Law)',
          'Begin 3-year structured college preparation strategy',
          'Select probable UPSC Optional Subject (e.g., PSIR, Sociology, Geography, History)'
        ],
        milestones: [
          { id: 'm-upsc-11-1', title: 'Finish Class 11-12 NCERTs in Polity, History, Economy, & Geography', priority: 'high', weeks: 20 },
          { id: 'm-upsc-12-1', title: 'Read first 25 chapters of Laxmikanth Indian Polity', priority: 'high', weeks: 10 },
          { id: 'm-upsc-12-2', title: 'Secure admission in top graduation college via CUET or CET', priority: 'high', weeks: 12 }
        ]
      },
      'ug': {
        focus: 'Full-fledged UPSC preparation: GS 1–4, Optional Subject, and Daily Answer Writing.',
        whatToLearn: [
          'Prelims GS Paper 1 (History, Polity, Economy, Geo, Environment, Science & Tech, Current Affairs)',
          'Prelims CSAT Paper 2 (Reading Comprehension, Reasoning, Quantitative Aptitude - 33% qualifying)',
          'Mains GS 1 (Heritage, History, Geography, Society), GS 2 (Governance, Constitution, Polity, IR)',
          'Mains GS 3 (Economy, Sci-Tech, Bio-diversity, Security, Disaster Mgmt), GS 4 (Ethics, Integrity & Aptitude)',
          'Optional Subject Paper 1 & Paper 2 (500 marks — crucial differentiator)'
        ],
        importantSubjects: ['General Studies 1, 2, 3, 4', 'Optional Subject', 'Essay Paper (250 marks)', 'CSAT'],
        skills: ['150/250-word Answer Writing in 7-9 mins', 'Diagram & Flowchart Inclusion', 'Ethics Case Study Decentering', 'Mental Resilience'],
        exams: ['UPSC Civil Services Preliminary Examination (appearing right after graduation)', 'State PSC / PCS Exams (UPPSC, BPSC, MPSC, etc.)'],
        recommendedActivities: [
          'Solve last 10 years UPSC Prelims and Mains papers with official answer keys',
          'Join a dedicated Mains Answer Writing Evaluation program (Insights, ForumIAS, VisionIAS)',
          'Write at least 2 full GS Mains mock papers every weekend during 3rd year',
          'Read monthly current affairs compilations and annual Economic Survey'
        ],
        possibleNextSteps: [
          'Attempt UPSC Prelims upon reaching 21 years of age and finishing graduation',
          'Qualify for Mains and Personality Test (Interview at Dholpur House, New Delhi)',
          'Explore backup civil service options (State PCS, RBI Grade B, CAPF, EPFO)'
        ],
        milestones: [
          { id: 'm-upsc-ug-1', title: 'Complete full Optional Subject syllabus notes twice', priority: 'high', weeks: 32 },
          { id: 'm-upsc-ug-2', title: 'Write 200 GS Mains practice answers with structured feedback', priority: 'high', weeks: 24 },
          { id: 'm-upsc-ug-3', title: 'Attempt 35 Prelims Mock Tests (Consistently scoring 100+ in GS 1)', priority: 'high', weeks: 16 }
        ]
      },
      'grad-career': {
        focus: 'Clear Prelims, write Mains with distinction, ace Personality Test & join LBSNAA.',
        whatToLearn: [
          'Detailed Application Form (DAF) preparation: Hobbies, home state, academic background',
          'Mock interviews: Body language, articulation, balance of judgment, constitutional morality',
          'Foundational training at Lal Bahadur Shastri National Academy of Administration (LBSNAA)'
        ],
        importantSubjects: ['Personality & Interview Assessment', 'LBSNAA Foundation Course', 'Public Administration in Action'],
        skills: ['Diplomatic Poise', 'Crisis Decision Making', 'Public Policy Implementation', 'Bilingual Communication'],
        exams: ['UPSC CSE Personality Test (Interview - 275 marks)', 'State Cadre Allotment Process'],
        recommendedActivities: [
          'Appear for 4-5 high quality Mock Interviews with retired IAS/IPS board members',
          'Keep thoroughly updated on international geopolitics and district administration challenges',
          'Engage in physical fitness & mental wellness routines to stay calm under intense pressure'
        ],
        possibleNextSteps: [
          'Join LBSNAA Mussoorie for Foundation Course as Officer Trainee',
          'District training as Assistant Collector / Sub-Divisional Magistrate (SDM)',
          'Serve as District Magistrate (DM), Secretary to Government of India, or Ambassador'
        ],
        milestones: [
          { id: 'm-upsc-gc-1', title: 'Clear UPSC Civil Services Mains and qualify for Interview', priority: 'high', weeks: 20 },
          { id: 'm-upsc-gc-2', title: 'Secure All India Rank in final merit list & report to LBSNAA', priority: 'high', weeks: 12 }
        ]
      }
    }
  },

  'ssc-cgl': {
    id: 'ssc-cgl',
    title: 'SSC CGL',
    emoji: '📋',
    tagline: 'Secure prestigious Group B & C central government posts with lifelong stability.',
    description: 'The premier Staff Selection Commission exam recruiting Assistant Section Officers (ASO in MEA, CSS), Income Tax Inspectors, Central Excise Inspectors, Preventive Officers, and Auditors across Government of India ministries.',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #10B981)',
    stages: {
      'class-6-8': {
        focus: 'Build mental arithmetic, grammar fundamentals, and general awareness.',
        whatToLearn: [
          'Mental math: rapid addition, multiplication tables up to 30, squares, cubes',
          'English grammar: parts of speech, tenses, sentence correction, active/passive voice',
          'General Science and basic Indian Geography & History',
          'Puzzles, coding-decoding, and verbal analogies'
        ],
        importantSubjects: ['Arithmetic', 'English Grammar', 'General Knowledge', 'Basic Reasoning'],
        skills: ['Speed Calculation', 'Grammatical Precision', 'Fast Reading'],
        exams: ['School Math Olympiads', 'Spell Bee Competitions', 'General Knowledge Quizzes'],
        recommendedActivities: [
          'Practice 15 minutes of Vedic Math mental calculation daily',
          'Read "Word Power Made Easy" by Norman Lewis for vocabulary building',
          'Solve newspaper crosswords and logical reasoning puzzles',
          'Maintain a personal vocabulary pocket notebook'
        ],
        possibleNextSteps: [
          'Focus on Class 9-10 Math and English',
          'Build strong reading speed',
          'Take preliminary talent tests'
        ],
        milestones: [
          { id: 'm-ssc-f-1', title: 'Memorize multiplication tables to 30, squares to 50, cubes to 30', priority: 'high', weeks: 4 },
          { id: 'm-ssc-f-2', title: 'Complete first 15 sessions of Norman Lewis Word Power Made Easy', priority: 'medium', weeks: 6 }
        ]
      },
      'class-9-10': {
        focus: 'Consolidate quantitative aptitude formulas and complete English grammar rules.',
        whatToLearn: [
          'Percentages, Profit & Loss, Ratio & Proportion, Simple & Compound Interest',
          'Geometry: Triangles, Circles, Tangents, Trigonometric identities',
          'Wren & Martin English Grammar rules & error spotting',
          'NCERT History, Polity, Geography, General Science summaries'
        ],
        importantSubjects: ['Quantitative Aptitude (Arithmetic + Advanced Math)', 'English Grammar', 'General Studies'],
        skills: ['Speed with Short-Tricks', 'Error Spotting in English', 'Visual Reasoning'],
        exams: ['Class 10 Board Examinations (Aim for 80%+)', 'SSC MTS (Multi-Tasking Staff eligibility starts at Class 10)'],
        recommendedActivities: [
          'Solve RS Aggarwal Quantitative Aptitude introductory chapters',
          'Practice 20 reasoning questions daily (syllogism, series, analogies)',
          'Read NCERT 9th & 10th science & social science for General Awareness',
          'Begin tracking SSC exam notifications and exam patterns'
        ],
        possibleNextSteps: [
          'Pursue any stream in Class 11-12 (Commerce, Arts, or Science)',
          'Strengthen advanced math (Algebra, Trigonometry, Geometry)',
          'Aim to clear SSC CHSL right after Class 12 as early milestone'
        ],
        milestones: [
          { id: 'm-ssc-s-1', title: 'Master 10 major arithmetic chapters with short-trick formulas', priority: 'high', weeks: 12 },
          { id: 'm-ssc-s-2', title: 'Score 85%+ in Class 10 Board Mathematics & English', priority: 'high', weeks: 16 }
        ]
      },
      'class-11-12': {
        focus: 'Master advanced math, vocabulary, and attempt SSC CHSL (10+2 level).',
        whatToLearn: [
          'Advanced Mathematics: Heights & Distances, Coordinate Geometry, Mensuration 2D/3D',
          'Vocabulary: Idioms & Phrases, One Word Substitutions, Synonyms/Antonyms (1000+ words)',
          'Logical Reasoning: Coding-decoding, Blood relations, Non-verbal series, Puzzles',
          'General Awareness: Static GK (Art/Culture, First in India, Books & Authors)'
        ],
        importantSubjects: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Language', 'General Awareness'],
        skills: ['Extreme Calculation Speed', 'Vocabulary Retention', 'Time Management in 60-Minute Exams'],
        exams: ['SSC CHSL (Combined Higher Secondary Level, Class 12 qualification)', 'Class 12 Board Examinations'],
        recommendedActivities: [
          'Solve previous 5 years SSC CHSL question papers under timed conditions',
          'Complete Neetu Singh’s English for General Competitions (Vol 1)',
          'Practice computer typing speed test (target 35 wpm in English)',
          'Select any recognized graduation degree to satisfy SSC CGL criteria'
        ],
        possibleNextSteps: [
          'Appear for SSC CHSL to gain real computer-based exam experience',
          'Enroll in any Bachelor’s degree (BA, B.Com, B.Sc, B.Tech, BBA, etc.)',
          'Start dedicated preparation for SSC CGL Tier 1 and Tier 2'
        ],
        milestones: [
          { id: 'm-ssc-11-1', title: 'Memorize 500 high-frequency One Word Substitutions & Idioms', priority: 'high', weeks: 8 },
          { id: 'm-ssc-12-1', title: 'Attempt SSC CHSL exam & achieve 35+ words/minute typing speed', priority: 'high', weeks: 16 }
        ]
      },
      'ug': {
        focus: 'Peak SSC CGL preparation: Tier 1 & Tier 2 mastery with 100+ full mock tests.',
        whatToLearn: [
          'Tier 1 (Qualifying): Reasoning (50 marks), GK (50 marks), Quant (50 marks), English (50 marks)',
          'Tier 2 (Merit): Section 1 (Math 90 marks + Reasoning 90 marks), Section 2 (English 135 marks + GK 75 marks)',
          'Computer Knowledge Module (Non-qualifying elimination module - 60 marks)',
          'Data Entry Speed Test (DEST) - 2000 key depressions in 15 minutes'
        ],
        importantSubjects: ['Mathematical Abilities (Tier 2)', 'Reasoning & Intelligence', 'English Comprehension', 'General Awareness & Computer'],
        skills: ['Negative Mark Minimization', 'Rapid Shortcut Application', 'High-Speed Typing', 'Current Affairs Mastery'],
        exams: ['SSC CGL (Combined Graduate Level)', 'SSC CPO (Sub-Inspector in Delhi Police & CAPF)', 'State SSC Exams'],
        recommendedActivities: [
          'Attempt 1 full-length SSC CGL computer test every alternate day on Testbook / Oliveboard',
          'Score consistently 140+ in Tier 1 mocks and 310+ out of 390 in Tier 2 mocks',
          'Revise Lucent’s General Knowledge book twice end-to-end',
          'Maintain an error diary for math formulas and confusing grammar rules'
        ],
        possibleNextSteps: [
          'Fill SSC CGL post preferences (ASO in MEA, Income Tax Inspector, GST Inspector)',
          'Clear document verification and medical fitness examination',
          'Receive appointment letter from Ministry of Personnel'
        ],
        milestones: [
          { id: 'm-ssc-ug-1', title: 'Complete Lucent GK & Pinnacle SSC Math 6800+ TCS PYQ book', priority: 'high', weeks: 24 },
          { id: 'm-ssc-ug-2', title: 'Score 310+ in 5 consecutive Tier 2 full-length mock tests', priority: 'high', weeks: 12 },
          { id: 'm-ssc-ug-3', title: 'Clear Computer Knowledge Module and DEST typing test benchmarks', priority: 'high', weeks: 4 }
        ]
      },
      'grad-career': {
        focus: 'Appointment as Gazetted/Non-Gazetted Central Government Officer & departmental exams.',
        whatToLearn: [
          'Central Civil Services (Conduct) Rules, Fundamental Rules & Supplementary Rules (FR/SR)',
          'Ministry-specific operations: Foreign protocol (MEA), Tax assessments (CBDT/CBIC)',
          'Departmental confirmation and promotion examinations'
        ],
        importantSubjects: ['Administrative Rules & Office Procedures', 'Tax Laws & Investigation', 'Vigilance & Procurement'],
        skills: ['Public Administration', 'Official Drafting & Notings', 'Tax Fraud Investigation', 'Inter-Departmental Coordination'],
        exams: ['Departmental Promotion Exam (ITO / Superintendent promotion)', 'UPSC CSE (if aspiring to upgrade to IAS/IRS)'],
        recommendedActivities: [
          'Undergo induction training at National Academy of Direct Taxes (NADT) or ISTM Delhi',
          'Master government e-Office workflow and GeM portal operations',
          'Prepare for internal departmental exams to accelerate promotion to Group A rank',
          'Participate in state-level investigation, search, and seizure operations'
        ],
        possibleNextSteps: [
          'Promote to Income Tax Officer (ITO) / Assistant Commissioner (IRS cadre)',
          'Under Secretary in Central Secretariat / Diplomatic posting abroad with MEA',
          'Lifelong pension benefits, central government housing, and job security'
        ],
        milestones: [
          { id: 'm-ssc-gc-1', title: 'Complete probationary training and pass Departmental Confirmation Exam', priority: 'high', weeks: 26 }
        ]
      }
    }
  },

  'banking': {
    id: 'banking',
    title: 'Banking (IBPS / SBI)',
    emoji: '🏦',
    tagline: 'Lead financial operations, credit lending, and banking growth across India.',
    description: 'The golden gateway into India’s banking and financial services sector through SBI PO, IBPS PO, RBI Grade B, and NABARD. Offers fast-track executive promotions, housing, competitive pay, and societal prestige.',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
    stages: {
      'class-6-8': {
        focus: 'Build mental arithmetic agility, logic puzzles, and money awareness.',
        whatToLearn: [
          'Mental arithmetic: percentages, fractions, decimals, simple interest basics',
          'Logical reasoning: series, patterns, direction sense, simple family trees',
          'Understanding currency, banking, savings accounts, and digital payments',
          'English reading comprehension with short story books'
        ],
        importantSubjects: ['Arithmetic & Number Sense', 'English Comprehension', 'Basic Commerce & Money'],
        skills: ['Fast Mental Math', 'Reading Speed', 'Logical Deduction'],
        exams: ['School Math Olympiads', 'Financial Literacy Quizzes (RBI RBIQ basics)'],
        recommendedActivities: [
          'Open and manage a junior savings bank account with parents',
          'Solve 15 Sudoku and number puzzles weekly',
          'Learn how UPI, ATM debit cards, and bank interest work in real life',
          'Read financial comics like RBI’s "Raju and the Money Tree"'
        ],
        possibleNextSteps: [
          'Strengthen Class 9-10 mathematics',
          'Cultivate habit of reading financial newspapers',
          'Explore basic economics'
        ],
        milestones: [
          { id: 'm-bank-f-1', title: 'Master fraction-to-percentage conversions (1/2 to 1/20) mentally', priority: 'high', weeks: 4 },
          { id: 'm-bank-f-2', title: 'Read 10 financial awareness articles on banking and RBI functions', priority: 'medium', weeks: 6 }
        ]
      },
      'class-9-10': {
        focus: 'Strengthen quantitative math, vocabulary, and financial literacy.',
        whatToLearn: [
          'Commercial Math: Compound Interest, Profit & Loss, Partnerships, Time & Work',
          'Data Interpretation: Bar charts, pie charts, tables, line graphs',
          'English grammar, cloze tests, sentence rearrangement',
          'Role of Reserve Bank of India (RBI), inflation, and banking reforms'
        ],
        importantSubjects: ['Commercial Mathematics', 'Data Interpretation', 'English Grammar'],
        skills: ['Data Chart Analysis', 'Fast Reading with Retention', 'Formula Application'],
        exams: ['Class 10 Board Examinations (Aim for 80%+)', 'National Financial Literacy Assessment Test (NFLAT)'],
        recommendedActivities: [
          'Read business pages of "Economic Times" or "Business Standard"',
          'Solve 2 sets of Data Interpretation (DI) charts every week',
          'Practice solving math calculations without using scrap paper',
          'Understand RBI monetary policy terms (Repo Rate, Reverse Repo, CRR, SLR)'
        ],
        possibleNextSteps: [
          'Choose Commerce, Science, or Arts stream in Class 11',
          'Keep quantitative aptitude sharp regardless of stream chosen',
          'Explore career options between Public Sector Banks vs Private Banks'
        ],
        milestones: [
          { id: 'm-bank-s-1', title: 'Solve 100 Data Interpretation (DI) chart sets', priority: 'high', weeks: 10 },
          { id: 'm-bank-s-2', title: 'Score 85%+ in Class 10 Board Mathematics', priority: 'high', weeks: 16 }
        ]
      },
      'class-11-12': {
        focus: 'Master advanced reasoning puzzles, speed math, and economic awareness.',
        whatToLearn: [
          'Complex reasoning: Floor puzzles, circular seating arrangement, syllogisms, inequalities',
          'Quantitative Aptitude: Approximation, quadratic inequalities, number series',
          'English: Parajumbles, vocabulary in context, reading comprehension inference',
          'Financial system: Stock markets, mutual funds, commercial banks vs NBFCs'
        ],
        importantSubjects: ['Quantitative Aptitude', 'Reasoning Puzzles', 'Financial Awareness', 'English'],
        skills: ['Complex Puzzle Solving in under 3 mins', 'Sectional Time Management', 'Elimination Strategy'],
        exams: ['Class 12 Board Examinations (Ensure 60%+ for banking eligibility)', 'IPMAT / NPAT / CUET (if targeting commerce/management)'],
        recommendedActivities: [
          'Solve Ankush Lamba / Puneet Sharma reasoning puzzle series on YouTube',
          'Practice 20 simplification and approximation questions daily (target < 30 sec each)',
          'Track Union Budget announcements affecting banking sector',
          'Enroll in any recognized graduation program (Commerce, Engineering, Arts, Science)'
        ],
        possibleNextSteps: [
          'Enter college degree program (any discipline is eligible for SBI/IBPS PO)',
          'Plan 3-year structured banking exam preparation during college',
          'Aim for RBI Grade B Officer as highest banking aspiration'
        ],
        milestones: [
          { id: 'm-bank-11-1', title: 'Solve 200 seating arrangement and floor puzzles', priority: 'high', weeks: 12 },
          { id: 'm-bank-12-1', title: 'Clear 12th Boards with 75%+ and enter graduation degree', priority: 'high', weeks: 12 }
        ]
      },
      'ug': {
        focus: 'Dedicated banking exam preparation: Prelims speed + Mains analytical depth.',
        whatToLearn: [
          'Prelims Pattern (1 hour, 100 questions): English (30), Quant (35), Reasoning (35)',
          'Mains Pattern (3 hours): High-level Puzzles, Advanced DI/Caselets, Banking Awareness, Descriptive Essay/Letter',
          'Banking Awareness: RBI circulars, Priority Sector Lending (PSL), NPA management, Basel III norms',
          'Financial Current Affairs: Last 6 months mergers, appointments, awards, GDP projections'
        ],
        importantSubjects: ['Advanced Data Interpretation', 'High-Level Reasoning', 'Banking & Financial Awareness', 'Descriptive English'],
        skills: ['Speed under Sectional Timers (20 mins per section)', 'High Accuracy in Negative Marking', 'Descriptive Letter/Essay Typing'],
        exams: ['SBI PO (State Bank of India Probationary Officer)', 'IBPS PO (Public Sector Banks)', 'IBPS Clerk & SBI Clerk', 'RBI Grade B / RBI Assistant', 'NABARD Grade A'],
        recommendedActivities: [
          'Attempt 50+ Prelims full mocks and 25+ Mains full mocks on Oliveboard / Testbook / PracticeMock',
          'Read "AffairsCloud" or "Adda247" daily current affairs compilation for banking',
          'Practice typing formal letter and essay on computer keyboard in 30 minutes',
          'Review previous 5 years memory-based question papers of SBI PO and IBPS PO'
        ],
        possibleNextSteps: [
          'Clear Prelims and Mains exams in final year / post-graduation',
          'Appear for Group Discussion (GD) & Personal Interview at SBI / IBPS centers',
          'Receive final appointment as Probationary Officer (Scale-I)'
        ],
        milestones: [
          { id: 'm-bank-ug-1', title: 'Score 65+ in 10 consecutive IBPS PO Prelims mock tests', priority: 'high', weeks: 12 },
          { id: 'm-bank-ug-2', title: 'Complete 6 months Banking & Financial Awareness compilations', priority: 'high', weeks: 16 },
          { id: 'm-bank-ug-3', title: 'Score 90+ in IBPS/SBI PO Mains mock tests with descriptive section', priority: 'high', weeks: 10 }
        ]
      },
      'grad-career': {
        focus: 'Probationary Officer training, credit appraisal, branch management & JAIIB/CAIIB exams.',
        whatToLearn: [
          'Credit appraisal, loan underwriting, balance sheet analysis of corporate borrowers',
          'Forex operations, treasury management, risk compliance, anti-money laundering (AML)',
          'JAIIB (Junior Associate of IIBF) & CAIIB (Certified Associate of IIBF) certifications'
        ],
        importantSubjects: ['Credit Management', 'Banking Law & Practice', 'Treasury & Risk Management'],
        skills: ['Credit Risk Assessment', 'Branch Administration', 'Customer Relationship Building', 'Audit Compliance'],
        exams: ['JAIIB & CAIIB Examinations (gives immediate salary increments)', 'Internal Promotion Examinations (Scale I to Scale II Manager in 3 years)'],
        recommendedActivities: [
          'Undergo induction training at State Bank Staff College or apex bank training institutes',
          'Complete JAIIB and CAIIB within first 2 years of service for faster promotion',
          'Master bank Core Banking Solution (CBS, e.g. Finacle or BaNCS)',
          'Manage high-volume rural/semi-urban branch operations as Branch Manager'
        ],
        possibleNextSteps: [
          'Fast-track promotion to Chief Manager (Scale IV) and Assistant General Manager (AGM)',
          'Deputation to international branches (London, Singapore, New York)',
          'Lateral movement to Executive Director / MD & CEO of public/private banks'
        ],
        milestones: [
          { id: 'm-bank-gc-1', title: 'Complete 2-year PO probation and confirm as Assistant Manager', priority: 'high', weeks: 52 },
          { id: 'm-bank-gc-2', title: 'Clear JAIIB and CAIIB certifications from Indian Institute of Banking & Finance', priority: 'high', weeks: 24 }
        ]
      }
    }
  }
};
