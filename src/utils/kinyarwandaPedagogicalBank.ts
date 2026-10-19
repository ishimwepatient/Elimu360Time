/**
 * Kinyarwanda CBC Pedagogical Word Bank & Curriculum Templates
 * Aligned with Rwanda Basic Education Board (REB) Competence-Based Curriculum (CBC)
 * for all subjects taught in Kinyarwanda:
 * - Ikinyarwanda (Primary P1-P6 & Secondary S1-S6)
 * - Imibare mu Kinyarwanda (Lower Primary P1-P3)
 * - Ibyerekeye Ibidukikije / Ubumenyi bw'Ibidukikije (SET & Social Studies in Kinyarwanda P1-P3)
 * - Ubugeni n'Umuco / Imikino (Creative Arts & Culture P1-P3)
 */

export interface KinyarwandaCurriculumUnit {
  unitNumber: string;
  unitTitle: string;
  subject: string;
  classLevel: string;
  keyCompetence: string;
  sampleLessons: string[];
  materials: string;
  references: string;
}

export interface KinyarwandaPedagogicalProfile {
  approachName: string;
  introTeacher: string[];
  introLearner: string[];
  introCompetences: string[];
  devTeacher: string[];
  devLearner: string[];
  devCompetences: string[];
  concTeacher: string[];
  concLearner: string[];
  concCompetences: string[];
  selfEvaluations: string[];
}

export const KINYARWANDA_BLOOM_VERBS = {
  kwibuka: [
    'kugaragaza', 'kuvuga', 'kwerekana', 'gushyira ku murongo', 'kurondora', 'gutandukanya',
    'guhamya', 'gusubiramo', 'kwandika', 'gutondeka', 'kumenya', 'gusoma', 'kugaragaza izina'
  ],
  gusobanukirwa: [
    'gusobanura', 'gusesengura mu magambo ye', 'gutanga ingero', 'kugaragaza itandukaniro',
    'kubumbira hamwe', 'gusobanura icyo bivuze', 'gusesengura insanganyamatsiko', 'kugaragaza intandaro'
  ],
  gushyira_mu_bikorwa: [
    'gukoresha', 'gukora imyitozo', 'gukemura ibibazo', 'kubara', 'gushushanya', 'gukora ikinamico',
    'gukina', 'kubaka interuro', 'kwandika umwandiko', 'gukora imbonerahamwe', 'gukurikiza amabwiriza'
  ],
  gusesengura: [
    'gucukumbura', 'kugereranya', 'kugaragaza impamvu n\'ingaruka', 'gusesengura imiterere',
    'gutandukanya iby\'ukuri n\'ibihimbano', 'gucukumbura ibitekerezo by\'ingenzi', 'kugenzura ibimenyetso'
  ],
  isuzuma: [
    'kugenzura agaciro', 'gutanga igitekerezo', 'gushima cyangwa kugaya', 'kwemeza',
    'gukosora amakosa', 'gusuzuma imikorere', 'gufata umwanzuro ushingiye ku bimenyetso'
  ],
  guhanga: [
    'guhimba umuvugo', 'kwandika igitekerezo gishya', 'gukora igikoresho cy\'imfashanyigisho',
    'gutegura ikiganiro', 'guhanga ikinamico', 'gushyiraho uburyo bushya bwo gukemura ikibazo'
  ]
};

export const KINYARWANDA_PEDAGOGICAL_PROFILES: KinyarwandaPedagogicalProfile[] = [
  // Profile 1: Imikoranire mu matsinda n'ubushakashatsi (Collaborative Group Work & Discovery)
  {
    approachName: 'Imirimo y\'amatsinda no kuvumbura ubumenyi (Collaborative Discovery)',
    introTeacher: [
      'Aha ikaze abanyeshuri, akora isuku yo mu ishuri no kugenzura abitabiriye isomo.',
      'Abaza ibibazo bibutsa ibyize mu isomo riheruka akoresheje uburyo bwo gusubiriza icyarimwe cyangwa umwe ku wundi.',
      'Arakangurira abanyeshuri gushishikazwa n\'isomo rishya binyuze mu gisakuzo cyangwa ikibazo kibyutsa amatsiko.',
      'Yandika umutwe w\'isomo ku kibaho mu nyuguti zigaragara neza kandi asobanura intego yitezwe.'
    ],
    introLearner: [
      'Basuhuza umwarimu bishimye, bategura ibikoresho byabo byo kwandika no gusoma.',
      'Basubiza ibibazo bibutsa isomo riheruka mu mutuzo no gutega amatwi bagenzi babo.',
      'Bakurikirana amatsiko y\'ikibazo cyangwa igisakuzo umwarimu abahaye bagatanga ibisubizo byabo.',
      'Bandika umutwe w\'isomo mu makaye yabo neza kandi basoma intego y\'isomo.'
    ],
    introCompetences: [
      'Itumanaho: Kuvuga no gusubiza mu rurimi rukwiye kandi rwubahirije ikinyabupfura.',
      'Gufatanya n\'abandi: Gutega amatwi ibitekerezo bya bagenzi babo no gusangira ibisubizo.',
      'Uburere mboneragihugu n\'amahoro: Kubahana no guhana umwanya wo kuvuga.'
    ],
    devTeacher: [
      'Asaba abanyeshuri kureba amashusho cyangwa imfashanyigisho yateguye maze akabaha amabwiriza asobanutse.',
      'Agabanya abanyeshuri mu matsinda mato y\'abanyeshuri 4 kugeza kuri 5, azirikana uburinganire n\'abafite ubumuga.',
      'Azenguruka mu matsinda atanga ubufasha bwihariye ku bana basigara inyuma cyangwa abafite intege nke.',
      'Aha umwanya abahagarariye amatsinda wo kuza ku kibaho gusobanura ibyo bagezeho.',
      'Akosora amakosa yagaragaye hamwe n\'abanyeshuri maze agafasha abanyeshuri kubumbira hamwe ubumenyi bw\'ingenzi.'
    ],
    devLearner: [
      'Bitegereza amashusho n\'imfashanyigisho bahawe, bakayaganiraho mu matsinda bahawe.',
      'Bafatanya gukora imyitozo n\'ibibazo byatanzwe, buri wese akagira uruhare mu gutanga igitekerezo.',
      'Bafasha bagenzi babo bafite intege nke cyangwa ibibazo byihariye mu matsinda yabo.',
      'Intumwa z\'amatsinda zigeza ku bandi ibyavuye mu buvumbuzi bwabo bakoresheje imvugo isobanutse.',
      'Bandika imyanzuro n\'ibisobanuro by\'ingenzi mu makaye yabo.'
    ],
    devCompetences: [
      'Gutekereza mu buryo bwimbitse: Gusesengura amakuru no gushaka umuti w\'ibibazo byatanzwe.',
      'Ubufatanye no gukorera hamwe: Guhuza imbaraga mu matsinda no kubahiriza uburenganzira bwa buri wese.',
      'Uburezi budaheza: Guha agaciro abanyeshuri bafite ibibazo byihariye mu mikorere y\'itsinda.'
    ],
    concTeacher: [
      'Aha abanyeshuri akanya ko kwisuzuma no kubaza ibibazo ku bidasobanutse.',
      'Atanga umukoro mugufi wo kwisuzuma mu minota mike (isuzumabumenyi ryo mu magambo cyangwa mu nyandiko).',
      'Atanga umukoro wo gukorera mu rugo uzashimangira ibyize uyu munsi.',
      'Ashimira abanyeshuri bitwaye neza kandi agasaba bose gukora isuku aho bakoreraga.'
    ],
    concLearner: [
      'Babaza ibibazo ku ngingo zitasobanutse neza cyangwa bagasobanura muri make icyo bungutse.',
      'Bakora isuzumabumenyi ryatanzwe ku giti cyabo berekana ko basobanukiwe.',
      'Bandika umukoro wo mu rugo mu makaye yabo bazirikana igihe cyo kuwugarurira.',
      'Bashyira ibikoresho byabo ku murongo bagategura iby\'isomo rikurikiyeho.'
    ],
    concCompetences: [
      'Kwisuzuma: Kumenya aho bageze mu kwiga no kugaragaza ibyo basobanukiwe n\'ibyo bakeneye kongeramo imbaraga.',
      'Guhanga udushya no kwiga ubuzima bwose: Gushyira mu bikorwa ibyo bize no kubihuza n\'imibereho ya buri munsi.'
    ],
    selfEvaluations: [
      'Intego y\'isomo yagezweho neza ku kigero cya 92%; abanyeshuri bagaragaje ubushake n\'umwete mu matsinda.',
      'Abanyeshuri basobanukiwe iby\'ingenzi; abana babiri bafite ingorane zo gusoma bahawe ubufasha bwihariye buzashimangirwa mu isomo ritaha.',
      'Isomo ryagenze neza cyane, ibikoresho byakoreshejwe byafashije abana gusobanukirwa bitagoranye.'
    ]
  },

  // Profile 2: Kwitegereza no gukora imyitozo ifatika (Observation, Manipulatives & Practical Work)
  {
    approachName: 'Kwitegereza no gukora imyitozo ifatika (Hands-on Concrete Activity)',
    introTeacher: [
      'Aha ikaze abanyeshuri mu ijwi riranguruye kandi risusurutse.',
      'Yerekana ibikoresho bifatika (realia) bijejewe n\'isomo rishya maze akabaza icyo babiziho.',
      'Afasha abanyeshuri guhuza ibyo basanzwe bazi n\'ibyo bagiye kwiga uyu munsi.',
      'Yandika umutwe w\'isomo ku kibaho mu buryo bugaragara neza.'
    ],
    introLearner: [
      'Bitaba umwarimu kandi bagategura ibikoresho byabo neza.',
      'Bitegereza ibikoresho n\'ibifashishwa umwarimu yeretse ishuri bakavuga amazina yabyo.',
      'Batanga ingero z\'aho bajya babibona mu miryango yabo no mu bidukikije.',
      'Bandika umutwe w\'isomo n\'amatariki mu makaye yabo.'
    ],
    introCompetences: [
      'Kwitegereza no gusesengura: Gukoresha ingingo z\'ubumenyi mu kwitegereza ibintu no kubisobanura.',
      'Itumanaho: Gusubiza mu magambo asobanutse neza no gukoresha amagambo akwiriye.'
    ],
    devTeacher: [
      'Yerekana urugero rufatika ku kibaho cyangwa imbere y\'ishuri akoresheje imfashanyigisho.',
      'Aha buri munyeshuri cyangwa buri matsinda ibikoresho byo gukoresha mu myitozo ifatika.',
      'Ayobora imyitozo yaba iyo ku kibaho cyangwa mu makaye, agenzura imikoreshereze y\'ibikoresho.',
      'Atanga ingero zinyuranye zifasha abanyeshuri kurushaho gusobanukirwa.',
      'Ashishikariza abanyeshuri kunganirana no gufashanya mu gihe hari uwagize ingorane.'
    ],
    devLearner: [
      'Bakurikirana urugero umwarimu agaragaje bitonze kandi bakabaza aho batumvise.',
      'Bafata ibikoresho bahawe bakabikoresha bakurikije amabwiriza yatanzwe.',
      'Bakora imyitozo ifatika mu makaye yabo cyangwa ku kibaho berekana intambwe ku yindi.',
      'Baganira na bagenzi babo ku bisubizo bagezeho no ku buryo babibonyemo.'
    ],
    devCompetences: [
      'Gukemura ibibazo: Gukoresha ubumenyi bufatika mu gukemura imyitozo n\'ibibazo byatanzwe.',
      'Ubufatanye: Gusangira ibikoresho no gufashanya mu ituze n\'ikinyabupfura.',
      'Gufata neza ibikoresho: Kubungabunga ibikoresho by\'ishuri no kubisukura nyuma yo kubikoresha.'
    ],
    concTeacher: [
      'Ayobora isubiramo rigufi ry\'ibyingenzi byizwe.',
      'Asaba abanyeshuri babiri cyangwa batatu gusobanura muri make icyo bize n\'akamaro kabyo.',
      'Atanga isuzuma rigufi ku myitozo yakozwe maze agakosora ku kibaho.',
      'Asiga umukoro wo gukora mu rugo ufasha mu gushimangira ubumenyi.'
    ],
    concLearner: [
      'Bavuga muri make amasomo bungutse bakoresheje amagambo yabo bwite.',
      'Bakosora amakosa bakoze mu makaye yabo bakurikije ibisobanuro byo ku kibaho.',
      'Bandika umukoro wo mu rugo neza mu makaye yabo.',
      'Bakusanya ibikoresho babibika neza mu bubiko bwabyo.'
    ],
    concCompetences: [
      'Kwisuzuma: Kumenya ibyo bakoze neza n\'aho bagomba gukosora.',
      'Umuco wo kwitangira umurimo: Gukora imirimo yose bahawe ku gihe no ku murongo.'
    ],
    selfEvaluations: [
      'Isomo ryagenze neza, abanyeshuri bose bagize uruhare mu myitozo ifatika kandi basohoje intego.',
      'Intego y\'isomo yagezweho ku kigero cya 88%; ibikoresho byakoreshejwe byongereye ubushake n\'umwete mu kwiga.',
      'Abanyeshuri bishimiye cyane gukoresha imfashanyigisho zifatika, ubumenyi bwarushijeho gucengera.'
    ]
  }
];

// Pre-loaded Rwandan REB Units for Kinyarwanda-taught subjects
export const KINYARWANDA_CURRICULUM_PRESETS: KinyarwandaCurriculumUnit[] = [
  // --- IKINYARWANDA PRIMARY (P1 - P6) ---
  {
    unitNumber: '1',
    unitTitle: 'UMURYANGO N\'INSHUTI',
    subject: 'Ikinyarwanda',
    classLevel: 'Primary 1 (P1)',
    keyCompetence: 'Gusoma no kwandika inyuguti, amagambo n\'interuro ngufi bivuga ku muryango no gukoresha imvugo ikwiye mu kubana n\'abandi.',
    sampleLessons: [
      'Kumenya no gusoma inyuguti z\'itangiriro: a, e, i, o, u',
      'Kwandika inyuguti nkuru n\'intoya z\'inyajwi',
      'Kuvuga abagize umuryango (Data, Mama, Musaza wanjye, Mushiki wanjye)',
      'Gusoma amagambo agizwe n\'inyajwi n\'indagi',
      'Kubaka interuro ngufi zivuga ku muryango'
    ],
    materials: 'Amakarita y\'inyuguti, amashusho y\'umuryango, ikibaho, amakaye n\'amakaramu',
    references: 'Integanyanyigisho y\'Ikinyarwanda ya REB, Igitabo cy\'umunyeshuri P1, Igitabo cy\'umwarimu'
  },
  {
    unitNumber: '2',
    unitTitle: 'ISUKU Y\'UMUBIRI N\'IY\'AHANTU DUTUYE',
    subject: 'Ikinyarwanda',
    classLevel: 'Primary 2 (P2)',
    keyCompetence: 'Gusoma no kwandika inyandiko zivuga ku isuku y\'umubiri n\'iy\'aho dutuye, no gukoresha imvugo iboneye mu guhanahana amakuru ku buzima.',
    sampleLessons: [
      'Gusoma umwandiko uvuga ku isuku y\'umubiri no gukaraba intoki',
      'Ibibazo byo kumva umwandiko ku isuku y\'amenyo n\'imyenda',
      'Kwandika amagambo n\'interuro bikoresha ibihekane: mb, nd, ng',
      'Gukoresha amagambo asobanura isuku y\'aho dutuye',
      'Isuzumabumenyi ku myandikire y\'amagambo n\'interuro'
    ],
    materials: 'Amashusho agaragaza gukaraba intoki n\'isuku, ikibaho, imfashanyigisho zanditseho ibihekane',
    references: 'Integanyanyigisho y\'Ikinyarwanda ya REB, Igitabo cy\'umunyeshuri P2, Igitabo cy\'umwarimu'
  },
  {
    unitNumber: '3',
    unitTitle: 'IBIDUKIKIJE N\'UBUHINZI',
    subject: 'Ikinyarwanda',
    classLevel: 'Primary 3 (P3)',
    keyCompetence: 'Gusoma neza umwandiko ku bidukikije, kwandika inkuru ngufi, no kugaragaza akamaro k\'ibihingwa n\'ibiti mu rurimi rusobanutse.',
    sampleLessons: [
      'Gusoma umwandiko ku gutera ibiti no kubungabunga ibidukikije',
      'Gusobanura amagambo mashya yo mu mwandiko',
      'Ikibonezamvugo: Inshinga n\'ibihe byayo (igihe cy\'ubu n\'icy\'ahashize)',
      'Kwandika inkuru ngufi ku mirimo yo guhinga no gusarura',
      'Ibisakuzo n\'imigani migufi yerekeye ibidukikije'
    ],
    materials: 'Ibihingwa nyabyo bito, amashusho y\'amashyamba, amakarita y\'inshinga, ikibaho',
    references: 'Integanyanyigisho y\'Ikinyarwanda ya REB, Igitabo cy\'umunyeshuri P3, Igitabo cy\'umwarimu'
  },
  {
    unitNumber: '4',
    unitTitle: 'UBUVANGANZO NYEMVUGO NYARWANDA',
    subject: 'Ikinyarwanda',
    classLevel: 'Primary 4 (P4)',
    keyCompetence: 'Gusesengura ibihangano by\'ubuvanganzo nyemvugo nyarwanda birimo imigani, ibisakuzo, imivugo n\'indirimbo gakondo no kugaragaza inyigisho zibirimo.',
    sampleLessons: [
      'Umusogongero ku buvanganzo nyemvugo n\'ubwoko bwabwo',
      'Imigani miremire: Gusoma no gusesengura umugani w\'inyamaswa',
      'Ibisakuzo: Kumenya amoko y\'ibisakuzo no kubisakuzanya mu matsinda',
      'Imivugo gakondo: Gusoma no kwiga imiterere y\'umuvugo',
      'Gusesengura inyigisho z\'umuco n\'ikinyabupfura ziri mu migani'
    ],
    materials: 'Ibitabo by\'imigani, ifishi y\'ibisakuzo, ikibaho, amajwi y\'indirimbo gakondo',
    references: 'Integanyanyigisho y\'Ikinyarwanda ya REB P4, Igitabo cy\'Umuco n\'Ubuvanganzo'
  },
  {
    unitNumber: '5',
    unitTitle: 'IKIBONEZAMVUGO N\'IMYANDIKIRE Y\'IKINYARWANDA',
    subject: 'Ikinyarwanda',
    classLevel: 'Primary 5 (P5)',
    keyCompetence: 'Gukoresha neza amategeko y\'ikibonezamvugo, kumenya intsinzi n\'ubwoko bw\'amagambo, no kwandika inyandiko zinoze zitagira amakosa y\'imyandikire.',
    sampleLessons: [
      'Ubwoko bw\'amazina n\'intego zayo (ingeli z\'amazina)',
      'Inshinga n\'insimburangingo zayo mu nteruro',
      'Amategeko y\'imyandikire yemewe: Gukurikiza ibimenyetso by\'ubutindiro',
      'Ibinyazina ngenera n\'ibinyazina ngenga',
      'Gukora imyitozo yo gukosora interuro zirimo amakosa'
    ],
    materials: 'Imbonerahamwe y\'ingeli z\'amazina, ifishi y\'imyitozo, ikibaho',
    references: 'Integanyanyigisho ya REB P5, Amabwiriza ya RALC ku myandikire y\'Ikinyarwanda'
  },
  {
    unitNumber: '6',
    unitTitle: 'INYANDIKO ZITANDUKANYE N\'UBUVUGO',
    subject: 'Ikinyarwanda',
    classLevel: 'Primary 6 (P6)',
    keyCompetence: 'Kwandika inyandiko zisobanutse zirimo ibaruwa, umwirondoro, raporo ngufi, no kugaragaza ubuhanga mu buvugo n\'itumanaho ryimbitse.',
    sampleLessons: [
      'Imiterere y\'ibaruwa isanzwe n\'ibaruwa y\'akazi',
      'Kwandika ibaruwa isaba uruhushya cyangwa isaba akazi',
      'Kwandika umwirondoro w\'umuntu (CV ngufi)',
      'Gusoma no gusesengura inyandiko mvugo y\'inama',
      'Guhanga umuvugo ku gukunda igihugu n\'ubumwe bw\'abanyarwanda'
    ],
    materials: 'Ingero z\'amabaruwa n\'inyandikomvugo, ifishi y\'umunyeshuri, ikibaho',
    references: 'Integanyanyigisho ya REB P6, Igitabo cy\'umunyeshuri P6'
  },

  // --- IMIBARE MU KINYARWANDA (P1 - P3) ---
  {
    unitNumber: '1',
    unitTitle: 'KUBARA NO GUKORESHA IMIBARE KUVA KURI 0 KUGEZA KU 100',
    subject: 'Imibare',
    classLevel: 'Primary 1 (P1)',
    keyCompetence: 'Kubara, gusoma, kwandika no kugereranya imibare y\'umwimerere kuva kuri 0 kugeza ku 100 no kuyikoresha mu buzima bwa buri munsi.',
    sampleLessons: [
      'Gusoma no kwandika imibare kuva kuri 0 kugeza ku 9',
      'Guhuza umubare n\'umubare w\'ibintu bifatika (uduti, amabuye, ibipfunyika)',
      'Kumenya umubare w\'icumi n\'uburyo bwo kubara ibinyacumi',
      'Kugereranya imibare hakoreshejwe ibimenyetso: >, <, =',
      'Kuteranya imibare ifite igiteranyo kitarenze 20'
    ],
    materials: 'Uduti two kubariraho, amabuye mato, ifishi y\'imibare, ikibaho',
    references: 'Integanyanyigisho y\'Imibare P1 mu Kinyarwanda ya REB, Igitabo cy\'umunyeshuri P1'
  },
  {
    unitNumber: '2',
    unitTitle: 'KUTERANYA NO GUKURAMO IMIBARE KUGEZA KU 1,000',
    subject: 'Imibare',
    classLevel: 'Primary 2 (P2)',
    keyCompetence: 'Gukora imibare yo kuteranya no gukuramo imibare y\'umwimerere itarenze 1,000, no gukemura ibibazo byo mu buzima busanzwe bikoresha kuteranya no gukuramo.',
    sampleLessons: [
      'Gusoma no kwandika imibare igera ku 1,000 mu mibare no mu magambo',
      'Kuteranya imibare idafite uruhinduko mu mbonerahamwe y\'agaciro k\'imbonerahamwe',
      'Kuteranya imibare ifite uruhinduko',
      'Gukuramo imibare idafite gutira',
      'Gukemura ibibazo bikorwa (word problems) bivuga ku kugura no kugurisha'
    ],
    materials: 'Imbonerahamwe y\'agaciro k\'imbonerahamwe (amasano, ibinyacumi, ibinyajana), amafaranga y\'amiganano, ikibaho',
    references: 'Integanyanyigisho y\'Imibare P2 ya REB mu Kinyarwanda'
  },
  {
    unitNumber: '3',
    unitTitle: 'GUKUBA NO KUGABANA IMIBARE KUGEZA KU 10,000',
    subject: 'Imibare',
    classLevel: 'Primary 3 (P3)',
    keyCompetence: 'Gukora imibare yo gukuba no kugabana ikoresha imbonerahamwe y\'ubukube, no gukemura ibibazo by\'ubumenyi ngiro bikoresha ubukube n\'igabana.',
    sampleLessons: [
      'Kumenya imbonerahamwe y\'ubukube kuva kuri 2 kugeza kuri 5',
      'Imbonerahamwe y\'ubukube kuva kuri 6 kugeza ku 9',
      'Gukuba umubare w\'ibice bibiri n\'umubare w\'igice kimwe',
      'Kugabana nta gisagitswe hagati y\'imibare y\'umwimerere',
      'Gukemura ibibazo bikorwa by\'ubucuruzi n\'igabana ry\'imbuto cyangwa ibikoresho'
    ],
    materials: 'Ifishi y\'imbonerahamwe y\'ubukube, utubuye two kugabana, ikibaho',
    references: 'Integanyanyigisho y\'Imibare P3 mu Kinyarwanda ya REB'
  },

  // --- IBYEREKEYE IBIDUKIKIJE / SET (P1 - P3) ---
  {
    unitNumber: '1',
    unitTitle: 'UMURYANGO N\'INSHINGANO ZAWO',
    subject: 'Ibyerekeye Ibidukikije',
    classLevel: 'Primary 1 (P1)',
    keyCompetence: 'Kumenya abagize umuryango, inshingano za buri wese, kubaha ababyeyi n\'abakuru, no kugaragaza imyitwarire myiza mu muryango.',
    sampleLessons: [
      'Kuvuga abagize umuryango n\'amasano bafitanye',
      'Inshingano z\'ababyeyi mu kurera no gutunga umuryango',
      'Inshingano z\'abana mu gufasha ababyeyi no gukora isuku',
      'Ikinyabupfura no kubaha abakuze mu muryango',
      'Gukumira amakimbirane no kubana mu mahoro mu muryango'
    ],
    materials: 'Amashusho y\'imiryango itandukanye, ifishi y\'ibikorwa, ikibaho',
    references: 'Integanyanyigisho y\'Ibyerekeye Ibidukikije P1 ya REB'
  },
  {
    unitNumber: '2',
    unitTitle: 'AMAZI, UMWUKA N\'ISUKU Y\'IBIDUKIKIJE',
    subject: 'Ibyerekeye Ibidukikije',
    classLevel: 'Primary 2 (P2)',
    keyCompetence: 'Kugaragaza inkomoko y\'amazi meza, akamaro kayo ku buzima, gukumira imyanda no kubungabunga umwuka duhumeka.',
    sampleLessons: [
      'Inkomoko z\'amazi (imvura, amasoko, imigezi, ibiyaga)',
      'Akamaro k\'amazi ku bantu, amatungo n\'ibihingwa',
      'Uburyo bwo gusukura amazi yo kunywa (guteka no kuyungurura)',
      'Gukumira indwara ziterwa n\'amazi mabi (inzoka, impiswi, kolera)',
      'Gufata neza ibikorwa remezo by\'amazi (amavomo, imiyoboro)'
    ],
    materials: 'Ikirahure cy\'amazi asukuye, akayunguruzo k\'amazi, amashusho y\'amavomo, ikibaho',
    references: 'Integanyanyigisho y\'Ibyerekeye Ibidukikije P2 ya REB'
  },
  {
    unitNumber: '3',
    unitTitle: 'IBIHINGWA N\'AMATUNGO BYO MU RWANDA',
    subject: 'Ibyerekeye Ibidukikije',
    classLevel: 'Primary 3 (P3)',
    keyCompetence: 'Gutandukanya amoko y\'ibihingwa n\'amatungo yororwa mu Rwanda, akamaro kayo mu bukungu n\'imirire, n\'uburyo bwo kubifata neza.',
    sampleLessons: [
      'Amoko y\'ibihingwa bihingwa mu Rwanda (ibiribwa n\'ibyoherezwa mu mahanga)',
      'Akamaro k\'ibihingwa mu mirire no mu buvuzi bwa gakondo',
      'Amatungo yororwa mu Rwanda (inka, ihene, intama, ingurube, inkoko)',
      'Ubworozi bwa kijyambere no gutanga umusaruro w\'amata n\'inyama',
      'Kurinda ibihingwa n\'amatungo ibyonnyi n\'indwara'
    ],
    materials: 'Ibihingwa bifatika, amashusho y\'amatungo, ikibaho, ifishi y\'ibibazo',
    references: 'Integanyanyigisho y\'Ibyerekeye Ibidukikije P3 ya REB'
  },

  // --- UBUGENI N'UMUCO (P1 - P3) ---
  {
    unitNumber: '1',
    unitTitle: 'GUSHUSHANYA N\'AMABARA GAKONDO',
    subject: 'Ubugeni n\'Umuco',
    classLevel: 'Primary 1 (P1)',
    keyCompetence: 'Gukoresha amabara atandukanye mu gushushanya ibintu byo mu bidukikije no gukora imitako yoroshye yakoreshejwe ibikoresho biboneka hafi.',
    sampleLessons: [
      'Kumenya amabara y\'ibanze (umutuku, umuhondo, ubururu)',
      'Gushushanya imiterere yoroshye (uruziga, mpandeshatu, urukiramende)',
      'Gusiga amabara ku bishushanyo by\'ibiti n\'inzu',
      'Gukora imitako ikoze mu mpapuro zaciwe cyangwa ibibabi',
      'Kumvikanisha ubutumwa binyuze mu gishushanyo'
    ],
    materials: 'Amakaramu y\'amabara, impapuro z\'umweru, ibibabi by\'ibiti, kole cyangwa amakara',
    references: 'Integanyanyigisho y\'Ubugeni n\'Umuco P1 ya REB'
  },
  {
    unitNumber: '2',
    unitTitle: 'INDIRIMBO, IMBYINO N\'IBIKORESHO GAKONDO',
    subject: 'Ubugeni n\'Umuco',
    classLevel: 'Primary 2 (P2)',
    keyCompetence: 'Kuririmba indirimbo z\'abana n\'iz\'umuco, kubyina imbyino nyarwanda hakoreshejwe amayugi n\'ingoma, no kubaha umurage gakondo.',
    sampleLessons: [
      'Kuririmba indirimbo z\'abana zo mu muco nyarwanda',
      'Kumenya ibikoresho bya muzika gakondo (ingoma, inanga, umwirongi, amayugi)',
      'Intambwe z\'ibanze zo kubyina ikinyarwanda (guhamiriza no gutega amaboko)',
      'Guhuza amagambo y\'indirimbo n\'injyana y\'ingoma',
      'Kugaragaza ibyishimo n\'ubumwe binyuze mu mbyino'
    ],
    materials: 'Ingoma ntoya, amayugi, ifishi y\'amagambo y\'indirimbo, amajwi afashwe',
    references: 'Integanyanyigisho y\'Ubugeni n\'Umuco P2 ya REB'
  }
];

/**
 * Generate fully differentiated Kinyarwanda lesson plan
 */
export function generateKinyarwandaLessonPlan(
  topicTitle: string,
  index: number,
  params: {
    unitNumber: string;
    unitTitle: string;
    classLevel: string;
    subject: string;
    duration?: string;
    classSize?: number;
    specialNeeds?: string;
  }
) {
  const profile = KINYARWANDA_PEDAGOGICAL_PROFILES[index % KINYARWANDA_PEDAGOGICAL_PROFILES.length];
  const bloomVerb = KINYARWANDA_BLOOM_VERBS.gushyira_mu_bikorwa[index % KINYARWANDA_BLOOM_VERBS.gushyira_mu_bikorwa.length];

  const durationStr = params.duration || 'Iminota 40';
  const cleanTopic = topicTitle || `Isomo ku ${params.unitTitle || 'mutwe w\'isomo'}`;

  const instructionalObjective = `Binyuze mu ${profile.approachName.toLowerCase()}, umunyeshuri azashobora ${bloomVerb} ku buryo buhamye no gusobanura ${cleanTopic} mu gihe cy\'${durationStr} nta kosa bakoze.`;

  const learningMaterials = `Ibitabo by\'abanyeshuri, ifishi y\'umwarimu, ikibaho n\'ingwa/ikaramu y\'ikibaho, amashusho n\'imfashanyigisho zifatika zifitanye isano na ${cleanTopic}.`;
  const references = `Integanyanyigisho ya REB CBC mu Kinyarwanda, Igitabo cy\'umunyeshuri cyo mu ${params.classLevel || 'cyiciro cya mbere'}, Igitabo cy\'umwarimu.`;

  const activitySummary = `Abanyeshuri baritegereza, bafatanye mu matsinda kuganira kuri ${cleanTopic}, bakore imyitozo ifatika kandi basoze bakora isuzumabumenyi rigufi.`;

  return {
    instructionalObjective,
    learningMaterials,
    references,
    activitySummary,
    steps: {
      introduction: {
        duration: 'Iminota 5',
        teacherActivities: profile.introTeacher,
        learnerActivities: profile.introLearner,
        competencesAndCrossCutting: profile.introCompetences
      },
      development: {
        duration: 'Iminota 25',
        teacherActivities: profile.devTeacher.map(t => t.replace('amashusho cyangwa imfashanyigisho', `imfashanyigisho n\'ingero zerekeye ${cleanTopic}`)),
        learnerActivities: profile.devLearner.map(l => l.replace('imyitozo n\'ibibazo', `imyitozo ishingiye kuri ${cleanTopic}`)),
        competencesAndCrossCutting: profile.devCompetences
      },
      conclusion: {
        duration: 'Iminota 10',
        teacherActivities: profile.concTeacher,
        learnerActivities: profile.concLearner,
        competencesAndCrossCutting: profile.concCompetences
      }
    },
    selfEvaluation: profile.selfEvaluations[index % profile.selfEvaluations.length]
  };
}
