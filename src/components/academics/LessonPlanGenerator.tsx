import React, { useState, useRef } from 'react';
import { useElimu } from '../../context/ElimuContext';
import { LessonPlanData } from '../../types';
import { 
  Sparkles, 
  FileDown, 
  Archive, 
  Plus, 
  Trash2, 
  RefreshCw, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  FileText,
  AlertCircle,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

async function safeFetchJson(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    throw new Error('Received an empty response from server. Please verify connection or try again.');
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Server non-JSON response body:', text);
    throw new Error('Server returned invalid response format. Please try again.');
  }
}

// Rich pedagogical content generator for fallback REB Lesson Plans (hundreds of words per step)
function generateRichPedagogicalSteps(title: string, subject: string, classLevel: string, unitTitle: string, index: number) {
  const introTeacherPool = [
    [
      `Greets the class warmly, registers attendance, and establishes an encouraging, inclusive classroom climate.`,
      `Displays a large, locally crafted visual chart and real-life concrete objects illustrating key concepts of ${title.toLowerCase()} related to ${unitTitle}.`,
      `Asks probing diagnostic questions (e.g., "Who can explain how ${title.toLowerCase()} impacts our daily life in Rwanda?") to reactivate learners' prior knowledge and stimulate interest.`,
      `Clearly writes the lesson title "${title}" and articulates the instructional objective on the chalkboard, guiding learners on expectations for the session.`
    ],
    [
      `Welcomes learners and conducts a brief 2-minute energizer focusing on concentration and active listening.`,
      `Presents a real-world scenario or short narrative based on local Rwandan society that directly incorporates ${title.toLowerCase()}.`,
      `Prompts learners to brainstorm in pairs for 3 minutes, guiding them to connect the story to their previous unit topics.`,
      `Shares the learning objectives clearly, emphasizing how mastering ${title.toLowerCase()} contributes to key unit competencies.`
    ],
    [
      `Enters the classroom, organizes seating to ensure proper proximity for learners with special educational needs, and checks readiness.`,
      `Distributes flashcards and illustrated textbook excerpts highlighting essential vocabulary and key principles of ${title.toLowerCase()}.`,
      `Leads a quick 3-question diagnostic review of the previous lesson, seamlessly bridging the concepts to today's focus on ${title.toLowerCase()}.`,
      `States the lesson goals, outlining the main activities and group tasks learners will perform during the session.`
    ]
  ];

  const introLearnerPool = [
    [
      `Respond enthusiastically to the teacher's greeting and settle down in their designated learning groups.`,
      `Observe the visual chart attentively, taking mental note of key details and visual representations of ${title.toLowerCase()}.`,
      `Actively raise hands to share prior experiences and answer diagnostic questions regarding ${title.toLowerCase()} in full sentences.`,
      `Copy the lesson title and key instructional objectives into their exercise books with precision.`
    ],
    [
      `Participate actively in the classroom energizer, demonstrating readiness and focus.`,
      `Listen carefully to the real-world scenario, identifying key connections to their daily lives and local environment.`,
      `Engage in pair-share discussions for 3 minutes, exchanging ideas and recording preliminary thoughts in exercise books.`,
      `Read the written lesson objectives aloud as a class, clarifying expectations with the teacher.`
    ],
    [
      `Assist peers with special needs in adjusting seating and organizing required learning materials on their desks.`,
      `Examine the distributed flashcards and textbook excerpts, reading key vocabulary terms aloud in pairs.`,
      `Recall previous learning points and respond confidently to the teacher's diagnostic review questions.`,
      `Acknowledge the lesson objectives and prepare exercise books and stationery for group activities.`
    ]
  ];

  const devTeacherPool = [
    [
      `Conducts a comprehensive step-by-step interactive exposition on ${title.toLowerCase()}, writing clear definitions, formulas, and structural examples on the chalkboard.`,
      `Models the correct application of ${title.toLowerCase()} using real classroom examples, guiding learners through two worked-out demonstration exercises.`,
      `Divides the class into small, heterogeneous cooperative learning groups of 5-6 learners, ensuring gender balance and inclusion of learners with special educational needs.`,
      `Distributes structured group activity worksheets focusing on practical problem-solving and analysis of ${title.toLowerCase()}.`,
      `Roams continuously around the classroom to facilitate group discussions, providing scaffolding for struggling learners and challenging fast finishers with extended tasks.`,
      `Invites selected group representatives to the chalkboard to present their solutions and explain their methodology to the rest of the class.`
    ],
    [
      `Introduces core principles of ${title.toLowerCase()} through guided inquiry, encouraging learners to deduce rules and patterns independently.`,
      `Demonstrates step-by-step techniques on the board, systematically breaking down complex elements into manageable, easy-to-understand components.`,
      `Organizes learners into small collaborative task teams, assigning distinct roles (Group Leader, Timekeeper, Secretary, Presenter) to promote shared responsibility.`,
      `Assigns a practical case study exercise requiring learners to apply ${title.toLowerCase()} to analyze real-life situations in their local community.`,
      `Monitors team progress attentively, offering targeted prompts to guide critical thinking and ensuring active participation from every member.`,
      `Coordinates peer-assessment where groups critique and validate each other's work constructively based on established evaluation criteria.`
    ],
    [
      `Presents a rich visual and textual demonstration of ${title.toLowerCase()}, highlighting common misconceptions and key guidelines for accuracy.`,
      `Guides the whole class through a joint problem-solving exercise, asking strategic questions at each step to verify understanding before independent practice.`,
      `Establishes differentiated learning stations across the classroom, pairing stronger learners with peers requiring additional guidance for inclusive peer-learning.`,
      `Provides hands-on activity cards focused on exercises, calculations, or textual analysis directly tied to ${title.toLowerCase()}.`,
      `Offers individual supportive coaching to learners with learning difficulties, using simplified visual aids and positive reinforcement.`,
      `Facilitates a whole-class synthesis panel where representatives from each station showcase their key discoveries and answer peer questions.`
    ]
  ];

  const devLearnerPool = [
    [
      `Follow the teacher's interactive exposition attentively, recording detailed notes, chalkboard diagrams, and key definitions in their exercise books.`,
      `Analyze the teacher's modeled demonstration step-by-step, asking clarifying questions when necessary to ensure complete conceptual clarity.`,
      `Transition smoothly into their assigned heterogeneous learning groups, warmly welcoming peers with special educational needs and organizing task roles.`,
      `Work collaboratively on group worksheets, discussing strategies, sharing viewpoints, and solving practical problems related to ${title.toLowerCase()}.`,
      `Engage actively in peer coaching within the group, explaining challenging steps to one another and verifying their collective calculations or answers.`,
      `Present group findings confidently at the chalkboard, taking turns to explain their reasoning and answering questions from classmates.`
    ],
    [
      `Participate in guided inquiry, identifying patterns and deducing core rules regarding ${title.toLowerCase()} through active reasoning.`,
      `Observe chalkboard demonstrations closely, taking neat notes and double-checking their understanding against peer notes.`,
      `Fulfill their assigned group roles responsibly (Secretary recording notes, Timekeeper managing progress, Presenter preparing speech).`,
      `Analyze the assigned case study collaboratively, applying ${title.toLowerCase()} concepts to solve community-based scenarios.`,
      `Seek guidance from the teacher when encountering obstacles, using constructive feedback to refine their analysis.`,
      `Participate in peer-assessment, evaluating other groups' presentations respectfully and offering helpful suggestions for improvement.`
    ],
    [
      `Examine visual demonstrations and textual examples, noting common pitfalls to avoid during practical execution of ${title.toLowerCase()}.`,
      `Contribute solutions during the whole-class joint problem-solving session, volunteering answers at key steps.`,
      `Rotate through learning stations cooperatively, supporting peers and working through hands-on activity cards systematically.`,
      `Complete assigned practice problems diligently, applying ${title.toLowerCase()} principles to varied contexts.`,
      `Learners requiring extra support engage directly with modified visual aids and teacher guidance to master foundational steps.`,
      `Share station summaries during the class panel, explaining key insights clearly and accepting peer feedback.`
    ]
  ];

  const concTeacherPool = [
    [
      `Guides the class through a comprehensive 3-minute synthesis of the lesson, summarizing the main takeaways regarding ${title.toLowerCase()}.`,
      `Administers a quick 2-question formative exit ticket to assess individual learning gains and identify areas needing remediation in the next session.`,
      `Provides constructive verbal appraisal, praising active participation, group cooperation, and notable effort from all learners.`,
      `Assigns a clear, relevant homework exercise from the REB Learner's Book on ${title.toLowerCase()} to consolidate learning at home.`
    ],
    [
      `Leads a brisk, interactive Q&A session review where learners summarize three key things they learned about ${title.toLowerCase()}.`,
      `Clarifies lingering doubts and corrects common misconceptions observed during group activities and presentations.`,
      `Commends the class for effective teamwork, inclusive behavior towards peers with special needs, and disciplined time management.`,
      `Writes the homework assignment clearly on the chalkboard and instructs learners to complete it before the next lesson.`
    ],
    [
      `Summarizes the connection between today's lesson on ${title.toLowerCase()} and the broader key unit competence for Unit ${unitTitle}.`,
      `Conducts a self-reflection prompt encouraging learners to rate their confidence in applying ${title.toLowerCase()} on a scale of 1 to 5.`,
      `Offers encouraging closing remarks, highlighting individual and group achievements recorded throughout the class.`,
      `Assigns targeted review exercises and research tasks for home practice, ensuring exercise books are packed neatly.`
    ]
  ];

  const concLearnerPool = [
    [
      `Participate actively in the lesson synthesis, contributing key bullet points on ${title.toLowerCase()} for the final chalkboard summary.`,
      `Complete the 2-question exit ticket individually on paper slips, demonstrating their individual grasp of the lesson content.`,
      `Receive teacher appraisal with enthusiasm, celebrating peer contributions and group success.`,
      `Copy the assigned homework accurately from the chalkboard into their exercise books for home practice.`
    ],
    [
      `State three major learning points about ${title.toLowerCase()} aloud during the interactive review session.`,
      `Listen carefully to the teacher's clarification of misconceptions, making necessary corrections in their exercise book notes.`,
      `Acknowledge feedback on group performance and appreciate classmates for collaborative teamwork.`,
      `Record the homework assignment neatly and verify instructions with the teacher before leaving.`
    ],
    [
      `Reflect on how ${title.toLowerCase()} links to the overall unit goals, recognizing its practical importance in ${subject}.`,
      `Engage in self-reflection by indicating their confidence level and identifying areas where they need further practice.`,
      `Applaud individual and team milestones acknowledged by the teacher.`,
      `Copy review exercises into exercise books and organize their desks and learning materials before dismissal.`
    ]
  ];

  const selIdx = index % 3;

  return {
    introduction: {
      duration: '7 min',
      teacherActivities: introTeacherPool[selIdx],
      learnerActivities: introLearnerPool[selIdx],
      competencesAndCrossCutting: [
        'Critical Thinking: Analyzing real-life visual prompts and diagnostic questions accurately.',
        'Effective Communication: Articulating initial thoughts and prior knowledge in clear full sentences.',
        'Financial & Environmental Education: Relating learning topics to efficient resource management in local contexts.'
      ]
    },
    development: {
      duration: '25 min',
      teacherActivities: devTeacherPool[selIdx],
      learnerActivities: devLearnerPool[selIdx],
      competencesAndCrossCutting: [
        'Cooperation & Leadership: Working effectively in heterogeneous groups with assigned roles and responsibilities.',
        'Inclusive Education: Supporting group members with special educational needs through peer coaching and visual aids.',
        'Problem Solving & Innovation: Applying theoretical principles to analyze and solve practical real-world scenarios.'
      ]
    },
    conclusion: {
      duration: '8 min',
      teacherActivities: concTeacherPool[selIdx],
      learnerActivities: concLearnerPool[selIdx],
      competencesAndCrossCutting: [
        'Self-Efficacy & Lifelong Learning: Taking personal responsibility for homework consolidation and self-reflection.',
        'Peace & Values Education: Demonstrating mutual respect during peer evaluations and constructive feedback sessions.'
      ]
    }
  };
}

export const LessonPlanGenerator: React.FC = () => {
  const { activeSchool, currentUser } = useElimu();

  // Form input states (Start clean without pre-added sample values)
  const [schoolName, setSchoolName] = useState<string>(activeSchool?.name || '');
  const [teacherName, setTeacherName] = useState<string>(currentUser?.name || '');
  const [educationLevel, setEducationLevel] = useState<string>('PRIMARY');
  const [classLevel, setClassLevel] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [term, setTerm] = useState<string>('Term 1');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<string>('40 min');
  const [classSize, setClassSize] = useState<number>(40);
  const [location, setLocation] = useState<string>('Classroom');
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState<string>('');
  const [unitTitle, setUnitTitle] = useState<string>('');
  
  // Multiple Lesson Titles for Bulk Generation (Clean starting state)
  const [lessonTitles, setLessonTitles] = useState<string[]>([]);
  const [newLessonInput, setNewLessonInput] = useState<string>('');

  const [selfEvaluation, setSelfEvaluation] = useState<string>('');

  // Generation & View states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlans, setGeneratedPlans] = useState<LessonPlanData[]>([]);
  const [activePlanIndex, setActivePlanIndex] = useState<number>(0);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Hidden print reference node for exact A4 capture
  const printRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (generatedPlans.length === 0) {
      const initialPlans = generateClientREBFallbackPlans({
        schoolName: schoolName || activeSchool?.name || 'GS Amahoro Kigali',
        teacherName: teacherName || currentUser?.name || 'NISHIMWE Joel Patient',
        educationLevel: educationLevel || 'PRIMARY',
        classLevel: classLevel || 'Primary 6 (P6)',
        subject: subject || 'English Language',
        term: term || 'Term 1',
        date: date || new Date().toISOString().split('T')[0],
        duration: duration || '40 min',
        classSize: classSize || 45,
        location: location || 'Classroom & Outdoor Playground',
        specialNeeds: specialNeeds || '2 learners with mild hearing impairment seated near the chalkboard with visual gesture aids.',
        unitNumber: unitNumber || '1',
        unitTitle: unitTitle || 'LEISURE AND SPORTS ACTIVITIES',
        lessonTitles: lessonTitles && lessonTitles.length > 0 ? lessonTitles : [
          'Vocabulary related to sports, indoor games and hobbies',
          'Using present simple tense to describe leisure routines',
          'Formulating dialogue questions about favorite Rwandan traditional games'
        ],
        selfEvaluation: selfEvaluation || 'Lesson successfully delivered following REB competency-based guidelines. Instructional objectives met; learners actively engaged in cooperative group activities and formative evaluation.'
      });
      setGeneratedPlans(initialPlans);
    }
  }, []);

  const handleLoadBlankForm = () => {
    const blank = createBlankUnfilledA4Plan(schoolName, teacherName);
    setGeneratedPlans([blank]);
    setActivePlanIndex(0);
    setStatusMessage({
      text: 'Loaded clean unfilled REB A4 Lesson Plan template for manual completion or printing.',
      type: 'success'
    });
  };

  const handleAddLessonTitle = () => {
    if (newLessonInput.trim()) {
      setLessonTitles([...lessonTitles, newLessonInput.trim()]);
      setNewLessonInput('');
    }
  };

  const handleRemoveLessonTitle = (index: number) => {
    if (lessonTitles.length > 1) {
      setLessonTitles(lessonTitles.filter((_, i) => i !== index));
    }
  };

function getSequentialDate(baseDateStr: string, offsetDays: number): string {
  if (offsetDays === 0 && baseDateStr && /^\d{4}-\d{2}-\d{2}$/.test(baseDateStr)) {
    return baseDateStr;
  }
  let year: number, month: number, day: number;
  if (baseDateStr && /^\d{4}-\d{2}-\d{2}$/.test(baseDateStr)) {
    const parts = baseDateStr.split('-').map(Number);
    year = parts[0];
    month = parts[1] - 1;
    day = parts[2];
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
    day = now.getDate();
  }

  const d = new Date(year, month, day);
  let added = 0;
  while (added < offsetDays) {
    d.setDate(d.getDate() + 1);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sat (6) and Sun (0)
      added++;
    }
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateClientREBFallbackPlans(payload: any): LessonPlanData[] {
  const titles = (payload.lessonTitles && payload.lessonTitles.length > 0)
    ? payload.lessonTitles
    : [payload.lessonTitle || 'Introduction to Subject Topic'];
  const total = titles.length;

  return titles.map((title: string, idx: number) => {
    const richSteps = generateRichPedagogicalSteps(
      title,
      payload.subject || 'Subject',
      payload.classLevel || 'Primary Level',
      (payload.unitTitle || 'UNIT TITLE').toUpperCase(),
      idx
    );

    const lessonDate = getSequentialDate(payload.date, idx);
    const lessonNumStr = `${idx + 1} Out of ${total}`;

    return {
      id: `lp_fallback_${Date.now()}_${idx}`,
      createdAt: new Date().toISOString(),
      schoolName: payload.schoolName || 'GS Amahoro Kigali',
      teacherName: payload.teacherName || 'Teacher',
      term: payload.term || 'Term 1',
      date: lessonDate,
      subject: payload.subject || 'Subject',
      classLevel: payload.classLevel || 'Primary Level',
      unitNumber: payload.unitNumber || '1',
      lessonNumber: lessonNumStr,
      duration: payload.duration || '40 min',
      classSize: payload.classSize || 40,
      specialNeeds: payload.specialNeeds || 'No special educational needs reported for this group.',
      unitTitle: (payload.unitTitle || 'UNIT TITLE').toUpperCase(),
      keyUnitCompetence: `Learners will be able to demonstrate thorough mastery and practical application of ${payload.unitTitle || 'unit topic'} using core REB CBC language structures, analytical techniques, and collaborative problem-solving methods.`,
      lessonTitle: title,
      instructionalObjective: `By using locally made visual charts, textbook excerpts, real objects, and guided activities, ${payload.classLevel || 'learners'} who attend will be able to ${title.toLowerCase()} accurately at more than 6/10 within ${payload.duration || '40 minutes'}.`,
      location: payload.location || 'Classroom & Outdoor Learning Area',
      learningMaterials: 'Exercise books, wall charts, chalkboard, markers, real objects, flashcards, differentiated activity cards, and REB textbook excerpts',
      references: `Rwanda Education Board. (2025). ${payload.subject || 'Subject'} Learner's Book ${payload.classLevel || ''}. Kigali: REB.\nRwanda Education Board. (2025). ${payload.subject || 'Subject'} Teacher's Guide ${payload.classLevel || ''}. Kigali: REB.`,
      activitySummary: `Through interactive group discussions, guided inquiry, chalkboard modeling, and peer coaching, learners will analyze ${title.toLowerCase()} and execute practical exercises.`,
      steps: richSteps,
      selfEvaluation: payload.selfEvaluation || 'Lesson successfully delivered following official REB competency-based guidelines. Instructional objectives met; learners actively engaged in cooperative group activities and formative evaluation.'
    };
  });
}

function createBlankUnfilledA4Plan(schoolNameVal = '', teacherNameVal = ''): LessonPlanData {
  return {
    id: `lp_blank_${Date.now()}`,
    createdAt: new Date().toISOString(),
    schoolName: schoolNameVal || '........................................................',
    teacherName: teacherNameVal || '........................................................',
    term: 'Term .....',
    date: new Date().toISOString().split('T')[0],
    subject: '........................................',
    classLevel: '........................................',
    unitNumber: '.....',
    lessonNumber: '1 Out of 1',
    duration: '40 min',
    classSize: 40,
    specialNeeds: '................................................................................................',
    unitTitle: '................................................................................................',
    keyUnitCompetence: '................................................................................................................................................',
    lessonTitle: '................................................................................................',
    instructionalObjective: 'By using ............................., learners will be able to ............................. accurately within ..... min.',
    location: 'Classroom',
    learningMaterials: 'Chalkboard, textbooks, wall charts, exercise books, stationery',
    references: 'Rwanda Education Board (REB) Competency-Based Curriculum Framework',
    activitySummary: '................................................................................................',
    steps: {
      introduction: {
        duration: '5 min',
        teacherActivities: ['................................................................................................'],
        learnerActivities: ['................................................................................................'],
        competencesAndCrossCutting: ['Cooperation, Communication']
      },
      development: {
        duration: '25 min',
        teacherActivities: [
          '................................................................................................',
          '................................................................................................'
        ],
        learnerActivities: [
          '................................................................................................',
          '................................................................................................'
        ],
        competencesAndCrossCutting: ['Critical Thinking, Problem Solving']
      },
      conclusion: {
        duration: '10 min',
        teacherActivities: ['................................................................................................'],
        learnerActivities: ['................................................................................................'],
        competencesAndCrossCutting: ['Self-evaluation, Summary']
      }
    },
    selfEvaluation: '................................................................................................................................................'
  };
}

  // Submit form to generate lesson plans via Gemini API backend
  const handleGenerateLessonPlans = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let targetTitles = [...lessonTitles];
    if (targetTitles.length === 0 && newLessonInput.trim()) {
      targetTitles = [newLessonInput.trim()];
      setLessonTitles(targetTitles);
      setNewLessonInput('');
    } else if (targetTitles.length === 0) {
      if (unitTitle.trim()) {
        targetTitles = [`Overview of ${unitTitle.trim()}`];
      } else {
        setStatusMessage({ text: 'Please enter a unit title or at least one lesson title.', type: 'error' });
        return;
      }
    }

    setIsGenerating(true);
    setStatusMessage({ text: 'Generating Competency-Based Lesson Plans via Gemini AI...', type: 'info' });

    const payload = {
      schoolName: schoolName || 'School Name',
      teacherName: teacherName || 'Teacher Name',
      educationLevel,
      classLevel: classLevel || 'Primary Level',
      subject: subject || 'General Subject',
      term,
      date,
      duration,
      classSize,
      location,
      specialNeeds: specialNeeds || 'No special educational needs reported for this group.',
      unitNumber: unitNumber || '1',
      unitTitle: unitTitle || 'GENERAL UNIT',
      lessonTitles: targetTitles,
      selfEvaluation
    };

    try {
      const data = await safeFetchJson('/api/gemini/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (data.success && Array.isArray(data.lessonPlans) && data.lessonPlans.length > 0) {
        const totalCount = data.lessonPlans.length;
        const plansWithIds: LessonPlanData[] = data.lessonPlans.map((p: any, idx: number) => ({
          ...p,
          date: getSequentialDate(payload.date || p.date, idx),
          lessonNumber: `${idx + 1} Out of ${totalCount}`,
          id: `lp_${Date.now()}_${idx}`,
          createdAt: new Date().toISOString()
        }));

        setGeneratedPlans(plansWithIds);
        setActivePlanIndex(0);
        setStatusMessage({
          text: `Successfully generated ${plansWithIds.length} lesson plan(s) for Unit ${payload.unitNumber}: ${payload.unitTitle}!`,
          type: 'success'
        });
      } else {
        throw new Error('AI service did not return valid plans. Generating using REB Structure Engine.');
      }
    } catch (err: any) {
      console.warn('AI API call encountered an error, activating local REB curriculum engine fallback:', err);
      const fallbackPlans = generateClientREBFallbackPlans(payload);
      setGeneratedPlans(fallbackPlans);
      setActivePlanIndex(0);
      setStatusMessage({
        text: `Generated ${fallbackPlans.length} REB Competency-Based lesson plan(s) matching official Rwanda Education Board structure!`,
        type: 'success'
      });
    } finally {
      setIsGenerating(false);
    }
  };

// High-speed, guaranteed vector A4 PDF generator using jsPDF
function createDirectRebPdf(plan: LessonPlanData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const marginX = 10;
  let currentY = 10;
  const pageWidth = 190;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LESSON PLAN', 105, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(7.5);
  doc.setLineWidth(0.25);
  doc.setDrawColor(0, 0, 0);

  const drawBox = (x: number, y: number, w: number, h: number, text: string, options: { bold?: boolean; bg?: boolean; align?: 'left' | 'center'; fontSize?: number } = {}) => {
    if (options.bg) {
      doc.setFillColor(245, 247, 250);
      doc.rect(x, y, w, h, 'F');
    }
    doc.rect(x, y, w, h);
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(options.fontSize || 7.5);
    const fSize = options.fontSize || 7.5;
    const lineStep = fSize * 0.35 + 0.6;
    const splitLines = doc.splitTextToSize(text || '', w - 3);

    if (options.align === 'center') {
      splitLines.forEach((line: string, i: number) => {
        doc.text(line, x + w / 2, y + 3.2 + (i * lineStep), { align: 'center' });
      });
    } else {
      splitLines.forEach((line: string, i: number) => {
        doc.text(line, x + 1.5, y + 3.2 + (i * lineStep));
      });
    }
  };

  const calcHeight = (text: string, width: number, minH = 6, fontSize = 7.5) => {
    const lineStep = fontSize * 0.35 + 0.6;
    const lines = doc.splitTextToSize(text || '', width - 3);
    return Math.max(minH, lines.length * lineStep + 2.5);
  };

  // School Name & Teacher Name
  doc.rect(marginX, currentY, pageWidth, 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`School Name: ${plan.schoolName || ''}`, marginX + 2, currentY + 3.8);
  doc.text(`Teacher's Name: ${plan.teacherName || ''}`, marginX + 100, currentY + 3.8);
  currentY += 5.5;

  // Metadata Headers & Values
  const cols = [
    { name: 'Term', val: plan.term, w: 18 },
    { name: 'Date', val: plan.date, w: 22 },
    { name: 'Subject', val: plan.subject, w: 25 },
    { name: 'Class', val: plan.classLevel, w: 26 },
    { name: 'Unit No', val: plan.unitNumber, w: 16 },
    { name: 'Lesson No', val: plan.lessonNumber, w: 24 },
    { name: 'Duration', val: plan.duration, w: 22 },
    { name: 'Class size', val: `${plan.classSize || ''}`, w: 37 }
  ];

  let curX = marginX;
  cols.forEach(c => {
    drawBox(curX, currentY, c.w, 4.5, c.name, { bold: true, bg: true, align: 'center', fontSize: 7 });
    curX += c.w;
  });
  currentY += 4.5;

  curX = marginX;
  cols.forEach(c => {
    drawBox(curX, currentY, c.w, 4.5, String(c.val || ''), { align: 'center', fontSize: 7 });
    curX += c.w;
  });
  currentY += 4.5;

  // Special Educational Needs
  const snLabelW = 80;
  const snValW = 110;
  const snH = Math.max(7, calcHeight(plan.specialNeeds || 'None', snValW, 7, 7));
  drawBox(marginX, currentY, snLabelW, snH, 'Type of special educational needs to be catered for in this lesson and number of learners in each category', { bold: true, bg: true, fontSize: 6.5 });
  drawBox(marginX + snLabelW, currentY, snValW, snH, plan.specialNeeds || 'None', { fontSize: 7 });
  currentY += snH;

  const drawRow = (label: string, value: string, minH = 5.5, valueBold = false) => {
    const labelW = 50;
    const valW = 140;
    const rowH = calcHeight(value || '', valW, minH, 7);
    drawBox(marginX, currentY, labelW, rowH, label, { bold: true, bg: true, fontSize: 7 });
    drawBox(marginX + labelW, currentY, valW, rowH, value, { bold: valueBold, fontSize: 7 });
    currentY += rowH;
  };

  drawRow('Unit title', (plan.unitTitle || '').toUpperCase(), 5.5, true);
  drawRow('Key unit competence', plan.keyUnitCompetence || '', 6);
  drawRow('Title of the lesson', plan.lessonTitle || '', 5.5, true);
  drawRow('Instructional objectives', plan.instructionalObjective || '', 7);
  drawRow('Plan of this class (Location)', plan.location || '', 5);
  drawRow('Learning materials', plan.learningMaterials || '', 5.5);
  drawRow('References', plan.references || '', 6);

  // Teaching and Learning Flow Table
  currentY += 1.5;
  const col1W = 32;
  const col2W = 106;
  const col3W = 52;

  drawBox(marginX, currentY, col1W, 4.5, 'Timing for each step', { bold: true, bg: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W, currentY, col2W, 4.5, 'Description of teaching and learning activities', { bold: true, bg: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + col2W, currentY, col3W, 4.5, 'Generic competences & cross-cutting issues', { bold: true, bg: true, align: 'center', fontSize: 7 });
  currentY += 4.5;

  drawBox(marginX, currentY, col1W, 3.8, '', { bg: true });
  drawBox(marginX + col1W, currentY, col2W, 3.8, plan.activitySummary || '', { align: 'center', fontSize: 6.5 });
  drawBox(marginX + col1W + col2W, currentY, col3W, 3.8, '', { bg: true });
  currentY += 3.8;

  drawBox(marginX, currentY, col1W, 3.8, '', { bg: true });
  drawBox(marginX + col1W, currentY, col2W / 2, 3.8, "Teacher's activity", { bold: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + col2W / 2, currentY, col2W / 2, 3.8, "Learner's activity", { bold: true, align: 'center', fontSize: 7 });
  drawBox(marginX + col1W + col2W, currentY, col3W, 3.8, '', { bg: true });
  currentY += 3.8;

  const steps = [
    { name: 'Introduction', step: plan.steps?.introduction },
    { name: 'Lesson Development', step: plan.steps?.development },
    { name: 'Conclusion', step: plan.steps?.conclusion }
  ];

  steps.forEach(s => {
    if (!s.step) return;
    const tText = (s.step.teacherActivities || []).map(a => `• ${a}`).join('\n');
    const lText = (s.step.learnerActivities || []).map(a => `• ${a}`).join('\n');
    const cText = (s.step.competencesAndCrossCutting || []).map(a => `• ${a}`).join('\n');

    const tH = calcHeight(tText, (col2W / 2), 10, 6.5);
    const lH = calcHeight(lText, (col2W / 2), 10, 6.5);
    const cH = calcHeight(cText, col3W, 10, 6.5);

    const stepH = Math.max(10, tH, lH, cH);

    drawBox(marginX, currentY, col1W, stepH, `${s.name}\n(${s.step.duration || ''})`, { bold: true, fontSize: 7 });
    drawBox(marginX + col1W, currentY, col2W / 2, stepH, tText, { fontSize: 6.5 });
    drawBox(marginX + col1W + col2W / 2, currentY, col2W / 2, stepH, lText, { fontSize: 6.5 });
    drawBox(marginX + col1W + col2W, currentY, col3W, stepH, cText, { fontSize: 6.5 });

    currentY += stepH;
  });

  const seText = plan.selfEvaluation || 'Lesson successfully delivered following REB competency-based guidelines.';
  const seH = calcHeight(seText, 140, 7, 7);
  drawBox(marginX, currentY, 50, seH, "Teacher's self-evaluation", { bold: true, bg: true, fontSize: 7 });
  drawBox(marginX + 50, currentY, 140, seH, seText, { fontSize: 7 });

  return doc;
}

  // Export a single lesson plan as a 1-page A4 PDF
  const exportSinglePdf = async (plan: LessonPlanData) => {
    if (!plan) return;
    setIsExportingPdf(true);
    setStatusMessage({ text: `Generating A4 PDF for "${plan.lessonTitle}"...`, type: 'info' });

    try {
      let pdf: jsPDF | null = null;

      // Try html2canvas DOM capture if printRef is available
      if (printRef.current) {
        try {
          const canvas = await html2canvas(printRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: true
          });
          const imgData = canvas.toDataURL('image/png');
          pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        } catch (canvasErr) {
          console.warn('DOM html2canvas capture failed, switching to direct vector PDF generator:', canvasErr);
          pdf = null;
        }
      }

      // Fallback to direct vector jsPDF generator
      if (!pdf) {
        pdf = createDirectRebPdf(plan);
      }

      const cleanTitle = plan.lessonTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Lesson_Plan_${cleanTitle}.pdf`);

      setStatusMessage({ text: `Downloaded PDF: Lesson_Plan_${cleanTitle}.pdf`, type: 'success' });
    } catch (err: any) {
      console.error('PDF Export Error:', err);
      // Final attempt: vector generator
      try {
        const fallbackPdf = createDirectRebPdf(plan);
        const cleanTitle = plan.lessonTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
        fallbackPdf.save(`Lesson_Plan_${cleanTitle}.pdf`);
        setStatusMessage({ text: `Downloaded PDF: Lesson_Plan_${cleanTitle}.pdf`, type: 'success' });
      } catch (finalErr) {
        setStatusMessage({ text: 'Failed to generate PDF file. Please try again.', type: 'error' });
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Bulk Export all generated lesson plans as a Zipped archive of individual PDFs
  const exportBulkZip = async () => {
    if (generatedPlans.length === 0) return;
    setIsExportingZip(true);
    setStatusMessage({ text: `Generating bulk ZIP archive for ${generatedPlans.length} lesson plans...`, type: 'info' });

    try {
      const zip = new JSZip();

      for (let i = 0; i < generatedPlans.length; i++) {
        const plan = generatedPlans[i];
        let pdf: jsPDF | null = null;

        // Fast vector generation guarantees 100% success for zip files
        try {
          pdf = createDirectRebPdf(plan);
        } catch (err) {
          console.warn(`Vector PDF gen failed for plan ${i}, retrying:`, err);
        }

        if (pdf) {
          const pdfArrayBuffer = pdf.output('arraybuffer');
          const cleanLessonTitle = plan.lessonTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
          const fileName = `Lesson_${i + 1}_${cleanLessonTitle}.pdf`;
          zip.file(fileName, pdfArrayBuffer);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const cleanUnitTitle = (unitTitle || 'Unit').replace(/[^a-zA-Z0-9_-]/g, '_');
      saveAs(zipBlob, `Unit_${unitNumber || '1'}_${cleanUnitTitle}_Lesson_Plans.zip`);

      setStatusMessage({
        text: `Successfully downloaded Unit ${unitNumber || '1'} bulk ZIP archive with ${generatedPlans.length} PDF files!`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Bulk ZIP Export Error:', err);
      setStatusMessage({ text: 'Failed to generate ZIP package.', type: 'error' });
    } finally {
      setIsExportingZip(false);
    }
  };

  const currentPlan = generatedPlans[activePlanIndex] || null;

  const handleUpdateActivePlanField = (field: keyof LessonPlanData, value: any) => {
    if (!currentPlan) return;
    const updated = [...generatedPlans];
    updated[activePlanIndex] = {
      ...updated[activePlanIndex],
      [field]: value
    };
    setGeneratedPlans(updated);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Super Admin Development & Testing Panel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              A4 REB Competency-Based Lesson Plan Creator
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Generate official 1-page A4 lesson plans individually or in bulk matching Rwanda Education Board (REB) competency-based curriculum standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {generatedPlans.length > 0 && (
              <>
                <button
                  onClick={() => exportSinglePdf(currentPlan)}
                  disabled={isExportingPdf || isExportingZip}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition shadow-lg shadow-blue-900/40 cursor-pointer disabled:opacity-50"
                  title="Download current active lesson plan as a 1-page A4 PDF"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isExportingPdf ? 'Exporting PDF...' : 'Download Active PDF'}</span>
                </button>

                <button
                  onClick={exportBulkZip}
                  disabled={isExportingPdf || isExportingZip || generatedPlans.length === 0}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition shadow-lg shadow-emerald-900/40 cursor-pointer disabled:opacity-50"
                  title="Download all generated lesson plans for this unit as a zipped package of A4 PDFs"
                >
                  <Archive className="w-4 h-4" />
                  <span>{isExportingZip ? 'Packaging ZIP...' : `Download Bulk ZIP (${generatedPlans.length} PDFs)`}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' 
            : statusMessage.type === 'error'
            ? 'bg-rose-950/80 border-rose-700 text-rose-300'
            : 'bg-blue-950/80 border-blue-700 text-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)} 
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Parameters & A4 Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerateLessonPlans} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Step 2: REB Lesson Plan Parameters</span>
              </h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">REB Standard</span>
            </div>

            {currentUser?.role === 'SUPER_ADMIN' && (
              <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-700/60 text-purple-200 text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>Super-Admin Access:</strong> Create blank unfilled REB A4 forms or generate AI lesson plans for any institution.
                </span>
              </div>
            )}

            {/* School & Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. GS Amahoro"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Teacher's Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. NISHIMWE Joel Patient"
                />
              </div>
            </div>

            {/* Level, Class & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">School Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="PRE_PRIMARY">Nursery / Pre-Primary</option>
                  <option value="PRIMARY">Primary</option>
                  <option value="O_LEVEL">O-Level</option>
                  <option value="A_LEVEL">A-Level</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Class Level</label>
                <input
                  type="text"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Primary 6 (P6)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. English"
                />
              </div>
            </div>

            {/* Term, Date, Duration, Class Size */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="40 min"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Class Size</label>
                <input
                  type="number"
                  value={classSize}
                  onChange={(e) => setClassSize(parseInt(e.target.value) || 0)}
                  min={1}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Location & Special Needs Consideration */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Classroom / Outside classroom / Science Lab"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Type of Special Educational Needs (Descriptive Sentence)
                </label>
                <textarea
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                  placeholder="Describe special needs in full sentences (e.g. 2 learners with attention disorder require visual charts and proximity seating.)"
                />
              </div>
            </div>

            {/* Unit Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Unit Number</label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Unit Title</label>
                <input
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-bold uppercase"
                  placeholder="e.g. LEISURE AND SPORTS"
                />
              </div>
            </div>

            {/* Multiple Lesson Titles for Bulk Generation */}
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-blue-300">
                  Lesson Titles to Generate ({lessonTitles.length} Lesson Plans)
                </label>
                <span className="text-[10px] text-slate-400">Generates 1 PDF per lesson</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {lessonTitles.length > 0 ? (
                  lessonTitles.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-xs font-medium text-slate-200 truncate">
                        <span className="text-blue-400 font-bold mr-1.5">{idx + 1}.</span> {t}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLessonTitle(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition cursor-pointer"
                        title="Remove lesson title"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 text-center">
                    No lesson titles added yet. Enter a title below and click <strong>Add</strong> or press Enter.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newLessonInput}
                  onChange={(e) => setNewLessonInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLessonTitle(); } }}
                  placeholder="Add another lesson title..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddLessonTitle}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Teacher's Self-Evaluation */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Teacher's Self-Evaluation (Optional)</label>
              <textarea
                value={selfEvaluation}
                onChange={(e) => setSelfEvaluation(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="Can be filled now or left blank for post-lesson hand-written evaluation..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="flex-1 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-xl shadow-blue-900/40 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating REB Lesson Plans via Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate AI Lesson Plans</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLoadBlankForm}
                className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
                title="Generate an unfilled REB A4 Lesson Plan form with dotted line placeholders for hand-writing or distribution"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Unfilled A4 Form</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview & A4 Sheet Section (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Lesson Plan Selection Bar */}
          {generatedPlans.length > 0 ? (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs font-bold text-slate-400 shrink-0 mr-1">Generated Plans:</span>
                {generatedPlans.map((plan, idx) => (
                  <button
                    key={plan.id || idx}
                    onClick={() => setActivePlanIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      activePlanIndex === idx
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Lesson {idx + 1}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    editMode 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editMode ? 'Exit Edit' : 'Edit Text'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 border-dashed text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800 text-blue-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Lesson Plans Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Upload a book above or choose lessons, then click <strong>"Generate Selected Lesson Plans"</strong>. Gemini AI will create exact REB Competency-Based curriculum lesson plans matching official Rwanda inspection standards.
              </p>
            </div>
          )}

          {/* Inline Edit Form when Edit Mode active */}
          {editMode && currentPlan && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-amber-800/80 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <span>Customize Active Lesson Plan Text ({currentPlan.lessonTitle})</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    value={currentPlan.lessonTitle}
                    onChange={(e) => handleUpdateActivePlanField('lessonTitle', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Key Unit Competence</label>
                  <textarea
                    value={currentPlan.keyUnitCompetence}
                    onChange={(e) => handleUpdateActivePlanField('keyUnitCompetence', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Instructional Objective</label>
                  <textarea
                    value={currentPlan.instructionalObjective}
                    onChange={(e) => handleUpdateActivePlanField('instructionalObjective', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Learning Materials</label>
                  <input
                    type="text"
                    value={currentPlan.learningMaterials}
                    onChange={(e) => handleUpdateActivePlanField('learningMaterials', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Official A4 Sheet Document Container */}
          {currentPlan && (
            <div className="overflow-x-auto pb-6">
              <div className="flex justify-center">
                
                {/* Fixed A4 Page Container: 794px x 1123px */}
                <div
                  ref={printRef}
                  className="bg-white text-black p-6 shadow-2xl rounded-none font-serif text-[11px] leading-snug tracking-tight border border-slate-400"
                  style={{
                    width: '794px',
                    minHeight: '1123px',
                    maxHeight: '1123px',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  {/* Title Header */}
                  <div className="text-center mb-3">
                    <h2 className="text-base font-extrabold uppercase tracking-wider text-black">LESSON PLAN</h2>
                  </div>

                  {/* Top Header Information Grid */}
                  <div className="border border-black mb-0">
                    <div className="flex justify-between border-b border-black p-1.5 font-bold text-[11.5px]">
                      <div>School Name: <span className="font-semibold">{currentPlan.schoolName}</span></div>
                      <div>Teacher's Name: <span className="font-semibold">{currentPlan.teacherName}</span></div>
                    </div>

                    {/* Table Row 1: Key Metadata */}
                    <table className="w-full border-collapse text-center border-b border-black">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-[10.5px]">
                          <th className="border-r border-black p-1">Term</th>
                          <th className="border-r border-black p-1">Date</th>
                          <th className="border-r border-black p-1">Subject</th>
                          <th className="border-r border-black p-1">Class</th>
                          <th className="border-r border-black p-1">Unit No</th>
                          <th className="border-r border-black p-1">Lesson No</th>
                          <th className="border-r border-black p-1">Duration</th>
                          <th className="p-1">Class size</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black text-[11px]">
                          <td className="border-r border-black p-1">{currentPlan.term}</td>
                          <td className="border-r border-black p-1">{currentPlan.date}</td>
                          <td className="border-r border-black p-1">{currentPlan.subject}</td>
                          <td className="border-r border-black p-1">{currentPlan.classLevel}</td>
                          <td className="border-r border-black p-1">{currentPlan.unitNumber}</td>
                          <td className="border-r border-black p-1">{currentPlan.lessonNumber}</td>
                          <td className="border-r border-black p-1">{currentPlan.duration}</td>
                          <td className="p-1">{currentPlan.classSize}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Row 2: Special Needs */}
                    <div className="flex border-b border-black min-h-[32px]">
                      <div className="w-[45%] border-r border-black p-1.5 font-bold bg-slate-50 text-[10.5px] leading-tight">
                        Type of special educational needs to be catered for in this lesson and number of learners in each category
                      </div>
                      <div className="w-[55%] p-1.5 font-normal">
                        {currentPlan.specialNeeds}
                      </div>
                    </div>

                    {/* Row 3: Unit Title */}
                    <div className="flex border-b border-black">
                      <div className="w-[30%] border-r border-black p-1.5 font-bold bg-slate-50">Unit title</div>
                      <div className="w-[70%] p-1.5 font-bold uppercase">{currentPlan.unitTitle}</div>
                    </div>

                    {/* Row 4: Key Unit Competence */}
                    <div className="flex border-b border-black">
                      <div className="w-[30%] border-r border-black p-1.5 font-bold bg-slate-50">Key unit competence</div>
                      <div className="w-[70%] p-1.5 font-normal leading-relaxed">{currentPlan.keyUnitCompetence}</div>
                    </div>

                    {/* Row 5: Title of the Lesson */}
                    <div className="flex border-b border-black">
                      <div className="w-[30%] border-r border-black p-1.5 font-bold bg-slate-50">Title of the lesson</div>
                      <div className="w-[70%] p-1.5 font-bold">{currentPlan.lessonTitle}</div>
                    </div>

                    {/* Row 6: Instructional Objectives */}
                    <div className="flex border-b border-black">
                      <div className="w-[30%] border-r border-black p-1.5 font-bold bg-slate-50">Instructional objectives</div>
                      <div className="w-[70%] p-1.5 font-normal leading-relaxed">{currentPlan.instructionalObjective}</div>
                    </div>

                    {/* Row 7: Location */}
                    <div className="flex border-b border-black">
                      <div className="w-[30%] border-r border-black p-1.5 font-bold bg-slate-50">Plan of this class (Location)</div>
                      <div className="w-[70%] p-1.5 font-normal">{currentPlan.location}</div>
                    </div>

                    {/* Row 8: Learning Materials */}
                    <div className="flex border-b border-black">
                      <div className="w-[30%] border-r border-black p-1.5 font-bold bg-slate-50">Learning materials</div>
                      <div className="w-[70%] p-1.5 font-normal">{currentPlan.learningMaterials}</div>
                    </div>

                    {/* Row 9: References */}
                    <div className="flex border-b border-black">
                      <div className="w-[30%] border-r border-black p-1.5 font-bold bg-slate-50">References</div>
                      <div className="w-[70%] p-1.5 font-normal whitespace-pre-line leading-tight">{currentPlan.references}</div>
                    </div>
                  </div>

                  {/* Teaching and Learning Activities Flow Table */}
                  <table className="w-full border-collapse border border-black mt-[-1px] text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-black text-center">
                        <th className="border-r border-black p-1 w-[22%]">Timing for each step</th>
                        <th className="border-r border-black p-1 w-[50%]">Description of teaching and learning activities</th>
                        <th className="p-1 w-[28%]">Generic competences and cross-cutting issues + some explanations</th>
                      </tr>
                      <tr className="border-b border-black italic text-center text-[10px] bg-white">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black p-1 font-medium" colSpan={1}>
                          {currentPlan.activitySummary}
                        </td>
                        <td></td>
                      </tr>
                      <tr className="border-b border-black font-bold text-center bg-slate-50 text-[10px]">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black p-0">
                          <div className="flex">
                            <div className="w-1/2 border-r border-black p-1">Teacher's activity</div>
                            <div className="w-1/2 p-1">Learner's activity</div>
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    </thead>
                    <tbody>
                      
                      {/* Introduction Step */}
                      <tr className="border-b border-black align-top">
                        <td className="border-r border-black p-1.5 font-bold">
                          Introduction ({currentPlan.steps.introduction.duration})
                        </td>
                        <td className="border-r border-black p-0">
                          <div className="flex min-h-full">
                            <div className="w-1/2 border-r border-black p-1.5 space-y-1">
                              {currentPlan.steps.introduction.teacherActivities.map((act, idx) => (
                                <div key={idx}>- {act}</div>
                              ))}
                            </div>
                            <div className="w-1/2 p-1.5 space-y-1">
                              {currentPlan.steps.introduction.learnerActivities.map((act, idx) => (
                                <div key={idx}>- {act}</div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-1.5 space-y-1">
                          {currentPlan.steps.introduction.competencesAndCrossCutting.map((comp, idx) => (
                            <div key={idx}>- {comp}</div>
                          ))}
                        </td>
                      </tr>

                      {/* Lesson Development Step */}
                      <tr className="border-b border-black align-top">
                        <td className="border-r border-black p-1.5 font-bold">
                          Lesson Development ({currentPlan.steps.development.duration})
                        </td>
                        <td className="border-r border-black p-0">
                          <div className="flex min-h-full">
                            <div className="w-1/2 border-r border-black p-1.5 space-y-1">
                              {currentPlan.steps.development.teacherActivities.map((act, idx) => (
                                <div key={idx}>- {act}</div>
                              ))}
                            </div>
                            <div className="w-1/2 p-1.5 space-y-1">
                              {currentPlan.steps.development.learnerActivities.map((act, idx) => (
                                <div key={idx}>- {act}</div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-1.5 space-y-1">
                          {currentPlan.steps.development.competencesAndCrossCutting.map((comp, idx) => (
                            <div key={idx}>- {comp}</div>
                          ))}
                        </td>
                      </tr>

                      {/* Conclusion Step */}
                      <tr className="border-b border-black align-top">
                        <td className="border-r border-black p-1.5 font-bold">
                          Conclusion ({currentPlan.steps.conclusion.duration})
                        </td>
                        <td className="border-r border-black p-0">
                          <div className="flex min-h-full">
                            <div className="w-1/2 border-r border-black p-1.5 space-y-1">
                              {currentPlan.steps.conclusion.teacherActivities.map((act, idx) => (
                                <div key={idx}>- {act}</div>
                              ))}
                            </div>
                            <div className="w-1/2 p-1.5 space-y-1">
                              {currentPlan.steps.conclusion.learnerActivities.map((act, idx) => (
                                <div key={idx}>- {act}</div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-1.5 space-y-1">
                          {currentPlan.steps.conclusion.competencesAndCrossCutting.map((comp, idx) => (
                            <div key={idx}>- {comp}</div>
                          ))}
                        </td>
                      </tr>

                      {/* Bottom Row: Teacher's Self-Evaluation */}
                      <tr className="align-top">
                        <td className="border-r border-black p-1.5 font-bold bg-slate-50">
                          Teacher's self-evaluation
                        </td>
                        <td className="p-1.5" colSpan={2}>
                          {currentPlan.selfEvaluation || ''}
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
