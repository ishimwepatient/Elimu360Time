import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// Global in-memory storage for uploaded assets if ImageKit API is offline/not configured
const assetStorage = new Map<string, { buffer: Buffer; contentType: string; name: string }>();

function imagekitPlugin(): Plugin {
  return {
    name: 'imagekit-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // GET /api/assets/serve/:id (Serve stored assets with proper binary content-type)
        if (req.url?.startsWith('/api/assets/serve/') && req.method === 'GET') {
          const rawId = req.url.replace('/api/assets/serve/', '').split('?')[0];
          const asset = assetStorage.get(rawId);
          if (asset) {
            res.setHeader('Content-Type', asset.contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.statusCode = 200;
            res.end(asset.buffer);
            return;
          }
          // If asset is not found, return a transparent 1x1 png or 404
          res.setHeader('Content-Type', 'image/svg+xml');
          res.statusCode = 200;
          res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1e293b"/><text x="50%" y="50%" font-size="10" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">Asset Preview</text></svg>`);
          return;
        }

        // POST /api/imagekit/upload
        if (req.url?.startsWith('/api/imagekit/upload') && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8');
              const { file, fileName, folder, tags } = JSON.parse(rawBody);

              const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.VITE_IMAGEKIT_PRIVATE_KEY;
              const cleanFolder = folder || '/elimu360/official_assets';
              const cleanFileName = fileName || `asset_${Date.now()}.png`;

              // 1. Try real ImageKit API upload if private key is supplied
              if (privateKey && !privateKey.includes('your_private_key') && privateKey.trim().length > 5) {
                try {
                  const formData = new FormData();
                  const base64Data = file.startsWith('data:') ? file.split(',')[1] : file;
                  formData.append('file', base64Data);
                  formData.append('fileName', cleanFileName);
                  formData.append('folder', cleanFolder);
                  if (tags && Array.isArray(tags)) {
                    formData.append('tags', tags.join(','));
                  }
                  formData.append('useUniqueFileName', 'true');

                  const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                    method: 'POST',
                    headers: {
                      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`
                    },
                    body: formData
                  });

                  if (ikRes.ok) {
                    const ikData = await ikRes.json();
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      success: true,
                      url: ikData.url,
                      fileId: ikData.fileId,
                      name: ikData.name,
                      sizeBytes: ikData.size,
                      thumbnailUrl: ikData.thumbnailUrl,
                      provider: 'imagekit'
                    }));
                    return;
                  } else {
                    const errText = await ikRes.text();
                    console.warn('ImageKit API returned non-200, falling back to local asset serving:', errText);
                  }
                } catch (ikErr) {
                  console.warn('ImageKit direct upload fetch failed, falling back:', ikErr);
                }
              }

              // 2. Local Asset Storage Fallback (stores binary buffer and serves at /api/assets/serve/:assetId)
              let buffer: Buffer;
              let contentType = 'image/png';
              if (file.startsWith('data:')) {
                const matches = file.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                  contentType = matches[1];
                  buffer = Buffer.from(matches[2], 'base64');
                } else {
                  buffer = Buffer.from(file.split(',')[1] || file, 'base64');
                }
              } else {
                buffer = Buffer.from(file, 'base64');
              }

              const assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
              assetStorage.set(assetId, {
                buffer,
                contentType,
                name: cleanFileName
              });

              // Return a working, previewable URL
              const serveUrl = `/api/assets/serve/${assetId}`;
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                url: serveUrl,
                name: cleanFileName,
                sizeBytes: buffer.length,
                provider: 'local_compressed'
              }));
            } catch (err: any) {
              console.error('ImageKit upload error:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Upload processing failed' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

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

function generateFallbackREBLessonPlans(payload: any) {
  const titles = (payload.lessonTitles && payload.lessonTitles.length > 0)
    ? payload.lessonTitles
    : [payload.lessonTitle || 'Introduction to Subject Topic'];
  const total = titles.length;

  // Rich pedagogical pools to make each lesson plan differ significantly
  const introTeacherProfiles = [
    (title: string, unit: string) => [
      `Greets the learners with warmth, conducts a rapid visual roll-call, and establishes a supportive classroom environment.`,
      `Displays a large, locally crafted wall chart and authentic concrete objects illustrating key concepts of "${title}" in Unit ${unit}.`,
      `Asks probing diagnostic questions (e.g. "How does ${title.toLowerCase()} relate to our daily domestic routines?") to reactivate prior knowledge.`,
      `Inscribes the lesson title "${title}" and articulates achievable performance goals on the chalkboard.`
    ],
    (title: string, unit: string) => [
      `Welcomes the pupils with high energy and conducts a 2-minute concentration energizer to prime active listening.`,
      `Presents a brief real-world Rwandan case narrative highlighting practical applications of "${title}".`,
      `Leads a 3-minute Think-Pair-Share brainstorm, prompting learners to identify connections with previous unit topics.`,
      `Writes the lesson title "${title}" and explains expected competency indicators clearly on the board.`
    ],
    (title: string, unit: string) => [
      `Checks classroom arrangement, seating learners with special educational needs in optimal sight and sound range.`,
      `Distributes flashcards and illustrated textbook excerpts highlighting core terminology for "${title}".`,
      `Facilitates a brisk 3-question diagnostic review, seamlessly bridging prior learning to today's focus on "${title}".`,
      `Articulates the learning objectives, outlining group tasks and assessment criteria for the session.`
    ],
    (title: string, unit: string) => [
      `Greets the class and presents a thought-provoking paradox dilemma related to "${title}" on the chalkboard.`,
      `Invites a quick show of hands and records contrasting learner viewpoints to ignite intellectual curiosity.`,
      `Guides learners to establish baseline definitions using their personal daily life experiences in Rwanda.`,
      `Writes "${title}" prominently and outlines the collaborative scientific inquiry goals for the period.`
    ]
  ];

  const introLearnerProfiles = [
    (title: string) => [
      `Respond enthusiastically to the teacher's greeting and organize their exercise books and stationery neatly.`,
      `Examine the displayed wall chart and realia specimens attentively, noting distinctive structural patterns.`,
      `Raise hands eagerly to answer diagnostic review questions, providing clear, well-structured sentences.`,
      `Copy the lesson heading and instructional target accurately into their exercise books.`
    ],
    (title: string) => [
      `Participate actively in the energizer and settle down with focus and readiness for learning.`,
      `Listen carefully to the contextual narrative, identifying key community links to "${title.toLowerCase()}".`,
      `Engage in pair-share discussions for 3 minutes, taking down preliminary thoughts in notebooks.`,
      `Read the written lesson objectives aloud as a class, clarifying expectations with the teacher.`
    ],
    (title: string) => [
      `Assist peers with special needs in adjusting their desks and sharing textbook resources equitably.`,
      `Read terminology flashcards in pairs, pronouncing technical terms and noting spellings.`,
      `Recall prior concepts confidently and volunteer responses during the diagnostic check.`,
      `Acknowledge lesson goals and prepare group collaboration roles responsibly.`
    ],
    (title: string) => [
      `Reflect on the opening paradox question, formulating initial hypotheses with their desk partners.`,
      `Volunteer reasoned explanations defending their initial thoughts before the classroom.`,
      `Transcribe the lesson heading and inquiry questions into their study portfolios.`,
      `Organize task materials and verify safety protocols for group activities.`
    ]
  ];

  const devTeacherProfiles = [
    (title: string) => [
      `Conducts a step-by-step interactive exposition on "${title}", writing clear formulas, definitions, and schematics on the chalkboard.`,
      `Models the correct procedural technique using authentic classroom materials, walking through two demonstration problems.`,
      `Organizes learners into heterogeneous cooperative learning circles of 4-5 pupils, ensuring balanced gender leadership.`,
      `Distributes structured analytical task worksheets requiring learners to classify and solve practical exercises on "${title}".`,
      `Circulates proactively to facilitate peer coaching, providing scaffolding for struggling learners and extension tasks for fast finishers.`,
      `Invites group representatives to the chalkboard to demonstrate solutions and defend their methodology.`
    ],
    (title: string) => [
      `Introduces core principles of "${title}" through guided Socratic questioning, enabling learners to deduce rules independently.`,
      `Demonstrates analytical problem-solving algorithms on the board, systematically deconstructing complex elements.`,
      `Assigns distinct group roles (Group Leader, Timekeeper, Secretary, Presenter) to instill mutual accountability.`,
      `Provides real-world case study challenge cards demanding collaborative synthesis of "${title}" in local community contexts.`,
      `Monitors team progress attentively, offering targeted guidance prompts to stimulate higher-order critical thinking.`,
      `Coordinates peer-assessment where groups critique and validate each other's computational outputs constructively.`
    ],
    (title: string) => [
      `Presents a rich visual and textual demonstration of "${title}", highlighting common misconceptions and error-prevention steps.`,
      `Guides the whole class through a joint problem-solving exercise, asking strategic questions at each milestone.`,
      `Establishes differentiated learning stations across the room, pairing emerging learners with supportive peer mentors.`,
      `Provides hands-on tactile activity cards focused on empirical calculations and textual interpretation of "${title}".`,
      `Offers individual supportive coaching to learners with learning difficulties, using simplified visual gestures.`,
      `Facilitates a whole-class synthesis panel where station spokespersons showcase their discoveries.`
    ],
    (title: string) => [
      `Facilitates a hands-on kinesthetic simulation and modeling lab, demonstrating safety and precision techniques for "${title}".`,
      `Leads a timed station rotation exercise (Station A: Modeling, Station B: Testing, Station C: Comparative Evaluation).`,
      `Monitors station intervals with rhythmic cues, ensuring equitable time distribution across all tasks.`,
      `Challenges learners to connect mathematical calculations of "${title}" to sustainable resource management.`,
      `Assists introverted learners by offering gentle verbal prompts and encouraging peer support.`,
      `Moderates an interactive plenary showcase where teams display their completed models and findings.`
    ]
  ];

  const devLearnerProfiles = [
    (title: string) => [
      `Follow the teacher's exposition attentively, recording detailed notes, chalkboard schematics, and definitions.`,
      `Analyze modeled demonstrations systematically, asking clarifying questions to confirm conceptual mastery.`,
      `Work collaboratively within cooperative circles, respecting peers with special needs and sharing tasks equitably.`,
      `Execute assigned worksheet exercises, discussing problem-solving steps and verifying calculations collectively.`,
      `Engage in active peer tutoring, explaining difficult procedural steps to group mates patiently.`,
      `Present team results at the chalkboard with confidence, explaining reasoning clearly to the class.`
    ],
    (title: string) => [
      `Participate in guided inquiry, identifying underlying patterns and deducing core rules regarding "${title}".`,
      `Observe algorithmic demonstrations closely, taking neat notes and double-checking equations against peer slates.`,
      `Fulfill designated team responsibilities conscientiously (Secretary logging data, Presenter preparing speech).`,
      `Analyze case study cards collaboratively, applying syllabus principles to solve community-based scenarios.`,
      `Seek feedback proactively from the teacher, refining their calculations and logical deductions.`,
      `Participate in peer evaluation respectfully, offering constructive feedback based on scoring rubrics.`
    ],
    (title: string) => [
      `Examine visual diagrams and textual examples, noting common pitfalls to avoid during practical execution.`,
      `Contribute solutions during the joint problem-solving session, volunteering intermediate answers.`,
      `Rotate through learning stations cooperatively, supporting peers and working through activity cards.`,
      `Complete practice problems diligently, applying core principles to diverse contextual scenarios.`,
      `Learners requiring extra support engage directly with modified visual aids and peer assistance.`,
      `Share station summaries during the plenary panel, explaining key insights and answering peer questions.`
    ],
    (title: string) => [
      `Construct physical models and execute simulations using supplied local materials with precision.`,
      `Record empirical data systematically in laboratory tables, checking measurements for accuracy.`,
      `Collaborate across rotation stations, ensuring every team member operates equipment equitably.`,
      `Analyze gathered data, comparing observed outcomes against theoretical textbook benchmarks.`,
      `Support peers with motor or visual challenges, fostering an encouraging and inclusive environment.`,
      `Showcase finished models during the plenary review, justifying technical choices to classmates.`
    ]
  ];

  const concTeacherProfiles = [
    (title: string) => [
      `Guides the class through a comprehensive 3-minute synthesis of the lesson, summarizing main takeaways on the chalkboard.`,
      `Administers a quick 2-question formative exit ticket to assess individual learning gains and verify objective mastery.`,
      `Provides constructive verbal appraisal, commending active participation, inclusive teamwork, and disciplined effort.`,
      `Assigns a clear, relevant homework exercise from the official REB Learner's Book to consolidate learning at home.`
    ],
    (title: string) => [
      `Leads a brisk, interactive Q&A review where learners summarize three essential principles mastered about "${title}".`,
      `Clarifies lingering questions and corrects misconceptions observed during group activities and board presentations.`,
      `Commends the class for effective collaboration, mutual respect, and disciplined time management.`,
      `Writes homework directions clearly on the chalkboard and instructs learners to complete it before the next session.`
    ],
    (title: string) => [
      `Summarizes how today's lesson on "${title}" directly reinforces the Key Unit Competence for the unit.`,
      `Conducts a self-reflection check encouraging learners to rate their confidence on a scale of 1 to 5.`,
      `Offers encouraging closing remarks, acknowledging individual perseverance and exceptional team achievements.`,
      `Assigns targeted review exercises and research questions for home practice, ensuring exercise books are packed neatly.`
    ],
    (title: string) => [
      `Facilitates a rapid 2-minute "One Sentence Summary" wrap-up where volunteer learners synthesize the main rule.`,
      `Provides individualized affirmative appraisal to learners who demonstrated notable progress during the lesson.`,
      `Directs a structured classroom cleanup, ensuring all learning materials and workstations are restored neatly.`,
      `Prescribes an applied home exercise challenging learners to demonstrate the concept to their family members.`
    ]
  ];

  const concLearnerProfiles = [
    (title: string) => [
      `Participate actively in the lesson synthesis, contributing key bullet points for the final chalkboard summary.`,
      `Complete the 2-question exit ticket individually on paper slips, demonstrating personal content mastery.`,
      `Receive teacher appraisal with enthusiasm, celebrating peer contributions and group success.`,
      `Copy the assigned homework accurately from the chalkboard into their exercise books for home practice.`
    ],
    (title: string) => [
      `State three major learning points about "${title}" aloud during the interactive review session.`,
      `Listen carefully to the teacher's clarification of misconceptions, making necessary corrections in their notes.`,
      `Acknowledge feedback on group performance and appreciate classmates for collaborative teamwork.`,
      `Record the homework assignment neatly and verify instructions with the teacher before leaving.`
    ],
    (title: string) => [
      `Reflect on how "${title}" links to broader unit goals, recognizing its practical importance in daily life.`,
      `Engage in self-reflection by indicating their confidence level and identifying areas where they need further practice.`,
      `Applaud individual and team milestones acknowledged by the teacher.`,
      `Copy review exercises into exercise books and organize their desks and learning materials before dismissal.`
    ],
    (title: string) => [
      `Share concise one-sentence summaries during the final wrap-up, capturing core principles in their own words.`,
      `Receive constructive teacher praise graciously and encourage classmates who showed notable improvement.`,
      `Participate in organizing and cleaning the classroom, restoring learning materials to designated storage.`,
      `Record homework tasks with care and pack study materials neatly in school bags.`
    ]
  ];

  const actionVerbSets = [
    'identify, describe, and illustrate',
    'analyze, calculate, and solve',
    'differentiate, compare, and explain',
    'demonstrate, construct, and evaluate',
    'synthesize, formulate, and defend'
  ];

  return titles.map((title: string, idx: number) => {
    const lessonDate = getSequentialDate(payload.date, idx);
    const lessonNumStr = `${idx + 1} Out of ${total}`;
    const pIdx = idx % introTeacherProfiles.length;
    const vIdx = idx % actionVerbSets.length;
    const actionVerbs = actionVerbSets[vIdx];

    return {
      schoolName: payload.schoolName || 'GS Amahoro Kigali',
      teacherName: payload.teacherName || 'Teacher',
      term: payload.term || 'Term 1',
      date: lessonDate,
      subject: payload.subject || 'Subject',
      classLevel: payload.classLevel || 'Primary 6 (P6)',
      unitNumber: payload.unitNumber || '1',
      lessonNumber: lessonNumStr,
      duration: payload.duration || '40 min',
      classSize: payload.classSize || 45,
      specialNeeds: payload.specialNeeds || '2 learners with mild hearing impairment seated near the chalkboard with visual gesture aids.',
      unitTitle: (payload.unitTitle || 'UNIT TITLE').toUpperCase(),
      keyUnitCompetence: `Learners will be able to demonstrate thorough mastery and practical application of ${payload.unitTitle || 'unit topic'} using core REB CBC language structures, analytical techniques, and collaborative problem-solving methods.`,
      lessonTitle: title,
      instructionalObjective: `By using locally made visual charts, textbook excerpts, real objects, and structured cooperative exercises, ${payload.classLevel || 'P6'} learners who attend will be able to ${actionVerbs} ${title.toLowerCase()} accurately at more than 7/10 within ${payload.duration || '40 minutes'}.`,
      location: payload.location || 'Classroom & Outdoor Learning Area',
      learningMaterials: 'Exercise books, wall charts, chalkboard, markers, real objects, flashcards, differentiated activity worksheets, and REB textbook excerpts',
      references: `Rwanda Education Board. (2025). ${payload.subject || 'Subject'} Learner's Book ${payload.classLevel || 'P6'}. Kigali: REB.\nRwanda Education Board. (2025). ${payload.subject || 'Subject'} Teacher's Guide ${payload.classLevel || 'P6'}. Kigali: REB.`,
      activitySummary: `Through guided inquiry, interactive group discussions, chalkboard modeling, and peer coaching, learners will systematically analyze ${title.toLowerCase()} and execute practical exercises.`,
      steps: {
        introduction: {
          duration: '7 min',
          teacherActivities: introTeacherProfiles[pIdx](title, payload.unitNumber || '1'),
          learnerActivities: introLearnerProfiles[pIdx](title),
          competencesAndCrossCutting: [
            'Critical Thinking: Reactivating prior knowledge to identify and analyze real-life visual prompts accurately.',
            'Effective Communication: Articulating initial thoughts and vocabulary in clear, full sentences.',
            'Inclusive Education: Arranging seating to ensure learners with special educational needs have full sight of chalkboard prompts.'
          ]
        },
        development: {
          duration: '25 min',
          teacherActivities: devTeacherProfiles[pIdx](title),
          learnerActivities: devLearnerProfiles[pIdx](title),
          competencesAndCrossCutting: [
            'Cooperation & Leadership: Working productively in diverse teams with assigned roles and shared accountability.',
            'Problem Solving & Innovation: Applying theoretical concepts of ' + title.toLowerCase() + ' to analyze and solve practical contextual scenarios.',
            'Gender Equity & Inclusion: Ensuring equal turn-taking, speaking opportunities, and leadership roles for female and male learners alike.',
            'Financial & Environmental Education: Connecting topic applications to sustainable resource management in local Rwandan communities.'
          ]
        },
        conclusion: {
          duration: '8 min',
          teacherActivities: concTeacherProfiles[pIdx](title),
          learnerActivities: concLearnerProfiles[pIdx](title),
          competencesAndCrossCutting: [
            'Lifelong Learning & Metacognition: Engaging in self-evaluation exit tickets to gauge personal mastery of the lesson objective.',
            'Peace & Values Education: Demonstrating mutual respect, active listening, and constructive feedback during peer presentations.'
          ]
        }
      },
      selfEvaluation: payload.selfEvaluation || 'Lesson successfully delivered following official REB competency-based curriculum guidelines using predefined describing action verbs. Instructional objectives met; learners actively engaged in cooperative group work and formative assessment.'
    };
  });
}

function cleanJsonResponse(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function geminiPlugin(): Plugin {
  return {
    name: 'gemini-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/gemini/extract-book-units') && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8');
              const payload = rawBody ? JSON.parse(rawBody) : {};

              const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

              if (apiKey && apiKey.trim().length > 5) {
                try {
                  const { GoogleGenAI, Type } = await import('@google/genai');
                  const ai = new GoogleGenAI({
                    apiKey: apiKey.trim(),
                    httpOptions: {
                      headers: {
                        'User-Agent': 'aistudio-build',
                      }
                    }
                  });

                  const fileData = payload.fileData; // base64 string
                  const mimeType = payload.mimeType || 'application/pdf';
                  const textContent = payload.textContent || '';
                  const fileName = payload.fileName || 'Uploaded Book';

                  let contentsArray: any[] = [];
                  if (fileData) {
                    contentsArray = [
                      {
                        inlineData: {
                          data: fileData,
                          mimeType: mimeType
                        }
                      },
                      `Extract all Units and Lesson Titles from this uploaded textbook/curriculum document ("${fileName}").
Analyze the table of contents or main body structure to identify:
1. Book Title
2. Subject
3. Target Class Level (e.g., Primary 6, P5, Senior 1, O-Level)
4. List of all Units with:
   - "unitNumber" (e.g. "1", "2")
   - "unitTitle" (e.g. "LEISURE AND SPORTS")
   - "keyUnitCompetence" (brief competence statement if present)
   - "lessonTitles": array of lesson titles under this unit

Return structured JSON.`
                    ];
                  } else {
                    contentsArray = [
                      `Extract all Units and Lesson Titles from the following textbook text/table of contents ("${fileName}"):
---
${textContent}
---

Identify:
1. Book Title
2. Subject
3. Target Class Level
4. List of all Units with unitNumber, unitTitle, keyUnitCompetence, and array of lessonTitles.

Return structured JSON.`
                    ];
                  }

                  const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: contentsArray,
                    config: {
                      systemInstruction: "You are an expert curriculum parser for the Rwanda Education Board (REB) Competency-Based Curriculum. Extract all units and lessons accurately from the provided textbook document or table of contents text.",
                      responseMimeType: "application/json",
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          bookTitle: { type: Type.STRING },
                          subject: { type: Type.STRING },
                          classLevel: { type: Type.STRING },
                          units: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                unitNumber: { type: Type.STRING },
                                unitTitle: { type: Type.STRING },
                                keyUnitCompetence: { type: Type.STRING },
                                lessonTitles: {
                                  type: Type.ARRAY,
                                  items: { type: Type.STRING }
                                }
                              },
                              required: ["unitNumber", "unitTitle", "lessonTitles"]
                            }
                          }
                        },
                        required: ["bookTitle", "subject", "classLevel", "units"]
                      }
                    }
                  });

                  const cleanedResponseText = cleanJsonResponse(response.text || '{}');
                  const parsed = JSON.parse(cleanedResponseText || '{}');
                  if (parsed && Array.isArray(parsed.units) && parsed.units.length > 0) {
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      success: true,
                      extractedData: parsed
                    }));
                    return;
                  }
                } catch (geminiErr: any) {
                  console.warn('Gemini Book Extraction warning:', geminiErr?.message || geminiErr);
                }
              }

              // Dynamic extraction fallback using uploaded text lines or filename
              const cleanFileName = (payload.fileName || 'Uploaded Textbook').replace(/\.[^/.]+$/, "");
              const lines = (payload.textContent || '').split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
              
              const extractedLessons: string[] = [];
              lines.forEach((line: string) => {
                if (line.length > 3 && line.length < 120 && !line.toLowerCase().startsWith('table of contents') && !line.toLowerCase().startsWith('unit')) {
                  extractedLessons.push(line);
                }
              });

              const fallbackUnits = [
                {
                  unitNumber: '1',
                  unitTitle: cleanFileName.toUpperCase(),
                  keyUnitCompetence: `Key competence derived from ${cleanFileName}`,
                  lessonTitles: extractedLessons.length > 0 ? extractedLessons.slice(0, 8) : [
                    `Introduction to ${cleanFileName}`,
                    `Core principles of ${cleanFileName}`,
                    `Practical applications and exercises`,
                    `Summary and assessment`
                  ]
                }
              ];

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                extractedData: {
                  bookTitle: cleanFileName,
                  subject: 'General Subject',
                  classLevel: 'Primary / Secondary',
                  units: fallbackUnits
                }
              }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Failed to extract book units' }));
            }
          });
          return;
        }

        if ((req.url?.includes('/api/gemini/lesson-plan') || req.originalUrl?.includes('/api/gemini/lesson-plan')) && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8');
              const payload = rawBody ? JSON.parse(rawBody) : {};

              const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

              if (apiKey && apiKey.trim().length > 5) {
                try {
                  const { GoogleGenAI, Type } = await import('@google/genai');
                  const ai = new GoogleGenAI({
                    apiKey: apiKey.trim(),
                    httpOptions: {
                      headers: {
                        'User-Agent': 'aistudio-build',
                      }
                    }
                  });

                  const totalLessons = (payload.lessonTitles && payload.lessonTitles.length > 0) ? payload.lessonTitles.length : 1;
                  const promptText = `Generate official REB Competency-Based Curriculum (CBC) Lesson Plans for Unit ${payload.unitNumber}: "${payload.unitTitle}".
School Name: ${payload.schoolName}
Teacher's Name: ${payload.teacherName}
Subject: ${payload.subject}
Class Level: ${payload.classLevel}
Term: ${payload.term}
Date: ${payload.date}
Duration: ${payload.duration || '40 min'}
Class Size: ${payload.classSize}
Location: ${payload.location || 'Classroom'}
Special Educational Needs: ${payload.specialNeeds}
Unit Title: ${payload.unitTitle}
Lesson Titles in this Unit:
${(payload.lessonTitles || ['Lesson 1']).map((title: string, idx: number) => `Lesson ${idx + 1} Out of ${totalLessons}: "${title}"`).join('\n')}

CRITICAL DIVERSITY & VOCABULARY REQUIREMENT (MAKE EACH LESSON PLAN COMPLETELY DIFFERENT):
- Do NOT repeat the same teacher phrases, learner responses, or action verbs across lessons!
- Utilize thousands of varied pedagogical action verbs and Bloom's Taxonomy descriptors across different levels:
  * Early/Foundational lessons: "Identify, observe, differentiate, categorize, define, illustrate, state, investigate, label, examine"
  * Intermediate/Analytical lessons: "Analyze, calculate, demonstrate, solve, compare, deconstruct, simulate, compute, manipulate"
  * Advanced/Synthesizing lessons: "Evaluate, construct, synthesize, design, formulate, appraise, validate, judge, devise"
- Vary the pedagogical methodologies across the lessons (e.g. Lesson 1: Realia & Visual Scavenger Hunt; Lesson 2: Think-Pair-Share & Algorithmic Problem-Solving; Lesson 3: Socratic Dialogue & Guided Debate; Lesson 4: Station Rotation & Hands-on Kinesthetic Lab; Lesson 5: Dramatic Simulation & Socio-Pedagogical Role-Play).
- Ensure rich, descriptive classroom interactions (each step should have 3-4 detailed, realistic bullet points detailing what the teacher says/models and what the learners do, write, and discuss).

Required Fields for each lesson:
1. "schoolName": "${payload.schoolName}"
2. "teacherName": "${payload.teacherName}"
3. "term": "${payload.term}"
4. "date": "${payload.date}"
5. "subject": "${payload.subject}"
6. "classLevel": "${payload.classLevel}"
7. "unitNumber": "${payload.unitNumber}"
8. "lessonNumber": e.g. "1 Out of ${totalLessons}"
9. "duration": "${payload.duration || '40 min'}"
10. "classSize": ${payload.classSize}
11. "specialNeeds": "${payload.specialNeeds}"
12. "unitTitle": "${payload.unitTitle}"
13. "keyUnitCompetence": Key competence sentence describing what pupils will be able to do in this unit using vocabulary/language structures.
14. "lessonTitle": The exact title of the lesson
15. "instructionalObjective": Format: "By using [learning materials], ${payload.classLevel} learners who attend will be able to [predefined REB describing action verbs + task] accurately at more than 7/10 within ${payload.duration || '40 minutes'}."
16. "location": "${payload.location || 'Classroom'}"
17. "learningMaterials": e.g. "exercise books, locally made charts, real objects, markers, flashcards"
18. "references": Official REB reference books (e.g., "Rwanda Education Board. (2025). ${payload.subject} Learner's Book ${payload.classLevel}. Kigali: REB.\nRwanda Education Board. (2025). ${payload.subject} Teacher's Guide ${payload.classLevel}. Kigali: REB.")
19. "activitySummary": A concise 1-sentence description of overall lesson activity flow (e.g., "Through group discussion, learners will explore...").
20. "steps":
    - "introduction": duration (~7 min), 3-4 distinct "teacherActivities", 3-4 distinct "learnerActivities", 2-3 "competencesAndCrossCutting"
    - "development": duration (~25 min), 4-6 rich "teacherActivities", 4-6 rich "learnerActivities", 3-4 "competencesAndCrossCutting"
    - "conclusion": duration (~8 min), 3-4 distinct "teacherActivities", 3-4 distinct "learnerActivities", 2 "competencesAndCrossCutting"
21. "selfEvaluation": "${payload.selfEvaluation || ''}"`;

                  const geminiResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptText,
                    config: {
                      systemInstruction: "You are an official master curriculum inspector for the Rwanda Education Board (REB) Competency-Based Curriculum (CBC). Every lesson plan in a batch MUST have distinct vocabulary, different pedagogical strategies, unique teacher-learner dialogues, and rich variety in Bloom's action verbs. Never generate repetitive cookie-cutter content. Return a JSON array of lesson plan objects matching the required schema.",
                      responseMimeType: "application/json",
                      responseSchema: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            schoolName: { type: Type.STRING },
                            teacherName: { type: Type.STRING },
                            term: { type: Type.STRING },
                            date: { type: Type.STRING },
                            subject: { type: Type.STRING },
                            classLevel: { type: Type.STRING },
                            unitNumber: { type: Type.STRING },
                            lessonNumber: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            classSize: { type: Type.NUMBER },
                            specialNeeds: { type: Type.STRING },
                            unitTitle: { type: Type.STRING },
                            keyUnitCompetence: { type: Type.STRING },
                            lessonTitle: { type: Type.STRING },
                            instructionalObjective: { type: Type.STRING },
                            location: { type: Type.STRING },
                            learningMaterials: { type: Type.STRING },
                            references: { type: Type.STRING },
                            activitySummary: { type: Type.STRING },
                            steps: {
                              type: Type.OBJECT,
                              properties: {
                                introduction: {
                                  type: Type.OBJECT,
                                  properties: {
                                    duration: { type: Type.STRING },
                                    teacherActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    learnerActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    competencesAndCrossCutting: { type: Type.ARRAY, items: { type: Type.STRING } }
                                  },
                                  required: ["duration", "teacherActivities", "learnerActivities", "competencesAndCrossCutting"]
                                },
                                development: {
                                  type: Type.OBJECT,
                                  properties: {
                                    duration: { type: Type.STRING },
                                    teacherActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    learnerActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    competencesAndCrossCutting: { type: Type.ARRAY, items: { type: Type.STRING } }
                                  },
                                  required: ["duration", "teacherActivities", "learnerActivities", "competencesAndCrossCutting"]
                                },
                                conclusion: {
                                  type: Type.OBJECT,
                                  properties: {
                                    duration: { type: Type.STRING },
                                    teacherActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    learnerActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    competencesAndCrossCutting: { type: Type.ARRAY, items: { type: Type.STRING } }
                                  },
                                  required: ["duration", "teacherActivities", "learnerActivities", "competencesAndCrossCutting"]
                                }
                              },
                              required: ["introduction", "development", "conclusion"]
                            },
                            selfEvaluation: { type: Type.STRING }
                          },
                          required: [
                            "schoolName", "teacherName", "term", "date", "subject", "classLevel",
                            "unitNumber", "lessonNumber", "duration", "classSize", "specialNeeds",
                            "unitTitle", "keyUnitCompetence", "lessonTitle", "instructionalObjective",
                            "location", "learningMaterials", "references", "activitySummary", "steps"
                          ]
                        }
                      }
                    }
                  });

                  const cleanedPlansText = cleanJsonResponse(geminiResponse.text || '[]');
                  const parsedPlans = JSON.parse(cleanedPlansText || '[]');
                  if (Array.isArray(parsedPlans) && parsedPlans.length > 0) {
                    const totalCount = parsedPlans.length;
                    const processedPlans = parsedPlans.map((plan: any, idx: number) => ({
                      ...plan,
                      date: getSequentialDate(payload.date, idx),
                      lessonNumber: `${idx + 1} Out of ${totalCount}`,
                    }));

                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                      success: true,
                      provider: 'gemini-2.5-flash',
                      lessonPlans: processedPlans
                    }));
                    return;
                  }
                } catch (geminiErr) {
                  console.warn('Gemini API call encountered an error, falling back to local REB generator:', geminiErr);
                }
              }

              // Local Rule Engine Fallback
              const fallbackPlans = generateFallbackREBLessonPlans(payload);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                provider: 'local_reb_engine',
                lessonPlans: fallbackPlans
              }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Failed to process lesson plan' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), imagekitPlugin(), geminiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
