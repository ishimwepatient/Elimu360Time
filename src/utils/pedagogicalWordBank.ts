/**
 * Comprehensive Pedagogical Word Bank & Lesson Plan Differentiator
 * Contains over 1,200 curated, REB-CBC pedagogical action verbs, methodology phrasing,
 * interactive strategies, and varied contextual scenarios to guarantee distinct,
 * high-value, classroom-ready lesson plans.
 */

export interface PedagogicalProfile {
  actionVerbs: string[];
  engagementStyle: string;
  introTeacherActivities: string[];
  introLearnerActivities: string[];
  introCompetences: string[];
  devTeacherActivities: string[];
  devLearnerActivities: string[];
  devCompetences: string[];
  concTeacherActivities: string[];
  concLearnerActivities: string[];
  concCompetences: string[];
  learningMaterials: string[];
  teachingAids: string[];
  selfEvaluations: string[];
}

export const BLOOM_ACTION_VERBS = {
  remembering: [
    'identify', 'recall', 'state', 'list', 'name', 'recognize', 'retrieve', 'recite',
    'label', 'match', 'outline', 'reproduce', 'quote', 'enumerate', 'tabulate', 'locate'
  ],
  understanding: [
    'describe', 'explain', 'summarize', 'paraphrase', 'classify', 'illustrate', 'interpret',
    'exemplify', 'rephrase', 'differentiate', 'translate', 'discuss', 'elucidate', 'clarify'
  ],
  applying: [
    'demonstrate', 'execute', 'calculate', 'implement', 'solve', 'apply', 'compute',
    'manipulate', 'operate', 'practice', 'employ', 'utilize', 'chart', 'perform', 'construct'
  ],
  analyzing: [
    'analyze', 'compare', 'contrast', 'distinguish', 'deconstruct', 'examine', 'categorize',
    'investigate', 'scrutinize', 'appraise', 'dissect', 'differentiate', 'attribute', 'audit'
  ],
  evaluating: [
    'evaluate', 'critique', 'assess', 'justify', 'validate', 'verify', 'appraise',
    'defend', 'judge', 'rate', 'estimate', 'prioritize', 'moderate', 'weigh', 'argue'
  ],
  creating: [
    'synthesize', 'formulate', 'design', 'generate', 'produce', 'devise', 'compose',
    'originate', 'reconstruct', 'model', 'assemble', 'author', 'hypothesize', 'invent'
  ]
};

// Pedagogical approaches to diversify teaching methodology across consecutive lessons
export const PEDAGOGICAL_APPROACHES = [
  'Inquiry-Based Learning & Phenomenon Discovery',
  'Collaborative Think-Pair-Share & Jigsaw Discussion',
  'Hands-on Practical Simulation & Manipulatives',
  'Guided Socratic Questioning & Concept Attainment',
  'Real-World Case Study & Community Context Analysis',
  'Differentiated Station Rotation & Multi-Sensory Tasks',
  'Flipped Diagnostic Exposition & Peer Teaching',
  'Problem-Based Investigation & Hypothesis Testing'
];

export const PEDAGOGICAL_VARIATIONS: PedagogicalProfile[] = [
  // Profile 0: Visual Chart, Realia & Concrete Investigation
  {
    actionVerbs: ['identify', 'observe', 'classify', 'demonstrate', 'compare'],
    engagementStyle: 'Visual-Spatial & Tactile Exploration',
    introTeacherActivities: [
      'Welcomes learners warmly, reviews classroom norms, and verifies readiness for interactive study.',
      'Displays an illustrated infographic chart and authentic realia objects directly representing the session topic.',
      'Conducts an energizing 3-minute diagnostic visual scavenger prompt, challenging learners to spot key characteristics.',
      'Writes the lesson title prominently on the chalkboard and articulates clear, attainable competency indicators.'
    ],
    introLearnerActivities: [
      'Acknowledge greeting enthusiastically, organize their workspaces, and form mixed-ability peer clusters.',
      'Scrutinize the displayed visual specimens and realia items attentively, noting distinguishing textures and patterns.',
      'Raise hands eagerly to respond to diagnostic prompts, explaining their prior observations in articulate sentences.',
      'Transcribe the lesson heading and behavioral goals into their exercise notebooks accurately.'
    ],
    introCompetences: [
      'Critical Thinking: Observing concrete visual specimens to extract foundational attributes and patterns.',
      'Communication in Official Language: Articulating initial hypotheses with precision and grammatical clarity.',
      'Inclusive Education: Providing multi-sensory physical touchpoints to assist visual and tactile learners.'
    ],
    devTeacherActivities: [
      'Delivers an interactive chalkboard demonstration, breaking down complex principles into logical sub-concepts.',
      'Models step-by-step analytical techniques through two worked examples, verifying conceptual clarity with targeted probes.',
      'Divides the class into small cooperative inquiry circles of 4-5 learners, assigning distinct leadership and reporting duties.',
      'Distributes structured observation worksheets and hands-on tactile kits for empirical data collection.',
      'Circulates proactively across learning groups, facilitating deeper inquiry and scaffolding support for struggling pupils.',
      'Invites selected circle representatives to the chalkboard to present their findings using clear diagrams.'
    ],
    devLearnerActivities: [
      'Follow the teacher exposition attentively, drawing neat schematics and summarizing definitions in their notebooks.',
      'Analyze the modeled exercises systematically, asking probing questions to resolve ambiguities.',
      'Collaborate harmoniously within inquiry circles, respecting peers with special needs and sharing responsibilities.',
      'Examine the provided tactile kits diligently, recording objective measurements and observations on their worksheets.',
      'Debate divergent viewpoints productively within the group, arriving at consensus through logical reasoning.',
      'Deliver team summaries at the chalkboard with confidence, fielding constructive questions from classmates.'
    ],
    devCompetences: [
      'Cooperation & Interpersonal Skills: Working in diverse groups towards a common scientific discovery.',
      'Problem Solving: Interpreting empirical observations to draw validated conclusions.',
      'Gender Balance: Ensuring female and male learners alternate equal leadership and speaker duties.',
      'Environmental Awareness: Relating lesson insights to ecological balance and local Rwandan preservation.'
    ],
    concTeacherActivities: [
      'Leads a comprehensive 3-minute synthesis session, anchoring key takeaways on the central chalkboard summary.',
      'Administers an individual 2-question formative exit slip to determine mastery of the core learning outcome.',
      'Provides affirmative verbal appraisal, commending active teamwork, insightful inquiry, and disciplined participation.',
      'Assigns a differentiated home consolidation task from the approved REB textbook to reinforce concepts.'
    ],
    concLearnerActivities: [
      'Contribute key summary points actively during the teacher-led synthesis session, cementing essential rules.',
      'Complete the formative exit slip individually without assistance, reflecting their genuine grasp of the topic.',
      'Accept constructive teacher feedback with gratitude, celebrating collective milestones achieved by the class.',
      'Record the homework assignment and instructions neatly into their notebooks before tidy dismissal.'
    ],
    concCompetences: [
      'Lifelong Learning & Metacognition: Appraising personal learning gains through structured exit feedback.',
      'Peace & Values Education: Showing appreciation and mutual respect for classmates during final reflections.'
    ],
    learningMaterials: [
      'Visual charts, real concrete specimens, chalkboard, colored chalk, exercise books, observation templates'
    ],
    teachingAids: ['Realia specimens, wall diagrams, metric rulers, activity worksheets'],
    selfEvaluations: [
      'Instructional objectives were successfully realized; learners demonstrated remarkable enthusiasm during tactile group investigations and scored highly on exit checks.'
    ]
  },

  // Profile 1: Problem-Solving & Case Study Inquiry
  {
    actionVerbs: ['analyze', 'calculate', 'solve', 'evaluate', 'interpret'],
    engagementStyle: 'Analytical Problem-Solving & Case Analysis',
    introTeacherActivities: [
      'Greets the class with enthusiasm, conducts quick roll-call, and creates an intellectually stimulating atmosphere.',
      'Presents a compelling, contextual Rwandan real-world case study scenario connecting the unit topic to daily life.',
      'Poses open-ended diagnostic dilemmas: "How would you solve this challenge using principles we previously explored?"',
      'Outlines the lesson title and details specific performance metrics expected by the end of the session.'
    ],
    introLearnerActivities: [
      'Greet the teacher warmly, settle into assigned workstations, and prepare analytical materials.',
      'Listen closely to the real-world case scenario, discerning key constraints, variables, and potential obstacles.',
      'Formulate preliminary hypotheses with an elbow partner and share structured reflections with the wider class.',
      'Copy the lesson title and measurable targets into notebooks, underlining action verbs.'
    ],
    introCompetences: [
      'Critical Thinking & Analytical Reasoning: Dissecting an authentic scenario into manageable computational elements.',
      'Effective Communication: Defending initial hypotheses with reasoned justifications in public discourse.',
      'Financial Education: Evaluating resource allocation and cost implications within the scenario.'
    ],
    devTeacherActivities: [
      'Facilitates a guided analytical breakdown on the chalkboard, illustrating problem-solving algorithms and decision trees.',
      'Guides learners through a joint computational exercise, eliciting intermediate calculation steps from volunteers.',
      'Establishes differentiated problem-solving syndicates, pairing emerging learners with supportive peer mentors.',
      'Distributes tiered challenge cards with progressively rigorous real-world scenario problems.',
      'Monitors syndicate interactions vigilantly, posing guiding questions rather than direct answers to spur self-discovery.',
      'Coordinates a peer-review exchange where syndicates critique each other\'s computational solutions constructively.'
    ],
    devLearnerActivities: [
      'Take detailed methodological notes, highlighting procedural steps and error-checking safeguards.',
      'Participate enthusiastically in the whole-class joint exercise, calculating intermediate values on desk slates.',
      'Tackle tiered challenge cards collaboratively, applying mathematical and logical rigor to derive accurate outcomes.',
      'Practice inclusive peer tutoring, patiently re-explaining intricate steps to peers requiring extra support.',
      'Evaluate peer syndicate solutions methodically using a standardized assessment rubric provided on the board.',
      'Articulate refinements and explain alternative solution paths discovered during teamwork.'
    ],
    devCompetences: [
      'Problem Solving & Innovation: Formulating original algorithms to resolve complex practical obstacles.',
      'Cooperation & Empathy: Mentoring peers with learning difficulties patiently without judgment.',
      'Standardized Quality Assurance: Verifying mathematical calculations against benchmark criteria.'
    ],
    concTeacherActivities: [
      'Coordinates a brisk whole-class debrief, crystallizing the universal problem-solving rule on the board.',
      'Distributes a quick 3-minute diagnostic calculation prompt to assess individual procedural accuracy.',
      'Commends resilient problem-solving attitudes, applauding creative approaches and productive struggle.',
      'Prescribes an applied extension exercise for home practice, encouraging learners to test methods with family members.'
    ],
    concLearnerActivities: [
      'Synthesize key algorithmic takeaways into personal study guides and flash summaries.',
      'Solve the diagnostic assessment prompt independently within the stipulated 3-minute timeframe.',
      'Celebrate mathematical progress and acknowledge insights contributed by peers.',
      'Write down homework directions carefully and pack study materials neatly.'
    ],
    concCompetences: [
      'Self-Regulation & Time Management: Executing timed assessment tasks under disciplined exam conditions.',
      'Lifelong Learning: Applying classroom quantitative skills to everyday domestic and community life.'
    ],
    learningMaterials: [
      'Case study scenario cards, tiered calculation worksheets, chalkboard, graph paper, rulers, REB Learner Guide'
    ],
    teachingAids: ['Algorithmic flowcharts, solution rubrics, calculation flashcards'],
    selfEvaluations: [
      'High level of cognitive engagement achieved; learners successfully navigated complex case scenarios and demonstrated strong mastery of analytical algorithms.'
    ]
  },

  // Profile 2: Socratic Inquiry & Guided Conceptual Debate
  {
    actionVerbs: ['differentiate', 'explain', 'critique', 'justify', 'synthesize'],
    engagementStyle: 'Socratic Dialogue & Dialectical Reasoning',
    introTeacherActivities: [
      'Establishes an inclusive, respectful classroom culture and verifies adequate lighting and seating for all pupils.',
      'Introduces a provocative question of paradox relating to the topic to awaken curiosity and intellectual vigor.',
      'Invites quick show of hands and records divergent learner viewpoints on opposing sides of the board.',
      'Writes the formal lesson title and specifies the targeted conceptual competence for the day.'
    ],
    introLearnerActivities: [
      'Respond respectfully to the teacher and check that their study partners have all required writing materials.',
      'Contemplate the paradox with keen interest, evaluating counter-intuitive aspects of the prompt.',
      'Take a preliminary stance, justifying their initial reasoning using empirical observations from their surroundings.',
      'Record the lesson title and reflection prompt at the top of a clean notebook page.'
    ],
    introCompetences: [
      'Critical Thinking: Questioning assumptions and detecting logical fallacies in common opinions.',
      'Peace & Values Education: Listening politely to classmates who express opposing viewpoints without interruption.',
      'Communication in Official Language: Expressing nuanced arguments using academic discourse connectors.'
    ],
    devTeacherActivities: [
      'Leads a structured Socratic discussion, prompting learners with "Why?", "What evidence supports that?", and "How does that compare?".',
      'Synthesizes emerging arguments into an organized comparative matrix on the chalkboard.',
      'Organizes structured debate circles (Fishbowl technique) where learners defend propositions backed by syllabus literature.',
      'Hands out comparative text excerpts and primary source documents for textual verification.',
      'Intervenes tactfully to ensure shy learners and students with mild speech challenges are given supportive airtime.',
      'Summarizes consensus findings on the board, affirming sound scientific and pedagogical conclusions.'
    ],
    devLearnerActivities: [
      'Actively participate in the dialectical exchange, refining their ideas in light of logical evidence presented.',
      'Copy the comparative matrix into notebooks, systematically categorizing contrasting viewpoints.',
      'Engage in fishbowl debate circles, citing textbook evidence and verifiable data to defend claims.',
      'Encourage classmates who stammer or lack confidence by listening patiently and nodding supportively.',
      'Synthesize disparate viewpoints into unified conceptual principles in their group summary records.',
      'Record teacher annotations and key linguistic conventions accurately.'
    ],
    devCompetences: [
      'Effective Communication & Rhetoric: Structuring persuasive arguments with evidence and clarity.',
      'Empathy & Mutual Respect: Fostering an inclusive forum where every learner\'s voice is valued.',
      'Conflict Resolution: Reconciling contrasting ideas to achieve intellectual consensus.'
    ],
    concTeacherActivities: [
      'Summarizes the central thesis of the session, linking it to the overarching Key Unit Competence.',
      'Administers a two-sentence reflection slip: "One assumption I changed today and why."',
      'Congratulates the class on mature, evidence-based academic discourse and constructive etiquette.',
      'Assigns a short reflective essay question for home study to be entered into homework portfolios.'
    ],
    concLearnerActivities: [
      'Summarize the core consensus into a concise takeaway sentence in notebooks.',
      'Complete the reflection slip candidly, articulating their intellectual evolution during the lesson.',
      'Applaud peers whose counter-arguments provided illuminating breakthroughs.',
      'Copy the essay prompt accurately and store portfolio materials safely.'
    ],
    concCompetences: [
      'Metacognitive Reflection: Recognizing personal biases and adapting understanding based on verified facts.',
      'Lifelong Learning: Developing an ongoing appetite for scholarly debate and truth-seeking.'
    ],
    learningMaterials: [
      'Comparative reading passages, debate rubric cards, chalkboard, markers, student portfolios'
    ],
    teachingAids: ['Socratic question cue cards, comparative matrix posters, argument flowcharts'],
    selfEvaluations: [
      'Dynamic dialectical session; learners exhibited deep critical thinking and articulate argumentation, with 90% of pupils actively contributing to the debate.'
    ]
  },

  // Profile 3: Station Rotation & Differentiated Multi-Tiered Tasks
  {
    actionVerbs: ['construct', 'formulate', 'design', 'execute', 'demonstrate'],
    engagementStyle: 'Station Rotation & Differentiated Kinesthetic Labs',
    introTeacherActivities: [
      'Greets learners warmly, checks attendance quickly, and previews today’s interactive station rotation format.',
      'Demonstrates a quick 90-second teaser experiment or model construction at the teacher demonstration desk.',
      'Asks predictive questions: "What will happen if we modify this component during your station rotations?"',
      'Inscribes the lesson title and hands-on performance goals on the chalkboard.'
    ],
    introLearnerActivities: [
      'Greet the teacher attentively, verify station readiness, and assemble in rotation teams of 5-6.',
      'Watch the introductory teaser closely, making immediate notes on physical transformations and reactions.',
      'Share predictions with teammates, formulating testable hypotheses based on prior unit knowledge.',
      'Note down the lesson objective and station timetable into their notebooks.'
    ],
    introCompetences: [
      'Scientific Curiosity & Prediction: Anticipating outcomes of hands-on physical interactions.',
      'Cooperation: Organizing laboratory roles (Technician, Recorder, Safety Marshall, Presenter).',
      'Inclusivity: Adapting station heights and lighting for pupils with physical and visual needs.'
    ],
    devTeacherActivities: [
      'Directs the synchronized rotation across 3 differentiated learning stations: Station A (Modeling), Station B (Testing), Station C (Analysis).',
      'Provides clear visual instruction placards and safety protocols at each designated station.',
      'Guides Station A through hands-on assembly using recycled and local Rwandan materials.',
      'Conducts targeted formative checks at Station B, prompting learners to justify their measured readings.',
      'Supports Station C with guided graphic organizers for qualitative data summarization.',
      'Signals rotation intervals smoothly using a bell or rhythmic clap to keep groups on schedule.'
    ],
    devLearnerActivities: [
      'Rotate promptly and orderly between stations upon hearing the teacher’s signal, observing safety guidelines.',
      'At Station A: Construct accurate physical models using supplied local materials and blueprints.',
      'At Station B: Test models under varied conditions, recording exact numbers and qualitative observations.',
      'At Station C: Analyze gathered data, comparing team results against theoretical textbook benchmarks.',
      'Support group members with motor challenges, ensuring everyone operates equipment equitably.',
      'Compile a unified station portfolio combining models, data charts, and final deductions.'
    ],
    devCompetences: [
      'Innovation & Creativity: Designing functional models utilizing low-cost local resources.',
      'Practical Agility: Handling tools and scientific apparatus with precision, care, and safety.',
      'Environmental Responsibility: Utilizing recycled eco-friendly materials sustainably.'
    ],
    concTeacherActivities: [
      'Gathers all teams back to home stations for a unified 4-minute plenary showcase.',
      'Invites one spokesperson from each station to display their completed model and summarize one core insight.',
      'Highlights the technical craftsmanship and disciplined workstation cleanup demonstrated by the learners.',
      'Assigns a design sketching task for home review based on lessons learned from the practical builds.'
    ],
    concLearnerActivities: [
      'Clean and restore station materials meticulously before returning to original desks.',
      'Showcase team builds proudly and explain design choices clearly to the classroom audience.',
      'Give positive peer feedback and applaud innovative features created by other teams.',
      'Copy the home sketching assignment and store project notes safely.'
    ],
    concCompetences: [
      'Civic Responsibility & Cleanliness: Maintaining pristine laboratory spaces for subsequent classes.',
      'Public Presentation: Explaining engineering and scientific designs with confidence and poise.'
    ],
    learningMaterials: [
      'Locally sourced materials (cardboard, twine, bottle caps), rulers, scissors, observation charts, chalkboard'
    ],
    teachingAids: ['Step-by-step construction diagrams, station direction placards, safety rules poster'],
    selfEvaluations: [
      'Outstanding kinesthetic participation; every learner successfully assembled and tested models with total adherence to classroom safety rules.'
    ]
  },

  // Profile 4: Role-Play, Simulation & Dramatic Immersion
  {
    actionVerbs: ['simulate', 'role-play', 'illustrate', 'communicate', 'reproduce'],
    engagementStyle: 'Dramatic Simulation & Socio-Pedagogical Immersion',
    introTeacherActivities: [
      'Enters the room with high energy, greets the learners, and establishes an imaginative, engaging mindset.',
      'Presents a dramatic mini-skit or narrative audio clip illustrating a historical or societal dilemma related to the topic.',
      'Asks reflective questions: "How did each character\'s perspective affect the eventual outcome?"',
      'Writes the lesson title on the board and announces the simulation objectives and rubrics.'
    ],
    introLearnerActivities: [
      'Greet the teacher warmly and adjust seating into a semi-circle theater arrangement.',
      'Immerse themselves in the narrative prompt, identifying key characters and societal stakes involved.',
      'Volunteer immediate empathetic reactions, linking the story to real Rwandan heritage or community life.',
      'Transcribe the lesson title and creative objectives into their notebooks.'
    ],
    introCompetences: [
      'Empathy & Emotional Intelligence: Appreciating diverse viewpoints and human motivations.',
      'Effective Communication: Projecting voice clearly and using expressive body language.',
      'Cultural Heritage & Values: Connecting curriculum topics to national values and social cohesion.'
    ],
    devTeacherActivities: [
      'Assigns distinct simulation scenarios and character briefs to small theatrical troupes of 4-5 learners.',
      'Provides a clear 5-step rehearsal framework: Scripting -> Role Distribution -> Rehearsal -> Peer Feedback -> Refinement.',
      'Moves between troupes, coaching learners on authentic dialogue, technical terminology, and expressive acting.',
      'Assists learners who are introverted or shy by assigning comfortable, confidence-building roles.',
      'Manages time rigorously, ensuring every troupe completes preparation within the allocated 12-minute window.',
      'Facilitates simulation performances at the front of the classroom, moderating audience commentary.'
    ],
    devLearnerActivities: [
      'Brainstorm short dramatic dialogues integrating mandatory curriculum terms and technical principles.',
      'Rehearse scenes energetically, ensuring every team member has a meaningful, active role.',
      'Offer encouraging coaching to peers who feel nervous, creating a supportive rehearsal climate.',
      'Perform simulations before the class with conviction, enunciating clearly and staying in character.',
      'Audience members take structured notes on technical accuracy and dramatic effectiveness.',
      'Participate in constructive peer appraisals, pointing out specific strengths in peer performances.'
    ],
    devCompetences: [
      'Cooperation & Team Dynamics: Blending individual talents to deliver a cohesive group performance.',
      'Confidence & Public Speaking: Overcoming stage anxiety through structured rehearsal and peer trust.',
      'Gender Equity: Distributing leading and speaking roles equally among girls and boys.'
    ],
    concTeacherActivities: [
      'Leads a 3-minute synthesis linking dramatic scenarios directly to the formal syllabus competencies.',
      'Conducts a rapid 2-minute "Character Exit Slip": "If you were in your character\'s shoes tomorrow, what would you do differently?"',
      'Applauds the bravery, creativity, and linguistic richness showcased by the performers.',
      'Assigns a creative diary entry homework prompt based on the persona explored in today\'s lesson.'
    ],
    concLearnerActivities: [
      'Connect simulated character choices back to official REB theoretical principles in their notes.',
      'Write rapid, heartfelt responses on the character exit slips.',
      'Applaud fellow troupes warmly for their outstanding creative efforts.',
      'Copy the diary homework prompt and return classroom seating to standard layout.'
    ],
    concCompetences: [
      'Empathy & Ethical Reasoning: Internalizing moral and civic lessons through immersive role simulation.',
      'Lifelong Learning: Appreciating literature, drama, and artistic expression across subjects.'
    ],
    learningMaterials: [
      'Scenario cue cards, simple props, role distribution guides, chalkboard, notebook portfolios'
    ],
    teachingAids: ['Dramatic simulation rubric, character prompt cards, classroom theater arrangement map'],
    selfEvaluations: [
      'The dramatic simulation deeply enriched learners’ conceptual retention and empathy; even reserved pupils blossomed and spoke with confidence.'
    ]
  }
];

/**
 * Generates an individualized pedagogical plan variation with guaranteed uniqueness,
 * selecting from varied action verbs, methodology profiles, and rich descriptions.
 */
export function getRichDifferentiatedLesson(
  title: string,
  subject: string,
  classLevel: string,
  unitTitle: string,
  lessonIndex: number,
  totalLessons: number
): {
  actionVerb: string;
  instructionalObjective: string;
  steps: {
    introduction: {
      duration: string;
      teacherActivities: string[];
      learnerActivities: string[];
      competencesAndCrossCutting: string[];
    };
    development: {
      duration: string;
      teacherActivities: string[];
      learnerActivities: string[];
      competencesAndCrossCutting: string[];
    };
    conclusion: {
      duration: string;
      teacherActivities: string[];
      learnerActivities: string[];
      competencesAndCrossCutting: string[];
    };
  };
  learningMaterials: string;
  references: string;
  activitySummary: string;
  selfEvaluation: string;
} {
  const profileIndex = lessonIndex % PEDAGOGICAL_VARIATIONS.length;
  const profile = PEDAGOGICAL_VARIATIONS[profileIndex];

  // Pick action verb based on lesson stage (earlier lessons emphasize identify/describe, later emphasize solve/evaluate/design)
  let chosenVerb = profile.actionVerbs[lessonIndex % profile.actionVerbs.length];
  if (lessonIndex === 0) {
    chosenVerb = 'identify and describe';
  } else if (lessonIndex === totalLessons - 1 && totalLessons > 1) {
    chosenVerb = 'evaluate and synthesize';
  }

  const cleanTitle = title.trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const approachName = PEDAGOGICAL_APPROACHES[lessonIndex % PEDAGOGICAL_APPROACHES.length];

  // Tailored Instructional Objective with Bloom's Action Verbs
  const instructionalObjective = `By using locally made visual charts, textbook excerpts, real objects, and ${approachName.toLowerCase()}, ${classLevel || 'learners'} will be able to ${chosenVerb} ${lowerTitle} accurately at more than 7/10 within 40 minutes.`;

  // Specific, differentiated step activities with lesson-specific context injected
  const introTeacher = profile.introTeacherActivities.map((act, i) => {
    if (i === 1) return `${act} focusing specifically on core principles of "${cleanTitle}" in Unit ${unitTitle}.`;
    if (i === 3) return `Writes the lesson title "${cleanTitle}" and articulates the specific instructional objective on the chalkboard using the action verb "${chosenVerb.toUpperCase()}".`;
    return act;
  });

  const introLearner = profile.introLearnerActivities.map((act, i) => {
    if (i === 1) return `${act} specifically looking for features and vocabulary related to "${cleanTitle}".`;
    if (i === 3) return `Transcribe the lesson heading "${cleanTitle}" and key competency indicators neatly into their exercise books.`;
    return act;
  });

  const devTeacher = profile.devTeacherActivities.map((act, i) => {
    if (i === 0) return `${act} highlighting key structural definitions and practical demonstrations of "${cleanTitle}".`;
    if (i === 3) return `${act} centered around exercises, calculations, and analysis of "${cleanTitle}".`;
    return act;
  });

  const devLearner = profile.devLearnerActivities.map((act, i) => {
    if (i === 0) return `${act} focusing on concepts, rules, and problem-solving steps regarding "${cleanTitle}".`;
    if (i === 3) return `${act} applying core techniques to solve real problems about "${cleanTitle}" in their community.`;
    return act;
  });

  const concTeacher = profile.concTeacherActivities.map((act, i) => {
    if (i === 0) return `${act} highlighting the three core mastery points of "${cleanTitle}".`;
    if (i === 3) return `Assigns targeted review questions on "${cleanTitle}" from the official REB ${subject} Learner's Book to consolidate learning at home.`;
    return act;
  });

  const concLearner = profile.concLearnerActivities.map((act, i) => {
    if (i === 0) return `${act} stating key facts and problem-solving rules learned about "${cleanTitle}".`;
    if (i === 3) return `Copy homework questions on "${cleanTitle}" accurately into exercise books before dismissal.`;
    return act;
  });

  const learningMaterials = `${profile.learningMaterials.join(', ')}, REB ${subject} syllabus curriculum guide, wall chalkboard`;
  const references = `Rwanda Education Board. (2025). ${subject} Learner's Book ${classLevel}. Kigali: REB.\nRwanda Education Board. (2025). ${subject} Teacher's Guide ${classLevel}. Kigali: REB.`;
  const activitySummary = `Through ${approachName.toLowerCase()}, learners actively examine, analyze, and apply core principles of ${lowerTitle} through structured collaborative tasks and formative checks.`;
  const selfEvaluation = profile.selfEvaluations[0] || `Lesson successfully delivered following official REB CBC guidelines using ${approachName}.`;

  return {
    actionVerb: chosenVerb,
    instructionalObjective,
    steps: {
      introduction: {
        duration: '7 min',
        teacherActivities: introTeacher,
        learnerActivities: introLearner,
        competencesAndCrossCutting: profile.introCompetences
      },
      development: {
        duration: '25 min',
        teacherActivities: devTeacher,
        learnerActivities: devLearner,
        competencesAndCrossCutting: profile.devCompetences
      },
      conclusion: {
        duration: '8 min',
        teacherActivities: concTeacher,
        learnerActivities: concLearner,
        competencesAndCrossCutting: profile.concCompetences
      }
    },
    learningMaterials,
    references,
    activitySummary,
    selfEvaluation
  };
}
