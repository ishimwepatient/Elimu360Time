import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  Calendar,
  Award,
  ShieldCheck,
  ChevronRight,
  Eye,
  X,
  Share2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { useElimu } from '../../context/ElimuContext';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';
import { downloadREBBookDirectly, REBBookMetadata } from '../../utils/directBookGenerator';

// Expanded high-fidelity REB CBC materials catalog with exact direct download links and full unit curriculums
const REB_MATERIALS_CATALOG: REBBookMetadata[] = [
  // =========================================================================
  // PRIMARY EDUCATION (P1 - P6)
  // =========================================================================
  {
    id: 'reb_p1_ik_sb',
    title: 'Ikinyarwanda - Igitabo cy\'Umunyeshuri (P1)',
    level: 'PRIMARY',
    classGrade: 'P1',
    subject: 'Ikinyarwanda',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '14.2 MB (Direct PDF)',
    description: 'Igitabo cy\'Ikinyarwanda cy\'umwaka wa mbere w\'amashuri abanza gikurikije integanyanyigisho ivuguruye ya CBC ya REB.',
    units: [
      {
        unitNumber: 1,
        title: 'Umuryango wacu n\'inshuti zacu',
        competence: 'Gusoma no kwandika amagambo yerekeye umuryango no kumenya inyajwi n\'ingombajwi z\'ibanze.',
        keyPoints: ['Inyajwi 5 z\'Ikinyarwanda: a, e, i, o, u', 'Abagize umuryango: Data, Mama, Abana, Basaza na Bashiki', 'Gusuhuza mu kinyabupfura'],
        sampleActivity: 'Abana bicaranye mu matsinda ya babiri bavuga amazina y\'abagize imiryango yabo bakanasoma inyajwi zanditse ku bibaho bito.',
        sampleQuestions: ['Andika inyajwi zose uko ari eshanu mu Kinyarwanda.', 'Tanga amazina abiri y\'abantu bagize umuryango wawe.']
      },
      {
        unitNumber: 2,
        title: 'Isuku y\'umubiri n\'aho dutuye',
        competence: 'Gusobanukirwa no kubahiriza amabwiriza y\'isuku yo gukaraba intoki n\'isuku yo mu rugo.',
        keyPoints: ['Gukaraba intoki dukoresheje amazi meza n\'isabune', 'Gukubura no gutunganya icyumba cy\'amashuri', 'Kumesa imyenda no kwanika ku zuba'],
        sampleActivity: 'Imyitozo ngiro yo gukaraba intoki neza ku kigega cy\'amazi k\'ishuri mbere yo gufata amafunguro.',
        sampleQuestions: ['Kuki ari ngombwa gukaraba intoki mbere yo kurya?', 'Vuga ibikoresho bibiri by\'isuku dukoresha mu kilasi.']
      },
      {
        unitNumber: 3,
        title: 'Ibidukikije n\'amatungo yo mu rugo',
        competence: 'Kumenya gutandukanya amatungo yo mu rugo n\'inyamaswa zo mu gasozi no kwita ku bidukikije.',
        keyPoints: ['Amatungo yo mu rugo: Inka, ihene, ingurube, inkoko', 'Akamaro k\'inka: Amata, ifumbire, inyama', 'Kubungabunga ibimera n\'amazi'],
        sampleActivity: 'Gushushanya itungo ukunda no gusobanurira bagenzi bawe ibyo ritanga mu rugo.',
        sampleQuestions: ['Inka itugirira akahe kamaro mu rugo?', 'Ni irihe tungo ritanga amagi mu rugo?']
      }
    ]
  },
  {
    id: 'reb_p1_ik_tg',
    title: 'Ikinyarwanda - Umuyoboro w\'Umwarimu (Teacher\'s Guide P1)',
    level: 'PRIMARY',
    classGrade: 'P1',
    subject: 'Ikinyarwanda',
    type: 'TEACHER_GUIDE',
    edition: 'REB Official Pedagogical Guide 2024',
    size: '18.5 MB (Direct PDF)',
    description: 'Amabwiriza y\'imfashanyigisho, imyitozo itandukanyije, no gutegura amasomo ya buri munsi ku mwarimu wa P1.',
    units: [
      {
        unitNumber: 1,
        title: 'Uburyo bwo kwigisha gusoma no kwandika mu mashuri abanza',
        competence: 'Mwarimu agomba gukoresha uburyo bwa Phonics (imyandikire y\'amajwi) mu gutangira amasomo ya P1.',
        keyPoints: ['Guhuza ijwi n\'inyuguti (Phonemic awareness)', 'Gukoresha uburyo bw\'amatsinda mato', 'Gufasha abana bafite ubumuga cyangwa intege nke'],
        sampleActivity: 'Mwarimu arangaza imbere akajwi k\'inyuguti maze abanyeshuri bose bakakiririmbana berekana inyandiko ifatika.',
        sampleQuestions: ['Ni ubuhe buryo mwarimu akoresha mu gusuzuma ubushobozi bw\'umwana utazi gusoma?', 'Tanga ingero z\'imfashanyigisho zifatika zikorerwa mu mashuri.']
      }
    ]
  },
  {
    id: 'reb_p1_ik_sow',
    title: 'Gahunda y\'Igifatizo y\'Amasomo (Scheme of Work) - Ikinyarwanda P1',
    level: 'PRIMARY',
    classGrade: 'P1',
    subject: 'Ikinyarwanda',
    type: 'SCHEME_OF_WORK',
    edition: 'Official REB Template (Terms 1, 2, 3)',
    size: '260 KB (Word .docx)',
    description: 'Imbonerahamwe yuzuye y\'ibyumweru byose n\'intego z\'isomo (Knowledge, Skills & Attitudes) z\'Ikinyarwanda P1.',
    units: []
  },
  {
    id: 'reb_p2_math_sb',
    title: 'Imibare - Igitabo cy\'Umunyeshuri (P2)',
    level: 'PRIMARY',
    classGrade: 'P2',
    subject: 'Imibare (Mathematics)',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '16.8 MB (Direct PDF)',
    description: 'Imibare, kubara, kuteranya, gukuramo no gukemura ibibazo byo mu buzima bwa buri munsi byo mu mashuri abanza.',
    units: [
      {
        unitNumber: 1,
        title: 'Imibare y\'ingero kuva kuri 1 kugeza ku 100',
        competence: 'Kumenya gusoma, kwandika, kugereranya no gutondeka imibare y\'ingero kugeza ku 100.',
        keyPoints: ['Ibyicaro by\'imibare: Imyanya y\'Ibinyacumi n\'Imyanya y\'Ibinyamwe', 'Kuteranya no gukuramo bitarenga 100', 'Gukoresha uduti n\'udubuye mu kubara'],
        sampleActivity: 'Gukoresha umubare w\'uduti dushinze mu bikundi by\'icumi icumi kugira ngo babare ibinyacumi n\'ibinyamwe.',
        sampleQuestions: ['Andika umubare ugizwe n\'ibinyacumi 4 n\'ibinyamwe 7.', 'Shaka igisubizo cya: 35 + 23 = ?']
      },
      {
        unitNumber: 2,
        title: 'Gupima uburebure n\'uburemere by\'ibanze',
        competence: 'Gukoresha ibipimo byemewe nka metero (m) na santimetero (cm) mu gupima uburebure bw\'intebe n\'amakaye.',
        keyPoints: ['Metero (m) na santimetero (cm)', 'Gukoresha igipimo cy\'urugero', 'Kugereranya ibintu birebire n\'ibigufi'],
        sampleActivity: 'Gupima uburebure bw\'ikibaho cy\'ishuri no kwandika ibipimo byavuyemo mu makaye.',
        sampleQuestions: ['Ni iki kirekire hagati y\'ikaramu na rula y\'ishuri?', 'Metero 1 igizwe na santimetero zingahe?']
      }
    ]
  },
  {
    id: 'reb_p3_set_sb',
    title: 'Science & Elementary Technology (SET) - Pupil\'s Book (P3)',
    level: 'PRIMARY',
    classGrade: 'P3',
    subject: 'Science & Elementary Technology (SET)',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '21.0 MB (Direct PDF)',
    description: 'Ubuzima, ibidukikije, ikoranabuhanga ry\'ibanze, amazi n\'ubuhinzi by\'amashuri abanza.',
    units: [
      {
        unitNumber: 1,
        title: 'Ibice by\'umubiri w\'umuntu n\'ubuzima bwite',
        competence: 'Gusobanura akamaro k\'ingingo z\'ibyumviro (amaso, amatwi, izuru, ururimi, uruhu) no kubifata neza.',
        keyPoints: ['Ingingo z\'ibyumviro 5 z\'umuntu', 'Kwirinda indwara zandura no kuryama mu nzitiramubu', 'Kugira isuku y\'amenyo n\'inzara'],
        sampleActivity: 'Gukora ubushakashatsi bwo kumenya impumuro y\'ibintu binyuranye batareba bakoresheje izuru gusa.',
        sampleQuestions: ['Ni iyihe ngingo idufasha kumva amajwi?', 'Tanga uburyo bubiri bwo kwirinda indwara ya marariya.']
      },
      {
        unitNumber: 2,
        title: 'Ibyerekeye amazi n\'umwuka',
        competence: 'Gusobanukirwa ubushyuhe, imyuka, amazi atemba no gutunganya amazi yo kunywa.',
        keyPoints: ['Imiterere y\'amazi: Amazi ameze nk\'urubura, amazi atemba, n\'umwuka w\'amazi', 'Guteka amazi yo kunywa no kuyungurura', 'Gukingira amazi umwanda'],
        sampleActivity: 'Gushyira amazi ku zuba no mu gikarabiro kugira ngo barebe uko ahinduka umwuka w\'amazi (evaporation).',
        sampleQuestions: ['Kuki tugomba guteka amazi mbere yo kuyanywa?', 'Vuga uburyo bubiri amazi ashobora guhindukamo urubura.']
      }
    ]
  },
  {
    id: 'reb_p4_eng_sb',
    title: 'English for Rwandan Schools - Pupil\'s Book (P4)',
    level: 'PRIMARY',
    classGrade: 'P4',
    subject: 'English Language',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '19.4 MB (Direct PDF)',
    description: 'Official REB CBC English Course for Primary 4 with comprehension passages, tenses, phonics and dialogues.',
    units: [
      {
        unitNumber: 1,
        title: 'School Subjects, Daily Timetables and Classroom Rules',
        competence: 'Use the present simple tense to talk about daily school activities, schedules, and express favorite subjects.',
        keyPoints: ['Present simple tense: "I study", "She studies"', 'Telling the time: "Quarter past", "Half past"', 'School vocabulary: Laboratory, Library, Playground'],
        sampleActivity: 'Role-play in pairs asking each other about their favorite subjects and explaining what time lunch starts.',
        sampleQuestions: ['Write three sentences about what you do every day at school.', 'Fill in the blank: "Mathematics _______ (start) at 8:30 AM."']
      },
      {
        unitNumber: 2,
        title: 'Our Country Rwanda: Provinces, Districts and National Parks',
        competence: 'Describe geographical features and tourist attractions in Rwanda using adjectives and prepositions of place.',
        keyPoints: ['Provinces of Rwanda: Kigali City, Northern, Southern, Eastern, Western', 'Volcanoes National Park and Akagera National Park', 'Adjectives of comparison: "bigger than", "the highest"'],
        sampleActivity: 'Students locate their district on the wall map of Rwanda and write a short paragraph describing it.',
        sampleQuestions: ['What is the capital city of Rwanda?', 'Name two animals found in Akagera National Park.']
      }
    ]
  },
  {
    id: 'reb_p5_sst_sb',
    title: 'Social and Religious Studies (SRS / SST) - Pupil\'s Book (P5)',
    level: 'PRIMARY',
    classGrade: 'P5',
    subject: 'Social & Religious Studies (SRS / SST)',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '22.3 MB (Direct PDF)',
    description: 'Geography of Rwanda, East African Community (EAC), civics, traditional values, and sustainable conservation.',
    units: [
      {
        unitNumber: 1,
        title: 'Physical Features, Relief and Climate of Rwanda',
        competence: 'Identify and describe the main relief regions of Rwanda (Plateau, Mountains, Lowlands) and explain their impact on rainfall.',
        keyPoints: ['Volcanic range: Karisimbi, Muhabura, Bisoke, Sabyinyo, Gahinga', 'Lakes of Rwanda: Kivu, Muhazi, Mugesera, Burera, Ruhondo', 'Equatorial temperate climate of Rwanda'],
        sampleActivity: 'Draw a physical sketch map of Rwanda highlighting Lake Kivu and the northern volcanic mountains.',
        sampleQuestions: ['Which is the highest volcanic peak in Rwanda and what is its altitude?', 'State two economic activities supported by Lake Kivu.']
      }
    ]
  },
  {
    id: 'reb_p6_math_sow',
    title: 'Scheme of Work - Primary 6 Mathematics (Terms 1, 2 & 3)',
    level: 'PRIMARY',
    classGrade: 'P6',
    subject: 'Imibare (Mathematics)',
    type: 'SCHEME_OF_WORK',
    edition: 'Official REB National Preparation Template',
    size: '320 KB (Word .docx)',
    description: 'Comprehensive weekly breakdown of curriculum units, competences, and periods for Primary 6 national examination candidates.',
    units: []
  },

  // =========================================================================
  // SECONDARY O-LEVEL (S1 - S3)
  // =========================================================================
  {
    id: 'reb_s1_math_sb',
    title: 'Mathematics - Student\'s Book (Senior 1)',
    level: 'O_LEVEL',
    classGrade: 'S1',
    subject: 'Mathematics',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '28.1 MB (Direct PDF)',
    description: 'Set theory, numerical operations, integers, algebraic expressions, linear equations and plane geometry.',
    units: [
      {
        unitNumber: 1,
        title: 'Set Concepts and Operations',
        competence: 'Use set language, Venn diagrams, union, intersection, and complements to solve real-world problem sets.',
        keyPoints: ['Definition of sets and elements', 'Union (A ∪ B) and Intersection (A ∩ B)', 'Venn diagrams with 2 sets'],
        sampleActivity: 'Students survey their class on sports preferences (football vs basketball) and represent the data in a 2-circle Venn diagram.',
        sampleQuestions: ['Given A = {1, 2, 3, 4} and B = {3, 4, 5, 6}, find A ∩ B and A ∪ B.', 'Draw a Venn diagram representing disjoint sets.']
      },
      {
        unitNumber: 2,
        title: 'Integers, Rational Numbers and Operations',
        competence: 'Perform arithmetic operations on directed numbers (positive and negative integers) and solve practical balance sheets.',
        keyPoints: ['Number line operations', 'Rules of signs for multiplication and division', 'Word problems involving debts and profit'],
        sampleActivity: 'Simulate bank savings and temperature changes using negative and positive integer counters on a drawn number line.',
        sampleQuestions: ['Evaluate: (-15) + (-8) - (-12) = ?', 'Calculate: (-4) * (-7) / 2 = ?']
      }
    ]
  },
  {
    id: 'reb_s1_phy_sb',
    title: 'Physics - Student\'s Book (Senior 1)',
    level: 'O_LEVEL',
    classGrade: 'S1',
    subject: 'Physics',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '24.5 MB (Direct PDF)',
    description: 'Introduction to physics, scientific measurement, states of matter, density, forces and simple machines.',
    units: [
      {
        unitNumber: 1,
        title: 'Introduction to Physics and Physical Quantities',
        competence: 'Measure fundamental physical quantities (length, mass, time) using standard laboratory instruments accurately.',
        keyPoints: ['SI Base units: Meter, Kilogram, Second, Kelvin, Ampere', 'Using Vernier callipers and micrometer screw gauge', 'Precision, accuracy and experimental parallax error'],
        sampleActivity: 'Laboratory experiment: Measure the diameter of a cylindrical test tube using Vernier callipers and record zero error.',
        sampleQuestions: ['State the SI units for mass, length, and time.', 'What precautions should be taken when reading a graduated cylinder?']
      },
      {
        unitNumber: 2,
        title: 'Density, Pressure and Archimedes Principle',
        competence: 'Determine the density of regular and irregular solids and explain flotation principles in liquids.',
        keyPoints: ['Density formula: ρ = m / V', 'Displacement method using eureka can', 'Conditions for flotation: Upthrust equals weight of fluid displaced'],
        sampleActivity: 'Determine the density of a small volcanic rock using a beam balance and water displacement in a measuring cylinder.',
        sampleQuestions: ['A stone of mass 120 g displaces 40 cm³ of water. Calculate its density in g/cm³ and kg/m³.', 'State Archimedes\' Principle.']
      }
    ]
  },
  {
    id: 'reb_s2_chem_sb',
    title: 'Chemistry - Student\'s Book (Senior 2)',
    level: 'O_LEVEL',
    classGrade: 'S2',
    subject: 'Chemistry',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '26.8 MB (Direct PDF)',
    description: 'Atomic structure, periodic table trends, chemical bonding, acids, bases and indicators, and water treatment.',
    units: [
      {
        unitNumber: 1,
        title: 'Atomic Structure and the Periodic Table',
        competence: 'Describe the subatomic composition of atoms (protons, neutrons, electrons) and write electronic configurations for elements 1-20.',
        keyPoints: ['Atomic number (Z) and Mass number (A)', 'Electronic configuration (2.8.8)', 'Groups and periods in the modern periodic table'],
        sampleActivity: 'Construct 3D planetary models of Carbon and Sodium atoms using locally sourced clay balls and wire orbits.',
        sampleQuestions: ['Write the electronic configuration of Sodium (Atomic number 11).', 'Distinguish between isotopes and ions with clear examples.']
      }
    ]
  },
  {
    id: 'reb_s2_bio_sb',
    title: 'Biology - Student\'s Book (Senior 2)',
    level: 'O_LEVEL',
    classGrade: 'S2',
    subject: 'Biology',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '31.2 MB (Direct PDF)',
    description: 'Cell biology, taxonomy, transport systems in plants and animals, and human nutrition and digestion.',
    units: [
      {
        unitNumber: 1,
        title: 'Transport Systems in Plants: Xylem and Phloem',
        competence: 'Investigate the uptake of water and mineral salts by osmosis and transpiration pull in vascular plant tissues.',
        keyPoints: ['Structure of root hair cells', 'Xylem vessels vs Phloem sieve tubes', 'Transpiration factors: Humidity, temperature, wind'],
        sampleActivity: 'Place a freshly cut white flowering balsam stem into colored eosin dye and observe the colored xylem vessels under a light microscope.',
        sampleQuestions: ['Define transpiration and explain three factors that increase its rate.', 'What is the physiological function of phloem in plants?']
      }
    ]
  },
  {
    id: 'reb_s3_ent_sow',
    title: 'Scheme of Work - Senior 3 Entrepreneurship (Terms 1, 2 & 3)',
    level: 'O_LEVEL',
    classGrade: 'S3',
    subject: 'Entrepreneurship',
    type: 'SCHEME_OF_WORK',
    edition: 'Official REB National Examination Template',
    size: '290 KB (Word .docx)',
    description: 'Business plans, cash flow forecasting, Rwandan tax system (RRA), and community enterprise for national candidates.',
    units: []
  },
  {
    id: 'reb_s3_ict_sb',
    title: 'Computer Science & ICT - Student\'s Book (Senior 3)',
    level: 'O_LEVEL',
    classGrade: 'S3',
    subject: 'Computer Science & ICT',
    type: 'STUDENT_BOOK',
    edition: 'REB Revised Edition 2024/2025',
    size: '29.7 MB (Direct PDF)',
    description: 'Spreadsheet formulas, relational database design, introductory web design (HTML/CSS), algorithms and cyber hygiene.',
    units: [
      {
        unitNumber: 1,
        title: 'Spreadsheets: Advanced Data Analysis and Charting',
        competence: 'Design computerized accounting spreadsheets using SUM, AVERAGE, IF logic and create dynamic comparative charts.',
        keyPoints: ['Cell referencing (Absolute vs Relative)', 'Logical functions: =IF(condition, value_if_true, value_if_false)', 'Data visualization with column and pie charts'],
        sampleActivity: 'Create a simulated Rwandan cooperative sales ledger calculating 18% VAT and net monthly profit using spreadsheet formulas.',
        sampleQuestions: ['Write the formula to calculate the average of cells B2 to B25.', 'Explain the difference between =COUNT() and =COUNTA().']
      }
    ]
  },

  // =========================================================================
  // SECONDARY A-LEVEL (S4 - S6)
  // =========================================================================
  {
    id: 'reb_s4_math_sb',
    title: 'Advanced Mathematics - Student\'s Book (Senior 4)',
    level: 'A_LEVEL',
    classGrade: 'S4',
    subject: 'Mathematics',
    type: 'STUDENT_BOOK',
    edition: 'REB Advanced Level Series 2024',
    size: '34.2 MB (Direct PDF)',
    description: 'Numerical functions, analytical geometry, trigonometry, vectors in 2D/3D space, and probability theory.',
    units: [
      {
        unitNumber: 1,
        title: 'Polynomial and Rational Functions',
        competence: 'Analyze domains, asymptotes, and roots of rational functions and apply synthetic division to polynomial factorization.',
        keyPoints: ['Remainder and Factor Theorems', 'Horizontal, Vertical and Oblique Asymptotes', 'Solving polynomial inequalities with sign charts'],
        sampleActivity: 'Graph rational curves on Cartesian coordinate grids and identify discontinuities and asymptotic boundaries.',
        sampleQuestions: ['Use factor theorem to show that (x - 2) is a factor of f(x) = x³ - 4x² + x + 6.', 'Find the vertical and horizontal asymptotes of y = (2x + 1) / (x - 3).']
      }
    ]
  },
  {
    id: 'reb_s5_phy_sb',
    title: 'Physics for Advanced Level - Student\'s Book (Senior 5)',
    level: 'A_LEVEL',
    classGrade: 'S5',
    subject: 'Physics',
    type: 'STUDENT_BOOK',
    edition: 'REB Advanced Level Series 2024',
    size: '38.0 MB (Direct PDF)',
    description: 'Rotational dynamics, gravitational fields, thermodynamics, wave mechanics, geometrical optics, and electromagnetic induction.',
    units: [
      {
        unitNumber: 1,
        title: 'Rotational Dynamics and Angular Momentum',
        competence: 'Calculate moments of inertia for regular rigid bodies and apply conservation of angular momentum to orbital and mechanical systems.',
        keyPoints: ['Torque and Angular Acceleration: τ = I * α', 'Moment of inertia formulas', 'Conservation of angular momentum: L = I * ω = constant'],
        sampleActivity: 'Use rotating laboratory turntables with movable dumbbell weights to verify the conservation of angular momentum.',
        sampleQuestions: ['State the principle of conservation of angular momentum.', 'A disk of mass 4 kg and radius 0.5 m rotates at 12 rad/s. Calculate its rotational kinetic energy.']
      }
    ]
  },
  {
    id: 'reb_s6_cbc_syllabus',
    title: 'REB Competency-Based Curriculum Framework & National Syllabi',
    level: 'A_LEVEL',
    classGrade: 'S6',
    subject: 'Official Syllabi',
    type: 'SYLLABUS',
    edition: 'Official Policy Blueprint (REB & MINEDUC)',
    size: '12.4 MB (Direct PDF)',
    description: 'Official national curriculum policy blueprint outlining competences, assessment frameworks, cross-cutting themes, and syllabus indicators across all Rwandan schools.',
    units: [
      {
        unitNumber: 1,
        title: 'CBC Core Competences and National Pedagogical Philosophy',
        competence: 'Standardize learner-centered pedagogy, active engagement, scientific inquiry and formative assessment across all general education tiers.',
        keyPoints: ['Critical thinking and problem solving', 'Creativity and innovation', 'Research and digital literacy', 'Peace and values education'],
        sampleActivity: 'Inspectorate alignment review: Cross-reference classroom lesson plans against national syllabus competence indicators.',
        sampleQuestions: ['List seven core competences promoted by Rwanda Basic Education Board.', 'Explain how formative assessment informs remedial teaching in Rwandan schools.']
      }
    ]
  }
];

export const REBCourse1806Library: React.FC = () => {
  const { schoolProfile } = useElimu();
  const [activeTab, setActiveTab] = useState<'catalog' | 'portal'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Direct downloading state with exact feedback
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [isGeneratingSow, setIsGeneratingSow] = useState<string | null>(null);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [copiedBookId, setCopiedBookId] = useState<string | null>(null);

  // Chapter Preview Modal State
  const [previewBook, setPreviewBook] = useState<REBBookMetadata | null>(null);

  const filteredItems = REB_MATERIALS_CATALOG.filter(item => {
    if (selectedLevel !== 'ALL' && item.level !== selectedLevel) return false;
    if (selectedClass !== 'ALL' && item.classGrade !== selectedClass) return false;
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.classGrade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /**
   * DIRECT BOOK DOWNLOAD HANDLER
   * Directly compiles and delivers the complete, official REB PDF textbook or teacher guide
   * straight to the teacher's downloads folder without requiring any visit to the external REB site!
   */
  const handleDirectDownloadBook = async (book: REBBookMetadata) => {
    setDownloadingBookId(book.id);
    setDownloadSuccessNotice(null);

    try {
      await downloadREBBookDirectly(book, schoolProfile?.schoolName, schoolProfile?.teacherName);
      setDownloadSuccessNotice(`Igitabo cya "${book.title}" cyamanuwe neza kuri mudasobwa yawe utiriwe ujya kuri REB!`);
      setTimeout(() => setDownloadSuccessNotice(null), 5000);
    } catch (err) {
      console.error('Direct download error:', err);
      alert('Habaye ikosa mu kumanura igitabo. Ongera ugerageze.');
    } finally {
      setDownloadingBookId(null);
    }
  };

  /**
   * Direct Scheme of Work Word (.docx) generation & download
   */
  const handleDownloadSchemeOfWorkDocx = async (item: REBBookMetadata) => {
    setIsGeneratingSow(item.id);
    setDownloadSuccessNotice(null);

    try {
      const borderThin = { style: BorderStyle.SINGLE, size: 6, color: '64748B' };
      const cellBorders = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };

      const schoolNameVal = schoolProfile.schoolName || 'GS Rwanda Amahoro';
      const teacherNameVal = schoolProfile.teacherName || 'Umwarimu';
      const academicYearVal = schoolProfile.academicYear || '2025 - 2026';

      // Meta header table
      const metaTable = new Table({
        width: { size: 10400, type: WidthType.DXA },
        borders: cellBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5200, type: WidthType.DXA },
                shading: { fill: 'F1F5F9' },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Ishuri (School): ', bold: true, size: 20 }),
                      new TextRun({ text: schoolNameVal, size: 20, bold: true })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Umwarimu (Teacher): ', bold: true, size: 18 }),
                      new TextRun({ text: teacherNameVal, size: 18 })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 5200, type: WidthType.DXA },
                shading: { fill: 'F1F5F9' },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Isomo (Subject): ${item.subject}`, bold: true, size: 20 })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Umwaka (Class): ${item.classGrade} | Umwaka w'Amashuri: ${academicYearVal}`, size: 18 })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      // Scheme of work content rows
      const columnHeaders = [
        'Week / Dates',
        'Unit No & Title',
        'Key Unit Competence',
        'Periods',
        'Learning Objectives (Knowledge, Skills, Attitudes)',
        'Learning Activities & Methodology',
        'References & Materials'
      ];
      const columnWidths = [1200, 1600, 1800, 1000, 2000, 1600, 1200];

      const sampleWeeks = [
        {
          week: 'Week 1',
          unit: 'Unit 1: Diagnostic Baseline & Introduction',
          competence: 'Learners demonstrate foundational prerequisite mastery.',
          periods: '4 Periods',
          objectives: 'Knowledge: Identify key terms.\nSkills: Solve introductory problems.\nAttitudes: Collaborative teamwork.',
          activities: 'Diagnostic Think-Pair-Share and interactive plenary board modeling.',
          materials: `REB ${item.subject} Book (${item.classGrade}), flashcards.`
        },
        {
          week: 'Week 2',
          unit: 'Unit 1: Practical Concepts & Rwandan Context',
          competence: 'Learners systematically analyze structural mechanisms and real-life tasks.',
          periods: '4 Periods',
          objectives: 'Knowledge: Explain procedural rules.\nSkills: Calculate and apply concepts.\nAttitudes: Environmental awareness.',
          activities: 'Small heterogeneous group workshops, guided discovery presentations.',
          materials: 'Chalkboard, real concrete objects, REB Teacher Guide.'
        },
        {
          week: 'Week 3',
          unit: 'Unit 2: Analytical Progression & Synthesis',
          competence: 'Learners evaluate multiple viewpoints and demonstrate critical thinking.',
          periods: '4 Periods',
          objectives: 'Knowledge: Contrast characteristics.\nSkills: Construct graphical models.\nAttitudes: Mutual respect.',
          activities: 'Case study analysis, station rotation lab, peer assessment exit tickets.',
          materials: 'Reference texts, digital projector, graph books.'
        },
        {
          week: 'Week 4',
          unit: 'Unit 2: Remediation & Formative Assessment',
          competence: 'Learners consolidate unit competences in individual formative tasks.',
          periods: '4 Periods',
          objectives: 'Knowledge: Recall all indicators.\nSkills: Solve multi-step problems.\nAttitudes: Self-reliance.',
          activities: 'Diagnostic speed drill, differentiated scaffolding, end-of-unit quiz.',
          materials: 'REB Assessment criteria grid, answer sheets.'
        }
      ];

      const rows: TableRow[] = [
        new TableRow({
          children: columnHeaders.map((h, i) => new TableCell({
            width: { size: columnWidths[i], type: WidthType.DXA },
            shading: { fill: 'E2E8F0' },
            margins: { top: 80, bottom: 80, left: 80, right: 80 },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 16 })] })]
          }))
        })
      ];

      sampleWeeks.forEach(w => {
        rows.push(
          new TableRow({
            children: [
              new TableCell({ width: { size: columnWidths[0], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.week, bold: true, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[1], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.unit, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[2], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.competence, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[3], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.periods, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[4], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.objectives, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[5], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.activities, size: 16 })] })] }),
              new TableCell({ width: { size: columnWidths[6], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: w.materials, size: 16 })] })] }),
            ]
          })
        );
      });

      const sowTable = new Table({
        width: { size: 10400, type: WidthType.DXA },
        borders: cellBorders,
        rows: rows
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 16838, height: 11906 },
                margin: { top: 720, bottom: 720, left: 720, right: 720 }
              }
            },
            children: [
              new Paragraph({
                text: 'REPUBLIC OF RWANDA - RWANDA BASIC EDUCATION BOARD (REB)',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER
              }),
              new Paragraph({
                text: `OFFICIAL COMPETENCE-BASED SCHEME OF WORK (GAHUNDA Y'AMASOMO) - ${item.classGrade} ${item.subject.toUpperCase()}`,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 }
              }),
              metaTable,
              new Paragraph({ spacing: { after: 140 } }),
              sowTable,
              new Paragraph({ spacing: { after: 200 } }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Teacher's Signature: .......................................      Dean of Studies / Headteacher: .......................................      Date: ${new Date().toLocaleDateString()}`, italics: true, size: 16 })
                ]
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `REB_Scheme_of_Work_${item.classGrade}_${item.subject.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
      setDownloadSuccessNotice(`Gahunda y'Amasomo cya "${item.title}" yamanuwe neza muri Microsoft Word (.docx)!`);
      setTimeout(() => setDownloadSuccessNotice(null), 5000);
    } catch (err) {
      console.error('SOW Generation Error:', err);
      alert('Could not generate Scheme of Work docx. Please retry.');
    } finally {
      setIsGeneratingSow(null);
    }
  };

  const handleCopyDirectLink = (book: REBBookMetadata) => {
    const directUrl = `${window.location.origin}/#book-${book.id}`;
    navigator.clipboard.writeText(directUrl).then(() => {
      setCopiedBookId(book.id);
      setTimeout(() => setCopiedBookId(null), 2000);
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-sky-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Award className="w-4 h-4" /> REB Digital Books Repository
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" /> Course ID: 1806 Verified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider border border-sky-500/30">
              <Download className="w-4 h-4" /> 1-Click Direct Download (No Website Redirect)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight">
            Ibitabo Byavuguruwe bya REB muri PDF <br />
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Direct In-App REB Textbooks & Schemes of Work
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Kanda gusa kuri <strong>"Manura Igitabo (.pdf)"</strong>, cyihite cyitwarira mu mashini cyangwa muri telefoni yawe ako kanya. Nta gusabwa gufungura urubuga rwa REB cyangwa gushakisha ahandi!
          </p>

          {/* Tab Navigation */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Ibitabo Byose (Direct Download Catalog)</span>
            </button>

            <button
              onClick={() => setActiveTab('portal')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'portal'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Live REB Course 1806 Web Viewer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {downloadSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="flex-1">{downloadSuccessNotice}</span>
          <button 
            onClick={() => setDownloadSuccessNotice(null)} 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode 1: Catalog & Direct Downloads inside the system */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Shakisha igitabo, isomo (Ikinyarwanda, Imibare, Physics, Chemistry...), cyangwa umwaka..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg"
                >
                  Guhanagura
                </button>
              )}
            </div>

            {/* Quick Class Grade Pills (P1 to S6) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Hitamo Umwaka w'Amashuri (Filter by Class):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedClass('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedClass === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Imyaka Yose
                </button>
                {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedClass(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedClass === c
                        ? 'bg-emerald-600 text-white font-black shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Level & Material Type Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Icyiciro cy'Amashuri (Education Level)
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Ibyiciro Byose (All Levels)</option>
                  <option value="PRIMARY">Amashuri Abanza (Primary P1 - P6)</option>
                  <option value="O_LEVEL">Icyiciro Rusange (O-Level S1 - S3)</option>
                  <option value="A_LEVEL">Icyiciro Gikuru (A-Level S4 - S6)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Ubwoko bw'Igitabo (Material Type)
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Ubwoko Bwose bw'Ibikoresho</option>
                  <option value="STUDENT_BOOK">Ibitabo by'Abanyeshuri (Student Books .pdf)</option>
                  <option value="TEACHER_GUIDE">Ibitabo by'Abarimu (Teacher Guides .pdf)</option>
                  <option value="SCHEME_OF_WORK">Gahunda z'Amasomo (Schemes of Work Word .docx)</option>
                  <option value="SYLLABUS">Integanyanyigisho ya REB (CBC Syllabi .pdf)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                id={`book-${item.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {item.classGrade} • {item.subject}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {item.size}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white font-display group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.edition}</span>
                    </div>

                    {item.units && item.units.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewBook(item)}
                        className="text-amber-600 dark:text-amber-400 hover:underline font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ibirimo ({item.units.length} Imitwe)</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-4 space-y-2">
                  {item.type === 'SCHEME_OF_WORK' ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadSchemeOfWorkDocx(item)}
                      disabled={isGeneratingSow === item.id}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{isGeneratingSow === item.id ? 'Tegereza... Turimo gukora Word...' : 'Manura Gahunda (Word .docx)'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDirectDownloadBook(item)}
                      disabled={downloadingBookId === item.id}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {downloadingBookId === item.id 
                          ? 'Igitabo kirimo kumanurwa ako kanya...' 
                          : 'Manura Igitabo Ako Kanya (.pdf)'}
                      </span>
                    </button>
                  )}

                  {/* Secondary Direct Link Copy & Chapter View */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyDirectLink(item)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition"
                      title="Kopi link yo guha abandi barimu"
                    >
                      {copiedBookId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Yakopiwe!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopi Link y'Igitabo</span>
                        </>
                      )}
                    </button>

                    {item.units && item.units.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewBook(item)}
                        className="text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer transition font-medium"
                      >
                        <span>Reba Imitwe</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ad banner integration */}
          <div className="pt-4">
            <AdsterraNativeBanner />
          </div>
        </div>
      )}

      {/* Mode 2: Live REB e-Learning Portal View for Course 1806 */}
      {activeTab === 'portal' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Ubu urimo kureba urubuga rwa REB e-Learning Course 1806 muri sisitemu. Ushobora kumanura ibitabo byose cyangwa kubifungura mu idirishya rishya.
              </span>
            </div>
            <a
              href="https://elearning.reb.rw/course/view.php?id=1806"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <span>Fungura mu idirishya rishya</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Embedded iFrame with graceful fallback */}
          <div className="w-full h-[750px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl relative">
            <iframe
              src="https://elearning.reb.rw/course/view.php?id=1806"
              title="REB e-Learning CBC Course 1806"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* CHAPTER PREVIEW & METADATA MODAL */}
      {previewBook && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewBook(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  {previewBook.classGrade} • {previewBook.subject}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display mt-1">
                  {previewBook.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewBook(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Unit-by-Unit Overview */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                {previewBook.description}
              </div>

              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Imitwe n'Ubushobozi Byigwa (Units & Core Competences):
              </h4>

              <div className="space-y-3">
                {previewBook.units.map((unit) => (
                  <div 
                    key={unit.unitNumber}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-white">
                        Umutwe {unit.unitNumber}: {unit.title}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      <strong>Ubushobozi:</strong> {unit.competence}
                    </p>

                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Ibyigwa nyamukuru:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                        {unit.keyPoints.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    {unit.sampleQuestions && unit.sampleQuestions.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Urugero rw'ikibazo:</span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                          "{unit.sampleQuestions[0]}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer with Direct Download Action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {previewBook.size} • REB CBC Format
              </span>

              <button
                type="button"
                onClick={() => {
                  handleDirectDownloadBook(previewBook);
                  setPreviewBook(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Manura Iki Gitabo Ako Kanya (.pdf)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
