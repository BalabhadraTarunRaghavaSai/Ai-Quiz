import {
  Quiz,
  QuizAttempt,
  SamplePdfDocument,
  UserSettings,
} from '../types/quiz';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  studentName: 'Maya Lin',
  academicFocus: 'Cellular Biology & Computer Science',
  defaultDifficulty: 'Intermediate',
  defaultQuestionCount: 5,
  timerEnabled: true,
  secondsPerQuestion: 45,
  instantFeedback: true,
  targetAccuracyPercentage: 85,
  weeklyQuizGoal: 5,
};

export const SAMPLE_PDF_DOCUMENTS: SamplePdfDocument[] = [
  {
    id: 'sample-pdf-bio',
    fileName: 'BIO204_Cellular_Respiration_Notes.pdf',
    subject: 'Molecular Biology',
    pageCount: 14,
    fileSizeLabel: '1.8 MB',
    suggestedDifficulty: 'Intermediate',
    summary:
      'Lecture notes covering Glycolysis regulation, Pyruvate oxidation, Citric Acid Cycle intermediates, and Chemiosmotic ATP synthesis across the inner mitochondrial membrane.',
    extractedText: `LECTURE 04: CELLULAR ENERGETICS, GLYCOLYSIS & OXIDATIVE PHOSPHORYLATION
1. Overview of Cellular Respiration:
   - C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ATP + Heat.
   - Three major stages: (1) Glycolysis in the cytosol, (2) Pyruvate oxidation & Citric Acid Cycle (Krebs cycle) in the mitochondrial matrix, (3) Oxidative phosphorylation (Electron Transport Chain + Chemiosmosis) across the inner mitochondrial membrane (cristae).
2. Glycolysis Regulation & Energy Payoff:
   - Energy investment phase uses 2 ATP (Hexokinase and Phosphofructokinase-1).
   - Phosphofructokinase-1 (PFK-1) is the primary allosteric pacemaker enzyme: inhibited by high ATP and citrate; activated by AMP and fructose-2,6-bisphosphate.
   - Net yield per glucose: 2 ATP (via substrate-level phosphorylation), 2 NADH, and 2 Pyruvate (3-carbon molecules).
3. Pyruvate Dehydrogenase Complex (PDC) & Citric Acid Cycle:
   - Pyruvate enters mitochondrion via MPC transporter; PDC converts pyruvate -> Acetyl-CoA + CO2 + NADH.
   - Acetyl-CoA (2C) condenses with Oxaloacetate (4C) via Citrate Synthase to form Citrate (6C).
   - Per turn of the cycle: 3 NADH, 1 FADH2, 1 GTP (or ATP), and 2 CO2 released. Two turns occur per glucose molecule.
4. Electron Transport Chain & Proton-Motive Force:
   - NADH donates electrons to Complex I (NADH dehydrogenase); FADH2 donates electrons to Complex II (Succinate dehydrogenase, which does NOT pump protons).
   - Ubiquinone (Coenzyme Q) shuttles electrons to Complex III; Cytochrome c shuttles electrons to Complex IV (Cytochrome c oxidase), where O2 is the terminal electron acceptor forming H2O.
   - ATP Synthase (F0F1 complex) utilizes the electrochemical H+ gradient across the inner mitochondrial membrane to phosphorylate ADP into ATP.
   - Uncouplers (such as 2,4-DNP or thermogenin/UCP1 in brown adipose tissue) make the inner membrane permeable to H+, dissipating the proton gradient as heat without ATP synthesis while increasing oxygen consumption.`,
  },
  {
    id: 'sample-pdf-cs',
    fileName: 'CS310_Virtual_Memory_Paging_Architecture.pdf',
    subject: 'Computer Science',
    pageCount: 19,
    fileSizeLabel: '2.4 MB',
    suggestedDifficulty: 'Advanced',
    summary:
      'Operating systems notes on virtual address translation, multi-level page tables, Translation Lookaside Buffers (TLB), effective access time (EAT), and page replacement algorithms (LRU, Clock, Belady anomaly).',
    extractedText: `CS 310 OPERATING SYSTEMS — VIRTUAL MEMORY & PAGING ARCHITECTURE
1. Address Translation & Page Tables:
   - Virtual address is split into Virtual Page Number (VPN) and Page Offset. Offset bits = log2(Page Size). For a 4 KB (2^12 bytes) page, the lower 12 bits are the offset.
   - Page Table Entry (PTE) stores the Physical Frame Number (PFN), Valid bit, Dirty bit, Reference/Accessed bit, and Protection bits (R/W/X).
2. Multi-Level Page Tables:
   - Single-level page tables for 64-bit or 32-bit address spaces consume excessive contiguous physical memory.
   - Hierarchical paging (e.g., 2-level or 4-level x86-64 page tables) only allocates inner page table pages for sparse virtual memory regions actually in use.
3. Translation Lookaside Buffer (TLB):
   - Hardware associative cache storing recent VPN -> PFN translations.
   - Effective Access Time (EAT) = TLB_Lookup + (Hit_Ratio * Memory_Access) + (Miss_Ratio *Page_Walk_Time).
   - Context switches flush non-global TLB entries unless hardware Address Space Identifiers (ASIDs / PCIDs) tag entries per process.
4. Page Fault Handling & Replacement Policies:
   - Optimal (MIN/OPT): Replaces the page that will not be used for the longest period in the future; provably optimal benchmark but unimplementable online.
   - FIFO (First-In, First-Out): Suffers from Belady's Anomaly (adding more physical frames can increase page faults).
   - LRU (Least Recently Used): Stack algorithm free from Belady's Anomaly; approximated in hardware using the Clock (Second-Chance) algorithm scanning the Reference bit.
   - Thrashing occurs when the sum of working sets of active processes exceeds total physical frames, causing continuous paging I/O and collapsing CPU utilization.`,
  },
  {
    id: 'sample-pdf-econ',
    fileName: 'ECON202_Monetary_Policy_ISLM_Framework.pdf',
    subject: 'Macroeconomics',
    pageCount: 11,
    fileSizeLabel: '1.3 MB',
    suggestedDifficulty: 'Intermediate',
    summary:
      'Macroeconomic equilibrium analysis covering Central Bank open market operations, the Taylor Rule, IS-LM interest rate transmission, and liquidity traps.',
    extractedText: `ECON 202 — MONETARY TRANSMISSION, CENTRAL BANKING & IS-LM ANALYSIS
1. Tools of Monetary Policy:
   - Open Market Operations (OMOs): Central bank purchases of Treasury securities inject reserves into the banking system, lowering the overnight interbank rate (Federal Funds Rate).
   - Interest on Reserve Balances (IORB) sets a floor beneath short-term money market rates in an ample-reserves regime.
2. The IS-LM Equilibrium:
   - IS Curve (Investment-Saving): Goods market equilibrium (Y = C(Y-T) + I(r) + G). Downward sloping because higher real interest rates (r) reduce planned investment (I), lowering output (Y).
   - LM Curve (Liquidity Preference-Money Supply): Money market equilibrium (M/P = L(r, Y)). Upward sloping because higher income (Y) increases transaction demand for money, requiring a higher interest rate (r) to equilibrate fixed real money supply.
3. Fiscal vs. Monetary Multipliers & Crowding Out:
   - Expansionary fiscal policy (increase in G or cut in T) shifts IS right, raising both Y and r. Higher r partially crowds out private investment unless accommodated by central bank monetary expansion.
   - Liquidity Trap (Zero Lower Bound): When nominal interest rates approach zero, money demand becomes horizontal; open market operations become ineffective at lowering short-term rates further, making fiscal stimulus highly potent with minimal crowding out.
4. The Taylor Rule:
   - Target nominal rate i = r* + pi + 0.5*(pi - pi*) + 0.5*(y - y*).
   - The Taylor Principle requires the nominal interest rate to rise by more than one-for-one with inflation (coefficient on inflation > 1) so that the real interest rate increases to stabilize inflation.`,
  },
];

export const SEED_QUIZZES: Quiz[] = [
  {
    id: 'quiz-bio-respiration',
    title: 'Cellular Energetics & Oxidative Phosphorylation',
    subject: 'Molecular Biology',
    difficulty: 'Intermediate',
    sourceType: 'pdf',
    sourceName: 'BIO204_Cellular_Respiration_Notes.pdf',
    extractedTopics: [
      'Glycolysis Regulation',
      'Citric Acid Cycle',
      'Electron Transport Chain',
      'Chemiosmosis & Uncouplers',
    ],
    createdAt: '2026-10-24T09:30:00.000Z',
    estimatedMinutes: 6,
    questions: [
      {
        id: 'bio-q1',
        question:
          'Which enzyme serves as the primary allosteric pacemaker of glycolysis, and which molecule acts as its potent allosteric activator?',
        options: [
          'Hexokinase; activated by high citrate concentrations',
          'Phosphofructokinase-1 (PFK-1); activated by AMP and fructose-2,6-bisphosphate',
          'Pyruvate kinase; activated by high cytosolic ATP',
          'Citrate synthase; activated by NADH accumulation',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Phosphofructokinase-1 (PFK-1) catalyzes the committed step of glycolysis. When cellular energy charge is low, rising AMP and fructose-2,6-bisphosphate allosterically activate PFK-1 to accelerate glycolytic flux.',
        subtopic: 'Glycolysis Regulation',
        cognitiveLevel: 'Recall',
      },
      {
        id: 'bio-q2',
        question:
          'Why does oxidation of FADH2 yield fewer ATP molecules than oxidation of mitochondrial NADH during oxidative phosphorylation?',
        options: [
          'FADH2 is oxidized in the cytosol rather than the mitochondrial matrix',
          'FADH2 donates electrons to Complex II, bypassing proton pumping at Complex I',
          'FADH2 inhibits Cytochrome c oxidase (Complex IV) partially',
          'FADH2 carries only a single electron whereas NADH carries four electrons',
        ],
        correctAnswerIndex: 1,
        explanation:
          'FADH2 transfers electrons directly to Complex II (succinate dehydrogenase), which does not pump protons across the inner mitochondrial membrane. By bypassing Complex I, fewer H+ ions are translocated per electron pair.',
        subtopic: 'Electron Transport Chain',
        cognitiveLevel: 'Analysis',
      },
      {
        id: 'bio-q3',
        question:
          'If a protonophore uncoupler such as 2,4-DNP is added to actively respiring mitochondria, what is the immediate physiological consequence?',
        options: [
          'Both oxygen consumption and ATP synthesis halt immediately',
          'ATP synthesis increases rapidly while oxygen consumption drops to zero',
          'The proton gradient dissipates as heat, ATP synthesis drops, and oxygen consumption increases',
          'NADH cannot be oxidized by Complex I because the matrix becomes strongly acidic',
        ],
        correctAnswerIndex: 2,
        explanation:
          'Uncouplers permeabilize the inner mitochondrial membrane to protons, collapsing the proton-motive force without passing through ATP synthase. Without back-pressure from the proton gradient, electron transport and O2 consumption accelerate while energy is released as heat.',
        subtopic: 'Chemiosmosis & Uncouplers',
        cognitiveLevel: 'Application',
      },
      {
        id: 'bio-q4',
        question:
          'How many molecules of NADH, FADH2, and GTP (or ATP) are produced directly inside the citric acid cycle per single molecule of glucose (two pyruvate molecules)?',
        options: [
          '3 NADH, 1 FADH2, and 1 GTP',
          '6 NADH, 2 FADH2, and 2 GTP',
          '8 NADH, 4 FADH2, and 4 GTP',
          '2 NADH, 2 FADH2, and 2 GTP',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Each turn of the citric acid cycle generates 3 NADH, 1 FADH2, and 1 GTP. Because one glucose molecule yields two Acetyl-CoA molecules, two turns occur, producing 6 NADH, 2 FADH2, and 2 GTP.',
        subtopic: 'Citric Acid Cycle',
        cognitiveLevel: 'Application',
      },
      {
        id: 'bio-q5',
        question:
          'Which component of the mitochondrial electron transport chain directly transfers electrons to molecular oxygen (O2) to form water?',
        options: [
          'Complex I (NADH dehydrogenase)',
          'Ubiquinone (Coenzyme Q)',
          'Complex III (Cytochrome bc1 complex)',
          'Complex IV (Cytochrome c oxidase)',
        ],
        correctAnswerIndex: 3,
        explanation:
          'Complex IV (Cytochrome c oxidase) accepts electrons from mobile Cytochrome c and reduces terminal electron acceptor O2 into H2O while pumping protons into the intermembrane space.',
        subtopic: 'Electron Transport Chain',
        cognitiveLevel: 'Recall',
      },
    ],
  },
  {
    id: 'quiz-cs-virtual-memory',
    title: 'Virtual Memory, TLB & Page Replacement Architecture',
    subject: 'Computer Science',
    difficulty: 'Advanced',
    sourceType: 'pdf',
    sourceName: 'CS310_Virtual_Memory_Paging_Architecture.pdf',
    extractedTopics: [
      'Address Translation',
      'TLB & Effective Access Time',
      'Page Replacement Algorithms',
      'Hierarchical Page Tables',
    ],
    createdAt: '2026-10-25T16:15:00.000Z',
    estimatedMinutes: 7,
    questions: [
      {
        id: 'cs-q1',
        question:
          'In a system with 32-bit virtual addresses and a 4 KB (4096-byte) page size, how many bits are used for the Page Offset and how many bits remain for the Virtual Page Number (VPN)?',
        options: [
          '10 bits for offset; 22 bits for VPN',
          '12 bits for offset; 20 bits for VPN',
          '14 bits for offset; 18 bits for VPN',
          '16 bits for offset; 16 bits for VPN',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Since 4 KB = 2^12 bytes, addressing each byte within a page requires 12 offset bits. The remaining 32 - 12 = 20 upper bits identify the Virtual Page Number (VPN).',
        subtopic: 'Address Translation',
        cognitiveLevel: 'Application',
      },
      {
        id: 'cs-q2',
        question:
          'Why do modern 64-bit operating systems use multi-level (hierarchical) page tables rather than a single flat page table?',
        options: [
          'Multi-level page tables eliminate the need for a hardware TLB',
          'Single-level page tables cannot store Read/Write/Execute protection bits',
          'Hierarchical tables avoid allocating contiguous memory for unused regions of sparse virtual address spaces',
          'Multi-level tables reduce TLB miss latency to zero memory accesses',
        ],
        correctAnswerIndex: 2,
        explanation:
          'A flat page table for a 48-bit or 64-bit address space would require gigabytes or terabytes of contiguous physical memory per process. Multi-level trees leave large unallocated holes unmapped, allocating leaf tables only for active memory segments.',
        subtopic: 'Hierarchical Page Tables',
        cognitiveLevel: 'Analysis',
      },
      {
        id: 'cs-q3',
        question:
          'Which page replacement policy is susceptible to Belady’s Anomaly, where increasing the number of physical frames can paradoxically increase the page fault rate?',
        options: [
          'Least Recently Used (LRU)',
          'Optimal (MIN / Belady’s Optimal)',
          'First-In, First-Out (FIFO)',
          'Least Frequently Used with stack property',
        ],
        correctAnswerIndex: 2,
        explanation:
          'FIFO does not satisfy the stack inclusion property (the set of pages in k frames is not guaranteed to be a subset of pages in k+1 frames), so certain reference strings experience more page faults when given more frames.',
        subtopic: 'Page Replacement Algorithms',
        cognitiveLevel: 'Recall',
      },
      {
        id: 'cs-q4',
        question:
          'What hardware mechanism allows an operating system to avoid flushing the entire Translation Lookaside Buffer (TLB) upon every process context switch?',
        options: [
          'Enabling write-through caching on L1 data caches',
          'Tagging TLB entries with Address Space Identifiers (ASIDs / PCIDs)',
          'Doubling the virtual page offset width',
          'Setting the Dirty bit on all kernel page table entries',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Address Space Identifiers (ASIDs) or Process Context Identifiers (PCIDs) attach a process tag to each TLB entry so translations from multiple processes can safely coexist in the TLB without cross-process aliasing.',
        subtopic: 'TLB & Effective Access Time',
        cognitiveLevel: 'Recall',
      },
      {
        id: 'cs-q5',
        question:
          'Suppose a system has a 98% TLB hit ratio, a single memory access takes 100 ns, and a TLB miss requires a 4-level page table walk (400 ns) followed by the data access (100 ns). Assuming negligible TLB lookup overhead, what is the Effective Access Time (EAT)?',
        options: ['102 ns', '108 ns', '140 ns', '200 ns'],
        correctAnswerIndex: 1,
        explanation:
          'On a TLB hit (98% of the time), access takes 100 ns. On a TLB miss (2% of the time), access takes 400 ns (page walk) + 100 ns (memory fetch) = 500 ns. EAT = 0.98 * 100 + 0.02 * 500 = 98 + 10 = 108 ns.',
        subtopic: 'TLB & Effective Access Time',
        cognitiveLevel: 'Application',
      },
    ],
  },
  {
    id: 'quiz-econ-islm',
    title: 'Monetary Transmission & IS-LM Equilibrium Dynamics',
    subject: 'Macroeconomics',
    difficulty: 'Intermediate',
    sourceType: 'topic',
    sourceName: 'Topic: Central Banking, Taylor Rule & IS-LM Crowding Out',
    extractedTopics: [
      'IS-LM Equilibrium',
      'Monetary Policy Transmission',
      'Liquidity Trap',
      'Taylor Rule',
    ],
    createdAt: '2026-10-26T13:20:00.000Z',
    estimatedMinutes: 5,
    questions: [
      {
        id: 'econ-q1',
        question:
          'According to the Taylor Principle, how must a central bank adjust the nominal policy interest rate in response to a 1 percentage point increase in inflation above target?',
        options: [
          'Keep the nominal interest rate constant so real rates fall by 1%',
          'Raise the nominal interest rate by more than 1 percentage point so the real interest rate rises',
          'Lower the nominal interest rate by 0.5 percentage points to stimulate supply',
          'Increase reserve requirements while holding the nominal policy rate at zero',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Because the real interest rate r = i - pi, raising the nominal rate i by more than the increase in inflation pi is required to increase the real borrowing cost and cool aggregate demand.',
        subtopic: 'Taylor Rule',
        cognitiveLevel: 'Application',
      },
      {
        id: 'econ-q2',
        question:
          'In the standard IS-LM model outside of a liquidity trap, what happens when the government increases deficit-financed spending (G) while the central bank holds the money supply fixed?',
        options: [
          'The IS curve shifts left, lowering both output and interest rates',
          'The LM curve shifts right, eliminating all private investment crowding out',
          'The IS curve shifts right, raising output and the interest rate, which partially crowds out private investment',
          'Output remains completely unchanged because velocity is constant',
        ],
        correctAnswerIndex: 2,
        explanation:
          'Higher government spending shifts the IS curve rightward. Higher income increases money demand, driving up the equilibrium interest rate along the upward-sloping LM curve and partially crowding out interest-sensitive investment.',
        subtopic: 'IS-LM Equilibrium',
        cognitiveLevel: 'Analysis',
      },
      {
        id: 'econ-q3',
        question:
          'Why is fiscal expansion particularly effective at raising output when the economy is in a liquidity trap at the zero lower bound?',
        options: [
          'Because the LM curve is nearly horizontal, so rightward shifts of the IS curve do not raise interest rates or crowd out investment',
          'Because private savings automatically drop to zero at the zero lower bound',
          'Because taxes have a multiplier larger than 10 when nominal rates are zero',
          'Because open market sales amplify the fiscal stimulus',
        ],
        correctAnswerIndex: 0,
        explanation:
          'In a liquidity trap, money and short-term bonds are near-perfect substitutes, making the LM curve flat. A rightward shift of the IS curve expands output without pushing up real interest rates.',
        subtopic: 'Liquidity Trap',
        cognitiveLevel: 'Analysis',
      },
      {
        id: 'econ-q4',
        question:
          'When the Federal Reserve conducts an open market purchase of Treasury securities from commercial banks, what is the immediate effect on bank reserves and the federal funds rate?',
        options: [
          'Bank reserves decrease and the federal funds rate rises',
          'Bank reserves increase and downward pressure is placed on the federal funds rate',
          'Bank reserves remain unchanged while fiscal deficits shrink',
          'The IS curve shifts leftward immediately',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Crediting commercial bank reserve accounts in exchange for Treasury securities expands the supply of reserves in the interbank market, lowering the overnight federal funds rate.',
        subtopic: 'Monetary Policy Transmission',
        cognitiveLevel: 'Recall',
      },
    ],
  },
];

export const SEED_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'seed-att-1',
    quizId: 'quiz-bio-respiration',
    quizTitle: 'Foundations of Cellular Metabolism',
    subject: 'Molecular Biology',
    difficulty: 'Beginner',
    sourceType: 'pdf',
    scorePercentage: 64,
    correctCount: 7,
    totalQuestions: 11,
    durationSeconds: 310,
    completedAt: '2026-10-08T15:20:00.000Z',
    responses: [],
    subtopicScores: {
      'Glycolysis Regulation': { correct: 2, total: 4 },
      'Citric Acid Cycle': { correct: 3, total: 4 },
      'Chemiosmosis & Uncouplers': { correct: 2, total: 3 },
    },
  },
  {
    id: 'seed-att-2',
    quizId: 'quiz-econ-islm',
    quizTitle: 'Aggregate Demand & Money Markets',
    subject: 'Macroeconomics',
    difficulty: 'Intermediate',
    sourceType: 'topic',
    scorePercentage: 70,
    correctCount: 7,
    totalQuestions: 10,
    durationSeconds: 280,
    completedAt: '2026-10-12T18:10:00.000Z',
    responses: [],
    subtopicScores: {
      'IS-LM Equilibrium': { correct: 3, total: 5 },
      'Monetary Policy Transmission': { correct: 4, total: 5 },
    },
  },
  {
    id: 'seed-att-3',
    quizId: 'quiz-cs-virtual-memory',
    quizTitle: 'Process Scheduling & Memory Paging',
    subject: 'Computer Science',
    difficulty: 'Intermediate',
    sourceType: 'pdf',
    scorePercentage: 75,
    correctCount: 6,
    totalQuestions: 8,
    durationSeconds: 265,
    completedAt: '2026-10-16T11:45:00.000Z',
    responses: [],
    subtopicScores: {
      'Address Translation': { correct: 3, total: 4 },
      'Page Replacement Algorithms': { correct: 3, total: 4 },
    },
  },
  {
    id: 'seed-att-4',
    quizId: 'quiz-bio-respiration',
    quizTitle: 'Cellular Energetics & Oxidative Phosphorylation',
    subject: 'Molecular Biology',
    difficulty: 'Intermediate',
    sourceType: 'pdf',
    scorePercentage: 80,
    correctCount: 4,
    totalQuestions: 5,
    durationSeconds: 195,
    completedAt: '2026-10-20T14:30:00.000Z',
    responses: [
      {
        questionId: 'bio-q1',
        selectedOptionIndex: 1,
        isCorrect: true,
        timeSpentSeconds: 38,
      },
      {
        questionId: 'bio-q2',
        selectedOptionIndex: 1,
        isCorrect: true,
        timeSpentSeconds: 42,
      },
      {
        questionId: 'bio-q3',
        selectedOptionIndex: 0,
        isCorrect: false,
        timeSpentSeconds: 45,
      },
      {
        questionId: 'bio-q4',
        selectedOptionIndex: 1,
        isCorrect: true,
        timeSpentSeconds: 36,
      },
      {
        questionId: 'bio-q5',
        selectedOptionIndex: 3,
        isCorrect: true,
        timeSpentSeconds: 34,
      },
    ],
    subtopicScores: {
      'Glycolysis Regulation': { correct: 1, total: 1 },
      'Electron Transport Chain': { correct: 2, total: 2 },
      'Chemiosmosis & Uncouplers': { correct: 0, total: 1 },
      'Citric Acid Cycle': { correct: 1, total: 1 },
    },
  },
  {
    id: 'seed-att-5',
    quizId: 'quiz-econ-islm',
    quizTitle: 'Monetary Transmission & IS-LM Equilibrium Dynamics',
    subject: 'Macroeconomics',
    difficulty: 'Intermediate',
    sourceType: 'topic',
    scorePercentage: 88,
    correctCount: 7,
    totalQuestions: 8,
    durationSeconds: 240,
    completedAt: '2026-10-23T19:00:00.000Z',
    responses: [],
    subtopicScores: {
      'Taylor Rule': { correct: 2, total: 2 },
      'IS-LM Equilibrium': { correct: 2, total: 2 },
      'Liquidity Trap': { correct: 1, total: 2 },
      'Monetary Policy Transmission': { correct: 2, total: 2 },
    },
  },
  {
    id: 'seed-att-6',
    quizId: 'quiz-cs-virtual-memory',
    quizTitle: 'Virtual Memory, TLB & Page Replacement Architecture',
    subject: 'Computer Science',
    difficulty: 'Advanced',
    sourceType: 'pdf',
    scorePercentage: 92,
    correctCount: 11,
    totalQuestions: 12,
    durationSeconds: 340,
    completedAt: '2026-10-27T16:40:00.000Z',
    responses: [],
    subtopicScores: {
      'Address Translation': { correct: 3, total: 3 },
      'Hierarchical Page Tables': { correct: 3, total: 3 },
      'Page Replacement Algorithms': { correct: 2, total: 3 },
      'TLB & Effective Access Time': { correct: 3, total: 3 },
    },
  },
];
