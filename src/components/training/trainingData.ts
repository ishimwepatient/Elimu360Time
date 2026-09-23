export interface TrainingPillar {
  id: number;
  title: string;
  subtitle: string;
  iconName: string;
  summary: string;
  detailedContent: {
    heading: string;
    points: string[];
  }[];
}

export interface TrainingModule {
  id: number;
  title: string;
  duration: string;
  objective: string;
  coreConcepts: string[];
  fieldScripts: {
    scenario: string;
    whatToSay: string;
    keyTakeaway: string;
  }[];
  practicalTip: string;
}

export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const MASTER_12_PILLARS: TrainingPillar[] = [
  {
    id: 1,
    title: '1. What Elimu360 is',
    subtitle: 'Rwanda’s Premier Cloud-Native Educational ERP & SIMS',
    iconName: 'Building2',
    summary: 'Elimu360 is an integrated, multi-tenant School Information Management System designed specifically for Rwandan pre-primary, primary, secondary, and TVET institutions under REB and NESA frameworks.',
    detailedContent: [
      {
        heading: 'Core Architecture & Cloud Infrastructure',
        points: [
          'All-in-One Educational ERP combining Academics, Finance, Discipline, Library, E-Learning, AI Lesson Planning, and SMS Messaging into a single unified platform.',
          'Built with Competency-Based Curriculum (CBC) compliance, supporting weekly period weightings, termly weighting (20/20/60 or 30/70), and automatic A4/Annual Report Card generation.',
          'Cloud-native architecture ensuring real-time multi-device access across desktops, tablets, and smartphones with zero software installation or expensive local server hardware.',
          'Offline-resilient data caching for intermittent internet environments across rural districts.'
        ]
      },
      {
        heading: 'Integrated Institutional Directorates',
        points: [
          'Academic Directorate: Sovereign mark entry, position calculation, and official A4 report card compilation.',
          'Bursar & Finance Directorate: Student fee ledgers, partial payment receipts, custom fee items, and revenue auditing.',
          'Discipline Directorate: Conduct merit/demerit logging and SMS-verified digital student exit permits.',
          'Pedagogical AI Suite: Gemini AI lesson planner and scheme of work builder compliant with REB & NESA standards.'
        ]
      }
    ]
  },
  {
    id: 2,
    title: '2. Why it exists',
    subtitle: 'Eliminating Administrative Friction and Paper Chaos in Schools',
    iconName: 'Zap',
    summary: 'Elimu360 exists to eliminate manual paper processing, report card calculation errors, lost student files, delayed fee tracking, and fragmented communication between school leaders and parents.',
    detailedContent: [
      {
        heading: 'The Technological Imperative',
        points: [
          'Saves Directors of Study (DOS) over 120 hours per term previously spent manually compiling marks, calculating student positions, and printing report cards.',
          'Protects institutional revenue by giving School Directors and Bursars instant, audit-proof visibility into student fee payment ledgers and balance histories.',
          'Provides parents with immediate academic, fee balance, and discipline updates via automated SMS dispatch, closing the communication gap between home and campus.',
          'Eliminates teacher administrative burnout by automating weekly marks compilation and lesson plan generation.'
        ]
      },
      {
        heading: 'Operational Governance Impact',
        points: [
          'Provides School Owners and Legal Representatives with 100% remote visibility over campus performance.',
          'Reduces annual stationery and toner printing expenditure by up to 85% per school.',
          'Ensures complete compliance with Ministry of Education (MINEDUC), REB, and NESA reporting formats.'
        ]
      }
    ]
  },
  {
    id: 3,
    title: '3. The problem we are solving',
    subtitle: 'Transforming High Operational Costs into Digital Precision',
    iconName: 'AlertTriangle',
    summary: 'School leadership teams suffer from administrative burnout, high paper/toner stationery costs, lost student historical records, uncollected fees, and delayed term-end reporting.',
    detailedContent: [
      {
        heading: 'Key Pain Points Resolved',
        points: [
          'High Printing & Paper Costs: Eliminates millions spent on paper booklets and report card stationery every academic year.',
          'Compilation Errors & Fraud: Prevents altered student marks or forged report cards through cryptographically secured, QR-verified digital report generation.',
          'Uncollected School Fees: Provides automated fee tracking, receipts, and balance reminders so no student attends without clear account status.',
          'Lack of Historical Data: Safely preserves student transcripts and cumulative performance records for up to 10 years in encrypted cloud vaults.',
          'Manual Timetable & Room Collisions: Prevents teacher double-booking and room allocation conflicts.'
        ]
      },
      {
        heading: 'Quantifiable Field Benefits',
        points: [
          'Average report card generation time reduced from 2 weeks to under 10 seconds per class.',
          'Uncollected fee recovery rate increased by 35% within the first 60 days of adoption.',
          'Teacher satisfaction scores increase due to 90% reduction in repetitive clerical paperwork.'
        ]
      }
    ]
  },
  {
    id: 4,
    title: '4. The vision',
    subtitle: 'Digitizing 100% of Schools Across Rwanda and East Africa',
    iconName: 'Target',
    summary: 'Our vision is to empower every school leader, teacher, student, and parent with real-time educational transparency, AI-assisted pedagogical tools, and world-class administrative governance.',
    detailedContent: [
      {
        heading: 'Long-Term Strategic Goals',
        points: [
          'Establish Elimu360 as the mandatory operational standard across all 30 Rwandan districts.',
          'Provide every teacher with AI-powered Lesson Plan generators compliant with REB & NESA national standards.',
          'Enable seamless inter-school student transfers with tamper-proof cumulative academic records.',
          'Build predictive AI analytics to identify students needing academic intervention before national examinations.'
        ]
      },
      {
        heading: 'Regional Expansion Roadmap',
        points: [
          'Phase 1: Full coverage of accredited private and government-aided secondary campuses in Kigali and provincial hubs.',
          'Phase 2: Extension to TVET institutions, polytechnics, and primary schools nationwide.',
          'Phase 3: Cross-border integration into East African Community (EAC) educational systems.'
        ]
      }
    ]
  },
  {
    id: 5,
    title: '5. How SIMS works',
    subtitle: 'Multi-Tenant Architecture & Role-Based Access Control',
    iconName: 'ShieldCheck',
    summary: 'Elimu360 operates as a secure multi-tenant cloud environment where each school maintains isolated, encrypted databases accessible only by authorized institutional roles.',
    detailedContent: [
      {
        heading: 'Role Hierarchy & System Sovereignty',
        points: [
          'Super Administrator: National oversight, infrastructure telemetry, regional coordinator management, and platform configuration.',
          'Regional Coordinator: Supervises up to 15 field registrars, monitors district coverage, audits field surveys, and approves school registry codes.',
          'School Registrar: Onboards new institutions, conducts pre-registration surveys, and provisions initial director credentials.',
          'School Admin / Director: Holds complete governance over school settings, staff assignments, fee items, and master ledgers.',
          'Director of Studies (DOS): Oversees curriculum, subject allocation, timetables, and official report card generation.',
          'Teachers: Enjoy sovereign mark entry, assessment recording, and AI lesson plan generation.',
          'Bursars & Discipline Directors: Manage financial ledgers and student conduct passes respectively.'
        ]
      },
      {
        heading: 'Data Security & Isolation Protocol',
        points: [
          'Row-Level Security (RLS) and school-id isolation prevent cross-tenant data access.',
          'Cryptographic hash verification for all exported PDF report cards and official transcripts.',
          'Automated daily backups ensuring zero data loss during power outages or device failure.'
        ]
      }
    ]
  },
  {
    id: 6,
    title: '6. The different services',
    subtitle: 'Comprehensive Suite of Institutional Directorates',
    iconName: 'BookOpen',
    summary: 'An all-inclusive educational suite encompassing 10 distinct functional directorates working seamlessly together.',
    detailedContent: [
      {
        heading: 'Service Portfolio Highlights',
        points: [
          'Academics & CBC Marks Evaluation Engine: Pre-primary qualitative grades, Primary/Secondary numeric marks, position ranking, and Annual consolidation.',
          'Official Reports Generator: Instant A4 PDF termly report cards with position rankings, class statistics, teacher comments, and QR verification.',
          'AI Lesson Planner & Scheme Builder: Generates REB-compliant lesson introductions, development steps, teacher activities, and conclusions in seconds.',
          'Financial Ledger & Fee Management: Tracks tuition fees, payment channels, partial receipts, and outstanding balances per student.',
          'Discipline & Gate Pass Management: Tracks conduct infractions, merits, and digital permission exit passes with automated parent SMS alerting.',
          'Student 360 Directory & Staff Roster: Complete digital filing cabinet for student profiles, medical records, parent contacts, and staff roles.',
          'Digital Library & E-Learning Portal: Tracks textbook borrowing, digital reading materials, and student assignment submissions.',
          'Parent Portal & Communication Engine: Direct web and SMS communication gateway connecting school leadership with guardians.'
        ]
      }
    ]
  },
  {
    id: 7,
    title: '7. Who the customers are',
    subtitle: 'Institutional Decision-Makers & Key Stakeholders',
    iconName: 'Users',
    summary: 'Our primary customers are school owners, headteachers, and academic leaders who make financial and operational software commitments.',
    detailedContent: [
      {
        heading: 'Key Customer Personas',
        points: [
          'School Legal Representatives & Owners: Primary decision-makers seeking operational efficiency, brand prestige, and cost control.',
          'Headteachers & School Directors: Executive leaders focused on smooth daily governance, staff accountability, and MINEDUC compliance.',
          'Directors of Studies (DOS): Academic drivers who benefit most from automated report card generation and error-free ranking.',
          'Bursars & School Treasurers: Financial managers seeking accurate fee tracking, instant receipting, and revenue protection.',
          'Teachers & Subject Instructors: End-users who gain automated marksheets and AI lesson planning support.',
          'Parents & Guardians: End-beneficiaries who receive clear, timely academic and discipline feedback for their children.'
        ]
      }
    ]
  },
  {
    id: 8,
    title: '8. Registrar responsibilities',
    subtitle: 'Field Ambassadors & School Onboarding Specialists',
    iconName: 'Compass',
    summary: 'School Registrars are the face of Elimu360 in the field, tasked with visiting schools, demonstrating software value, conducting surveys, and onboarding campuses.',
    detailedContent: [
      {
        heading: 'Core Registrar Duties',
        points: [
          'Territory Mapping & Field Visits: Conduct structured in-person visits to target schools across designated districts.',
          'Live Product Demonstrations: Deliver persuasive, hands-on 15-minute demonstrations of Elimu360 to School Owners, Headteachers, and DOS.',
          'Mandatory Pre-Registration Field Survey: Complete the 7-question field survey for every school visited to stream market intelligence.',
          'First-Term Pilot Enrollment: Onboard eligible schools into the First-Term Pilot program and hand over initial Director credentials.',
          'Director Orientation: Conduct a 10-minute guided walk-through during the first Director login to ensure active campus adoption.'
        ]
      }
    ]
  },
  {
    id: 9,
    title: '9. Coordinator responsibilities',
    subtitle: 'Regional Operations Supervisors & Quality Managers',
    iconName: 'Award',
    summary: 'Regional Coordinators supervise and mentor teams of field registrars, audit onboarding quality, approve registry codes, and maximize district penetration.',
    detailedContent: [
      {
        heading: 'Core Coordinator Duties',
        points: [
          'Registrar Team Leadership: Recruit, train, and manage up to 15 assigned School Registrars within their assigned region.',
          'Field Intelligence Audit: Review submitted survey reports and assist registrars in resolving complex school objections.',
          'Official Registry Code Approval: Audit new school registrations and issue official Registry Activation Codes upon validation.',
          'Pilot Retention Management: Monitor school engagement during the 3-month First-Term Pilot to transition schools into Loyal status.',
          'Commission Oversight: Review registrar commission ledgers and authorize regional payout disbursements.'
        ]
      }
    ]
  },
  {
    id: 10,
    title: '10. Compensation model (10% + 2%)',
    subtitle: 'Lucrative, Recurring Commission Structure',
    iconName: 'DollarSign',
    summary: 'Elimu360 offers an industry-leading, multi-year recurring compensation model rewarding field performance and regional leadership.',
    detailedContent: [
      {
        heading: 'Compensation Breakdown',
        points: [
          '10% Recurring Commission for Registrars: Whichever School Registrar registers a school receives 10% of the total subscription amount paid by that school for three (3) consecutive years.',
          '2% Regional Coordinator Override: Regional Coordinators receive an additional 2% override commission on all earnings generated by the registrars under their direct supervision.',
          'Long-Term Residual Wealth: Provides predictable, multi-year recurring revenue as onboarded schools renew their annual SIMS subscriptions.',
          'Transparent Ledger Tracking: Real-time commission statement available inside the Registrar and Coordinator financial portals.'
        ]
      }
    ]
  },
  {
    id: 11,
    title: '11. Reporting system',
    subtitle: 'Real-Time Field Intelligence & Survey Analytics',
    iconName: 'FileText',
    summary: 'Every field interaction is captured via our digital survey engine, streaming real-time market intelligence to leadership.',
    detailedContent: [
      {
        heading: 'Field Intelligence Workflow',
        points: [
          'Registrars complete the 7-Question Onboarding Survey covering reachability, interest, top features, objections, and competitors.',
          'Data streams instantly to the Super Admin Product Intelligence & Field Intelligence Hub.',
          'Enables immediate product adjustments, objection resolution strategies, and regional coverage analytics.',
          'Helps coordinators deploy tailored follow-up collateral to win reluctant school directors.'
        ]
      }
    ]
  },
  {
    id: 12,
    title: '12. Code of conduct',
    subtitle: 'Ethics, Integrity, and Professional Excellence',
    iconName: 'ShieldCheck',
    summary: 'All field representatives must maintain the highest standards of professional ethics, truthfulness, and institutional respect.',
    detailedContent: [
      {
        heading: 'Ethical Standards & Non-Negotiables',
        points: [
          'Professional Appearance & Punctuality: Represent Elimu360 with clean, formal attire and respectful speech.',
          'Absolute Honesty in Data Entry: Zero tolerance for fake survey answers, phantom school records, or misrepresented data.',
          'STRICT ZERO CASH POLICY: Registrars and Coordinators must NEVER accept cash payments directly from schools. All subscription payments must be made through official bank accounts or corporate merchant codes.',
          'Data Privacy Safeguards: Treat all school records, student details, and director contact information with strict confidentiality.'
        ]
      }
    ]
  }
];

export const FIELD_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 1,
    title: 'Module 1: Understanding Elimu360',
    duration: '45 Mins',
    objective: 'Master the mission, vision, core value proposition, architecture, and competitive advantage of Elimu360.',
    coreConcepts: [
      'What Elimu360 is and why it was built specifically for Rwandan pre-primary, primary, secondary, and TVET schools.',
      'The transition from paper-based chaos, lost student files, and manual marks calculation to digital cloud governance.',
      'Understanding the 10 core institutional directorates and full alignment with REB and NESA curriculum guidelines.'
    ],
    fieldScripts: [
      {
        scenario: 'Introducing Elimu360 to a Headteacher in 60 seconds',
        whatToSay: '"Good morning Director. Elimu360 is Rwanda’s cloud-native school software designed to eliminate paper report card stress, automate lesson planning for your teachers, and give you 100% control over student fee collections—accessible right from your computer or phone with zero installation."',
        keyTakeaway: 'Focus on time savings, financial clarity, and zero technical setup required.'
      },
      {
        scenario: 'Explaining Cloud Infrastructure to a non-technical Owner',
        whatToSay: '"Director, with Elimu360, you never need to buy expensive computer servers, pay IT engineers, or worry about hard drive crashes. Everything is securely stored in the cloud, backed up daily, and accessible anywhere in Rwanda."',
        keyTakeaway: 'Relieve fear of hardware failure and high capital expenditure.'
      }
    ],
    practicalTip: 'Always emphasize that Elimu360 requires no expensive servers or IT engineers—it runs smoothly on any web browser.'
  },
  {
    id: 2,
    title: 'Module 2: School Problems Elimu360 Solves',
    duration: '60 Mins',
    objective: 'Identify specific operational bottlenecks in schools and articulate targeted digital solutions.',
    coreConcepts: [
      'How paper report cards cost schools millions in paper, toner printing, and lost staff productivity every term.',
      'How manual mark compilation causes human calculation error, teacher friction, parent complaints, and altered grades.',
      'How unorganized fee ledgers lead to uncollected tuition, revenue leakage, and unverified student attendance.'
    ],
    fieldScripts: [
      {
        scenario: 'Speaking to a Director of Studies (DOS) about Report Card Stress',
        whatToSay: '"DOS, how many days does your team spend calculating marks, positions, and writing report cards at the end of Term? With Elimu360, once teachers enter raw marks, complete A4 termly report cards with positions and QR codes generate in under 5 seconds for the entire school."',
        keyTakeaway: 'The DOS is your biggest internal advocate when they realize Elimu360 saves them 100+ hours of tedious work.'
      },
      {
        scenario: 'Speaking to a Bursar about Fee Collection Audits',
        whatToSay: '"Bursar, how do you verify if a student has paid before issuing an exam permit? In Elimu360, every student has a digital ledger that shows exact payment history, balance due, and partial receipts instantly."',
        keyTakeaway: 'Bursars embrace Elimu360 when they see how it stops tuition fee leakage.'
      }
    ],
    practicalTip: 'Ask the DOS to show you how they currently make report cards—listening to their pain creates immediate receptivity.'
  },
  {
    id: 3,
    title: 'Module 3: Complete System Demonstration',
    duration: '90 Mins',
    objective: 'Gain hands-on proficiency in navigating all 10 modules of Elimu360 during live school presentations.',
    coreConcepts: [
      'Demonstrating Marks Entry & Official A4 Report Card generation with QR verification.',
      'Showing the AI Lesson Planner creating CBC scheme steps and lesson plans in 5 seconds.',
      'Demonstrating Fee Ledgers, Student 360 dossiers, and Gate Pass exit permits.'
    ],
    fieldScripts: [
      {
        scenario: 'Demonstrating the AI Lesson Planner to Teachers',
        whatToSay: '"Watch this: we type \'Photosynthesis\' for Senior 2 Biology, select CBC curriculum, and click Generate. In 5 seconds, you have a complete lesson introduction, development steps, teacher activities, and conclusion aligned with REB standards."',
        keyTakeaway: 'Live AI demonstrations generate immediate excitement and buy-in from teaching staff.'
      },
      {
        scenario: 'Demonstrating QR Code Report Verification to the Headteacher',
        whatToSay: '"Scan this QR code on the generated report card with your phone camera. It immediately pulls up the authentic digital transcript on Elimu360, proving this report card cannot be forged or altered by a student."',
        keyTakeaway: 'Security features build massive institutional trust.'
      }
    ],
    practicalTip: 'Keep your demo under 15 minutes. Show 3 high-impact features first: Report Cards, AI Lesson Planner, and Fee Ledger.'
  },
  {
    id: 4,
    title: 'Module 4: How to Demonstrate it to a School',
    duration: '60 Mins',
    objective: 'Master presentation etiquette, decision-maker engagement, and live device demonstration tactics.',
    coreConcepts: [
      'How to secure an appointment with the School Legal Rep or Owner.',
      'Setting up your laptop/tablet for a high-impact presentation.',
      'Structuring the meeting: 5 min Intro -> 15 min Demo -> 10 min Q&A -> Onboarding.'
    ],
    fieldScripts: [
      {
        scenario: 'Opening the Demonstration Meeting',
        whatToSay: '"Thank you Director for your time. Today I am not here to sell you software—I am here to show you how top accredited schools in Rwanda are eliminating report card printing costs and securing their tuition collections. May I show you a 10-minute live demonstration?"',
        keyTakeaway: 'Frame the meeting around institutional advancement, not a sales push.'
      }
    ],
    practicalTip: 'Ensure your smartphone or tablet has active internet connectivity before entering the Director’s office.'
  },
  {
    id: 5,
    title: 'Module 5: How to Answer Objections',
    duration: '60 Mins',
    objective: 'Overcome top school objections with confidence, empathy, and factual resolution scripts.',
    coreConcepts: [
      'Objection 1: "We already use Excel / paper books."',
      'Objection 2: "We don’t have budget right now."',
      'Objection 3: "Our teachers are not tech-savvy."'
    ],
    fieldScripts: [
      {
        scenario: 'Handling "We already use Excel"',
        whatToSay: '"Excel is great for simple spreadsheets, Director, but Excel files get corrupted, deleted, or carried away when a staff member leaves. Elimu360 stores student transcripts securely in the cloud for 10 years, automatically computes positions, and prints QR-verified official report cards that Excel cannot do."',
        keyTakeaway: 'Highlight data security, permanent record keeping, and professional output.'
      },
      {
        scenario: 'Handling "We don’t have budget right now"',
        whatToSay: '"That is precisely why we offer the First-Term Pilot program! Your school gets complete, unlimited access for your entire first term at ZERO upfront cost. You only pay after you see the massive paper and time savings with your own eyes."',
        keyTakeaway: 'Leverage the 3-Month First-Term Pilot badge to eliminate financial resistance.'
      }
    ],
    practicalTip: 'Never argue with a school leader. Validate their concern first, then share how Elimu360 resolves it.'
  },
  {
    id: 6,
    title: 'Module 6: How to Onboard a School',
    duration: '45 Mins',
    objective: 'Execute the step-by-step school onboarding process seamlessly in under 5 minutes.',
    coreConcepts: [
      'Filling out the School Registration form in the Registrar Portal.',
      'Completing the mandatory 7-Question Field Assessment Survey before submission.',
      'Enrolling the school into the First-Term Pilot status.',
      'Generating Director activation tokens and walking them through their first login.'
    ],
    fieldScripts: [
      {
        scenario: 'Handing over credentials to the School Director',
        whatToSay: '"Congratulations Director! Your school [School Name] is now officially registered in the Elimu360 First-Term Pilot program. Here are your master Director credentials and activation token. Let us log in together right now so I can show you your dashboard."',
        keyTakeaway: 'Always perform the first login together with the Director before leaving the premises.'
      }
    ],
    practicalTip: 'Provide the Director with a printed or neatly written credential card containing their email and initial activation password.'
  },
  {
    id: 7,
    title: 'Module 7: How to Report Field Findings',
    duration: '30 Mins',
    objective: 'Master the 7-Question Field Onboarding Survey engine to stream precise market data to leadership.',
    coreConcepts: [
      'The importance of submitting a survey for EVERY school visited (whether onboarded or not).',
      'Accurately rating decision-maker reachability, school interest, objections, and competitor systems.',
      'How survey data directly influences product features and regional support.'
    ],
    fieldScripts: [
      {
        scenario: 'Completing the Survey Post-Visit',
        whatToSay: '"Even if the Director needed time to consult their board, submitting the survey immediately captures their objections and competitor system so our Regional Coordinator can assist me with tailored follow-up materials."',
        keyTakeaway: 'Surveys are mandatory field intelligence tools that ensure no prospect is forgotten.'
      }
    ],
    practicalTip: 'Submit your survey within 15 minutes of completing a school visit while details are fresh in your memory.'
  }
];

export const PRACTICAL_TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: 'What is the recurring commission rate for a School Registrar when they register a school, and for how many years do they receive it?',
    options: [
      '5% for 1 year only',
      '10% recurring commission for three (3) consecutive years',
      '15% one-time bonus upon school approval',
      '2% lifetime commission'
    ],
    correctIndex: 1,
    explanation: 'School Registrars receive a guaranteed 10% recurring commission of the subscription amount paid by their registered school for 3 consecutive years.'
  },
  {
    id: 2,
    question: 'What additional override commission do Regional Coordinators receive on earnings generated by their supervised registrars?',
    options: [
      '0.5% override',
      '1% override',
      '2% override commission on all earned amounts',
      '5% override'
    ],
    correctIndex: 2,
    explanation: 'Coordinators receive an extra 2% override commission on all amounts earned by the registrars under their direct supervision.'
  },
  {
    id: 3,
    question: 'How long does a newly registered school remain in the "First-Term Pilot" badge status before becoming "Loyal"?',
    options: [
      '1 week',
      '1 month',
      'Their first term / three (3) months',
      '1 full academic year'
    ],
    correctIndex: 2,
    explanation: 'Every newly registered school remains in the First-Term Pilot status for their first term (3 months) before transitioning to Loyal status.'
  },
  {
    id: 4,
    question: 'Who are the primary decision-makers you should seek to present Elimu360 to during a school visit?',
    options: [
      'The school gatekeeper or security guard only',
      'School Legal Representatives, Owners, Headteachers, or Directors of Study (DOS)',
      'Students in classroom breaks',
      'External vendors'
    ],
    correctIndex: 1,
    explanation: 'Executive institutional leaders—School Owners, Headteachers, Directors, and DOS—hold decision-making authority for software adoption.'
  },
  {
    id: 5,
    question: 'What should a Registrar do if a school says, "We don’t have budget right now"?',
    options: [
      'Leave immediately and never contact the school again',
      'Explain the First-Term Pilot program which allows 3 months of complete access at zero upfront cost',
      'Offer a personal cash discount out of pocket',
      'Argue with the Director about school priorities'
    ],
    correctIndex: 1,
    explanation: 'The First-Term Pilot program removes financial barriers by granting full 3-month access so schools experience value before committing funds.'
  },
  {
    id: 6,
    question: 'Are Registrars or Coordinators permitted to collect cash subscription payments directly from school Directors?',
    options: [
      'Yes, cash is always preferred in field visits',
      'NO. Absolutely zero direct cash collection is allowed; all payments must pass through official school banking or corporate merchant channels',
      'Yes, provided they give a handwritten note',
      'Only if the Director insists'
    ],
    correctIndex: 1,
    explanation: 'To maintain strict financial ethics and transparency, zero cash payments are collected directly. All funds go through official bank channels.'
  },
  {
    id: 7,
    question: 'Why is it mandatory to submit a Field Onboarding Survey after visiting a school?',
    options: [
      'It is only optional if the school agrees to buy',
      'It streams real-time field intelligence on reachability, objections, and competitors to leadership for immediate support and analytics',
      'It is used to penalize registrars',
      'To generate student report cards'
    ],
    correctIndex: 1,
    explanation: 'Field surveys capture crucial market feedback, enabling Regional Coordinators and Super Admins to assist with objection resolution and product strategy.'
  },
  {
    id: 8,
    question: 'Which Elimu360 feature allows teachers to generate REB-compliant lesson steps in seconds?',
    options: [
      'Financial Ledger',
      'AI Lesson Planner & Scheme Builder',
      'Library Borrowing Portal',
      'SMS Dispatcher'
    ],
    correctIndex: 1,
    explanation: 'The AI Lesson Planner uses Gemini AI to instantly create scheme steps, lesson introductions, development activities, and conclusions.'
  },
  {
    id: 9,
    question: 'What key benefit does the Official Reports Generator provide to the Director of Studies (DOS)?',
    options: [
      'It requires them to calculate position averages manually',
      'It automatically compiles marks, calculates positions, formats A4/Annual report cards, and generates QR code verifications in seconds',
      'It replaces the teacher entirely',
      'It deletes old student marks'
    ],
    correctIndex: 1,
    explanation: 'The Official Reports Generator automates mark compilation, position ranking, and PDF generation, saving the DOS over 100 hours per term.'
  },
  {
    id: 10,
    question: 'What is the core expectation regarding data honesty in the Registrar & Coordinator Code of Conduct?',
    options: [
      'Registrars may invent survey responses if they are busy',
      'Absolute honesty is required; fake registrations, phantom data, or altered records result in immediate termination and loss of accreditation',
      'Data accuracy is optional',
      'Only student names need to be correct'
    ],
    correctIndex: 1,
    explanation: 'Field integrity and data truthfulness are absolute non-negotiables in the Elimu360 Code of Conduct.'
  }
];
